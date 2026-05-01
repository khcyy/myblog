import type { APIRoute } from 'astro';
import { createProjectsRepository, getDbClientFromLocals } from '../../../../../db';

export const prerender = false;

export const POST: APIRoute = async ({ params, locals, redirect }) => {
  const currentUser = (locals as any).currentUser;
  if (!currentUser || currentUser.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
  }

  const projectId = Number(params.id);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return new Response('Invalid project id', { status: 400 });
  }

  const db = getDbClientFromLocals(locals as any);
  if (!db) {
    return new Response('Database binding is missing', { status: 500 });
  }

  const repo = createProjectsRepository(db);
  await repo.remove(projectId);

  return redirect('/admin/projects?success=deleted', 302);
};
