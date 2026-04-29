import type { APIRoute } from 'astro';
import { comments, getDbClientFromLocals, posts, projects, siteSettings, users } from '../../db';

// 给 GET 加上 APIRoute 类型，让 TypeScript 正确识别


























































































































































export const GET: APIRoute = ({ locals }: { locals: any }) => {
  // 检查 D1 数据库绑定状态
  const hasDbBinding = Boolean(locals.runtime?.env?.DB ?? locals.env?.DB);
  const dbClientReady = Boolean(getDbClientFromLocals(locals as any));
  const schemaReady = Boolean(users && posts && projects && comments && siteSettings);

  return new Response(
    JSON.stringify({
      ok: true,
      runtime: 'cloudflare',
      hasDbBinding,
      dbClientReady,
      schemaReady,
      // 加上时间戳，方便确认是否是实时响应
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8'
      }
    }
  );
};