// Version de production : écrit le HTML de la page dans dist-web/index.html (rendu React côté serveur),
// y intègre la feuille de styles, et précharge la police et l'image d'attente de la vidéo de l'accueil,
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
// Jost, la seule police du site (un fichier pour toutes les graisses)
const fonts = styles ? [...new Set([...styles.matchAll(/url\((\/assets\/jost[^)]+\.woff2)\)/g)].map((m) => m[1]))] : []
// l'image d'attente de la vidéo de Holmes Beach, affichée avant la première image de la vidéo
const poster = body.match(/poster="(\/assets\/hero-poster-[\w-]+\.avif)"/)?.[1]
const preload = [
  ...fonts.map((font) => `<link rel="preload" as="font" type="font/woff2" href="${font}" crossorigin />`),
  poster && `<link rel="preload" as="image" href="${poster}" fetchpriority="high" />`,
].filter(Boolean)

html = html
  .replace('<html lang="en">', '<html lang="en" data-prerendered>')
  .replace('</title>', `</title>\n    ${preload.join('\n    ')}`)
  .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)
// la feuille de styles dans la page : une requête bloquante de moins avant le premier affichage
if (styles) {
  html = html.replace(/<link rel="stylesheet"[^>]*href="\/assets\/index-[^"]+\.css"[^>]*>/, () => `<style>${styles}</style>`)
  unlinkSync(path.join(root, 'dist-web', css))
}
writeFileSync(file, html)
console.log(`dist-web/index.html : ${(html.length / 1024).toFixed(0)} Ko, préchargement : ${preload.length} fichiers`)
