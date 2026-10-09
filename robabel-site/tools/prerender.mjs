// Version de production : écrit le HTML de la page dans dist-web/index.html (rendu React côté serveur),
// y intègre la feuille de styles, et précharge les deux polices et la photo de l'accueil (lumières éteintes),
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
// Sofia Sans (le texte) et Sofia Sans Extra Condensed (le grand titre de l'accueil)
const fonts = styles ? [...styles.matchAll(/url\((\/assets\/sofia-sans[^)]+\.woff2)\)/g)].map((m) => m[1]) : []
// la photo de l'accueil, lumières éteintes : la grande version sur ordinateur, la version allégée sur téléphone
const js = html.match(/src="\/(assets\/index-[^"]+\.js)"/)?.[1]
const bundle = js ? readFileSync(path.join(root, 'dist-web', js), 'utf8') : ''
const offBig = bundle.match(/\/assets\/off-2560-[\w-]+\.avif/)?.[0]
const offSmall = bundle.match(/\/assets\/off-1440-[\w-]+\.avif/)?.[0]
const preload = [
  ...fonts.map((font) => `<link rel="preload" as="font" type="font/woff2" href="${font}" crossorigin />`),
  offBig && `<link rel="preload" as="image" href="${offBig}" media="(min-width: 900px)" fetchpriority="high" />`,
  offSmall && `<link rel="preload" as="image" href="${offSmall}" media="(max-width: 899px)" fetchpriority="high" />`,
].filter(Boolean)

html = html
  .replace('<html lang="en">', '<html lang="en" data-prerendered>')
  .replace('</title>', `</title>\n    ${preload.join('\n    ')}`)
  .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)
// la feuille de styles (15 Ko compressée) dans la page : une requête bloquante de moins avant le premier affichage
if (styles) {
  html = html.replace(/<link rel="stylesheet"[^>]*href="\/assets\/index-[^"]+\.css"[^>]*>/, () => `<style>${styles}</style>`)
  unlinkSync(path.join(root, 'dist-web', css))
}
writeFileSync(file, html)
console.log(`dist-web/index.html : ${(html.length / 1024).toFixed(0)} Ko, préchargement : ${preload.length} fichiers`)
