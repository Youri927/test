// Rendu de la page en HTML au moment du build (version de production, voir tools/prerender.mjs).
import { renderToString } from 'react-dom/server'

import App from './App'

export function render() {
  return renderToString(<App />)
}
