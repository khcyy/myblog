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
  const existing = await repo.getById(projectId);
  if (!existing) {
    return new Response('Project not found', { status: 404 });
  }

  const nextStatus = existing.status === 'published' ? 'draft' : 'published';
  await repo.update(projectId, {
    status: nextStatus,
    publishedAt: nextStatus === 'published' ? existing.publishedAt ?? new Date().toISOString() : null
  });

  const success = nextStatus === 'published' ? 'published' : 'drafted';
  return redirect(`/admin/projects?success=${success}`, 302);
};
