import type { AstroCookies } from 'astro';

export const SESSION_COOKIE_NAME = 'admin_session';
export const OAUTH_STATE_COOKIE_NAME = 'github_oauth_state';
export const OAUTH_REDIRECT_COOKIE_NAME = 'github_oauth_next';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10;

type SessionPayload = {
  uid: number;
  role: string;
  exp: number;
};

function bytesToBase64Url(bytes: Uint8Array) {
  const bin = String.fromCharCode(...bytes);
  const base64 = btoa(bin);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(base64Url: string) {
  const padded = base64Url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

function getSessionSecret(env?: Env) {
  const processEnv = ((globalThis as any).process?.env ?? {}) as Record<string, string | undefined>;
  const secret = env?.AUTH_SESSION_SECRET ?? processEnv.AUTH_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('AUTH_SESSION_SECRET is missing or too short (min 16 chars)');
  }
  return secret;
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function isHttps(url: string) {
  return new URL(url).protocol === 'https:';
}

export async function createSessionCookie(
  cookies: AstroCookies,
  env: Env | undefined,
  requestUrl: string,
  user: { id: number; role: string }
) {
  const secret = getSessionSecret(env);
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;

  const payload: SessionPayload = {
    uid: user.id,
    role: user.role,
    exp
  };

  const payloadBase64 = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await sign(payloadBase64, secret);

  cookies.set(SESSION_COOKIE_NAME, `${payloadBase64}.${signature}`, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps(requestUrl),
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export function clearSessionCookie(cookies: AstroCookies) {
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

export async function readSessionCookie(cookies: AstroCookies, env?: Env): Promise<SessionPayload | null> {
  try {
    const secret = getSessionSecret(env);
    const cookie = cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!cookie) {
      return null;
    }

    const parts = cookie.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [payloadBase64, signature] = parts;
    const expectedSig = await sign(payloadBase64, secret);
    if (signature !== expectedSig) {
      return null;
    }

    const json = new TextDecoder().decode(base64UrlToBytes(payloadBase64));
    const payload = JSON.parse(json) as SessionPayload;

    if (!payload.uid || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function setOAuthStateCookie(cookies: AstroCookies, requestUrl: string, state: string) {
  cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps(requestUrl),
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS
  });
}

export function setOAuthRedirectCookie(cookies: AstroCookies, requestUrl: string, next: string) {
  cookies.set(OAUTH_REDIRECT_COOKIE_NAME, next, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps(requestUrl),
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS
  });
}

export function readOAuthStateCookie(cookies: AstroCookies) {
  return cookies.get(OAUTH_STATE_COOKIE_NAME)?.value ?? null;
}

export function readOAuthRedirectCookie(cookies: AstroCookies) {
  return cookies.get(OAUTH_REDIRECT_COOKIE_NAME)?.value ?? null;
}

export function clearOAuthStateCookie(cookies: AstroCookies) {
  cookies.delete(OAUTH_STATE_COOKIE_NAME, { path: '/' });
}

export function clearOAuthRedirectCookie(cookies: AstroCookies) {
  cookies.delete(OAUTH_REDIRECT_COOKIE_NAME, { path: '/' });
}
