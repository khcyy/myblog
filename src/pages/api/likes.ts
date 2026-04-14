export const prerender = false; // 必须开启，不能静态编译

// 处理查询该文章点赞数的 GET 请求
export async function GET({ request, locals }) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
       return new Response(JSON.stringify({ error: '必须提供分类 slug' }), { status: 400 });
    }

    const db = locals.runtime?.env?.DB ?? locals.env?.DB;
    if (!db) {
       return new Response(JSON.stringify({ error: '数据库连接失败，无法获取 D1 实例' }), { status: 500 });
    }
    // 获取某个 slug 下的点赞总数
    const result = await db.prepare(
      "SELECT COUNT(*) as count FROM likes WHERE post_slug = ?"
    ).bind(slug).first();

    return new Response(JSON.stringify({ success: true, count: result.count }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch(error) {
     return new Response(JSON.stringify({ error: '获取点赞数失败' }), { status: 500 });
  }
}

// 处理点击「点赞」的 POST 请求
export async function POST({ request, locals }) {
  try {
    const body = await request.json();
    const { post_slug } = body;

    const db = locals.runtime?.env?.DB ?? locals.env?.DB;
    if (!db) {
       return new Response(JSON.stringify({ error: '保存点赞失败，无法获取 D1 实例' }), { status: 500 });
    }
    await db.prepare(
      "INSERT INTO likes (post_slug) VALUES (?)"
    ).bind(post_slug).run();

    return new Response(JSON.stringify({ success: true, message: '点赞成功！' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
     return new Response(JSON.stringify({ error: '保存点赞失败' }), { status: 500 });
  }
}