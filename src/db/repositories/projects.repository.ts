import { and, count, desc, eq, sql } from 'drizzle-orm';
import { projects } from '../schema';
import type { DbClient } from '../client';

export function createProjectsRepository(db: DbClient) {
  return {
    async listAll(limit = 200) {
      return db.select().from(projects).orderBy(desc(projects.updatedAt)).limit(limit);
    },
    async listPublished(limit = 20) {
      return db
        .select()
        .from(projects)
        .where(eq(projects.status, 'published'))
        .orderBy(desc(projects.publishedAt), desc(projects.updatedAt))
        .limit(limit);
    },
    async listPublishedPage(page = 1, pageSize = 10) {
      const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
      const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 10;
      const offset = (safePage - 1) * safePageSize;

      return db
        .select()
        .from(projects)
        .where(eq(projects.status, 'published'))
        .orderBy(desc(projects.publishedAt), desc(projects.updatedAt))
        .limit(safePageSize)
        .offset(offset);
    },
    async countPublished() {
      const rows = await db
        .select({ total: count() })
        .from(projects)
        .where(eq(projects.status, 'published'));
      return Number(rows[0]?.total ?? 0);
    },
    async listLatestPublished(limit = 5) {
      return db
        .select()
        .from(projects)
        .where(eq(projects.status, 'published'))
        .orderBy(desc(projects.publishedAt), desc(projects.updatedAt))
        .limit(limit);
    },
    async getById(id: number) {
      const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      return rows[0] ?? null;
    },
    async getBySlug(slug: string) {
      const rows = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
      return rows[0] ?? null;
    },
    async incrementViewsBySlug(slug: string) {
      const normalized = slug.trim();
      if (!normalized) {
        return 0;
      }

      await db
        .update(projects)
        .set({
          views: sql`${projects.views} + 1`,
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(projects.slug, normalized));

      const rows = await db
        .select({ views: projects.views })
        .from(projects)
        .where(eq(projects.slug, normalized))
        .limit(1);

      return Number(rows[0]?.views ?? 0);
    },
    async getPublishedBySlug(slug: string) {
      const rows = await db
        .select()
        .from(projects)
        .where(and(eq(projects.slug, slug), eq(projects.status, 'published')))
        .limit(1);
      return rows[0] ?? null;
    },
    async create(input: typeof projects.$inferInsert) {
      return db.insert(projects).values(input);
    },
    async update(id: number, patch: Partial<typeof projects.$inferInsert>) {
      return db
        .update(projects)
        .set({
          ...patch,
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(and(eq(projects.id, id)));
    },
    async remove(id: number) {
      return db.delete(projects).where(eq(projects.id, id));
    }
  };
}
