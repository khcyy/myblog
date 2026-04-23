import { and, desc, eq } from 'drizzle-orm';
import { projects } from '../schema';
import type { DbClient } from '../client';

export function createProjectsRepository(db: DbClient) {
  return {
    async listPublished(limit = 20) {
      return db
        .select()
        .from(projects)
        .where(eq(projects.status, 'published'))
        .orderBy(desc(projects.publishedAt))
        .limit(limit);
    },
    async getBySlug(slug: string) {
      const rows = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
      return rows[0] ?? null;
    },
    async create(input: typeof projects.$inferInsert) {
      return db.insert(projects).values(input);
    },
    async update(id: number, patch: Partial<typeof projects.$inferInsert>) {
      return db.update(projects).set(patch).where(and(eq(projects.id, id)));
    }
  };
}
