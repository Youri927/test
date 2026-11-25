/* Respray : le prototype. Une page, cinq vues appelées par l'adresse : #accueil, #recherche, #annonce-a101, #vendre,
   #fonctionnement. Rien n'est envoyé nulle part. */
(() => {
  'use strict';

  const P = Object.fromEntries(PARFUMS.map((p) => [p.id, p]));
  const A = Object.fromEntries(ANNONCES.map((a) => [a.id, a]));
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const nb = (n, d = 0) => n.toLocaleString('fr-FR', {minimumFractionDigits: d, maximumFractionDigits: d});
  const eur = (n) => (Number.isInteger(n) ? nb(n) : nb(n, 2)) + ' €';
  const eur2 = (n) => nb(n, 2) + ' €';
  const mlRestants = (a) => Math.round((a.ml * a.niveau) / 100);
  const prixMl = (a) => a.prix / mlRestants(a);
  const protection = (prix) => Math.round((prix * 0.05 + 0.7) * 100) / 100;
  const ENVOI = 4.9;
  const normal = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const memoire = {
    lire(k, d) {
      try {
        return JSON.parse(localStorage.getItem('respray:' + k)) ?? d;
      } catch (e) {
        return d;
      }
    },
    ecrire(k, v) {
      try {
        localStorage.setItem('respray:' + k, JSON.stringify(v));
      } catch (e) {
        /* stockage indisponible : les favoris restent en mémoire */
      }
    },
  };
  const favoris = new Set(memoire.lire('favoris', []));

  /* ——— les visuels : ils tiennent la place des photos du vendeur ——— */
  let uid = 0;
  const teinte = (hex, k) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  };
  const FORMES = {
    tour: {corps: [31, 66, 58, 124, 7], col: [50, 54, 20, 14], bouchon: [41, 14, 38, 42, 4]},
    carre: {corps: [15, 90, 90, 100, 12], col: [47, 78, 26, 14], bouchon: [35, 38, 50, 42, 4]},
    galet: {corps: [15, 82, 90, 108, 44], col: [50, 68, 20, 16], bouchon: [38, 30, 44, 40, 20]},
    cylindre: {corps: [32, 60, 56, 130, 14], col: [52, 50, 16, 12], bouchon: [43, 12, 34, 40, 8]},
    apothicaire: {corps: [24, 76, 72, 114, 5], col: [46, 60, 28, 18], bouchon: [44, 26, 32, 36, 2], etiquette: true},
    facette: {chemin: 'M24 86 H96 L106 126 L98 190 H22 L14 126 Z', corps: [14, 86, 92, 104], col: [49, 72, 22, 16], bouchon: [38, 30, 44, 44, 3]},
  };
  function flacon(p, niveau, id) {
    const f = FORMES[p.forme];
    const [x, y, w, h, r] = f.corps;
    const forme = f.chemin ? `<path d="${f.chemin}"/>` : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
    const haut = y + 8;
    const bas = y + h - 7;
    const surface = bas - (niveau / 100) * (bas - haut);
    const [bx, by, bw, bh, br] = f.bouchon;
    const [cx, cy, cw, ch] = f.col;
    return `<defs>
        <clipPath id="c${id}">${forme}</clipPath>
        <linearGradient id="v${id}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".45" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>
        <linearGradient id="j${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${teinte(p.jus, 0.18)}"/><stop offset="1" stop-color="${teinte(p.jus, -0.12)}"/></linearGradient>
        <linearGradient id="b${id}" x1="0" x2="1"><stop offset="0" stop-color="${teinte(p.bouchon, 0.28)}"/><stop offset=".5" stop-color="${p.bouchon}"/><stop offset="1" stop-color="${teinte(p.bouchon, -0.22)}"/></linearGradient>
      </defs>
      <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="2" fill="url(#v${id})" stroke="rgba(0,0,0,.16)" stroke-width=".8"/>
      <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${br}" fill="url(#b${id})"/>
      <g clip-path="url(#c${id})">
        <rect x="0" y="0" width="120" height="200" fill="url(#v${id})"/>
        <rect x="0" y="${surface}" width="120" height="${200 - surface}" fill="url(#j${id})"/>
        <rect x="0" y="${surface}" width="120" height="1.4" fill="#fff" opacity=".55"/>
        <rect x="${x + 7}" y="${y + 10}" width="5" height="${h - 30}" rx="2.5" fill="#fff" opacity=".5"/>
        <rect x="${x + w - 9}" y="${y + 6}" width="9" height="${h}" fill="#000" opacity=".05"/>
      </g>
      <g fill="none" stroke="rgba(0,0,0,.2)" stroke-width=".9">${forme}</g>
      ${f.etiquette ? `<rect x="${x + 12}" y="${y + 36}" width="${w - 24}" height="44" rx="1" fill="#faf8f4" stroke="rgba(0,0,0,.12)" stroke-width=".6"/><rect x="${x + 18}" y="${y + 47}" width="${w - 36}" height="3" fill="#555" opacity=".5"/><rect x="${x + 18}" y="${y + 56}" width="${w - 48}" height="2" fill="#555" opacity=".4"/>` : ''}`;
  }
  /* vue : 'face', 'niveau' (gros plan), 'dessous', 'boite', 'preuve' */
  function visuel(a, vue = 'face', classe = '') {
    const p = P[a.p];
    const id = ++uid;
    const v = VENDEURS[a.v];
    const sol = `<defs><radialGradient id="l${id}" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <linearGradient id="t${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".07"/></linearGradient>
      <filter id="o${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter></defs>
      <rect width="300" height="375" fill="${a.fond}"/><rect y="250" width="300" height="125" fill="url(#t${id})"/><rect width="300" height="375" fill="url(#l${id})"/>`;
    let scene;
    let vb = '0 0 300 375';
    if (vue === 'dessous') {
      scene = `<ellipse cx="150" cy="188" rx="104" ry="104" fill="#fff" opacity=".55" stroke="rgba(0,0,0,.14)"/><ellipse cx="150" cy="188" rx="84" ry="84" fill="${teinte(p.jus, 0.35)}" opacity=".7"/>
        <text x="150" y="182" text-anchor="middle" class="grave">${esc(a.lot)}</text><text x="150" y="206" text-anchor="middle" class="grave grave-petit">${a.ml} ml e</text>`;
    } else if (vue === 'boite') {
      scene = `<ellipse cx="150" cy="332" rx="92" ry="9" fill="#000" opacity=".16" filter="url(#o${id})"/>
        <path d="M78 86 L110 66 H232 L200 86 Z" fill="#f4f1ec" stroke="rgba(0,0,0,.12)"/><path d="M200 86 L232 66 V312 L200 332 Z" fill="#e4e0da" stroke="rgba(0,0,0,.12)"/>
        <rect x="78" y="86" width="122" height="246" fill="#faf8f5" stroke="rgba(0,0,0,.12)"/>
        <rect x="100" y="150" width="78" height="3" fill="#444" opacity=".55"/><rect x="110" y="162" width="58" height="2" fill="#444" opacity=".4"/>
        <g fill="#333" opacity=".7">${[0, 3, 5, 9, 11, 14, 17, 19, 22, 25, 27, 30].map((k) => `<rect x="${130 + k * 1.6}" y="292" width="${k % 3 ? 0.9 : 1.6}" height="22"/>`).join('')}</g>`;
    } else {
      const s = 1.25;
      const ox = (300 - 120 * s) / 2;
      const oy = 72;
      scene = `<ellipse cx="150" cy="${oy + 190 * s + 4}" rx="66" ry="8" fill="#000" opacity=".2" filter="url(#o${id})"/>
        <g transform="translate(${ox} ${oy}) scale(${s})">${flacon(p, a.niveau, id)}</g>`;
      if (vue === 'niveau') vb = '70 150 160 200';
      if (vue === 'preuve') {
        scene = `<g transform="translate(-48 18) scale(.9)">${scene}</g>
          <g transform="rotate(-6 214 270)"><rect x="160" y="230" width="112" height="82" rx="2" fill="#fffef9" stroke="rgba(0,0,0,.1)"/>
          <text x="172" y="262" class="main-ecrite">@${esc(v.pseudo)}</text><text x="172" y="290" class="main-ecrite">24/11/2026</text></g>`;
      }
    }
    return `<svg class="visuel ${classe}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(`${p.nom}, ${VUES_PHOTO[vue]}`)}">${sol}${scene}</svg>`;
  }
  const VUES_PHOTO = {face: 'le flacon de face', dessous: 'le dessous du flacon et le code lot', niveau: 'le niveau', boite: 'la boîte', preuve: 'le flacon avec le pseudo du vendeur et la date'};

  /* ——— éléments communs ——— */
  const coeur = (id) => `<button class="coeur" type="button" data-fav="${id}" aria-pressed="${favoris.has(id)}" aria-label="Ajouter aux favoris"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-9.6A4 4 0 0 1 12 7.6a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20z"/></svg></button>`;
  const etatTexte = (a) => (a.etat === 'blister' ? 'Neuf sous blister' : `Reste environ ${a.niveau} %`);
  function carte(a) {
    const p = P[a.p];
    return `<article class="carte">
      <a class="carte-lien" href="#annonce-${a.id}">
        <div class="carte-photo">${visuel(a)}${a.etat === 'blister' ? '<span class="etiq">Neuf sous blister</span>' : ''}</div>
        <p class="carte-prix">${eur(a.prix)}</p>
        <h3 class="carte-nom">${esc(p.nom)}</h3>
        <p class="carte-maison">${esc(p.maison)}</p>
        <p class="carte-meta">${a.ml} ml · ${a.etat === 'blister' ? 'neuf' : `reste ~${a.niveau} %`}</p>
      </a>${coeur(a.id)}
    </article>`;
  }
  const ICO = {
    photo: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    oeil: '<path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    cadenas: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    calendrier: '<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    loupe: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    croix: '<path d="M6 6l12 12M18 6L6 18"/>',
    fleche: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  };
  const ico = (n) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICO[n]}</svg>`;

  /* ——— accueil ——— */
  const VUES = {};
  VUES.accueil = () => {
    const recentes = [...ANNONCES].sort((x, y) => x.jours - y.jours);
    const marques = [...new Set(PARFUMS.map((p) => p.maison))];
    return `
    <section class="hero env">
      <div class="hero-texte">
        <h1>Achetez et revendez vos parfums entre particuliers.</h1>
        <p class="chapo">Chaque annonce est vérifiée par notre équipe avant d'être publiée. À la réception, vous avez 7 jours pour vérifier votre parfum.</p>
        <form class="cherche-grand" data-form="recherche" role="search">
          <label class="vh" for="q-hero">Rechercher un parfum ou une marque</label>
          ${ico('loupe')}<input id="q-hero" name="q" type="search" placeholder="Rechercher un parfum ou une marque" autocomplete="off">
          <button class="btn btn-noir" type="submit">Rechercher</button>
        </form>
        <ul class="garanties">
          <li>${ico('check')}Annonces vérifiées</li><li>${ico('check')}Paiement sécurisé</li><li>${ico('check')}7 jours pour vérifier</li>
        </ul>
      </div>
      <div class="hero-photos">${recentes
        .filter((a) => a.etat === 'entame')
        .slice(0, 4)
        .map((a) => `<a href="#annonce-${a.id}" class="hero-photo">${visuel(a)}<span>${eur(a.prix)}</span></a>`)
        .join('')}</div>
    </section>

    <section class="section env">
      <div class="section-tete"><h2>Dernières annonces</h2><a class="lien" href="#recherche">Tout voir ${ico('fleche')}</a></div>
      <div class="grille">${recentes.slice(0, 8).map(carte).join('')}</div>
    </section>

    <section class="section env">
      <div class="section-tete"><h2>Marques</h2></div>
      <div class="puces">${marques.map((m) => `<a class="puce" href="#recherche" data-marque="${esc(m)}">${esc(m)}</a>`).join('')}</div>
    </section>

    <section class="section env">
      <div class="section-tete"><h2>Comment ça marche</h2><a class="lien" href="#fonctionnement">En savoir plus ${ico('fleche')}</a></div>
      <div class="deux">
        <div class="etapes-bloc"><h3>Vous vendez</h3><ol class="etapes">
          <li><strong>Prenez les photos demandées.</strong> Le flacon de face, le dessous avec le code lot, le niveau, et une photo avec votre pseudo et la date.</li>
          <li><strong>Notre équipe vérifie l'annonce.</strong> En quelques heures, puis elle est en ligne.</li>
          <li><strong>Envoyez et soyez payé.</strong> Dès que l'acheteur confirme, ou 7 jours après la livraison.</li>
        </ol></div>
        <div class="etapes-bloc"><h3>Vous achetez</h3><ol class="etapes">
          <li><strong>Trouvez votre parfum</strong> par marque, contenance ou prix.</li>
          <li><strong>Payez en toute sécurité.</strong> L'argent reste bloqué jusqu'à la fin de votre vérification.</li>
          <li><strong>Vérifiez-le pendant 7 jours.</strong> S'il n'est pas conforme à l'annonce, vous êtes remboursé.</li>
        </ol></div>
      </div>
    </section>

    <section class="section env">
      <div class="bandeau-vendre">
        <div><h2>Vendre est gratuit.</h2><p>Aucune commission pour le vendeur : vous touchez le prix affiché.</p></div>
        <a class="btn btn-noir" href="#vendre">Vendre un parfum</a>
      </div>
    </section>`;
  };

  /* ——— recherche ——— */
  const R = {q: '', marques: new Set(), genre: 'tous', etat: 'tous', taille: 'tous', prixMax: 300, mainPropre: false, tri: 'recent'};
  function filtrer() {
    const q = normal(R.q.trim());
    return ANNONCES.filter((a) => {
      const p = P[a.p];
      if (q && !normal(`${p.maison} ${p.nom} ${p.famille} ${p.notes}`).includes(q)) return false;
      if (R.marques.size && !R.marques.has(p.maison)) return false;
      if (R.genre !== 'tous' && p.genre !== R.genre) return false;
      if (R.etat !== 'tous' && a.etat !== R.etat) return false;
      if (R.taille === 'petit' && a.ml > 50) return false;
      if (R.taille === 'moyen' && (a.ml <= 50 || a.ml > 100)) return false;
      if (R.taille === 'grand' && a.ml <= 100) return false;
      if (a.prix > R.prixMax) return false;
      if (R.mainPropre && !a.mainPropre) return false;
      return true;
    }).sort({recent: (x, y) => x.jours - y.jours, asc: (x, y) => x.prix - y.prix, desc: (x, y) => y.prix - x.prix, ml: (x, y) => prixMl(x) - prixMl(y)}[R.tri]);
  }
  const radios = (nom, val, choix) => choix.map(([v, l]) => `<label class="choix"><input type="radio" name="${nom}" value="${v}" ${val === v ? 'checked' : ''}> ${l}</label>`).join('');
  VUES.recherche = () => {
    const marques = [...new Set(PARFUMS.map((p) => p.maison))].sort((x, y) => x.localeCompare(y, 'fr'));
    return `<div class="env page">
      <h1 class="titre-page">${R.q ? `Résultats pour « ${esc(R.q)} »` : 'Tous les parfums'}</h1>
      <div class="recherche">
        <details class="filtres" ${matchMedia('(min-width: 961px)').matches ? 'open' : ''}>
          <summary>Filtres</summary>
          <form data-form="filtres">
            <label class="vh" for="q-filtre">Parfum ou marque</label>
            <input id="q-filtre" class="champ" name="q" type="search" value="${esc(R.q)}" placeholder="Parfum ou marque" autocomplete="off">
            <fieldset><legend>Pour</legend>${radios('genre', R.genre, [['tous', 'Tous'], ['Femme', 'Femme'], ['Homme', 'Homme'], ['Mixte', 'Mixte']])}</fieldset>
            <fieldset><legend>État</legend>${radios('etat', R.etat, [['tous', 'Tous'], ['blister', 'Neuf sous blister'], ['entame', 'Entamé']])}</fieldset>
            <fieldset><legend>Contenance</legend>${radios('taille', R.taille, [['tous', 'Toutes'], ['petit', '50 ml ou moins'], ['moyen', '51 à 100 ml'], ['grand', 'Plus de 100 ml']])}</fieldset>
            <fieldset><legend>Prix maximum : <output id="prix-max-out">${eur(R.prixMax)}</output></legend><input id="prix-max" name="prixMax" type="range" min="20" max="300" step="10" value="${R.prixMax}" aria-label="Prix maximum"></fieldset>
            <fieldset><legend>Marque</legend>${marques.map((m, i) => `<label class="choix"><input type="checkbox" name="marque" value="${esc(m)}" id="m-${i}" ${R.marques.has(m) ? 'checked' : ''}> ${esc(m)}</label>`).join('')}</fieldset>
            <label class="choix"><input type="checkbox" name="mainPropre" ${R.mainPropre ? 'checked' : ''}> Remise en main propre possible</label>
            <button class="btn btn-petit" type="button" data-action="effacer">Effacer les filtres</button>
          </form>
        </details>
        <div id="resultats">${resultats()}</div>
      </div>
    </div>`;
  };
  function resultats() {
    const l = filtrer();
    return `<div class="resultats-tete"><p>${l.length} annonce${l.length > 1 ? 's' : ''}</p>
      <label class="tri">Trier par <select id="tri" class="champ" data-tri>${[['recent', 'Plus récentes'], ['asc', 'Prix croissant'], ['desc', 'Prix décroissant'], ['ml', 'Prix au ml']].map(([v, t]) => `<option value="${v}" ${R.tri === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
      ${l.length ? `<div class="grille grille-3">${l.map(carte).join('')}</div>` : '<div class="vide"><p>Aucune annonce ne correspond à ces filtres.</p><button class="btn btn-petit" type="button" data-action="effacer">Effacer les filtres</button></div>'}`;
  }

  /* ——— annonce ——— */
  let achat = {mode: 'envoi'};
  VUES.annonce = (id) => {
    const a = A[id];
    if (!a) return VUES.introuvable();
    const p = P[a.p];
    const v = VENDEURS[a.v];
    achat = {mode: 'envoi'};
    const vues = ['face', 'dessous', 'niveau', ...(a.boite ? ['boite'] : []), 'preuve'];
    const autres = ANNONCES.filter((x) => x.p === a.p && x.id !== a.id);
    const fmt = p.formats.find((f) => f.ml === a.ml);
    return `<div class="env page">
      <nav class="fil" aria-label="Fil d'Ariane"><a href="#recherche">Parfums</a><span aria-hidden="true">›</span><a href="#recherche" data-marque="${esc(p.maison)}">${esc(p.maison)}</a><span aria-hidden="true">›</span><span>${esc(p.nom)}</span></nav>
      <div class="annonce">
        <div class="galerie">
          <div class="galerie-grande" id="grande">${visuel(a, 'face')}</div>
          <div class="galerie-mini" role="group" aria-label="Photos de l'annonce">${vues.map((x, i) => `<button type="button" class="mini" data-vue="${x}" aria-pressed="${i === 0}" aria-label="Voir ${VUES_PHOTO[x]}">${visuel(a, x)}</button>`).join('')}</div>
        </div>
        <div class="fiche">
          <p class="fiche-maison"><a href="#recherche" data-marque="${esc(p.maison)}">${esc(p.maison)}</a></p>
          <h1>${esc(p.nom)}</h1>
          <p class="fiche-sous">${esc(p.conc)} · ${a.ml} ml</p>
          <p class="fiche-prix">${eur(a.prix)}</p>
          <p class="fiche-ml">${a.etat === 'blister' ? 'Neuf' : `Environ ${mlRestants(a)} ml restants`} · ${nb(prixMl(a), 2)} €/ml${fmt ? ` · neuf : ${eur(fmt.neuf)}` : ''}</p>
          <dl class="details">
            <div><dt>État</dt><dd>${etatTexte(a)}</dd></div>
            <div><dt>Boîte</dt><dd>${a.boite ? 'Oui' : 'Non'}</dd></div>
            <div><dt>Code lot</dt><dd>${esc(a.lot)}</dd></div>
            <div><dt>Acheté en</dt><dd>${a.achat}</dd></div>
            <div><dt>Famille</dt><dd>${esc(p.famille)}</dd></div>
          </dl>
          <fieldset class="livraison"><legend>Livraison</legend>
            <label class="option"><input type="radio" name="mode" value="envoi" checked data-mode> <span>Envoi suivi en point relais<small>2 à 4 jours</small></span><span>${eur2(ENVOI)}</span></label>
            ${a.mainPropre ? `<label class="option"><input type="radio" name="mode" value="main" data-mode> <span>Remise en main propre<small>${esc(v.ville)} · vous payez en ligne, l'argent est versé quand vous validez sur place</small></span><span>Gratuit</span></label>` : ''}
          </fieldset>
          <div id="total">${total(a)}</div>
          <div class="boutons">
            <button class="btn btn-noir btn-large" type="button" data-action="acheter" data-a="${a.id}">Acheter</button>
            <button class="btn btn-large" type="button" data-action="offre" data-a="${a.id}">Faire une offre</button>
          </div>
          <div class="protection">
            <h2>${ico('cadenas')}Protection acheteur</h2>
            <p>Votre paiement reste bloqué jusqu'à ce que vous ayez vérifié le parfum. Vous avez <strong>7 jours après la livraison</strong> : s'il n'est pas conforme à l'annonce, vous êtes remboursé.</p>
          </div>
          <a class="vendeur" href="#recherche">
            <span class="avatar" aria-hidden="true">${esc(v.pseudo[0].toUpperCase())}</span>
            <span><strong>${esc(v.pseudo)}</strong><small>${v.note ? `★ ${nb(v.note, 1)} · ${v.avis} avis · ${v.ventes} ventes` : 'Nouveau vendeur'}</small><small>${esc(v.ville)} · répond ${v.reponse}</small></span>
          </a>
        </div>
      </div>

      <div class="annonce-bas">
        <section><h2 class="h2">Description</h2><p>${esc(a.desc)}</p></section>
        <section class="verifiee"><h2 class="h2">${ico('check')}Annonce vérifiée par l'équipe</h2>
          <ul><li>Les photos demandées sont présentes et nettes</li><li>Le code lot correspond au format de la marque</li><li>Le flacon et le bouchon correspondent aux modèles connus</li><li>Le niveau visible correspond à l'annonce</li><li>La photo avec le pseudo et la date prouve que le vendeur a le flacon</li></ul>
        </section>
      </div>
      ${autres.length ? `<section class="section"><div class="section-tete"><h2>Autres annonces de ${esc(p.nom)}</h2></div><div class="grille">${autres.map(carte).join('')}</div></section>` : ''}
    </div>`;
  };
  function total(a) {
    const port = achat.mode === 'envoi' ? ENVOI : 0;
    const pr = protection(a.prix);
    return `<dl class="total">
      <div><dt>Parfum</dt><dd>${eur2(a.prix)}</dd></div>
      <div><dt>Protection acheteur</dt><dd>${eur2(pr)}</dd></div>
      <div><dt>Livraison</dt><dd>${port ? eur2(port) : 'Gratuit'}</dd></div>
      <div class="total-ligne"><dt>Total</dt><dd>${eur2(a.prix + pr + port)}</dd></div>
    </dl>`;
  }

  /* ——— vendre ——— */
  const PHOTOS = [
    {k: 'face', t: 'Le flacon de face', d: 'Bien droit, étiquette lisible.', obl: true},
    {k: 'dessous', t: 'Le dessous du flacon', d: 'Le code lot gravé ou imprimé doit se lire.', obl: true},
    {k: 'niveau', t: 'Le niveau', d: 'À hauteur des yeux, sur un fond clair.', obl: true},
    {k: 'preuve', t: 'Votre pseudo et la date', d: 'Le flacon à côté d\'un papier où vous les avez écrits.', obl: true},
    {k: 'boite', t: 'La boîte', d: 'Avec le code lot et le code-barres, si vous l\'avez.', obl: false},
    {k: 'ticket', t: 'Le ticket ou la facture', d: 'Facultatif, mais rassurant pour l\'acheteur.', obl: false},
  ];
  const V = {p: '', ml: '', etat: 'entame', niveau: 80, boite: 'oui', prix: '', photos: {}, envoye: false};
  VUES.vendre = () => {
    if (V.envoye) return vendreEnvoye();
    const p = P[V.p];
    const prixAnnonces = p ? ANNONCES.filter((a) => a.p === p.id).map((a) => a.prix) : [];
    const manquantes = PHOTOS.filter((x) => x.obl && !V.photos[x.k]).length;
    return `<div class="env page vendre">
      <h1 class="titre-page">Vendre un parfum</h1>
      <p class="chapo">Gratuit, sans commission. Votre annonce est vérifiée par notre équipe avant d'être publiée, en général en quelques heures.</p>
      <form class="formulaire" data-form="vendre" novalidate>
        <section class="bloc-form">
          <h2 class="h2">Le parfum</h2>
          <label for="parfum">Quel parfum vendez-vous ?</label>
          <select id="parfum" name="p" class="champ" data-champ="p"><option value="">Choisir dans la liste</option>${PARFUMS.map((x) => `<option value="${x.id}" ${V.p === x.id ? 'selected' : ''}>${esc(x.maison)} · ${esc(x.nom)} (${esc(x.conc)})</option>`).join('')}</select>
          <p class="aide">Le parfum n'est pas dans la liste ? Écrivez-nous, on l'ajoute dans la journée.</p>
          ${p ? `<div class="ligne-champs">
            <div><label for="ml">Contenance</label><select id="ml" name="ml" class="champ" data-champ="ml"><option value="">Choisir</option>${p.formats.map((f) => `<option value="${f.ml}" ${+V.ml === f.ml ? 'selected' : ''}>${f.ml} ml</option>`).join('')}</select></div>
            <div><label for="boite">Boîte d'origine</label><select id="boite" name="boite" class="champ" data-champ="boite"><option value="oui" ${V.boite === 'oui' ? 'selected' : ''}>Oui</option><option value="non" ${V.boite === 'non' ? 'selected' : ''}>Non</option></select></div>
          </div>
          <fieldset><legend>État</legend><div class="segment">${radios('etat', V.etat, [['blister', 'Neuf sous blister'], ['entame', 'Entamé']]).replace(/name="etat"/g, 'name="etat" data-champ="etat"')}</div></fieldset>
          ${V.etat === 'entame' ? `<label for="niveau">Il reste environ <output id="niveau-out">${V.niveau} %</output></label><input id="niveau" name="niveau" type="range" min="10" max="100" step="5" value="${V.niveau}" data-champ="niveau">` : ''}` : ''}
        </section>

        <section class="bloc-form">
          <h2 class="h2">Les photos</h2>
          <p class="aide">Ces photos nous permettent de vérifier votre parfum avant de publier l'annonce. Les quatre premières sont obligatoires.</p>
          <div class="photos">${PHOTOS.map((x) => `<label class="photo ${V.photos[x.k] ? 'faite' : ''}">
              <input class="vh" type="file" accept="image/*" data-photo="${x.k}">
              <span class="photo-cadre">${V.photos[x.k] ? (V.photos[x.k] === true ? ico('check') : `<img src="${V.photos[x.k]}" alt="">`) : ico('photo')}</span>
              <span class="photo-txt"><strong>${x.t}${x.obl ? '' : ' <em>facultatif</em>'}</strong><small>${x.d}</small></span>
            </label>`).join('')}</div>
          <button class="btn btn-petit" type="button" data-action="photos-exemple">Ajouter des photos d'exemple</button>
        </section>

        <section class="bloc-form">
          <h2 class="h2">Le prix</h2>
          <label for="prix">Votre prix</label>
          <div class="champ-prix"><input id="prix" name="prix" class="champ" inputmode="decimal" value="${esc(V.prix)}" placeholder="0" data-champ="prix"><span>€</span></div>
          ${prixAnnonces.length ? `<p class="aide">Annonces actuelles de ce parfum : de ${eur(Math.min(...prixAnnonces))} à ${eur(Math.max(...prixAnnonces))}.</p>` : ''}
          <p class="aide" id="recu">${V.prix ? `Vous recevrez ${eur2(parseFloat(String(V.prix).replace(',', '.')) || 0)} : aucune commission.` : 'Vous recevez la totalité du prix : aucune commission.'}</p>
        </section>

        <p class="erreur" id="erreur" role="alert" hidden></p>
        <button class="btn btn-noir btn-large" type="submit">Envoyer à la vérification</button>
        <p class="aide">${manquantes ? `Il manque ${manquantes} photo${manquantes > 1 ? 's' : ''} obligatoire${manquantes > 1 ? 's' : ''}.` : 'Toutes les photos obligatoires sont là.'}</p>
      </form>
    </div>`;
  };
  function vendreEnvoye() {
    const p = P[V.p];
    return `<div class="env page vendre">
      <div class="envoye">
        <span class="rond-ok">${ico('check')}</span>
        <h1 class="titre-page">Annonce envoyée à la vérification</h1>
        <p class="chapo">${esc(p.nom)}, ${V.ml} ml, ${eur(parseFloat(String(V.prix).replace(',', '.')))}. Notre équipe vérifie vos photos, en général en quelques heures. Vous recevez une notification dès qu'elle est en ligne.</p>
        <p class="aide">Si une photo ne permet pas de vérifier le parfum, on vous dit laquelle refaire.</p>
        <div class="boutons"><a class="btn btn-noir" href="#accueil">Retour à l'accueil</a><button class="btn" type="button" data-action="nouvelle">Vendre un autre parfum</button></div>
      </div>
    </div>`;
  }

  /* ——— comment ça marche ——— */
  VUES.fonctionnement = () => {
    const ex = A.a101;
    return `<div class="env page lecture">
    <h1 class="titre-page">Comment ça marche</h1>
    <p class="chapo">Respray met en relation des particuliers qui vendent et achètent des parfums. On vérifie chaque annonce avant de la publier, et on garde l'argent de l'acheteur jusqu'à ce qu'il ait vérifié le parfum.</p>

    <section class="section">
      <h2 class="h2">Les photos obligatoires</h2>
      <p>Chaque annonce doit comporter ces photos. Elles nous permettent de vérifier le parfum sans l'avoir entre les mains.</p>
      <div class="exemples">${['face', 'dessous', 'niveau', 'preuve', 'boite'].map((x) => `<figure>${visuel(ex, x)}<figcaption>${PHOTOS.find((y) => y.k === x).t}${x === 'boite' ? ' (si vous l\'avez)' : ''}</figcaption></figure>`).join('')}</div>
    </section>

    <section class="section">
      <h2 class="h2">Ce que notre équipe vérifie</h2>
      <ul class="liste-check">
        <li>Les photos demandées sont présentes, nettes et prises par le vendeur (le papier avec le pseudo et la date le prouve).</li>
        <li>Le code lot existe et correspond au format utilisé par la marque.</li>
        <li>Le flacon, le bouchon, l'étiquette et la boîte correspondent aux modèles connus.</li>
        <li>Le niveau visible correspond à ce qui est annoncé.</li>
        <li>Le prix n'est pas anormalement bas pour ce parfum.</li>
      </ul>
      <p>Une annonce qui ne passe pas est refusée, et on explique au vendeur ce qu'il faut corriger.</p>
    </section>

    <section class="section">
      <h2 class="h2">Après l'achat</h2>
      <ol class="frise">
        <li><strong>L'acheteur paie.</strong> L'argent est bloqué par Respray, le vendeur ne le reçoit pas encore.</li>
        <li><strong>Le vendeur envoie sous 5 jours</strong> avec l'étiquette fournie. Le colis est suivi et assuré.</li>
        <li><strong>L'acheteur reçoit le parfum</strong> et a 7 jours pour le vérifier : flacon, niveau, code lot, odeur.</li>
        <li><strong>Tout est conforme :</strong> l'acheteur confirme, ou rien ne se passe pendant 7 jours. Le vendeur est payé.</li>
      </ol>
    </section>

    <section class="section">
      <h2 class="h2">Si le parfum n'est pas conforme</h2>
      <p>Contrefaçon, niveau plus bas qu'annoncé, flacon abîmé, mauvais parfum : l'acheteur ouvre un signalement depuis sa commande, avec des photos, dans les 7 jours. L'argent reste bloqué. Si le signalement est fondé, l'acheteur renvoie le parfum avec l'étiquette fournie et il est remboursé en entier, livraison comprise. Un vendeur qui vend une contrefaçon est exclu.</p>
      <p>Un parfum qui ne plaît pas mais qui est conforme n'est pas remboursé : il peut être remis en vente sur Respray.</p>
    </section>

    <section class="section">
      <h2 class="h2">Les frais</h2>
      <table class="frais"><tbody>
        <tr><th scope="row">Vendre</th><td>Gratuit, sans commission</td></tr>
        <tr><th scope="row">Protection acheteur</th><td>5 % du prix + 0,70 €</td></tr>
        <tr><th scope="row">Envoi suivi en point relais</th><td>À partir de 4,90 €</td></tr>
        <tr><th scope="row">Remise en main propre</th><td>Gratuit</td></tr>
      </tbody></table>
    </section>

    <section class="section">
      <h2 class="h2">Ce qui est interdit</h2>
      <p>Les contrefaçons et les « dupes », les testeurs, les échantillons offerts, les parfums transvasés dans un autre flacon (décants), et les flacons dont le vaporisateur a été ouvert.</p>
    </section>

    <section class="section faq">
      <h2 class="h2">Questions fréquentes</h2>
      ${[
        ['Un parfum entamé, c\'est hygiénique ?', 'Oui. Le parfum ne touche jamais la peau dans le flacon : il sort par un vaporisateur serti. Bien rangé, à l\'abri de la lumière et de la chaleur, il se garde des années.'],
        ['Combien de temps prend la vérification ?', 'En général quelques heures. Si une photo manque ou ne se lit pas, on vous le dit tout de suite.'],
        ['Et si le colis se perd ?', 'Il est assuré : l\'acheteur est remboursé et le vendeur est payé.'],
        ['Quand le vendeur est-il payé ?', 'Dès que l\'acheteur confirme que tout est conforme, ou automatiquement 7 jours après la livraison. Le virement arrive en 1 à 2 jours.'],
      ]
        .map(([q, r]) => `<details><summary>${q}</summary><p>${r}</p></details>`)
        .join('')}
    </section>
  </div>`;
  };

  VUES.introuvable = () => `<div class="env page"><h1 class="titre-page">Cette page n'existe pas</h1><p><a class="lien" href="#accueil">Retour à l'accueil</a></p></div>`;

  /* ——— fenêtres, messages ——— */
  const modale = document.getElementById('modale');
  const ouvrir = (html) => {
    modale.innerHTML = `<div class="modale-fond" data-action="fermer"></div><div class="modale-boite" role="dialog" aria-modal="true">${html}<button class="modale-x" type="button" data-action="fermer" aria-label="Fermer"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICO.croix}</svg></button></div>`;
    modale.hidden = false;
    const f = modale.querySelector('input, .btn');
    if (f) f.focus();
  };
  const fermer = () => {
    modale.hidden = true;
    modale.innerHTML = '';
  };
  let minuteur;
  const message = (t) => {
    const m = document.getElementById('message');
    m.textContent = t;
    m.hidden = false;
    clearTimeout(minuteur);
    minuteur = setTimeout(() => (m.hidden = true), 4000);
  };

  /* ——— rendu ——— */
  const vue = document.getElementById('vue');
  function rendre() {
    const h = decodeURIComponent(location.hash.slice(1)) || 'accueil';
    const html = h.startsWith('annonce-') ? VUES.annonce(h.slice(8)) : VUES[h] ? VUES[h]() : VUES.introuvable();
    vue.innerHTML = html;
    const rub = h.startsWith('annonce-') ? 'recherche' : h;
    document.querySelectorAll('[data-nav]').forEach((a) => a.setAttribute('aria-current', a.dataset.nav === rub ? 'page' : 'false'));
    const h1 = vue.querySelector('h1');
    document.title = h === 'accueil' ? 'Respray' : `${h1 ? h1.textContent.trim() : 'Respray'} · Respray`;
  }
  const aller = (h) => (location.hash.slice(1) === h ? rendre() : (location.hash = h));
  window.addEventListener('hashchange', () => {
    fermer();
    rendre();
    window.scrollTo(0, 0);
  });
  const majResultats = () => {
    const r = document.getElementById('resultats');
    if (r) r.innerHTML = resultats();
  };
  const lireFiltres = (f) => {
    const d = new FormData(f);
    Object.assign(R, {q: String(d.get('q') || ''), genre: d.get('genre'), etat: d.get('etat'), taille: d.get('taille'), prixMax: +d.get('prixMax'), marques: new Set(d.getAll('marque')), mainPropre: d.get('mainPropre') != null});
    const o = document.getElementById('prix-max-out');
    if (o) o.textContent = eur(R.prixMax);
    majResultats();
  };

  document.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-form]');
    if (!f) return;
    e.preventDefault();
    const type = f.dataset.form;
    if (type === 'recherche' || type === 'entete') {
      Object.assign(R, {q: String(new FormData(f).get('q') || ''), marques: new Set()});
      aller('recherche');
    } else if (type === 'filtres') lireFiltres(f);
    else if (type === 'vendre') {
      const prix = parseFloat(String(V.prix).replace(',', '.'));
      const manque = !V.p ? 'Choisissez le parfum.' : !V.ml ? 'Choisissez la contenance.' : PHOTOS.some((x) => x.obl && !V.photos[x.k]) ? 'Ajoutez les quatre photos obligatoires.' : !(prix >= 3) ? 'Indiquez un prix d\'au moins 3 €.' : '';
      const err = document.getElementById('erreur');
      if (manque) {
        err.textContent = manque;
        err.hidden = false;
        err.scrollIntoView({block: 'center'});
        return;
      }
      V.envoye = true;
      rendre();
      window.scrollTo(0, 0);
    } else if (type === 'offre') {
      const a = A[f.dataset.a];
      const m = parseFloat(String(new FormData(f).get('montant')).replace(',', '.'));
      const min = Math.ceil(a.prix * 0.7);
      if (!(m >= min)) {
        f.querySelector('#offre-aide').textContent = `L'offre minimale pour cette annonce est de ${eur(min)}.`;
        return;
      }
      fermer();
      message(`Offre de ${eur(m)} envoyée à ${VENDEURS[a.v].pseudo}. Réponse sous 24 h.`);
    }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.closest('[data-form="filtres"]')) lireFiltres(t.closest('form'));
    else if (t.dataset.champ === 'niveau') {
      V.niveau = +t.value;
      document.getElementById('niveau-out').textContent = V.niveau + ' %';
    } else if (t.dataset.champ === 'prix') {
      V.prix = t.value;
      const n = parseFloat(t.value.replace(',', '.')) || 0;
      document.getElementById('recu').textContent = `Vous recevrez ${eur2(n)} : aucune commission.`;
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-tri]')) {
      R.tri = t.value;
      majResultats();
    } else if (t.matches('[data-mode]')) {
      achat.mode = t.value;
      document.getElementById('total').innerHTML = total(A[location.hash.slice(9)]);
    } else if (['p', 'ml', 'boite', 'etat'].includes(t.dataset.champ)) {
      V[t.dataset.champ] = t.value;
      if (t.dataset.champ === 'p') V.ml = '';
      rendre();
    } else if (t.matches('[data-photo]') && t.files && t.files[0]) {
      const lecteur = new FileReader();
      lecteur.onload = () => {
        V.photos[t.dataset.photo] = lecteur.result;
        rendre();
      };
      lecteur.readAsDataURL(t.files[0]);
    }
  });

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, a');
    if (!t) return;
    if (t.dataset.marque) Object.assign(R, {q: '', marques: new Set([t.dataset.marque])});
    if (t.dataset.fav) {
      const id = t.dataset.fav;
      favoris.has(id) ? favoris.delete(id) : favoris.add(id);
      memoire.ecrire('favoris', [...favoris]);
      t.setAttribute('aria-pressed', favoris.has(id));
      message(favoris.has(id) ? 'Ajouté à vos favoris. On vous prévient si le prix baisse.' : 'Retiré de vos favoris.');
      return;
    }
    if (t.dataset.vue) {
      const a = A[location.hash.slice(9)];
      document.getElementById('grande').innerHTML = visuel(a, t.dataset.vue);
      document.querySelectorAll('.mini').forEach((b) => b.setAttribute('aria-pressed', b === t));
      return;
    }
    const a = t.dataset.a && A[t.dataset.a];
    switch (t.dataset.action) {
      case 'fermer':
        fermer();
        break;
      case 'effacer':
        Object.assign(R, {q: '', marques: new Set(), genre: 'tous', etat: 'tous', taille: 'tous', prixMax: 300, mainPropre: false});
        rendre();
        break;
      case 'acheter': {
        const port = achat.mode === 'envoi' ? ENVOI : 0;
        ouvrir(`<h2 class="h2">Paiement</h2><p class="aide">${esc(P[a.p].nom)}, ${a.ml} ml</p>${total(a)}
          <p class="aide">L'argent reste bloqué jusqu'à votre confirmation, ou 7 jours après la livraison.</p>
          <button class="btn btn-noir btn-large" type="button" data-action="payer">Payer ${eur2(a.prix + protection(a.prix) + port)}</button>`);
        break;
      }
      case 'offre':
        ouvrir(`<form data-form="offre" data-a="${a.id}"><h2 class="h2">Faire une offre</h2><p class="aide">${esc(P[a.p].nom)} · prix affiché ${eur(a.prix)}</p>
          <label for="montant">Votre offre</label><div class="champ-prix"><input id="montant" name="montant" class="champ" inputmode="decimal" value="${Math.round(a.prix * 0.9)}"><span>€</span></div>
          <p class="aide" id="offre-aide">Le vendeur a 24 h pour répondre. Rien n'est débité avant son accord.</p>
          <button class="btn btn-noir btn-large" type="submit">Envoyer l'offre</button></form>`);
        break;
      case 'payer':
        fermer();
        message('Prototype : aucun paiement n\'a été fait.');
        break;
      case 'photos-exemple':
        PHOTOS.slice(0, 5).forEach((x) => (V.photos[x.k] = V.photos[x.k] || true));
        rendre();
        break;
      case 'nouvelle':
        Object.assign(V, {p: '', ml: '', etat: 'entame', niveau: 80, boite: 'oui', prix: '', photos: {}, envoye: false});
        rendre();
        break;
      case 'theme': {
        const r = document.documentElement;
        const sombre = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
        r.dataset.theme = sombre ? 'light' : 'dark';
        break;
      }
      default:
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modale.hidden) fermer();
  });

  rendre();
})();
