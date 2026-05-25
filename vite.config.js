import path from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { crx } from '@crxjs/vite-plugin';
import zip from 'vite-plugin-zip-pack';
import manifest from './manifest.config';

export default defineConfig({
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}`,
    },
  },
  server: {
    strictPort: true,
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
  build: {
    rollupOptions: {
      input: {
        offscreen: path.resolve(__dirname, 'src/background/background.html'),
      },
    },
  },
  plugins: [
    vue(),
    crx({ manifest }),
    // https://www.npmjs.com/package/vite-plugin-zip-pack
    zip({ outDir: 'release', outFileName: `crx-${manifest.version}.zip` }),
  ],
});
