import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/** Emits healthz.json: static hosts have no server route to answer a health check. */
function healthz(): Plugin {
  return {
    name: 'healthz',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'healthz.json',
        source: JSON.stringify({ status: 'ok', version: process.env.VITE_APP_VERSION ?? 'dev' }),
      });
    },
  };
}

export default defineConfig({
  plugins: [
    // Must come before the React plugin: it generates src/routeTree.gen.ts and splits route code.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    healthz(),
  ],
  resolve: { tsconfigPaths: true },
  server: { port: 3000, strictPort: true },
  preview: { port: 3000, strictPort: true },
  build: { sourcemap: false },
});
