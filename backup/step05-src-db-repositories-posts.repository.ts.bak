import { and, desc, eq } from 'drizzle-orm';
import { posts } from '../schema';
import type { DbClient } from '../client';

export function createPostsRepository(db: DbClient) {
  return {
    async listPublished(limit = 20) {
      return db
        .select()
        .from(posts)
        .where(eq(posts.status, 'published'))
        .orderBy(desc(posts.publishedAt))
        .limit(limit);
    },
    async getBySlug(slug: string) {
      const rows = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
      return rows[0] ?? null;
    },
    async create(input: typeof posts.$inferInsert) {
      return db.insert(posts).values(input);
    },
    async update(id: number, patch: Partial<typeof posts.$inferInsert>) {
      return db.update(posts).set(patch).where(and(eq(posts.id, id)));
    }
  };
}
