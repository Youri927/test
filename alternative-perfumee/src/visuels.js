/* Les dessins du prototype. Ils tiennent la place des photos que prendront les vendeurs : une vue par photo
   obligatoire. Formes génériques, aucun flacon de marque reproduit. */
const Dessins = (() => {
  let uid = 0;
  const teinte = (hex, k) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const FORMES = {
    tour: {corps: [31, 66, 58, 124, 7], col: [50, 54, 20, 14], bouchon: [41, 14, 38, 42, 4], dessus: 'rect'},
    carre: {corps: [15, 90, 90, 100, 12], col: [47, 78, 26, 14], bouchon: [35, 38, 50, 42, 4], dessus: 'rect'},
    galet: {corps: [15, 82, 90, 108, 44], col: [50, 68, 20, 16], bouchon: [38, 30, 44, 40, 20], dessus: 'rond'},
    cylindre: {corps: [32, 60, 56, 130, 14], col: [52, 50, 16, 12], bouchon: [43, 12, 34, 40, 8], dessus: 'rond'},
    apothicaire: {corps: [24, 76, 72, 114, 5], col: [46, 60, 28, 18], bouchon: [44, 26, 32, 36, 2], etiquette: true, dessus: 'rect'},
    facette: {chemin: 'M24 86 H96 L106 126 L98 190 H22 L14 126 Z', corps: [14, 86, 92, 104], col: [49, 72, 22, 16], bouchon: [38, 30, 44, 44, 3], dessus: 'octo'},
  };
  // la virole (bague métallique sertie) : dorée si le bouchon est doré, argentée sinon
  const virole = (p) => {
    const n = parseInt(p.bouchon.slice(1), 16);
    const [r, b] = [n >> 16, n & 255];
    return r > 120 && r - b > 40 ? '#c8ad6e' : '#c9ccd3';
  };

  /* le flacon de face, dans un repère de 120 × 200 */
  function flacon(p, niveau, sansBouchon) {
    const id = ++uid;
    const f = FORMES[p.forme];
    const [x, y, w, h, r] = f.corps;
    const forme = f.chemin ? `<path d="${f.chemin}"/>` : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
    const haut = y + 8;
    const bas = y + h - 7;
    const surface = bas - (niveau / 100) * (bas - haut);
    const [bx, by, bw, bh, br] = f.bouchon;
    const [cx, cy, cw, ch] = f.col;
    const bouchon = sansBouchon
      ? `<rect x="${cx - 2}" y="${cy - 9}" width="${cw + 4}" height="10" rx="2" fill="${virole(p)}"/><rect x="${cx + cw / 2 - 4}" y="${cy - 17}" width="8" height="9" rx="2" fill="#efefef" stroke="rgba(0,0,0,.2)" stroke-width=".6"/>`
      : `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${br}" fill="url(#b${id})"/>`;
    return `<defs>
        <clipPath id="c${id}">${forme}</clipPath>
        <linearGradient id="v${id}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".45" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>
        <linearGradient id="j${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${teinte(p.jus, 0.18)}"/><stop offset="1" stop-color="${teinte(p.jus, -0.12)}"/></linearGradient>
        <linearGradient id="b${id}" x1="0" x2="1"><stop offset="0" stop-color="${teinte(p.bouchon, 0.28)}"/><stop offset=".5" stop-color="${p.bouchon}"/><stop offset="1" stop-color="${teinte(p.bouchon, -0.22)}"/></linearGradient>
      </defs>
      <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="2" fill="url(#v${id})" stroke="rgba(0,0,0,.16)" stroke-width=".8"/>
      ${bouchon}
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

  /* le flacon vu de dessus, sans son bouchon : la virole sertie, et le bouton spray, ou la tige quand on l'a retiré */
  function dessus(p, niveau, sansBouton, id) {
    const f = FORMES[p.forme];
    const verre = `fill="url(#vd${id})" stroke="rgba(0,0,0,.16)" stroke-width="1.2"`;
    const corps = f.dessus === 'rond' ? `<circle cx="150" cy="186" r="112" ${verre}/>` : f.dessus === 'octo' ? `<path d="M88 74 H212 L262 124 V248 L212 298 H88 L38 248 V124 Z" ${verre}/>` : `<rect x="44" y="84" width="212" height="204" rx="${p.forme === 'carre' ? 22 : 10}" ${verre}/>`;
    const jus = `<circle cx="150" cy="186" r="${70 + niveau * 0.25}" fill="${p.jus}" opacity=".32"/>`;
    const vir = virole(p);
    const crans = Array.from({length: 18}, (_, i) => {
      const a = (i / 18) * Math.PI * 2;
      return `<line x1="${150 + Math.cos(a) * 30}" y1="${186 + Math.sin(a) * 30}" x2="${150 + Math.cos(a) * 36}" y2="${186 + Math.sin(a) * 36}"/>`;
    }).join('');
    const bague = `<circle cx="150" cy="186" r="44" fill="#fff" opacity=".35" stroke="rgba(0,0,0,.1)"/>
      <circle cx="150" cy="186" r="37" fill="url(#vm${id})" stroke="rgba(0,0,0,.18)"/>
      <g stroke="rgba(0,0,0,.18)" stroke-width="1.1">${crans}</g>
      <circle cx="150" cy="186" r="27" fill="url(#vm${id})" stroke="rgba(0,0,0,.14)"/>`;
    const bouton = `<circle cx="150" cy="186" r="19" fill="url(#vb${id})" stroke="rgba(0,0,0,.2)"/><ellipse cx="144" cy="180" rx="8" ry="5" fill="#fff" opacity=".7"/><circle cx="166.5" cy="186" r="2.6" fill="#333"/>`;
    const tige = `<circle cx="150" cy="186" r="9" fill="${vir}" opacity=".5"/><circle cx="150" cy="186" r="5" fill="#f4f4f4" stroke="rgba(0,0,0,.35)"/><circle cx="150" cy="186" r="1.9" fill="#222"/>
      <g transform="translate(232 302)"><ellipse cx="2" cy="6" rx="21" ry="7" fill="#000" opacity=".14" filter="url(#o${id})"/><circle r="19" fill="url(#vb${id})" stroke="rgba(0,0,0,.2)"/><circle r="6" fill="#ddd" stroke="rgba(0,0,0,.25)"/><circle r="2" fill="#333"/></g>`;
    return `<defs>
        <radialGradient id="vd${id}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></radialGradient>
        <radialGradient id="vm${id}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${teinte(vir, 0.55)}"/><stop offset=".6" stop-color="${vir}"/><stop offset="1" stop-color="${teinte(vir, -0.25)}"/></radialGradient>
        <radialGradient id="vb${id}" cx=".38" cy=".32" r=".85"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd1d6"/></radialGradient>
      </defs>
      <ellipse cx="156" cy="196" rx="118" ry="112" fill="#000" opacity=".1" filter="url(#o${id})"/>
      ${corps}${jus}${bague}${sansBouton ? tige : bouton}`;
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
    const fond = a.fond || '#ece7e1';
    const sol = `<defs><radialGradient id="l${id}" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <linearGradient id="t${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".07"/></linearGradient>
      <filter id="o${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter></defs>
      <rect width="300" height="375" fill="${fond}"/><rect y="250" width="300" height="125" fill="url(#t${id})"/><rect width="300" height="375" fill="url(#l${id})"/>`;
    let scene;
    let vb = '0 0 300 375';
    const deFace = (sansBouchon) => `<ellipse cx="150" cy="${72 + 190 * 1.25 + 4}" rx="66" ry="8" fill="#000" opacity=".2" filter="url(#o${id})"/><g transform="translate(75 72) scale(1.25)">${flacon(p, a.niveau, sansBouchon)}</g>`;
    if (vue === 'dessous') {
      scene = `<circle cx="150" cy="188" r="104" fill="#fff" opacity=".55" stroke="rgba(0,0,0,.14)"/><circle cx="150" cy="188" r="84" fill="${teinte(p.jus, 0.35)}" opacity=".7"/>
        <text x="150" y="182" text-anchor="middle" class="grave">${esc(a.lot)}</text><text x="150" y="206" text-anchor="middle" class="grave grave-petit">${a.ml} ml e</text>`;
    } else if (vue === 'dessus' || vue === 'tige') {
      scene = dessus(p, a.niveau, vue === 'tige', id);
    } else if (vue === 'boite') {
      scene = `<ellipse cx="150" cy="332" rx="92" ry="9" fill="#000" opacity=".16" filter="url(#o${id})"/>
        <path d="M78 86 L110 66 H232 L200 86 Z" fill="#f4f1ec" stroke="rgba(0,0,0,.12)"/><path d="M200 86 L232 66 V312 L200 332 Z" fill="#e4e0da" stroke="rgba(0,0,0,.12)"/>
        <rect x="78" y="86" width="122" height="246" fill="#faf8f5" stroke="rgba(0,0,0,.12)"/>
        <rect x="100" y="150" width="78" height="3" fill="#444" opacity=".55"/><rect x="110" y="162" width="58" height="2" fill="#444" opacity=".4"/>
        <text x="96" y="286" class="grave grave-petit">${esc(a.lot)}</text>
        <g fill="#333" opacity=".7">${[0, 3, 5, 9, 11, 14, 17, 19, 22, 25, 27, 30].map((k) => `<rect x="${130 + k * 1.6}" y="292" width="${k % 3 ? 0.9 : 1.6}" height="22"/>`).join('')}</g>`;
    } else if (vue === 'ticket') {
      scene = `<g transform="rotate(-4 150 190)"><rect x="92" y="70" width="116" height="240" fill="#fffefa" stroke="rgba(0,0,0,.1)"/>
        ${[96, 112, 140, 152, 164, 176, 204, 232].map((yy, i) => `<rect x="104" y="${yy}" width="${[60, 90, 70, 50, 80, 64, 92, 40][i]}" height="${i === 6 ? 3 : 2}" fill="#555" opacity=".45"/>`).join('')}
        <text x="104" y="226" class="grave grave-petit">${esc(p.nom).slice(0, 18)}</text></g>`;
    } else {
      scene = deFace(false);
      if (vue === 'niveau') vb = '70 150 160 200';
      if (vue === 'preuve') {
        scene = `<g transform="translate(-48 18) scale(.9)">${scene}</g>
          <g transform="rotate(-6 214 270)"><rect x="160" y="230" width="112" height="82" rx="2" fill="#fffef9" stroke="rgba(0,0,0,.1)"/>
          <text x="172" y="262" class="main-ecrite">@${esc(pseudo)}</text><text x="172" y="290" class="main-ecrite">24/11/2026</text></g>`;
      }
    }
    return `<svg class="visuel ${classe}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(`${p.nom}, ${LEGENDES[vue]}`)}">${sol}${scene}</svg>`;
  }

  /* un flacon seul (sans fond), pour les modules et les scènes */
  const seul = (p, niveau = 80, classe = '', sansBouchon = false) => `<svg class="${classe}" viewBox="0 0 120 200" aria-hidden="true">${flacon(p, niveau, sansBouchon)}</svg>`;

  /* le flacon qui vaporise, pour le module « Vendre » de l'accueil : la brume part du bouton spray */
  const vaporise = (p) => {
    const f = FORMES[p.forme];
    const [cx, cy, cw] = f.col;
    const bx = cx + cw / 2 - 4;
    const by = cy - 12.5;
    const gouttes = Array.from({length: 28}, (_, i) => {
      const t = i / 27;
      const dx = -(60 + ((i * 37) % 80));
      const dy = -24 + ((i * 23) % 44);
      return `<circle cx="${bx}" cy="${by}" r="${0.8 + (i % 5) * 0.55}" style="--dx:${dx}px;--dy:${dy}px;--d:${(t * 3).toFixed(2)}s"/>`;
    }).join('');
    return `<svg class="vaporise" viewBox="-150 0 270 200" aria-hidden="true"><g class="brume">${gouttes}</g>${flacon(p, 70, true)}</svg>`;
  };

  return {photo, seul, vaporise, LEGENDES};
})();
