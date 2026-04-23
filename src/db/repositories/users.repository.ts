import { eq, sql } from 'drizzle-orm';
import type { DbClient } from '../client';
import { users } from '../schema';

type UpsertGithubUserInput = {
  githubId: string;
  username: string;
  avatarUrl: string | null;
  role: string;
};

export function createUsersRepository(db: DbClient) {
  return {
    async getById(id: number) {
      const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return rows[0] ?? null;
    },

    async getByGithubId(githubId: string) {
      const rows = await db.select().from(users).where(eq(users.githubId, githubId)).limit(1);
      return rows[0] ?? null;
    },

    async upsertFromGithub(input: UpsertGithubUserInput) {
      const existing = await this.getByGithubId(input.githubId);

      if (!existing) {
        await db.insert(users).values({
          githubId: input.githubId,
          username: input.username,
          avatarUrl: input.avatarUrl,
          role: input.role
        });
        return this.getByGithubId(input.githubId);
      }

      await db
        .update(users)
        .set({
          username: input.username,
          avatarUrl: input.avatarUrl,
          role: input.role,
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(users.id, existing.id));

      return this.getById(existing.id);
    }
  };
}
