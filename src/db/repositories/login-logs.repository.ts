import { desc } from 'drizzle-orm';
import type { DbClient } from '../client';
import { loginLogs } from '../schema';

export function createLoginLogsRepository(db: DbClient) {
  return {
    async listAll(limit = 200) {
      return db.select().from(loginLogs).orderBy(desc(loginLogs.createdAt)).limit(limit);
    },
    async create(input: typeof loginLogs.$inferInsert) {
      return db.insert(loginLogs).values(input);
    }
  };
}
