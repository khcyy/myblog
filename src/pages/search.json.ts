import { getCollection } from 'astro:content';

export async function GET() {
  const getCollectionAny = getCollection as unknown as (name: string) => Promise<any[]>;
  const blog = await getCollectionAny('blog');
  const projects = await getCollectionAny('projects');

  const blogPosts = blog.filter(p => p.data.date).map(p => ({
    id: p.id,
    title: p.data.title,
    description: p.data.description || '',
    content: p.body || '',
    url: `/blog/${p.id.replace(/\.mdx?$/, '')}/`,
    type: 'blog'
  }));

  const projectPosts = projects.filter(p => p.data.date).map(p => ({
    id: p.id,
    title: p.data.title,
    description: p.data.summary || '',
    url: `/projects/${p.id.replace(/\.mdx?$/, '')}/`,
    content: p.body || '',
    type: 'project'
  }));

  const allPosts = [...blogPosts, ...projectPosts];

  return new Response(JSON.stringify(allPosts), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}