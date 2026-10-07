import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Le site est compilé en un seul fichier dist/index.html (scripts, styles, polices et images intégrés),
// à ouvrir d'un double-clic sans serveur.
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  build: { assetsInlineLimit: 100_000_000 },
})
