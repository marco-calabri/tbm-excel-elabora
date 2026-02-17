
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Usiamo './' per far sì che i percorsi degli asset siano relativi. 
  // Funziona bene sia su domini personalizzati che su sottocartelle di GitHub Pages.
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
