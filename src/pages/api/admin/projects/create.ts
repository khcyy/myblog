import type { APIRoute } from 'astro';
import { createProjectsRepository, getDbClientFromLocals } from '../../../../db';

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
  const status = toStatus(formData.get('status'));

  if (!title) {
    return redirect('/admin/projects/new?error=missing_title', 302);
  }
  if (!slug) {
    return redirect('/admin/projects/new?error=missing_slug', 302);
  }
  if (!content.trim()) {
    return redirect('/admin/projects/new?error=missing_content', 302);
  }

  const repo = createProjectsRepository(db);
  const slugTaken = await repo.getBySlug(slug);
  if (slugTaken) {
    return redirect('/admin/projects/new?error=slug_taken', 302);
  }

  await repo.create({
    title,
    slug,
    summary: summary || null,
    content,
    status,
    publishedAt: status === 'published' ? new Date().toISOString() : null
  });

  return redirect('/admin/projects?success=created', 302);
};
