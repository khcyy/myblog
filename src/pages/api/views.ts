export const prerender = false;

import { createPostsRepository, createProjectsRepository, getDbClientFromLocals } from '../../db';

export async function POST({ request, locals }) {
  try {
    const body = await request.json();
    let slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    if (slug.startsWith('"') && slug.endsWith('"')) {
      try {
        slug = JSON.parse(slug);
      } catch {
        slug = slug.slice(1, -1);
      }
    }

    if (!slug) {
      return new Response(JSON.stringify({ error: '必须提供 slug' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const type = body?.type === 'project' ? 'project' : 'post';

    const db = getDbClientFromLocals(locals as any);
    if (!db) {
      return new Response(JSON.stringify({ error: '数据库连接失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let views: number;
    if (type === 'project') {
      const repo = createProjectsRepository(db);
      views = await repo.incrementViewsBySlug(slug);
    } else {
      const repo = createPostsRepository(db);
      views = await repo.incrementViewsBySlug(slug);
    }

    return new Response(JSON.stringify({ success: true, views }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '更新浏览量失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
