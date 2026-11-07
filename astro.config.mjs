// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://abhinai.github.io',
  integrations: [sitemap()],
  trailingSlash: 'ignore',
  // Local dev/preview on the home server, reached over the VPN
  server: { allowedHosts: ['bilbo.vpn'] },
});
