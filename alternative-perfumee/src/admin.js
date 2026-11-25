/* Le back-office de l'équipe Respray (#panel). Tout ce que l'équipe voit et fait : les annonces à vérifier et celles en
   ligne, les commandes, les envois, les réclamations des acheteurs, les membres, les maisons et parfums, l'argent, et
   le journal de chaque action.

   L'état n'est jamais modifié directement : chaque action de l'équipe est une ligne du journal, et l'état se
   recalcule en rejouant le journal sur les données de départ (data.js). Sur la page publiée, le journal est partagé
   (capacité « db ») : toute l'équipe voit les mêmes décisions, signées par la personne qui les a prises. Ailleurs (le
   fichier ouvert seul), il est gardé dans le navigateur. */
function creerAdmin(o) {
  const {esc, eur, eur2, nb, ico, photo, P, A, protection, ENVOI, ressemble, proprement, cle, message, ouvrir, fermer, memoire, PHOTOS, maisonsCatalogue} = o;
  const JOUR = 864e5;
  const minuit = new Date();
  minuit.setHours(0, 0, 0, 0);
  const CHARGEMENT = Date.now();
  /* une date des données : [jours, heure, minute] à partir d'aujourd'hui */
  const quand = (x) => (Array.isArray(x) ? minuit.getTime() + x[0] * JOUR + ((x[1] || 0) * 60 + (x[2] || 0)) * 6e4 : x);
  const fJour = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'short'});
  const fHeure = new Intl.DateTimeFormat('fr-FR', {hour: '2-digit', minute: '2-digit'});
  const date = (t) => `${fJour.format(t)}, ${fHeure.format(t)}`;
  const ilya = (t) => {
    const m = Math.round((Date.now() - t) / 6e4);
    if (m < 1) return 'à l\'instant';
    if (m < 60) return `il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `il y a ${h} h${h < 3 && m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}`;
    const j = Math.floor(h / 24);
    return j === 1 ? 'hier' : `il y a ${j} j`;
  };
  const depuisTexte = (txt) => {
    const h = /(\d+)\s*h\s*(\d+)?/.exec(txt || '');
    if (h) return +h[1] * 60 + +(h[2] || 0);
    const m = /(\d+)\s*min/.exec(txt || '');
    return m ? +m[1] : 0;
  };
  const pastille = (texte, ton = 'neutre') => `<span class="bo-pill bo-${ton}">${texte}</span>`;
  const BASE_ANNONCES = ANNONCES.slice();

  /* ——— le journal : partagé si la page le permet, sinon gardé dans ce navigateur ——— */
  const Journal = (() => {
    let actions = memoire.lire('journal', []);
    let db = null;
    let user = null;
    let moi = 'local';
    let etatLien = 'local'; // local, connexion, partage, lent, erreur
    let ecrire = null; // null : pas encore su ; false : lecture seule
    const noms = {};
    const abonnes = new Set();
    const prevenir = () => abonnes.forEach((f) => f());
    async function nommer() {
      if (!user) return;
      const ids = [...new Set(actions.map((a) => a.par).filter((x) => x && !EQUIPE[x] && x !== 'local'))];
      if (moi && moi !== 'local' && !ids.includes(moi)) ids.push(moi);
      if (!ids.length) return;
      const ps = await user.profiles(ids);
      let change = false;
      ids.forEach((id) => {
        const n = (ps[id] && ps[id].name) || '';
        if (noms[id] !== n) {
          noms[id] = n;
          change = true;
        }
      });
      if (change) prevenir();
    }
    async function brancher() {
      if (!window.claude || typeof window.claude.use !== 'function') return;
      etatLien = 'connexion';
      try {
        db = await window.claude.use('db');
      } catch (e) {
        db = null;
      }
      if (!db) {
        etatLien = 'local';
        return prevenir();
      }
      try {
        user = await window.claude.use('user');
      } catch (e) {
        user = null;
      }
      moi = (user && (await user.id())) || 'anonyme';
      if (user) ecrire = await user.can('data.write');
      const minuteur = setTimeout(() => {
        if (etatLien === 'connexion') {
          etatLien = 'lent';
          prevenir();
        }
      }, 10000);
      db.collection('journal')
        .orderBy('t')
        .onSnapshot(
          (snap) => {
            if (!snap.metadata.fromCache) clearTimeout(minuteur);
            actions = snap.docs.map((d) => ({...d.data(), id: d.id}));
            etatLien = 'partage';
            prevenir();
            nommer();
          },
          (e) => {
            clearTimeout(minuteur);
            db = null;
            etatLien = 'erreur';
            actions = memoire.lire('journal', []);
            prevenir();
          },
        );
    }
    async function ajouter(type, d = {}) {
      if (ecrire === false) {
        message('Vous pouvez consulter le back-office, pas agir : demandez un accès « Contributeur » ou plus.');
        return false;
      }
      const act = {type, d, t: Date.now(), par: moi};
      if (db) {
        try {
          await db.collection('journal').add(act);
          return true;
        } catch (e) {
          if (e.code === 'invalid_argument') ecrire = false;
          message(e.code === 'quota_exceeded' ? 'Le journal partagé est plein : remettez l\'exemple à zéro.' : 'L\'action n\'a pas été enregistrée. Réessayez dans un instant.');
          prevenir();
          return false;
        }
      }
      actions = [...actions, {...act, id: 'j' + act.t.toString(36) + Math.random().toString(36).slice(2, 6)}];
      memoire.ecrire('journal', actions);
      prevenir();
      return true;
    }
    async function vider() {
      if (db) {
        for (const a of actions) {
          try {
            await db.collection('journal').doc(a.id).delete();
          } catch (e) {
            message('Impossible d\'effacer tout le journal partagé.');
            return;
          }
        }
        return;
      }
      actions = [];
      memoire.ecrire('journal', actions);
      prevenir();
    }
    return {
      brancher,
      ajouter,
      vider,
      liste: () => actions,
      version: () => `${actions.length}:${actions.length ? actions[actions.length - 1].id : ''}`,
      abonner: (f) => abonnes.add(f),
      lien: () => etatLien,
      lectureSeule: () => ecrire === false,
      qui: (par) => (EQUIPE[par] ? EQUIPE[par].nom : par === moi ? 'Vous' : noms[par] || 'Un membre de l\'équipe'),
    };
  })();

  /* ——— l'état : les données de départ, puis chaque action du journal, dans l'ordre ——— */
  const membreDe = (pseudo) => Object.keys(VENDEURS).find((k) => VENDEURS[k].pseudo === pseudo) || Object.keys(ACHETEURS).find((k) => ACHETEURS[k].pseudo === pseudo);
  function depart() {
    const s = {
      file: A_VERIFIER.map((x) => ({...x, soumis: CHARGEMENT - depuisTexte(x.il) * 6e4, statut: 'attente'})),
      retraits: {},
      commandes: {},
      litiges: {},
      membres: {},
      maisons: MAISONS_AJOUTEES_BASE.map((m) => ({...m, le: quand(m.le)})),
      parfums: [],
      propositions: PROPOSITIONS_INITIALES.map((x) => ({...x, t: CHARGEMENT - depuisTexte(x.il) * 6e4})),
      notes: {},
      journal: JOURNAL_BASE.map((j) => ({...j, t: quand(j.t), base: true})),
    };
    COMMANDES.forEach((c) => {
      const x = structuredClone(c);
      ['payee', 'envoyee', 'livree', 'conclue', 'versee', 'annulee', 'remboursee'].forEach((k) => x[k] && (x[k] = quand(x[k])));
      if (x.suivi) x.suivi.etapes = x.suivi.etapes.map(([j, h, m, texte]) => ({t: quand([j, h, m]), texte}));
      x.evenements = [];
      x.prolonge = 0;
      s.commandes[x.id] = x;
    });
    LITIGES.forEach((l) => {
      const x = structuredClone(l);
      ['ouvert', 'repondu', 'clos'].forEach((k) => x[k] && (x[k] = quand(x[k])));
      x.echanges = [];
      s.litiges[x.id] = x;
    });
    Object.entries(VENDEURS).forEach(([id, v]) => (s.membres[id] = {id, vendeur: true, ...v, ...(PRIVE[id] || {}), inscrit: quand((PRIVE[id] || {}).inscrit || [0]), statut: 'actif', messages: []}));
    Object.entries(ACHETEURS).forEach(([id, b]) => (s.membres[id] = {id, vendeur: false, ...b, inscrit: quand(b.inscrit), statut: 'actif', strikes: 0, messages: []}));
    return s;
  }
  const MOTIFS = {niveau: 'Niveau plus bas qu\'annoncé', contrefacon: 'Contrefaçon suspectée', casse: 'Arrivé cassé', jamais_recu: 'Jamais reçu', autre: 'Autre'};
  const nomC = (c) => `${P[c.p].nom} ${c.ml} ml`;
  /* chaque action : son effet sur l'état, et la phrase du journal */
  function appliquer(s, a) {
    const d = a.d || {};
    const ev = (c, texte) => c && c.evenements.push({t: a.t, texte, par: a.par});
    const c = d.c && s.commandes[d.c];
    const l = d.l && s.litiges[d.l];
    const m = d.m && s.membres[d.m];
    const f = d.a && s.file.find((x) => x.id === d.a);
    let texte = '';
    let lien = '';
    switch (a.type) {
      case 'annonce_soumise':
        s.file.push({...d.annonce, soumis: a.t, statut: 'attente', soumise: true});
        texte = `a soumis l'annonce ${esc(d.annonce.nomAffiche)} (formulaire Vendre)`;
        lien = 'annonces';
        break;
      case 'annonce_publiee':
        if (f) Object.assign(f, {statut: 'publiee', decide: a.t, par: a.par});
        texte = `a publié l'annonce ${esc(f ? f.nomAffiche || P[f.p].nom : d.a)}`;
        lien = 'annonces';
        break;
      case 'annonce_refusee':
        if (f) Object.assign(f, {statut: 'refusee', raison: d.raison, decide: a.t, par: a.par});
        texte = `a refusé l'annonce ${esc(f ? f.nomAffiche || P[f.p].nom : d.a)} : « ${esc(d.raison)} »`;
        lien = 'annonces';
        break;
      case 'photo_demandee':
        if (f) Object.assign(f, {statut: 'photo', quelle: d.quelle, raison: d.texte, decide: a.t, par: a.par});
        texte = `a demandé une photo (${esc(d.quelle)}) pour l'annonce ${esc(f ? f.nomAffiche || P[f.p].nom : d.a)}`;
        lien = 'annonces';
        break;
      case 'annonce_retiree':
        s.retraits[d.a] = {raison: d.raison, t: a.t, par: a.par};
        texte = `a retiré l'annonce ${esc(d.a)} du site : « ${esc(d.raison)} »`;
        lien = 'annonces/en-ligne';
        break;
      case 'annonce_remise':
        delete s.retraits[d.a];
        texte = `a remis l'annonce ${esc(d.a)} en ligne`;
        lien = 'annonces/en-ligne';
        break;
      case 'relance':
        ev(c, 'Vendeur relancé par l\'équipe');
        texte = `a relancé le vendeur de la commande ${d.c}`;
        lien = 'commandes/' + d.c;
        break;
      case 'annulation':
        if (c) Object.assign(c, {statut: 'annulee', annulee: a.t, raison: d.raison});
        ev(c, `Vente annulée, acheteur remboursé (${eur2(total(c))}) : ${d.raison}`);
        texte = `a annulé la commande ${d.c} et remboursé l'acheteur`;
        lien = 'commandes/' + d.c;
        break;
      case 'colis_perdu':
        if (c) Object.assign(c, {statut: 'remboursee', remboursee: a.t, raison: 'Colis perdu : acheteur remboursé, vendeur payé par l\'assurance'});
        ev(c, 'Colis déclaré perdu : acheteur remboursé, vendeur payé par l\'assurance du transporteur');
        Object.values(s.litiges).forEach((x) => x.c === d.c && x.statut !== 'clos' && Object.assign(x, {statut: 'clos', decision: 'assurance', clos: a.t}));
        texte = `a déclaré perdu le colis de la commande ${d.c}`;
        lien = 'commandes/' + d.c;
        break;
      case 'prolongation':
        if (c) c.prolonge += d.jours;
        ev(c, `Délai de vérification prolongé de ${d.jours} jours`);
        texte = `a prolongé de ${d.jours} jours la vérification de la commande ${d.c}`;
        lien = 'commandes/' + d.c;
        break;
      case 'versement':
        (d.cs || [d.c]).forEach((id) => {
          const x = s.commandes[id];
          if (x && x.statut === 'conclue') {
            Object.assign(x, {statut: 'versee', versee: a.t});
            x.evenements.push({t: a.t, texte: `Virement de ${eur2(x.prix)} envoyé au vendeur`, par: a.par});
          }
        });
        texte = d.cs ? `a versé ${d.cs.length} ventes conclues aux vendeurs` : `a versé au vendeur la commande ${d.c}`;
        lien = 'paiements';
        break;
      case 'decision': {
        if (!l) break;
        const lc = s.commandes[l.c];
        const v = lc && s.membres[lc.v];
        l.echanges.push({t: a.t, par: a.par, texte: d.message, qui: 'equipe'});
        if (d.decision === 'demander') {
          l.statut = d.cible === 'vendeur' ? 'attente_vendeur' : 'attente_acheteur';
          texte = `a demandé une précision ${d.cible === 'vendeur' ? 'au vendeur' : 'à l\'acheteur'} (litige ${l.id})`;
        } else {
          Object.assign(l, {statut: 'clos', decision: d.decision, clos: a.t});
          if (d.decision === 'refuser') {
            Object.assign(lc, {statut: 'conclue', conclue: a.t});
            ev(lc, 'Litige tranché : conforme. La vente est conclue');
          } else {
            Object.assign(lc, {statut: 'remboursee', remboursee: a.t, raison: d.decision === 'assurance' ? 'Problème de transport, remboursé par l\'assurance' : 'Non conforme'});
            ev(lc, d.decision === 'rembourser_retour' ? `Non conforme : retour avec l'étiquette payée par le vendeur, acheteur remboursé (${eur2(total(lc))})` : d.decision === 'assurance' ? 'Problème de transport : acheteur remboursé, vendeur payé par l\'assurance' : `Non conforme : acheteur remboursé sans retour (${eur2(total(lc))})`);
            if (v && d.decision !== 'assurance') v.strikes = (v.strikes || 0) + 1;
          }
          if (d.exclure && v) Object.assign(v, {statut: 'exclu', raisonStatut: 'Contrefaçon ou parfum dilué (litige ' + l.id + ')'});
          texte = `a tranché le litige ${l.id} : ${DECISIONS[d.decision]}${d.exclure ? ', et exclu le vendeur' : ''}`;
        }
        lien = 'litiges/' + d.l;
        break;
      }
      case 'statut_membre':
        if (m) Object.assign(m, {statut: d.statut, raisonStatut: d.raison});
        texte = `${d.statut === 'actif' ? 'a réactivé' : d.statut === 'suspendu' ? 'a suspendu' : 'a exclu'} @${esc(m ? m.pseudo : d.m)}${d.raison ? ` : « ${esc(d.raison)} »` : ''}`;
        lien = 'membres/' + d.m;
        break;
      case 'message':
        if (m) m.messages.push({t: a.t, par: a.par, texte: d.texte});
        texte = `a écrit à @${esc(m ? m.pseudo : d.m)}`;
        lien = 'membres/' + d.m;
        break;
      case 'note':
        (s.notes[d.cible] ||= []).push({t: a.t, par: a.par, texte: d.texte});
        texte = `a ajouté une note sur ${esc(d.cible)}`;
        lien = d.lien || '';
        break;
      case 'proposition':
        s.propositions.unshift({...d.proposition, t: a.t, il: ''});
        texte = `a proposé ${d.proposition.type === 'maison' ? 'la maison' : 'le parfum'} « ${esc(d.proposition.tape)} » (formulaire Vendre)`;
        lien = 'maisons';
        break;
      case 'maison_ajoutee': {
        const prop = d.pid && s.propositions.find((y) => y.id === d.pid);
        s.maisons.push({nom: d.nom, le: a.t, par: a.par, proposee: prop ? prop.par : null});
        if (prop) s.propositions.forEach((y) => y.type === 'parfum' && y.maison && cle(y.maison) === cle(prop.tape) && (y.maison = d.nom));
        s.propositions = s.propositions.filter((y) => y.id !== d.pid);
        texte = `a ajouté la maison « ${esc(d.nom)} » à la liste${prop ? ` (proposée par @${esc(prop.par)})` : ''}`;
        lien = 'maisons';
        break;
      }
      case 'maison_renommee': {
        const x = s.maisons.find((y) => y.nom === d.ancien);
        if (x) x.nom = d.nom;
        s.parfums.forEach((y) => y.maison === d.ancien && (y.maison = d.nom));
        texte = `a corrigé le nom « ${esc(d.ancien)} » en « ${esc(d.nom)} »`;
        lien = 'maisons';
        break;
      }
      case 'parfum_ajoute': {
        const prop = d.pid && s.propositions.find((y) => y.id === d.pid);
        s.parfums.push({maison: d.maison, nom: d.nom, conc: d.conc || '', le: a.t, par: a.par, proposee: prop ? prop.par : null});
        s.propositions = s.propositions.filter((y) => y.id !== d.pid);
        texte = `a ajouté le parfum « ${esc(d.nom)} » (${esc(d.maison)})`;
        lien = 'maisons';
        break;
      }
      case 'proposition_refusee':
      case 'proposition_fusionnee': {
        const prop = s.propositions.find((y) => y.id === d.pid);
        s.propositions = s.propositions.filter((y) => y.id !== d.pid);
        texte = a.type === 'proposition_refusee' ? `a refusé la proposition « ${esc(prop ? prop.tape : '')} »` : `a corrigé « ${esc(prop ? prop.tape : '')} » en ${esc(d.vers)}, déjà dans la liste`;
        lien = 'maisons';
        break;
      }
      default:
        return;
    }
    s.journal.push({t: a.t, par: a.par, texte, lien, type: a.type});
  }
  const DECISIONS = {rembourser_retour: 'non conforme, retour et remboursement', rembourser: 'non conforme, remboursé sans retour', refuser: 'conforme, vente conclue', assurance: 'problème de transport, assurance', demander: 'demande de précision'};
  let memo = null;
  let memoCle = '';
  function etat() {
    const k = Journal.version();
    if (memo && k === memoCle) return memo;
    const s = depart();
    Journal.liste()
      .slice()
      .sort((x, y) => x.t - y.t)
      .forEach((a) => appliquer(s, a));
    s.journal.sort((x, y) => y.t - x.t);
    memo = s;
    memoCle = k;
    synchroniser(s);
    return s;
  }
  /* le site suit les décisions : annonces publiées, retirées, vendeurs suspendus ou exclus */
  function synchroniser(s) {
    const cache = (a) => s.retraits[a.id] || (s.membres[a.v] && s.membres[a.v].statut !== 'actif');
    const publiees = s.file.filter((x) => x.statut === 'publiee' && P[x.p]).map((x) => ({...x, jours: 0, desc: x.desc || 'Annonce vérifiée par l\'équipe.', fond: x.fond || '#ECE7E0'}));
    ANNONCES.length = 0;
    ANNONCES.push(...publiees.filter((x) => !cache(x)), ...BASE_ANNONCES.filter((x) => !cache(x)));
    Object.keys(A).forEach((k) => delete A[k]);
    [...BASE_ANNONCES, ...publiees].forEach((x) => (A[x.id] = x));
  }

  /* ——— calculs ——— */
  const total = (c) => (c ? c.prix + protection(c.prix) + (c.mode === 'envoi' ? ENVOI : 0) : 0);
  const BLOQUEE = ['a_envoyer', 'en_transit', 'livree', 'litige'];
  const retardEnvoi = (c) => (c.statut === 'a_envoyer' ? (Date.now() - c.payee) / JOUR - 5 : -1);
  const derniereEtape = (c) => (c.suivi && c.suivi.etapes.length ? c.suivi.etapes[c.suivi.etapes.length - 1].t : c.envoyee);
  const immobile = (c) => (c.statut === 'en_transit' ? (Date.now() - derniereEtape(c)) / JOUR : 0);
  const finVerif = (c) => (c.livree ? c.livree + (7 + c.prolonge) * JOUR : 0);
  const STATUTS_C = {a_envoyer: ['À envoyer', 'attente'], en_transit: ['En transit', 'neutre'], livree: ['Livrée · 7 jours', 'neutre'], litige: ['Litige', 'alerte'], conclue: ['Conclue · à verser', 'attente'], versee: ['Versée', 'ok'], annulee: ['Annulée', 'gris'], remboursee: ['Remboursée', 'gris']};
  const STATUTS_L = {a_trancher: ['À trancher', 'alerte'], attente_vendeur: ['Attente du vendeur', 'attente'], attente_acheteur: ['Attente de l\'acheteur', 'attente'], enquete: ['Enquête transporteur', 'attente'], clos: ['Clos', 'gris']};
  const STATUTS_M = {actif: ['Actif', 'ok'], suspendu: ['Suspendu', 'attente'], exclu: ['Exclu', 'alerte']};
  const pillC = (c) => {
    if (retardEnvoi(c) > 0) return pastille(`En retard · ${Math.ceil(retardEnvoi(c))} j`, 'alerte');
    if (immobile(c) > 6) return pastille(`Bloqué depuis ${Math.floor(immobile(c))} j`, 'alerte');
    const [t, ton] = STATUTS_C[c.statut];
    return pastille(c.statut === 'livree' ? `Livrée · J+${Math.min(7 + c.prolonge, Math.floor((Date.now() - c.livree) / JOUR))}/${7 + c.prolonge}` : t, ton);
  };
  const lienM = (s, id) => (s.membres[id] ? `<a class="bo-lien" href="#panel/membres/${id}">@${esc(s.membres[id].pseudo)}</a>` : '');
  const vignette = (c, vue = 'face') => photo({id: c.ph, p: c.p, niveau: c.niveau, v: c.v, lot: c.lot}, vue, 'bo-vignette-img');
  const strikes6mois = (m) => m.strikes || 0;

  /* les compteurs de la navigation, et ce qu'il faut faire maintenant, du plus urgent au moins urgent */
  function compteurs(s) {
    const cs = Object.values(s.commandes);
    return {
      annonces: s.file.filter((x) => x.statut === 'attente').length,
      envois: cs.filter((c) => retardEnvoi(c) > 0 || immobile(c) > 6).length,
      litiges: Object.values(s.litiges).filter((l) => l.statut !== 'clos').length,
      maisons: s.propositions.length,
      paiements: cs.filter((c) => c.statut === 'conclue').length,
      membres: Object.values(s.membres).filter((m) => m.vendeur && m.statut === 'actif' && strikes6mois(m) >= 2).length,
    };
  }
  function aFaire(s) {
    const t = [];
    Object.values(s.litiges).forEach((l) => {
      if (l.statut === 'a_trancher') t.push({p: 0, ton: 'alerte', titre: `Trancher le litige ${l.id}`, sous: `${MOTIFS[l.motif]} · ${nomC(s.commandes[l.c])} · ouvert ${ilya(l.ouvert)}`, lien: 'litiges/' + l.id});
      else if (l.statut === 'attente_vendeur' && Date.now() > l.ouvert + 2 * JOUR) t.push({p: 1, ton: 'alerte', titre: `Le vendeur n'a pas répondu (litige ${l.id})`, sous: 'Les 48 h sont passées : vous pouvez trancher', lien: 'litiges/' + l.id});
      else if (l.statut === 'enquete') t.push({p: 2, ton: 'attente', titre: `Colis introuvable (litige ${l.id})`, sous: `${nomC(s.commandes[l.c])} · ouvert ${ilya(l.ouvert)}`, lien: 'litiges/' + l.id});
    });
    Object.values(s.commandes).forEach((c) => {
      if (retardEnvoi(c) > 0) t.push({p: 1, ton: 'alerte', titre: `Envoi en retard : ${c.id}`, sous: `${nomC(c)} · payée ${ilya(c.payee)} · vendeur ${s.membres[c.v].pseudo}`, lien: 'commandes/' + c.id});
      if (immobile(c) > 6) t.push({p: 2, ton: 'alerte', titre: `Colis bloqué : ${c.id}`, sous: `Aucun mouvement depuis ${Math.floor(immobile(c))} jours`, lien: 'commandes/' + c.id});
    });
    s.file.filter((x) => x.statut === 'attente').forEach((x) => t.push({p: Date.now() - x.soumis > 2 * 36e5 ? 1 : 3, ton: x.alerte ? 'alerte' : 'attente', titre: `Vérifier ${x.nomAffiche || P[x.p].nom}`, sous: `${x.alerte ? esc(x.alerte) + ' · ' : ''}soumise ${ilya(x.soumis)}`, lien: 'annonces'}));
    s.propositions.forEach((x) => t.push({p: 4, ton: 'neutre', titre: `${x.type === 'maison' ? 'Maison' : 'Parfum'} proposé${x.type === 'maison' ? 'e' : ''} : « ${esc(x.tape)} »`, sous: `par @${esc(x.par)}`, lien: 'maisons'}));
    const av = Object.values(s.commandes).filter((c) => c.statut === 'conclue');
    if (av.length) t.push({p: 3, ton: 'attente', titre: `Verser ${av.length} vente${av.length > 1 ? 's' : ''} conclue${av.length > 1 ? 's' : ''}`, sous: eur2(av.reduce((x, c) => x + c.prix, 0)) + ' au total', lien: 'paiements'});
    return t.sort((x, y) => x.p - y.p);
  }

  /* ——— les vues ——— */
  const SECTIONS = [
    ['', 'Aujourd\'hui', 'maison'],
    ['annonces', 'Annonces', 'photo'],
    ['commandes', 'Commandes', 'boite'],
    ['envois', 'Envois', 'camion'],
    ['litiges', 'Litiges', 'alerte'],
    ['membres', 'Membres', 'personnes'],
    ['maisons', 'Maisons et parfums', 'etiquette'],
    ['paiements', 'Paiements', 'euro'],
    ['journal', 'Journal', 'liste'],
  ];
  const ICO_BO = {
    maison: '<path d="M4 11l8-6 8 6v8H4z"/><path d="M10 19v-5h4v5"/>',
    camion: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>',
    alerte: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
    personnes: '<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16 14.5c2.4 0 4 1.4 4.5 4"/>',
    etiquette: '<path d="M4 4h8l8 8-8 8-8-8z"/><circle cx="8.5" cy="8.5" r="1.4"/>',
    liste: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.5M4 12h.5M4 18h.5"/>',
    euro: '<path d="M17 6.5A6.5 6.5 0 1 0 17 17.5"/><path d="M5 10.5h9M5 13.5h9"/>',
  };
  const icoBo = (k) => (ICO_BO[k] ? `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICO_BO[k]}</svg>` : ico(k));
  function cadre(s, section, contenu) {
    const n = compteurs(s);
    const lien = Journal.lien();
    const etatLien = {partage: ['Journal partagé avec l\'équipe', 'ok'], connexion: ['Connexion au journal partagé…', 'attente'], lent: ['Le journal partagé ne répond pas encore', 'attente'], erreur: ['Journal partagé indisponible : gardé dans ce navigateur', 'attente'], local: ['Journal gardé dans ce navigateur', 'neutre']}[lien];
    return `<div class="bo">
      <aside class="bo-cote">
        <a class="bo-marque" href="#panel"><span class="bo-logo">${o.logo()}</span><span>Équipe</span></a>
        <nav class="bo-nav" aria-label="Back-office">${SECTIONS.map(([k, t, i]) => {
          const c = n[k];
          return `<a href="#panel${k ? '/' + k : ''}" aria-current="${section === k ? 'page' : 'false'}">${icoBo(i)}<span>${t}</span>${c ? `<b class="bo-compte${k === 'litiges' || k === 'envois' ? ' bo-compte-alerte' : ''}">${c}</b>` : ''}</a>`;
        }).join('')}</nav>
        <div class="bo-pied">
          <p class="bo-lien-etat"><span class="bo-point bo-${etatLien[1]}"></span>${etatLien[0]}</p>
          ${Journal.lectureSeule() ? '<p class="bo-lien-etat">Lecture seule : vous ne pouvez pas agir</p>' : ''}
          <a class="bo-lien" href="#accueil">${ico('fleche')}Voir le site</a>
          <button class="bo-lien" type="button" data-bo="vider">Remettre l'exemple à zéro</button>
        </div>
      </aside>
      <div class="bo-main">
        <div class="bo-barre">
          <form class="bo-cherche" data-form="bo-cherche" role="search">${ico('loupe')}<label class="vh" for="bo-q">Rechercher dans le back-office</label><input id="bo-q" type="search" placeholder="Commande, membre, e-mail, annonce, code lot, n° de suivi…" autocomplete="off" data-bo-cherche><div class="bo-resultats" id="bo-resultats" hidden></div></form>
        </div>
        <div class="bo-contenu">${contenu}</div>
      </div>
    </div>`;
  }
  const tete = (surtitre, titre, droite = '') => `<div class="bo-tete"><div><p class="surtitre">${surtitre}</p><h1 class="bo-titre">${titre}</h1></div>${droite}</div>`;
  const vide = (t) => `<div class="bo-vide"><p>${t}</p></div>`;
  const notesDe = (s, cible, lien) => {
    const liste = s.notes[cible] || [];
    return `<section class="bo-bloc"><h2 class="bo-h2">Notes internes</h2>
      ${liste.length ? `<ul class="bo-notes">${liste.map((x) => `<li><p>${esc(x.texte)}</p><small>${esc(Journal.qui(x.par))} · ${date(x.t)}</small></li>`).join('')}</ul>` : '<p class="aide">Aucune note. Les membres ne les voient pas.</p>'}
      <form class="bo-note" data-form="bo-note" data-cible="${esc(cible)}" data-lien="${esc(lien)}"><label class="vh" for="note-${esc(cible)}">Ajouter une note</label><textarea id="note-${esc(cible)}" name="texte" class="champ" rows="2" placeholder="Ajouter une note pour l'équipe…" required></textarea><button class="btn btn-petit" type="submit">Ajouter</button></form>
    </section>`;
  };

  /* Aujourd'hui */
  function vueAujourdhui(s) {
    const n = compteurs(s);
    const cs = Object.values(s.commandes);
    const bloque = cs.filter((c) => BLOQUEE.includes(c.statut)).reduce((x, c) => x + total(c), 0);
    const aVerser = cs.filter((c) => c.statut === 'conclue').reduce((x, c) => x + c.prix, 0);
    const recettes = cs.filter((c) => !['annulee', 'remboursee'].includes(c.statut) && Date.now() - c.payee < 30 * JOUR).reduce((x, c) => x + protection(c.prix), 0);
    const ventes = cs.filter((c) => Date.now() - c.payee < 30 * JOUR).length;
    const taches = aFaire(s);
    const tuile = (lien, chiffre, texte, ton = '') => `<a class="bo-tuile ${ton}" href="#panel/${lien}"><strong>${chiffre}</strong><span>${texte}</span></a>`;
    return `${tete(fJour.format(Date.now()), 'Aujourd\'hui')}
      <div class="bo-tuiles">
        ${tuile('annonces', n.annonces, 'annonces à vérifier', n.annonces ? 'bo-t-attente' : '')}
        ${tuile('litiges', n.litiges, 'litiges ouverts', n.litiges ? 'bo-t-alerte' : '')}
        ${tuile('envois', n.envois, 'envois en retard ou bloqués', n.envois ? 'bo-t-alerte' : '')}
        ${tuile('maisons', n.maisons, 'maisons et parfums proposés')}
      </div>
      <div class="bo-tuiles bo-tuiles-argent">
        ${tuile('paiements', eur2(bloque), 'bloqués, en attente de vérification')}
        ${tuile('paiements', eur2(aVerser), 'à verser aux vendeurs')}
        ${tuile('commandes', ventes, 'ventes sur 30 jours')}
        ${tuile('paiements', eur2(recettes), 'de protection acheteur sur 30 jours')}
      </div>
      <section class="bo-bloc"><h2 class="bo-h2">À faire, du plus urgent au moins urgent</h2>
        ${taches.length ? `<ol class="bo-taches">${taches.map((x) => `<li><a href="#panel/${x.lien}"><span class="bo-point bo-${x.ton}"></span><span><strong>${x.titre}</strong><small>${x.sous}</small></span>${ico('fleche')}</a></li>`).join('')}</ol>` : vide('Rien d\'urgent. Tout est à jour.')}
      </section>
      <section class="bo-bloc"><h2 class="bo-h2">Dernières actions de l'équipe</h2>${lignesJournal(s.journal.slice(0, 6))}<a class="lien" href="#panel/journal">Tout le journal ${ico('fleche')}</a></section>`;
  }

  /* Annonces : la file de vérification, et celles en ligne */
  const RAISONS = ['La photo du dessous ne permet pas de lire le code lot', 'Il manque la photo de la tige sans le bouton spray', 'Il manque la photo avec le pseudo et la date', 'Le code lot ne correspond pas au format de la marque', 'Le prix est anormalement bas : merci de vérifier', 'Les photos ont déjà été vues sur une autre annonce', 'Contrefaçon probable'];
  const RAISONS_RETRAIT = ['Signalée par un acheteur : à vérifier', 'Le vendeur a vendu le flacon ailleurs', 'Photos reprises d\'une autre annonce', 'Contrefaçon probable', 'Demande du vendeur'];
  const CHECKS = ['Les 6 photos sont là et nettes', 'Code lot lisible et au format de la marque', 'Spray, bague et tige d\'origine', 'Flacon conforme aux modèles connus', 'Niveau conforme à l\'annonce', 'Papier avec le bon pseudo et une date récente'];
  function carteFile(s, x) {
    const v = s.membres[x.v];
    const nom = x.nomAffiche || `${P[x.p].maison} · ${P[x.p].nom}`;
    const pa = {...x, id: x.ph || x.id};
    const vues = ['face', 'dessous', 'niveau', 'dessus', 'tige', 'preuve', ...(x.boite ? ['boite'] : [])];
    const attente = Date.now() - x.soumis;
    return `<article class="bo-carte bo-verif" id="file-${x.id}">
      <div class="bo-verif-photos">${vues.map((vue) => `<button type="button" class="bo-mini" data-bo="zoom" data-src="${esc(x.ph || x.id)}" data-vue="${vue}" data-titre="${esc(Dessins.LEGENDES[vue])}" aria-label="Agrandir : ${esc(Dessins.LEGENDES[vue])}">${photo(pa, vue)}</button>`).join('')}${x.doublon ? `<a class="bo-doublon" href="#annonce-${x.doublon}">${photo(A[x.doublon] || pa, 'face')}<span>Annonce ${x.doublon}</span></a>` : ''}</div>
      <div class="bo-verif-infos">
        <p class="aide">Soumise ${ilya(x.soumis)} · ${lienM(s, x.v)}${v && v.ventes ? ` · ${v.ventes} ventes · ${v.conformes} % conformes` : ' · nouveau vendeur'}${x.soumise ? ' · photos d\'exemple' : ''}</p>
        <h2 class="bo-h2">${esc(nom)}, ${x.ml} ml ${attente > 2 * 36e5 ? pastille('En attente depuis plus de 2 h', 'attente') : ''}</h2>
        <p>${eur(x.prix)} · ${x.etat === 'blister' ? 'neuf sous blister' : `reste ~${x.niveau} %`} · code lot ${esc(x.lot || '—')}${x.boite ? ' · avec boîte' : ''}</p>
        ${x.alerte ? `<p class="p-alerte">${esc(x.alerte)}</p>` : ''}
        ${x.details ? `<dl class="bo-dl bo-declare">${[['Concentration', x.details.conc], ['Format', x.details.format], ['Acheté', x.details.achat], ['Rangé', x.details.rangement], ['Boîte', x.details.boite], ['Niveau', x.details.visible], ['Défauts', x.details.defauts], ['Main propre', x.details.ville], ['Description', x.desc]].filter((r) => r[1]).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
        <fieldset class="p-checks"><legend class="vh">Contrôles</legend>${CHECKS.map((c, i) => `<label class="choix"><input type="checkbox" data-check="${x.id}" id="c-${x.id}-${i}"> ${c}</label>`).join('')}</fieldset>
        <div class="bo-actions">
          <button class="btn btn-noir btn-petit" type="button" data-bo="publier" data-id="${x.id}">Publier</button>
          <button class="btn btn-petit" type="button" data-bo="demander-photo" data-id="${x.id}">Demander une photo</button>
          <button class="btn btn-petit" type="button" data-bo="refuser" data-id="${x.id}">Refuser…</button>
        </div>
      </div>
    </article>`;
  }
  function vueAnnonces(s, onglet) {
    const file = s.file.filter((x) => x.statut === 'attente');
    const decidees = s.file.filter((x) => x.statut !== 'attente').sort((x, y) => y.decide - x.decide);
    const enLigne = BASE_ANNONCES.concat(s.file.filter((x) => x.statut === 'publiee' && P[x.p]));
    const ong = [['', 'À vérifier', file.length], ['en-ligne', 'En ligne', ANNONCES.length], ['decidees', 'Décidées', decidees.length]];
    let corps;
    if (onglet === 'en-ligne') {
      corps = `<div class="bo-table-cadre"><table class="bo-table"><thead><tr><th>Annonce</th><th>Vendeur</th><th>Prix</th><th>État</th><th></th></tr></thead><tbody>${enLigne
        .map((a) => {
          const r = s.retraits[a.id];
          const v = s.membres[a.v];
          const cache = r || (v && v.statut !== 'actif');
          return `<tr><td><a class="bo-ligne-a" href="#annonce-${a.id}"><span class="bo-vignette">${photo({...a, id: a.ph || a.id}, 'face')}</span><span><strong>${esc(P[a.p].nom)}</strong><small>${a.id} · ${a.ml} ml · ${esc(P[a.p].maison)}</small></span></a></td><td>${lienM(s, a.v)}</td><td>${eur(a.prix)}</td>
            <td>${r ? pastille('Retirée', 'gris') + `<small class="bo-sous">${esc(r.raison)}</small>` : v && v.statut !== 'actif' ? pastille(`Masquée : vendeur ${STATUTS_M[v.statut][0].toLowerCase()}`, 'attente') : pastille('En ligne', 'ok')}</td>
            <td class="bo-droite">${r ? `<button class="btn btn-petit" type="button" data-bo="remettre" data-id="${a.id}">Remettre</button>` : cache ? '' : `<button class="btn btn-petit" type="button" data-bo="retirer" data-id="${a.id}">Retirer…</button>`}</td></tr>`;
        })
        .join('')}</tbody></table></div>`;
    } else if (onglet === 'decidees') {
      corps = decidees.length
        ? `<div class="bo-table-cadre"><table class="bo-table"><thead><tr><th>Annonce</th><th>Décision</th><th>Par</th><th>Quand</th></tr></thead><tbody>${decidees
            .map((x) => `<tr><td><strong>${esc(x.nomAffiche || P[x.p].nom)}</strong><small class="bo-sous">${x.ml} ml · ${lienM(s, x.v)}</small></td><td>${x.statut === 'publiee' ? pastille('Publiée', 'ok') : x.statut === 'photo' ? pastille('Photo demandée', 'attente') + `<small class="bo-sous">${esc(x.quelle)}</small>` : pastille('Refusée', 'alerte') + `<small class="bo-sous">${esc(x.raison)}</small>`}</td><td>${esc(Journal.qui(x.par))}</td><td>${date(x.decide)}</td></tr>`)
            .join('')}</tbody></table></div>`
        : vide('Aucune décision pour l\'instant.');
    } else corps = file.length ? file.sort((x, y) => x.soumis - y.soumis).map((x) => carteFile(s, x)).join('') : vide('Aucune annonce en attente. Tout est vérifié.');
    return `${tete('Annonces', 'Annonces')}${onglets('annonces', ong, onglet)}${corps}`;
  }
  const onglets = (section, liste, actif) => `<nav class="onglets bo-onglets" aria-label="Filtres">${liste.map(([k, t, n]) => `<a href="#panel/${section}${k ? '/' + k : ''}" aria-current="${(actif || '') === k ? 'page' : 'false'}">${t}${n != null ? ` <span class="compte">${n}</span>` : ''}</a>`).join('')}</nav>`;

  /* Commandes */
  function ligneCommande(s, c) {
    return `<tr><td><a class="bo-ligne-a" href="#panel/commandes/${c.id}"><span class="bo-vignette">${vignette(c)}</span><span><strong>${esc(nomC(c))}</strong><small>${c.id} · ${fJour.format(c.payee)}</small></span></a></td><td>${lienM(s, c.v)}</td><td>${lienM(s, c.b)}</td><td>${eur2(total(c))}</td><td>${pillC(c)}</td></tr>`;
  }
  const tableCommandes = (s, liste) => (liste.length ? `<div class="bo-table-cadre"><table class="bo-table"><thead><tr><th>Commande</th><th>Vendeur</th><th>Acheteur</th><th>Payé</th><th>Statut</th></tr></thead><tbody>${liste.map((c) => ligneCommande(s, c)).join('')}</tbody></table></div>` : vide('Aucune commande ici.'));
  function vueCommandes(s, filtre) {
    const cs = Object.values(s.commandes).sort((x, y) => y.payee - x.payee);
    const groupes = {'': cs, cours: cs.filter((c) => BLOQUEE.includes(c.statut)), litige: cs.filter((c) => c.statut === 'litige'), conclues: cs.filter((c) => ['conclue', 'versee'].includes(c.statut)), annulees: cs.filter((c) => ['annulee', 'remboursee'].includes(c.statut))};
    return `${tete('Commandes', 'Commandes')}${onglets('commandes', [['', 'Toutes', cs.length], ['cours', 'En cours', groupes.cours.length], ['litige', 'En litige', groupes.litige.length], ['conclues', 'Conclues', groupes.conclues.length], ['annulees', 'Annulées, remboursées', groupes.annulees.length]], filtre)}${tableCommandes(s, groupes[filtre || ''] || cs)}`;
  }
  function chronologie(s, c) {
    const e = [{t: c.payee, texte: `Payée par ${s.membres[c.b].pseudo} : ${eur2(total(c))}, bloqués par Respray`}];
    if (c.mode === 'main') e.push({t: c.conclue, texte: 'Remise en main propre : l\'acheteur a validé sur place'});
    if (c.envoyee) e.push({t: c.envoyee, texte: 'Envoyée par le vendeur'});
    (c.suivi ? c.suivi.etapes : []).forEach((x) => e.push({t: x.t, texte: `Transporteur : ${x.texte}`, suivi: true}));
    if (c.livree) e.push({t: c.livree, texte: 'Livrée : les 7 jours de vérification commencent'});
    Object.values(s.litiges)
      .filter((l) => l.c === c.id)
      .forEach((l) => e.push({t: l.ouvert, texte: `Réclamation ouverte (${l.id}) : ${MOTIFS[l.motif]}`, lien: 'litiges/' + l.id}));
    if (c.mode === 'envoi' && c.conclue && !c.evenements.some((x) => /conclue/.test(x.texte))) e.push({t: c.conclue, texte: 'Vente conclue'});
    if (c.versee && !c.evenements.some((x) => /Virement/.test(x.texte))) e.push({t: c.versee, texte: `Virement de ${eur2(c.prix)} envoyé au vendeur`});
    if (c.annulee && !c.evenements.some((x) => /annulée/.test(x.texte))) e.push({t: c.annulee, texte: `Annulée : ${c.raison}`});
    if (c.remboursee && !c.evenements.some((x) => /rembours/.test(x.texte))) e.push({t: c.remboursee, texte: `Remboursée : ${c.raison}`});
    c.evenements.forEach((x) => e.push({...x, equipe: true}));
    return e.filter((x) => x.t).sort((x, y) => x.t - y.t);
  }
  function actionsCommande(c) {
    const b = [];
    if (c.statut === 'a_envoyer') b.push(['relance', 'Relancer le vendeur'], ['annuler', 'Annuler et rembourser…']);
    if (c.statut === 'en_transit') b.push(['relance', 'Relancer le vendeur'], ['perdu', 'Déclarer le colis perdu…']);
    if (c.statut === 'livree') b.push(['prolonger', 'Prolonger de 3 jours']);
    if (c.statut === 'conclue') b.push(['verser', `Verser ${eur2(c.prix)} au vendeur`]);
    return b.map(([k, t], i) => `<button class="btn ${i === 0 && k !== 'annuler' ? 'btn-noir ' : ''}btn-petit" type="button" data-bo="${k}" data-c="${c.id}">${t}</button>`).join('');
  }
  function vueCommande(s, id) {
    const c = s.commandes[id];
    if (!c) return `${tete('Commandes', 'Commande introuvable')}`;
    const p = P[c.p];
    const l = Object.values(s.litiges).find((x) => x.c === c.id);
    const argent = BLOQUEE.includes(c.statut) ? 'Bloqué par Respray' : c.statut === 'conclue' ? 'À verser au vendeur' : c.statut === 'versee' ? `Versé au vendeur le ${fJour.format(c.versee)}` : 'Remboursé à l\'acheteur';
    return `${tete(`Commande ${c.id}`, esc(nomC(c)), pillC(c))}
      <div class="bo-grille">
        <div>
          <section class="bo-bloc"><h2 class="bo-h2">Ce qui s'est passé</h2>
            <ol class="bo-chrono">${chronologie(s, c).map((e) => `<li class="${e.equipe ? 'bo-equipe' : ''}"><span class="bo-chrono-t">${date(e.t)}</span><span>${e.lien ? `<a class="bo-lien" href="#panel/${e.lien}">${esc(e.texte)}</a>` : esc(e.texte)}${e.par ? `<small> · ${esc(Journal.qui(e.par))}</small>` : ''}</span></li>`).join('')}</ol>
            ${c.statut === 'livree' ? `<p class="aide">Fin de la vérification : ${date(finVerif(c))}. Sans réclamation d'ici là, la vente est conclue.</p>` : ''}
            ${retardEnvoi(c) > 0 ? `<p class="p-alerte">Le vendeur devait envoyer avant le ${fJour.format(c.payee + 5 * JOUR)}. Vous pouvez annuler la vente : l'acheteur est remboursé en entier.</p>` : ''}
            ${immobile(c) > 6 ? `<p class="p-alerte">Aucun mouvement depuis ${Math.floor(immobile(c))} jours. Au-delà de 10 jours, le colis peut être déclaré perdu : l'acheteur est remboursé et le vendeur payé par l'assurance.</p>` : ''}
            <div class="bo-actions">${actionsCommande(c)}${l ? `<a class="btn btn-petit" href="#panel/litiges/${l.id}">Voir le litige ${l.id}</a>` : ''}</div>
          </section>
          ${notesDe(s, c.id, 'commandes/' + c.id)}
        </div>
        <div>
          <section class="bo-bloc bo-fiche"><div class="bo-fiche-photos">${['face', 'dessous', 'niveau'].map((v) => vignette(c, v)).join('')}</div>
            <dl class="bo-dl"><div><dt>Parfum</dt><dd>${esc(p.maison)} · ${esc(p.nom)}, ${c.ml} ml, reste ~${c.niveau} %</dd></div><div><dt>Code lot</dt><dd>${esc(c.lot)}</dd></div><div><dt>Livraison</dt><dd>${c.mode === 'envoi' ? `Point relais${c.suivi ? ` · <span class="bo-mono">${c.suivi.numero}</span>` : ''}` : 'Remise en main propre'}</dd></div></dl></section>
          <section class="bo-bloc"><h2 class="bo-h2">Les personnes</h2>${carteMembre(s, c.v, 'Vendeur')}${carteMembre(s, c.b, 'Acheteur')}</section>
          <section class="bo-bloc"><h2 class="bo-h2">L'argent</h2>
            <dl class="bo-dl bo-argent"><div><dt>Prix</dt><dd>${eur2(c.prix)}</dd></div><div><dt>Protection acheteur</dt><dd>${eur2(protection(c.prix))}</dd></div>${c.mode === 'envoi' ? `<div><dt>Livraison</dt><dd>${eur2(ENVOI)}</dd></div>` : ''}<div class="bo-total"><dt>Payé par l'acheteur</dt><dd>${eur2(total(c))}</dd></div><div><dt>Pour le vendeur</dt><dd>${eur2(c.prix)} · commission 0 €</dd></div></dl>
            <p class="bo-sous">${argent}</p></section>
        </div>
      </div>`;
  }
  function carteMembre(s, id, role) {
    const m = s.membres[id];
    return `<a class="bo-personne" href="#panel/membres/${id}"><span class="avatar" aria-hidden="true">${esc(m.pseudo[0].toUpperCase())}</span><span><small>${role}</small><strong>@${esc(m.pseudo)}</strong><small>${esc(m.nom)} · ${esc(m.ville)}</small></span>${m.statut !== 'actif' ? pastille(STATUTS_M[m.statut][0], STATUTS_M[m.statut][1]) : ''}</a>`;
  }

  /* Envois */
  function vueEnvois(s, onglet) {
    const cs = Object.values(s.commandes).filter((c) => c.mode === 'envoi');
    const aEnvoyer = cs.filter((c) => c.statut === 'a_envoyer').sort((x, y) => x.payee - y.payee);
    const transit = cs.filter((c) => c.statut === 'en_transit').sort((x, y) => derniereEtape(x) - derniereEtape(y));
    const livres = cs.filter((c) => c.statut === 'livree' || c.statut === 'litige').sort((x, y) => x.livree - y.livree);
    let liste;
    let corps;
    if (onglet === 'transit') {
      liste = transit;
      corps = liste.length ? `<div class="bo-table-cadre"><table class="bo-table"><thead><tr><th>Commande</th><th>Suivi</th><th>Dernière étape</th><th>Statut</th><th></th></tr></thead><tbody>${liste.map((c) => `<tr><td><a class="bo-ligne-a" href="#panel/commandes/${c.id}"><span class="bo-vignette">${vignette(c)}</span><span><strong>${esc(nomC(c))}</strong><small>${c.id}</small></span></a></td><td class="bo-mono">${c.suivi.numero}</td><td>${esc(c.suivi.etapes[c.suivi.etapes.length - 1].texte)}<small class="bo-sous">${ilya(derniereEtape(c))}</small></td><td>${pillC(c)}</td><td class="bo-droite">${immobile(c) > 6 ? `<button class="btn btn-petit" type="button" data-bo="perdu" data-c="${c.id}">Déclarer perdu…</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : vide('Aucun colis en route.');
    } else if (onglet === 'livres') {
      liste = livres;
      corps = liste.length ? `<div class="bo-table-cadre"><table class="bo-table"><thead><tr><th>Commande</th><th>Livrée</th><th>Fin de la vérification</th><th>Statut</th><th></th></tr></thead><tbody>${liste.map((c) => `<tr><td><a class="bo-ligne-a" href="#panel/commandes/${c.id}"><span class="bo-vignette">${vignette(c)}</span><span><strong>${esc(nomC(c))}</strong><small>${c.id}</small></span></a></td><td>${date(c.livree)}</td><td>${c.statut === 'litige' ? '—' : date(finVerif(c))}</td><td>${pillC(c)}</td><td class="bo-droite">${c.statut === 'livree' ? `<button class="btn btn-petit" type="button" data-bo="prolonger" data-c="${c.id}">+ 3 jours</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : vide('Aucun colis en cours de vérification.');
    } else {
      liste = aEnvoyer;
      corps = liste.length ? `<div class="bo-table-cadre"><table class="bo-table"><thead><tr><th>Commande</th><th>Vendeur</th><th>Payée</th><th>À envoyer avant</th><th>Statut</th><th></th></tr></thead><tbody>${liste.map((c) => `<tr><td><a class="bo-ligne-a" href="#panel/commandes/${c.id}"><span class="bo-vignette">${vignette(c)}</span><span><strong>${esc(nomC(c))}</strong><small>${c.id}</small></span></a></td><td>${lienM(s, c.v)}</td><td>${date(c.payee)}</td><td>${fJour.format(c.payee + 5 * JOUR)}</td><td>${pillC(c)}</td><td class="bo-droite"><button class="btn btn-petit" type="button" data-bo="relance" data-c="${c.id}">Relancer</button>${retardEnvoi(c) > 0 ? ` <button class="btn btn-petit" type="button" data-bo="annuler" data-c="${c.id}">Annuler…</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : vide('Rien à envoyer.');
    }
    return `${tete('Envois', 'Envois')}<p class="aide bo-intro">Le vendeur a 5 jours pour envoyer, avec l'étiquette fournie. Un colis immobile plus de 6 jours est signalé ; au-delà de 10, il peut être déclaré perdu.</p>${onglets('envois', [['', 'À envoyer', aEnvoyer.length], ['transit', 'En route', transit.length], ['livres', 'Livrés, en vérification', livres.length]], onglet)}${corps}`;
  }

  /* Litiges */
  function vueLitiges(s, onglet) {
    const ls = Object.values(s.litiges).sort((x, y) => (x.statut === 'clos') - (y.statut === 'clos') || y.ouvert - x.ouvert);
    const ouverts = ls.filter((l) => l.statut !== 'clos');
    const liste = onglet === 'clos' ? ls.filter((l) => l.statut === 'clos') : ouverts;
    return `${tete('Litiges', 'Réclamations des acheteurs')}<p class="aide bo-intro">L'acheteur a 7 jours après la livraison pour signaler un problème ; l'argent reste bloqué tant que le litige est ouvert. Le vendeur a 48 h pour répondre.</p>
      ${onglets('litiges', [['', 'Ouverts', ouverts.length], ['clos', 'Clos', ls.length - ouverts.length]], onglet)}
      ${liste.length ? `<div class="bo-table-cadre"><table class="bo-table"><thead><tr><th>Litige</th><th>Motif</th><th>Acheteur</th><th>Vendeur</th><th>Ouvert</th><th>Statut</th></tr></thead><tbody>${liste.map((l) => {
        const c = s.commandes[l.c];
        const [t, ton] = STATUTS_L[l.statut];
        return `<tr><td><a class="bo-ligne-a" href="#panel/litiges/${l.id}"><span class="bo-vignette">${vignette(c)}</span><span><strong>${esc(nomC(c))}</strong><small>${l.id} · commande ${c.id}</small></span></a></td><td>${MOTIFS[l.motif]}</td><td>${lienM(s, c.b)}</td><td>${lienM(s, c.v)}</td><td>${ilya(l.ouvert)}</td><td>${pastille(t, ton)}${l.decision ? `<small class="bo-sous">${DECISIONS[l.decision]}</small>` : ''}</td></tr>`;
      }).join('')}</tbody></table></div>` : vide('Aucun litige ici.')}`;
  }
  function vueLitige(s, id) {
    const l = s.litiges[id];
    if (!l) return tete('Litiges', 'Litige introuvable');
    const c = s.commandes[l.c];
    const v = s.membres[c.v];
    const [t, ton] = STATUTS_L[l.statut];
    const recu = l.recu || [];
    const comparer = recu.length
      ? `<div class="bo-compare">${recu.map((r) => `<figure><figcaption>Sur l'annonce</figcaption>${vignette(c, r.vue)}</figure><figure><figcaption>${esc(r.texte)}</figcaption><img class="visuel" src="${Dessins.src(r.cle)}" alt="${esc(r.texte)}" width="600" height="750"></figure>`).join('')}</div>${l.lotRecu ? `<p class="p-alerte">Code lot de l'annonce : <strong>${esc(c.lot)}</strong> · code lot du flacon reçu : <strong>${esc(l.lotRecu)}</strong>. Ce n'est pas le même flacon.</p>` : ''}${l.motif === 'niveau' ? `<p class="p-alerte">Annoncé : ~${c.niveau} %. Sur la photo de l'acheteur, la surface tombe vers 45 %.</p>` : ''}`
      : '<p class="aide">L\'acheteur n\'a pas joint de photo.</p>';
    const echanges = [{qui: 'acheteur', texte: l.acheteur, t: l.ouvert}, ...(l.vendeur ? [{qui: 'vendeur', texte: l.vendeur, t: l.repondu}] : []), ...l.echanges].sort((x, y) => x.t - y.t);
    const options = l.motif === 'jamais_recu' || l.motif === 'casse' ? ['assurance', 'demander'] : ['rembourser_retour', 'rembourser', 'refuser', 'demander'];
    const libelles = {rembourser_retour: ['Non conforme, avec retour', `L'acheteur renvoie le flacon avec l'étiquette fournie, payée par le vendeur. Il est remboursé de ${eur2(total(c))} à la réception.`], rembourser: ['Non conforme, sans retour', `L'acheteur est remboursé de ${eur2(total(c))} tout de suite et garde le flacon comme preuve. Pour une contrefaçon.`], refuser: ['Conforme', `La vente est conclue et ${eur2(c.prix)} sont versés au vendeur.`], assurance: ['Problème de transport', `L'acheteur est remboursé de ${eur2(total(c))}, le vendeur payé par l'assurance du transporteur.`], demander: ['Demander une précision', 'Le litige reste ouvert ; votre message part à la personne choisie.']};
    return `${tete(`Litige ${l.id} · commande <a class="bo-lien" href="#panel/commandes/${c.id}">${c.id}</a>`, `${MOTIFS[l.motif]} · ${esc(nomC(c))}`, pastille(t, ton))}
      <div class="bo-grille">
        <div>
          <section class="bo-bloc"><h2 class="bo-h2">Les photos</h2>${comparer}</section>
          <section class="bo-bloc"><h2 class="bo-h2">Les échanges</h2><ol class="bo-echanges">${echanges.map((e) => `<li class="bo-e-${e.qui}"><small>${e.qui === 'equipe' ? esc(Journal.qui(e.par)) + ', équipe' : e.qui === 'acheteur' ? '@' + esc(s.membres[c.b].pseudo) + ', acheteur' : '@' + esc(v.pseudo) + ', vendeur'} · ${date(e.t)}</small><p>${esc(e.texte)}</p></li>`).join('')}</ol>
            ${l.statut === 'attente_vendeur' ? `<p class="aide">Le vendeur a jusqu'au ${date(l.ouvert + 2 * JOUR)} pour répondre${Date.now() > l.ouvert + 2 * JOUR ? ' : le délai est passé, vous pouvez trancher' : ''}.</p>` : ''}</section>
          ${l.statut === 'clos' ? `<section class="bo-bloc"><h2 class="bo-h2">Décision</h2><p>${DECISIONS[l.decision]} · ${l.clos ? date(l.clos) : ''}</p></section>` : `<form class="bo-bloc bo-decision" data-form="bo-decision" data-l="${l.id}"><h2 class="bo-h2">Trancher</h2>
            ${options.map((k, i) => `<label class="bo-option"><input type="radio" name="decision" value="${k}" ${i === 0 ? 'checked' : ''}><span><strong>${libelles[k][0]}</strong><small>${libelles[k][1]}</small></span></label>`).join('')}
            <label class="bo-option bo-option-cible"><span>Pour une demande de précision, l'écrire à</span><select name="cible" class="champ champ-petit"><option value="vendeur">au vendeur</option><option value="acheteur">à l'acheteur</option></select></label>
            ${l.motif === 'contrefacon' ? `<label class="choix bo-exclure"><input type="checkbox" name="exclure"> Exclure @${esc(v.pseudo)} pour de bon (contrefaçon ou parfum dilué) ; ses annonces quittent le site</label>` : ''}
            <label for="msg-${l.id}">Message envoyé à l'acheteur et au vendeur</label>
            <textarea id="msg-${l.id}" name="message" class="champ" rows="3" required>${l.motif === 'contrefacon' ? 'Le code lot du flacon reçu ne correspond pas à celui de l\'annonce. ' : l.motif === 'niveau' ? 'Le niveau visible sur la photo de l\'acheteur est nettement plus bas que celui de l\'annonce. ' : ''}Merci à vous deux pour vos réponses.</textarea>
            <p class="aide">Non conforme : une non-conformité s'ajoute au compte du vendeur (${strikes6mois(v)} sur 6 mois aujourd'hui ; à 2, ses annonces sont suspendues le temps qu'on regarde).</p>
            <button class="btn btn-noir" type="submit">Enregistrer la décision</button></form>`}
        </div>
        <div>
          <section class="bo-bloc"><h2 class="bo-h2">Les personnes</h2>${carteMembre(s, c.b, 'Acheteur')}${carteMembre(s, c.v, 'Vendeur')}<p class="bo-sous">Vendeur : ${v.conformes != null ? `${v.conformes} % de ventes conformes · ` : ''}${strikes6mois(v)} non-conformité${strikes6mois(v) > 1 ? 's' : ''} sur 6 mois</p></section>
          <section class="bo-bloc"><h2 class="bo-h2">L'argent</h2><p><strong>${eur2(total(c))}</strong> ${BLOQUEE.includes(c.statut) ? 'bloqués tant que le litige est ouvert' : c.statut === 'remboursee' ? 'remboursés à l\'acheteur' : 'débloqués'}</p></section>
          ${notesDe(s, l.id, 'litiges/' + l.id)}
        </div>
      </div>`;
  }

  /* Membres */
  function vueMembres(s, filtre) {
    const ms = Object.values(s.membres);
    const groupes = {'': ms, vendeurs: ms.filter((m) => m.vendeur), acheteurs: ms.filter((m) => !m.vendeur), surveiller: ms.filter((m) => m.statut !== 'actif' || strikes6mois(m) >= 1 || (m.vendeur && !m.ventes))};
    const liste = groupes[filtre || ''] || ms;
    return `${tete('Membres', 'Membres')}${onglets('membres', [['', 'Tous', ms.length], ['vendeurs', 'Vendeurs', groupes.vendeurs.length], ['acheteurs', 'Acheteurs', groupes.acheteurs.length], ['surveiller', 'À surveiller', groupes.surveiller.length]], filtre)}
      <div class="bo-table-cadre"><table class="bo-table"><thead><tr><th>Membre</th><th>E-mail</th><th>Ville</th><th>Activité</th><th>Statut</th></tr></thead><tbody>${liste
        .map((m) => {
          const ventes = Object.values(s.commandes).filter((c) => c.v === m.id).length;
          const achats = Object.values(s.commandes).filter((c) => c.b === m.id).length;
          return `<tr><td><a class="bo-ligne-a" href="#panel/membres/${m.id}"><span class="avatar" aria-hidden="true">${esc(m.pseudo[0].toUpperCase())}</span><span><strong>@${esc(m.pseudo)}</strong><small>${esc(m.nom)}</small></span></a></td><td class="bo-mono">${esc(m.email)}</td><td>${esc(m.ville)}</td><td>${m.vendeur ? `${m.ventes} ventes${m.note ? ` · ★ ${nb(m.note, 1)}` : ''}` : `${achats} achat${achats > 1 ? 's' : ''}`}${m.vendeur && ventes ? `<small class="bo-sous">${ventes} commande${ventes > 1 ? 's' : ''} ici</small>` : ''}</td><td>${pastille(STATUTS_M[m.statut][0], STATUTS_M[m.statut][1])}${strikes6mois(m) ? `<small class="bo-sous">${strikes6mois(m)} non-conformité${strikes6mois(m) > 1 ? 's' : ''}</small>` : ''}</td></tr>`;
        })
        .join('')}</tbody></table></div>`;
  }
  function vueMembre(s, id) {
    const m = s.membres[id];
    if (!m) return tete('Membres', 'Membre introuvable');
    const ventes = Object.values(s.commandes).filter((c) => c.v === id).sort((x, y) => y.payee - x.payee);
    const achats = Object.values(s.commandes).filter((c) => c.b === id).sort((x, y) => y.payee - x.payee);
    const annonces = BASE_ANNONCES.filter((a) => a.v === id);
    const litiges = Object.values(s.litiges).filter((l) => [s.commandes[l.c].v, s.commandes[l.c].b].includes(id));
    const [t, ton] = STATUTS_M[m.statut];
    return `${tete(m.vendeur ? 'Vendeur' : 'Acheteur', `@${esc(m.pseudo)}`, pastille(t, ton))}
      <div class="bo-grille">
        <div>
          ${m.statut !== 'actif' ? `<p class="p-alerte">${t} : ${esc(m.raisonStatut || '')}</p>` : ''}
          ${m.vendeur && m.ventes ? `<ul class="vendeur-chiffres bo-chiffres"><li><strong>${m.conformes} %</strong><small>de ventes conformes</small></li><li><strong>${nb(m.envoi, 1)} j</strong><small>pour envoyer</small></li><li><strong>★ ${nb(m.note, 1)}</strong><small>${m.avis} avis</small></li><li><strong>${strikes6mois(m)}</strong><small>non-conformité${strikes6mois(m) > 1 ? 's' : ''} sur 6 mois</small></li></ul>` : ''}
          ${annonces.length ? `<section class="bo-bloc"><h2 class="bo-h2">Annonces</h2><div class="bo-table-cadre"><table class="bo-table"><tbody>${annonces.map((a) => `<tr><td><a class="bo-ligne-a" href="#annonce-${a.id}"><span class="bo-vignette">${photo(a, 'face')}</span><span><strong>${esc(P[a.p].nom)}</strong><small>${a.id} · ${a.ml} ml</small></span></a></td><td>${eur(a.prix)}</td><td>${s.retraits[a.id] ? pastille('Retirée', 'gris') : m.statut !== 'actif' ? pastille('Masquée', 'attente') : pastille('En ligne', 'ok')}</td></tr>`).join('')}</tbody></table></div></section>` : ''}
          ${ventes.length ? `<section class="bo-bloc"><h2 class="bo-h2">Ventes</h2>${tableCommandes(s, ventes)}</section>` : ''}
          ${achats.length ? `<section class="bo-bloc"><h2 class="bo-h2">Achats</h2>${tableCommandes(s, achats)}</section>` : ''}
          ${litiges.length ? `<section class="bo-bloc"><h2 class="bo-h2">Litiges</h2><ul class="bo-liens">${litiges.map((l) => `<li><a class="bo-lien" href="#panel/litiges/${l.id}">${l.id} · ${MOTIFS[l.motif]} · ${STATUTS_L[l.statut][0]}</a></li>`).join('')}</ul></section>` : ''}
          <section class="bo-bloc"><h2 class="bo-h2">Messages de l'équipe</h2>${m.messages.length ? `<ol class="bo-echanges">${m.messages.map((x) => `<li class="bo-e-equipe"><small>${esc(Journal.qui(x.par))}, équipe · ${date(x.t)}</small><p>${esc(x.texte)}</p></li>`).join('')}</ol>` : '<p class="aide">Aucun message envoyé.</p>'}
            <form class="bo-note" data-form="bo-message" data-m="${id}"><label class="vh" for="msg-${id}">Écrire à @${esc(m.pseudo)}</label><textarea id="msg-${id}" name="texte" class="champ" rows="2" placeholder="Écrire à @${esc(m.pseudo)}… (il le reçoit par e-mail et dans l'appli)" required></textarea><button class="btn btn-petit" type="submit">Envoyer</button></form></section>
        </div>
        <div>
          <section class="bo-bloc"><h2 class="bo-h2">Identité</h2><dl class="bo-dl"><div><dt>Nom</dt><dd>${esc(m.nom)}</dd></div><div><dt>E-mail</dt><dd class="bo-mono">${esc(m.email)}</dd></div><div><dt>Téléphone</dt><dd>${esc(m.tel)}</dd></div><div><dt>Ville</dt><dd>${esc(m.ville)}</dd></div><div><dt>Inscrit</dt><dd>${fJour.format(m.inscrit)} ${new Date(m.inscrit).getFullYear()}</dd></div>${m.vendeur ? `<div><dt>Compte de versement</dt><dd>${esc(m.iban || '—')}</dd></div><div><dt>Identité</dt><dd>${/attente/i.test(m.iban || '') ? pastille('En attente de vérification', 'attente') : pastille('Vérifiée par Stripe', 'ok')}</dd></div>` : ''}</dl></section>
          <section class="bo-bloc"><h2 class="bo-h2">Compte</h2><div class="bo-actions bo-actions-col">
            ${m.statut === 'actif' ? `<button class="btn btn-petit" type="button" data-bo="suspendre" data-m="${id}">Suspendre…</button><button class="btn btn-petit bo-danger" type="button" data-bo="exclure" data-m="${id}">Exclure…</button>` : `<button class="btn btn-noir btn-petit" type="button" data-bo="reactiver" data-m="${id}">Réactiver le compte</button>`}
          </div><p class="aide">Suspendu : ses annonces sont masquées et il ne peut plus vendre, le temps qu'on regarde. Exclu : définitif.</p></section>
          ${notesDe(s, id, 'membres/' + id)}
        </div>
      </div>`;
  }

  /* Maisons et parfums */
  function carteProposition(s, x) {
    const liste = x.type === 'maison' ? toutesMaisons(s) : parfumsDe(s, x.maison).map((y) => y.nom);
    const r = ressemble(x.tape, liste);
    return `<article class="bo-carte bo-prop">
      <div class="p-prop-tete"><span class="pastille">${x.type === 'maison' ? 'Maison' : 'Parfum'}</span><p class="aide">Proposé${x.type === 'maison' ? 'e' : ''} par @${esc(x.par)} · ${ilya(x.t)} · annonce « ${esc(x.annonce)} »${x.maison ? ` · maison ${esc(x.maison)}` : ''}</p></div>
      <p class="p-tape">Tapé : <q>${esc(x.tape)}</q></p>
      ${r ? `<p class="p-ressemble">${ico('loupe')}<span>${r.exact ? 'Existe déjà' : 'Ressemble à'} <strong>${esc(r.nom)}</strong>, déjà dans la liste.</span> <button class="btn btn-petit" type="button" data-bo="fusionner" data-pid="${x.id}" data-vers="${esc(r.nom)}">C'est la même : corriger l'annonce</button></p>` : ''}
      <div class="p-actions">
        <label for="n-${x.id}">Nom à ajouter, avec la bonne orthographe</label>
        <input id="n-${x.id}" class="champ" value="${esc(proprement(x.tape))}">
        <button class="btn btn-noir btn-petit" type="button" data-bo="ajouter-prop" data-pid="${x.id}">Ajouter à la liste</button>
        <button class="btn btn-petit" type="button" data-bo="refuser-prop" data-pid="${x.id}">Refuser</button>
      </div>
    </article>`;
  }
  const toutesMaisons = (s) => [...new Set([...maisonsCatalogue(), ...s.maisons.map((m) => m.nom)])].sort((x, y) => x.localeCompare(y, 'fr'));
  const parfumsDe = (s, m) => [...PARFUMS.filter((p) => p.maison === m).map((p) => ({nom: p.nom, conc: p.conc, catalogue: true})), ...s.parfums.filter((x) => x.maison === m)];
  function vueMaisons(s, onglet) {
    const ajoutees = Object.fromEntries(s.maisons.map((m) => [m.nom, m]));
    let corps;
    if (onglet === 'liste') {
      corps = `<form class="bo-ajout" data-form="bo-maison"><label for="bo-nouvelle">Ajouter une maison directement</label><input id="bo-nouvelle" name="nom" class="champ" placeholder="Par exemple : Ormonde Jayne" required><button class="btn btn-noir btn-petit" type="submit">Ajouter</button></form>
        <div class="bo-table-cadre"><table class="bo-table"><thead><tr><th>Maison</th><th>Parfums</th><th>Annonces</th><th>Origine</th><th></th></tr></thead><tbody>${toutesMaisons(s)
          .map((nom) => {
            const aj = ajoutees[nom];
            const ps = parfumsDe(s, nom);
            const nA = ANNONCES.filter((a) => P[a.p] && P[a.p].maison === nom).length;
            return `<tr><td><strong>${esc(nom)}</strong>${ps.length ? `<small class="bo-sous">${ps.map((p) => esc(p.nom)).join(', ')}</small>` : ''}</td><td>${ps.length}</td><td>${nA}</td><td>${aj ? `Ajoutée ${ilya(aj.le)} par ${esc(Journal.qui(aj.par))}${aj.proposee ? `<small class="bo-sous">proposée par @${esc(aj.proposee)}</small>` : ''}` : '<span class="aide">Catalogue</span>'}</td><td class="bo-droite">${aj ? `<button class="btn btn-petit" type="button" data-bo="renommer" data-nom="${esc(nom)}">Corriger le nom…</button>` : ''} <button class="btn btn-petit" type="button" data-bo="ajouter-parfum" data-nom="${esc(nom)}">+ Parfum…</button></td></tr>`;
          })
          .join('')}</tbody></table></div>`;
    } else corps = s.propositions.length ? s.propositions.map((x) => carteProposition(s, x)).join('') : vide('Aucune proposition en attente.');
    return `${tete('Catalogue', 'Maisons et parfums')}<p class="aide bo-intro">Quand un vendeur ne trouve pas sa maison ou son parfum, il l'écrit ; vous corrigez l'orthographe et les majuscules, et l'ajoutez pour les vendeurs suivants.</p>${onglets('maisons', [['', 'Proposés', s.propositions.length], ['liste', 'Toute la liste', toutesMaisons(s).length]], onglet)}${corps}`;
  }

  /* Paiements */
  function vuePaiements(s) {
    const cs = Object.values(s.commandes);
    const bloque = cs.filter((c) => BLOQUEE.includes(c.statut));
    const aVerser = cs.filter((c) => c.statut === 'conclue');
    const verses = cs.filter((c) => c.statut === 'versee').sort((x, y) => y.versee - x.versee);
    const rembourses = cs.filter((c) => ['annulee', 'remboursee'].includes(c.statut));
    const somme = (l, f) => l.reduce((x, c) => x + f(c), 0);
    const ligne = (c, montant, quand, extra = '') => `<tr><td><a class="bo-ligne-a" href="#panel/commandes/${c.id}"><span class="bo-vignette">${vignette(c)}</span><span><strong>${esc(nomC(c))}</strong><small>${c.id}</small></span></a></td><td>${lienM(s, c.v)}</td><td>${eur2(montant)}</td><td>${quand}</td><td class="bo-droite">${extra}</td></tr>`;
    return `${tete('Argent', 'Paiements')}
      <div class="bo-tuiles">
        <div class="bo-tuile"><strong>${eur2(somme(bloque, total))}</strong><span>bloqués (${bloque.length} commandes)</span></div>
        <div class="bo-tuile ${aVerser.length ? 'bo-t-attente' : ''}"><strong>${eur2(somme(aVerser, (c) => c.prix))}</strong><span>à verser aux vendeurs</span></div>
        <div class="bo-tuile"><strong>${eur2(somme(verses, (c) => c.prix))}</strong><span>versés</span></div>
        <div class="bo-tuile"><strong>${eur2(somme(cs.filter((c) => !['annulee', 'remboursee'].includes(c.statut)), (c) => protection(c.prix)))}</strong><span>de protection acheteur (recettes)</span></div>
      </div>
      <section class="bo-bloc"><div class="bo-bloc-tete"><h2 class="bo-h2">À verser</h2>${aVerser.length > 1 ? `<button class="btn btn-noir btn-petit" type="button" data-bo="tout-verser">Tout verser (${eur2(somme(aVerser, (c) => c.prix))})</button>` : ''}</div>
        ${aVerser.length ? `<div class="bo-table-cadre"><table class="bo-table"><tbody>${aVerser.map((c) => ligne(c, c.prix, `conclue ${ilya(c.conclue)}`, `<button class="btn btn-petit" type="button" data-bo="verser" data-c="${c.id}">Verser</button>`)).join('')}</tbody></table></div>` : vide('Rien à verser.')}</section>
      <section class="bo-bloc"><h2 class="bo-h2">Bloqués</h2>${bloque.length ? `<div class="bo-table-cadre"><table class="bo-table"><tbody>${bloque.map((c) => ligne(c, total(c), pillC(c))).join('')}</tbody></table></div>` : vide('Aucun.')}</section>
      <section class="bo-bloc"><h2 class="bo-h2">Versés</h2>${verses.length ? `<div class="bo-table-cadre"><table class="bo-table"><tbody>${verses.map((c) => ligne(c, c.prix, date(c.versee))).join('')}</tbody></table></div>` : vide('Aucun.')}</section>
      <section class="bo-bloc"><h2 class="bo-h2">Remboursés</h2>${rembourses.length ? `<div class="bo-table-cadre"><table class="bo-table"><tbody>${rembourses.map((c) => ligne(c, total(c), date(c.annulee || c.remboursee), `<small class="bo-sous">${esc(c.raison || '')}</small>`)).join('')}</tbody></table></div>` : vide('Aucun.')}</section>`;
  }

  /* Journal */
  const lignesJournal = (liste) => (liste.length ? `<ol class="bo-journal">${liste.map((j) => `<li><span class="avatar" aria-hidden="true">${esc(Journal.qui(j.par)[0])}</span><span><strong>${esc(Journal.qui(j.par))}</strong> ${j.lien ? `<a class="bo-lien" href="#panel/${j.lien}">${j.texte}</a>` : j.texte}<small>${date(j.t)}${j.base ? '' : ' · ' + ilya(j.t)}</small></span></li>`).join('')}</ol>` : vide('Aucune action pour l\'instant.'));
  function vueJournal(s) {
    return `${tete('Traçabilité', 'Journal')}<p class="aide bo-intro">Chaque action de l'équipe, signée et datée. ${Journal.lien() === 'partage' ? 'Il est partagé : toute l\'équipe voit le même.' : 'Sur la page publiée, il est partagé avec l\'équipe ; ici, il est gardé dans ce navigateur.'}</p>${lignesJournal(s.journal)}`;
  }

  /* la recherche, partout */
  function chercher(s, q) {
    const n = cle(q);
    if (n.length < 2) return [];
    const r = [];
    Object.values(s.commandes).forEach((c) => {
      if (cle(`${c.id} ${nomC(c)} ${c.lot} ${c.suivi ? c.suivi.numero : ''} ${s.membres[c.v].pseudo} ${s.membres[c.b].pseudo}`).includes(n)) r.push({lien: 'commandes/' + c.id, t: `${c.id} · ${nomC(c)}`, s: STATUTS_C[c.statut][0], type: 'Commande'});
    });
    Object.values(s.membres).forEach((m) => {
      if (cle(`${m.pseudo} ${m.nom} ${m.email} ${m.ville}`).includes(n)) r.push({lien: 'membres/' + m.id, t: `@${m.pseudo} · ${m.nom}`, s: m.email, type: m.vendeur ? 'Vendeur' : 'Acheteur'});
    });
    Object.values(s.litiges).forEach((l) => {
      if (cle(`${l.id} ${MOTIFS[l.motif]} ${l.c}`).includes(n)) r.push({lien: 'litiges/' + l.id, t: `${l.id} · ${MOTIFS[l.motif]}`, s: STATUTS_L[l.statut][0], type: 'Litige'});
    });
    [...BASE_ANNONCES, ...s.file].forEach((a) => {
      if (P[a.p] && cle(`${a.id} ${P[a.p].nom} ${P[a.p].maison} ${a.lot}`).includes(n)) r.push({lien: s.file.includes(a) ? 'annonces' : 'annonces/en-ligne', t: `${a.id} · ${P[a.p].nom}, ${a.ml} ml`, s: `code lot ${a.lot}`, type: 'Annonce'});
    });
    toutesMaisons(s).forEach((m) => cle(m).includes(n) && r.push({lien: 'maisons/liste', t: m, s: '', type: 'Maison'}));
    return r.slice(0, 12);
  }

  /* ——— la vue demandée : #panel, #panel/section, #panel/section/id ——— */
  function vue(h) {
    const s = etat();
    const [, section = '', id = ''] = h.split('/');
    const contenu =
      section === 'annonces' ? vueAnnonces(s, id)
      : section === 'commandes' ? (/^c\d+$/.test(id) ? vueCommande(s, id) : vueCommandes(s, id))
      : section === 'envois' ? vueEnvois(s, id)
      : section === 'litiges' ? (/^l\d+$/.test(id) ? vueLitige(s, id) : vueLitiges(s, id))
      : section === 'membres' ? (s.membres[id] ? vueMembre(s, id) : vueMembres(s, id))
      : section === 'maisons' ? vueMaisons(s, id)
      : section === 'paiements' ? vuePaiements(s)
      : section === 'journal' ? vueJournal(s)
      : vueAujourdhui(s);
    return cadre(s, section, contenu);
  }

  /* ——— les actions ——— */
  const confirmer = (titre, texte, champs, bouton, action, data) =>
    ouvrir(`<form data-form="bo-confirmer" data-action="${action}" ${Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')}><h2 class="h2">${titre}</h2><p class="aide">${texte}</p>${champs}<button class="btn btn-noir btn-large" type="submit">${bouton}</button></form>`);
  const choixRaison = (liste, nom = 'raison') => `<label for="bo-raison">Raison</label><select id="bo-raison" name="${nom}" class="champ">${liste.map((r) => `<option>${esc(r)}</option>`).join('')}</select>`;
  async function clic(t) {
    const s = etat();
    const k = t.dataset.bo;
    const id = t.dataset.id;
    const c = t.dataset.c && s.commandes[t.dataset.c];
    const m = t.dataset.m && s.membres[t.dataset.m];
    switch (k) {
      case 'publier': {
        const f = s.file.find((x) => x.id === id);
        const coches = document.querySelectorAll(`[data-check="${id}"]:checked`).length;
        if (coches < CHECKS.length && !confirm(`${CHECKS.length - coches} contrôle${CHECKS.length - coches > 1 ? 's ne sont pas cochés' : ' n\'est pas coché'}. Publier quand même ?`)) return;
        if (await Journal.ajouter('annonce_publiee', {a: id})) message(`${f.nomAffiche || P[f.p].nom} est en ligne. Le vendeur est prévenu.`);
        return;
      }
      case 'refuser':
        return confirmer('Refuser l\'annonce', 'Le vendeur reçoit la raison, et peut corriger puis soumettre à nouveau.', choixRaison(RAISONS), 'Refuser l\'annonce', 'refuser', {id});
      case 'demander-photo':
        return confirmer('Demander une photo', 'L\'annonce reste hors ligne ; le vendeur reçoit votre message et ajoute la photo depuis l\'appli.', `<label for="bo-quelle">Quelle photo</label><select id="bo-quelle" name="quelle" class="champ">${PHOTOS.map((x) => `<option>${esc(x.t)}</option>`).join('')}</select><label for="bo-texte">Message</label><textarea id="bo-texte" name="texte" class="champ" rows="3">Bonjour, pouvez-vous reprendre cette photo, plus nette et en pleine lumière ? Merci !</textarea>`, 'Envoyer la demande', 'photo', {id});
      case 'retirer':
        return confirmer('Retirer l\'annonce du site', 'Elle disparaît du site tout de suite ; le vendeur est prévenu. Vous pourrez la remettre.', choixRaison(RAISONS_RETRAIT), 'Retirer l\'annonce', 'retirer', {id});
      case 'remettre':
        if (await Journal.ajouter('annonce_remise', {a: id})) message('L\'annonce est de nouveau en ligne.');
        return;
      case 'relance':
        if (await Journal.ajouter('relance', {c: c.id})) message(`@${s.membres[c.v].pseudo} est relancé par e-mail et dans l'appli.`);
        return;
      case 'annuler':
        return confirmer(`Annuler la commande ${c.id}`, `L'acheteur est remboursé en entier (${eur2(total(c))}). Le vendeur est prévenu, et l'annulation est comptée sur son profil.`, choixRaison(['Pas d\'envoi dans les 5 jours', 'Le vendeur l\'avait vendu ailleurs', 'Demande de l\'acheteur et du vendeur']), 'Annuler et rembourser', 'annuler', {c: c.id});
      case 'perdu':
        return confirmer(`Déclarer perdu le colis ${c.suivi.numero}`, `L'acheteur est remboursé (${eur2(total(c))}) et le vendeur payé (${eur2(c.prix)}) : l'assurance du transporteur couvre la perte.`, '', 'Déclarer perdu', 'perdu', {c: c.id});
      case 'prolonger':
        if (await Journal.ajouter('prolongation', {c: c.id, jours: 3})) message('Vérification prolongée de 3 jours. L\'acheteur et le vendeur sont prévenus.');
        return;
      case 'verser':
        if (await Journal.ajouter('versement', {c: c.id})) message(`Virement de ${eur2(c.prix)} envoyé à @${s.membres[c.v].pseudo}.`);
        return;
      case 'tout-verser': {
        const cs = Object.values(s.commandes).filter((x) => x.statut === 'conclue').map((x) => x.id);
        if (await Journal.ajouter('versement', {cs})) message(`${cs.length} virements envoyés.`);
        return;
      }
      case 'suspendre':
        return confirmer(`Suspendre @${m.pseudo}`, 'Ses annonces sont masquées et il ne peut plus vendre, le temps qu\'on regarde. Ses ventes en cours continuent.', choixRaison(['Deux non-conformités en six mois', 'Envois en retard à répétition', 'Signalements d\'acheteurs', 'Vérification d\'identité à refaire']), 'Suspendre', 'statut', {m: m.id, statut: 'suspendu'});
      case 'exclure':
        return confirmer(`Exclure @${m.pseudo}`, 'Définitif : ses annonces quittent le site et il ne peut plus se réinscrire avec cette identité.', choixRaison(['Contrefaçon', 'Parfum dilué', 'Fraude au paiement', 'Comportement abusif']), 'Exclure', 'statut', {m: m.id, statut: 'exclu'});
      case 'reactiver':
        if (await Journal.ajouter('statut_membre', {m: m.id, statut: 'actif'})) message(`@${m.pseudo} est réactivé.`);
        return;
      case 'ajouter-prop': {
        const x = s.propositions.find((y) => y.id === t.dataset.pid);
        const nom = document.getElementById('n-' + x.id).value.trim();
        if (!nom) return;
        if (x.type === 'maison') {
          if (toutesMaisons(s).includes(nom)) return message(`${nom} est déjà dans la liste.`);
          if (await Journal.ajouter('maison_ajoutee', {nom, pid: x.id})) message(`${nom} est ajoutée à la liste. Les prochains vendeurs pourront la choisir.`);
        } else if (await Journal.ajouter('parfum_ajoute', {maison: x.maison, nom, conc: x.conc || '', pid: x.id})) message(`${nom} est ajouté aux parfums de ${x.maison}.`);
        return;
      }
      case 'refuser-prop':
        if (await Journal.ajouter('proposition_refusee', {pid: t.dataset.pid})) message('Proposition refusée.');
        return;
      case 'fusionner':
        if (await Journal.ajouter('proposition_fusionnee', {pid: t.dataset.pid, vers: t.dataset.vers})) message(`Annonce corrigée : ${t.dataset.vers}.`);
        return;
      case 'renommer':
        return confirmer(`Corriger « ${t.dataset.nom} »`, 'Le nom change partout : dans la liste des vendeurs et sur les annonces.', `<label for="bo-nom">Nom correct</label><input id="bo-nom" name="nom" class="champ" value="${esc(t.dataset.nom)}" required>`, 'Corriger', 'renommer', {ancien: t.dataset.nom});
      case 'ajouter-parfum':
        return confirmer(`Ajouter un parfum chez ${t.dataset.nom}`, 'Il apparaîtra dans la liste des parfums de cette maison, dans le formulaire Vendre.', `<label for="bo-nom">Nom du parfum</label><input id="bo-nom" name="nom" class="champ" required><label for="bo-conc">Concentration</label><select id="bo-conc" name="conc" class="champ"><option>Eau de parfum</option><option>Eau de toilette</option><option>Extrait de parfum</option><option>Eau de Cologne</option></select>`, 'Ajouter', 'parfum', {maison: t.dataset.nom});
      case 'zoom':
        return ouvrir(`<h2 class="h2">${esc(t.dataset.titre)}</h2><div class="bo-zoom">${photo({...(A[t.dataset.src] || s.file.find((x) => x.id === t.dataset.src) || {}), id: t.dataset.src}, t.dataset.vue)}</div>`, 'modale-large');
      case 'vider':
        if (confirm(Journal.lien() === 'partage' ? 'Effacer tout le journal partagé ? Toute l\'équipe repart de l\'exemple.' : 'Remettre l\'exemple à zéro ?')) {
          await Journal.vider();
          memoire.ecrire('propositions-demo', []);
          message('L\'exemple repart de zéro.');
        }
        return;
      default:
    }
  }
  async function soumettre(f) {
    const d = Object.fromEntries(new FormData(f));
    const x = f.dataset;
    switch (f.dataset.form) {
      case 'bo-note':
        if (await Journal.ajouter('note', {cible: x.cible, lien: x.lien, texte: d.texte.trim()})) message('Note ajoutée.');
        return;
      case 'bo-message':
        if (await Journal.ajouter('message', {m: x.m, texte: d.texte.trim()})) message('Message envoyé.');
        return;
      case 'bo-maison': {
        const nom = proprement(d.nom.trim());
        if (toutesMaisons(etat()).includes(nom)) return message(`${nom} est déjà dans la liste.`);
        if (await Journal.ajouter('maison_ajoutee', {nom})) message(`${nom} est ajoutée à la liste.`);
        return;
      }
      case 'bo-decision':
        if (await Journal.ajouter('decision', {l: x.l, decision: d.decision, cible: d.cible, exclure: d.exclure === 'on', message: d.message.trim()})) message(d.decision === 'demander' ? 'Demande envoyée.' : 'Décision enregistrée. L\'acheteur et le vendeur sont prévenus.');
        return;
      case 'bo-confirmer': {
        fermer();
        const r = d.raison;
        const ok = {
          refuser: () => Journal.ajouter('annonce_refusee', {a: x.id, raison: r}),
          photo: () => Journal.ajouter('photo_demandee', {a: x.id, quelle: d.quelle, texte: d.texte}),
          retirer: () => Journal.ajouter('annonce_retiree', {a: x.id, raison: r}),
          annuler: () => Journal.ajouter('annulation', {c: x.c, raison: r}),
          perdu: () => Journal.ajouter('colis_perdu', {c: x.c}),
          statut: () => Journal.ajouter('statut_membre', {m: x.m, statut: x.statut, raison: r}),
          renommer: () => Journal.ajouter('maison_renommee', {ancien: x.ancien, nom: d.nom.trim()}),
          parfum: () => Journal.ajouter('parfum_ajoute', {maison: x.maison, nom: d.nom.trim(), conc: d.conc}),
        }[x.action];
        if (ok && (await ok())) message('C\'est fait. La personne concernée est prévenue.');
        return;
      }
      default:
    }
  }
  function saisie(input) {
    const box = document.getElementById('bo-resultats');
    if (!box) return;
    const r = chercher(etat(), input.value);
    box.hidden = !input.value.trim();
    box.innerHTML = r.length ? r.map((x) => `<a href="#panel/${x.lien}"><small>${x.type}</small><strong>${esc(x.t)}</strong>${x.s ? `<span>${esc(x.s)}</span>` : ''}</a>`).join('') : '<p class="aide">Aucun résultat.</p>';
  }

  /* ce que le site public demande au back-office */
  function proposer(props, annonce) {
    props.forEach((p) => Journal.ajouter('proposition', {proposition: p}));
    if (annonce) Journal.ajouter('annonce_soumise', {annonce});
  }
  const maisonsAjoutees = () => etat().maisons.map((m) => m.nom);
  const parfumsAjoutes = () => etat().parfums;
  const nbNotifs = () => {
    const n = compteurs(etat());
    return n.annonces + n.litiges + n.envois + n.maisons;
  };

  return {vue, clic, soumettre, saisie, brancher: Journal.brancher, abonner: Journal.abonner, proposer, maisonsAjoutees, parfumsAjoutes, nbNotifs, synchroniser: () => etat()};
}
