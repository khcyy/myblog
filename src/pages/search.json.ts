import type { APIRoute } from 'astro';
import { createPostsRepository, createProjectsRepository, getDbClientFromLocals } from '../db';

export const prerender = false;

const SEARCH_LIMIT = 20;

export const GET: APIRoute = async ({ locals }) => {
  const db = getDbClientFromLocals(locals as any);
  if (!db) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  }

  const postRepo = createPostsRepository(db);
  const projectRepo = createProjectsRepository(db);

  const [posts, projects] = await Promise.all([
    postRepo.listPublished(SEARCH_LIMIT),
    projectRepo.listPublished(SEARCH_LIMIT)
  ]);

  const blogPosts = posts.map((post) => ({
    id: post.slug,
    title: post.title,
    description: post.summary ?? '',
    content: post.content ?? '',
    url: `/blog/${post.slug}/`,
    type: 'blog'
  }));

  const projectPosts = projects.map((project) => ({
    id: project.slug,
    title: project.title,
    description: project.summary ?? '',
    content: project.content ?? '',
    url: `/projects/${project.slug}/`,
    type: 'project'
  }));

  const allPosts = [...blogPosts, ...projectPosts];

  return new Response(JSON.stringify(allPosts), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
};