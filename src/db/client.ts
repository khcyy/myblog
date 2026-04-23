import { drizzle } from 'drizzle-orm/d1';
import { schema } from './schema';

export type RuntimeLocals = {
  runtime?: { env?: Env };
  env?: Env;
};

export function getD1Binding(locals: RuntimeLocals): Env['DB'] | null {
  return locals.runtime?.env?.DB ?? locals.env?.DB ?? null;
}

export function createDbClient(dbBinding: Env['DB']) {
  if (!dbBinding) {
    throw new Error('D1 binding DB is missing');
  }

  return drizzle(dbBinding as any, { schema });
}

export function getDbClientFromLocals(locals: RuntimeLocals) {
  const binding = getD1Binding(locals);
  if (!binding) {
    return null;
  }

  return createDbClient(binding);
}

export type DbClient = ReturnType<typeof createDbClient>;
