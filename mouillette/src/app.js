/* Mouillette : le prototype. Une page, des vues appelées par l'adresse (#recherche, #parfum-santal-33, #annonce-m4127…).
   Tout est calculé ici, à partir de data.js : rien n'est envoyé nulle part. */
(() => {
  'use strict';

  /* ——— outils ——— */
  const P = Object.fromEntries(PARFUMS.map((p) => [p.id, p]));
  const A = Object.fromEntries(ANNONCES.map((a) => [a.id, a]));
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const nb = (n, d = 2) => n.toLocaleString('fr-FR', {minimumFractionDigits: d, maximumFractionDigits: d});
  const eur = (n) => (Number.isInteger(Math.round(n * 100) / 100) ? nb(n, 0) : nb(n, 2)) + ' €';
  const eur2 = (n) => nb(n, 2) + ' €';
  const parMl = (n) => nb(n, 2) + ' €/ml';
  const pct = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + nb(Math.abs(n), 0) + ' %';
  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem('mouillette:' + k);
        return v ? JSON.parse(v) : d;
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem('mouillette:' + k, JSON.stringify(v));
      } catch (e) {
        /* stockage indisponible : on garde en mémoire seulement */
      }
    },
  };
  const favoris = new Set(store.get('favoris', []));
  const alertes = store.get('alertes', []);

  const vendeur = (a) => VENDEURS[a.v];
  const offresDe = (pid) => ANNONCES.filter((a) => a.p === pid);
  const NIVEAUX = {
    controle: {nom: 'Contrôlé', court: 'Contrôlé', desc: 'Photos, pesée et code lot contrôlés'},
    atelier: {nom: 'Authentifié Atelier', court: 'Atelier', desc: "Examiné, pesé et senti à l'Atelier"},
    passeport: {nom: 'Passeport', court: 'Passeport', desc: 'Authentifié, scellé numéroté et puce NFC'},
  };
  const RANG = {controle: 0, atelier: 1, passeport: 2};

  function infos(a) {
    const p = P[a.p];
    const fmt = p.formats.find((f) => f.ml === a.ml) || p.formats[0];
    const prixMl = a.prix / a.restant;
    const ref = p.cote * (a.scelle ? 1.12 : 1) * (a.vintage ? 1.5 : 1);
    const ecart = (prixMl - ref) / ref;
    const tag = ecart <= -0.05 ? 'bon' : ecart >= 0.05 ? 'haut' : 'cote';
    return {p, fmt, prixMl, ref, ecart, tag, rempli: Math.round((a.restant / a.ml) * 100)};
  }
  const TAGS = {bon: 'Bon prix', cote: 'Dans la cote', haut: 'Au-dessus de la cote'};
  const tagPrix = (a) => {
    const i = infos(a);
    const t = i.tag === 'bon' ? `${TAGS.bon} · ${pct(i.ecart * 100)}` : i.tag === 'haut' ? `${TAGS.haut} · ${pct(i.ecart * 100)}` : TAGS.cote;
    return `<span class="tag tag-${i.tag}">${t}</span>`;
  };

  /* hasard reproductible, pour les courbes de cote */
  const graine = (s) => {
    let h = 2166136261;
    for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return () => {
      h = Math.imul(h ^ (h >>> 15), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  };
  const MOIS = ['déc.', 'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.'];
  function serie(p) {
    const r = graine(p.id);
    const debut = p.cote / (1 + p.tendance / 100);
    return MOIS.map((m, i) => {
      if (i === 11) return p.cote;
      const base = debut + ((p.cote - debut) * i) / 11;
      return base * (1 + (r() - 0.5) * 0.05);
    });
  }

  /* ——— les flacons dessinés ———
     Formes génériques (aucune ne reproduit un flacon de marque). Le jus monte au niveau mesuré ; avec `echelle`, une
     graduation en millilitres et le trait du niveau. */
  let uid = 0;
  const FORMES = {
    tour: {corps: {x: 31, y: 66, w: 58, h: 124, r: 7}, col: {x: 50, y: 54, w: 20, h: 14}, bouchon: {x: 41, y: 14, w: 38, h: 42, r: 4}},
    carre: {corps: {x: 15, y: 90, w: 90, h: 100, r: 12}, col: {x: 47, y: 78, w: 26, h: 14}, bouchon: {x: 35, y: 38, w: 50, h: 42, r: 4}},
    galet: {corps: {x: 15, y: 82, w: 90, h: 108, r: 44}, col: {x: 50, y: 68, w: 20, h: 16}, bouchon: {x: 38, y: 30, w: 44, h: 40, r: 20}},
    cylindre: {corps: {x: 32, y: 60, w: 56, h: 130, r: 14}, col: {x: 52, y: 50, w: 16, h: 12}, bouchon: {x: 43, y: 12, w: 34, h: 40, r: 8}},
    apothicaire: {corps: {x: 24, y: 76, w: 72, h: 114, r: 5}, col: {x: 46, y: 60, w: 28, h: 18}, bouchon: {x: 44, y: 26, w: 32, h: 36, r: 2}, etiquette: true},
    facette: {chemin: 'M24 86 H96 L106 126 L98 190 H22 L14 126 Z', corps: {x: 14, y: 86, w: 92, h: 104}, col: {x: 49, y: 72, w: 22, h: 16}, bouchon: {x: 38, y: 28, w: 44, h: 46, facette: true}},
  };
  function flacon(p, ml, restant, o = {}) {
    const f = FORMES[p.forme];
    const id = 'f' + ++uid;
    const c = f.corps;
    const haut = c.y + 7;
    const bas = c.y + c.h - 8;
    const h = bas - haut;
    const niveau = bas - (Math.max(0, Math.min(restant, ml)) / ml) * h;
    const forme = f.chemin ? `<path d="${f.chemin}"/>` : `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="${c.r}"/>`;
    const b = f.bouchon;
    const bouchon = b.facette
      ? `<path class="v-bouchon" style="fill:${p.bouchon}" d="M${b.x + 8} ${b.y} H${b.x + b.w - 8} L${b.x + b.w} ${b.y + 12} V${b.y + b.h} H${b.x} V${b.y + 12} Z"/>`
      : `<rect class="v-bouchon" style="fill:${p.bouchon}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.r}"/>`;
    const lueur = `<rect class="v-lueur" x="${b.x + 5}" y="${b.y + 5}" width="4" height="${b.h - 12}" rx="2"/>`;
    let echelle = '';
    let vb = '0 0 120 200';
    if (o.echelle) {
      vb = '0 0 168 200';
      const x = c.x + c.w + 8;
      const pas = ml <= 50 ? 5 : ml <= 100 ? 10 : 25;
      let t = '';
      for (let v = 0; v <= ml; v += pas) {
        const y = bas - (v / ml) * h;
        const grand = v % (pas * 2) === 0 || v === ml;
        t += `<line x1="${x}" x2="${x + (grand ? 7 : 4)}" y1="${y}" y2="${y}"/>`;
      }
      echelle = `<g class="v-grad">${t}<line x1="${x}" x2="${x}" y1="${haut}" y2="${bas}"/></g>
        <text class="v-grad-txt" x="${x + 10}" y="${bas + 3}">0</text><text class="v-grad-txt" x="${x + 10}" y="${haut + 3}">${ml}</text>
        <line class="v-niveau" x1="${c.x - 6}" x2="${x + 9}" y1="${niveau}" y2="${niveau}"/>
        <text class="v-niveau-txt" x="${x + 12}" y="${niveau + 3.5}">${nb(restant, 0)} ml</text>`;
    }
    return `<svg class="flacon ${o.classe || ''}" viewBox="${vb}" role="img" aria-label="${esc(o.label || `Flacon de ${p.nom}, ${restant} ml sur ${ml}`)}">
      <defs><clipPath id="${id}">${forme}</clipPath></defs>
      <rect class="v-col" x="${f.col.x}" y="${f.col.y}" width="${f.col.w}" height="${f.col.h}" rx="2"/>
      ${bouchon}${lueur}
      <g class="v-verre">${forme}</g>
      <g clip-path="url(#${id})">
        <rect class="v-jus" style="fill:${p.jus}" x="0" y="${niveau}" width="120" height="${200 - niveau}"/>
        <rect class="v-menisque" x="0" y="${niveau}" width="120" height="1.6"/>
        <rect class="v-fond" x="0" y="${bas}" width="120" height="${c.y + c.h - bas}"/>
        <rect class="v-reflet" x="${c.x + 7}" y="${c.y + 10}" width="5" height="${c.h - 32}" rx="2.5"/>
      </g>
      ${f.etiquette ? `<rect class="v-etiquette" x="${c.x + 12}" y="${c.y + 36}" width="${c.w - 24}" height="44" rx="1"/><rect class="v-etiquette-l" x="${c.x + 18}" y="${c.y + 46}" width="${c.w - 36}" height="3"/><rect class="v-etiquette-l" x="${c.x + 18}" y="${c.y + 54}" width="${c.w - 48}" height="2"/><rect class="v-etiquette-l" x="${c.x + 18}" y="${c.y + 66}" width="${c.w - 42}" height="2"/>` : ''}
      ${echelle}
    </svg>`;
  }

  /* ——— petits éléments ——— */
  const ICONES = {
    check: '<path d="M4 10.5l3.5 3.5L16 5.5"/>',
    sceau: '<circle cx="10" cy="8" r="5.5"/><path d="M7 12.5L5.5 18 10 16l4.5 2-1.5-5.5"/>',
    loupe: '<circle cx="8.5" cy="8.5" r="5.5"/><path d="M13 13l5 5"/>',
    coeur: '<path d="M10 17s-6.5-4-6.5-8.5A3.5 3.5 0 0 1 10 6.3a3.5 3.5 0 0 1 6.5 2.2C16.5 13 10 17 10 17z"/>',
    cloche: '<path d="M5 14V9a5 5 0 0 1 10 0v5l1.5 2h-13zM8.5 18.5h3"/>',
    balance: '<path d="M3 15h14M5 15l1-6h8l1 6M10 9V5M7 5h6"/>',
    camion: '<path d="M2 5h10v9H2zM12 8h3.5l2.5 3v3h-6M5 16.5a1.5 1.5 0 1 0 0-.1M14 16.5a1.5 1.5 0 1 0 0-.1"/>',
    main: '<path d="M6 10V5.5a1.5 1.5 0 0 1 3 0V9m0-3.5V4a1.5 1.5 0 0 1 3 0v5m0-3a1.5 1.5 0 0 1 3 0v6c0 3.5-2.5 6-6 6s-5-2-6.5-4.5L2.8 12a1.4 1.4 0 0 1 2.2-1.7L6 11.5"/>',
    bouclier: '<path d="M10 2.5l6 2.5v4.5c0 4-2.6 7.2-6 8.5-3.4-1.3-6-4.5-6-8.5V5z"/><path d="M7.3 10l2 2 3.5-4"/>',
    fleche: '<path d="M4 10h12M11 5l5 5-5 5"/>',
    echange: '<path d="M4 7h11l-3-3M16 13H5l3 3"/>',
    nfc: '<path d="M7 6c1.5 1 2.3 2.5 2.3 4S8.5 13 7 14M10.5 4c2.3 1.6 3.5 3.7 3.5 6s-1.2 4.4-3.5 6M4 8c.7.5 1 1.2 1 2s-.3 1.5-1 2"/>',
    croix: '<path d="M5 5l10 10M15 5L5 15"/>',
    photo: '<path d="M3 6.5h3l1.5-2h5L14 6.5h3v9.5H3z"/><circle cx="10" cy="11" r="3"/>',
  };
  const ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 20 20" aria-hidden="true">${ICONES[n]}</svg>`;
  const badge = (niveau) => `<span class="badge badge-${niveau}">${ico(niveau === 'controle' ? 'check' : niveau === 'atelier' ? 'loupe' : 'sceau')}${NIVEAUX[niveau].court}</span>`;
  const remplissage = (a, large) => {
    const r = Math.round((a.restant / a.ml) * 100);
    return `<div class="remp ${large ? 'remp-l' : ''}"><span class="remp-barre" aria-hidden="true"><i style="width:${r}%"></i></span><span class="mono">${a.scelle ? 'Scellé · ' : ''}${nb(a.restant, 0)}/${a.ml}&nbsp;ml</span></div>`;
  };

  function carteAnnonce(a) {
    const i = infos(a);
    const p = i.p;
    return `<a class="carte" href="#annonce-${a.id}">
      <div class="carte-visuel">${flacon(p, a.ml, a.restant)}${badge(a.niveau)}${a.vintage ? '<span class="pastille">Vintage</span>' : ''}</div>
      <div class="carte-corps">
        <p class="sur">${esc(p.maison)}</p>
        <h3 class="carte-nom">${esc(p.nom)}</h3>
        <p class="carte-conc">${esc(p.conc)} · ${a.ml}&nbsp;ml</p>
        ${remplissage(a)}
        <p class="carte-prix"><strong>${eur(a.prix)}</strong><span class="mono">${parMl(i.prixMl)}</span></p>
        ${tagPrix(a)}
      </div>
    </a>`;
  }

  function carteParfum(p) {
    const offres = offresDe(p.id);
    const des = Math.min(...offres.map((a) => a.prix / a.restant));
    const ex = offres.sort((x, y) => y.restant / y.ml - x.restant / x.ml)[0];
    return `<a class="carte carte-parfum" href="#parfum-${p.id}">
      <div class="carte-visuel">${flacon(p, ex ? ex.ml : p.formats[0].ml, ex ? ex.restant : p.formats[0].ml)}</div>
      <div class="carte-corps">
        <p class="sur">${esc(p.maison)}</p>
        <h3 class="carte-nom">${esc(p.nom)}</h3>
        <p class="carte-conc">${esc(p.conc)} · ${p.annee}</p>
        <dl class="mini-dl">
          <div><dt>Cote</dt><dd class="mono">${parMl(p.cote)}</dd></div>
          <div><dt>12 mois</dt><dd class="mono ${p.tendance > 0 ? 'hausse' : p.tendance < 0 ? 'baisse' : ''}">${pct(p.tendance)}</dd></div>
          <div><dt>${offres.length} offre${offres.length > 1 ? 's' : ''}</dt><dd class="mono">dès ${parMl(des)}</dd></div>
        </dl>
      </div>
    </a>`;
  }

  function sparkline(p, w = 96, h = 26) {
    const s = serie(p);
    const min = Math.min(...s);
    const max = Math.max(...s);
    const pts = s.map((v, i) => [(i / (s.length - 1)) * (w - 4) + 2, h - 3 - ((v - min) / (max - min || 1)) * (h - 6)]);
    const d = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
    const fin = pts[pts.length - 1];
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><path d="${d}"/><circle cx="${fin[0]}" cy="${fin[1]}" r="2.2"/></svg>`;
  }

  function courbe(p, W = 900) {
    const s = serie(p);
    const f = p.formats[p.formats.length > 1 ? 1 : 0];
    const neuf = f.neuf / f.ml;
    const H = 250;
    const pasMois = W < 560 ? 3 : 2;
    const g = 50;
    const d = 92;
    const t = 18;
    const bb = 30;
    const lo = Math.min(...s) * 0.9;
    const hi = Math.max(Math.max(...s), neuf) * 1.06;
    const x = (i) => g + (i / 11) * (W - g - d);
    const y = (v) => t + (1 - (v - lo) / (hi - lo)) * (H - t - bb);
    const ticks = [0, 1, 2, 3].map((k) => lo + ((hi - lo) * k) / 3);
    const ligne = s.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    const aire = `${ligne} L${x(11)} ${H - bb} L${x(0)} ${H - bb} Z`;
    return `<svg class="courbe" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cote de ${esc(p.nom)} sur 12 mois : de ${parMl(s[0])} à ${parMl(p.cote)}, prix neuf ${parMl(neuf)}">
      ${ticks.map((v) => `<line class="c-grille" x1="${g}" x2="${W - d}" y1="${y(v)}" y2="${y(v)}"/><text class="c-txt" x="${g - 8}" y="${y(v) + 4}" text-anchor="end">${nb(v, 2)}</text>`).join('')}
      <line class="c-neuf" x1="${g}" x2="${W - d}" y1="${y(neuf)}" y2="${y(neuf)}"/>
      <text class="c-neuf-txt" x="${W - d + 8}" y="${y(neuf) + 4}">neuf ${nb(neuf, 2)}</text>
      <path class="c-aire" d="${aire}"/><path class="c-ligne" d="${ligne}"/>
      <circle class="c-point" cx="${x(11)}" cy="${y(p.cote)}" r="4.5"/>
      <text class="c-fin" x="${x(11) + 9}" y="${y(p.cote) + 4}">${nb(p.cote, 2)}</text>
      ${MOIS.map((m, i) => ((11 - i) % pasMois === 0 ? `<text class="c-txt" x="${x(i)}" y="${H - 9}" text-anchor="middle">${m}</text>` : '')).join('')}
    </svg>`;
  }

  /* ——— les vues ——— */
  const VUES = {};

  VUES.accueil = () => {
    const vedette = A.m4127;
    const pv = P[vedette.p];
    const iv = infos(vedette);
    const tri = [...PARFUMS].sort((x, y) => y.ventes90 - x.ventes90).slice(0, 8);
    const vus = new Set();
    const atelier = ANNONCES.filter((a) => a.niveau !== 'controle' && !vus.has(a.p) && vus.add(a.p)).slice(0, 8);
    return `
    <section class="hero">
      <div class="env hero-grille">
        <div class="hero-texte">
          <p class="sur">Parfums de seconde main · Paris</p>
          <h1>Le parfum de seconde main, vérifié jusqu'à la dernière goutte.</h1>
          <p class="chapo">Chaque flacon est pesé, son code lot décodé, sa cote affichée. Authentique et conforme, ou remboursé par nous.</p>
          <form class="recherche-hero" data-form="recherche" role="search">
            <label class="vh" for="q-hero">Quel parfum cherchez-vous ?</label>
            ${ico('loupe')}<input id="q-hero" name="q" type="search" placeholder="Quel parfum cherchez-vous ?" autocomplete="off">
            <button class="btn btn-plein" type="submit">Chercher</button>
          </form>
          <p class="suggestions">${['Baccarat Rouge 540', 'Santal 33', 'Delina', 'Tobacco Vanille', 'Shalimar'].map((s) => `<a href="#parfum-${PARFUMS.find((p) => p.nom === s).id}">${s}</a>`).join('')}</p>
          <p class="hero-vendre"><a class="lien-fort" href="#vendre">Vendre un flacon : 0&nbsp;% de commission ${ico('fleche')}</a></p>
        </div>
        <figure class="fiche-eval" aria-label="Exemple : la fiche de vérification d'un flacon">
          <a class="fiche-flacon" href="#annonce-${vedette.id}">${flacon(pv, vedette.ml, vedette.restant, {echelle: true, classe: 'flacon-hero'})}</a>
          <ul class="annot">
            <li style="--i:0"><span class="annot-k">Pesé</span><span class="annot-v mono">${nb(vedette.poids, 1)} g → ${vedette.restant} ml</span></li>
            <li style="--i:1"><span class="annot-k">Code lot ${vedette.lot}</span><span class="annot-v mono">produit en ${vedette.prod}</span></li>
            <li style="--i:2"><span class="annot-k">Cote</span><span class="annot-v mono">${parMl(pv.cote)} · ici ${parMl(iv.prixMl)}</span></li>
            <li style="--i:3"><span class="annot-k">Scellé</span><span class="annot-v mono">${vedette.scelleNo} · NFC</span></li>
          </ul>
          <figcaption><span class="sur">${esc(pv.maison)}</span><a href="#annonce-${vedette.id}"><em>${esc(pv.nom)}</em> · ${eur(vedette.prix)}</a></figcaption>
        </figure>
      </div>
    </section>

    <section class="preuves env" aria-label="Nos engagements">
      <div><h2>${ico('balance')}Pesé, pas déclaré</h2><p>Les millilitres restants sont calculés à partir du poids. Vous payez ce qu'il reste.</p></div>
      <div><h2>${ico('bouclier')}Garanti par nous</h2><p>Authentique et conforme, sinon remboursé, port compris. 7 jours pour le vérifier.</p></div>
      <div><h2>${ico('sceau')}0&nbsp;% vendeur</h2><p>Le vendeur touche tout son prix. L'acheteur paie 5&nbsp;% + 0,70&nbsp;€ de protection.</p></div>
      <div><h2>${ico('camion')}Expédié dans les règles</h2><p>Un parfum est inflammable : emballage de calage, marquage et assurance fournis.</p></div>
    </section>

    <section class="bloc env">
      <div class="bloc-tete">
        <div><p class="sur">La cote du jour</p><h2 class="titre">Ce que valent les parfums, au millilitre</h2></div>
        <p class="bloc-note">Médiane des ventes conclues sur 90 jours. Prix neuf indicatif au format courant.</p>
      </div>
      <div class="table-defile">
        <table class="cote">
          <thead><tr><th scope="col">Parfum</th><th scope="col" class="num">Cote</th><th scope="col">12 mois</th><th scope="col" class="num col-neuf">Neuf</th><th scope="col" class="num col-offres">Offres</th><th scope="col" class="num">Dès</th></tr></thead>
          <tbody>${tri
            .map((p) => {
              const o = offresDe(p.id);
              const f = p.formats[p.formats.length > 1 ? 1 : 0];
              const des = Math.min(...o.map((a) => a.prix / a.restant));
              return `<tr data-href="#parfum-${p.id}"><th scope="row"><a href="#parfum-${p.id}"><span class="sur">${esc(p.maison)}</span><em>${esc(p.nom)}</em></a></th>
              <td class="num mono">${parMl(p.cote)}</td>
              <td><span class="spark-cell">${sparkline(p)}<span class="mono ${p.tendance > 0 ? 'hausse' : p.tendance < 0 ? 'baisse' : ''}">${pct(p.tendance)}</span></span></td>
              <td class="num mono col-neuf">${parMl(f.neuf / f.ml)}</td>
              <td class="num mono col-offres">${o.length}</td>
              <td class="num mono">${parMl(des)}</td></tr>`;
            })
            .join('')}</tbody>
        </table>
      </div>
    </section>

    <section class="bloc env">
      <div class="bloc-tete">
        <div><p class="sur">Passés à l'Atelier cette semaine</p><h2 class="titre">Authentifiés, pesés au dixième de gramme</h2></div>
        <a class="lien-fort" href="#recherche">Tous les flacons ${ico('fleche')}</a>
      </div>
      <div class="grille-cartes">${atelier.map(carteAnnonce).join('')}</div>
    </section>

    <section class="bloc env niveaux-bloc">
      <div class="bloc-tete">
        <div><p class="sur">Comment on vérifie</p><h2 class="titre">Trois niveaux, écrits sur chaque annonce</h2></div>
        <a class="lien-fort" href="#confiance">Tout sur la vérification ${ico('fleche')}</a>
      </div>
      <div class="niveaux">
        <article><p>${badge('controle')}</p><h3>Toutes les annonces</h3><ul class="coches"><li>Identité du vendeur vérifiée</li><li>Code-barres rapproché du catalogue</li><li>Code lot lu et décodé</li><li>Niveau calculé à partir de la pesée</li><li>Photos comparées aux flacons de référence</li><li>Contrôle humain en moins de 2&nbsp;h</li></ul></article>
        <article><p>${badge('atelier')}</p><h3>Le flacon passe par l'Atelier</h3><ul class="coches"><li>Tout ce qui précède</li><li>Examen du vaporisateur, du sertissage, de la gravure</li><li>Pesée au dixième de gramme</li><li>Évaluation olfactive contre un flacon de référence</li><li>Prélèvements tirés au sort pour le laboratoire</li></ul><p class="petit">9,90&nbsp;€ pour l'acheteur, offert dès 300&nbsp;€.</p></article>
        <article><p>${badge('passeport')}</p><h3>Le flacon garde sa preuve</h3><ul class="coches"><li>Authentifié à l'Atelier</li><li>Scellé numéroté inviolable</li><li>Puce NFC : le passeport s'ouvre au téléphone</li><li>Son histoire le suit à chaque revente</li></ul><p class="petit"><a href="#passeport-${vedette.scelleNo}">Voir un passeport</a></p></article>
      </div>
    </section>

    <section class="bloc bande">
      <div class="env vendre-grille">
        <div>
          <p class="sur">Vendre</p>
          <h2 class="titre">Une minute pour vendre. Ou rien du tout.</h2>
          <ol class="etapes">
            <li><strong>Scannez le code-barres.</strong> La fiche du parfum se remplit.</li>
            <li><strong>Posez le flacon sur une balance de cuisine.</strong> Les millilitres s'affichent.</li>
            <li><strong>Suivez les gabarits photo.</strong> Face, dessous, niveau, balance, boîte.</li>
            <li><strong>Choisissez votre prix</strong> à partir de la cote, avec la chance de vendre sous 14 jours.</li>
            <li><strong>Publiez.</strong> Un humain contrôle en moins de 2&nbsp;heures.</li>
          </ol>
          <p class="actions"><a class="btn btn-plein" href="#vendre">Vendre un flacon</a><a class="btn" href="#confiance">La Conciergerie</a></p>
        </div>
        <div class="balance-demo" aria-hidden="true">
          <div class="balance-ecran mono">308,6&nbsp;g</div>
          <div class="balance-flacon">${flacon(pv, 70, 61)}</div>
          <div class="balance-plateau"></div>
          <p class="balance-calc mono">(308,6 − 256,0) g ÷ 0,86 = <strong>61 ml</strong></p>
        </div>
      </div>
    </section>

    <section class="bloc env refus">
      <div class="bloc-tete"><div><p class="sur">Ce qu'on refuse</p><h2 class="titre">Et pourquoi</h2></div></div>
      <ul class="refus-liste">
        <li><strong>Les contrefaçons et les « dupes ».</strong> Retirées du circuit, signalées aux marques.</li>
        <li><strong>Les testeurs.</strong> Ils portent « ne peut être vendu ».</li>
        <li><strong>Les échantillons offerts.</strong> Les coffrets découverte achetés et scellés, oui.</li>
        <li><strong>Les décants faits maison.</strong> Transvaser un parfum, c'est le modifier : on ne sait plus ce qu'il y a dans la fiole.</li>
      </ul>
    </section>

    <section class="bloc env comparer">
      <div class="comparer-texte">
        <p class="sur">Le même flacon, vendu 100&nbsp;€</p>
        <h2 class="titre">Le vendeur touche 100&nbsp;€. Pas 90.</h2>
        <p>Avec une commission classique de 10&nbsp;% pour le vendeur et 5&nbsp;% pour l'acheteur, la plateforme garde 15&nbsp;€. Ici, elle garde 5,70&nbsp;€, et c'est elle qui garantit le flacon.</p>
        <a class="lien-fort" href="#tarifs">Simuler votre vente ${ico('fleche')}</a>
      </div>
      <div class="barres" role="img" aria-label="Sur 100 euros : avec 10 % plus 5 %, le vendeur touche 90 euros et la plateforme 15 ; ici le vendeur touche 100 euros et la plateforme 5,70">
        <div class="barre-ligne"><span class="barre-nom">10&nbsp;% + 5&nbsp;%</span><span class="barre"><i class="b-vendeur" style="width:${(90 / 105) * 100}%">90&nbsp;€ vendeur</i><i class="b-plateforme" style="width:${(15 / 105) * 100}%">15&nbsp;€</i></span></div>
        <div class="barre-ligne"><span class="barre-nom">Mouillette</span><span class="barre"><i class="b-vendeur b-nous" style="width:${(100 / 105.7) * 100}%">100&nbsp;€ vendeur</i><i class="b-plateforme" style="width:${(5.7 / 105.7) * 100}%">5,70</i></span></div>
      </div>
    </section>

    <section class="bloc env communaute">
      <div class="bloc-tete"><div><p class="sur">Entre passionnés</p><h2 class="titre">Ce qu'on fait ici et nulle part ailleurs</h2></div></div>
      <div class="tuiles">
        <a class="tuile" href="#etagere"><h3>${ico('echange')}Échanger</h3><p>Votre Delina contre un Naxos, avec une soulte. L'argent est bloqué des deux côtés jusqu'à réception.</p></a>
        <a class="tuile" href="#etagere"><h3>${ico('cloche')}Être prévenu</h3><p>« Santal 33 sous 1,90&nbsp;€/ml, au moins 60&nbsp;% plein, authentifié. » Une alerte, et c'est tout.</p></a>
        <a class="tuile" href="#etagere"><h3>${ico('coeur')}Votre étagère</h3><p>Vos flacons et leur valeur à la cote du jour. Vendre devient un geste.</p></a>
        <a class="tuile" href="#confiance"><h3>${ico('main')}Main propre, sans risque</h3><p>Payez en ligne, sentez le flacon au rendez-vous, scannez le code du vendeur : l'argent part à ce moment-là.</p></a>
      </div>
    </section>

    <section class="bloc env faq">
      <div class="bloc-tete"><div><p class="sur">Questions</p><h2 class="titre">Ce qu'on nous demande</h2></div></div>
      ${[
        ['Un parfum entamé, c\'est hygiénique ?', "Le parfum ne touche jamais la peau dans le flacon : il est diffusé par un vaporisateur serti. L'alcool le conserve. On refuse en revanche les flacons dont le sertissage a été ouvert, et les décants."],
        ['Comment savez-vous qu\'il reste 61 ml ?', "On connaît le poids à vide de chaque flacon de référence. Le vendeur photographie le sien sur une balance ; la différence, divisée par la densité du parfum, donne les millilitres, à 2 ml près. À l'Atelier, on pèse au dixième de gramme."],
        ['Que se passe-t-il si le flacon n\'est pas conforme ?', "Vous avez 7 jours après réception pour le signaler. Si le flacon est faux, dilué, ou s'il manque plus de 3 ml, on vous rembourse tout, port compris. C'est nous qui remboursons, puis qui nous retournons vers le vendeur."],
        ['Le parfum ne me plaît pas, je fais quoi ?', "Un goût ne se rembourse pas, mais il se revend : pendant 30 jours, vous remettez le flacon en vente en un geste, sans aucuns frais. Son passeport garde la trace."],
        ['Et si le colis se perd ?', "Chaque envoi est assuré. L'acheteur est remboursé et le vendeur est payé."],
      ]
        .map(([q, r]) => `<details><summary>${q}</summary><p>${r}</p></details>`)
        .join('')}
    </section>`;
  };

  /* ——— recherche ——— */
  const R = {q: '', vue: 'parfums', tri: 'ml', maisons: new Set(), etat: 'tous', niveauMin: 0, verif: 'tous', mainPropre: false};
  const normal = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function filtrer() {
    const q = normal(R.q.trim());
    return ANNONCES.filter((a) => {
      const p = P[a.p];
      if (q && !normal(`${p.maison} ${p.nom} ${p.famille} ${Object.values(p.notes).flat().join(' ')}`).includes(q)) return false;
      if (R.maisons.size && !R.maisons.has(p.maison)) return false;
      if (R.etat === 'scelle' && !a.scelle) return false;
      if (R.etat === 'entame' && a.scelle) return false;
      if ((a.restant / a.ml) * 100 < R.niveauMin) return false;
      if (R.verif !== 'tous' && RANG[a.niveau] < RANG[R.verif]) return false;
      if (R.mainPropre && !a.mainPropre) return false;
      return true;
    });
  }
  function trier(liste) {
    const t = {
      ml: (x, y) => x.prix / x.restant - y.prix / y.restant,
      prix: (x, y) => x.prix - y.prix,
      recent: (x, y) => x.jours - y.jours,
      affaire: (x, y) => infos(x).ecart - infos(y).ecart,
    }[R.tri];
    return [...liste].sort(t);
  }
  VUES.recherche = () => {
    const maisons = [...new Set(PARFUMS.map((p) => p.maison))].sort((x, y) => x.localeCompare(y, 'fr'));
    return `<div class="env page">
      <div class="page-tete">
        <p class="sur">Acheter</p>
        <h1 class="titre-page">${R.q ? `« ${esc(R.q)} »` : 'Tous les flacons'}</h1>
      </div>
      <div class="recherche-grille">
        <aside class="filtres" aria-label="Filtres">
          <form data-form="filtres">
            <label class="vh" for="q-page">Parfum, maison, note</label>
            <input id="q-page" name="q" type="search" value="${esc(R.q)}" placeholder="Parfum, maison, note…" autocomplete="off">
            <fieldset><legend>Vérification minimum</legend>
              ${[['tous', 'Toutes'], ['atelier', 'Authentifié Atelier'], ['passeport', 'Avec passeport']].map(([v, l]) => `<label class="choix"><input type="radio" name="verif" value="${v}" ${R.verif === v ? 'checked' : ''}> ${l}</label>`).join('')}
            </fieldset>
            <fieldset><legend>État</legend>
              ${[['tous', 'Tous'], ['scelle', 'Neuf scellé'], ['entame', 'Entamé']].map(([v, l]) => `<label class="choix"><input type="radio" name="etat" value="${v}" ${R.etat === v ? 'checked' : ''}> ${l}</label>`).join('')}
            </fieldset>
            <fieldset><legend>Rempli au moins à <output id="niv-out" class="mono">${R.niveauMin}&nbsp;%</output></legend>
              <input id="niveau-min" name="niveauMin" type="range" min="0" max="100" step="10" value="${R.niveauMin}" aria-label="Niveau minimum en pourcentage">
            </fieldset>
            <fieldset><legend>Maison</legend>
              <div class="maisons">${maisons.map((m, i) => `<label class="choix"><input type="checkbox" name="maison" value="${esc(m)}" id="maison-${i}" ${R.maisons.has(m) ? 'checked' : ''}> ${esc(m)}</label>`).join('')}</div>
            </fieldset>
            <label class="choix"><input type="checkbox" name="mainPropre" ${R.mainPropre ? 'checked' : ''}> Remise en main propre possible</label>
            <button class="btn btn-petit" type="button" data-action="reinit">Tout effacer</button>
          </form>
        </aside>
        <div class="resultats" id="resultats">${resultats()}</div>
      </div>
    </div>`;
  };
  function resultats() {
    const liste = trier(filtrer());
    const pids = [...new Set(liste.map((a) => a.p))];
    const parfums = pids.map((id) => P[id]);
    const vide = `<div class="vide"><p>Aucun flacon ne correspond.</p><p>Élargissez les filtres, ou <a href="#etagere">créez une alerte</a> : on vous prévient dès qu'il arrive.</p></div>`;
    return `<div class="resultats-barre">
        <div class="segment" role="group" aria-label="Affichage">
          <button type="button" data-vue="parfums" aria-pressed="${R.vue === 'parfums'}">Par parfum <span class="mono">${parfums.length}</span></button>
          <button type="button" data-vue="annonces" aria-pressed="${R.vue === 'annonces'}">Par flacon <span class="mono">${liste.length}</span></button>
        </div>
        <label class="tri">Trier <select id="tri" data-tri>
          ${[['ml', 'Prix au millilitre'], ['affaire', 'Meilleure affaire (cote)'], ['prix', 'Prix total'], ['recent', 'Plus récents']].map(([v, l]) => `<option value="${v}" ${R.tri === v ? 'selected' : ''}>${l}</option>`).join('')}
        </select></label>
      </div>
      ${liste.length ? `<div class="grille-cartes">${R.vue === 'parfums' ? parfums.map(carteParfum).join('') : liste.map(carteAnnonce).join('')}</div>` : vide}`;
  }

  /* ——— fiche parfum ——— */
  VUES.parfum = (id) => {
    const p = P[id];
    if (!p) return VUES.introuvable();
    const offres = offresDe(id).sort((x, y) => x.prix / x.restant - y.prix / y.restant);
    const f = p.formats[p.formats.length > 1 ? 1 : 0];
    const neuf = f.neuf / f.ml;
    const enEnvie = alertes.some((x) => x.p === id);
    const jauge = (n) => `<span class="jauge" aria-label="${n} sur 5">${[1, 2, 3, 4, 5].map((k) => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}</span>`;
    return `<div class="env page">
      <nav class="fil" aria-label="Fil d'Ariane"><a href="#recherche">Acheter</a><span>/</span><a href="#recherche" data-maison="${esc(p.maison)}">${esc(p.maison)}</a><span>/</span><span>${esc(p.nom)}</span></nav>
      <div class="parfum-tete">
        <div class="parfum-visuel">${flacon(p, f.ml, f.ml, {classe: 'flacon-grand', label: `Flacon de ${p.nom}`})}</div>
        <div class="parfum-id">
          <p class="sur">${esc(p.maison)}</p>
          <h1 class="nom-parfum">${esc(p.nom)}</h1>
          <p class="parfum-meta">${esc(p.conc)} · ${p.annee} · ${esc(p.famille)} · parfumeur&nbsp;: ${esc(p.parfumeur)}</p>
          <dl class="chiffres">
            <div><dt>Cote</dt><dd class="mono">${parMl(p.cote)}</dd></div>
            <div><dt>Neuf (${f.ml}&nbsp;ml)</dt><dd class="mono">${parMl(neuf)}</dd></div>
            <div><dt>Écart au neuf</dt><dd class="mono">${pct(((p.cote - neuf) / neuf) * 100)}</dd></div>
            <div><dt>12 mois</dt><dd class="mono ${p.tendance > 0 ? 'hausse' : p.tendance < 0 ? 'baisse' : ''}">${pct(p.tendance)}</dd></div>
            <div><dt>Ventes, 90&nbsp;j</dt><dd class="mono">${p.ventes90}</dd></div>
          </dl>
          <p class="actions">
            <button class="btn btn-plein" type="button" data-action="alerte" data-p="${p.id}">${ico('cloche')}${enEnvie ? 'Alerte active' : 'Créer une alerte'}</button>
            <a class="btn" href="#vendre" data-vendre="${p.id}">Je l'ai : vendre le mien</a>
          </p>
        </div>
      </div>

      <section class="bloc">
        <div class="bloc-tete"><div><p class="sur">La cote</p><h2 class="titre">Prix médian au millilitre, 12 derniers mois</h2></div><p class="bloc-note">Ventes conclues sur Mouillette. Ligne pointillée : prix neuf indicatif.</p></div>
        <div class="courbe-cadre" data-p="${p.id}">${courbe(p)}</div>
      </section>

      <section class="bloc">
        <div class="bloc-tete"><div><p class="sur">${offres.length} offre${offres.length > 1 ? 's' : ''}</p><h2 class="titre">Triées par prix au millilitre</h2></div></div>
        <div class="offres">${offres
          .map((a) => {
            const i = infos(a);
            const v = vendeur(a);
            return `<a class="offre" href="#annonce-${a.id}">
              <span class="offre-flacon">${flacon(p, a.ml, a.restant)}</span>
              <span class="offre-format"><strong>${a.ml}&nbsp;ml</strong>${a.vintage ? ' · vintage' : ''}${a.boite ? ' · boîte' : ''}</span>
              <span class="offre-remp">${remplissage(a)}</span>
              <span class="offre-verif">${badge(a.niveau)}</span>
              <span class="offre-vendeur">${esc(v.pseudo)}<small>${v.ventes ? `${v.ventes} ventes · envoi ${nb(v.envoi, 1)}&nbsp;j` : 'Nouveau vendeur'}</small></span>
              <span class="offre-prix"><strong>${eur(a.prix)}</strong><span class="mono">${parMl(i.prixMl)}</span></span>
              <span class="offre-tag">${tagPrix(a)}</span>
            </a>`;
          })
          .join('')}</div>
      </section>

      <section class="bloc parfum-infos">
        <div>
          <p class="sur">Les notes</p>
          <h2 class="titre">La pyramide</h2>
          <dl class="pyramide">
            <div><dt>Tête</dt><dd>${p.notes.tete.join(', ')}</dd></div>
            <div><dt>Cœur</dt><dd>${p.notes.coeur.join(', ')}</dd></div>
            <div><dt>Fond</dt><dd>${p.notes.fond.join(', ')}</dd></div>
          </dl>
        </div>
        <div>
          <p class="sur">Sur la peau</p>
          <h2 class="titre">Tenue et sillage</h2>
          <dl class="pyramide"><div><dt>Tenue</dt><dd>${jauge(p.tenue)}</dd></div><div><dt>Sillage</dt><dd>${jauge(p.sillage)}</dd></div><div><dt>Formats</dt><dd class="mono">${p.formats.map((x) => x.ml + ' ml').join(' · ')}</dd></div></dl>
        </div>
        ${p.aSavoir ? `<aside class="a-savoir"><p class="sur">À savoir pour ce parfum</p><p>${esc(p.aSavoir)}</p></aside>` : ''}
      </section>
    </div>`;
  };

  /* ——— annonce ——— */
  const LIVRAISONS = [
    {id: 'relais', nom: 'Point relais', detail: 'Emballage de calage, marquage et assurance compris · 2 à 4 jours', prix: 4.9},
    {id: 'domicile', nom: 'À domicile', detail: 'Assurance comprise · 2 à 3 jours', prix: 7.9},
    {id: 'main', nom: 'Main propre sécurisée', detail: "Vous payez en ligne ; l'argent part quand vous scannez le code du vendeur", prix: 0},
  ];
  let achat = {livraison: 'relais', atelier: false};
  function rapport(a) {
    const p = P[a.p];
    const i = infos(a);
    const lignes = [
      ['Identité du vendeur', 'vérifiée par Stripe'],
      ['Code-barres', `${p.ean} : correspond à la fiche`],
      ['Code lot', `${a.lot} : produit en ${a.prod}, format conforme à la maison`],
      a.scelle ? ['Blister', 'intact sur toutes les photos'] : ['Pesée vendeur', `${nb(a.poids, 1)} g − ${nb(i.fmt.vide, 1)} g à vide ÷ 0,86 = ${nb((a.poids - i.fmt.vide) / DENSITE, 0)} ml`],
      ['Flacon et bouchon', 'conformes aux références'],
      ['Photos', 'aucune publication ailleurs trouvée'],
      ['Contrôle humain', `fait ${a.jours <= 1 ? 'hier' : `il y a ${a.jours} jours`}, en 1 h 12`],
    ];
    if (RANG[a.niveau] >= 1) {
      lignes.push(['Examen à l\'Atelier', 'vaporisateur, sertissage, gravure : conformes']);
      lignes.push(['Pesée Atelier', a.scelle ? 'poids conforme au flacon plein' : `${nb(a.restant + 0.2, 1)} ml, au dixième de gramme`]);
      lignes.push(['Évaluation olfactive', 'conforme au flacon de référence (évaluatrice n° 04)']);
      lignes.push(['Prélèvement laboratoire', a.id.endsWith('7') ? 'tiré au sort : conforme, aucune dilution' : 'non tiré au sort ce mois-ci']);
    }
    if (a.niveau === 'passeport') lignes.push(['Scellé', `${a.scelleNo}, puce NFC appairée`]);
    return lignes;
  }
  VUES.annonce = (id) => {
    const a = A[id];
    if (!a) return VUES.introuvable();
    const i = infos(a);
    const p = i.p;
    const v = vendeur(a);
    const autres = offresDe(a.p).filter((x) => x.id !== a.id);
    const duVendeur = ANNONCES.filter((x) => x.v === a.v && x.id !== a.id);
    achat = {livraison: a.mainPropre ? 'relais' : 'relais', atelier: false};
    const vues = [
      ['Face', flacon(p, a.ml, a.restant)],
      ['Dessous et code lot', `<span class="cliche-code mono">${esc(a.lot)}</span>`],
      ['Niveau', flacon(p, a.ml, a.restant, {echelle: true})],
      ['Balance', `<span class="cliche-code mono">${a.scelle ? 'scellé' : nb(a.poids, 1) + ' g'}</span>`],
      ['Boîte', `<span class="cliche-code">${a.boite ? 'boîte d\'origine' : 'sans boîte'}</span>`],
    ];
    return `<div class="env page">
      <nav class="fil" aria-label="Fil d'Ariane"><a href="#recherche">Acheter</a><span>/</span><a href="#parfum-${p.id}">${esc(p.nom)}</a><span>/</span><span>Flacon ${a.id.toUpperCase()}</span></nav>
      <div class="annonce-grille">
        <div class="annonce-visuel">
          <div class="scene">${flacon(p, a.ml, a.restant, {echelle: true, classe: 'flacon-scene'})}${badge(a.niveau)}</div>
          <div class="cliches" aria-label="Photos guidées du vendeur (dessinées dans le prototype)">${vues.map(([n, c]) => `<figure class="cliche"><div>${c}</div><figcaption>${n}</figcaption></figure>`).join('')}</div>
        </div>
        <div class="annonce-achat">
          <p class="sur"><a href="#parfum-${p.id}">${esc(p.maison)}</a></p>
          <h1 class="nom-parfum">${esc(p.nom)}</h1>
          <p class="parfum-meta">${esc(p.conc)} · flacon de ${a.ml}&nbsp;ml${a.vintage ? ' · vintage' : ''} · ${a.boite ? 'avec sa boîte' : 'sans boîte'}</p>
          ${remplissage(a, true)}
          <p class="mesure">${a.scelle ? 'Neuf sous blister, jamais ouvert.' : `${a.restant}&nbsp;ml mesurés sur ${a.ml}, soit ${i.rempli}&nbsp;%. Pesé à ${nb(a.poids, 1)}&nbsp;g.`}</p>
          <div class="prix-bloc">
            <p class="prix-grand">${eur(a.prix)}</p>
            <p class="mono">${parMl(i.prixMl)} · cote ${parMl(i.ref)}</p>
            ${tagPrix(a)}
          </div>
          <fieldset class="livraisons"><legend>Livraison</legend>
            ${LIVRAISONS.filter((l) => l.id !== 'main' || a.mainPropre)
              .map((l) => `<label class="livraison"><input type="radio" name="livraison" value="${l.id}" ${achat.livraison === l.id ? 'checked' : ''} data-livraison><span><strong>${l.nom}${l.id === 'main' ? ` · ${esc(v.ville)}` : ''}</strong><small>${l.detail}</small></span><span class="mono">${l.prix ? eur2(l.prix) : 'gratuit'}</span></label>`)
              .join('')}
          </fieldset>
          ${a.niveau === 'controle' ? `<label class="option-atelier"><input type="checkbox" data-atelier> <span><strong>Faire passer le flacon par l'Atelier</strong><small>Examen, pesée au 0,1 g, évaluation olfactive, avant qu'il ne vous soit envoyé. +1 à 2 jours.</small></span><span class="mono">${a.prix >= 300 ? 'offert' : '9,90 €'}</span></label>` : ''}
          <div id="recap">${recap(a)}</div>
          <p class="actions actions-achat">
            <button class="btn btn-plein btn-large" type="button" data-action="acheter" data-a="${a.id}">Acheter</button>
            <button class="btn btn-large" type="button" data-action="offre" data-a="${a.id}">Faire une offre</button>
          </p>
          ${duVendeur.length ? `<p class="petit">Ce vendeur a ${duVendeur.length} autre${duVendeur.length > 1 ? 's' : ''} flacon${duVendeur.length > 1 ? 's' : ''} : <a href="#recherche" data-vendeur="${a.v}">les ajouter au même colis</a>, un seul port.</p>` : ''}
          <aside class="garantie">
            <h2>${ico('bouclier')}Garantie Mouillette</h2>
            <ul><li>Authentique et conforme, à 3&nbsp;ml près, sinon remboursé, port compris.</li><li>7 jours après réception pour le vérifier.</li><li>Paiement bloqué jusqu'à la réception. Colis assuré.</li><li>Il ne vous plaît pas ? Revendez-le sans frais pendant 30 jours.</li></ul>
          </aside>
        </div>
      </div>

      <div class="annonce-bas">
        <section class="bloc rapport">
          <div class="bloc-tete"><div><p class="sur">Rapport de vérification</p><h2 class="titre">${NIVEAUX[a.niveau].nom}</h2></div>${a.niveau === 'passeport' ? `<a class="lien-fort" href="#passeport-${a.scelleNo}">Ouvrir le passeport ${ico('fleche')}</a>` : ''}</div>
          <ol class="controles">${rapport(a).map(([k, val]) => `<li>${ico('check')}<span class="c-k">${k}</span><span class="c-v mono">${esc(val)}</span></li>`).join('')}</ol>
        </section>
        <aside class="bloc vendeur-carte">
          <p class="sur">Le vendeur</p>
          <h2 class="titre">${esc(v.pseudo)}${v.nezFondateur ? ' <span class="pastille">Nez fondateur</span>' : ''}${v.conciergerie ? ' <span class="pastille">Conciergerie</span>' : ''}</h2>
          <dl class="faits">
            <div><dt>Ville</dt><dd>${esc(v.ville)}</dd></div>
            <div><dt>Membre depuis</dt><dd>${v.depuis}</dd></div>
            <div><dt>Ventes</dt><dd class="mono">${v.ventes}</dd></div>
            <div><dt>Délai d'envoi moyen</dt><dd class="mono">${v.envoi != null ? nb(v.envoi, 1) + ' jour' : '—'}</dd></div>
            <div><dt>Ventes conformes</dt><dd class="mono">${v.conformite != null ? nb(v.conformite, 1) + ' %' : 'première vente'}</dd></div>
          </dl>
          <p class="petit">Les vendeurs sont notés sur des faits, pas sur des étoiles.</p>
        </aside>
      </div>
      ${autres.length ? `<section class="bloc"><div class="bloc-tete"><div><p class="sur">Le même parfum</p><h2 class="titre">Autres flacons de ${esc(p.nom)}</h2></div><a class="lien-fort" href="#parfum-${p.id}">La fiche et la cote ${ico('fleche')}</a></div><div class="grille-cartes">${autres.map(carteAnnonce).join('')}</div></section>` : ''}
    </div>`;
  };
  function recap(a) {
    const l = LIVRAISONS.find((x) => x.id === achat.livraison);
    const protection = Math.round((a.prix * 0.05 + 0.7) * 100) / 100;
    const atelier = achat.atelier ? (a.prix >= 300 ? 0 : 9.9) : 0;
    const total = a.prix + protection + l.prix + atelier;
    return `<dl class="recap">
      <div><dt>Flacon</dt><dd class="mono">${eur2(a.prix)}</dd></div>
      <div><dt>Protection acheteur (5&nbsp;% + 0,70&nbsp;€)</dt><dd class="mono">${eur2(protection)}</dd></div>
      <div><dt>${l.nom}</dt><dd class="mono">${l.prix ? eur2(l.prix) : 'gratuit'}</dd></div>
      ${achat.atelier ? `<div><dt>Passage par l'Atelier</dt><dd class="mono">${atelier ? eur2(atelier) : 'offert'}</dd></div>` : ''}
      <div class="recap-total"><dt>Total</dt><dd class="mono">${eur2(total)}</dd></div>
      <div class="recap-vendeur"><dt>Le vendeur touchera</dt><dd class="mono">${eur2(a.prix)}</dd></div>
    </dl>`;
  }

  /* ——— vendre ——— */
  const V = {etape: 1, p: null, ml: null, scelle: false, poids: '', photos: {}, prix: null, mode: 'controle', publie: false};
  const PRISES = [
    ['face', 'Le flacon de face', "Bien droit, l'étiquette lisible"],
    ['dessous', 'Le dessous et le code lot', 'Le code gravé ou imprimé, net'],
    ['niveau', 'Le niveau à hauteur d\'œil', 'Sur fond clair, sans contre-jour'],
    ['balance', 'Sur la balance', "L'écran et le flacon dans la même photo"],
    ['boite', 'La boîte (si vous l\'avez)', 'Le dessous, avec le code-barres'],
  ];
  function mlMesures() {
    if (!V.p) return 0;
    const f = P[V.p].formats.find((x) => x.ml === V.ml);
    if (V.scelle) return V.ml;
    const g = parseFloat(String(V.poids).replace(',', '.'));
    if (!g || !f) return null;
    return Math.max(0, Math.min(V.ml, Math.round((g - f.vide) / DENSITE)));
  }
  function prixConseille() {
    const p = P[V.p];
    const ml = mlMesures() || 0;
    return Math.max(5, Math.round(p.cote * (V.scelle ? 1.12 : 1) * ml));
  }
  const chance = (prix) => {
    const ref = prixConseille();
    const x = (prix - ref) / ref;
    return Math.round(100 / (1 + Math.exp(9 * (x - 0.02))) * 0.92 + 4);
  };
  VUES.vendre = () => {
    const pas = ['Le parfum', 'Le niveau', 'Les photos', 'Le prix', 'La vérification'];
    if (V.publie) return vendrePublie();
    return `<div class="env page vendre">
      <div class="page-tete"><p class="sur">Vendre · 0&nbsp;% de commission</p><h1 class="titre-page">Mettre un flacon en vente</h1></div>
      <ol class="stepper" aria-label="Étapes">${pas.map((n, k) => `<li class="${k + 1 === V.etape ? 'actif' : k + 1 < V.etape ? 'fait' : ''}" ${k + 1 === V.etape ? 'aria-current="step"' : ''}><span class="mono">${k + 1}</span>${n}</li>`).join('')}</ol>
      <div class="vendre-grille">
        <div class="vendre-etape">${[null, etape1, etape2, etape3, etape4, etape5][V.etape]()}</div>
        <aside class="vendre-apercu">${apercu()}</aside>
      </div>
    </div>`;
  };
  function apercu() {
    if (!V.p) return `<div class="apercu-vide"><p class="sur">Aperçu</p><p>Choisissez un parfum : la fiche se remplit toute seule.</p></div>`;
    const p = P[V.p];
    const ml = mlMesures();
    return `<p class="sur">Aperçu de l'annonce</p>
      <div class="apercu-flacon">${flacon(p, V.ml, ml == null ? V.ml : ml, {echelle: ml != null})}</div>
      <p class="sur">${esc(p.maison)}</p><p class="apercu-nom">${esc(p.nom)}</p>
      <p class="parfum-meta">${esc(p.conc)} · ${V.ml}&nbsp;ml${V.scelle ? ' · scellé' : ml != null ? ` · ${ml}&nbsp;ml mesurés` : ''}</p>
      ${V.prix ? `<p class="apercu-prix">${eur(V.prix)} <span class="mono">${ml ? parMl(V.prix / ml) : ''}</span></p>` : ''}
      <dl class="mini-dl"><div><dt>Cote</dt><dd class="mono">${parMl(p.cote)}</dd></div><div><dt>Ventes 90 j</dt><dd class="mono">${p.ventes90}</dd></div></dl>`;
  }
  function etape1() {
    return `<h2 class="titre">Quel parfum vendez-vous ?</h2>
      <p>Scannez le code-barres de la boîte ou du flacon, ou cherchez-le.</p>
      <p class="actions"><button class="btn btn-plein" type="button" data-action="scanner">${ico('photo')}Scanner le code-barres</button></p>
      <label class="vh" for="q-vente">Chercher un parfum</label>
      <input id="q-vente" type="search" placeholder="Maison ou nom du parfum" autocomplete="off" data-cherche-vente>
      <ul class="choix-parfums" id="choix-parfums">${choixParfums('')}</ul>`;
  }
  function choixParfums(q) {
    const n = normal(q);
    return PARFUMS.filter((p) => !n || normal(p.maison + ' ' + p.nom).includes(n))
      .slice(0, 8)
      .map((p) => `<li><button type="button" class="choix-parfum ${V.p === p.id ? 'actif' : ''}" data-choisir="${p.id}"><span class="sur">${esc(p.maison)}</span><span>${esc(p.nom)}</span><span class="mono">${esc(p.conc)}</span></button></li>`)
      .join('') || '<li class="petit">Pas encore dans la Bibliothèque : on l\'ajoute pour vous en moins de 24 h.</li>';
  }
  function etape2() {
    const p = P[V.p];
    const f = p.formats.find((x) => x.ml === V.ml);
    const ml = mlMesures();
    return `<h2 class="titre">Quel flacon, et combien en reste-t-il ?</h2>
      <fieldset class="formats"><legend>Contenance</legend>${p.formats.map((x) => `<label class="pilule"><input type="radio" name="ml" value="${x.ml}" ${V.ml === x.ml ? 'checked' : ''} data-ml> ${x.ml}&nbsp;ml</label>`).join('')}</fieldset>
      <fieldset class="formats"><legend>État</legend>
        <label class="pilule"><input type="radio" name="scelle" value="0" ${!V.scelle ? 'checked' : ''} data-scelle> Entamé</label>
        <label class="pilule"><input type="radio" name="scelle" value="1" ${V.scelle ? 'checked' : ''} data-scelle> Neuf, sous blister</label>
      </fieldset>
      ${V.scelle ? '<p>Un flacon scellé n\'a pas besoin d\'être pesé : on vérifiera le blister sur les photos.</p>' : `
      <div class="pesee">
        <label for="poids">Posez le flacon <strong>sans son bouchon</strong> sur une balance de cuisine. Que lit-elle&nbsp;?</label>
        <div class="pesee-champ"><input id="poids" inputmode="decimal" value="${esc(V.poids)}" placeholder="ex. ${nb(f.vide + 0.6 * f.ml * DENSITE, 0)}" data-poids><span>g</span></div>
        <p class="mono pesee-calc" id="pesee-calc">${ml != null ? `(${nb(parseFloat(String(V.poids).replace(',', '.')), 1)} − ${nb(f.vide, 1)}) g ÷ 0,86 = <strong>${ml} ml</strong> sur ${V.ml}` : `Poids à vide de référence de ce flacon : ${nb(f.vide, 0)} g (sans bouchon).`}</p>
        <p class="petit">À 2 ml près. Si l'Atelier mesure plus de 3 ml de moins que vous, l'annonce est corrigée avant la vente.</p>
      </div>`}
      <p class="actions"><button class="btn" type="button" data-etape="1">Retour</button><button class="btn btn-plein" type="button" data-etape="3" ${!V.scelle && mlMesures() == null ? 'disabled' : ''}>Continuer</button></p>`;
  }
  function etape3() {
    const n = Object.keys(V.photos).length;
    return `<h2 class="titre">Les photos, guidées</h2>
      <p>Un gabarit s'affiche à l'écran pour chaque photo dans l'application. Ici, touchez une case ou choisissez une image.</p>
      <div class="prises">${PRISES.map(([k, t, d]) => `<label class="prise ${V.photos[k] ? 'faite' : ''}"><input class="vh" type="file" accept="image/*" data-photo="${k}">
          <span class="prise-cadre">${V.photos[k] && V.photos[k] !== true ? `<img src="${V.photos[k]}" alt="">` : V.photos[k] ? ico('check') : ico('photo')}</span>
          <span><strong>${t}</strong><small>${d}</small></span>
          <button type="button" class="prise-ok" data-prise="${k}">${V.photos[k] ? 'Prise' : 'Simuler'}</button>
        </label>`).join('')}</div>
      <p class="petit mono">${n}/5 photos · la boîte est facultative</p>
      <p class="actions"><button class="btn" type="button" data-etape="2">Retour</button><button class="btn btn-plein" type="button" data-etape="4" ${n < 4 ? 'disabled' : ''}>Continuer</button></p>`;
  }
  function etape4() {
    const conseil = prixConseille();
    if (!V.prix) V.prix = conseil;
    const ml = mlMesures();
    const p = P[V.p];
    return `<h2 class="titre">Votre prix</h2>
      <p>Cote de ${esc(p.nom)}&nbsp;: <span class="mono">${parMl(p.cote)}</span>${V.scelle ? ' (+12 % pour un flacon scellé)' : ''}. Pour ${ml}&nbsp;ml, on conseille <strong class="mono">${eur(conseil)}</strong>.</p>
      <div class="prix-reglage">
        <label for="prix">Prix de vente</label>
        <div class="prix-ligne"><input id="prix" type="range" min="${Math.round(conseil * 0.6)}" max="${Math.round(conseil * 1.4)}" value="${V.prix}" data-prix><output class="mono prix-out" id="prix-out">${eur(V.prix)}</output></div>
        <div id="prix-infos">${prixInfos()}</div>
      </div>
      <p class="actions"><button class="btn" type="button" data-etape="3">Retour</button><button class="btn btn-plein" type="button" data-etape="5">Continuer</button></p>`;
  }
  function prixInfos() {
    const ml = mlMesures();
    const c = chance(V.prix);
    return `<dl class="recap">
      <div><dt>Prix au millilitre</dt><dd class="mono">${parMl(V.prix / ml)}</dd></div>
      <div><dt>Chance de vendre sous 14 jours</dt><dd class="mono">${c}&nbsp;%</dd></div>
      <div class="recap-total"><dt>Vous touchez</dt><dd class="mono">${eur2(V.prix)}</dd></div>
      <div class="recap-vendeur"><dt>Avec une commission de 10&nbsp;%</dt><dd class="mono">${eur2(V.prix * 0.9)}</dd></div>
    </dl><span class="chance" aria-hidden="true"><i style="width:${c}%"></i></span>`;
  }
  function etape5() {
    const modes = [
      ['controle', 'Publier maintenant', 'Contrôle humain en moins de 2 heures. Badge « Contrôlé ». Vous expédiez à la vente, l\'emballage vous est envoyé.', 'Gratuit'],
      ['atelier', 'Passer par l\'Atelier', "Vous nous envoyez le flacon (étiquette offerte). On l'authentifie, on le pèse, on pose le scellé : badge « Passeport ». Il se vend plus vite.", 'Offert dès 150 €, sinon 4,90 €'],
      ['conciergerie', 'La Conciergerie', 'On s\'occupe de tout : authentification, photos en studio, prix, vente, envoi. Pour ceux qui ont plusieurs flacons.', '20 % (6 € minimum)'],
    ];
    return `<h2 class="titre">Comment voulez-vous vendre ?</h2>
      <div class="modes">${modes.map(([k, t, d, prix]) => `<label class="mode ${V.mode === k ? 'actif' : ''}"><input type="radio" name="mode" value="${k}" ${V.mode === k ? 'checked' : ''} data-mode><span><strong>${t}</strong><small>${d}</small></span><span class="mono">${prix}</span></label>`).join('')}</div>
      <p class="actions"><button class="btn" type="button" data-etape="4">Retour</button><button class="btn btn-plein" type="button" data-action="publier">Publier l'annonce</button></p>`;
  }
  function vendrePublie() {
    const p = P[V.p];
    const ml = mlMesures();
    const recu = V.mode === 'conciergerie' ? Math.min(V.prix * 0.8, V.prix - 6) : V.prix;
    return `<div class="env page vendre">
      <div class="publie">
        <div class="publie-flacon">${flacon(p, V.ml, ml, {echelle: true})}</div>
        <div>
          <p class="sur">Annonce envoyée (prototype)</p>
          <h1 class="titre-page">${esc(p.nom)}, ${ml}&nbsp;ml, ${eur(V.prix)}</h1>
          <ol class="suite">
            ${V.mode === 'controle' ? '<li><strong>Dans moins de 2 heures</strong> : un humain relit les photos, la pesée et le code lot. Vous êtes prévenu à la publication.</li><li><strong>À la vente</strong> : l\'emballage de calage et l\'étiquette arrivent chez vous ou au point relais.</li>' : '<li><strong>Aujourd\'hui</strong> : votre étiquette d\'envoi vers l\'Atelier, dans l\'application.</li><li><strong>À réception</strong> : examen, pesée, évaluation, scellé. L\'annonce passe en « Passeport ».</li>'}
            <li><strong>Après la réception par l'acheteur</strong> : vous touchez <span class="mono">${eur2(recu)}</span>, virés sous 24 h.</li>
          </ol>
          <p class="actions"><a class="btn btn-plein" href="#annonce-m4127">Voir une annonce publiée</a><button class="btn" type="button" data-action="nouvelle-vente">Vendre un autre flacon</button></p>
        </div>
      </div>
    </div>`;
  }

  /* ——— passeport ——— */
  VUES.passeport = (no) => {
    const a = ANNONCES.find((x) => x.scelleNo === no) || A.m4127;
    const p = P[a.p];
    const i = infos(a);
    const evts = [
      [`${a.prod}`, 'Production', `Code lot ${a.lot}, décodé selon le format de la maison`],
      ['avril 2026', '1re vente sur Mouillette', `${a.ml} ml · niveau déclaré ${Math.min(a.ml, a.restant + 9)} ml, contrôlé par pesée`],
      ['21 nov. 2026', 'Authentifié à l\'Atelier (Paris 10e)', 'Examen du flacon, du vaporisateur et du sertissage : conformes'],
      ['21 nov. 2026', 'Pesée au dixième de gramme', a.poids ? `${nb(a.poids, 1)} g → ${a.restant} ml` : 'Poids conforme au flacon plein'],
      ['21 nov. 2026', 'Évaluation olfactive', 'Conforme au flacon de référence'],
      ['21 nov. 2026', `Scellé ${a.scelleNo} posé`, 'Puce NFC appairée à ce passeport'],
      ['aujourd\'hui', 'En vente', `${eur(a.prix)} · ${parMl(i.prixMl)}`],
    ];
    return `<div class="env page">
      <div class="passeport">
        <header class="passeport-tete">
          <p class="sur">Passeport du flacon</p>
          <h1 class="mono passeport-no">${esc(a.scelleNo)}</h1>
          <p class="passeport-etat">${ico('nfc')}Scellé intact · dernière lecture NFC il y a 2 h</p>
        </header>
        <div class="passeport-corps">
          <div class="passeport-flacon">${flacon(p, a.ml, a.restant, {echelle: true})}</div>
          <dl class="faits passeport-faits">
            <div><dt>Parfum</dt><dd><em>${esc(p.nom)}</em>, ${esc(p.maison)}</dd></div>
            <div><dt>Concentration</dt><dd>${esc(p.conc)}</dd></div>
            <div><dt>Flacon</dt><dd class="mono">${a.ml} ml</dd></div>
            <div><dt>Code lot</dt><dd class="mono">${esc(a.lot)}</dd></div>
            <div><dt>Production</dt><dd>${a.prod}</dd></div>
            <div><dt>Niveau mesuré</dt><dd class="mono">${a.restant} ml (${i.rempli} %)</dd></div>
            <div><dt>Propriétaires</dt><dd class="mono">2</dd></div>
            <div><dt>Authenticité</dt><dd class="ok">Conforme</dd></div>
          </dl>
        </div>
        <ol class="frise">${evts.map(([d, t, x]) => `<li><span class="mono frise-date">${d}</span><span class="frise-t">${t}</span><span class="frise-x">${esc(x)}</span></li>`).join('')}</ol>
        <p class="petit">Le passeport ne contient aucune donnée personnelle : ni nom, ni adresse. Il suit le flacon à chaque revente.</p>
        <form class="verifier" data-form="scelle"><label for="no-scelle">Vérifier un autre scellé</label><div class="pesee-champ"><input id="no-scelle" name="no" placeholder="MO-000000" autocomplete="off"><button class="btn btn-petit" type="submit">Vérifier</button></div></form>
        ${a ? `<p class="actions"><a class="btn btn-plein" href="#annonce-${a.id}">Voir l'annonce</a></p>` : ''}
      </div>
    </div>`;
  };

  /* ——— confiance ——— */
  VUES.confiance = () => `<div class="env page texte-page">
    <div class="page-tete"><p class="sur">Confiance</p><h1 class="titre-page">Ce que veut dire « vérifié » ici</h1>
    <p class="chapo">Ailleurs, le vendeur déclare et la plateforme regarde. Ici, on mesure, on examine, et on garantit par écrit.</p></div>

    <section class="bloc"><h2 class="titre">L'Atelier, étape par étape</h2>
      <ol class="atelier">
        <li><strong>Réception et photo d'arrivée.</strong> Le colis est ouvert devant une caméra.</li>
        <li><strong>Examen du flacon.</strong> Vaporisateur, sertissage, bouchon, gravure, étiquette, comparés à nos flacons de référence.</li>
        <li><strong>Code lot.</strong> Lu sur le flacon et sur la boîte, décodé selon le format de la maison, comparé entre les deux.</li>
        <li><strong>Pesée au dixième de gramme.</strong> Le niveau exact, qui remplace celui du vendeur s'il diffère.</li>
        <li><strong>Évaluation olfactive.</strong> Sur mouillette, à côté d'un flacon de référence, par un évaluateur formé.</li>
        <li><strong>Laboratoire.</strong> Des prélèvements tirés au sort sont analysés contre la dilution ; les résultats sont publiés chaque trimestre.</li>
        <li><strong>Scellé et passeport.</strong> Un scellé numéroté inviolable et une puce NFC ; le passeport s'ouvre au téléphone.</li>
      </ol>
    </section>

    <section class="bloc deux-col">
      <div><h2 class="titre">La garantie, par écrit</h2>
        <ul class="coches"><li>Authentique, sinon remboursé, port compris.</li><li>Conforme à l'annonce : niveau à 3&nbsp;ml près, état, boîte.</li><li>7 jours après réception pour le signaler, depuis l'application, photo à l'appui.</li><li>C'est Mouillette qui rembourse, puis qui se retourne vers le vendeur.</li><li>Colis perdu : l'acheteur est remboursé et le vendeur est payé.</li></ul>
      </div>
      <div><h2 class="titre">Contre la dilution</h2>
        <p>La pesée et le scellé empêchent de compléter un flacon sans que cela se voie. Les prélèvements en laboratoire sont tirés au sort, vendeurs fréquents en priorité. Un flacon dilué, c'est un compte fermé, un remboursement immédiat et un signalement.</p>
      </div>
    </section>

    <section class="bloc deux-col">
      <div><h2 class="titre">Le transport du parfum</h2>
        <p>Un parfum est un liquide inflammable : La Poste l'interdit en colis. Nos envois passent par un transporteur sous contrat, par la route, avec un emballage de calage, un absorbant et le marquage prévu pour les petites quantités. Tout est fourni au vendeur à la vente.</p>
      </div>
      <div><h2 class="titre">Les marques</h2>
        <p>Les maisons ont un espace pour signaler une annonce, nous transmettre leurs références de flacons et de codes lot, et reprendre leurs propres flacons. Les contrefaçons repérées à l'Atelier sont retirées du circuit et signalées.</p>
      </div>
    </section>

    <section class="bloc"><h2 class="titre">La Conciergerie</h2>
      <p>Vous avez plusieurs flacons et pas le temps ? On vous envoie un kit, vous y glissez vos flacons, et on fait le reste : authentification, photos en studio, prix avec votre accord, vente, envoi. Vous touchez 80&nbsp;% du prix de vente (6&nbsp;€ de commission minimum).</p>
      <p class="actions"><a class="btn btn-plein" href="#vendre">Vendre un flacon</a></p>
    </section>
  </div>`;

  /* ——— tarifs ——— */
  let simPrix = 100;
  VUES.tarifs = () => `<div class="env page texte-page">
    <div class="page-tete"><p class="sur">Tarifs</p><h1 class="titre-page">Le vendeur garde tout</h1>
    <p class="chapo">L'acheteur paie la protection, comme il en a l'habitude. Le reste est écrit ici, en entier.</p></div>
    <section class="bloc">
      <div class="table-defile"><table class="tarifs">
        <tbody>
          <tr><th scope="row">Commission vendeur</th><td class="mono">0&nbsp;%</td></tr>
          <tr><th scope="row">Protection acheteur (paiement bloqué, garantie, assurance, service client)</th><td class="mono">5&nbsp;% + 0,70&nbsp;€</td></tr>
          <tr><th scope="row">Passage par l'Atelier, à la demande de l'acheteur</th><td class="mono">9,90&nbsp;€, offert dès 300&nbsp;€</td></tr>
          <tr><th scope="row">Passage par l'Atelier avant la mise en vente, à la demande du vendeur (scellé et passeport compris)</th><td class="mono">4,90&nbsp;€, offert dès 150&nbsp;€</td></tr>
          <tr><th scope="row">Livraison en point relais, emballage et assurance compris</th><td class="mono">dès 4,90&nbsp;€</td></tr>
          <tr><th scope="row">Remise en main propre sécurisée</th><td class="mono">gratuit</td></tr>
          <tr><th scope="row">Conciergerie</th><td class="mono">20&nbsp;% (6&nbsp;€ minimum)</td></tr>
          <tr><th scope="row">Mise en avant d'une annonce, 3 jours</th><td class="mono">1,49&nbsp;€</td></tr>
          <tr><th scope="row">Revente dans les 30 jours d'un flacon acheté ici</th><td class="mono">sans frais</td></tr>
        </tbody>
      </table></div>
    </section>
    <section class="bloc simulateur">
      <h2 class="titre">Simuler une vente</h2>
      <label for="sim-prix">Prix de vente du flacon</label>
      <div class="prix-ligne"><input id="sim-prix" type="range" min="10" max="500" step="5" value="${simPrix}" data-sim><output class="mono prix-out" id="sim-out">${eur(simPrix)}</output></div>
      <div id="sim-table">${simTable()}</div>
    </section>
  </div>`;
  function simTable() {
    const ici = {acheteur: simPrix * 1.05 + 0.7, vendeur: simPrix, plateforme: simPrix * 0.05 + 0.7};
    const ail = {acheteur: simPrix * 1.05, vendeur: simPrix * 0.9, plateforme: simPrix * 0.15};
    return `<div class="table-defile"><table class="sim">
      <thead><tr><th scope="col"></th><th scope="col" class="num">10&nbsp;% vendeur + 5&nbsp;% acheteur</th><th scope="col" class="num">Mouillette</th></tr></thead>
      <tbody>
        <tr><th scope="row">L'acheteur paie (hors port)</th><td class="num mono">${eur2(ail.acheteur)}</td><td class="num mono">${eur2(ici.acheteur)}</td></tr>
        <tr class="fort"><th scope="row">Le vendeur touche</th><td class="num mono">${eur2(ail.vendeur)}</td><td class="num mono">${eur2(ici.vendeur)}</td></tr>
        <tr><th scope="row">La plateforme garde</th><td class="num mono">${eur2(ail.plateforme)}</td><td class="num mono">${eur2(ici.plateforme)}</td></tr>
        <tr><th scope="row">Authenticité garantie par la plateforme</th><td class="num">non</td><td class="num">oui</td></tr>
      </tbody></table></div>`;
  }

  /* ——— étagère ——— */
  VUES.etagere = () => {
    const e = ETAGERE;
    const valeur = e.flacons.reduce((s, f) => s + P[f.p].cote * f.restant, 0);
    const ech = e.echange;
    return `<div class="env page">
      <div class="page-tete"><p class="sur">Exemple · l'étagère de ${e.prenom}</p><h1 class="titre-page">Mon étagère</h1>
        <p class="chapo">${e.flacons.length} flacons, d'une valeur de <strong class="mono">${eur(Math.round(valeur))}</strong> à la cote du jour.</p></div>
      <section class="bloc">
        <div class="etagere">${e.flacons
          .map((f) => {
            const p = P[f.p];
            return `<article class="etagere-item"><a href="#parfum-${p.id}">${flacon(p, f.ml, f.restant)}</a>
              <p class="sur">${esc(p.maison)}</p><h3 class="carte-nom">${esc(p.nom)}</h3>
              <p class="mono petit">${f.restant}/${f.ml} ml · ${eur(Math.round(p.cote * f.restant))}</p>
              <button class="btn btn-petit" type="button" data-vendre-etagere="${p.id}" data-ml="${f.ml}" data-restant="${f.restant}">Vendre</button></article>`;
          })
          .join('')}</div>
      </section>
      <div class="deux-col">
        <section class="bloc">
          <p class="sur">Alertes</p><h2 class="titre">Prévenez-moi quand…</h2>
          <ul class="alertes">${[...e.envies, ...alertes.filter((x) => !e.envies.some((y) => y.p === x.p))]
            .map((x) => {
              const p = P[x.p];
              const match = offresDe(x.p).filter((a) => a.prix / a.restant <= x.seuil && (a.restant / a.ml) * 100 >= x.niveauMin && RANG[a.niveau] >= RANG[x.verif]);
              return `<li><a href="#parfum-${p.id}"><em>${esc(p.nom)}</em></a><span class="mono">≤ ${parMl(x.seuil)} · ≥ ${x.niveauMin}&nbsp;% · ${NIVEAUX[x.verif].court}</span>${match.length ? `<a class="tag tag-bon" href="#annonce-${match[0].id}">${match.length} flacon trouvé</a>` : '<span class="tag tag-cote">en veille</span>'}</li>`;
            })
            .join('')}</ul>
        </section>
        <section class="bloc echange">
          <p class="sur">Échange proposé</p><h2 class="titre">${esc(ech.de)} vous propose un échange</h2>
          <div class="echange-duo">
            <figure>${flacon(P[ech.propose.p], ech.propose.ml, ech.propose.restant)}<figcaption><em>${esc(P[ech.propose.p].nom)}</em><span class="mono">${ech.propose.restant}/${ech.propose.ml} ml</span></figcaption></figure>
            <span class="echange-signe">${ico('echange')}</span>
            <figure>${flacon(P[ech.contre.p], ech.contre.ml, ech.contre.restant)}<figcaption><em>${esc(P[ech.contre.p].nom)}</em><span class="mono">${ech.contre.restant}/${ech.contre.ml} ml</span></figcaption></figure>
          </div>
          <p>Contre votre Delina, plus <strong class="mono">${eur(ech.soulte)}</strong> en votre faveur. À la cote : ${eur(Math.round(P[ech.propose.p].cote * ech.propose.restant))} contre ${eur(Math.round(P[ech.contre.p].cote * ech.contre.restant))}.</p>
          <p class="petit">Les deux flacons sont expédiés en même temps ; la soulte est bloquée jusqu'aux deux réceptions.</p>
          <p class="actions"><button class="btn btn-plein" type="button" data-action="echange-ok">Accepter</button><button class="btn" type="button" data-action="echange-contre">Contre-proposer</button></p>
        </section>
      </div>
    </div>`;
  };

  VUES.introuvable = () => `<div class="env page"><h1 class="titre-page">Cette page n'existe pas</h1><p><a href="#accueil">Retour à l'accueil</a></p></div>`;

  /* ——— fenêtres et messages ——— */
  const modale = document.getElementById('modale');
  function ouvrir(html) {
    modale.innerHTML = `<div class="modale-fond" data-action="fermer"></div><div class="modale-boite" role="dialog" aria-modal="true">${html}<button class="modale-x" type="button" data-action="fermer" aria-label="Fermer">${ico('croix')}</button></div>`;
    modale.hidden = false;
    const champ = modale.querySelector('input, button.btn');
    if (champ) champ.focus();
  }
  function fermer() {
    modale.hidden = true;
    modale.innerHTML = '';
  }
  let minuteur;
  function message(t) {
    const m = document.getElementById('message');
    m.textContent = t;
    m.hidden = false;
    clearTimeout(minuteur);
    minuteur = setTimeout(() => (m.hidden = true), 3800);
  }

  function modaleAlerte(pid) {
    const p = P[pid];
    ouvrir(`<form data-form="alerte" data-p="${pid}"><p class="sur">Alerte</p><h2 class="titre">${esc(p.nom)}</h2>
      <label for="seuil">Prévenez-moi sous ce prix au millilitre</label>
      <div class="pesee-champ"><input id="seuil" name="seuil" inputmode="decimal" value="${nb(p.cote * 0.9, 2)}"><span>€/ml</span></div>
      <p class="petit">La cote est à ${parMl(p.cote)}.</p>
      <label for="niv">Rempli au moins à</label>
      <select id="niv" name="niveauMin">${[0, 50, 70, 90].map((v) => `<option value="${v}" ${v === 50 ? 'selected' : ''}>${v ? v + ' %' : 'peu importe'}</option>`).join('')}</select>
      <label for="ver">Vérification minimum</label>
      <select id="ver" name="verif"><option value="controle">Contrôlé</option><option value="atelier">Authentifié Atelier</option><option value="passeport">Avec passeport</option></select>
      <p class="actions"><button class="btn btn-plein" type="submit">Créer l'alerte</button></p></form>`);
  }
  function modaleOffre(a) {
    const min = Math.ceil(a.prix * 0.75);
    ouvrir(`<form data-form="offre" data-a="${a.id}"><p class="sur">Faire une offre</p><h2 class="titre">${esc(P[a.p].nom)}, ${a.restant}&nbsp;ml</h2>
      <label for="montant">Votre offre (à partir de ${eur(min)})</label>
      <div class="pesee-champ"><input id="montant" name="montant" inputmode="decimal" value="${Math.round(a.prix * 0.9)}"><span>€</span></div>
      <p class="petit">Le vendeur a 24 heures pour accepter, refuser ou contre-proposer. Rien n'est débité avant son accord.</p>
      <p class="actions"><button class="btn btn-plein" type="submit">Envoyer l'offre</button></p></form>`);
  }
  function modaleAchat(a) {
    ouvrir(`<p class="sur">Paiement</p><h2 class="titre">${esc(P[a.p].nom)}</h2>${recap(a)}
      <p class="petit">Carte, Apple Pay, Google Pay, PayPal${a.prix >= 150 ? ', ou en 3 fois' : ''}. L'argent reste bloqué jusqu'à ce que vous confirmiez la réception.</p>
      <p class="actions"><button class="btn btn-plein" type="button" data-action="payer">Payer (simulation)</button></p>`);
  }

  /* ——— rendu et navigation ——— */
  const vue = document.getElementById('vue');
  function rendre() {
    const h = decodeURIComponent(location.hash.slice(1)) || 'accueil';
    let html;
    let nom = h;
    if (h.startsWith('parfum-')) html = VUES.parfum(h.slice(7));
    else if (h.startsWith('annonce-')) html = VUES.annonce(h.slice(8));
    else if (h.startsWith('passeport-')) html = VUES.passeport(h.slice(10));
    else if (VUES[h]) html = VUES[h]();
    else {
      html = VUES.introuvable();
      nom = 'introuvable';
    }
    vue.innerHTML = html;
    ajusterCourbe();
    const rubrique = {parfum: 'recherche', annonce: 'recherche', passeport: 'confiance'}[nom.split('-')[0]] || nom.split('-')[0];
    document.querySelectorAll('[data-nav]').forEach((a) => a.setAttribute('aria-current', a.dataset.nav === rubrique ? 'page' : 'false'));
    const h1 = vue.querySelector('h1');
    document.title = (h === 'accueil' ? 'Mouillette' : `${h1 ? h1.textContent.trim() : 'Mouillette'} · Mouillette`).slice(0, 90);
  }
  function ajusterCourbe() {
    const cadre = vue.querySelector('.courbe-cadre');
    if (cadre) cadre.innerHTML = courbe(P[cadre.dataset.p], Math.max(300, Math.round(cadre.clientWidth - 24)));
  }
  let redim;
  window.addEventListener('resize', () => {
    clearTimeout(redim);
    redim = setTimeout(ajusterCourbe, 150);
  });
  function aller(h) {
    if (location.hash.slice(1) === h) rendre();
    else location.hash = h;
  }
  window.addEventListener('hashchange', () => {
    fermer();
    rendre();
    window.scrollTo(0, 0);
  });

  document.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-form]');
    if (!f) return;
    e.preventDefault();
    const d = new FormData(f);
    const type = f.dataset.form;
    if (type === 'recherche' || type === 'entete') {
      R.q = String(d.get('q') || '');
      R.vue = 'parfums';
      aller('recherche');
    } else if (type === 'alerte') {
      const seuil = parseFloat(String(d.get('seuil')).replace(',', '.')) || P[f.dataset.p].cote;
      alertes.push({p: f.dataset.p, seuil, niveauMin: +d.get('niveauMin'), verif: d.get('verif')});
      store.set('alertes', alertes);
      fermer();
      message(`Alerte créée : ${P[f.dataset.p].nom} sous ${parMl(seuil)}.`);
      rendre();
    } else if (type === 'offre') {
      const a = A[f.dataset.a];
      const m = parseFloat(String(d.get('montant')).replace(',', '.'));
      if (!m || m < Math.ceil(a.prix * 0.75)) {
        f.querySelector('.petit').textContent = `L'offre minimale pour ce flacon est ${eur(Math.ceil(a.prix * 0.75))}.`;
        return;
      }
      fermer();
      message(`Offre de ${eur(m)} envoyée à ${vendeur(a).pseudo} : réponse sous 24 h.`);
    } else if (type === 'scelle') {
      const no = String(d.get('no') || '').trim().toUpperCase();
      const a = ANNONCES.find((x) => x.scelleNo === no);
      if (a) aller('passeport-' + no);
      else message(`Aucun passeport ne porte le numéro ${no || '—'}. Vérifiez le scellé, ou signalez-le-nous.`);
    } else if (type === 'filtres') {
      R.q = String(d.get('q') || '');
      majResultats();
    }
  });

  function majResultats() {
    const r = document.getElementById('resultats');
    if (r) r.innerHTML = resultats();
  }

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.closest('[data-form="filtres"]')) {
      const f = t.closest('form');
      const d = new FormData(f);
      R.q = String(d.get('q') || '');
      R.verif = d.get('verif');
      R.etat = d.get('etat');
      R.niveauMin = +d.get('niveauMin');
      R.maisons = new Set(d.getAll('maison'));
      R.mainPropre = d.get('mainPropre') != null;
      const o = document.getElementById('niv-out');
      if (o) o.textContent = R.niveauMin + ' %';
      majResultats();
    } else if (t.matches('[data-cherche-vente]')) {
      document.getElementById('choix-parfums').innerHTML = choixParfums(t.value);
    } else if (t.matches('[data-poids]')) {
      V.poids = t.value;
      V.prix = null;
      const ml = mlMesures();
      const f = P[V.p].formats.find((x) => x.ml === V.ml);
      document.getElementById('pesee-calc').innerHTML = ml != null ? `(${nb(parseFloat(V.poids.replace(',', '.')), 1)} − ${nb(f.vide, 1)}) g ÷ 0,86 = <strong>${ml} ml</strong> sur ${V.ml}` : `Poids à vide de référence de ce flacon : ${nb(f.vide, 0)} g (sans bouchon).`;
      document.querySelector('.vendre-apercu').innerHTML = apercu();
      const suite = document.querySelector('[data-etape="3"]');
      if (suite) suite.disabled = ml == null;
    } else if (t.matches('[data-prix]')) {
      V.prix = +t.value;
      document.getElementById('prix-out').textContent = eur(V.prix);
      document.getElementById('prix-infos').innerHTML = prixInfos();
      document.querySelector('.vendre-apercu').innerHTML = apercu();
    } else if (t.matches('[data-sim]')) {
      simPrix = +t.value;
      document.getElementById('sim-out').textContent = eur(simPrix);
      document.getElementById('sim-table').innerHTML = simTable();
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-tri]')) {
      R.tri = t.value;
      majResultats();
    } else if (t.matches('[data-livraison]')) {
      achat.livraison = t.value;
      const a = A[location.hash.slice(9)];
      document.getElementById('recap').innerHTML = recap(a);
    } else if (t.matches('[data-atelier]')) {
      achat.atelier = t.checked;
      const a = A[location.hash.slice(9)];
      document.getElementById('recap').innerHTML = recap(a);
    } else if (t.matches('[data-ml]')) {
      V.ml = +t.value;
      V.prix = null;
      rendre();
    } else if (t.matches('[data-scelle]')) {
      V.scelle = t.value === '1';
      V.prix = null;
      rendre();
    } else if (t.matches('[data-mode]')) {
      V.mode = t.value;
      rendre();
    } else if (t.matches('[data-photo]') && t.files && t.files[0]) {
      const k = t.dataset.photo;
      const lecteur = new FileReader();
      lecteur.onload = () => {
        V.photos[k] = lecteur.result;
        rendre();
      };
      lecteur.readAsDataURL(t.files[0]);
    }
  });

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, a, tr[data-href]');
    if (!t) return;
    if (t.matches('tr[data-href]') && !e.target.closest('a')) {
      aller(t.dataset.href.slice(1));
      return;
    }
    const act = t.dataset.action;
    if (t.dataset.maison) {
      R.maisons = new Set([t.dataset.maison]);
      R.q = '';
      R.vue = 'annonces';
    }
    if (t.dataset.vendeur) {
      R.q = '';
      R.maisons = new Set();
      R.vue = 'annonces';
      message(`Flacons de ${VENDEURS[t.dataset.vendeur].pseudo} : choisissez-les, un seul port sera compté.`);
    }
    if (t.dataset.vendre) {
      Object.assign(V, {etape: 2, p: t.dataset.vendre, ml: P[t.dataset.vendre].formats[P[t.dataset.vendre].formats.length > 1 ? 1 : 0].ml, scelle: false, poids: '', photos: {}, prix: null, publie: false});
    }
    if (t.dataset.vendreEtagere) {
      const p = P[t.dataset.vendreEtagere];
      const ml = +t.dataset.ml;
      const f = p.formats.find((x) => x.ml === ml);
      Object.assign(V, {etape: 2, p: p.id, ml, scelle: false, poids: nb(f.vide + +t.dataset.restant * DENSITE, 1), photos: {}, prix: null, publie: false});
      aller('vendre');
      return;
    }
    if (t.dataset.vue) {
      R.vue = t.dataset.vue;
      majResultats();
      return;
    }
    if (t.dataset.choisir) {
      const p = P[t.dataset.choisir];
      Object.assign(V, {p: p.id, ml: p.formats[p.formats.length > 1 ? 1 : 0].ml, etape: 2, poids: '', prix: null});
      rendre();
      return;
    }
    if (t.dataset.etape) {
      V.etape = +t.dataset.etape;
      rendre();
      document.querySelector('.stepper').scrollIntoView({block: 'nearest'});
      return;
    }
    if (t.dataset.prise) {
      e.preventDefault();
      V.photos[t.dataset.prise] = V.photos[t.dataset.prise] || true;
      rendre();
      return;
    }
    switch (act) {
      case 'fermer':
        fermer();
        break;
      case 'alerte':
        modaleAlerte(t.dataset.p);
        break;
      case 'offre':
        modaleOffre(A[t.dataset.a]);
        break;
      case 'acheter':
        modaleAchat(A[t.dataset.a]);
        break;
      case 'payer':
        fermer();
        message('Commande simulée : rien n\'a été débité. Dans le vrai site, le paiement reste bloqué jusqu\'à la réception.');
        break;
      case 'reinit':
        Object.assign(R, {q: '', maisons: new Set(), etat: 'tous', niveauMin: 0, verif: 'tous', mainPropre: false});
        rendre();
        break;
      case 'scanner':
        Object.assign(V, {p: 'santal-33', ml: 100, etape: 2, poids: '', prix: null});
        message('Code-barres 0842185107223 lu : Le Labo, Santal 33, Eau de parfum.');
        rendre();
        break;
      case 'publier':
        V.publie = true;
        rendre();
        window.scrollTo(0, 0);
        break;
      case 'nouvelle-vente':
        Object.assign(V, {etape: 1, p: null, ml: null, scelle: false, poids: '', photos: {}, prix: null, mode: 'controle', publie: false});
        rendre();
        break;
      case 'echange-ok':
        message('Échange accepté (simulation) : les deux étiquettes sont prêtes, la soulte est bloquée.');
        break;
      case 'echange-contre':
        message('Contre-proposition : choisissez une soulte ou un autre flacon de votre étagère.');
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
