/* Les dessins du prototype. Ils tiennent la place des photos que prendront les vendeurs : une vue par photo
   obligatoire. Style : dessin technique. Un trait fin d'épaisseur constante (quelle que soit la taille), des aplats
   sans dégradé, aucun reflet ni ombre floue ; des repères de mesure quand ils servent (niveau, code lot). Formes
   génériques : aucun flacon de marque n'est reproduit. */
const Dessins = (() => {
  let uid = 0;
  const ENCRE = '#1d1d1f';
  const FOND = '#f3f3f5';
  const T = 'fill="none" stroke="#1d1d1f" stroke-width="1.25" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"';
  const TF = (f) => `fill="${f}" stroke="#1d1d1f" stroke-width="1.25" vector-effect="non-scaling-stroke" stroke-linejoin="round"`;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const melange = (hex, k) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * k));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  };
  // couleur du bouchon, à plat : noir, or, argent, ou sa teinte éclaircie
  const capuchon = (p) => {
    const n = parseInt(p.bouchon.slice(1), 16);
    const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255];
    if (r + g + b < 200) return '#2c2c2e';
    if (r > 120 && r - b > 40) return '#dccca4';
    return melange(p.bouchon, 0.45);
  };
  const bague = (p) => (capuchon(p) === '#dccca4' ? '#e6dcc0' : '#e3e4e8');
  const jus = (p) => melange(p.jus, 0.42);

  /* les flacons, de face, dans un repère de 120 × 200 */
  const FORMES = {
    tour: {corps: [32, 66, 56, 124, 6], col: [51, 55, 18, 12], bouchon: [42, 16, 36, 40, 3], dessus: 'rect'},
    carre: {corps: [16, 90, 88, 100, 10], col: [48, 79, 24, 12], bouchon: [36, 40, 48, 40, 3], dessus: 'rect'},
    galet: {corps: [16, 82, 88, 108, 44], col: [51, 69, 18, 14], bouchon: [40, 32, 40, 38, 19], dessus: 'rond'},
    cylindre: {corps: [33, 60, 54, 130, 12], col: [53, 50, 14, 11], bouchon: [44, 14, 32, 37, 6], dessus: 'rond'},
    apothicaire: {corps: [25, 76, 70, 114, 4], col: [47, 61, 26, 16], bouchon: [45, 28, 30, 34, 2], etiquette: true, dessus: 'rect'},
    facette: {chemin: 'M25 87 H95 L104 126 L97 190 H23 L16 126 Z', corps: [16, 87, 88, 103], col: [50, 74, 20, 14], bouchon: [39, 32, 42, 42, 2], dessus: 'octo'},
  };
  function flacon(p, niveau, sansBouchon, id) {
    const f = FORMES[p.forme];
    const [x, y, w, h, r] = f.corps;
    const forme = (attrs) => (f.chemin ? `<path d="${f.chemin}" ${attrs}/>` : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${attrs}/>`);
    const haut = y + 7;
    const bas = y + h - 6;
    const surface = bas - (niveau / 100) * (bas - haut);
    const [bx, by, bw, bh, br] = f.bouchon;
    const [cx, cy, cw, ch] = f.col;
    const dessus = sansBouchon
      ? `<rect x="${cx - 3}" y="${cy - 8}" width="${cw + 6}" height="9" rx="1.5" ${TF(bague(p))}/>
         <rect x="${cx + cw / 2 - 4.5}" y="${cy - 17}" width="9" height="9" rx="2" ${TF('#ffffff')}/>
         <circle cx="${cx + cw / 2 - 4.5}" cy="${cy - 12.5}" r=".9" fill="${ENCRE}"/>`
      : `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${br}" ${TF(capuchon(p))}/>`;
    return `<defs><clipPath id="c${id}">${forme('')}</clipPath></defs>
      <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" ${TF('#ffffff')}/>
      ${dessus}
      ${forme('fill="#ffffff"')}
      <g clip-path="url(#c${id})"><rect x="0" y="${surface}" width="120" height="${200 - surface}" fill="${jus(p)}"/>
        <line x1="0" x2="120" y1="${surface}" y2="${surface}" ${T}/>
        <line x1="0" x2="120" y1="${bas}" y2="${bas}" ${T} opacity=".35"/></g>
      ${forme(T)}
      ${f.etiquette ? `<rect x="${x + 13}" y="${y + 34}" width="${w - 26}" height="42" ${TF('#ffffff')}/><line x1="${x + 20}" x2="${x + w - 20}" y1="${y + 47}" y2="${y + 47}" ${T}/><line x1="${x + 24}" x2="${x + w - 24}" y1="${y + 55}" y2="${y + 55}" ${T} opacity=".5"/>` : ''}`;
  }

  /* vu de dessus, sans bouchon : l'épaule, la bague sertie et le bouton spray, ou la tige une fois le bouton retiré */
  function dessus(p, sansBouton) {
    const f = FORMES[p.forme];
    const epaule = f.dessus === 'rond' ? `<circle cx="150" cy="180" r="108" ${TF('#ffffff')}/>` : f.dessus === 'octo' ? `<path d="M92 76 H208 L254 122 V238 L208 284 H92 L46 238 V122 Z" ${TF('#ffffff')}/>` : `<rect x="48" y="80" width="204" height="200" rx="${p.forme === 'carre' ? 18 : 8}" ${TF('#ffffff')}/>`;
    const crans = Array.from({length: 24}, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return `<line x1="${(150 + Math.cos(a) * 29).toFixed(1)}" y1="${(180 + Math.sin(a) * 29).toFixed(1)}" x2="${(150 + Math.cos(a) * 34).toFixed(1)}" y2="${(180 + Math.sin(a) * 34).toFixed(1)}" ${T} opacity=".55"/>`;
    }).join('');
    const bouton = `<circle cx="150" cy="180" r="19" ${TF('#ffffff')}/><circle cx="166" cy="180" r="2" fill="${ENCRE}"/>`;
    const tige = `<circle cx="150" cy="180" r="6" ${TF('#ffffff')}/><circle cx="150" cy="180" r="1.8" fill="${ENCRE}"/>
      <g transform="translate(236 302)"><circle r="19" ${TF('#ffffff')}/><circle r="6.5" ${T}/><circle r="1.8" fill="${ENCRE}"/></g>
      <line x1="170" y1="194" x2="216" y2="286" ${T} stroke-dasharray="2 4" opacity=".5"/>`;
    return `${epaule}<circle cx="150" cy="180" r="${f.dessus === 'rond' ? 78 : 74}" fill="${jus(p)}" opacity=".55"/>
      <circle cx="150" cy="180" r="44" ${TF('#ffffff')}/>
      <circle cx="150" cy="180" r="36" ${TF(bague(p))}/>${crans}<circle cx="150" cy="180" r="27" ${TF(bague(p))}/>
      ${sansBouton ? tige : bouton}`;
  }

  const LEGENDES = {
    face: 'le flacon de face',
    dessous: 'le dessous du flacon et le code lot',
    niveau: 'le niveau',
    preuve: 'le flacon avec le pseudo du vendeur et la date',
    dessus: 'le flacon sans bouchon, vu de dessus, avec le spray',
    tige: 'le flacon sans le bouton spray, la tige visible',
    boite: 'la boîte',
    ticket: 'le ticket d\'achat',
  };

  /* une « photo » d'annonce : a (l'annonce), p (le parfum), vue, pseudo du vendeur */
  function photo(a, p, vue = 'face', pseudo = '', classe = '') {
    const id = ++uid;
    let vb = '0 0 300 375';
    let scene;
    const sol = `<ellipse cx="150" cy="${72 + 190 * 1.25 + 3}" rx="62" ry="4" fill="${ENCRE}" opacity=".06"/>`;
    const deFace = () => `${sol}<g transform="translate(75 72) scale(1.25)">${flacon(p, a.niveau, false, id)}</g>`;
    if (vue === 'dessous') {
      scene = `<circle cx="150" cy="186" r="104" ${TF('#ffffff')}/><circle cx="150" cy="186" r="86" fill="${jus(p)}" opacity=".45"/><circle cx="150" cy="186" r="86" ${T} opacity=".4"/>
        <text x="150" y="182" text-anchor="middle" class="d-code">${esc(a.lot)}</text><text x="150" y="204" text-anchor="middle" class="d-petit">${a.ml} ml ℮</text>`;
    } else if (vue === 'dessus' || vue === 'tige') {
      scene = dessus(p, vue === 'tige');
    } else if (vue === 'boite') {
      scene = `<ellipse cx="146" cy="334" rx="78" ry="4" fill="${ENCRE}" opacity=".06"/>
        <path d="M80 92 L108 72 H226 L198 92 Z" ${TF('#ffffff')}/><path d="M198 92 L226 72 V310 L198 330 Z" ${TF('#ebebef')}/>
        <rect x="80" y="92" width="118" height="238" ${TF('#ffffff')}/>
        <line x1="100" x2="178" y1="160" y2="160" ${T}/><line x1="112" x2="166" y1="172" y2="172" ${T} opacity=".5"/>
        <text x="96" y="290" class="d-petit" text-anchor="start">${esc(a.lot)}</text>
        <g fill="${ENCRE}">${[0, 3, 5, 9, 11, 14, 17, 19, 22, 25, 27, 30].map((k) => `<rect x="${136 + k * 1.5}" y="296" width="${k % 3 ? 0.8 : 1.5}" height="20"/>`).join('')}</g>`;
    } else if (vue === 'ticket') {
      scene = `<path d="M96 66 H204 V314 l-9 -6 -9 6 -9 -6 -9 6 -9 -6 -9 6 -9 -6 -9 6 -9 -6 -9 6 -9 -6 -9 6 Z" ${TF('#ffffff')}/>
        ${[92, 104, 132, 144, 156, 168, 236].map((yy, i) => `<line x1="110" x2="${110 + [62, 84, 70, 48, 78, 60, 84][i]}" y1="${yy}" y2="${yy}" ${T} opacity="${i === 6 ? 1 : 0.5}"/>`).join('')}
        <text x="110" y="204" class="d-petit" text-anchor="start">${esc(p.nom).slice(0, 18)}</text>`;
    } else {
      scene = deFace();
      if (vue === 'niveau') {
        const f = FORMES[p.forme];
        const [, y, , h] = f.corps;
        const haut = y + 7;
        const bas = y + h - 6;
        const yy = 72 + 1.25 * (bas - (a.niveau / 100) * (bas - haut));
        scene += `<line x1="66" x2="232" y1="${yy}" y2="${yy}" ${T} stroke-dasharray="3 3"/><rect x="186" y="${yy - 24}" width="42" height="17" rx="8.5" fill="${ENCRE}"/><text x="207" y="${yy - 12}" text-anchor="middle" class="d-mesure">${a.niveau} %</text>`;
        vb = '62 142 176 220';
      }
      if (vue === 'preuve') {
        scene = `<g transform="translate(-46 16) scale(.9)">${scene}</g>
          <g transform="rotate(-4 214 270)"><rect x="162" y="228" width="108" height="80" ${TF('#ffffff')}/>
          <text x="174" y="260" class="d-note">@${esc(pseudo)}</text><text x="174" y="286" class="d-note">24/11/2026</text></g>`;
      }
    }
    return `<svg class="visuel ${classe}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(`${p.nom}, ${LEGENDES[vue]}`)}"><rect x="-50" y="-50" width="400" height="475" fill="${FOND}"/>${scene}</svg>`;
  }

  /* un flacon seul, sans fond */
  const seul = (p, niveau = 80, classe = '', sansBouchon = false) => `<svg class="${classe}" viewBox="0 0 120 200" aria-hidden="true">${flacon(p, niveau, sansBouchon, ++uid)}</svg>`;

  /* le flacon qui vaporise, pour la porte « Vendre » : trait clair sur fond sombre, et la brume en points, comme dans
     le symbole du logo */
  const vaporise = (p) => {
    const id = ++uid;
    const f = FORMES[p.forme];
    const [cx, cy, cw] = f.col;
    const bx = cx + cw / 2 - 4.5;
    const by = cy - 12.5;
    const gouttes = [];
    for (let rang = 0; rang < 6; rang++) {
      for (let j = 0; j <= rang; j++) {
        const dx = -(16 + rang * 18);
        const dy = (j - rang / 2) * (6 + rang * 1.6);
        gouttes.push(`<circle cx="${bx}" cy="${by}" r="${(2.4 - rang * 0.28).toFixed(2)}" style="--dx:${dx}px;--dy:${dy.toFixed(1)}px;--d:${(rang * 0.12 + j * 0.05).toFixed(2)}s"/>`);
      }
    }
    return `<svg class="vaporise" viewBox="-130 0 250 200" aria-hidden="true"><g class="brume">${gouttes.join('')}</g><g class="trait-clair">${flacon(p, 70, true, id)}</g></svg>`;
  };

  return {photo, seul, vaporise, LEGENDES};
})();
