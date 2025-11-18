import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Removed lucide-react exclusion to fix forwardRef error
  },
  build: {
    chunkSizeWarningLimit: 700000,
    // Temporarily removed manual chunks to fix forwardRef error
  },
});
