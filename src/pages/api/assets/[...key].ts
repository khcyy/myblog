import type { APIRoute } from 'astro';

export const prerender = false;

function getR2Binding(locals: unknown) {
  const runtimeEnv = (locals as any)?.runtime?.env ?? (locals as any)?.env;
  return runtimeEnv?.BLOG_ASSETS ?? null;
}

function normalizeKey(raw: string | string[] | undefined) {
  if (!raw) {
    return '';
  }
  if (Array.isArray(raw)) {
    return raw.join('/');
  }
  return raw;
}

export const GET: APIRoute = async ({ params, locals }) => {
  const key = normalizeKey(params.key as any);

  if (!key || key.startsWith('/') || key.includes('..') || !key.startsWith('site-assets/')) {
    return new Response('Invalid key', { status: 400 });
  }

  const bucket = getR2Binding(locals);
  if (!bucket) {
    return new Response('R2 binding BLOG_ASSETS is missing', { status: 500 });
  }

  const object = await bucket.get(key);
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(object.body, {
    status: 200,
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
};
