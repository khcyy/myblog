import { getDbClientFromLocals } from '../../db';
import { createUsersRepository } from '../../db/repositories/users.repository';

type RuntimeLocals = {
  runtime?: { env?: Env };
  env?: Env;
};

type GitHubProfile = {
  githubId: string;
  username: string;
  avatarUrl: string | null;
  email: string | null;
};

function getAdminGithubSet(env?: Env) {
  const processEnv = ((globalThis as any).process?.env ?? {}) as Record<string, string | undefined>;
  const raw = env?.ADMIN_GITHUB_IDS ?? processEnv.ADMIN_GITHUB_IDS ?? '';
  const ids = raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  return new Set(ids);
}

function resolveRole(input: { existingRole?: string; githubId: string; env?: Env }) {
  const adminIds = getAdminGithubSet(input.env);
  if (adminIds.has(input.githubId)) {
    return 'admin';
  }

  if (input.existingRole === 'admin') {
    return 'admin';
  }

  return 'reader';
}

export async function upsertGithubUser(locals: RuntimeLocals, profile: GitHubProfile) {
  const db = getDbClientFromLocals(locals);
  if (!db) {
    throw new Error('Database binding is missing');
  }

  const repo = createUsersRepository(db);
  const existing = await repo.getByGithubId(profile.githubId);

  const role = resolveRole({
    existingRole: existing?.role,
    githubId: profile.githubId,
    env: locals.runtime?.env ?? locals.env
  });

  const user = await repo.upsertFromGithub({
    githubId: profile.githubId,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
    email: profile.email,
    role
  });

  if (!user) {
    throw new Error('Failed to load user after upsert');
  }

  return user;
}

export async function getUserById(locals: RuntimeLocals, userId: number) {
  const db = getDbClientFromLocals(locals);
  if (!db) {
    return null;
  }

  return createUsersRepository(db).getById(userId);
}
