import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  // 获取所有博客文章并按时间倒序
  const blog = await getCollection('blog');
  const sortedPosts = blog
    .filter(post => post.data.date) // 确保文章有日期
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  // 返回标准 RSS 格式数据
  return rss({
    // 频道标题和描述
    title: 'isishey blog',
    description: '记录与折腾 - 个人博客与技术分享',
    // 利用 astro.config.mjs 中的 site 自动组装基础 URL
    site: context.site,
    // 映射每篇文章对应的 RSS 项
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      // 组成完整链接
      link: `/blog/${post.id.replace(/\.mdx?$/, '')}/`,
    })),
    // （可选）如果想全局加上 rss 样式或者 xsl
    // stylesheet: '/rss/styles.xsl',
    customData: `<language>zh-cn</language>`,
  });
}