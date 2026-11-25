/* La vérification en 3D, page « Comment ça marche ». Le flacon de l'annonce d'exemple est rendu en direct, et la caméra
   va d'un point de contrôle à l'autre : le bouchon se lève et le bouton spray s'enlève pour montrer la tige, puis le
   flacon, le niveau, et le dessous avec le code lot. Un repère suit chaque point. three.js est chargé à la demande
   (voir l'importmap de index.html) ; sans réseau ni WebGL, la photo et ses repères fixes restent en place. */
const Verif3D = (() => {
  let modules = null;
  const charger = () =>
    (modules ||= Promise.all([import('three'), import('three/addons/environments/RoomEnvironment.js'), import('three/addons/geometries/RoundedBoxGeometry.js')]).then(([THREE, a, b]) => ({THREE, RoomEnvironment: a.RoomEnvironment, RoundedBoxGeometry: b.RoundedBoxGeometry})));
  const doux = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const approche = (v, cible, dt, vitesse) => v + (cible - v) * (1 - Math.exp(-dt * vitesse));

  /* cadre : l'élément qui reçoit le canevas ; a, p : l'annonce et son parfum ; etiquettes : le texte de chaque repère */
  async function monter(cadre, {a, p, etiquettes}) {
    const {THREE, RoomEnvironment, RoundedBoxGeometry} = await charger();
    const canevas = document.createElement('canvas');
    canevas.className = 'v3-canevas';
    canevas.setAttribute('aria-hidden', 'true');
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({canvas: canevas, antialias: true});
    } catch (e) {
      return null;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.localClippingEnabled = true;
    const atelier = creerAtelier(THREE, {RoomEnvironment, RoundedBoxGeometry}, renderer);

    const scene = new THREE.Scene();
    scene.environment = atelier.env;
    const fond = () => {
      scene.background = new THREE.Color(getComputedStyle(cadre).backgroundColor);
    };
    fond();
    const fl = atelier.flacon({forme: p.forme, jus: p.jus, bouchon: p.bouchon, niveau: a.niveau, bouchonMis: true, bouton: true, tige: true});
    const f = fl.userData.f;
    const W = atelier.largeur(f);
    const D = atelier.profondeur(f);
    const H = f.h;
    const hv = fl.userData.hautVirole;
    const ny = fl.userData.niveauY;
    const sous = atelier.dessous(f, a.lot, a.ml);
    sous.rotation.z = 0; // lu par une caméra placée devant et en dessous
    fl.add(sous);
    const pivot = new THREE.Group();
    pivot.add(fl);
    scene.add(pivot);
    const base = f.type === 'galet' || f.type === 'cyl' ? 0 : -0.32;
    fl.rotation.y = base;
    const ombre = atelier.ombre(W * 1.9, D * 2.4, 0, 0, 0.9);
    scene.add(ombre);
    const cam = new THREE.PerspectiveCamera(24, 1, 0.1, 200);

    // les pièces mobiles, à leur place d'origine
    const bouchon = fl.userData.bouchon;
    const bouton = fl.userData.bouton;
    const bouchon0 = bouchon.position.clone();

    /* les quatre points : où regarde la caméra (cible), d'où (distance, hauteur en radians, tour en radians), et le
       point du flacon que montre le repère (dans le repère du flacon) */
    const loin = (h) => h / 2 / Math.tan(THREE.MathUtils.degToRad(12));
    const POINTS = [
      // le repère se pose sur la bague sertie, à côté de la tige, pour la laisser voir
      {cible: [0, hv - 0.3, 0], dist: loin(9.5), haut: 0.82, tour: 0.35, point: [0.66, hv - 0.05, 0.42], bouchon: 1, bouton: 1},
      {cible: [0, H * 0.6, 0], dist: loin(H * 2.3), haut: 0.2, tour: 0.55, point: [W * 0.3, H * 0.62, D * 0.46], bouchon: 0, bouton: 0},
      {cible: [0, ny, 0], dist: loin(H * 1.6), haut: 0.05, tour: 0.08, point: [-W * 0.16, ny, D * 0.47], bouchon: 0, bouton: 0, niveau: true},
      // et au bord du fond, pour ne pas cacher le code
      {cible: [0, 0.4, 0], dist: loin(W * 1.95), haut: -1.25, tour: 0.1, point: [W * 0.34, 0, D * 0.22], bouchon: 0, bouton: 0},
    ];
    const INTRO = {cible: [0, (fl.userData.haut) * 0.47, 0], dist: loin(fl.userData.haut * 1.55), haut: 0.12, tour: 0};

    // les repères, en HTML par-dessus le canevas
    const calque = document.createElement('div');
    calque.className = 'v3-calque';
    calque.setAttribute('aria-hidden', 'true');
    calque.innerHTML = `<span class="v3-ligne"></span><span class="v3-repere"><b>1</b><i></i></span>`;
    const repere = calque.querySelector('.v3-repere');
    const ligne = calque.querySelector('.v3-ligne');
    cadre.append(canevas, calque);
    cadre.classList.add('en-3d');

    const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let actif = -1;
    let de = INTRO;
    let vers = INTRO;
    let t0 = performance.now();
    const DUREE = reduit ? 1 : 1500;
    let cibleBouchon = 0;
    let cibleBouton = 0;
    let valBouchon = 0;
    let valBouton = 0;
    let minuteBouton = 0;

    function aller(i) {
      if (i === actif) return;
      const maintenant = performance.now();
      // on part de là où est la caméra, même au milieu d'un trajet
      de = poseCourante(maintenant);
      vers = POINTS[i];
      t0 = maintenant;
      actif = i;
      repere.querySelector('b').textContent = i + 1;
      repere.querySelector('i').textContent = etiquettes[i];
      repere.classList.remove('montre');
      ligne.classList.remove('montre');
      clearTimeout(minuteBouton);
      if (vers.bouchon) {
        // le bouchon d'abord, puis le bouton spray
        cibleBouchon = 1;
        minuteBouton = setTimeout(() => (cibleBouton = 1), reduit ? 0 : 900);
      } else {
        cibleBouton = 0;
        minuteBouton = setTimeout(() => (cibleBouchon = 0), reduit ? 0 : 450);
      }
    }
    function poseCourante(t) {
      const k = doux(Math.min(1, (t - t0) / DUREE));
      const m = (x, y) => x + (y - x) * k;
      return {cible: de.cible.map((v, j) => m(v, vers.cible[j])), dist: m(de.dist, vers.dist), haut: m(de.haut, vers.haut), tour: m(de.tour, vers.tour)};
    }

    const v = new THREE.Vector3();
    const ecran = (x, y, z) => {
      v.set(x, y, z);
      fl.localToWorld(v);
      v.project(cam);
      return [((v.x + 1) / 2) * 100, ((1 - v.y) / 2) * 100, v.z];
    };
    let precedent = performance.now();
    let marche = false;
    let raf = 0;
    function image(t) {
      raf = 0;
      if (!canevas.isConnected) return detruire();
      const dt = Math.min(0.05, (t - precedent) / 1000);
      precedent = t;
      // la caméra : un arc autour de la cible, et un léger balancement du flacon pour qu'il vive
      const pose = poseCourante(t);
      const r = pose.dist;
      cam.position.set(pose.cible[0] + r * Math.cos(pose.haut) * Math.sin(pose.tour), pose.cible[1] + r * Math.sin(pose.haut), pose.cible[2] + r * Math.cos(pose.haut) * Math.cos(pose.tour));
      cam.lookAt(pose.cible[0], pose.cible[1], pose.cible[2]);
      fl.rotation.y = base + (reduit ? 0 : Math.sin(t / 2600) * 0.22);
      // le bouchon monte et s'écarte, le bouton spray monte au-dessus de la tige
      valBouchon = approche(valBouchon, cibleBouchon, dt, reduit ? 60 : 4.2);
      valBouton = approche(valBouton, cibleBouton, dt, reduit ? 60 : 4.2);
      bouchon.position.set(bouchon0.x + valBouchon * 6.5, bouchon0.y + valBouchon * 8, bouchon0.z - valBouchon * 2);
      bouchon.rotation.z = -valBouchon * 0.5;
      bouton.position.y = valBouton * 1.5 + (reduit ? 0 : Math.sin(t / 700) * 0.06 * valBouton);
      bouton.position.x = valBouton * 0.7;
      ombre.material.opacity = 0.9 * Math.max(0, Math.min(1, (pose.haut + 0.25) / 0.35));
      renderer.render(scene, cam);
      // le repère suit son point ; il n'apparaît qu'une fois la caméra arrivée
      const arrive = t - t0 > DUREE * 0.8;
      if (actif >= 0) {
        const [x, y] = ecran(...POINTS[actif].point);
        repere.style.left = x + '%';
        repere.style.top = y + '%';
        repere.classList.toggle('montre', arrive && (actif !== 0 || valBouton > 0.85));
        if (POINTS[actif].niveau) {
          const [x1, y1] = ecran(-W * 0.56, ny, D * 0.5);
          const [x2, y2] = ecran(W * 0.56, ny, D * 0.5);
          ligne.style.left = x1 + '%';
          ligne.style.top = y1 + '%';
          ligne.style.width = x2 - x1 + '%';
          ligne.style.rotate = Math.atan2(((y2 - y1) * cadre.clientHeight) / 100, ((x2 - x1) * cadre.clientWidth) / 100) + 'rad';
          ligne.dataset.niveau = `${a.niveau} %`;
        }
        ligne.classList.toggle('montre', arrive && !!POINTS[actif].niveau);
      }
      if (marche) raf = requestAnimationFrame(image);
    }
    const taille = () => {
      const w = cadre.clientWidth;
      const h = cadre.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(taille);
    ro.observe(cadre);
    taille();
    const demarrer = () => {
      if (marche) return;
      marche = true;
      precedent = performance.now();
      raf = requestAnimationFrame(image);
    };
    const arreter = () => {
      marche = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const vu = new IntersectionObserver(([e]) => (e.isIntersecting ? demarrer() : arreter()));
    vu.observe(cadre);
    function detruire() {
      arreter();
      vu.disconnect();
      ro.disconnect();
      clearTimeout(minuteBouton);
      scene.traverse((x) => {
        if (x.geometry) x.geometry.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
    }
    image(performance.now());
    return {aller, fond, detruire};
  }

  return {monter};
})();
