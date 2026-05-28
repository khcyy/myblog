import type { APIRoute } from 'astro';
import { createPostsRepository, createProjectsRepository, getDbClientFromLocals } from '../db';

export const prerender = false;

const SEARCH_SOURCE_LIMIT = 200;
const MAX_RESULTS = 40;
const MAX_QUERY_LENGTH = 40;
const MAX_TOKENS = 6;
const EXCERPT_LENGTH = 160;

type SearchItem = {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  type: 'blog' | 'project';
  publishedAt: string;
};

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeForSearch(value: string) {
  return value.toLowerCase();
}

function tokenize(query: string) {
  const lower = normalizeForSearch(query);
  const expanded = lower.replace(/([\u4e00-\u9fff])/g, ' $1 ');
  const cleaned = expanded.replace(/[^\w\u4e00-\u9fff]+/g, ' ');
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  return tokens.slice(0, MAX_TOKENS);
}

function stripMarkdown(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildExcerpt(content: string, token: string | null) {
  const plain = stripMarkdown(content);
  if (!plain) {
    return '';
  }

  const lower = normalizeForSearch(plain);
  const index = token ? lower.indexOf(token) : -1;
  if (index < 0) {
    return plain.length > EXCERPT_LENGTH ? `${plain.slice(0, EXCERPT_LENGTH).trim()}...` : plain;
  }

  const start = Math.max(0, index - Math.floor(EXCERPT_LENGTH / 3));
  const snippet = plain.slice(start, start + EXCERPT_LENGTH).trim();
  const prefix = start > 0 ? '...' : '';
  const suffix = start + EXCERPT_LENGTH < plain.length ? '...' : '';
  return `${prefix}${snippet}${suffix}`;
}

function scoreItem(item: SearchItem, tokens: string[]) {
  const title = normalizeForSearch(item.title);
  const content = normalizeForSearch(item.content);
  let score = 0;
  let firstContentToken: string | null = null;

  for (const token of tokens) {
    const inTitle = title.includes(token);
    const inContent = content.includes(token);
    if (!inTitle && !inContent) {
      return null;
    }

    if (inTitle) {
      score += 2;
    } else if (inContent) {
      score += 1;
    }

    if (!firstContentToken && inContent) {
      firstContentToken = token;
    }
  }

  const excerpt = buildExcerpt(item.content, firstContentToken ?? tokens[0] ?? null);
  return { score, excerpt };
}

function parseDateValue(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export const GET: APIRoute = async ({ locals, request }) => {
  const db = getDbClientFromLocals(locals as any);
  if (!db) {
    return new Response(JSON.stringify({ ok: false, error: 'DB_MISSING', message: '数据库连接失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  }

  const url = new URL(request.url);
  const rawQuery = normalizeText(url.searchParams.get('q'));
  if (!rawQuery) {
    return new Response(JSON.stringify({ ok: false, error: 'EMPTY_QUERY', message: '请输入关键词再搜索。' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  }

  if (rawQuery.length > MAX_QUERY_LENGTH) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'QUERY_TOO_LONG',
        message: `关键词过长，请控制在 ${MAX_QUERY_LENGTH} 个字符内。`
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );
  }

  const tokens = tokenize(rawQuery);
  if (tokens.length === 0) {
    return new Response(JSON.stringify({ ok: false, error: 'EMPTY_QUERY', message: '请输入有效关键词。' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  }

  const postRepo = createPostsRepository(db);
  const projectRepo = createProjectsRepository(db);

  const [posts, projects] = await Promise.all([
    postRepo.listPublished(SEARCH_SOURCE_LIMIT),
    projectRepo.listPublished(SEARCH_SOURCE_LIMIT)
  ]);

  const blogPosts: SearchItem[] = posts.map((post) => ({
    id: post.slug,
    title: post.title,
    description: post.summary ?? '',
    content: post.content ?? '',
    url: `/blog/${post.slug}/`,
    type: 'blog',
    publishedAt: post.publishedAt ?? post.updatedAt ?? post.createdAt ?? ''
  }));

  const projectPosts: SearchItem[] = projects.map((project) => ({
    id: project.slug,
    title: project.title,
    description: project.summary ?? '',
    content: project.content ?? '',
    url: `/projects/${project.slug}/`,
    type: 'project',
    publishedAt: project.publishedAt ?? project.updatedAt ?? project.createdAt ?? ''
  }));

  const allPosts = [...blogPosts, ...projectPosts];
  const matches = allPosts
    .map((item) => {
      const scored = scoreItem(item, tokens);
      if (!scored) {
        return null;
      }
      return {
        id: item.id,
        title: item.title,
        url: item.url,
        type: item.type,
        publishedAt: item.publishedAt,
        excerpt: scored.excerpt || item.description || '',
        score: scored.score
      };
    })
    .filter(Boolean) as Array<{
      id: string;
      title: string;
      url: string;
      type: 'blog' | 'project';
      publishedAt: string;
      excerpt: string;
      score: number;
    }>;

  matches.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return parseDateValue(b.publishedAt) - parseDateValue(a.publishedAt);
  });

  const results = matches.slice(0, MAX_RESULTS).map(({ score, ...rest }) => rest);
  const message = results.length === 0 ? '没有找到匹配的内容，换个词试试？' : '';

  return new Response(
    JSON.stringify({
      ok: true,
      query: rawQuery,
      tokens,
      total: matches.length,
      results,
      message
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    }
  );
};