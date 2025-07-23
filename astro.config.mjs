// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  publicDir: './public',
  vite: {
    // Ensure proper handling of your existing assets
    assetsInclude: ['**/*.obj', '**/*.cur', '**/*.typeface.json']
  }
});
