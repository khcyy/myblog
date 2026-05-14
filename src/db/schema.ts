import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    githubId: text('github_id').notNull(),
    username: text('username').notNull(),
    avatarUrl: text('avatar_url'),
    role: text('role').notNull().default('reader'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('users_github_id_unique').on(table.githubId),
    index('users_username_idx').on(table.username)
  ]
);

export const posts = sqliteTable(
  'posts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    summary: text('summary'),
    content: text('content').notNull().default(''),
    status: text('status').notNull().default('draft'),
    tags: text('tags'),
    coverImage: text('cover_image'),
    views: integer('views').notNull().default(0),
    pinned: integer('pinned').notNull().default(0),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    publishedAt: text('published_at')
  },
  (table) => [
    uniqueIndex('posts_slug_unique').on(table.slug),
    index('posts_status_idx').on(table.status),
    index('posts_published_at_idx').on(table.publishedAt)
  ]
);

export const projects = sqliteTable(
  'projects',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    summary: text('summary'),
    content: text('content').notNull().default(''),
    status: text('status').notNull().default('draft'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    publishedAt: text('published_at')
  },
  (table) => [
    uniqueIndex('projects_slug_unique').on(table.slug),
    index('projects_status_idx').on(table.status),
    index('projects_published_at_idx').on(table.publishedAt)
  ]
);

export const comments = sqliteTable(
  'comments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    targetType: text('target_type').notNull().default('post'),
    targetId: integer('target_id'),
    userId: integer('user_id'),
    nickname: text('nickname'),
    email: text('email'),
    content: text('content').notNull(),
    status: text('status').notNull().default('pending'),
    postSlug: text('post_slug'),
    author: text('author'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index('comments_target_type_idx').on(table.targetType),
    index('comments_target_id_idx').on(table.targetId),
    index('comments_status_idx').on(table.status),
    index('comments_post_slug_idx').on(table.postSlug)
  ]
);

export const siteSettings = sqliteTable('site_settings', {
  id: integer('id').primaryKey(),
  siteName: text('site_name').notNull().default('My Blog'),
  siteDescription: text('site_description').notNull().default(''),
  homepageIntro: text('homepage_intro').notNull().default(''),
  headerLogoUrl: text('header_logo_url').notNull().default(''),
  heroLeftDecorUrl: text('hero_left_decor_url').notNull().default(''),
  heroAvatarUrl: text('hero_avatar_url').notNull().default(''),
  heroRightDecorUrl: text('hero_right_decor_url').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const schema = {
  users,
  posts,
  projects,
  comments,
  siteSettings
};
