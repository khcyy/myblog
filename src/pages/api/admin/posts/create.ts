import type { APIRoute } from 'astro';
import { createPostsRepository, getDbClientFromLocals } from '../../../../db';

export const prerender = false;

function toStatus(value: FormDataEntryValue | null) {
  return value === 'published' ? 'published' : 'draft';
}

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const currentUser = (locals as any).currentUser;
  if (!currentUser || currentUser.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
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
  const slugTaken = await repo.getBySlug(slug);
  if (slugTaken) {
    return new Response('Slug already exists, please use another slug', { status: 409 });
  }

  await repo.create({
    title,
    slug,
    summary: summary || null,
    content,
    coverImage: coverImage || null,
    status,
    publishedAt: status === 'published' ? new Date().toISOString() : null
  });

  return redirect('/admin/posts', 302);
};
