import type { APIRoute } from 'astro';
import { createPostsRepository, getDbClientFromLocals } from '../../../../../db';

export const prerender = false;

function toStatus(value: FormDataEntryValue | null) {
  return value === 'published' ? 'published' : 'draft';
}

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeTags(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return [] as string[];
  }

  const cleaned = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(new Set(cleaned));
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
  const tags = normalizeTags(formData.get('tags'));

  if (!title) {
    return redirect(`/admin/posts/${postId}/edit?error=missing_title`, 302);
  }
  if (!slug) {
    return redirect(`/admin/posts/${postId}/edit?error=missing_slug`, 302);
  }
  if (!content.trim()) {
    return redirect(`/admin/posts/${postId}/edit?error=missing_content`, 302);
  }

  const repo = createPostsRepository(db);
  const existing = await repo.getById(postId);
  if (!existing) {
    return new Response('Post not found', { status: 404 });
  }

  const slugTaken = await repo.getBySlug(slug);
  if (slugTaken && slugTaken.id !== postId) {
    return redirect(`/admin/posts/${postId}/edit?error=slug_taken`, 302);
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
    tags,
    publishedAt
  });

  return redirect('/admin/posts?success=updated', 302);
};
