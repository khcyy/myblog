// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://isishey.pages.dev', // 请在这里替换成你未来的实际域名
  integrations: [sitemap()],
  output: 'hybrid', // 开启混合渲染（静态为主，部分动态API）
  adapter: cloudflare({
    platformProxy: {
      enabled: true // 允许在本地开发环境访问绑定的 D1
    }
  })
});
