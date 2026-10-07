// Version de production : écrit le HTML de la page dans dist-web/index.html (rendu React côté serveur),
// et précharge la photo d'ouverture et la police, pour que le premier écran s'affiche sans attendre le JavaScript.
//   npm run build:web
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const file = path.join(root, 'dist-web/index.html')
const { render } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)

let html = readFileSync(file, 'utf8')
const body = render()
const hero = body.match(/srcSet="([^"]+hero-m[^"]+\.avif)"/)?.[1]
const heroBig = body.match(/src="([^"]+\/hero-[^"]+\.avif)"/)?.[1]
const font = readFileSync(path.join(root, 'dist-web', html.match(/href="\/(assets\/index-[^"]+\.css)"/)[1]), 'utf8').match(/url\((\/assets\/mona-sans[^)]+\.woff2)\)/)?.[1]
const preload = [
  hero && `<link rel="preload" as="image" href="${hero}" media="(max-width: 767px)" fetchpriority="high" />`,
  heroBig && `<link rel="preload" as="image" href="${heroBig}" media="(min-width: 768px)" fetchpriority="high" />`,
  font && `<link rel="preload" as="font" type="font/woff2" href="${font}" crossorigin />`,
].filter(Boolean).join('\n    ')

html = html
  .replace('<html lang="en">', '<html lang="en" data-prerendered>')
  .replace('</title>', `</title>\n    ${preload}`)
  .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
writeFileSync(file, html)
console.log(`dist-web/index.html : ${(html.length / 1024).toFixed(0)} Ko, préchargement : ${[hero, heroBig, font].filter(Boolean).length} fichiers`)
