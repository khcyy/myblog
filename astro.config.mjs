// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://yoursite.com', // 请在这里替换成你未来的实际域名
  integrations: [sitemap()],
});
