import type { APIRoute } from 'astro';
import { createProjectsRepository, getDbClientFromLocals } from '../../../../../db';

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

  const projectId = Number(params.id);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return new Response('Invalid project id', { status: 400 });
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
    return redirect(`/admin/projects/${projectId}/edit?error=missing_title`, 302);
  }
  if (!slug) {
    return redirect(`/admin/projects/${projectId}/edit?error=missing_slug`, 302);
  }
  if (!content.trim()) {
    return redirect(`/admin/projects/${projectId}/edit?error=missing_content`, 302);
  }

  const repo = createProjectsRepository(db);
  const existing = await repo.getById(projectId);
  if (!existing) {
    return new Response('Project not found', { status: 404 });
  }

  const slugTaken = await repo.getBySlug(slug);
  if (slugTaken && slugTaken.id !== projectId) {
    return redirect(`/admin/projects/${projectId}/edit?error=slug_taken`, 302);
  }

  const publishedAt =
    status === 'published'
      ? existing.publishedAt ?? new Date().toISOString()
      : null;

  await repo.update(projectId, {
    title,
    slug,
    summary: summary || null,
    content,
    status,
    publishedAt
  });

  return redirect('/admin/projects?success=updated', 302);
};
