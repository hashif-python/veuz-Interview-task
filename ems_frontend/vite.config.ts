import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,     // change if you want
    open: true,     // auto open browser
    watch: {
      usePolling: true,   // fixes auto-reload issues in WSL/Docker/VMs
    }
  }
});
