import type { APIRoute } from 'astro';
import { createPostsRepository, getDbClientFromLocals } from '../../../../../db';

export const prerender = false;

export const POST: APIRoute = async ({ params, locals, redirect }) => {
  const currentUser = (locals as any).currentUser;
  if (!currentUser || currentUser.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
  }

  const postId = Number(params.id);
  if (!Number.isInteger(postId) || postId <= 0) {
    return new Response('Invalid post id', { status: 400 });
  }

  const db = getDbClientFromLocals(locals as any);
  if (!db) {
    return new Response('Database binding is missing', { status: 500 });
  }

  const repo = createPostsRepository(db);
  await repo.remove(postId);

  return redirect('/admin/posts', 302);
};
