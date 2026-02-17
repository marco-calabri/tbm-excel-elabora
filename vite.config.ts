import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Usiamo './' per rendere i percorsi degli asset relativi al file index.html.
  // Essenziale per GitHub Pages (es. tuoutente.github.io/nome-repo/).
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false
  }
});