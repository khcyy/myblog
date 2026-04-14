export const prerender = false; // 必须开启，否则在 hybrid 模式下会被静态编译

export async function POST({ request, locals }) {
  try {
    const body = await request.json();
    const { post_slug, author, email, content } = body;

    // 基础校验
    if (!post_slug || !author || !content) {
      return new Response(JSON.stringify({ error: '请填写必须的字段（昵称、评论内容）' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 从 Astro 的上下文中获取 Cloudflare D1 绑定对象
    const db = locals.runtime.env.DB;
    
    // 执行插入语句
    await db.prepare(
      "INSERT INTO comments (post_slug, author, email, content) VALUES (?, ?, ?, ?)"
    ).bind(post_slug, author, email || '', content).run();

    return new Response(JSON.stringify({ success: true, message: '评论发布成功' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器内部错误：' + error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
