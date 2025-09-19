import { defineConfig } from 'vite'

export default defineConfig({
  base: '/neon-meme-machine/',  // GitHub Pages subpath
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
