import type { APIRoute } from 'astro';
import { createPostsRepository, getDbClientFromLocals } from '../../../../../db';

export const prerender = false;

function resolveNext(url: URL) {
  const next = url.searchParams.get('next');
  if (!next || !next.startsWith('/admin')) {
    return '/admin/posts';
  }
  return next;
}

export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
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
  const existing = await repo.getById(postId);
  if (!existing) {
    return new Response('Post not found', { status: 404 });
  }

  const nextStatus = existing.status === 'published' ? 'draft' : 'published';
  await repo.update(postId, {
    status: nextStatus,
    publishedAt: nextStatus === 'published' ? existing.publishedAt ?? new Date().toISOString() : null
  });

  const nextUrl = resolveNext(new URL(request.url));
  return redirect(nextUrl, 302);
};
