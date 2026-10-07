import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Version de production : le HTML est pré-généré (tools/prerender.mjs), React le reprend tel quel.
// Fichier unique : la page est construite dans le navigateur.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
