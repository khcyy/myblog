/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type SessionPayload = {
  uid: number;
  role: string;
  exp: number;
};

type AuthUser = {
  id: number;
  githubId: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  role: string;
};

declare global {
  interface D1Database {
    prepare(query: string): {
      bind(...values: unknown[]): {
        first<T = Record<string, unknown>>(): Promise<T | null>;
        all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
        run(): Promise<unknown>;
      };
    };
  }

  interface Env {
    DB?: D1Database;
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
    AUTH_SESSION_SECRET?: string;
    ADMIN_GITHUB_IDS?: string;
  }
}

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    session?: SessionPayload | null;
    currentUser?: AuthUser | null;
  }
}

export {};
