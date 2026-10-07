import { readFileSync } from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Les icônes de l'onglet sont écrites directement dans la page (data URL), pour garder un seul fichier.
const inlineIcons = (): Plugin => ({
  name: 'inline-icons',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) =>
      html.replace(/href="\/(src\/assets\/brand\/[\w-]+\.png)"/g, (_, file) => {
        const data = readFileSync(path.resolve(import.meta.dirname, file)).toString('base64')
        return `href="data:image/png;base64,${data}"`
      }),
  },
})

// Le site est compilé en un seul fichier dist/index.html (scripts, styles, polices et images intégrés),
// à ouvrir d'un double-clic sans serveur.
export default defineConfig({
  plugins: [inlineIcons(), react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  build: { assetsInlineLimit: 100_000_000 },
})
