import type { APIRoute } from 'astro';
import { createCommentsRepository, getDbClientFromLocals } from '../../../../../db';

export const prerender = false;

export const POST: APIRoute = async ({ params, locals, redirect }) => {
  const currentUser = (locals as any).currentUser;
  if (!currentUser || currentUser.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
  }

  const commentId = Number(params.id);
  if (!Number.isInteger(commentId) || commentId <= 0) {
    return new Response('Invalid comment id', { status: 400 });
  }

  const db = getDbClientFromLocals(locals as any);
  if (!db) {
    return new Response('Database binding is missing', { status: 500 });
  }

  const repo = createCommentsRepository(db);
  const existing = await repo.getById(commentId);
  if (!existing) {
    return new Response('Comment not found', { status: 404 });
  }

  await repo.update(commentId, { status: 'approved' });
  return redirect('/admin/comments', 302);
};
