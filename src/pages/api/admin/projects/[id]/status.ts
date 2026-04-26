import type { APIRoute } from 'astro';
import { createProjectsRepository, getDbClientFromLocals } from '../../../../../db';

export const prerender = false;

function resolveNext(url: URL) {
  const next = url.searchParams.get('next');
  if (!next || !next.startsWith('/admin')) {
    return '/admin/projects';
  }
  return next;
}

export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
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

  const nextUrl = resolveNext(new URL(request.url));
  return redirect(nextUrl, 302);
};
