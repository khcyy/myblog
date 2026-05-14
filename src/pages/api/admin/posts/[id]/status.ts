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
  const existing = await repo.getById(postId);
  if (!existing) {
    return new Response('Post not found', { status: 404 });
  }

  const nextStatus = existing.status === 'published' ? 'draft' : 'published';
  try {
    await repo.update(postId, {
      status: nextStatus,
      publishedAt: nextStatus === 'published' ? existing.publishedAt ?? new Date().toISOString() : null
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return new Response(`更新文章状态失败: ${message}`, { status: 500 });
  }

  const success = nextStatus === 'published' ? 'published' : 'drafted';
  return redirect(`/admin/posts?success=${success}`, 302);
};
