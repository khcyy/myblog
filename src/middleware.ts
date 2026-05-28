import { defineMiddleware } from 'astro:middleware';
import { clearSessionCookie, readSessionCookie } from './lib/auth/session';
import { getUserById } from './lib/auth/user';
import { runAutoMigrations } from './db/auto-migrate';

let autoMigrated = false;

function isAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export const onRequest = defineMiddleware(async (context, next) => {
  const env = (context.locals as any).runtime?.env ?? (context.locals as any).env;

  if (!autoMigrated && (env as any)?.DB) {
    autoMigrated = true;
    await runAutoMigrations((env as any).DB).catch((err: any) => {
      console.warn('[auto-migrate] failed:', err);
      autoMigrated = false;
    });
  }

  const session = await readSessionCookie(context.cookies, env);

  context.locals.session = session;
  context.locals.currentUser = null;

  if (session) {
    const user = await getUserById(context.locals as any, session.uid);
    if (user) {
      context.locals.currentUser = user;
    } else {
      clearSessionCookie(context.cookies);
      context.locals.session = null;
    }
  }

  const pathname = context.url.pathname;
  const isAdmin = isAdminPath(pathname);
  const isLoginPage = pathname === '/admin/login';

  if (isAdmin && !isLoginPage) {
    if (!context.locals.currentUser) {
      const loginUrl = new URL('/admin/login', context.url);
      loginUrl.searchParams.set('next', pathname);
      return context.redirect(loginUrl.toString(), 302);
    }

    if (context.locals.currentUser.role !== 'admin') {
      return new Response('Forbidden', { status: 403 });
    }
  }

  if (isLoginPage && context.locals.currentUser?.role === 'admin') {
    return context.redirect('/admin', 302);
  }

  return next();
});
