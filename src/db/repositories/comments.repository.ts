import { and, desc, eq } from 'drizzle-orm';
import { comments } from '../schema';
import type { DbClient } from '../client';

export function createCommentsRepository(db: DbClient) {
  return {
    async listPublished(targetType: 'post' | 'project', targetId: number, limit = 50) {
      return db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.targetType, targetType),
            eq(comments.targetId, targetId),
            eq(comments.status, 'approved')
          )
        )
        .orderBy(desc(comments.createdAt))
        .limit(limit);
    },
    async getById(id: number) {
      const rows = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
      return rows[0] ?? null;
    },
    async create(input: typeof comments.$inferInsert) {
      return db.insert(comments).values(input);
    },
    async update(id: number, patch: Partial<typeof comments.$inferInsert>) {
      return db.update(comments).set(patch).where(and(eq(comments.id, id)));
    }
  };
}
