// Version de production : écrit le HTML de la page dans dist-web/index.html (rendu React côté serveur),
// y intègre la feuille de styles, et précharge la police et l'eau du premier bassin de l'accueil,
// pour que le premier écran s'affiche sans attendre d'autres fichiers.
//   npm run build:web
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const file = path.join(root, 'dist-web/index.html')
const { render } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)

let html = readFileSync(file, 'utf8')
const body = render()
const css = html.match(/href="\/(assets\/index-[^"]+\.css)"/)?.[1]
const styles = css && readFileSync(path.join(root, 'dist-web', css), 'utf8')
const font = styles && styles.match(/url\((\/assets\/familjen-grotesk[^)]+\.woff2)\)/)?.[1]
// le premier bassin de l'accueil est un Billabong Cove en California Shimmer
const js = html.match(/src="\/(assets\/index-[^"]+\.js)"/)?.[1]
const water = js && readFileSync(path.join(root, 'dist-web', js), 'utf8').match(/\/assets\/water-california-[\w-]+\.avif/)?.[0]
const preload = [
  font && `<link rel="preload" as="font" type="font/woff2" href="${font}" crossorigin />`,
  water && `<link rel="preload" as="image" href="${water}" fetchpriority="high" />`,
]
  .filter(Boolean)
  .join('\n    ')

html = html
  .replace('<html lang="en">', '<html lang="en" data-prerendered>')
  .replace('</title>', `</title>\n    ${preload}`)
  .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)
// la feuille de styles (15 Ko compressée) dans la page : une requête bloquante de moins avant le premier affichage
if (styles) {
  html = html.replace(/<link rel="stylesheet"[^>]*href="\/assets\/index-[^"]+\.css"[^>]*>/, () => `<style>${styles}</style>`)
  unlinkSync(path.join(root, 'dist-web', css))
}
writeFileSync(file, html)
console.log(`dist-web/index.html : ${(html.length / 1024).toFixed(0)} Ko, préchargement : ${[font, water].filter(Boolean).length} fichiers`)
