import type { APIRoute } from 'astro';
import { buildGitHubAuthorizeUrl, getEnvFromLocals } from '../../../../lib/auth/github';
import { setOAuthRedirectCookie, setOAuthStateCookie } from '../../../../lib/auth/session';

export const prerender = false;

function createState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function normalizeNext(value: string | null, fallback: string) {
  const trimmed = (value ?? '').trim();
  if (!trimmed || !trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback;
  }
  return trimmed;
}

export const GET: APIRoute = async ({ request, locals, cookies, redirect }) => {
  const env = getEnvFromLocals(locals as any);
  if (!env?.GITHUB_CLIENT_ID) {
    return new Response('GITHUB_CLIENT_ID is missing', { status: 500 });
  }

  const url = new URL(request.url);
  const next = normalizeNext(url.searchParams.get('next'), '/admin');

  const state = createState();
  setOAuthRedirectCookie(cookies, request.url, next);
  setOAuthStateCookie(cookies, request.url, state);

  const callbackUrl = new URL('/api/auth/github/callback', request.url).toString();

  const authUrl = buildGitHubAuthorizeUrl({
    clientId: env.GITHUB_CLIENT_ID,
    redirectUri: callbackUrl,
    state
  });

  return redirect(authUrl, 302);
};
