// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  publicDir: './public',

  vite: {
    // Ensure proper handling of your existing assets
    assetsInclude: ['**/*.obj', '**/*.cur', '**/*.typeface.json']
  },



  integrations: [react()]
});