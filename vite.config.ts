import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/temp/**']
    }
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web', '@xenova/transformers'],
    entries: ['index.html', 'src/**/*.{ts,tsx}']
  },
  build: {
    target: 'esnext',
  }
});
