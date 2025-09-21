import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  base: '/neon-meme-machine/',  // GitHub Pages subpath
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep icons in a separate folder
          if (assetInfo.name && assetInfo.name.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)) {
            if (assetInfo.name.includes('icon-')) {
              return 'icons/[name][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  plugins: [
    {
      name: 'copy-icons',
      writeBundle() {
        // Copy icons to the correct location
        const iconsDir = join(process.cwd(), 'dist', 'icons')
        mkdirSync(iconsDir, { recursive: true })
        
        const icons = ['icon-192.png', 'icon-512.png', 'icon-512-maskable.png']
        icons.forEach(icon => {
          try {
            copyFileSync(join(process.cwd(), 'icons', icon), join(iconsDir, icon))
          } catch (error) {
            console.warn(`Could not copy ${icon}:`, error.message)
          }
        })
      }
    }
  ]
})
