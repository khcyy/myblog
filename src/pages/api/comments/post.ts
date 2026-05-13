import type { APIRoute } from 'astro';
import { createCommentsRepository, getDbClientFromLocals } from '../../../db';

export const prerender = false;

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getSafeRedirect(redirectTo: string, referer: string | null) {
  const allowPath = (value: string) => value.startsWith('/blog/') || value.startsWith('/projects/');

  if (redirectTo && allowPath(redirectTo)) {
    const url = new URL(redirectTo, 'http://local');
    url.searchParams.set('commented', '1');
    return url.pathname + url.search;
  }

  if (referer) {
    const url = new URL(referer);
    if (allowPath(url.pathname)) {
      url.searchParams.set('commented', '1');
      return url.pathname + url.search;
    }
  }

  return '';
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const currentUser = (locals as any).currentUser;
    if (!currentUser) {
      const accept = request.headers.get('accept') ?? '';
      const contentType = request.headers.get('content-type') ?? '';
      const expectsJson = accept.includes('application/json') || contentType.includes('application/json');

      if (expectsJson) {
        return new Response(JSON.stringify({ ok: false, error: '请先登录 GitHub 再评论' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const loginUrl = new URL('/api/auth/github/login', request.url);
      loginUrl.searchParams.set('next', '/');
      return new Response(null, { status: 303, headers: { Location: loginUrl.toString() } });
    }

    const contentType = request.headers.get('content-type') ?? '';
    let body: Record<string, unknown> = {};

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const form = await request.formData();
      form.forEach((value, key) => {
        body[key] = value;
      });
    }

    const author = normalizeText(body.author ?? body.nickname);
    const nickname = normalizeText(body.nickname);
    const email = normalizeText(body.email);
    const content = normalizeText(body.content);
    const postSlug = normalizeText(body.postSlug ?? body.post_slug);
    const targetType = normalizeText(body.targetType ?? body.target_type) || (postSlug ? 'post' : '');
    const targetIdRaw = normalizeText(body.targetId ?? body.target_id);
    const targetId = targetIdRaw ? Number(targetIdRaw) : null;
    const redirectToRaw = normalizeText(body.redirectTo ?? body.redirect_to);

    console.log('[comments.post]', {
      method: request.method,
      contentType,
      redirectTo: redirectToRaw,
      postSlug,
      targetType,
      targetId,
      author,
      hasContent: Boolean(content)
    });

    if (!author || !content) {
      return new Response('请填写必须的字段（昵称、评论内容）', { status: 400 });
    }

    if (!postSlug && (!targetType || !Number.isFinite(targetId ?? NaN))) {
      return new Response('缺少关联字段', { status: 400 });
    }

    const db = getDbClientFromLocals(locals as any);
    if (!db) {
      return new Response('数据库连接失败，无法获取 D1 实例', { status: 500 });
    }

    const repo = createCommentsRepository(db);
    console.log('[comments.post] before insert');
    await repo.create({
      targetType: targetType || 'post',
      targetId: targetType === 'project' ? targetId : null,
      postSlug: postSlug || null,
      author: author || null,
      nickname: nickname || null,
      email: email || null,
      content,
      status: 'pending'
    });
    console.log('[comments.post] insert success');

    const referer = request.headers.get('referer');
    const safeRedirect = getSafeRedirect(redirectToRaw, referer);
    if (safeRedirect) {
      return new Response(null, { status: 303, headers: { Location: safeRedirect } });
    }

    return new Response('评论已提交，等待审核', { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log('[comments.post] insert error', message);
    return new Response('服务器内部错误：' + message, { status: 500 });
  }
};

export const GET: APIRoute = async () => {
  return new Response('Comments endpoint is ready', { status: 200 });
};