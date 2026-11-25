/* L'atelier 3D : les flacons, leurs matières et la lumière du studio. Partagé par l'outil qui produit les photos
   (tools/rendus/scene.html) et par l'animation de la vérification, page « Comment ça marche ». THREE et ses deux
   compléments sont passés en paramètre : le site les charge à la demande, l'outil depuis node_modules. Formes
   génériques : aucun flacon de marque n'est reproduit. */
function creerAtelier(THREE, {RoomEnvironment, RoundedBoxGeometry}, renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  // une pièce blanche, avec deux panneaux noirs de part et d'autre : ils dessinent les bords du verre dans les reflets
  const piece = new RoomEnvironment();
  const noir = new THREE.MeshBasicMaterial({color: 0x050505});
  [[-7.5, 0.8], [7.5, -0.6]].forEach(([x, rz]) => {
    const pan = new THREE.Mesh(new THREE.BoxGeometry(1.2, 14, 7), noir);
    pan.position.set(x, 3, 1.5);
    pan.rotation.z = rz * 0.05;
    piece.add(pan);
  });
  const plafond = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 4), new THREE.MeshBasicMaterial({color: 0xffffff}));
  plafond.position.set(0, 9.5, 2);
  piece.add(plafond);
  const env = pmrem.fromScene(piece, 0.03).texture;
  // les métaux reflètent une pièce blanche sans panneaux : l'or reste doré, l'argent reste clair
  const envMetal = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;

  const toile = (w, h, dessin) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    dessin(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  const ombreTex = toile(256, 256, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    r.addColorStop(0, 'rgba(0,0,0,.55)');
    r.addColorStop(0.45, 'rgba(0,0,0,.22)');
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, w, w);
  });
  function ombre(sx, sz, x = 0, z = 0, force = 1) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({map: ombreTex, transparent: true, depthWrite: false, opacity: force}));
    m.rotation.x = -Math.PI / 2;
    m.scale.set(sx, sz, 1);
    m.position.set(x, 0.002, z);
    return m;
  }

  /* matières */
  const verre = () => new THREE.MeshPhysicalMaterial({color: 0xf1f4f4, roughness: 0.015, transmission: 1, thickness: 1.4, ior: 1.5, envMapIntensity: 1.1, attenuationColor: new THREE.Color(0xdde8e4), attenuationDistance: 3.5, specularIntensity: 1, transparent: true});
  /* le jus n'est pas « transmissif » : le verre, lui, l'est, et il ne verrait pas un autre objet transmissif derrière lui */
  const jus = (hex) => new THREE.MeshPhysicalMaterial({color: new THREE.Color(hex), roughness: 0.18, metalness: 0, envMapIntensity: 0.55, sheen: 0.4, sheenColor: new THREE.Color(0xffffff), sheenRoughness: 0.6});
  function genre(hex) {
    const c = new THREE.Color(hex);
    const [r, g, b] = [c.r * 255, c.g * 255, c.b * 255];
    if (r + g + b < 200) return 'noir';
    if (r > 120 && r - b > 40 && g > 80) return 'or';
    if (Math.abs(r - g) < 14 && Math.abs(g - b) < 18 && r > 150) return 'argent';
    return 'couleur';
  }
  function matiereBouchon(hex) {
    const g = genre(hex);
    if (g === 'or') return new THREE.MeshPhysicalMaterial({color: 0xf3d690, metalness: 0.72, roughness: 0.24, envMap: envMetal, envMapIntensity: 1.5, clearcoat: 0.6, clearcoatRoughness: 0.1});
    if (g === 'argent') return new THREE.MeshStandardMaterial({color: 0xd9dce2, metalness: 1, roughness: 0.18, envMap: envMetal, envMapIntensity: 1.2});
    if (g === 'noir') return new THREE.MeshPhysicalMaterial({color: 0x1b1b1d, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1});
    return new THREE.MeshPhysicalMaterial({color: new THREE.Color(hex), roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.2, envMapIntensity: 0.9});
  }
  const viroleMat = (hex) => (genre(hex) === 'or' ? new THREE.MeshStandardMaterial({color: 0xe8c983, metalness: 1, roughness: 0.24, envMap: envMetal, envMapIntensity: 1.2}) : new THREE.MeshStandardMaterial({color: 0xdcdfe5, metalness: 1, roughness: 0.2, envMap: envMetal, envMapIntensity: 1.15}));
  const plastiqueBlanc = () => new THREE.MeshPhysicalMaterial({color: 0xf4f4f4, roughness: 0.32, clearcoat: 0.4});

  /* les formes : dimensions en cm, base du flacon à y = 0 */
  const FORMES = {
    tour: {w: 4.2, h: 8.6, d: 2.8, r: 0.4, type: 'boite', bouchon: {type: 'boite', w: 2.7, h: 3.0, d: 2.0}},
    carre: {w: 6.6, h: 6.2, d: 3.2, r: 0.85, type: 'boite', bouchon: {type: 'boite', w: 3.6, h: 2.6, d: 2.6}},
    galet: {w: 6.8, h: 7.6, d: 4.4, type: 'galet', bouchon: {type: 'cyl', r: 1.45, h: 2.5}},
    cylindre: {r: 2.0, h: 9.4, type: 'cyl', bouchon: {type: 'cyl', r: 1.2, h: 3.0}},
    apothicaire: {w: 5.0, h: 7.6, d: 5.0, r: 0.28, type: 'boite', etiquette: true, bouchon: {type: 'cyl', r: 1.0, h: 2.4}},
    facette: {r: 3.25, r2: 3.45, h: 6.8, type: 'octo', bouchon: {type: 'boite', w: 2.9, h: 2.9, d: 2.9}},
  };
  const EP = 0.2; // épaisseur du verre
  const FOND_VERRE = 0.55;

  function corps(f) {
    if (f.type === 'boite') {
      const g = new RoundedBoxGeometry(f.w, f.h, f.d, 5, f.r);
      g.translate(0, f.h / 2, 0);
      return g;
    }
    if (f.type === 'cyl') {
      const g = new THREE.CylinderGeometry(f.r, f.r, f.h, 96, 1);
      g.translate(0, f.h / 2, 0);
      return g;
    }
    if (f.type === 'octo') {
      const g = new THREE.CylinderGeometry(f.r, f.r2, f.h, 8, 1);
      g.rotateY(Math.PI / 8);
      g.translate(0, f.h / 2, 0);
      return g;
    }
    const g = new THREE.SphereGeometry(1, 96, 64);
    g.scale(f.w / 2, f.h / 2, f.d / 2);
    g.translate(0, f.h / 2, 0);
    return g;
  }
  function liquide(f, niveau, hex) {
    const hMax = f.h - FOND_VERRE - EP * 2;
    const hl = Math.max(0.05, (hMax * niveau) / 100);
    const y0 = FOND_VERRE;
    let g;
    if (f.type === 'boite') {
      g = new RoundedBoxGeometry(f.w - EP * 2, hl, f.d - EP * 2, 4, Math.max(0.05, Math.min(f.r - EP * 0.6, hl / 2 - 0.01)));
      g.translate(0, y0 + hl / 2, 0);
    } else if (f.type === 'cyl') {
      g = new THREE.CylinderGeometry(f.r - EP, f.r - EP, hl, 96, 1);
      g.translate(0, y0 + hl / 2, 0);
    } else if (f.type === 'octo') {
      const k = (y) => f.r2 + (f.r - f.r2) * (y / f.h);
      g = new THREE.CylinderGeometry(k(y0 + hl) - EP, k(y0) - EP, hl, 8, 1);
      g.rotateY(Math.PI / 8);
      g.translate(0, y0 + hl / 2, 0);
    } else {
      // galet : une ellipse de verre, coupée au niveau, avec une surface plane
      const a = f.w / 2 - EP;
      const b = f.h / 2 - EP;
      const c = f.d / 2 - EP;
      const yNiv = EP + FOND_VERRE * 0.4 + (((f.h - 2 * EP) * niveau) / 100) * 0.94;
      const plan = new THREE.Plane(new THREE.Vector3(0, -1, 0), yNiv);
      const sph = new THREE.SphereGeometry(1, 96, 64);
      sph.scale(a, b, c);
      sph.translate(0, f.h / 2, 0);
      const m = jus(hex);
      m.clippingPlanes = [plan];
      const grp = new THREE.Group();
      grp.add(new THREE.Mesh(sph, m));
      const t = (yNiv - f.h / 2) / b;
      const k = Math.sqrt(Math.max(0, 1 - t * t));
      const disque = new THREE.CircleGeometry(1, 96);
      disque.scale(a * k, c * k, 1);
      const surf = new THREE.Mesh(disque, jus(hex));
      surf.rotation.x = -Math.PI / 2;
      surf.position.y = yNiv;
      grp.add(surf);
      grp.userData.niveauY = yNiv;
      return grp;
    }
    const mesh = new THREE.Mesh(g, jus(hex));
    mesh.userData.niveauY = y0 + hl;
    return mesh;
  }
  function etiquette(f) {
    const tex = toile(512, 420, (g, w) => {
      g.fillStyle = '#fbfaf6';
      g.fillRect(0, 0, w, 420);
      g.fillStyle = '#2a2a2a';
      g.fillRect(70, 120, w - 140, 10);
      g.globalAlpha = 0.55;
      g.fillRect(110, 160, w - 220, 6);
      g.fillRect(140, 300, w - 280, 6);
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(f.w * 0.7, f.h * 0.38), new THREE.MeshStandardMaterial({map: tex, roughness: 0.85}));
    m.position.set(0, f.h * 0.52, f.d / 2 + 0.006);
    return m;
  }
  /* le code lot, gravé sous le flacon */
  function texteGrave(lot, ml) {
    const tex = toile(512, 512, (g, w) => {
      g.clearRect(0, 0, w, w);
      g.fillStyle = 'rgba(70,70,76,.78)';
      g.textAlign = 'center';
      g.font = '600 64px Inter, system-ui, sans-serif';
      g.fillText(lot, w / 2, w / 2 + 6);
      g.font = '500 34px Inter, system-ui, sans-serif';
      g.fillText(`${ml} ml ℮`, w / 2, w / 2 + 62);
    });
    return new THREE.MeshBasicMaterial({map: tex, transparent: true, depthWrite: false});
  }
  const largeur = (f) => f.w || f.r2 * 2 || f.r * 2;
  const profondeur = (f) => f.d || f.r2 * 2 || f.r * 2;
  function dessous(f, lot, ml) {
    const cote = Math.min(largeur(f), profondeur(f)) * 0.72;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(cote, cote), texteGrave(lot, ml));
    m.rotation.x = Math.PI / 2;
    m.rotation.z = Math.PI;
    m.position.y = -0.01;
    return m;
  }

  /* un flacon complet : options { forme, jus, bouchon, niveau, bouchonMis, bouton, tige }. Les pièces mobiles sont
     gardées dans userData (bouchon, bouton, buse, tige) pour qu'une animation puisse les déplacer. */
  function flacon(o) {
    const f = FORMES[o.forme];
    const grp = new THREE.Group();
    const h = f.h;
    grp.add(new THREE.Mesh(corps(f), verre()));
    const liq = liquide(f, o.niveau, o.jus);
    grp.add(liq);
    grp.userData.niveauY = liq.userData.niveauY;
    if (f.etiquette) grp.add(etiquette(f));
    // le col et la bague sertie
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.5, 0.55, 48), verre());
    col.position.y = h + 0.22;
    grp.add(col);
    const virole = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.7, 0.62, 64), viroleMat(o.bouchon));
    virole.position.y = h + 0.72;
    grp.add(virole);
    const stries = new THREE.Mesh(new THREE.CylinderGeometry(0.71, 0.71, 0.12, 64), viroleMat(o.bouchon));
    stries.position.y = h + 0.47;
    grp.add(stries);
    const hautVirole = h + 1.03;
    grp.userData.hautVirole = hautVirole;
    if (o.tige) {
      const t = new THREE.Group();
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.42, 24), new THREE.MeshPhysicalMaterial({color: 0xf1f1f1, roughness: 0.25, transmission: 0.3, thickness: 0.2}));
      tube.position.y = hautVirole + 0.2;
      t.add(tube);
      const trou = new THREE.Mesh(new THREE.CircleGeometry(0.045, 20), new THREE.MeshBasicMaterial({color: 0x111111}));
      trou.rotation.x = -Math.PI / 2;
      trou.position.y = hautVirole + 0.415;
      t.add(trou);
      grp.add(t);
      grp.userData.tige = t;
    }
    if (o.bouton) {
      const bouton = new THREE.Group();
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.42, 0.5, 48), plastiqueBlanc());
      b.position.y = hautVirole + 0.27;
      bouton.add(b);
      const buse = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 16), new THREE.MeshBasicMaterial({color: 0x111111}));
      buse.rotation.z = Math.PI / 2;
      buse.position.set(-0.4, hautVirole + 0.32, 0);
      bouton.add(buse);
      grp.add(bouton);
      grp.userData.bouton = bouton;
      grp.userData.buse = buse;
    }
    if (o.bouchonMis) {
      const bc = f.bouchon;
      const mat = matiereBouchon(o.bouchon);
      const m = bc.type === 'boite' ? new THREE.Mesh(new RoundedBoxGeometry(bc.w, bc.h, bc.d, 4, 0.12), mat) : new THREE.Mesh(new THREE.CylinderGeometry(bc.r, bc.r, bc.h, 72), mat);
      m.position.y = h + 0.12 + bc.h / 2;
      grp.add(m);
      grp.userData.bouchon = m;
      grp.userData.haut = h + 0.12 + bc.h;
    } else grp.userData.haut = hautVirole + 0.5;
    grp.userData.f = f;
    return grp;
  }

  return {env, envMetal, toile, ombre, FORMES, flacon, dessous, largeur, profondeur};
}
