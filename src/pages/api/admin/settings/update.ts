import type { APIRoute } from 'astro';
import { createSettingsRepository, getDbClientFromLocals } from '../../../../db';

export const prerender = false;

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
  const siteName = normalizeText(formData.get('siteName'));
  const siteDescription = normalizeText(formData.get('siteDescription'));
  const homepageIntro = normalizeText(formData.get('homepageIntro'));

  if (!siteName) {
    return new Response('siteName is required', { status: 400 });
  }

  const repo = createSettingsRepository(db);
  const existing = await repo.getSingleton();

  if (!existing) {
    await repo.create({
      siteName,
      siteDescription,
      homepageIntro
    });
  } else {
    await repo.updateSingleton({
      siteName,
      siteDescription,
      homepageIntro
    });
  }

  return redirect('/admin/settings', 302);
};
