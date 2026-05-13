import type { APIRoute } from 'astro';
import {
  exchangeCodeForAccessToken,
  fetchGitHubUser,
  getEnvFromLocals
} from '../../../../lib/auth/github';
import {
  clearOAuthStateCookie,
  createSessionCookie,
  readOAuthRedirectCookie,
  readOAuthStateCookie,
  clearOAuthRedirectCookie
} from '../../../../lib/auth/session';
import { upsertGithubUser } from '../../../../lib/auth/user';

export const prerender = false;

function maskState(value: string | null) {
  if (!value) {
    return null;
  }
  if (value.length <= 16) {
    return value;
  }
  return `${value.slice(0, 8)}...${value.slice(-8)}`;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function normalizeRedirectPath(value: string | null) {
  const trimmed = (value ?? '').trim();
  if (!trimmed || !trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return '';
  }
  return trimmed;
}

export const GET: APIRoute = async ({ request, locals, cookies, redirect }) => {
  let stage = 'init';
  try {
    const env = getEnvFromLocals(locals as any);
    if (!env?.GITHUB_CLIENT_ID || !env?.GITHUB_CLIENT_SECRET) {
      return new Response('GitHub OAuth env is missing', { status: 500 });
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const storedState = readOAuthStateCookie(cookies);

    if (!code || !state || !storedState || state !== storedState) {
      console.warn('[auth][callback] invalid-state', {
        hasCode: Boolean(code),
        hasQueryState: Boolean(state),
        hasCookieState: Boolean(storedState),
        queryState: maskState(state),
        cookieState: maskState(storedState)
      });
      clearOAuthStateCookie(cookies);
      return new Response('Invalid OAuth state', { status: 400 });
    }

    clearOAuthStateCookie(cookies);

    const callbackUrl = new URL('/api/auth/github/callback', request.url).toString();

    stage = 'token';
    const accessToken = await exchangeCodeForAccessToken({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      code,
      redirectUri: callbackUrl
    });

    stage = 'user';
    const githubUser = await fetchGitHubUser(accessToken);

    stage = 'db';
    const user = await upsertGithubUser(locals as any, githubUser);

    stage = 'session';
    await createSessionCookie(cookies, env, request.url, {
      id: user.id,
      role: user.role
    });
    const next = normalizeRedirectPath(readOAuthRedirectCookie(cookies));
    clearOAuthRedirectCookie(cookies);

    const redirectTarget = user.role === 'admin' ? (next || '/admin') : '/';
    return redirect(redirectTarget, 302);
  } catch (error) {
    const message = errorMessage(error);
    console.error('[auth][callback] failed', {
      stage,
      message
    });

    const publicMessageByStage: Record<string, string> = {
      token: 'GitHub token exchange failed',
      user: 'GitHub user fetch failed',
      db: 'User upsert failed',
      session: 'Session creation failed'
    };

    const publicMessage =
      publicMessageByStage[stage] ?? (message === 'fetch failed' ? 'GitHub OAuth network request failed' : message);

    return new Response(publicMessage, { status: 500 });
  }
};
