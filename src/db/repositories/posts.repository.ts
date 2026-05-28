import { and, count, desc, eq, or, sql } from 'drizzle-orm';
import { posts } from '../schema';
import type { DbClient } from '../client';

function parseTags(value: string | null) {
  if (!value) {
    return [] as string[];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function serializeTags(tags: string[] | null | undefined) {
  if (!tags || tags.length === 0) {
    return null;
  }
  return tags.join(',');
}

function mapPost(row: typeof posts.$inferSelect) {
  return {
    ...row,
    tags: parseTags(row.tags)
  };
}

function tagCondition(tag: string) {
  const normalized = tag.trim();
  const withPrefix = `${normalized},%`;
  const withSuffix = `%,${normalized}`;
  const withMiddle = `%,${normalized},%`;

  return or(
    eq(posts.tags, normalized),
    sql`${posts.tags} LIKE ${withPrefix}`,
    sql`${posts.tags} LIKE ${withSuffix}`,
    sql`${posts.tags} LIKE ${withMiddle}`
  );
}

export function createPostsRepository(db: DbClient) {
  return {
    async listAll(limit = 200) {
      const rows = await db.select().from(posts).orderBy(desc(posts.updatedAt)).limit(limit);
      return rows.map(mapPost);
    },
    async listLatestPublished(limit = 5) {
      const rows = await db
        .select()
        .from(posts)
        .where(eq(posts.status, 'published'))
        .orderBy(desc(posts.pinned), desc(posts.publishedAt), desc(posts.updatedAt))
        .limit(limit);
      return rows.map(mapPost);
    },
    async listPublished(limit = 20) {
      const rows = await db
        .select()
        .from(posts)
        .where(eq(posts.status, 'published'))
        .orderBy(desc(posts.pinned), desc(posts.publishedAt))
        .limit(limit);
      return rows.map(mapPost);
    },
    async listPublishedPage(page = 1, pageSize = 10) {
      const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
      const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 10;
      const offset = (safePage - 1) * safePageSize;

      const rows = await db
        .select()
        .from(posts)
        .where(eq(posts.status, 'published'))
        .orderBy(desc(posts.pinned), desc(posts.publishedAt), desc(posts.updatedAt))
        .limit(safePageSize)
        .offset(offset);
      return rows.map(mapPost);
    },
    async countPublished() {
      const rows = await db
        .select({ total: count() })
        .from(posts)
        .where(eq(posts.status, 'published'));
      return Number(rows[0]?.total ?? 0);
    },
    async listPublishedByTag(tag: string, page = 1, pageSize = 10) {
      const normalized = tag.trim();
      if (!normalized) {
        return [] as Array<ReturnType<typeof mapPost>>;
      }

      const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
      const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 10;
      const offset = (safePage - 1) * safePageSize;

      const rows = await db
        .select()
        .from(posts)
        .where(and(eq(posts.status, 'published'), tagCondition(normalized)))
        .orderBy(desc(posts.pinned), desc(posts.publishedAt), desc(posts.updatedAt))
        .limit(safePageSize)
        .offset(offset);

      return rows.map(mapPost);
    },
    async countPublishedByTag(tag: string) {
      const normalized = tag.trim();
      if (!normalized) {
        return 0;
      }

      const rows = await db
        .select({ total: count() })
        .from(posts)
        .where(and(eq(posts.status, 'published'), tagCondition(normalized)));
      return Number(rows[0]?.total ?? 0);
    },
    async getById(id: number) {
      const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
      return rows[0] ? mapPost(rows[0]) : null;
    },
    async getBySlug(slug: string) {
      const rows = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
      return rows[0] ? mapPost(rows[0]) : null;
    },
    async getPublishedBySlug(slug: string) {
      const rows = await db
        .select()
        .from(posts)
        .where(and(eq(posts.slug, slug), eq(posts.status, 'published')))
        .limit(1);
      return rows[0] ? mapPost(rows[0]) : null;
    },
    async incrementViewsBySlug(slug: string) {
      const normalized = slug.trim();
      if (!normalized) {
        return 0;
      }

      await db
        .update(posts)
        .set({
          views: sql`${posts.views} + 1`,
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(posts.slug, normalized));

      const rows = await db
        .select({ views: posts.views })
        .from(posts)
        .where(eq(posts.slug, normalized))
        .limit(1);

      return Number(rows[0]?.views ?? 0);
    },
    async create(input: typeof posts.$inferInsert & { tags?: string[] | null }) {
      const { tags, ...rest } = input;
      return db.insert(posts).values({
        ...rest,
        tags: serializeTags(tags ?? null)
      });
    },
    async update(id: number, patch: Partial<typeof posts.$inferInsert & { tags?: string[] | null }>) {
      const { tags, ...rest } = patch;
      return db
        .update(posts)
        .set({
          ...rest,
          ...(tags !== undefined ? { tags: serializeTags(tags ?? null) } : {}),
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(and(eq(posts.id, id)));
    },
    async remove(id: number) {
      return db.delete(posts).where(eq(posts.id, id));
    }
  };
}
