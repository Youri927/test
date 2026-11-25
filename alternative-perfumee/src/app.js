/* Respray : le prototype. Une page, des vues appelées par l'adresse : #accueil, #recherche, #annonce-a101, #vendre,
   #fonctionnement, #panel. Rien n'est envoyé nulle part ; ce que fait l'équipe dans le panel est gardé dans ce
   navigateur. */
(() => {
  'use strict';

  /* ——— outils ——— */
  const P = Object.fromEntries(PARFUMS.map((p) => [p.id, p]));
  const A = Object.fromEntries(ANNONCES.map((a) => [a.id, a]));
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const nb = (n, d = 0) => n.toLocaleString('fr-FR', {minimumFractionDigits: d, maximumFractionDigits: d});
  const eur = (n) => (Number.isInteger(n) ? nb(n) : nb(n, 2)) + ' €';
  const eur2 = (n) => nb(n, 2) + ' €';
  const nombre = (s) => parseFloat(String(s).replace(',', '.').replace(/\s/g, ''));
  const mlRestants = (a) => Math.round((a.ml * a.niveau) / 100);
  const prixMl = (a) => a.prix / mlRestants(a);
  /* les frais : le vendeur ne paie rien ; l'acheteur paie 8 % + 0,90 € (les 0,90 € couvrent ce qui ne dépend pas du
     prix : la vérification de l'annonce et le paiement) ; en option, l'envoi assuré à la valeur réelle, au-dessus de
     150 €, et la mise en avant d'une annonce, payée par le vendeur s'il le veut */
  const protection = (prix) => Math.round((prix * 0.08 + 0.9) * 100) / 100;
  const ASSURANCE = 2.9;
  const SEUIL_ASSURANCE = 150;
  const MISES_EN_AVANT = [['', 'Non merci', 0], ['3j', '3 jours en tête des résultats', 1.99], ['7j', '7 jours, et sur l\'accueil', 4.99]];
  const ENVOI = 4.9;
  const normal = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const cle = (s) => normal(s).replace(/[^a-z0-9]+/g, ' ').trim();
  const reduit = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
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
        /* stockage indisponible : on garde en mémoire */
      }
    },
  };
  const favoris = new Set(memoire.lire('favoris', []));
  /* les maisons et parfums de la liste : le catalogue, plus ce que l'équipe a ajouté depuis le back-office */
  const maisonsCatalogue = () => [...new Set([...PARFUMS.map((p) => p.maison), ...MAISONS_EN_PLUS])];
  const maisons = () => [...new Set([...maisonsCatalogue(), ...Admin.maisonsAjoutees()])].sort((x, y) => x.localeCompare(y, 'fr'));
  const parfumsDe = (m) => [...PARFUMS.filter((p) => p.maison === m).map((p) => ({id: p.id, nom: p.nom, conc: p.conc})), ...Admin.parfumsAjoutes().filter((x) => x.maison === m).map((x) => ({id: 'ajout:' + x.nom, nom: x.nom, conc: x.conc || ''}))];

  /* orthographe : distance entre deux noms, et écriture propre (majuscules, particules) */
  function distance(a, b) {
    const d = Array.from({length: a.length + 1}, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function ressemble(nom, liste) {
    const k = cle(nom);
    if (!k) return null;
    let mieux = null;
    for (const m of liste) {
      const km = cle(m);
      if (km === k) return {nom: m, exact: true};
      const dist = distance(k, km);
      const seuil = Math.max(1, Math.min(3, Math.floor(km.length / 5)));
      if (dist <= seuil && (!mieux || dist < mieux.dist)) mieux = {nom: m, dist, exact: false};
    }
    return mieux;
  }
  const PARTICULES = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'of', 'the', 'di', 'da', 'del', 'von', 'van', 'pour', 'sur', 'en', 'a', 'au', 'aux']);
  function proprement(s) {
    return s
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((mot, i) =>
        mot
          .split('-')
          .map((part) => {
            if (/^[dl]['’]./.test(part)) return part[0] + '’' + part.charAt(2).toUpperCase() + part.slice(3);
            if (i > 0 && PARTICULES.has(part)) return part;
            return part.charAt(0).toUpperCase() + part.slice(1);
          })
          .join('-'),
      )
      .join(' ')
      .replace(/^./, (c) => c.toUpperCase());
  }

  /* ——— éléments communs ——— */
  const photo = (a, vue = 'face', classe = '') => Dessins.photo(a, P[a.p], vue, VENDEURS[a.v] ? VENDEURS[a.v].pseudo : 'vous', classe);
  const ICO = {
    photo: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    cadenas: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    loupe: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    croix: '<path d="M6 6l12 12M18 6L6 18"/>',
    fleche: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    cloche: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4"/>',
    soleil: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
    thermo: '<path d="M10 4.5a2 2 0 0 1 4 0V14a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
    goutte: '<path d="M12 3.5s6 6.5 6 10.5a6 6 0 0 1-12 0c0-4 6-10.5 6-10.5z"/>',
    boite: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
    retour: '<path d="M9 7L4 12l5 5"/><path d="M4 12h11a5 5 0 0 1 0 10h-2"/>',
    euro: '<path d="M17 6.5A7 7 0 1 0 17 17.5M4 10.5h9M4 13.5h9"/>',
  };
  const ico = (n, c = '') => `<svg class="ico ${c}" viewBox="0 0 24 24" aria-hidden="true">${ICO[n]}</svg>`;
  const coeur = (id) => `<button class="coeur" type="button" data-fav="${id}" aria-pressed="${favoris.has(id)}" aria-label="Ajouter aux favoris"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-9.6A4 4 0 0 1 12 7.6a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20z"/></svg></button>`;
  function carte(a, extra) {
    const p = P[a.p];
    if (typeof extra !== 'string') extra = ''; // appelée aussi par .map(), qui passe l'index
    return `<article class="carte" data-revele>
      <a class="carte-lien" href="#annonce-${a.id}">
        <div class="carte-photo">${photo(a)}${a.etat === 'blister' ? '<span class="etiq">Neuf sous blister</span>' : ''}${extra}</div>
        <p class="carte-prix">${eur(a.prix)}</p>
        <h3 class="carte-nom">${esc(p.nom)}</h3>
        <p class="carte-maison">${esc(p.maison)}</p>
        <p class="carte-meta">${a.ml} ml · ${a.etat === 'blister' ? 'neuf' : `reste ~${a.niveau} %`}</p>
      </a>${coeur(a.id)}
    </article>`;
  }
  const remiseMoyenne = Math.round(
    (ANNONCES.reduce((s, a) => {
      const f = P[a.p].formats.find((x) => x.ml === a.ml);
      return s + (1 - prixMl(a) / (f.neuf / f.ml));
    }, 0) /
      ANNONCES.length) *
      100,
  );

  /* les photos demandées au vendeur */
  const PHOTOS = [
    {k: 'face', t: 'Le flacon de face', d: 'Bien droit, étiquette lisible.', pourquoi: 'Forme du flacon, du bouchon et de l\'étiquette', obl: true},
    {k: 'dessous', t: 'Le dessous du flacon', d: 'Le code lot gravé ou imprimé doit se lire.', pourquoi: 'Le code lot existe et suit le format de la marque', obl: true},
    {k: 'niveau', t: 'Le niveau', d: 'À hauteur des yeux, sur un fond clair. Flacon opaque : une lampe de téléphone collée derrière.', pourquoi: 'Le niveau annoncé est le bon', obl: true},
    {k: 'dessus', t: 'Sans le bouchon, vu de dessus', d: 'Le bouton spray en place, la bague bien visible.', pourquoi: 'Le spray et le sertissage d\'origine', obl: true},
    {k: 'tige', t: 'Sans le bouton spray', d: 'Retirez le petit bouton : la tige doit se voir.', pourquoi: 'La tige n\'a pas été forcée ni recollée', obl: true},
    {k: 'preuve', t: 'Votre pseudo et la date', d: 'Le flacon à côté d\'un papier où vous les avez écrits.', pourquoi: 'Le vendeur a le flacon entre les mains', obl: true},
    {k: 'boite', t: 'La boîte', d: 'Avec le code lot et le code-barres, si vous l\'avez.', pourquoi: 'Le même code lot que sur le flacon', obl: false},
    {k: 'ticket', t: 'Le ticket ou la facture', d: 'Facultatif, mais rassurant pour l\'acheteur.', pourquoi: 'La provenance', obl: false},
  ];
  const OBLIGATOIRES = PHOTOS.filter((x) => x.obl).length;
  /* l'astuce du niveau d'un flacon opaque, montrée dans le formulaire et dans « Comment ça marche » */
  const astuceOpaque = () => `<aside class="astuce"><img class="astuce-img" src="${typeof PHOTOS_EMBARQUEES !== 'undefined' ? PHOTOS_EMBARQUEES.contrejour : '../photos/contrejour.webp'}" alt="Un flacon noir opaque, la lampe d'un téléphone collée derrière : le parfum fait une zone sombre et la limite du niveau se voit." width="600" height="750" loading="lazy">
      <div><p class="surtitre">Flacon opaque ?</p><p class="astuce-titre">Le niveau se voit à contre-jour.</p><p>Dans une pièce peu éclairée, allumez la lampe d'un téléphone et collez-la contre le dos du flacon. La lumière traverse le verre : le parfum fait une zone plus sombre, et la limite se voit nettement. Prenez la photo de face, à hauteur du niveau.</p></div></aside>`;


  /* ——— accueil ———
     Quatre temps : deux portes (acheter, vendre), le ruban des annonces, une annonce décortiquée, et la liste de
     vérification à la réception. */
  const VUES = {};
  const quand = (j) => (j === 0 ? 'aujourd\'hui' : j === 1 ? 'hier' : `il y a ${j} j`);
  const DIRECT = [
    ['a104', 'il y a 4 min'],
    ['a101', 'il y a 12 min'],
    ['a120', 'il y a 26 min'],
    ['a109', 'il y a 41 min'],
    ['a112', 'il y a 1 h'],
  ];
  const direct = (k) => {
    const [id, il] = DIRECT[k % DIRECT.length];
    const a = A[id];
    return `<a href="#annonce-${id}">Vérifiée ${il} · <strong>${esc(P[a.p].nom)}</strong> · ${eur(a.prix)}</a>`;
  };
  let railMaison = 'tout';
  const annoncesRail = () => [...ANNONCES].filter((a) => railMaison === 'tout' || P[a.p].maison === railMaison).sort((x, y) => x.jours - y.jours);
  const rail = () =>
    annoncesRail()
      .map((a) => carte(a, `<span class="etiq etiq-verif">${ico('check')}Vérifiée ${quand(a.jours)}</span>`))
      .join('');
  const ANATOMIE = [
    {t: `${OBLIGATOIRES} photos imposées`, d: 'Toujours les mêmes, jusqu\'à la tige du spray et une photo avec le pseudo du vendeur.'},
    {t: 'Vérifiée par l\'équipe', d: 'Avant d\'être en ligne, en quelques heures. Code lot, spray, tige, niveau, prix.'},
    {t: '7 jours pour vérifier', d: 'L\'argent reste bloqué jusqu\'à votre accord. Non conforme : remboursé.'},
    {t: '0 % pour le vendeur', d: 'Il touche le prix affiché. L\'acheteur paie une protection de 8 % + 0,90 €.'},
  ];
  let anat = 0;
  const RECEPTION = [
    {t: 'Le code lot', d: 'Le même sous le flacon et sur la boîte. Effacé ou gratté : signalez-le.', vues: ['dessous', 'boite']},
    {t: 'Le spray et la tige', d: 'Retirez le bouton : la tige doit être propre, droite, sans trace de colle.', vues: ['dessus', 'tige']},
    {t: 'Le niveau', d: 'Il correspond à la photo de l\'annonce.', vues: ['niveau']},
    {t: 'Le jus', d: 'Couleur et limpidité comparables aux photos, sans dépôt ni trouble.', vues: ['face']},
    {t: 'L\'odeur', d: 'Vaporisez sur la peau et laissez le temps faire : le fond compte autant que le départ.', odeur: true},
  ];
  const coches = new Set();
  VUES.accueil = () => {
    const a = A.a101;
    const pile = [A.a109, A.a104, A.a106];
    const ms = [...new Set(ANNONCES.map((x) => P[x.p].maison))].sort((x, y) => x.localeCompare(y, 'fr'));
    return `
    <section class="portes env">
      <div class="portes-in">
        <div class="porte porte-acheter">
          <div class="porte-texte">
            <p class="surtitre">Acheter</p>
            <h1>Le parfum de seconde main, sans le doute.</h1>
            <p class="porte-sous">Chaque annonce est vérifiée par l'équipe avant d'être en ligne. Et vous avez 7 jours, flacon en main, pour vérifier à votre tour.</p>
            <form class="cherche-grand" data-form="recherche" role="search">
              <label class="vh" for="q-hero">Rechercher un parfum ou une maison</label>
              ${ico('loupe')}<input id="q-hero" name="q" type="search" placeholder="Un parfum, une maison…" autocomplete="off">
              <button class="btn btn-noir" type="submit">Rechercher</button>
            </form>
            <p class="direct" aria-live="polite"><span class="point-vert" aria-hidden="true"></span><span id="direct">${direct(0)}</span></p>
          </div>
          <div class="pile" aria-hidden="true">${pile.map((x, i) => `<span class="pile-photo" style="--i:${i}">${photo(x)}</span>`).join('')}</div>
        </div>
        <a class="porte porte-vendre" href="#vendre">
          <div class="porte-texte">
            <p class="surtitre">Vendre</p>
            <h2>Il dort dans un placard&nbsp;? Vendez‑le, sans commission.</h2>
            <p>Vous touchez 100&nbsp;% du prix. Six photos, une vérification, et il est en ligne.</p>
            <span class="btn btn-noir">Vendre un parfum ${ico('fleche')}</span>
          </div>
          <div class="porte-visuel">${Dessins.vaporise()}</div>
        </a>
      </div>
    </section>

    <section class="ruban-section">
      <div class="env ruban-tete">
        <div><h2 class="grand-titre">En ce moment</h2><p class="aide">En moyenne ${remiseMoyenne}&nbsp;% moins cher que neuf, au millilitre. Chaque annonce a été vérifiée avant d'apparaître ici.</p></div>
        <div class="ruban-fleches"><button class="rond" type="button" data-ruban="-1" aria-label="Annonces précédentes">${ico('fleche')}</button><button class="rond" type="button" data-ruban="1" aria-label="Annonces suivantes">${ico('fleche')}</button></div>
      </div>
      <div class="env"><div class="ruban-filtres" role="group" aria-label="Filtrer par maison">${['tout', ...ms].map((m) => `<button type="button" class="filtre" data-ruban-maison="${esc(m)}" aria-pressed="${railMaison === m}">${m === 'tout' ? 'Toutes les maisons' : esc(m)}</button>`).join('')}</div></div>
      <div class="ruban" id="ruban" tabindex="0" aria-label="Annonces récentes">${rail()}</div>
      <div class="env"><a class="lien" href="#recherche">Voir les ${ANNONCES.length} annonces ${ico('fleche')}</a></div>
    </section>

    <section class="section env anatomie" data-anatomie>
      <div class="anat-texte">
        <p class="surtitre">Pourquoi c'est plus sûr</p>
        <h2 class="grand-titre">Une annonce Respray, point par point.</h2>
        <ol class="anat-points" role="tablist" aria-label="Ce qui protège une vente">${ANATOMIE.map((x, i) => `<li><button type="button" role="tab" aria-selected="${i === anat}" data-anat="${i}"><span class="anat-n">${String(i + 1).padStart(2, '0')}</span><span class="anat-txt"><strong>${x.t}</strong><small>${x.d}</small></span><i class="anat-prog" aria-hidden="true"></i></button></li>`).join('')}</ol>
        <a class="lien" href="#fonctionnement">Tout le fonctionnement ${ico('fleche')}</a>
      </div>
      <div class="anat-carte" data-zone="${anat}" aria-hidden="true">
        <div class="z z0"><div class="anat-grande">${photo(a)}</div><div class="anat-minis">${['dessous', 'niveau', 'dessus', 'tige', 'preuve'].map((v) => `<span>${photo(a, v)}</span>`).join('')}</div></div>
        <div class="anat-infos"><p>${esc(P[a.p].maison)}</p><p class="anat-nom">${esc(P[a.p].nom)}</p><p class="anat-prix">${eur(a.prix)} <small>· 70 ml · reste ~85 %</small></p></div>
        <div class="z z1"><b>${ico('check')}</b><span><strong>Vérifiée par l'équipe</strong><small>le 24 novembre · 5 contrôles sur 5</small></span></div>
        <div class="z z2"><b>${ico('cadenas')}</b><span><strong>Paiement bloqué, 7 jours pour vérifier</strong><span class="anat-jours">${Array.from({length: 7}, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span></span></div>
        <div class="z z3"><b>${ico('euro')}</b><span><strong>Le vendeur reçoit ${eur2(a.prix)}</strong><small>Commission : 0,00 €</small></span></div>
      </div>
    </section>

    <section class="reception-section">
      <div class="env reception">
        <div class="rec-gauche">
          <p class="surtitre">Le guide</p>
          <h2 class="grand-titre">Vous venez de recevoir un parfum&nbsp;? Vérifiez-le en 5 gestes.</h2>
          <div class="rec-progres"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="27"/><circle class="rec-arc" cx="32" cy="32" r="27" style="--k:${coches.size / 5}"/></svg><span><strong id="rec-compte">${coches.size}/5</strong><small id="rec-message">${coches.size === 5 ? 'Tout est conforme : confirmez la réception.' : 'Cochez au fur et à mesure. Vous avez 7 jours.'}</small></span></div>
          <div class="rec-plus"><p>Aussi dans le guide</p>${GUIDE.map((g) => `<button type="button" class="filtre" data-guide="${g.k}">${g.t}</button>`).join('')}</div>
        </div>
        <ol class="rec-liste">${RECEPTION.map(
          (x, i) => `<li class="rec-item ${coches.has(i) ? 'fait' : ''}">
            <button type="button" class="rec-case" data-rec="${i}" aria-pressed="${coches.has(i)}" aria-label="${x.t} : vérifié">${ico('check')}</button>
            <details ${i === 0 ? 'open' : ''}><summary><span class="rec-n">${i + 1}</span><span class="rec-t"><strong>${x.t}</strong><small>${x.d}</small></span></summary>
              <div class="rec-corps">${
                x.odeur
                  ? `<div class="odeur"><span style="--i:0"><b>Départ</b>tout de suite</span><span style="--i:1"><b>Cœur</b>après 20 à 30 min</span><span style="--i:2"><b>Fond</b>après 1 à 2 h</span></div>`
                  : `<div class="rec-photos">${x.vues.map((v) => `<figure>${photo(a, v)}<figcaption>${Dessins.LEGENDES[v]}</figcaption></figure>`).join('')}</div>`
              }</div>
            </details>
          </li>`,
        ).join('')}</ol>
      </div>
    </section>`;
  };

  /* le reste du guide, ouvert dans un panneau */
  const GUIDE = [
    {
      k: 'lot',
      t: 'Lire un code lot',
      corps: () => `<h3>Une suite de lettres et de chiffres, gravée ou imprimée.</h3>
        <div class="guide-lot">
          <figure>${photo(A.a101, 'dessous')}<figcaption>Sous le flacon</figcaption></figure>
          <span class="guide-egal" aria-hidden="true">=</span>
          <figure>${photo(A.a101, 'boite')}<figcaption>Sur la boîte</figcaption></figure>
        </div>
        <p>Il identifie la fabrication et, chez beaucoup de marques, permet de retrouver sa date. Les deux codes doivent être les mêmes. Un code effacé ou gratté est un mauvais signe ; un code correct ne suffit pas à lui seul, d'où les autres photos.</p>`,
    },
    {
      k: 'conserver',
      t: 'Bien conserver un parfum',
      corps: () => `<h3>Lumière, chaleur et humidité sont ses ennemis.</h3>
        <ul class="guide-astuces">
          <li>${ico('soleil')}<span><strong>À l'abri de la lumière.</strong> Dans sa boîte ou un placard.</span></li>
          <li>${ico('thermo')}<span><strong>Au frais et au sec.</strong> Loin d'un radiateur et d'une fenêtre.</span></li>
          <li>${ico('goutte')}<span><strong>Pas dans la salle de bain.</strong> L'humidité et les écarts de température l'abîment.</span></li>
          <li>${ico('check')}<span><strong>Bien refermé.</strong> Le bouchon remis après chaque usage.</span></li>
        </ul>
        <p>Bien conservé, un parfum garde ses qualités pendant des années. C'est aussi ce qui fait sa valeur à la revente.</p>`,
    },
    {
      k: 'concentrations',
      t: 'Eau de toilette, eau de parfum, extrait',
      corps: () => `<h3>La différence, c'est la part de matières parfumantes.</h3>
        <div class="concentrations">${[
          ['Eau de cologne', 2, 5],
          ['Eau de toilette', 5, 15],
          ['Eau de parfum', 15, 20],
          ['Extrait de parfum', 20, 40],
        ]
          .map(([n, x, y], i) => `<div class="conc" style="--a:${x / 40};--b:${y / 40};--i:${i}"><span class="conc-nom">${n}</span><span class="conc-barre"><i></i></span><span class="conc-val">${x} à ${y}&nbsp;%</span></div>`)
          .join('')}</div>
        <p>Ce sont des ordres de grandeur : chaque maison dose à sa façon. En général, plus c'est concentré, plus le parfum tient sur la peau.</p>`,
    },
  ];

  /* ce qui bouge tout seul sur l'accueil : le fil des vérifications et l'annonce décortiquée */
  let minuteurs = [];
  function arreterAccueil() {
    minuteurs.forEach(clearInterval);
    minuteurs = [];
  }
  function montrerAnat(i, auto) {
    anat = i;
    const carteA = vue.querySelector('.anat-carte');
    if (!carteA) return;
    carteA.dataset.zone = i;
    vue.querySelectorAll('[data-anat]').forEach((b) => b.setAttribute('aria-selected', +b.dataset.anat === i));
    vue.querySelector('.anat-points').classList.toggle('auto', !!auto);
  }
  function demarrerAccueil() {
    arreterAccueil();
    if (!vue.querySelector('.portes') || reduit()) return;
    let k = 0;
    minuteurs.push(
      setInterval(() => {
        const d = document.getElementById('direct');
        if (!d) return;
        k++;
        d.classList.remove('change');
        void d.offsetWidth;
        d.innerHTML = direct(k);
        d.classList.add('change');
      }, 3600),
    );
    const bloc = vue.querySelector('[data-anatomie]');
    let visible = false;
    const o = new IntersectionObserver((e) => (visible = e[0].isIntersecting), {threshold: 0.35});
    o.observe(bloc);
    obs.push(o);
    montrerAnat(anat, true);
    minuteurs.push(
      setInterval(() => {
        if (visible && !bloc.matches(':hover') && !bloc.contains(document.activeElement) && vue.querySelector('.anat-points.auto')) montrerAnat((anat + 1) % ANATOMIE.length, true);
      }, 4200),
    );
  }

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
  const radios = (nom, val, choix, attr = '') => choix.map(([v, l]) => `<label class="choix"><input type="radio" name="${nom}" value="${v}" ${val === v ? 'checked' : ''} ${attr}> ${l}</label>`).join('');
  VUES.recherche = () => {
    const ms = [...new Set(PARFUMS.map((p) => p.maison))].sort((x, y) => x.localeCompare(y, 'fr'));
    return `<div class="env page">
      <h1 class="titre-page">${R.q ? `Résultats pour « ${esc(R.q)} »` : 'Tous les parfums'}</h1>
      <div class="recherche">
        <details class="filtres" ${matchMedia('(min-width: 961px)').matches ? 'open' : ''}>
          <summary>Filtres</summary>
          <form data-form="filtres">
            <label class="vh" for="q-filtre">Parfum ou maison</label>
            <input id="q-filtre" class="champ" name="q" type="search" value="${esc(R.q)}" placeholder="Parfum ou maison" autocomplete="off">
            <fieldset><legend>Pour</legend>${radios('genre', R.genre, [['tous', 'Tous'], ['Femme', 'Femme'], ['Homme', 'Homme'], ['Mixte', 'Mixte']])}</fieldset>
            <fieldset><legend>État</legend>${radios('etat', R.etat, [['tous', 'Tous'], ['blister', 'Neuf sous blister'], ['entame', 'Entamé']])}</fieldset>
            <fieldset><legend>Contenance</legend>${radios('taille', R.taille, [['tous', 'Toutes'], ['petit', '50 ml ou moins'], ['moyen', '51 à 100 ml'], ['grand', 'Plus de 100 ml']])}</fieldset>
            <fieldset><legend>Prix maximum : <output id="prix-max-out">${eur(R.prixMax)}</output></legend><input id="prix-max" name="prixMax" type="range" min="20" max="300" step="10" value="${R.prixMax}" aria-label="Prix maximum"></fieldset>
            <fieldset><legend>Maison</legend>${ms.map((m, i) => `<label class="choix"><input type="checkbox" name="marque" value="${esc(m)}" id="m-${i}" ${R.marques.has(m) ? 'checked' : ''}> ${esc(m)}</label>`).join('')}</fieldset>
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
  const vuesAnnonce = (a) => ['face', 'dessous', 'niveau', 'dessus', 'tige', 'preuve', ...(a.boite ? ['boite'] : [])];
  /* ce que montre chaque photo, et pourquoi on la demande */
  const legende = (a, vue) => {
    const vues = vuesAnnonce(a);
    const n = `<span class="legende-n">${vues.indexOf(vue) + 1}/${vues.length}</span>`;
    const pseudo = esc(VENDEURS[a.v] ? VENDEURS[a.v].pseudo : 'vous');
    const textes = {
      face: '<strong>De face, bouchon en place.</strong> Le flacon tel qu\'il est, sous une lumière du jour.',
      dessous: `<strong>Le dessous du flacon.</strong> Le code lot gravé (${esc(a.lot)}), comparé à celui de la boîte et aux lots connus de la maison.`,
      niveau: `<strong>Le niveau.</strong> Flacon posé bien droit : la surface du jus doit tomber vers ${a.niveau}&nbsp;%, comme annoncé.`,
      dessus: '<strong>Sans le bouchon, vu de dessus.</strong> La bague sertie et le bouton spray d\'origine.',
      tige: '<strong>Le bouton spray retiré.</strong> La tige du diffuseur : sa forme et son diamètre trahissent souvent une copie.',
      preuve: `<strong>La photo preuve.</strong> Le vendeur a écrit son pseudo (@${pseudo}) et la date sur un papier, à côté du flacon : il prouve qu'il l'a bien en main, et que les photos ne sont pas reprises d'une autre annonce.`,
      boite: `<strong>La boîte.</strong> Son code lot doit être le même que sous le flacon (${esc(a.lot)}).`,
    };
    return `${n} ${textes[vue] || ''}`;
  };
  VUES.annonce = (id) => {
    const a = A[id];
    if (!a) return VUES.introuvable();
    const p = P[a.p];
    const v = VENDEURS[a.v];
    achat = {mode: 'envoi'};
    const autres = ANNONCES.filter((x) => x.p === a.p && x.id !== a.id);
    const fmt = p.formats.find((f) => f.ml === a.ml);
    return `<div class="env page">
      <nav class="fil" aria-label="Fil d'Ariane"><a href="#recherche">Parfums</a><span aria-hidden="true">›</span><a href="#recherche" data-marque="${esc(p.maison)}">${esc(p.maison)}</a><span aria-hidden="true">›</span><span>${esc(p.nom)}</span></nav>
      <div class="annonce">
        <div class="galerie">
          <div class="galerie-grande" id="grande" style="view-transition-name: photo-annonce">${photo(a, 'face')}</div>
          <p class="galerie-legende" id="legende" aria-live="polite">${legende(a, 'face')}</p>
          <div class="galerie-mini" role="group" aria-label="Photos de l'annonce">${vuesAnnonce(a).map((x, i) => `<button type="button" class="mini" data-vue="${x}" aria-pressed="${i === 0}" aria-label="Voir ${Dessins.LEGENDES[x]}">${photo(a, x)}</button>`).join('')}</div>
        </div>
        <div class="fiche">
          <p class="fiche-maison"><a href="#recherche" data-marque="${esc(p.maison)}">${esc(p.maison)}</a></p>
          <h1>${esc(p.nom)}</h1>
          <p class="fiche-sous">${esc(p.conc)} · ${a.ml} ml</p>
          <p class="fiche-prix">${eur(a.prix)}</p>
          <p class="fiche-ml">${a.etat === 'blister' ? 'Neuf' : `Environ ${mlRestants(a)} ml restants`} · ${nb(prixMl(a), 2)} €/ml${fmt ? ` · neuf : ${eur(fmt.neuf)}` : ''}</p>
          <dl class="details">
            <div><dt>État</dt><dd>${a.etat === 'blister' ? 'Neuf sous blister' : `Reste environ ${a.niveau} %`}</dd></div>
            <div><dt>Boîte</dt><dd>${a.boite ? 'Oui' : 'Non'}</dd></div>
            <div><dt>Code lot</dt><dd>${esc(a.lot)}</dd></div>
            <div><dt>Acheté en</dt><dd>${a.achat}</dd></div>
            <div><dt>Famille</dt><dd>${pastillesFamille(p.famille)}</dd></div>
          </dl>
          <fieldset class="livraison"><legend>Livraison</legend>
            <label class="option"><input type="radio" name="mode" value="envoi" checked data-mode> <span>Envoi suivi en point relais<small>2 à 4 jours</small></span><span>${eur2(ENVOI)}</span></label>
            ${a.mainPropre ? `<label class="option"><input type="radio" name="mode" value="main" data-mode> <span>Remise en main propre<small>${esc(v.ville)} · vous payez en ligne, l'argent est versé quand vous validez sur place</small></span><span>Gratuit</span></label>` : ''}
          </fieldset>
          ${a.prix >= SEUIL_ASSURANCE ? `<label class="choix option-assure"><input type="checkbox" data-assure ${achat.assure ? 'checked' : ''}> <span>Envoi assuré à la valeur réelle (${eur(a.prix)}) : ${eur2(ASSURANCE)}<small>L'assurance de base du point relais ne couvre pas un flacon de ce prix. Avec elle, la perte ou la casse est remboursée en entier par le transporteur.</small></span></label>` : ''}
          <div id="total">${total(a)}</div>
          <div class="boutons">
            <button class="btn btn-noir btn-large" type="button" data-action="acheter" data-a="${a.id}">Acheter</button>
            <button class="btn btn-large" type="button" data-action="offre" data-a="${a.id}">Faire une offre</button>
          </div>
          <div class="protection">
            <h2>${ico('cadenas')}Protection acheteur</h2>
            <p>Votre paiement reste bloqué jusqu'à ce que vous ayez vérifié le parfum. Vous avez <strong>7 jours après la livraison</strong> : s'il n'est pas conforme à l'annonce, vous êtes remboursé.</p>
          </div>
          ${blocVendeur(v, a)}
        </div>
      </div>
      <div class="annonce-bas">
        <section><h2 class="h2">Description</h2><p>${esc(a.desc)}</p></section>
        <section class="verifiee"><h2 class="h2">${ico('check')}Annonce vérifiée par l'équipe</h2>
          <ul><li>Les ${OBLIGATOIRES} photos demandées sont présentes et nettes</li><li>Le code lot correspond au format de la marque${a.boite ? ', et à celui de la boîte' : ''}</li><li>Le flacon, le spray et la tige correspondent aux modèles connus</li><li>Le niveau visible correspond à l'annonce</li><li>La photo avec le pseudo et la date prouve que le vendeur a le flacon</li></ul>
        </section>
      </div>
      ${autres.length ? `<section class="section"><div class="section-tete"><h2>Autres annonces de ${esc(p.nom)}</h2></div><div class="grille">${autres.map(carte).join('')}</div></section>` : ''}
    </div>`;
  };
  /* le vendeur : note, ventes conformes, délai d'envoi, et ses avis (seuls les acheteurs d'une vente conclue en laissent) */
  const etoiles = (n) => `<span class="etoiles" aria-label="${n} sur 5">${'★'.repeat(n)}<span aria-hidden="true">${'★'.repeat(5 - n)}</span></span>`;
  function blocVendeur(v, a) {
    const avis = AVIS[a.v] || [];
    const tete = `<span class="avatar" aria-hidden="true">${esc(v.pseudo[0].toUpperCase())}</span>
      <span><strong>${esc(v.pseudo)}</strong><small>${v.note ? `★ ${nb(v.note, 1)} · ${v.avis} avis · ${v.ventes} ventes` : 'Nouveau vendeur : pas encore d\'avis'}</small><small>${esc(v.ville)} · répond ${v.reponse} · membre depuis ${v.depuis}</small></span>`;
    if (!v.note) return `<div class="vendeur-bloc"><div class="vendeur">${tete}</div><p class="vendeur-nouveau">Ses annonces sont vérifiées comme les autres, et votre paiement reste bloqué 7 jours.</p></div>`;
    const crit = ['Conforme aux photos', 'Bien emballé', 'Envoyé en moins de 3 jours'];
    return `<div class="vendeur-bloc">
      <div class="vendeur">${tete}</div>
      <ul class="vendeur-chiffres">
        <li><strong>${v.conformes} %</strong><small>de ventes conformes</small></li>
        <li><strong>${nb(v.envoi, 1)} j</strong><small>pour envoyer, en moyenne</small></li>
        <li><strong>${v.ventes}</strong><small>ventes conclues</small></li>
      </ul>
      <details class="vendeur-avis"><summary>Voir les ${v.avis} avis</summary>
        <ul class="criteres">${crit.map((c, i) => `<li><span>${c}</span><i style="--p:${v.criteres[i]}%"></i><b>${v.criteres[i]} %</b></li>`).join('')}</ul>
        ${avis.map((x) => `<article class="avis"><p class="avis-tete">${etoiles(x.note)}<span>${esc(x.qui)} · ${esc(x.quoi)} · ${x.quand}</span></p><p>${esc(x.texte)}</p>${x.reponse ? `<p class="avis-reponse"><strong>Réponse de ${esc(v.pseudo)}</strong> ${esc(x.reponse)}</p>` : ''}</article>`).join('')}
        <p class="aide">Avis d'acheteurs vérifiés : un seul par vente conclue, laissé après les 7 jours.</p>
      </details>
    </div>`;
  }
  const assure = (a) => achat.mode === 'envoi' && achat.assure && a.prix >= SEUIL_ASSURANCE;
  function total(a) {
    const port = achat.mode === 'envoi' ? ENVOI : 0;
    const pr = protection(a.prix);
    const ass = assure(a) ? ASSURANCE : 0;
    return `<dl class="total">
      <div><dt>Parfum</dt><dd>${eur2(a.prix)}</dd></div>
      <div><dt>Protection acheteur</dt><dd>${eur2(pr)}</dd></div>
      <div><dt>Livraison</dt><dd>${port ? eur2(port) : 'Gratuit'}</dd></div>
      ${ass ? `<div><dt>Envoi assuré à ${eur(a.prix)}</dt><dd>${eur2(ass)}</dd></div>` : ''}
      <div class="total-ligne"><dt>Total</dt><dd>${eur2(a.prix + pr + port + ass)}</dd></div>
    </dl>`;
  }

  /* ——— vendre ——— */
  const AUTRE = '__autre';
  const V0 = {maison: '', maisonAutre: '', parfum: '', parfumAutre: '', conc: '', genre: '', familles: [], format: 'flacon', ml: '', mlAutre: '', etat: 'entame', niveau: 80, visible: '', defauts: [], annee: '', lieu: '', lumiere: '', chaleur: '', boite: '', lot: '', lotIllisible: false, desc: '', prix: '', boost: '', mainPropre: false, ville: '', engagement: false, photos: {}, envoye: false, proposes: []};
  /* ce que le vendeur déclare : des listes courtes, des réponses qui ne se contredisent pas */
  const CONCENTRATIONS = ['Extrait de parfum', 'Eau de parfum', 'Eau de toilette', 'Eau de Cologne', 'Parfum pour cheveux', 'Brume parfumée'];
  /* les familles, rangées par caractère, du plus frais au plus profond */
  const GROUPES_FAMILLES = [
    ['Fraîches', [['Hespéridée', 'citron, pamplemousse, néroli'], ['Aquatique', 'sel, air marin, melon'], ['Aromatique', 'menthe, basilic, sauge']]],
    ['Florales et fruitées', [['Florale', 'iris, fleur d\'oranger, muguet'], ['Fruitée', 'poire, figue, framboise']]],
    ['Chaudes', [['Gourmande', 'café, cacao, amande'], ['Ambrée', 'benjoin, labdanum, cannelle'], ['Musquée', 'peau propre, coton, poudre']]],
    ['Boisées et sombres', [['Boisée', 'oud, gaïac, vétiver'], ['Cuirée', 'daim, fumée, bouleau'], ['Chyprée', 'mousse, patchouli, agrumes'], ['Fougère', 'herbe coupée, coumarine']]],
  ];
  const FAMILLES = GROUPES_FAMILLES.flatMap((g) => g[1]);
  const CLASSE_GROUPE = ['fam-fraiche', 'fam-florale', 'fam-chaude', 'fam-boisee'];
  const groupeDe = (mot) => GROUPES_FAMILLES.findIndex(([, fs]) => fs.some(([f]) => normal(f).slice(0, 5) === normal(mot).slice(0, 5)));
  const pastillesFamille = (texte) => texte.split(/\s+/).map((m) => {
    const g = groupeDe(m);
    return `<span class="fam-pastille ${g >= 0 ? CLASSE_GROUPE[g] : ''}">${esc(m[0].toUpperCase() + m.slice(1))}</span>`;
  }).join('');
  const FORMATS = [['flacon', 'Flacon'], ['voyage', 'Format voyage'], ['miniature', 'Miniature'], ['echantillon', 'Échantillon acheté'], ['coffret', 'Coffret']];
  const LIEUX = ['Boutique de la maison', 'Parfumerie (Sephora, Nocibé, Marionnaud…)', 'Grand magasin', 'Site officiel ou parfumerie en ligne', 'Reçu en cadeau', 'Acheté d\'occasion'];
  const DEFAUTS = ['Bouchon marqué ou rayé', 'Étiquette usée', 'Flacon rayé', 'Vaporisateur un peu dur'];
  const BOITES = [['blister', 'Neuve, sous blister'], ['bon', 'En bon état'], ['abimee', 'Abîmée'], ['aucune', 'Pas de boîte']];
  const anneeAchat = () => {
    const y = new Date().getFullYear();
    return [...Array.from({length: y - 2004}, (_, i) => String(y - i)), 'Avant 2005', 'Je ne sais plus'];
  };
  const V = structuredClone(V0);
  const maisonChoisie = () => (V.maison === AUTRE ? V.maisonAutre.trim() : V.maison);
  const parfumCatalogue = () => (V.maison && V.maison !== AUTRE && P[V.parfum] ? P[V.parfum] : null);
  const parfumLibre = () => V.maison === AUTRE || (V.maison && (!parfumsDe(V.maison).length || V.parfum === AUTRE));
  function aideMaison() {
    const t = V.maisonAutre.trim();
    if (!t) return 'Écrivez le nom tel qu\'il apparaît sur le flacon.';
    const r = ressemble(t, maisons());
    if (r && r.exact) return `<strong>${esc(r.nom)}</strong> est déjà dans la liste. <button type="button" class="lien-bouton" data-choisir-maison="${esc(r.nom)}">La choisir</button>`;
    if (r) return `Vouliez-vous dire <strong>${esc(r.nom)}</strong>&nbsp;? <button type="button" class="lien-bouton" data-choisir-maison="${esc(r.nom)}">Oui, la choisir</button>`;
    return `Elle sera proposée à l'équipe, qui vérifie l'orthographe et l'ajoute à la liste. Votre annonce est vérifiée en même temps.`;
  }
  /* le formulaire de vente : une seule page, six blocs, et à droite l'annonce telle qu'elle sera, qui se remplit au fil
     des réponses. Pour un parfum du catalogue, le genre, la famille et la concentration sont déjà remplis. */
  const segment = (champ, val, choix) => `<div class="segment" role="radiogroup">${choix.map(([v, l]) => `<label class="choix"><input type="radio" name="${champ}" value="${esc(v)}" ${val === v ? 'checked' : ''} data-champ="${champ}"> ${l}</label>`).join('')}</div>`;
  const puces = (champ, vals, choix) => `<div class="coches">${choix.map(([v, l, d]) => `<label class="coche" ${d ? `title="${esc(d)}"` : ''}><input type="checkbox" value="${esc(v)}" ${vals.includes(v) ? 'checked' : ''} data-multi="${champ}"><span>${l}${d ? `<small>${d}</small>` : ''}</span></label>`).join('')}</div>`;
  function blocsVente() {
    const pc = parfumCatalogue();
    const ml = pc ? +V.ml : nombre(V.mlAutre);
    const sections = [
      ['Le parfum', !!(maisonChoisie() && nomParfum() && (pc || (V.conc && V.genre)))],
      ['Le flacon', ml > 0 && (V.etat === 'blister' || V.visible) && !!V.boite],
      ['Son histoire', !!(V.annee && V.lieu && V.lumiere && V.chaleur)],
      ['Photos et code lot', PHOTOS.every((x) => !x.obl || V.photos[x.k]) && !!(V.lot.trim() || V.lotIllisible)],
      ['Prix et remise', nombre(V.prix) >= 3 && (!V.mainPropre || V.ville.trim())],
      ['Engagement', V.engagement],
    ];
    return sections;
  }
  function apercuVente() {
    const pc = parfumCatalogue();
    const ml = pc ? +V.ml : nombre(V.mlAutre);
    const conc = pc ? pc.conc : V.conc;
    const ph = V.photos.face;
    const memeParfum = pc && ANNONCES.find((a) => a.p === pc.id);
    const image = ph && ph !== true ? `<img class="visuel" src="${ph}" alt="">` : pc || ph ? photo(memeParfum || A.a101, 'face') : '<span class="visuel apercu-sans"></span>';
    const restant = V.etat === 'entame' && ml > 0 ? ` · reste ~${V.niveau} % (≈ ${Math.round((ml * V.niveau) / 100)} ml)` : '';
    const sections = blocsVente();
    return `<div class="apercu-carte"><div class="apercu-photo">${image}${pc || ph ? '' : '<span class="apercu-vide">Votre photo de face</span>'}</div>
        <p class="carte-maison">${esc(maisonChoisie() || 'Maison')}</p><p class="carte-nom">${esc(nomParfum() || 'Parfum')}</p>
        <p class="carte-meta">${esc(conc || 'Concentration')}${ml > 0 ? ` · ${ml} ml` : ''}${V.etat === 'blister' ? ' · neuf sous blister' : restant}</p>
        ${pc || V.familles.length ? `<p class="apercu-fam">${pastillesFamille(pc ? pc.famille : V.familles.join(' '))}</p>` : ''}
        <p class="carte-prix">${nombre(V.prix) >= 3 ? eur(nombre(V.prix)) : '— €'}</p>
        ${V.annee || V.lot ? `<p class="carte-meta">${V.annee ? `Acheté : ${esc(V.annee)}` : ''}${V.annee && V.lot ? ' · ' : ''}${V.lot ? `lot ${esc(V.lot)}` : ''}</p>` : ''}
      </div>
      <ol class="apercu-etapes">${sections.map(([t, ok]) => `<li class="${ok ? 'fait' : ''}"><span>${ok ? ico('check') : ''}</span>${t}</li>`).join('')}</ol>
      <p class="aide">${sections.filter((x) => x[1]).length} sur ${sections.length} · l'équipe vérifie ensuite, en général en quelques heures.</p>`;
  }
  VUES.vendre = () => {
    if (V.envoye) return vendreEnvoye();
    const m = maisonChoisie();
    const liste = V.maison && V.maison !== AUTRE ? parfumsDe(V.maison) : [];
    const pc = parfumCatalogue();
    const libre = parfumLibre();
    const parfumPret = pc || libre || (V.parfum && V.parfum.startsWith('ajout:'));
    const prixAnnonces = pc ? ANNONCES.filter((a) => a.p === pc.id).map((a) => a.prix) : [];
    const manquantes = PHOTOS.filter((x) => x.obl && !V.photos[x.k]).length;
    const n = (i) => `<span class="bloc-n">${i}</span>`;
    return `<div class="env page vendre">
      <h1 class="titre-page">Vendre un parfum</h1>
      <p class="chapo">Gratuit, sans commission. Plus votre annonce est précise, plus elle se vend vite, et moins l'acheteur a de questions.</p>
      <div class="vendre-grille">
      <form class="formulaire" data-form="vendre" novalidate>
        <section class="bloc-form">
          <h2 class="h2">${n(1)}Le parfum</h2>
          <label for="maison">Maison</label>
          <select id="maison" class="champ" data-champ="maison"><option value="">Choisir une maison</option>${maisons().map((x) => `<option ${V.maison === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}<option value="${AUTRE}" ${V.maison === AUTRE ? 'selected' : ''}>Ma maison n'est pas dans la liste</option></select>
          ${V.maison === AUTRE ? `<label for="maison-autre">Nom de la maison</label><input id="maison-autre" class="champ" data-champ="maisonAutre" value="${esc(V.maisonAutre)}" placeholder="ex. Maison Crivelli" autocomplete="off"><p class="aide aide-maison" id="aide-maison" aria-live="polite">${aideMaison()}</p>` : ''}
          ${liste.length ? `<label for="parfum">Parfum</label><select id="parfum" class="champ" data-champ="parfum"><option value="">Choisir un parfum</option>${liste.map((x) => `<option value="${esc(x.id)}" ${V.parfum === x.id ? 'selected' : ''}>${esc(x.nom)}${x.conc ? ` (${esc(x.conc)})` : ''}</option>`).join('')}<option value="${AUTRE}" ${V.parfum === AUTRE ? 'selected' : ''}>Mon parfum n'est pas dans la liste</option></select>` : ''}
          ${pc ? `<div class="fiche-auto"><p class="surtitre">Rempli d'après le catalogue</p><dl><div><dt>Concentration</dt><dd>${esc(pc.conc)}</dd></div><div><dt>Pour</dt><dd>${esc(pc.genre)}</dd></div><div><dt>Famille</dt><dd>${pastillesFamille(pc.famille)}</dd></div><div><dt>Notes</dt><dd>${esc(pc.notes)}</dd></div></dl><p class="aide">Une erreur ? Dites-le dans la description : l'équipe corrige la fiche.</p></div>` : ''}
          ${libre ? `<label for="parfum-autre">Nom du parfum</label><input id="parfum-autre" class="champ" data-champ="parfumAutre" value="${esc(V.parfumAutre)}" placeholder="ex. Tobacco Mandarin" autocomplete="off">
            <p class="aide">Il sera ajouté à la liste${m && V.maison !== AUTRE ? ` de ${esc(m)}` : ''} une fois l'orthographe vérifiée par l'équipe.</p>
            <fieldset><legend>Concentration</legend>${segment('conc', V.conc, CONCENTRATIONS.map((c) => [c, c]))}</fieldset>
            <fieldset><legend>Pour</legend>${segment('genre', V.genre, [['Femme', 'Femme'], ['Homme', 'Homme'], ['Mixte', 'Mixte']])}</fieldset>
            <fieldset><legend>Son caractère <small>une ou deux familles, facultatif</small></legend><div class="groupes-familles">${GROUPES_FAMILLES.map(([g, fs], i) => `<div class="${CLASSE_GROUPE[i]}"><p class="groupe-titre">${g}</p>${puces('familles', V.familles, fs.map(([f, d]) => [f, f, d]))}</div>`).join('')}</div></fieldset>` : ''}
        </section>

        ${parfumPret ? `<section class="bloc-form">
          <h2 class="h2">${n(2)}Le flacon</h2>
          <fieldset><legend>Format</legend>${segment('format', V.format, FORMATS)}</fieldset>
          ${V.format === 'coffret' ? '<p class="aide">Un coffret est accepté s\'il est neuf, scellé et sous blister.</p>' : V.format === 'echantillon' ? '<p class="aide">Un échantillon acheté, oui ; un échantillon offert ou marqué « Ne peut être vendu », non.</p>' : ''}
          <label for="ml">Contenance</label>${pc && V.format === 'flacon' ? `<select id="ml" class="champ" data-champ="ml"><option value="">Choisir</option>${pc.formats.map((f) => `<option value="${f.ml}" ${+V.ml === f.ml ? 'selected' : ''}>${f.ml} ml</option>`).join('')}</select>` : `<div class="champ-prix"><input id="ml" class="champ" inputmode="numeric" data-champ="mlAutre" value="${esc(V.mlAutre)}" placeholder="${V.format === 'echantillon' ? '2' : V.format === 'voyage' || V.format === 'miniature' ? '10' : '100'}"><span>ml</span></div>`}
          <fieldset><legend>État</legend>${segment('etat', V.etat, [['blister', 'Neuf, jamais ouvert'], ['entame', 'Déjà utilisé']])}</fieldset>
          ${V.etat === 'entame' ? `<label for="niveau">Il reste environ <output id="niveau-out">${V.niveau} %</output></label><input id="niveau" type="range" min="5" max="100" step="5" value="${V.niveau}" data-champ="niveau">
            <p class="aide">Le niveau exact, pas une tranche : l'équipe le compare à la photo du niveau.</p>
            <fieldset><legend>Le parfum se voit-il à travers le flacon ?</legend>${segment('visible', V.visible, [['oui', 'Oui'], ['opaque', 'Non, le flacon est opaque']])}</fieldset>
            ${V.visible === 'opaque' ? astuceOpaque() : ''}
            <fieldset><legend>Petits défauts <small>facultatif</small></legend>${puces('defauts', V.defauts, DEFAUTS.map((x) => [x, x]))}</fieldset>` : ''}
          <fieldset><legend>Et sa boîte ?</legend>${segment('boite', V.boite, BOITES)}</fieldset>
        </section>

        <section class="bloc-form">
          <h2 class="h2">${n(3)}Son histoire</h2>
          <div class="ligne-champs">
            <div><label for="annee">Acheté en</label><select id="annee" class="champ" data-champ="annee"><option value="">Choisir</option>${anneeAchat().map((x) => `<option ${V.annee === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
            <div><label for="lieu">Où</label><select id="lieu" class="champ" data-champ="lieu"><option value="">Choisir</option>${LIEUX.map((x) => `<option ${V.lieu === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
          </div>
          <fieldset><legend>Rangé à l'abri de la lumière ?</legend>${segment('lumiere', V.lumiere, [['abri', 'Oui, dans un placard ou sa boîte'], ['expose', 'Non, à la lumière']])}</fieldset>
          <fieldset><legend>Et de la chaleur ?</legend>${segment('chaleur', V.chaleur, [['abri', 'Oui'], ['expose', 'Non (salle de bain, près d\'un radiateur…)']])}</fieldset>
          <p class="aide">La lumière et la chaleur abîment un parfum : l'acheteur le saura avant d'acheter, c'est ce qui le rassure.</p>
          <label for="desc">Description <small class="facultatif">facultatif</small></label>
          <textarea id="desc" class="champ" rows="3" data-champ="desc" placeholder="Pourquoi vous le vendez, combien de fois il a été porté, ce que l'acheteur doit savoir…">${esc(V.desc)}</textarea>
        </section>

        <section class="bloc-form">
          <h2 class="h2">${n(4)}Photos et code lot</h2>
          <p class="aide">Elles nous permettent de vérifier votre parfum avant de publier l'annonce. Les ${OBLIGATOIRES} premières sont obligatoires ; chaque case montre l'exemple à suivre.</p>
          <div class="photos">${PHOTOS.map((x) => `<label class="photo ${V.photos[x.k] ? 'faite' : ''}">
              <input class="vh" type="file" accept="image/*" data-photo="${x.k}">
              <span class="photo-cadre">${V.photos[x.k] ? (V.photos[x.k] === true ? photo(A.a101, x.k) + `<span class="photo-ok">${ico('check')}</span>` : `<img src="${V.photos[x.k]}" alt="">`) : `<span class="photo-exemple">${photo(A.a101, x.k)}</span><span class="photo-plus">${ico('photo')}</span>`}</span>
              <span class="photo-txt"><strong>${x.t}${x.obl ? '' : ' <em>facultatif</em>'}</strong><small>${x.d}</small></span>
            </label>`).join('')}</div>
          <button class="btn btn-petit" type="button" data-action="photos-exemple">Ajouter des photos d'exemple</button>
          <label for="lot">Le code lot, tel qu'on le lit sur la photo du dessous</label>
          <input id="lot" class="champ" data-champ="lot" value="${esc(V.lot)}" placeholder="ex. 3A21" autocomplete="off" ${V.lotIllisible ? 'disabled' : ''}>
          <p class="aide">Gravé ou imprimé sous le flacon, et sur la boîte (souvent à côté du code-barres). L'équipe vérifie qu'il suit le format de la maison.</p>
          <label class="choix"><input type="checkbox" data-champ="lotIllisible" ${V.lotIllisible ? 'checked' : ''}> Il est effacé ou illisible</label>
          ${V.visible === 'opaque' ? '' : astuceOpaque()}
        </section>` : ''}

        ${parfumPret ? `<section class="bloc-form">
          <h2 class="h2">${n(5)}Prix et remise</h2>
          <label for="prix">Votre prix</label>
          <div class="champ-prix"><input id="prix" class="champ" inputmode="decimal" value="${esc(V.prix)}" placeholder="0" data-champ="prix"><span>€</span></div>
          ${prixAnnonces.length ? `<p class="aide">Annonces actuelles de ce parfum : de ${eur(Math.min(...prixAnnonces))} à ${eur(Math.max(...prixAnnonces))}.</p>` : ''}
          <p class="aide" id="recu">${V.prix ? `Vous recevrez ${eur2(nombre(V.prix) || 0)} : aucune commission.` : 'Vous recevez la totalité du prix : aucune commission.'}</p>
          <p class="aide">Envoi en point relais, suivi : vous imprimez l'étiquette, vous avez 5 jours pour déposer le colis.</p>
          <fieldset><legend>Mettre l'annonce en avant <small>facultatif, payé seulement si elle est publiée</small></legend>${segment('boost', V.boost, MISES_EN_AVANT.map(([k, l, pr]) => [k, pr ? `${l} · ${eur2(pr)}` : l]))}</fieldset>
          <label class="choix"><input type="checkbox" data-champ="mainPropre" ${V.mainPropre ? 'checked' : ''}> J'accepte aussi la remise en main propre</label>
          ${V.mainPropre ? `<label for="ville">Ville ou arrondissement</label><input id="ville" class="champ" data-champ="ville" value="${esc(V.ville)}" placeholder="ex. Lyon 3e" autocomplete="off">` : ''}
        </section>

        <section class="bloc-form">
          <h2 class="h2">${n(6)}Votre engagement</h2>
          <label class="choix engagement"><input type="checkbox" data-champ="engagement" ${V.engagement ? 'checked' : ''}> <span>Je certifie que ce parfum est authentique, qu'il n'a été ni dilué ni transvasé, et que je l'ai entre les mains. Je sais qu'une contrefaçon entraîne le remboursement de l'acheteur et l'exclusion de Respray.</span></label>
        </section>` : ''}

        <p class="erreur" id="erreur" role="alert" hidden></p>
        ${parfumPret ? `<button class="btn btn-noir btn-large" type="submit">Envoyer à la vérification</button>
        <p class="aide">${manquantes ? `Il manque ${manquantes} photo${manquantes > 1 ? 's' : ''} obligatoire${manquantes > 1 ? 's' : ''}.` : 'Toutes les photos obligatoires sont là.'}</p>` : ''}
      </form>
      <aside class="apercu" aria-label="Aperçu de votre annonce"><p class="surtitre">Votre annonce</p><div id="apercu">${apercuVente()}</div></aside>
      </div>
    </div>`;
  };
  function nomParfum() {
    const pc = parfumCatalogue();
    if (pc) return pc.nom;
    if (V.parfum && V.parfum.startsWith('ajout:')) return V.parfum.slice(6);
    return V.parfumAutre.trim();
  }
  function vendreEnvoye() {
    const ml = parfumCatalogue() ? V.ml : V.mlAutre;
    const n = V.proposes.length;
    const quoi = V.proposes.map((x) => `${x.type === 'maison' ? 'la maison' : 'le parfum'} <strong>« ${esc(x.tape)} »</strong>`).join(' et ');
    return `<div class="env page vendre">
      <div class="envoye">
        <span class="rond-ok">${ico('check')}</span>
        <h1 class="titre-page">Annonce envoyée à la vérification</h1>
        <p class="chapo">${esc(maisonChoisie())}, ${esc(nomParfum())}, ${esc(ml)} ml, ${eur(nombre(V.prix))}. Notre équipe vérifie vos photos, en général en quelques heures. Vous recevez une notification dès que l'annonce est en ligne.</p>
        ${n ? `<p class="note-ajout">${ico('cloche')}<span>Vous avez proposé ${quoi}. L'équipe en est prévenue dans son back-office : elle vérifie l'orthographe et ${n > 1 ? 'les ajoute' : 'l\'ajoute'} à la liste pour les prochains vendeurs.</span></p>` : ''}
        <p class="note-ajout">${ico('cloche')}<span>Prototype : votre annonce est dans la file de vérification du back-office. <a href="#panel/annonces">La vérifier comme l'équipe</a></span></p>
        <p class="aide">Si une photo ne permet pas de vérifier le parfum, on vous dit laquelle refaire.</p>
        <div class="boutons"><a class="btn btn-noir" href="#accueil">Retour à l'accueil</a><button class="btn" type="button" data-action="nouvelle">Vendre un autre parfum</button></div>
      </div>
    </div>`;
  }

  /* ——— comment ça marche ——— */
  let parcours = 'vendre';
  const PARCOURS = {
    vendre: [
      {t: 'Choisissez votre parfum', d: 'Maison, parfum, contenance, état. Votre maison n\'est pas dans la liste ? Ajoutez-la : l\'équipe vérifie l\'orthographe et l\'ajoute pour tout le monde.', s: 'choisir'},
      {t: 'Prenez les photos demandées', d: `${OBLIGATOIRES} photos obligatoires, toujours les mêmes : de face, le dessous avec le code lot, le niveau, vu de dessus avec le spray, la tige sans le spray, et une photo avec votre pseudo et la date.`, s: 'photos'},
      {t: 'L\'équipe vérifie votre annonce', d: 'Code lot, flacon, spray, tige, niveau, prix : tout est contrôlé sur les photos. En quelques heures, l\'annonce est en ligne, ou on vous dit quoi refaire.', s: 'verif'},
      {t: 'Vous vendez, vous expédiez', d: 'Vous êtes prévenu à la vente. Vous avez 5 jours pour envoyer le colis avec l\'étiquette fournie, suivi et assuré.', s: 'vendu'},
      {t: 'Vous êtes payé', d: 'Dès que l\'acheteur confirme, ou automatiquement 7 jours après la livraison. Sans commission : vous touchez votre prix.', s: 'paye'},
    ],
    acheter: [
      {t: 'Trouvez votre parfum', d: 'Par maison, contenance, état ou prix au millilitre. Toutes les annonces en ligne ont été vérifiées par l\'équipe.', s: 'trouver'},
      {t: 'Payez, l\'argent est bloqué', d: 'Le vendeur ne reçoit rien tant que vous n\'avez pas vérifié le parfum. Carte, Apple Pay ou Google Pay.', s: 'bloque'},
      {t: 'Recevez votre colis', d: 'Envoi suivi en point relais sous 5 jours, ou remise en main propre si vous êtes près du vendeur.', s: 'recu'},
      {t: 'Vérifiez pendant 7 jours', d: 'Code lot, tige, niveau, odeur : vous avez une semaine entière, pas 48 heures.', s: 'verifier'},
      {t: 'Confirmez, ou signalez', d: 'Tout est conforme : le vendeur est payé. Un problème : l\'argent reste bloqué, vous renvoyez le parfum et vous êtes remboursé.', s: 'fin'},
    ],
  };
  function scene(type) {
    const a = A.a101;
    const p = P[a.p];
    switch (type) {
      case 'choisir':
        return `<div class="sc-app"><p class="sc-label">Maison</p><div class="sc-champ"><span class="sc-tape">maison crivel</span><i class="sc-curseur"></i></div>
          <ul class="sc-liste"><li style="--i:0">Maison Francis Kurkdjian</li><li style="--i:1">Maison Margiela</li><li class="sc-ajout" style="--i:2">+ Ajouter « Maison Crivelli »</li></ul>
          <p class="sc-bulle">${ico('cloche')}Proposée à l'équipe : elle sera dans la liste pour les suivants.</p></div>`;
      case 'photos':
        return `<div class="sc-grille">${['face', 'dessous', 'niveau', 'dessus', 'tige', 'preuve'].map((v, i) => `<span class="sc-photo" style="--i:${i}">${photo(a, v)}<b>${ico('check')}</b></span>`).join('')}<span class="sc-flash"></span></div>`;
      case 'verif':
        return `<div class="sc-verif"><div class="sc-scan">${photo(a, 'tige')}<span class="sc-ligne"></span></div>
          <ul class="sc-checks">${['Code lot cohérent', 'Spray et bague d\'origine', 'Tige intacte', 'Niveau conforme', 'Pseudo et date'].map((t, i) => `<li style="--i:${i}"><b>${ico('check')}</b>${t}</li>`).join('')}</ul>
          <p class="sc-chip">${ico('check')}Vérifiée · en ligne</p></div>`;
      case 'vendu':
      case 'recu':
        return `<div class="sc-colis"><p class="sc-notif">${type === 'vendu' ? `Vendu ! ${esc(p.nom)} · ${eur(a.prix)}` : 'Votre colis est arrivé en point relais'}</p>
          <div class="sc-route"><svg viewBox="0 0 300 60" preserveAspectRatio="none"><path d="M10 45 C 90 5, 170 55, 290 18"/></svg><span class="sc-camion">${ico('boite')}</span></div>
          <p class="sc-sous">${type === 'vendu' ? 'À envoyer avant le 29 novembre · étiquette fournie' : 'Livré aujourd\'hui · 7 jours pour vérifier'}</p></div>`;
      case 'paye':
        return `<div class="sc-paye"><div class="sc-anneau"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52"/><circle class="sc-anneau-plein" cx="60" cy="60" r="52"/></svg><span>J+7</span></div>
          <p class="sc-montant">+${eur2(a.prix)}</p><p class="sc-sous">Virement envoyé · commission 0 €</p></div>`;
      case 'trouver':
        return `<div class="sc-trouver"><div class="sc-filtre"><span>Prix au ml</span><span>Entamé</span><span>Maison Francis Kurkdjian</span></div>
          <div class="sc-cartes">${[A.a101, A.a102, A.a103].map((x, i) => `<span class="sc-carte" style="--i:${i}">${photo(x)}<b>${eur(x.prix)}</b></span>`).join('')}</div></div>`;
      case 'bloque':
        return `<div class="sc-bloque"><svg class="sc-cadenas" viewBox="0 0 80 96"><path class="sc-anse" d="M22 44V30a18 18 0 0 1 36 0v14"/><rect x="12" y="44" width="56" height="44" rx="8"/><circle cx="40" cy="64" r="5"/></svg>
          <p class="sc-montant">${eur2(a.prix + protection(a.prix) + ENVOI)}</p><p class="sc-sous">bloqués jusqu'à votre vérification</p></div>`;
      case 'verifier':
        return `<div class="sc-verif sc-verif-acheteur"><div class="sc-anneau sc-anneau-petit"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52"/><circle class="sc-anneau-plein" cx="60" cy="60" r="52"/></svg><span>7 j</span></div>
          <ul class="sc-checks">${['Code lot : boîte = flacon', 'Tige propre et droite', 'Niveau comme sur la photo', 'Odeur conforme, départ et fond'].map((t, i) => `<li style="--i:${i}"><b>${ico('check')}</b>${t}</li>`).join('')}</ul></div>`;
      case 'fin':
        return `<div class="sc-fin"><div class="sc-issue sc-issue-ok"><b>${ico('check')}</b><span><strong>Tout est conforme</strong>Le vendeur est payé.</span></div>
          <div class="sc-issue sc-issue-pb"><b>${ico('retour')}</b><span><strong>Un problème</strong>Retour avec l'étiquette fournie, remboursé en entier.</span></div></div>`;
      default:
        return '';
    }
  }
  function histoire() {
    const etapes = PARCOURS[parcours];
    return `<div class="histoire">
      <ol class="histoire-etapes">${etapes
        .map(
          (e, i) => `<li class="h-etape ${i === 0 ? 'actif' : ''}" data-etape="${i}">
            <span class="h-num">${String(i + 1).padStart(2, '0')}</span>
            <div class="h-texte"><h3>${e.t}</h3><p>${e.d}</p></div>
            <div class="h-scene-mobile scene ${i === 0 ? 'actif' : ''}" aria-hidden="true">${scene(e.s)}</div>
          </li>`,
        )
        .join('')}</ol>
      <div class="histoire-scene" aria-hidden="true">
        <div class="scene-cadre">${etapes.map((e, i) => `<div class="scene ${i === 0 ? 'actif' : ''}" data-scene="${i}">${scene(e.s)}</div>`).join('')}</div>
        <div class="scene-points">${etapes.map((e, i) => `<i class="${i === 0 ? 'actif' : ''}" data-point="${i}"></i>`).join('')}</div>
      </div>
    </div>`;
  }
  let simPrix = 100;
  /* les quatre points de la vérification, animés en 3D */
  const VERIF = [
    {t: 'Le spray et la tige.', d: 'La bague sertie d\'origine, un bouton et une tige qui n\'ont pas été forcés : un flacon ouvert pour être rempli d\'autre chose en garde la trace.', e: 'La tige'},
    {t: 'Le flacon et l\'étiquette.', d: 'Forme, bouchon, gravures : comparés aux modèles connus de la maison.', e: 'Le flacon'},
    {t: 'Le niveau.', d: 'Celui de la photo correspond à celui de l\'annonce. Flacon opaque ? Une lampe de téléphone collée derrière, et le niveau apparaît.', e: 'Le niveau'},
    {t: 'Le code lot.', d: 'Il existe, il suit le format de la marque, il est le même sur la boîte. Il donne souvent l\'année de fabrication.', e: 'Le code lot'},
  ];
  let verifI = 0;
  let verif3d = null;
  let verifMinuteur = 0;
  let verifPause = 0;
  function choisirVerif(i, parVous) {
    verifI = i;
    const cadre = vue.querySelector('[data-verif3d]');
    if (!cadre) return;
    cadre.dataset.point = i;
    vue.querySelectorAll('[data-verif]').forEach((b) => {
      b.setAttribute('aria-pressed', +b.dataset.verif === i);
      // la barre de progression repart à zéro
      const barre = b.querySelector('.verif-prog');
      barre.style.animation = 'none';
      void barre.offsetWidth;
      barre.style.animation = '';
    });
    vue.querySelector('.verif-liste').classList.toggle('en-pause', !!parVous);
    if (parVous) verifPause = performance.now() + 14000;
    if (verif3d) verif3d.aller(i);
  }
  /* au premier passage : on charge la 3D, puis les points défilent seuls toutes les 5,5 s tant que la section est à
     l'écran, sauf si on vient d'en choisir un */
  function lancerVerif() {
    const cadre = vue.querySelector('[data-verif3d]');
    clearInterval(verifMinuteur);
    if (verif3d) verif3d.detruire();
    verif3d = null;
    if (!cadre) return;
    const a = A.a101;
    const obs3d = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs3d.disconnect();
      if (typeof Verif3D !== 'undefined') {
        Verif3D.monter(cadre, {a, p: P[a.p], etiquettes: [...VERIF.map((x) => x.e).slice(0, 3), `Code lot ${a.lot}`]})
          .then((c) => {
            if (!c || !cadre.isConnected) return c && c.detruire();
            verif3d = c;
            verif3d.aller(verifI);
          })
          .catch(() => {});
      }
      if (reduit()) return;
      verifMinuteur = setInterval(() => {
        if (!cadre.isConnected) return clearInterval(verifMinuteur);
        const r = cadre.getBoundingClientRect();
        if (document.hidden || r.bottom < 0 || r.top > innerHeight || performance.now() < verifPause) return;
        vue.querySelector('.verif-liste').classList.remove('en-pause');
        choisirVerif((verifI + 1) % VERIF.length);
      }, 5500);
    });
    obs3d.observe(cadre);
  }
  VUES.fonctionnement = () => {
    const ex = A.a101;
    return `<div class="fonctionnement">
    <section class="fn-hero env">
      <p class="surtitre">Comment ça marche</p>
      <h1>Entre particuliers, avec quelqu'un qui vérifie.</h1>
      <p class="chapo">Respray met en relation ceux qui vendent et ceux qui achètent. On vérifie chaque annonce avant de la publier, et on garde l'argent de l'acheteur jusqu'à ce qu'il ait vérifié le parfum.</p>
      <div class="bascule" role="tablist" aria-label="Parcours">
        <button type="button" role="tab" aria-selected="${parcours === 'vendre'}" data-parcours="vendre">Je vends</button>
        <button type="button" role="tab" aria-selected="${parcours === 'acheter'}" data-parcours="acheter">J'achète</button>
        <span class="bascule-pastille" style="--x:${parcours === 'vendre' ? 0 : 1}"></span>
      </div>
    </section>

    <section class="env" id="histoire">${histoire()}</section>

    <section class="fn-section env" id="photos-obligatoires">
      <div class="fn-tete" data-revele><p class="surtitre">Les photos</p><h2 class="grand-titre">${OBLIGATOIRES} photos obligatoires, toujours les mêmes.</h2><p class="chapo">Elles nous permettent de vérifier le parfum sans l'avoir entre les mains. La boîte et le ticket s'ajoutent si vous les avez.</p></div>
      <div class="fn-photos">${PHOTOS.map((x, i) => `<figure class="fn-photo ${x.obl ? '' : 'facultative'}" data-revele style="--i:${i}">${photo(ex, x.k)}<figcaption><strong>${x.t}</strong><span>${x.pourquoi}</span>${x.obl ? '' : '<em>Facultative</em>'}</figcaption></figure>`).join('')}</div>
      <div data-revele>${astuceOpaque()}</div>
    </section>

    <section class="fn-section env fn-equipe">
      <div class="fn-equipe-visuel" data-revele data-anime data-verif3d data-point="${verifI}">
        ${photo(ex, 'face')}
        <span class="repere" style="--x:50%;--y:24%;--i:0">1</span><span class="repere" style="--x:70%;--y:56%;--i:1">2</span><span class="repere" style="--x:31%;--y:62%;--i:2">3</span><span class="repere" style="--x:62%;--y:80%;--i:3">4</span>
        <span class="balayage"></span>
      </div>
      <div class="fn-equipe-texte" data-revele>
        <p class="surtitre">La vérification</p><h2 class="grand-titre">Ce que notre équipe regarde, sur chaque annonce.</h2>
        <ol class="verif-liste">${VERIF.map((x, i) => `<li><button type="button" class="verif-item" data-verif="${i}" aria-pressed="${i === verifI}"><span class="verif-n">${i + 1}</span><span><strong>${x.t}</strong> ${x.d}</span><i class="verif-prog" aria-hidden="true"></i></button></li>`).join('')}</ol>
        <p class="aide">Et aussi : la photo avec le pseudo et la date, un prix anormalement bas, des photos déjà vues ailleurs. Une annonce refusée l'est avec une raison claire.</p>
      </div>
    </section>

    <section class="fn-section env">
      <div class="fn-tete" data-revele><p class="surtitre">Après l'achat</p><h2 class="grand-titre">Une semaine entière pour vérifier.</h2></div>
      <div class="sept" data-revele data-anime>
        <div class="sept-piste"><span class="sept-rempli"></span>${Array.from({length: 8}, (_, i) => `<span class="sept-jour" style="--i:${i}"><b></b>J${i}</span>`).join('')}</div>
        <div class="sept-cartes">
          <article><h3>${ico('check')}Vous confirmez</h3><p>Le vendeur est payé tout de suite.</p></article>
          <article><h3>${ico('cadenas')}Vous ne faites rien</h3><p>Au bout de 7 jours, la vente est conclue et le vendeur est payé.</p></article>
          <article><h3>${ico('retour')}Vous signalez un problème</h3><p>L'argent reste bloqué le temps qu'on regarde vos photos.</p></article>
        </div>
      </div>
    </section>

    <section class="fn-section env">
      <div class="fn-tete" data-revele><p class="surtitre">Si ce n'est pas conforme</p><h2 class="grand-titre">Remboursé en entier, livraison comprise.</h2><p class="chapo">Contrefaçon, niveau plus bas qu'annoncé, flacon abîmé, mauvais parfum.</p></div>
      <ol class="flux" data-revele>
        <li style="--i:0"><span>${ico('photo')}</span><strong>Vous signalez</strong><p>Depuis votre commande, avec des photos, dans les 7 jours.</p></li>
        <li style="--i:1"><span>${ico('boite')}</span><strong>Vous renvoyez</strong><p>Avec l'étiquette fournie. Le retour est payé par le vendeur.</p></li>
        <li style="--i:2"><span>${ico('euro')}</span><strong>Vous êtes remboursé</strong><p>Prix, protection et livraison. Une contrefaçon, c'est le vendeur exclu.</p></li>
      </ol>
      <p class="aide fn-note">Un parfum conforme qui ne vous plaît pas n'est pas remboursé : vous pouvez le remettre en vente sur Respray.</p>
    </section>

    <section class="fn-section env fn-avis">
      <div class="fn-tete" data-revele><p class="surtitre">Les avis</p><h2 class="grand-titre">Des avis qu'on ne peut pas inventer.</h2><p class="chapo">Seul l'acheteur d'une vente conclue peut noter le vendeur : une fois, après les 7 jours, quand il a eu le temps de vérifier.</p></div>
      <div class="avis-grille">
        <div class="avis-exemple" data-revele data-anime>${blocVendeur(VENDEURS.v1, A.a101).replace('<details class="vendeur-avis">', '<details class="vendeur-avis" open>')}</div>
        <ul class="avis-regles" data-revele>
          <li style="--i:0"><strong>Trois questions, pas de roman.</strong> Conforme aux photos ? Bien emballé ? Envoyé vite ? Puis une note, et un mot si on veut.</li>
          <li style="--i:1"><strong>Le taux de ventes conformes.</strong> Une non-conformité reconnue par l'équipe y reste, affichée sur chaque annonce du vendeur.</li>
          <li style="--i:2"><strong>Deux non-conformités en six mois :</strong> les annonces du vendeur sont suspendues le temps qu'on regarde.</li>
          <li style="--i:3"><strong>Une contrefaçon ou un parfum dilué :</strong> le vendeur est exclu pour de bon, et l'acheteur remboursé en entier.</li>
          <li style="--i:4"><strong>Le vendeur peut répondre,</strong> une fois, sous l'avis. Il ne peut ni le modifier, ni le supprimer.</li>
        </ul>
      </div>
    </section>

    <section class="fn-section env fn-frais">
      <div data-revele><p class="surtitre">Les frais</p><h2 class="grand-titre">Le vendeur ne paie rien.</h2><p class="chapo">La protection payée par l'acheteur finance ce qui rend la vente sûre : la vérification de chaque annonce par une personne, le paiement bloqué, le service client et les remboursements.</p>
        <table class="frais"><tbody>
          <tr><th scope="row">Vendre</th><td>Gratuit, sans commission</td></tr>
          <tr><th scope="row">Protection acheteur</th><td>8 % du prix + 0,90 €</td></tr>
          <tr><th scope="row">Envoi suivi en point relais</th><td>À partir de 4,90 €</td></tr>
          <tr><th scope="row">Remise en main propre</th><td>Gratuit</td></tr>
          <tr><th scope="row">Envoi assuré à la valeur réelle</th><td>2,90 €, en option au-dessus de 150 €</td></tr>
          <tr><th scope="row">Mettre une annonce en avant</th><td>1,99 € (3 jours) ou 4,99 € (7 jours), si le vendeur le veut</td></tr>
        </tbody></table></div>
      <div class="calcul" data-revele>
        <label for="sim">Prix du parfum : <output id="sim-out">${eur(simPrix)}</output></label>
        <input id="sim" type="range" min="10" max="400" step="5" value="${simPrix}" data-sim>
        <div class="calcul-res">
          <div><span>L'acheteur paie</span><strong data-valeur="acheteur">${eur2(simPrix + protection(simPrix))}</strong><small>hors livraison</small></div>
          <div><span>Le vendeur reçoit</span><strong data-valeur="vendeur">${eur2(simPrix)}</strong><small>100 % du prix</small></div>
        </div>
      </div>
    </section>

    <section class="fn-section env">
      <div class="fn-tete" data-revele><p class="surtitre">Interdit sur Respray</p><h2 class="grand-titre">Ce qu'on refuse, toujours.</h2></div>
      <ul class="interdits" data-revele>${['Les contrefaçons et les « dupes »', 'Les testeurs', 'Les échantillons offerts', 'Les parfums transvasés (décants)', 'Les flacons dont le spray a été ouvert ou recollé'].map((t, i) => `<li style="--i:${i}">${ico('croix')}${t}</li>`).join('')}</ul>
    </section>

    <section class="fn-section env faq">
      <div class="fn-tete" data-revele><p class="surtitre">Questions</p><h2 class="grand-titre">Ce qu'on nous demande.</h2></div>
      ${[
        ['Un parfum entamé, c\'est hygiénique ?', 'Oui. Le parfum ne touche jamais la peau dans le flacon : il sort par un vaporisateur serti, qu\'on ne peut pas ouvrir sans le casser.'],
        ['Un parfum ancien est-il encore bon ?', 'Un parfum ne se périme pas, il évolue : les notes de tête s\'estompent les premières. Bien rangé, à l\'abri de la lumière et de la chaleur, il se garde des années. Le code lot donne souvent l\'année de fabrication : quand on la connaît, on l\'indique sur l\'annonce.'],
        ['Et si quelqu\'un a dilué son parfum ?', 'Un flacon serti ne s\'ouvre pas sans laisser de traces : c\'est pour ça qu\'on demande la bague et la tige en photo. À la réception, vous avez 7 jours pour comparer la couleur, l\'odeur et la tenue. Un parfum dilué, c\'est remboursé en entier, et le vendeur exclu pour de bon.'],
        ['Mon flacon n\'est pas transparent : comment montrer le niveau ?', 'Dans une pièce peu éclairée, collez la lampe allumée d\'un téléphone contre le dos du flacon. La lumière traverse le verre et la limite du parfum se voit nettement. Prenez la photo de face, à hauteur du niveau.'],
        ['Pourquoi enlever le bouton spray pour la photo ?', 'Pour voir la tige. Un flacon qui a été ouvert pour être rempli avec autre chose laisse souvent des traces : tige tordue, colle, bague abîmée.'],
        ['Ma maison n\'est pas dans la liste, je fais comment ?', 'Choisissez « Ma maison n\'est pas dans la liste » et écrivez son nom. On vérifie l\'orthographe et on l\'ajoute à la liste : les vendeurs suivants pourront la choisir.'],
        ['Combien de temps prend la vérification ?', 'En général quelques heures. Si une photo manque ou ne se lit pas, on vous dit laquelle refaire.'],
        ['Et si le colis se perd ?', 'Il est assuré : l\'acheteur est remboursé et le vendeur est payé.'],
        ['Le vendeur l\'avait déjà vendu ailleurs ?', 'La vente est annulée et vous êtes remboursé tout de suite, sans rien faire. Le vendeur, lui, voit ses annulations comptées sur son profil.'],
        ['J\'ai confirmé la réception par erreur.', 'Vous avez une heure pour annuler, depuis votre commande. Passé ce délai, le vendeur est payé ; écrivez-nous si quelque chose ne va pas.'],
        ['Je peux vendre plusieurs parfums ensemble ?', 'Oui, en lot : une seule annonce, un seul colis, et l\'acheteur ne paie qu\'une livraison. Chaque flacon du lot a ses ${OBLIGATOIRES} photos.'],
        ['Les coffrets et les échantillons ?', 'Un coffret est accepté s\'il est neuf, scellé et sous blister. Un échantillon acheté (coffret découverte, vendu à l\'unité) aussi, avec son volume exact. Un échantillon offert ou marqué « Ne peut être vendu » ne l\'est pas.'],
        ['Comment sont notés les vendeurs ?', 'Par les acheteurs d\'une vente conclue, un avis par vente : conforme aux photos, bien emballé, envoyé vite, puis une note. Chaque annonce affiche aussi la part de ventes conformes du vendeur et son délai d\'envoi moyen.'],
        ['Quand le vendeur est-il payé ?', 'Dès que l\'acheteur confirme que tout est conforme, ou automatiquement 7 jours après la livraison. Le virement arrive en 1 à 2 jours.'],
      ]
        .map(([q, r]) => `<details><summary>${q}</summary><p>${r}</p></details>`)
        .join('')}
    </section>

    <section class="fn-fin env" data-revele>
      <h2>On commence ?</h2>
      <div class="boutons"><a class="btn btn-noir btn-large" href="#vendre">Vendre un parfum</a><a class="btn btn-large" href="#recherche">Voir les parfums</a></div>
    </section>
  </div>`;
  };

  /* ——— identité : la direction artistique, pour la montrer ———
     Le symbole reprend la géométrie de tools/logo.py (grille de 110 × 100). */
  const SYMBOLE = '<path d="M30 86V58c0-14 10-22 24-22" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round"/><g fill="currentColor"><circle class="p1" cx="71" cy="36" r="5.5"/><circle class="p2" cx="84" cy="26" r="4"/><circle class="p2" cx="85" cy="44" r="4"/><circle class="p3" cx="96" cy="18" r="2.8"/><circle class="p3" cx="97" cy="35" r="2.8"/><circle class="p3" cx="96" cy="52" r="2.8"/></g>';
  const symbole = (classe = '') => `<svg class="${classe}" viewBox="23.5 15.2 76.3 77.3" aria-hidden="true">${SYMBOLE}</svg>`;
  const logoSvg = () => (document.getElementById('tpl-logo') || {innerHTML: ''}).innerHTML;
  const COULEURS = [
    ['Encre', '#1D1D1F', 'Le texte, le logo, les boutons principaux.'],
    ['Gris clair', '#F5F5F7', 'Les fonds de section.'],
    ['Gris photo', '#F2F2F2', 'Le fond uni des photos.'],
    ['Gris', '#6E6E73', 'Les textes secondaires.'],
    ['Trait', '#D2D2D7', 'Les bordures et les séparations.'],
    ['Blanc', '#FFFFFF', 'Le fond.'],
    ['Vert vérifié', '#1A7F4B', 'Seulement pour ce qui est vérifié ou validé.'],
    ['Ambre', '#B05A12', 'L\'accent : sur-titres, étapes, ce qu\'on a choisi.'],
    ['Frais', '#1F7F95', 'Les parfums frais (agrumes, marins, aromatiques).'],
    ['Floral', '#B83C6E', 'Les parfums floraux et fruités.'],
    ['Chaud', '#B86A12', 'Les parfums chauds (gourmands, ambrés, musqués).'],
    ['Boisé', '#6F5236', 'Les parfums boisés et sombres.'],
  ];
  const NUIT = [
    ['Graphite', '#1B1A18', 'Le fond : chaud, pas noir.'],
    ['Graphite clair', '#252421', 'Les fonds de section.'],
    ['Crème', '#F2EFE9', 'Le texte, le logo, les boutons principaux.'],
    ['Taupe', '#A7A29A', 'Les textes secondaires.'],
    ['Trait', '#3A3835', 'Les bordures et les séparations.'],
    ['Vert vérifié', '#5FC690', 'Seulement pour ce qui est vérifié ou validé.'],
    ['Ambre', '#F0A45B', 'L\'accent, éclairci pour la nuit.'],
  ];
  VUES.marque = () => {
    const a = A.a101;
    const grille = [];
    for (let x = 30; x <= 100; x += 10) grille.push(`<line x1="${x}" x2="${x}" y1="10" y2="96"/>`);
    for (let y = 20; y <= 90; y += 10) grille.push(`<line x1="18" x2="104" y1="${y}" y2="${y}"/>`);
    return `<div class="marque-page">
    <section class="mq-hero env">
      <p class="surtitre">Identité</p>
      <div class="mq-logo" role="img" aria-label="Logo Respray">${logoSvg()}</div>
      <p class="mq-signature">Le parfum de seconde main, sans le doute.</p>
    </section>

    <section class="mq-section env mq-symbole" data-revele data-anime>
      <div class="mq-construction">
        <svg viewBox="18 10 86 86" aria-hidden="true"><g class="mq-grille">${grille.join('')}</g>
          <circle class="mq-guide" cx="54" cy="58" r="24"/><line class="mq-guide" x1="71" y1="36" x2="96" y2="18"/><line class="mq-guide" x1="71" y1="36" x2="96" y2="52"/>
          <g class="mq-trace">${SYMBOLE}</g></svg>
      </div>
      <div class="mq-texte">
        <h2 class="grand-titre">Un r qui vaporise.</h2>
        <p>Le symbole est un « r » dont l'épaule devient un jet de spray : un point, puis deux, puis trois. Re-spray : le parfum qui repart pour quelqu'un d'autre.</p>
        <dl class="mq-mesures">
          <div><dt>Trait</dt><dd>13 unités, bouts arrondis</dd></div>
          <div><dt>Points</dt><dd>5,5 · 4 · 2,8 de rayon</dd></div>
          <div><dt>Jet</dt><dd>un cône de 1, 2 et 3 points</dd></div>
        </dl>
      </div>
    </section>

    <section class="mq-section env">
      <div class="mq-tete"><h2 class="grand-titre">Les versions.</h2><p class="chapo">Le logo complet quand il y a la place, le symbole seul quand il n'y en a pas.</p></div>
      <div class="mq-versions">
        <figure class="mq-v mq-v-large"><div class="mq-v-fond">${logoSvg()}</div><figcaption>Logo, sur fond clair</figcaption></figure>
        <figure class="mq-v mq-v-large"><div class="mq-v-fond mq-sombre">${logoSvg()}</div><figcaption>Logo, sur fond sombre</figcaption></figure>
        <figure class="mq-v"><div class="mq-v-fond mq-gris">${symbole('mq-sym')}</div><figcaption>Symbole seul</figcaption></figure>
        <figure class="mq-v"><div class="mq-v-fond mq-gris"><span class="mq-icone">${symbole()}</span></div><figcaption>Icône d'application</figcaption></figure>
        <figure class="mq-v"><div class="mq-v-fond mq-gris mq-tailles">${[64, 32, 16].map((t) => `<span class="mq-icone" style="--t:${t}px">${symbole()}</span>`).join('')}</div><figcaption>Favicon : 64, 32 et 16 px</figcaption></figure>
      </div>
      <p class="aide mq-regle">Autour du logo, gardez au moins la moitié de la hauteur du symbole. En dessous de 80 px de large, utilisez le symbole seul. Le logo est toujours en encre ou en blanc, jamais en couleur, jamais déformé, jamais sur une photo chargée.</p>
    </section>

    <section class="mq-section env">
      <div class="mq-tete"><h2 class="grand-titre">Les couleurs.</h2><p class="chapo">Le jour, du blanc, des gris et de l'encre ; la nuit, un graphite chaud et du crème. Un accent ambre pour guider (sur-titres, étapes, choix), une couleur par caractère de parfum, et le vert seulement pour dire « c'est vérifié ». Touchez une couleur pour copier son code.</p></div>
      ${[['Jour', 'par défaut, et quand l\'appareil est en clair', COULEURS], ['Nuit', 'quand l\'appareil est en sombre, ou avec le bouton de l\'en-tête', NUIT]].map(([titre, quand, liste]) => `<div class="mq-palette"><h3>${titre} <small>${quand}</small></h3>
      <div class="mq-couleurs">${liste.map(([n, hex, usage]) => `<button type="button" class="mq-couleur" data-copier="${hex}"><span class="mq-pastille" style="background:${hex}"></span><strong>${n}</strong><span class="mq-hex">${hex}</span><small>${usage}</small></button>`).join('')}</div></div>`).join('')}
    </section>

    <section class="mq-section env mq-typo">
      <div class="mq-tete"><h2 class="grand-titre">La typographie.</h2><p class="chapo">Inter, une seule famille, deux graisses. Les titres sont serrés, le texte respire.</p></div>
      <div class="mq-typo-in">
        <div class="mq-aa">Aa</div>
        <div class="mq-echelle">
          <p class="mq-e1">Titre · 48, semi-gras</p>
          <p class="mq-e2">Sous-titre · 22, semi-gras</p>
          <p class="mq-e3">Texte courant · 16, normal. Les annonces se lisent comme on parle, sans superlatifs.</p>
          <p class="mq-e4">Légende · 13, moyen</p>
        </div>
      </div>
    </section>

    <section class="mq-section env">
      <div class="mq-tete"><h2 class="grand-titre">Les photos.</h2><p class="chapo">Le flacon seul, sur un fond clair et uni, à la lumière du jour. Toujours les mêmes vues, dans le même ordre, pour qu'on puisse comparer d'une annonce à l'autre. Aucun filtre, aucune retouche.</p></div>
      <div class="mq-dessins">${['face', 'dessous', 'niveau', 'dessus', 'tige', 'preuve', 'boite', 'ticket'].map((v) => `<figure>${photo(a, v)}<figcaption>${Dessins.LEGENDES[v]}</figcaption></figure>`).join('')}</div>
      <p class="aide mq-regle">Sur ce prototype, les photos sont des rendus 3D de flacons génériques. Sur le vrai site, ce sont celles des vendeurs, prises en suivant le guide de la page Vendre.</p>
    </section>

    <section class="mq-section env">
      <div class="mq-tete"><h2 class="grand-titre">Les éléments.</h2></div>
      <div class="mq-elements">
        <div><a class="btn btn-noir" href="#vendre">Vendre un parfum</a><span class="btn">Faire une offre</span></div>
        <div><span class="filtre" aria-pressed="true">Toutes les maisons</span><span class="filtre">Le Labo</span><span class="filtre">Xerjoff</span></div>
        <div><span class="mq-verif">${ico('check')}Vérifiée aujourd'hui</span><span class="mq-pilule-sombre">Neuf sous blister</span></div>
      </div>
    </section>

    <section class="mq-section env">
      <div class="mq-tete"><h2 class="grand-titre">Le ton.</h2><p class="chapo">Précis, calme, sans promesse qu'on ne tient pas.</p></div>
      <div class="mq-ton">
        <div><p class="mq-oui">On dit</p><p>« Vérifiée le 24 novembre, 5 contrôles sur 5. »</p><p>« Il reste environ 85 %. »</p><p>« Vous avez 7 jours pour vérifier. »</p></div>
        <div><p class="mq-non">On ne dit pas</p><p>« Qualité premium garantie ! »</p><p>« Presque plein ! »</p><p>« Achetez en toute sérénité ! »</p></div>
      </div>
    </section>
  </div>`;
  };

  VUES.introuvable = () => `<div class="env page"><h1 class="titre-page">Cette page n'existe pas</h1><p><a class="lien" href="#accueil">Retour à l'accueil</a></p></div>`;

  /* ——— fenêtres, messages ——— */
  const modale = document.getElementById('modale');
  const ouvrir = (html, classe = '') => {
    modale.innerHTML = `<div class="modale-fond" data-action="fermer"></div><div class="modale-boite ${classe}" role="dialog" aria-modal="true">${html}<button class="modale-x" type="button" data-action="fermer" aria-label="Fermer">${ico('croix')}</button></div>`;
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
    m.classList.remove('entre');
    void m.offsetWidth;
    m.classList.add('entre');
    clearTimeout(minuteur);
    minuteur = setTimeout(() => (m.hidden = true), 4200);
  };

  /* ——— animations : apparitions, compteurs, histoire au défilement ——— */
  const vue = document.getElementById('vue');
  let obs = [];
  let etapeActive = 0;
  function rejouer(el) {
    el.classList.remove('actif');
    void el.offsetWidth;
    el.classList.add('actif');
  }
  function activerEtape(i) {
    if (i === etapeActive) return;
    etapeActive = i;
    vue.querySelectorAll('.h-etape').forEach((el) => el.classList.toggle('actif', +el.dataset.etape === i));
    vue.querySelectorAll('.scene[data-scene]').forEach((el) => (+el.dataset.scene === i ? rejouer(el) : el.classList.remove('actif')));
    vue.querySelectorAll('[data-point]').forEach((el) => el.classList.toggle('actif', +el.dataset.point === i));
  }
  /* l'étape active est celle dont le texte est le plus près du milieu de l'écran : elle est alors en face de la scène,
     qui reste collée au milieu. On le calcule au défilement plutôt qu'avec une marge d'IntersectionObserver, qui est
     ignorée quand la page est affichée dans une autre (une iframe d'une autre origine) : l'étape suivante s'allumait
     alors dès qu'elle entrait en bas de l'écran. */
  function suivreHistoire() {
    const textes = vue.querySelectorAll('.h-etape .h-texte');
    if (!textes.length) return;
    const milieu = innerHeight / 2;
    let proche = 0;
    let ecart = Infinity;
    textes.forEach((t, i) => {
      const r = t.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - milieu);
      if (d < ecart) [ecart, proche] = [d, i];
    });
    activerEtape(proche);
  }
  let rafHistoire = 0;
  const auDefilement = () => {
    if (!rafHistoire) rafHistoire = requestAnimationFrame(() => {
      rafHistoire = 0;
      suivreHistoire();
    });
  };
  addEventListener('scroll', auDefilement, {passive: true});
  addEventListener('resize', auDefilement, {passive: true});
  function compter(el) {
    const cible = +el.dataset.compte;
    if (reduit() || !cible) return;
    const t0 = performance.now();
    const pas = (t) => {
      const k = Math.min(1, (t - t0) / 1100);
      el.textContent = nb(Math.round(cible * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }
  function tween(el, de, a, format) {
    if (reduit()) {
      el.textContent = format(a);
      return;
    }
    const t0 = performance.now();
    cancelAnimationFrame(el._raf);
    const pas = (t) => {
      const k = Math.min(1, (t - t0) / 350);
      el.textContent = format(de + (a - de) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) el._raf = requestAnimationFrame(pas);
    };
    el._raf = requestAnimationFrame(pas);
  }
  function animer() {
    obs.forEach((o) => o.disconnect());
    obs = [];
    if (!('IntersectionObserver' in window)) return;
    const vu = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((e) => {
          if (!e.isIntersecting) return;
          vu.unobserve(e.target);
          if (!reduit()) e.target.classList.add('vu');
          e.target.querySelectorAll('[data-compte]').forEach(compter);
        });
      },
      {rootMargin: '0px 0px -8% 0px'},
    );
    vue.querySelectorAll('[data-revele], [data-anime]').forEach((el) => vu.observe(el));
    obs.push(vu);
    lancerVerif();
    if (!vue.querySelector('.h-etape')) return;
    etapeActive = 0;
    suivreHistoire();
    const m = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((e) => {
          if (e.isIntersecting) rejouer(e.target);
        });
      },
      {threshold: 0.5},
    );
    vue.querySelectorAll('.h-scene-mobile').forEach((el) => m.observe(el));
    obs.push(m);
  }

  /* ——— le back-office de l'équipe (admin.js) ——— */
  const Admin = creerAdmin({esc, eur, eur2, nb, ico, photo, P, A, protection, ENVOI, ressemble, proprement, cle, message, ouvrir, fermer, memoire, PHOTOS, maisonsCatalogue, logo: logoSvg});

  /* ——— rendu et navigation ——— */
  function rendre() {
    arreterAccueil();
    const h = decodeURIComponent(location.hash.slice(1)) || 'accueil';
    const bo = h === 'panel' || h.startsWith('panel/');
    document.body.classList.toggle('bo-actif', bo);
    vue.innerHTML = bo ? Admin.vue(h) : h.startsWith('annonce-') ? VUES.annonce(h.slice(8)) : VUES[h] ? VUES[h]() : VUES.introuvable();
    // sur téléphone, la navigation du back-office défile jusqu'à la rubrique ouverte
    const rubrique = bo && vue.querySelector('.bo-nav [aria-current="page"]');
    if (rubrique) rubrique.parentNode.scrollLeft = rubrique.offsetLeft - 70;
    const rub = h.startsWith('annonce-') ? 'recherche' : h;
    document.querySelectorAll('[data-nav]').forEach((a) => a.setAttribute('aria-current', a.dataset.nav === rub ? 'page' : 'false'));
    const h1 = vue.querySelector('h1');
    document.title = h === 'accueil' ? 'Respray' : bo ? `${h1 ? h1.textContent.trim() : 'Équipe'} · Respray Équipe` : `${h1 ? h1.textContent.trim() : 'Respray'} · Respray`;
    majBadge();
    etapeActive = 0;
    animer();
    demarrerAccueil();
  }
  const majApercu = () => {
    const a = document.getElementById('apercu');
    if (a && !V.envoye) a.innerHTML = apercuVente();
  };
  const majBadge = () => {
    const b = document.getElementById('badge-panel');
    if (b) b.textContent = Admin.nbNotifs();
  };
  /* une action de l'équipe (la vôtre, ou celle d'un collègue sur la page partagée) : le site et le back-office suivent.
     On ne redessine pas sous les doigts de quelqu'un qui écrit. */
  let enAttente = false;
  Admin.abonner(() => {
    Admin.synchroniser();
    majBadge();
    if (!document.body.classList.contains('bo-actif')) return;
    const f = document.activeElement;
    if (f && /^(TEXTAREA|INPUT|SELECT)$/.test(f.tagName) && f.value && !f.closest('.modale-boite')) {
      if (!enAttente) {
        enAttente = true;
        f.addEventListener('blur', () => {
          enAttente = false;
          rafraichir(false);
        }, {once: true});
      }
      return;
    }
    rafraichir(false);
  });
  const transition = (faire) => {
    if (!document.startViewTransition || reduit()) return faire();
    const vt = document.startViewTransition(faire);
    vt.ready.catch(() => {});
    vt.finished.catch(() => {});
  };
  window.addEventListener('hashchange', () =>
    transition(() => {
      fermer();
      rendre();
      window.scrollTo({top: 0, behavior: 'instant'});
    }),
  );
  const aller = (h) => (location.hash.slice(1) === h ? rendre() : (location.hash = h));
  /* un changement dans la même vue : on garde la position */
  const rafraichir = (doux) => {
    const y = window.scrollY;
    const faire = () => {
      rendre();
      window.scrollTo(0, y);
    };
    doux ? transition(faire) : faire();
  };
  const majResultats = () => {
    const r = document.getElementById('resultats');
    if (r) r.innerHTML = resultats();
    animer();
  };
  const lireFiltres = (f) => {
    const d = new FormData(f);
    Object.assign(R, {q: String(d.get('q') || ''), genre: d.get('genre'), etat: d.get('etat'), taille: d.get('taille'), prixMax: +d.get('prixMax'), marques: new Set(d.getAll('marque')), mainPropre: d.get('mainPropre') != null});
    const o = document.getElementById('prix-max-out');
    if (o) o.textContent = eur(R.prixMax);
    majResultats();
  };
  function envoyerVente() {
    const pc = parfumCatalogue();
    const nom = nomParfum();
    const ml = pc ? +V.ml : nombre(V.mlAutre);
    const prix = nombre(V.prix);
    let manque = '';
    if (!maisonChoisie()) manque = 'Choisissez ou écrivez la maison.';
    else if (!nom) manque = 'Choisissez ou écrivez le parfum.';
    else if (!pc && !V.conc) manque = 'Choisissez la concentration.';
    else if (!pc && !V.genre) manque = 'Dites pour qui est ce parfum : femme, homme ou mixte.';
    else if (!(ml > 0)) manque = 'Indiquez la contenance.';
    else if (V.etat === 'entame' && !V.visible) manque = 'Dites si le parfum se voit à travers le flacon.';
    else if (!V.boite) manque = 'Dites s\'il a sa boîte.';
    else if (!V.annee || !V.lieu) manque = 'Dites quand et où vous l\'avez acheté.';
    else if (!V.lumiere || !V.chaleur) manque = 'Dites comment il a été rangé.';
    else if (PHOTOS.some((x) => x.obl && !V.photos[x.k])) manque = `Ajoutez les ${OBLIGATOIRES} photos obligatoires.`;
    else if (!V.lot.trim() && !V.lotIllisible) manque = 'Recopiez le code lot, ou cochez « effacé ou illisible ».';
    else if (!(prix >= 3)) manque = 'Indiquez un prix d\'au moins 3 €.';
    else if (V.mainPropre && !V.ville.trim()) manque = 'Indiquez la ville de la remise en main propre.';
    else if (!V.engagement) manque = 'Cochez l\'engagement d\'authenticité.';
    const err = document.getElementById('erreur');
    if (manque) {
      err.textContent = manque;
      err.hidden = false;
      err.scrollIntoView({block: 'center', behavior: reduit() ? 'auto' : 'smooth'});
      return;
    }
    V.proposes = [];
    const t = Date.now().toString(36);
    if (V.maison === AUTRE) V.proposes.push({id: 'm' + t, type: 'maison', tape: V.maisonAutre.trim(), par: 'vous', il: 'à l\'instant', annonce: `${nom}, ${ml} ml`});
    if (parfumLibre()) V.proposes.push({id: 'p' + t, type: 'parfum', tape: nom, maison: maisonChoisie(), par: 'vous', il: 'à l\'instant', annonce: `${ml} ml`, conc: V.conc, genre: V.genre, familles: V.familles});
    // l'annonce part dans la file de vérification du back-office, avec les photos d'un flacon du même parfum
    const memeParfum = pc && ANNONCES.find((a) => a.p === pc.id);
    Admin.proposer(V.proposes, {id: 's' + t, p: pc ? pc.id : null, nomAffiche: `${maisonChoisie()} · ${nom}`, ml, prix, etat: V.etat, niveau: V.etat === 'blister' ? 100 : V.niveau, boite: V.boite !== 'aucune', lot: V.lotIllisible ? 'illisible' : V.lot.trim(), v: 'v0', mainPropre: V.mainPropre, desc: V.desc.trim(), boost: V.boost,
      details: {conc: pc ? pc.conc : V.conc, format: FORMATS.find((x) => x[0] === V.format)[1], achat: `${V.annee}, ${V.lieu}`, rangement: `${V.lumiere === 'abri' ? 'à l\'abri de' : 'exposé à'} la lumière, ${V.chaleur === 'abri' ? 'à l\'abri de' : 'exposé à'} la chaleur`, boite: BOITES.find((x) => x[0] === V.boite)[1], visible: V.etat === 'blister' ? '' : V.visible === 'opaque' ? 'flacon opaque (photo à contre-jour)' : 'parfum visible', defauts: V.defauts.join(', '), ville: V.mainPropre ? V.ville.trim() : ''}, ph: memeParfum ? memeParfum.id : 'a101', fond: '#ECE7E0'});
    V.envoye = true;
    transition(() => {
      rendre();
      window.scrollTo(0, 0);
    });
  }

  document.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-form]');
    if (!f) return;
    e.preventDefault();
    const type = f.dataset.form;
    if (type.startsWith('bo-')) {
      if (type === 'bo-cherche') {
        const premier = document.querySelector('#bo-resultats a');
        if (premier) location.hash = premier.getAttribute('href');
      } else Admin.soumettre(f);
      return;
    }
    if (type === 'recherche' || type === 'entete') {
      Object.assign(R, {q: String(new FormData(f).get('q') || ''), marques: new Set()});
      aller('recherche');
    } else if (type === 'filtres') lireFiltres(f);
    else if (type === 'vendre') envoyerVente();
    else if (type === 'offre') {
      const a = A[f.dataset.a];
      const m = nombre(new FormData(f).get('montant'));
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
    if (t.closest('[data-form="vendre"]')) setTimeout(majApercu);
    if (t.hasAttribute('data-bo-cherche')) Admin.saisie(t);
    else if (t.closest('[data-form="filtres"]')) lireFiltres(t.closest('form'));
    else if (t.dataset.champ === 'niveau') {
      V.niveau = +t.value;
      document.getElementById('niveau-out').textContent = V.niveau + ' %';
    } else if (t.dataset.champ === 'prix') {
      V.prix = t.value;
      document.getElementById('recu').textContent = `Vous recevrez ${eur2(nombre(t.value) || 0)} : aucune commission.`;
    } else if (t.dataset.champ === 'maisonAutre') {
      V.maisonAutre = t.value;
      document.getElementById('aide-maison').innerHTML = aideMaison();
    } else if (['parfumAutre', 'mlAutre', 'lot', 'desc', 'ville'].includes(t.dataset.champ)) V[t.dataset.champ] = t.value;
    else if (t.matches('[data-sim]')) {
      const avant = simPrix;
      simPrix = +t.value;
      document.getElementById('sim-out').textContent = eur(simPrix);
      tween(vue.querySelector('[data-valeur="acheteur"]'), avant + protection(avant), simPrix + protection(simPrix), eur2);
      tween(vue.querySelector('[data-valeur="vendeur"]'), avant, simPrix, eur2);
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-tri]')) {
      R.tri = t.value;
      majResultats();
    } else if (t.matches('[data-assure]')) {
      achat.assure = t.checked;
      document.getElementById('total').innerHTML = total(A[location.hash.slice(9)]);
    } else if (t.matches('[data-mode]')) {
      achat.mode = t.value;
      document.getElementById('total').innerHTML = total(A[location.hash.slice(9)]);
    } else if (t.matches('[data-multi]')) {
      const k = t.dataset.multi;
      V[k] = t.checked ? [...V[k], t.value] : V[k].filter((x) => x !== t.value);
      majApercu();
    } else if (['lotIllisible', 'mainPropre', 'engagement'].includes(t.dataset.champ)) {
      V[t.dataset.champ] = t.checked;
      rafraichir(false);
    } else if (['maison', 'parfum', 'ml', 'boite', 'etat', 'conc', 'genre', 'format', 'visible', 'annee', 'lieu', 'lumiere', 'chaleur', 'boost'].includes(t.dataset.champ)) {
      V[t.dataset.champ] = t.value;
      if (t.dataset.champ === 'maison') Object.assign(V, {parfum: '', ml: ''});
      if (t.dataset.champ === 'parfum') V.ml = '';
      if (t.dataset.champ === 'format') Object.assign(V, {ml: '', mlAutre: '', etat: t.value === 'coffret' ? 'blister' : V.etat});
      if (!['maison', 'parfum', 'etat'].includes(t.dataset.champ)) rafraichir(false);
      if (['maison', 'parfum', 'etat'].includes(t.dataset.champ)) {
        rafraichir(true);
        const suivant = {maison: V.maison === AUTRE ? '#maison-autre' : '#parfum', parfum: V.parfum === AUTRE ? '#parfum-autre' : '#ml'}[t.dataset.champ];
        const el = suivant && document.querySelector(suivant);
        if (el) setTimeout(() => el.focus({preventScroll: true}), 40);
      }
    } else if (t.matches('[data-photo]') && t.files && t.files[0]) {
      const lecteur = new FileReader();
      lecteur.onload = () => {
        V.photos[t.dataset.photo] = lecteur.result;
        rafraichir(false);
      };
      lecteur.readAsDataURL(t.files[0]);
    } else if (t.matches('[data-check]')) {
      const id = t.dataset.check;
      const tous = [...document.querySelectorAll(`[data-check="${id}"]`)].every((c) => c.checked);
      document.querySelector(`[data-publier="${id}"]`).classList.toggle('pret', tous);
    }
  });

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, a');
    if (!t) return;
    if (t.dataset.marque) Object.assign(R, {q: '', marques: new Set([t.dataset.marque])});
    if (t.classList.contains('carte-lien')) {
      const g = document.getElementById('grande');
      if (g) g.style.viewTransitionName = 'none';
      const ph = t.querySelector('.carte-photo') || t;
      ph.style.viewTransitionName = 'photo-annonce';
    }
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
      transition(() => {
        document.getElementById('grande').innerHTML = photo(a, t.dataset.vue);
        document.getElementById('legende').innerHTML = legende(a, t.dataset.vue);
        document.querySelectorAll('.mini').forEach((b) => b.setAttribute('aria-pressed', b === t));
      });
      return;
    }
    if (t.dataset.ruban) {
      const r = document.getElementById('ruban');
      const c = r.querySelector('.carte');
      r.scrollBy({left: +t.dataset.ruban * (c ? c.offsetWidth + 16 : 260) * 2, behavior: reduit() ? 'auto' : 'smooth'});
      return;
    }
    if (t.dataset.rubanMaison) {
      railMaison = t.dataset.rubanMaison;
      document.querySelectorAll('[data-ruban-maison]').forEach((b) => b.setAttribute('aria-pressed', b === t));
      transition(() => {
        const r = document.getElementById('ruban');
        r.innerHTML = rail();
        r.scrollTo({left: 0});
      });
      return;
    }
    if (t.dataset.anat) {
      montrerAnat(+t.dataset.anat, false);
      return;
    }
    if (t.dataset.rec) {
      const i = +t.dataset.rec;
      coches.has(i) ? coches.delete(i) : coches.add(i);
      t.setAttribute('aria-pressed', coches.has(i));
      t.closest('.rec-item').classList.toggle('fait', coches.has(i));
      vue.querySelector('.rec-arc').style.setProperty('--k', coches.size / 5);
      document.getElementById('rec-compte').textContent = `${coches.size}/5`;
      document.getElementById('rec-message').textContent = coches.size === 5 ? 'Tout est conforme : confirmez la réception, le vendeur est payé.' : 'Cochez au fur et à mesure. Vous avez 7 jours.';
      vue.querySelector('.rec-progres').classList.toggle('complet', coches.size === 5);
      if (coches.has(i)) {
        const suivant = t.closest('.rec-item').nextElementSibling;
        t.closest('.rec-item').querySelector('details').open = false;
        if (suivant && !coches.has(i + 1)) suivant.querySelector('details').open = true;
      }
      return;
    }
    if (t.dataset.guide) {
      const g = GUIDE.find((x) => x.k === t.dataset.guide);
      ouvrir(`<div class="guide-contenu">${g.corps()}</div>`, 'modale-large');
      return;
    }
    if (t.dataset.bo) {
      Admin.clic(t);
      return;
    }
    if (t.dataset.verif) {
      choisirVerif(+t.dataset.verif, true);
      return;
    }
    if (t.dataset.parcours) {
      if (parcours === t.dataset.parcours) return;
      parcours = t.dataset.parcours;
      document.querySelectorAll('[data-parcours]').forEach((b) => b.setAttribute('aria-selected', b === t));
      document.querySelector('.bascule-pastille').style.setProperty('--x', parcours === 'vendre' ? 0 : 1);
      transition(() => {
        document.getElementById('histoire').innerHTML = histoire();
        etapeActive = 0;
        animer();
      });
      return;
    }
    if (t.dataset.choisirMaison) {
      V.maison = t.dataset.choisirMaison;
      V.maisonAutre = '';
      rafraichir(true);
      return;
    }
    if (t.dataset.copier) {
      const hex = t.dataset.copier;
      const ok = () => message(`${hex} copié.`);
      const repli = () => {
        const r = document.createRange();
        r.selectNodeContents(t.querySelector('.mq-hex'));
        getSelection().removeAllRanges();
        getSelection().addRange(r);
        message(`${hex} : sélectionné, copiez-le avec Ctrl+C ou ⌘C.`);
      };
      try {
        navigator.clipboard.writeText(hex).then(ok, repli);
      } catch (err) {
        repli();
      }
      return;
    }
    const a = t.dataset.a && A[t.dataset.a];
    switch (t.dataset.action) {
      case 'fermer':
        fermer();
        break;
      case 'effacer':
        Object.assign(R, {q: '', marques: new Set(), genre: 'tous', etat: 'tous', taille: 'tous', prixMax: 300, mainPropre: false});
        rafraichir(false);
        break;
      case 'acheter': {
        const port = (achat.mode === 'envoi' ? ENVOI : 0) + (assure(a) ? ASSURANCE : 0);
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
        PHOTOS.forEach((x) => (V.photos[x.k] = V.photos[x.k] || true));
        rafraichir(true);
        break;
      case 'nouvelle':
        Object.assign(V, structuredClone(V0));
        rendre();
        break;
      case 'theme':
        appliquerTheme(themeActuel() === 'sombre' ? 'clair' : 'sombre', true);
        break;
      default:
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modale.hidden) fermer();
  });

  /* clair ou sombre : par défaut, comme l'appareil ; le bouton de l'en-tête force l'un ou l'autre */
  const systemeSombre = matchMedia('(prefers-color-scheme: dark)');
  const themeActuel = () => document.documentElement.dataset.theme || (systemeSombre.matches ? 'sombre' : 'clair');
  function appliquerTheme(t, garder) {
    if (t) document.documentElement.dataset.theme = t;
    if (garder) memoire.ecrire('theme', t);
    const b = document.querySelector('[data-action="theme"]');
    if (b) {
      const sombre = themeActuel() === 'sombre';
      b.setAttribute('aria-pressed', sombre);
      b.setAttribute('aria-label', sombre ? 'Passer en clair' : 'Passer en sombre');
      b.title = sombre ? 'Passer en clair' : 'Passer en sombre';
    }
    if (verif3d) verif3d.fond();
  }
  appliquerTheme(memoire.lire('theme', null), false);
  systemeSombre.addEventListener('change', () => appliquerTheme(null, false));

  /* typographie française : une espace insécable avant ? ! : ; » et après «, pour qu'un « ? » ne se retrouve jamais
     seul en début de ligne. Appliquée à tout texte ajouté à la page, quel que soit l'endroit qui l'ajoute. */
  const insecables = (racine) => {
    const w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (n.parentNode.closest('script, style, textarea')) continue;
      const t = n.data.replace(/ ([?!:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0');
      if (t !== n.data) n.data = t;
    }
  };
  new MutationObserver((ms) =>
    ms.forEach((m) =>
      m.addedNodes.forEach((n) => {
        const r = n.nodeType === 3 ? n.parentNode : n.nodeType === 1 ? n : null;
        if (r && r.isConnected) insecables(r);
      }),
    ),
  ).observe(document.body, {childList: true, subtree: true});
  insecables(document.body);

  if ('IntersectionObserver' in window && !reduit()) document.documentElement.classList.add('js-anime');
  Admin.synchroniser();
  rendre();
  Admin.brancher();
})();
