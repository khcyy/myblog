import type { APIRoute } from 'astro';

export const prerender = false;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml'
]);

const SLOT_PREFIX: Record<string, string> = {
  headerLogo: 'site-assets/header-logo/',
  heroLeftDecor: 'site-assets/hero-left-decor/',
  heroAvatar: 'site-assets/hero-avatar/',
  heroRightDecor: 'site-assets/hero-right-decor/',
  general: 'site-assets/general/'
};

function getR2Binding(locals: unknown) {
  const runtimeEnv = (locals as any)?.runtime?.env ?? (locals as any)?.env;
  return runtimeEnv?.BLOG_ASSETS ?? null;
}

function getExtensionFromType(type: string) {
  switch (type) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'bin';
  }
}

function getExtensionFromName(name: string) {
  const lastDot = name.lastIndexOf('.');
  if (lastDot === -1) {
    return '';
  }
  return name.slice(lastDot + 1).toLowerCase();
}

function createRandomId() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export const POST: APIRoute = async ({ request, locals }) => {
  const currentUser = (locals as any).currentUser;
  if (!currentUser || currentUser.role !== 'admin') {
    return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), {
      status: 403,
      headers: { 'content-type': 'application/json' }
    });
  }

  const bucket = getR2Binding(locals);
  if (!bucket) {
    return new Response(JSON.stringify({ ok: false, error: 'R2 binding BLOG_ASSETS is missing' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid form data' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  const file = formData.get('file');
  const slotRaw = formData.get('slot');
  const slot = typeof slotRaw === 'string' && SLOT_PREFIX[slotRaw] ? slotRaw : 'general';

  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ ok: false, error: 'file is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return new Response(JSON.stringify({ ok: false, error: 'Unsupported file type' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  if (file.size > MAX_FILE_SIZE) {
    return new Response(JSON.stringify({ ok: false, error: 'File is too large (max 5MB)' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  const extensionFromName = getExtensionFromName(file.name);
  const extension = extensionFromName || getExtensionFromType(file.type);
  const fileName = `${Date.now()}-${createRandomId()}.${extension}`;
  const key = `${SLOT_PREFIX[slot]}${fileName}`;

  const body = await file.arrayBuffer();

  try {
    await bucket.put(key, body, {
      contentLength: file.size,
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      key,
      url: `/api/assets/${key}`,
      contentType: file.type,
      size: file.size
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' }
    }
  );
};
