import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../../lib/auth/session';

export const prerender = false;

const redirectToLogin = () =>
  new Response(null, {
    status: 302,
    headers: {
      Location: '/admin/login'
    }
  });

export const GET: APIRoute = async ({ cookies }) => {
  clearSessionCookie(cookies);
  return redirectToLogin();
};

export const POST: APIRoute = async ({ cookies }) => {
  clearSessionCookie(cookies);
  return redirectToLogin();
};
