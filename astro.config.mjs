import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://defcoms.eu',
  trailingSlash: 'never',
  build: { format: 'file' },
});
