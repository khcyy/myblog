export const prerender = false; // 必须开启，否则在 hybrid 模式下会被静态编译

export async function GET({ request, locals }) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return new Response(JSON.stringify({ error: '必须提供文章标识 (slug)' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 从上下文中获取数据库绑定
    const db = locals.runtime.env.DB;
    
    // 执行查询语句，按时间最新倒序排列
    const { results } = await db.prepare(
      "SELECT id, post_slug, author, email, content, created_at FROM comments WHERE post_slug = ? ORDER BY created_at DESC"
    ).bind(slug).all();

    return new Response(JSON.stringify({ success: true, data: results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '获取评论失败：' + error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}