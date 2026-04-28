import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Use project base for GitHub Pages under /ResumeBuilder/
  base: '/ResumeBuilder/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    // Smaller deploy; use browser devtools without maps in prod
    sourcemap: false,
    // html2canvas + jsPDF chunk is large by design (loaded only on PDF export)
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})
