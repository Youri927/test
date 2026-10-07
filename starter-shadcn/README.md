# Starter React + shadcn/ui (sites clients)

Base de départ pour les prochains sites : **React + Tailwind 4 + shadcn/ui + GSAP + Lenis**, compilée en **un seul fichier HTML** (`dist/index.html`) qu'on ouvre d'un double-clic, sans serveur, comme les maquettes précédentes.

## Démarrer un nouveau site

1. Copier ce dossier sous un nouveau nom, par exemple `cp -r starter-shadcn nom-du-client-site`, sans `node_modules` ni `dist`.
2. `npm install`
3. Régler le **bloc MARQUE** en haut de `src/index.css` :
   - couleurs du logo du client : `--brand`, `--brand-foreground`, `--ink` ;
   - polices (`--font-heading`, `--font-sans`), avec le paquet `@fontsource-variable/...` correspondant.
4. Remplacer tout le contenu de `src/App.tsx` (la page de démonstration) par le vrai site.
5. `npm run dev` pour travailler, puis `npm run build` pour produire `dist/index.html`.

## Ce qu'il contient

| Fichier | Rôle |
| --- | --- |
| `src/lib/motion.ts` | défilement fluide (Lenis) synchronisé avec GSAP ScrollTrigger ; `pauseScroll()` pour les fenêtres et menus ; `scrollToId()` ; rien ne bouge si le visiteur a réduit les animations |
| `src/components/lines.tsx` | titres qui apparaissent ligne par ligne (découpage sur les vraies lignes, refait au redimensionnement) |
| `src/components/ui/` | composants shadcn : button (+ variante `brand` et taille `xl`), input, label, textarea, radio-group, sheet (menu mobile), dialog (visionneuse), accordion, tabs |
| `components.json` | configuration shadcn (style radix-nova, icônes Lucide, alias `@/`) |
| `vite.config.ts` | Tailwind, alias `@/`, et `vite-plugin-singlefile` (tout est intégré dans le HTML) |

Ajouter un composant : `npx shadcn@latest add carousel`, ou le demander à Claude, qui utilise le skill et le serveur MCP shadcn du dépôt.

Catalogues branchés :
- **shadcn/ui**, les composants de base ;
- **Aceternity UI** (`@aceternity`, déclaré dans `components.json`), des composants animés : `npx shadcn@latest add @aceternity/nom-du-composant` ;
- **Magic UI** (`@magicui`, déclaré dans `components.json`), des effets et composants animés : `npx shadcn@latest add @magicui/nom-du-composant` ;
- **Tailark** (`@tailark`, déclaré dans `components.json`), des blocs de pages marketing. La recherche est libre, mais les blocs (264 sur 476 éléments) demandent un abonnement Tailark ;
- **21st.dev**, par le serveur MCP 21st du dépôt (clé dans la variable d'environnement `API_KEY_21ST`).

Les composants Aceternity et Magic UI utilisent souvent la bibliothèque `motion`, ou des effets de flou et de lueur : à choisir avec soin et à restyler, pour garder le rendu sur mesure et fluide.

## Règles pour garder un rendu sur mesure

- Les composants shadcn servent à la **mécanique** : formulaires, menus, fenêtres, onglets, accordéons. On les restyle dans `src/components/ui/`, ce sont nos fichiers.
- La **direction artistique** reste sur mesure :
  - ouverture, mise en page, typographie, photos réelles et animations ;
  - pas de blocs « hero » ou « landing » tout faits tels quels ;
  - pas de dégradés, d'effet verre ni d'étiquettes en capitales.
- Les animations n'utilisent que les transformations et l'opacité.

## Vérifié

Fichier unique de 590 Ko, testé sans erreur dans le navigateur :
- sur ordinateur et sur mobile à 390 px ;
- avec et sans réduction des animations ;
- polices intégrées, menu mobile, fenêtre photo et formulaire fonctionnels.
