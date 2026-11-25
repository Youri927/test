/* Les photos du prototype. Ce sont des rendus 3D (tools/rendus) qui tiennent la place des photos que prendront les
   vendeurs : une image par annonce et par vue obligatoire, sur un fond de studio clair. Formes génériques : aucun
   flacon de marque n'est reproduit. Dans le fichier final, les images sont intégrées (PHOTOS_EMBARQUEES, MESURES) ;
   sinon on les lit dans photos/. */
const Dessins = (() => {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const IMAGES = typeof PHOTOS_EMBARQUEES !== 'undefined' ? PHOTOS_EMBARQUEES : {};
  const M = typeof MESURES !== 'undefined' ? MESURES : {buse: {x: 0.46, y: 0.13}};
  const src = (cle) => IMAGES[cle] || `../photos/${cle}.webp`;

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

  /* une photo d'annonce : a (l'annonce), p (le parfum), vue. La vue « niveau » est un gros plan sur la surface du jus,
     qui tombe au milieu de l'image : on y pose un trait et le pourcentage annoncé. */
  function photo(a, p, vue = 'face', pseudo = '', classe = '') {
    const alt = esc(`${p.nom}, ${LEGENDES[vue]}`);
    if (vue === 'niveau') {
      return `<span class="visuel visuel-niveau ${classe}" role="img" aria-label="${alt} : environ ${a.niveau} %"><img src="${src(`${a.id}-niveau`)}" alt="" width="600" height="750" decoding="async"><i class="niveau-trait"></i><b class="niveau-pastille">${a.niveau} %</b></span>`;
    }
    const cle = vue === 'ticket' ? 'ticket' : `${a.id}-${vue}`;
    return `<img class="visuel ${classe}" src="${src(cle)}" alt="${alt}" width="600" height="750" decoding="async">`;
  }

  /* la porte « Vendre » : le flacon sans bouchon, et la brume qui part de la buse, en cône de points comme le symbole
     du logo */
  const vaporise = () => {
    const bx = M.buse.x * 600;
    const by = M.buse.y * 800;
    const gouttes = [];
    for (let rang = 0; rang < 6; rang++) {
      for (let j = 0; j <= rang; j++) {
        const dx = -(30 + rang * 34);
        const dy = (j - rang / 2) * (11 + rang * 3);
        gouttes.push(`<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${(6 - rang * 0.7).toFixed(2)}" style="--dx:${dx}px;--dy:${dy.toFixed(1)}px;--d:${(rang * 0.12 + j * 0.05).toFixed(2)}s"/>`);
      }
    }
    return `<div class="vaporise" aria-hidden="true"><img src="${src('vendre')}" alt="" width="600" height="800" decoding="async"><svg class="brume" viewBox="0 0 600 800">${gouttes.join('')}</svg></div>`;
  };

  return {photo, vaporise, LEGENDES};
})();
