import type { APIRoute } from 'astro';
import { createPostsRepository, getDbClientFromLocals } from '../../../../../db';

export const prerender = false;

function toStatus(value: FormDataEntryValue | null) {
  return value === 'published' ? 'published' : 'draft';
}

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
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

  const formData = await request.formData();
  const title = normalizeText(formData.get('title'));
  const slug = normalizeText(formData.get('slug'));
  const summary = normalizeText(formData.get('summary'));
  const content = typeof formData.get('content') === 'string' ? String(formData.get('content')) : '';
  const coverImage = normalizeText(formData.get('coverImage'));
  const status = toStatus(formData.get('status'));

  if (!title || !slug || !content.trim()) {
    return new Response('title, slug and content are required', { status: 400 });
  }

  const repo = createPostsRepository(db);
  const existing = await repo.getById(postId);
  if (!existing) {
    return new Response('Post not found', { status: 404 });
  }

  const publishedAt =
    status === 'published'
      ? existing.publishedAt ?? new Date().toISOString()
      : null;

  await repo.update(postId, {
    title,
    slug,
    summary: summary || null,
    content,
    coverImage: coverImage || null,
    status,
    publishedAt
  });

  return redirect('/admin/posts', 302);
};
