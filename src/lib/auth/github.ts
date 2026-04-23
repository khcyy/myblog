type RuntimeLocals = {
  runtime?: { env?: Env };
  env?: Env;
};

type GitHubTokenResponse = {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type GitHubUserResponse = {
  id: number;
  login: string;
  avatar_url: string | null;
};

export function getEnvFromLocals(locals: RuntimeLocals) {
  const runtimeEnv = locals.runtime?.env ?? locals.env;
  const processEnv = ((globalThis as any).process?.env ?? {}) as Record<string, string | undefined>;

  return {
    ...runtimeEnv,
    GITHUB_CLIENT_ID: runtimeEnv?.GITHUB_CLIENT_ID ?? processEnv.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: runtimeEnv?.GITHUB_CLIENT_SECRET ?? processEnv.GITHUB_CLIENT_SECRET,
    AUTH_SESSION_SECRET: runtimeEnv?.AUTH_SESSION_SECRET ?? processEnv.AUTH_SESSION_SECRET,
    ADMIN_GITHUB_IDS: runtimeEnv?.ADMIN_GITHUB_IDS ?? processEnv.ADMIN_GITHUB_IDS
  } as Env;
}

export function buildGitHubAuthorizeUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
}) {
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', input.clientId);
  url.searchParams.set('redirect_uri', input.redirectUri);
  url.searchParams.set('scope', 'read:user user:email');
  url.searchParams.set('state', input.state);
  return url.toString();
}

export async function exchangeCodeForAccessToken(input: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}) {
  const body = new URLSearchParams({
    client_id: input.clientId,
    client_secret: input.clientSecret,
    code: input.code,
    redirect_uri: input.redirectUri
  });

  let response: Response;
  try {
    response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
      },
      body
    });
  } catch (error) {
    const cause = (error as any)?.cause;
    console.error('[auth][github] token fetch failed', {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      cause,
      causeCode: cause?.code,
      causeErrno: cause?.errno,
      causeSyscall: cause?.syscall,
      causeHostname: cause?.hostname
    });
    throw error;
  }

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed: ${response.status}`);
  }

  const json = (await response.json()) as GitHubTokenResponse;
  if (!json.access_token) {
    throw new Error(json.error_description ?? json.error ?? 'GitHub token is missing');
  }

  return json.access_token;
}

export async function fetchGitHubUser(accessToken: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'myblog-auth'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub user fetch failed: ${response.status}`);
  }

  const json = (await response.json()) as GitHubUserResponse;
  if (!json.id || !json.login) {
    throw new Error('GitHub user payload is incomplete');
  }

  return {
    githubId: String(json.id),
    username: json.login,
    avatarUrl: json.avatar_url ?? null
  };
}
