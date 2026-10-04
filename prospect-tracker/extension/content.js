// Prospect Tracker v3 : le script injecté dans Gmail.
//
// À l'envoi : chaque lien et le pixel portent l'identifiant de CE mail. Les liens et pixels d'anciens mails
// (réponse dans un fil, mail recopié, modèle) sont ramenés à leur adresse d'origine puis suivis pour le
// nouveau mail. Les réponses tapées dans le fil sont suivies comme les nouveaux messages.
// À la lecture : chaque message suivi affiché dans un fil reçoit son propre statut, lu dans son pixel.
// Quand vous affichez ou cliquez vos propres mails, le serveur en est prévenu et ne les compte pas.
(() => {
  'use strict';
  if (window.__ptV3) return;
  window.__ptV3 = true;

  /* ——— Outils ——— */
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (v) => String(v ?? '').replace(/[&<>'"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[c]));
  const fmtDay = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'short'});
  const fmtTime = new Intl.DateTimeFormat('fr-FR', {hour: '2-digit', minute: '2-digit'});
  const when = (iso) => (iso ? `${fmtDay.format(new Date(iso))} à ${fmtTime.format(new Date(iso))}` : '—');
  function ago(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    const min = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
    if (min < 1) return 'à l’instant';
    if (min < 60) return `il y a ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `il y a ${h} h`;
    const y = new Date(Date.now() - 86400000);
    if (d.toDateString() === y.toDateString()) return `hier à ${fmtTime.format(d)}`;
    return `le ${when(iso)}`;
  }
  const fmtLong = new Intl.DateTimeFormat('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'});
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  const clock = (iso) => (iso ? fmtTime.format(new Date(iso)) : '');
  const shortWhen = (iso) => (!iso ? '' : sameDay(new Date(iso), new Date()) ? clock(iso) : fmtDay.format(new Date(iso)));
  function dayLabel(iso) {
    const d = new Date(iso);
    if (sameDay(d, new Date())) return 'Aujourd’hui';
    if (sameDay(d, new Date(Date.now() - 86400000))) return 'Hier';
    const s = fmtLong.format(d);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  /** n'écrit dans la page que si quelque chose change (sinon l'observateur de Gmail tournerait en boucle) */
  function put(el, {html, cls, label}) {
    if (!el) return;
    if (html !== undefined && el.__ptHtml !== html) { el.innerHTML = html; el.__ptHtml = html; }
    if (cls !== undefined && el.className !== cls) el.className = cls;
    if (label !== undefined && el.getAttribute('aria-label') !== label) el.setAttribute('aria-label', label);
  }
  const times = (n) => (n === 1 ? '1 fois' : `${n} fois`);
  const clicksTxt = (n) => (n === 1 ? '1 clic' : `${n} clics`);
  const ordinal = (n) => (n === 1 ? '1re' : `${n}e`);

  /* ——— Icônes (trait, 24 × 24) ——— */
  const PATHS = {
    tick: '<path d="M4.5 12.5l4.5 4.5L19.5 6.5"/>',
    ticks: '<path d="M1.5 12.5L6 17 16.5 6.5"/><path d="M10 15.5l1.5 1.5L22 6.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.75"/>',
    click: '<path d="M9.5 9.5l10 4-4.2 1.5-1.6 4.4z"/><path d="M5.5 5.5l1.7 1.7M10 3.5v2.3M3.5 10h2.3"/>',
    link: '<path d="M10 13.5a3.75 3.75 0 0 0 5.3.2l2.9-2.9a3.75 3.75 0 0 0-5.3-5.3l-1.2 1.2"/><path d="M14 10.5a3.75 3.75 0 0 0-5.3-.2l-2.9 2.9a3.75 3.75 0 0 0 5.3 5.3l1.2-1.2"/>',
    send: '<path d="M4 11.8L20.5 4l-7.8 16.5-2.1-6.6z"/><path d="M10.6 13.9L20.5 4"/>',
    refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4.2h-4.2"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    back: '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
    next: '<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
    search: '<circle cx="11" cy="11" r="6.25"/><path d="M15.6 15.6l4.4 4.4"/>',
    shield: '<path d="M12 3.5l7 2.6v5.5c0 4.3-3 7.7-7 8.9-4-1.2-7-4.6-7-8.9V6.1z"/><path d="M9 12l2.2 2.2L15.2 10"/>',
    warn: '<path d="M12 4.5l8.5 15h-17z"/><path d="M12 10.5v4M12 17.2v.3"/>',
    inbox: '<path d="M3.5 13.5l2.6-7.2A2 2 0 0 1 8 5h8a2 2 0 0 1 1.9 1.3l2.6 7.2V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18z"/><path d="M3.5 13.5h4.5l1.5 2.5h5l1.5-2.5h4.5"/>',
  };
  const icon = (name) => `<svg class="pt-i pt-i-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`;
  const logo = (cls = '') => `<span class="pt-logo ${cls}">${icon('ticks')}</span>`;

  /* ——— Petite mémoire locale : noms des contacts, dernière visite du volet ——— */
  const store = {
    async get(key) {
      try {
        return (await chrome.storage.local.get(key))[key];
      } catch {
        return undefined;
      }
    },
    set(obj) {
      try {
        chrome.storage.local.set(obj).catch?.(() => {});
      } catch {
        // stockage indisponible : la mémoire de la page suffit
      }
    },
  };

  function ask(message) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) resolve({ok: false, error: chrome.runtime.lastError.message});
          else resolve(response || {ok: false});
        });
      } catch (err) {
        // l'extension a été rechargée : il faut recharger Gmail
        resolve({ok: false, error: 'Rechargez Gmail (l’extension a été mise à jour)'});
      }
    });
  }

  /** message façon Gmail, en bas à gauche */
  function toast(message, kind = 'info') {
    document.querySelector('.pt-toast')?.remove();
    const el = document.createElement('div');
    el.className = `pt-toast pt-ui pt-toast-${kind}`;
    el.setAttribute('role', 'status');
    el.innerHTML = `${kind === 'warn' ? `<span class="pt-toast-ico">${icon('warn')}</span>` : logo()}<span class="pt-toast-txt"></span>`;
    el.querySelector('.pt-toast-txt').textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('pt-toast-in')));
    setTimeout(() => {
      el.classList.remove('pt-toast-in');
      setTimeout(() => el.remove(), 300);
    }, kind === 'warn' ? 9000 : 4000);
  }

  let config = {apiBase: '', trackingDefault: true, hasToken: false};
  let marker = ''; // hôte + chemin du serveur de suivi : reconnaît ses adresses où qu'elles soient

  async function loadConfig() {
    const r = await ask({type: 'config'});
    if (!r.ok) return;
    config = r;
    try {
      const u = new URL(r.apiBase);
      marker = u.host + u.pathname;
    } catch {
      marker = '';
    }
  }

  /** le compte Gmail affiché (« Boîte de réception - moi@gmail.com - Gmail ») */
  function account() {
    const m = document.title.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (m) return m[0].toLowerCase();
    const a = document.querySelector('a[aria-label*="@"]');
    const n = a?.getAttribute('aria-label')?.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return n ? n[0].toLowerCase() : '';
  }

  /* ——— Les adresses du serveur de suivi ——— */
  const decode = (s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  };
  const isOurs = (s) => Boolean(marker && s && (s.includes(marker) || decode(s).includes(marker)));
  const clickUrl = (id, target) => `${config.apiBase}?action=click&id=${encodeURIComponent(id)}&u=${encodeURIComponent(target)}`;
  const pixelUrl = (id) => `${config.apiBase}?action=open&id=${encodeURIComponent(id)}`;

  /** l'adresse d'origine d'un lien : sans la redirection de Google, sans un ancien suivi */
  function originalUrl(href) {
    let u = href || '';
    for (let i = 0; i < 4; i++) {
      let p;
      try {
        p = new URL(u);
      } catch {
        return u;
      }
      if (/^(www\.)?google\.[a-z.]+$/i.test(p.hostname) && p.pathname === '/url') {
        const q = p.searchParams.get('q') || p.searchParams.get('url');
        if (q) { u = q; continue; }
      }
      if (isOurs(p.href) && p.searchParams.get('action') === 'click' && p.searchParams.get('u')) {
        u = p.searchParams.get('u');
        continue;
      }
      break;
    }
    return u;
  }

  /** l'identifiant porté par l'adresse d'un pixel (directe, ou passée par le proxy d'images de Gmail) */
  function pixelId(src) {
    if (!isOurs(src)) return null;
    const hash = src.indexOf('#');
    const raw = hash >= 0 && !src.slice(0, hash).includes(marker) ? decode(src.slice(hash + 1)) : src;
    try {
      const u = new URL(raw);
      if (u.searchParams.get('action') === 'open' && u.searchParams.get('id')) return u.searchParams.get('id');
      const m = u.pathname.match(/\/(?:open|o|pixel)\/([^/.?#]+)/i);
      return m ? decode(m[1]) : null;
    } catch {
      const m = raw.match(/[?&]action=open&id=([^&#]+)/);
      return m ? decode(m[1]) : null;
    }
  }

  /** l'identifiant porté par un lien suivi (pour reconnaître vos propres clics) */
  function clickId(href) {
    let u = href || '';
    try {
      const p = new URL(u);
      if (/^(www\.)?google\.[a-z.]+$/i.test(p.hostname) && p.pathname === '/url') u = p.searchParams.get('q') || u;
      const t = new URL(u);
      return isOurs(t.href) && t.searchParams.get('action') === 'click' ? t.searchParams.get('id') : null;
    } catch {
      return null;
    }
  }

  /* ——— Les données ——— */
  let emails = [];
  const statsById = new Map();
  let lastFetch = 0;

  async function refreshData(force = false) {
    if (!force && Date.now() - lastFetch < 5000) return;
    lastFetch = Date.now();
    const r = await ask({type: 'refresh', force});
    if (r.ok) {
      emails = r.emails || [];
      for (const e of emails) statsById.set(e.id, e);
    }
    // les messages affichés dont le mail est trop ancien pour la liste
    const missing = [...new Set(displayedIds())].filter((id) => !statsById.has(id));
    if (missing.length) {
      const s = await ask({type: 'stats', ids: missing});
      if (s.ok) for (const e of s.emails || []) statsById.set(e.id, e);
    }
    paintAll();
    if (panelOpen && !selectedId) renderTab();
  }

  /* ——— Statuts ——— */
  const opened = (e) => (e?.open_count || 0) > 0 || (e?.click_count || 0) > 0;
  const clicked = (e) => (e?.click_count || 0) > 0;
  const stateOf = (e) => (clicked(e) ? 'clicked' : opened(e) ? 'opened' : 'sent');
  const ticksOf = (e) => icon(opened(e) ? 'ticks' : 'tick');
  const tsOf = (iso) => (iso ? Date.parse(iso) || 0 : 0);
  const sentAt = (e) => e.sent_at || e.created_at;
  /** court : « Ouvert 2 fois · 1 clic » */
  function statusText(e) {
    if (!e) return 'Suivi';
    const o = (e.open_count || 0) > 0 ? `Ouvert ${times(e.open_count)}` : clicked(e) ? 'Ouvert' : 'Pas encore ouvert';
    return clicked(e) ? `${o} · ${clicksTxt(e.click_count)}` : o;
  }
  /** titre et sous-titre des cartes */
  function headline(e) {
    if ((e.open_count || 0) > 0) return {title: `Ouvert ${times(e.open_count)}`, sub: `Dernière ouverture ${ago(e.last_open_at)}`};
    if (clicked(e)) return {title: 'Lien cliqué', sub: `Dernier clic ${ago(e.last_click_at)}`};
    return {title: 'Pas encore ouvert', sub: `Envoyé ${ago(sentAt(e))}`};
  }
  /** le dernier geste du destinataire, pour le fil d'activité */
  function lastSignal(e) {
    const o = (e.open_count || 0) > 0 ? e.last_open_at : null;
    const c = clicked(e) ? e.last_click_at : null;
    if (c && (!o || tsOf(c) >= tsOf(o))) return {kind: 'click', at: c, verb: 'a cliqué un lien'};
    if (o) return {kind: 'open', at: o, verb: e.open_count > 1 ? `a ré-ouvert (${ordinal(e.open_count)} fois)` : 'a ouvert'};
    return null;
  }

  /* ——— Contacts : le nom affiché par Gmail, sinon l'adresse ——— */
  const names = new Map();
  let lastLearn = 0;
  let saveNamesTimer = 0;
  function learnNames() {
    if (Date.now() - lastLearn < 2000) return;
    lastLearn = Date.now();
    const me = account();
    let changed = false;
    for (const el of document.querySelectorAll('[email][name]')) {
      const email = (el.getAttribute('email') || '').trim().toLowerCase();
      const name = (el.getAttribute('name') || '').trim();
      if (!email || !name || email === me || name.includes('@') || names.get(email) === name) continue;
      names.set(email, name);
      changed = true;
    }
    if (!changed) return;
    clearTimeout(saveNamesTimer);
    saveNamesTimer = setTimeout(() => store.set({ptNames: Object.fromEntries([...names].slice(-400))}), 3000);
  }
  function who(recipient) {
    const list = String(recipient || '').split(/[,;]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    const email = list[0] || '';
    return {email, name: names.get(email) || email || 'Destinataire inconnu', more: Math.max(0, list.length - 1)};
  }
  const whoName = (w) => `${esc(w.name)}${w.more ? ` <span class="pt-more">+${w.more}</span>` : ''}`;
  function hue(s) {
    let h = 0;
    for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h % 8;
  }
  const initial = (w) => esc((w.name.match(/[\p{L}\p{N}]/u) || ['?'])[0].toUpperCase());
  const avatar = (w, extra = '') => `<span class="pt-av pt-av-${hue(w.email || w.name)}">${initial(w)}${extra}</span>`;

  /* ——— Rédaction : détection, interrupteur, préparation à l'envoi ——— */
  const composes = new Map(); // corps du message → état
  const labelOf = (el) => `${el.getAttribute('data-tooltip') || ''} ${el.getAttribute('aria-label') || ''}`.trim();
  const isSendButton = (el) => /^(envoyer|send)\b/i.test(labelOf(el) || (el.textContent || '').trim()) && !/options|programm|schedule|plus/i.test(labelOf(el));
  const isSendMore = (el) => /options d.envoi|send options|more send|autres options/i.test(labelOf(el));
  const findSend = (root) => $$('[role="button"]', root).find(isSendButton) || null;

  function rootOf(body) {
    let el = body.parentElement;
    for (let i = 0; el && i < 30; i++, el = el.parentElement) if (findSend(el)) return el;
    return null;
  }
  /** la zone qui porte l'objet et les destinataires : la fenêtre entière, plus large que le bloc du bouton Envoyer */
  function metaRoot(root) {
    const dialog = root.closest('[role="dialog"]');
    if (dialog) return dialog;
    let el = root;
    for (let i = 0; el && i < 8; i++, el = el.parentElement) {
      if (el.querySelector('input[name="subjectbox"], [email], input[name="to"]')) return el;
    }
    return root;
  }
  function subjectOf(root) {
    root = metaRoot(root);
    const s = root.querySelector('input[name="subjectbox"]')?.value?.trim();
    if (s) return s;
    const thread = document.querySelector('h2.hP')?.textContent?.trim();
    return thread ? (/^re\s*:/i.test(thread) ? thread : `Re: ${thread}`) : '';
  }
  function recipientsOf(root) {
    root = metaRoot(root);
    const set = new Set();
    root.querySelectorAll('[email]').forEach((el) => {
      const v = el.getAttribute('email');
      if (v && v.includes('@')) set.add(v.trim().toLowerCase());
    });
    root.querySelectorAll('input[name="to"], input[name="cc"], input[name="bcc"], input[type="text"]').forEach((input) => {
      (String(input.value || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).forEach((v) => set.add(v.toLowerCase()));
    });
    set.delete(account());
    return [...set].join(', ');
  }

  /** après « Annuler l'envoi », le brouillon revient avec le pixel du mail qu'on vient d'envoyer : on garde son
      identifiant. Tout autre pixel (mail recopié, modèle) appartient à un ancien mail et sera remplacé. */
  const justSent = new Map();
  function undoneId(body) {
    for (const img of body.querySelectorAll('img')) {
      if (img.closest('.gmail_quote, blockquote')) continue;
      const id = pixelId(img.getAttribute('src') || '');
      if (id && Date.now() - (justSent.get(id) || 0) < 120000) return id;
    }
    return null;
  }

  function linkify(body) {
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement?.closest('a, script, style') || !/https?:\/\//i.test(node.nodeValue || '')) continue;
      nodes.push(node);
    }
    for (const node of nodes) {
      const text = node.nodeValue || '';
      const re = /https?:\/\/[^\s<>"']+/gi;
      const frag = document.createDocumentFragment();
      let last = 0;
      let m;
      let changed = false;
      while ((m = re.exec(text))) {
        let raw = m[0];
        let trailing = '';
        while (/[),.;:!?»]$/.test(raw)) { trailing = raw.slice(-1) + trailing; raw = raw.slice(0, -1); }
        if (!raw) continue;
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const a = document.createElement('a');
        a.href = raw;
        a.textContent = raw;
        frag.appendChild(a);
        if (trailing) frag.appendChild(document.createTextNode(trailing));
        last = m.index + m[0].length;
        changed = true;
      }
      if (changed) {
        frag.appendChild(document.createTextNode(text.slice(last)));
        node.replaceWith(frag);
      }
    }
  }

  /** Prépare le mail pour l'envoi : synchrone, l'identifiant est obtenu dès l'ouverture de la rédaction */
  function prepare(st) {
    if (!st.enabled || !st.id || !st.body.isConnected) return false;
    const body = st.body;
    linkify(body);
    // tous les liens, y compris ceux d'anciens mails cités ou recopiés, sont suivis pour CE mail
    body.querySelectorAll('a[href]').forEach((a) => {
      const target = originalUrl(a.getAttribute('href') || '');
      if (!/^https?:\/\//i.test(target) || isOurs(target)) return;
      a.setAttribute('href', clickUrl(st.id, target));
    });
    // les pixels d'anciens mails ouvriraient… les anciens mails : on les retire
    body.querySelectorAll('img').forEach((img) => {
      if (img.dataset.ptPixel || isOurs(img.getAttribute('src') || '')) img.remove();
    });
    // le pixel en tête du message : jamais dans la citation ni la signature, que Gmail replie
    const img = document.createElement('img');
    img.src = pixelUrl(st.id);
    img.width = 1;
    img.height = 1;
    img.alt = '';
    img.setAttribute('data-pt-pixel', '1');
    img.style.cssText = 'display:block;width:1px;height:1px;border:0;margin:0;padding:0;';
    body.insertBefore(img, body.firstChild);
    st.lastSubject = subjectOf(st.root);
    st.lastRecipients = recipientsOf(st.root);
    return true;
  }

  function removeTracking(st) {
    st.body.querySelectorAll('img').forEach((img) => {
      if (img.dataset.ptPixel || isOurs(img.getAttribute('src') || '')) img.remove();
    });
    st.body.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (isOurs(href)) a.setAttribute('href', originalUrl(href));
    });
  }

  function ensureId(st) {
    if (st.id) return Promise.resolve(st.id);
    if (st.pending) return st.pending;
    st.error = '';
    paintToggle(st);
    st.pending = ask({type: 'register', sender: account(), recipient: recipientsOf(st.root), subject: subjectOf(st.root)}).then((r) => {
      st.pending = null;
      if (r.ok && r.id) {
        st.id = r.id;
        paintToggle(st);
        return r.id;
      }
      st.error = r.error || 'Serveur de suivi injoignable';
      paintToggle(st);
      throw new Error(st.error);
    });
    st.pending.catch(() => {});
    return st.pending;
  }

  function paintToggle(st) {
    const b = st.toggle;
    if (!b) return;
    const state = !st.enabled ? 'off' : st.error ? 'error' : st.id ? 'on' : 'pending';
    if (b.dataset.state === state && b.__ptErr === st.error) return;
    b.__ptErr = st.error;
    b.dataset.state = state;
    b.title = {
      off: config.hasToken ? 'Suivi désactivé pour ce mail. Cliquer pour l’activer.' : 'Ajoutez votre jeton dans les réglages de Prospect Tracker',
      error: `Suivi indisponible : ${st.error}. Cliquer pour réessayer.`,
      on: 'Suivi activé : vous saurez quand ce mail est ouvert et ses liens cliqués. Cliquer pour désactiver.',
      pending: 'Préparation du suivi…',
    }[state];
    b.setAttribute('aria-label', b.title);
    b.setAttribute('aria-pressed', String(state !== 'off'));
  }

  function addToggle(st) {
    const send = findSend(st.root);
    if (!send || st.root.querySelector('.pt-compose-toggle')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pt-compose-toggle pt-ui';
    b.innerHTML = `<span class="pt-ct-ico">${icon('ticks')}${icon('warn')}<i class="pt-spinner"></i></span><span class="pt-switch" aria-hidden="true"><i></i></span>`;
    const anchor = send.parentElement || send;
    anchor.parentElement?.insertBefore(b, anchor.nextSibling);
    st.toggle = b;
    paintToggle(st);
    b.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!config.hasToken) { toast('Ajoutez votre jeton dans les réglages de Prospect Tracker (icône de l’extension).', 'warn'); return; }
      if (st.error) { st.enabled = true; ensureId(st); return; }
      st.enabled = !st.enabled;
      if (st.enabled) ensureId(st);
      else removeTracking(st);
      paintToggle(st);
      toast(st.enabled ? 'Suivi activé : vous saurez quand ce mail est ouvert' : 'Suivi désactivé pour ce mail');
    }, true);
  }

  function scanComposes() {
    for (const [body, st] of composes) if (!body.isConnected && !st.watching) composes.delete(body);
    $$('div[contenteditable="true"][role="textbox"], div[contenteditable="true"][g_editable="true"]').forEach((body) => {
      if (composes.has(body)) return;
      const root = rootOf(body);
      if (!root) return;
      const st = {body, root, enabled: Boolean(config.trackingDefault && config.hasToken), id: null, pending: null, error: '', toggle: null};
      const existing = undoneId(body);
      if (existing) { st.id = existing; st.enabled = true; }
      composes.set(body, st);
      addToggle(st);
      if (st.enabled && !st.id) ensureId(st);
    });
  }

  function stateFor(el) {
    let best = null;
    for (const st of composes.values()) {
      if (st.body.isConnected && st.root.contains(el) && (!best || best.root.contains(st.root))) best = st;
    }
    return best;
  }

  /** le mail est parti quand sa fenêtre de rédaction disparaît (pas d'erreur, pas de destinataire manquant) */
  function watchSent(st, maxMs) {
    if (st.watching) return;
    st.watching = true;
    const started = Date.now();
    const check = () => {
      if (!st.body.isConnected) {
        st.watching = false;
        justSent.set(st.id, Date.now());
        ask({type: 'mark-sent', id: st.id, sender: account(), recipient: st.lastRecipients || '', subject: st.lastSubject || ''});
        setTimeout(() => refreshData(true), 2500);
        return;
      }
      if (Date.now() - started > maxMs) { st.watching = false; return; }
      setTimeout(check, 600);
    };
    setTimeout(check, 600);
  }

  function replay(st, btn) {
    st.replaying = true;
    try {
      for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
        const Ctor = type.startsWith('pointer') && window.PointerEvent ? PointerEvent : MouseEvent;
        btn.dispatchEvent(new Ctor(type, {bubbles: true, cancelable: true, view: window, button: 0, buttons: type.endsWith('down') ? 1 : 0}));
      }
    } finally {
      st.replaying = false;
    }
  }

  /** l'identifiant n'est pas encore là : on retient l'envoi quelques secondes, puis on le relance */
  async function hold(st, btn, isSend) {
    if (st.holding) return;
    st.holding = true;
    st.toggle?.setAttribute('data-busy', 'true');
    try {
      await Promise.race([ensureId(st), new Promise((_, ko) => setTimeout(() => ko(new Error('le serveur ne répond pas')), 5000))]);
      prepare(st);
      replay(st, btn);
      if (isSend) watchSent(st, 8000);
      else watchSent(st, 180000);
    } catch (err) {
      st.enabled = false;
      st.error = '';
      removeTracking(st);
      paintToggle(st);
      toast(`Suivi indisponible (${err.message}). Le mail n’est PAS parti : cliquez à nouveau sur Envoyer pour l’envoyer sans suivi.`, 'warn');
    } finally {
      st.holding = false;
      st.toggle?.removeAttribute('data-busy');
    }
  }

  function onPointer(e) {
    if (typeof e.button === 'number' && e.button !== 0) return;
    const btn = e.target.closest?.('[role="button"]');
    if (!btn) return;
    const send = isSendButton(btn);
    const more = !send && isSendMore(btn);
    if (!send && !more) return;
    const st = stateFor(btn);
    if (!st || !st.enabled || st.replaying) return;
    if (st.id) {
      prepare(st);
      if (e.type === 'click') watchSent(st, send ? 8000 : 180000);
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.type === 'mousedown' || e.type === 'pointerdown') hold(st, btn, send);
  }
  ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((t) => window.addEventListener(t, onPointer, true));

  window.addEventListener('keydown', (e) => {
    const combo = e.key === 'Enter' && (e.ctrlKey || e.metaKey);
    const focusBtn = e.target.closest?.('[role="button"]');
    const onSend = (e.key === 'Enter' || e.key === ' ') && focusBtn && isSendButton(focusBtn);
    if (!combo && !onSend) return;
    const st = stateFor(e.target);
    if (!st || !st.enabled || st.replaying) return;
    if (st.id) { prepare(st); watchSent(st, 8000); return; }
    e.preventDefault();
    e.stopImmediatePropagation();
    const btn = findSend(st.root);
    if (btn) hold(st, btn, true);
  }, true);

  // « Programmer l'envoi » : le mail part quand la fenêtre se ferme
  document.addEventListener('click', (e) => {
    const item = e.target.closest?.('[role="menuitem"]');
    if (!item || !/programmer|schedule/i.test(item.textContent || '')) return;
    for (const st of composes.values()) if (st.enabled && st.id && st.body.isConnected) { prepare(st); watchSent(st, 180000); }
  }, true);

  /* ——— Vos propres lectures et vos propres clics ne comptent pas ——— */
  const pinged = new Map();
  function selfPing(id, kind) {
    const me = account();
    const key = `${id}:${kind}`;
    if (!me || Date.now() - (pinged.get(key) || 0) < 3000) return;
    pinged.set(key, Date.now());
    ask({type: 'self', id, viewer: me, kind});
  }
  const onLink = (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || a.closest('[contenteditable="true"]')) return;
    const id = clickId(a.href);
    if (id) selfPing(id, 'click');
  };
  document.addEventListener('click', onLink, true);
  document.addEventListener('auxclick', onLink, true);

  /* ——— Les messages affichés dans un fil : chacun son statut, lu dans son propre pixel ——— */
  function messageBodies() {
    return $$('div.a3s').filter((el) => !el.closest('[contenteditable="true"]'));
  }
  function idsIn(body) {
    const own = [];
    const quoted = [];
    body.querySelectorAll('img').forEach((img) => {
      const id = pixelId(img.getAttribute('src') || '');
      if (id) (img.closest('.gmail_quote, blockquote') ? quoted : own).push(id);
    });
    return {own, quoted};
  }
  function displayedIds() {
    return messageBodies().flatMap((b) => idsIn(b).own);
  }

  const seenBodies = new WeakSet();
  /** une puce de statut : survol = carte de suivi, clic = détail dans le volet (sans ouvrir ni replier le message) */
  function badgeButton(cls) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.addEventListener('mousedown', (e) => e.stopPropagation(), true);
    b.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      hidePop();
      openPanel(b.dataset.ptId);
    }, true);
    return b;
  }

  function scanMessages() {
    for (const body of messageBodies()) {
      const {own, quoted} = idsIn(body);
      // le message vient de s'afficher : si c'est vous l'expéditeur, cette ouverture est la vôtre
      if (!seenBodies.has(body) && own.length + quoted.length) {
        seenBodies.add(body);
        [...own, ...quoted].forEach((id) => selfPing(id, 'view'));
      }
      const id = own[0];
      if (!id) continue;
      const box = body.closest('.adn, [data-message-id]') || body.parentElement;
      let badge = box.querySelector(':scope .pt-msg-badge');
      if (!badge) {
        badge = badgeButton('pt-msg-badge pt-ui');
        const date = box.querySelector('.gH .g3') || box.querySelector('.g3');
        if (date?.parentElement) date.parentElement.insertBefore(badge, date);
        else body.parentElement.insertBefore(badge, body);
      }
      if (badge.dataset.ptId !== id) badge.dataset.ptId = id;
      paintBadge(badge, statsById.get(id));
    }
    paintThreadStatus();
  }

  function paintBadge(badge, e) {
    put(badge, {
      cls: `pt-msg-badge pt-ui pt-s-${stateOf(e)}`,
      label: e ? `${statusText(e)}. Survoler pour le détail.` : 'Message suivi',
      html: `${ticksOf(e)}<span class="pt-chip-txt">${esc(statusText(e))}</span>`,
    });
  }

  /* ——— Les listes (boîte de réception, envoyés…) : objet + destinataire, réévalués à chaque passage ——— */
  const norm = (s) => String(s || '').replace(/^\s*((re|tr|fwd?|fw|réf|ref|aw|wg)\s*(\[\d+\])?\s*:\s*)+/i, '').replace(/\s+/g, ' ').trim().toLowerCase();
  function matchRow(subject, people) {
    const key = norm(subject);
    if (!key) return null;
    const pool = emails.filter((e) => norm(e.subject) === key);
    if (!pool.length) return null;
    const others = people.filter((p) => p !== account());
    let best = pool;
    if (others.length) {
      best = pool.filter((e) => others.some((p) => (e.recipient || '').toLowerCase().includes(p)));
      if (!best.length) return null; // même objet mais pas le même destinataire : surtout ne rien afficher de faux
    } else if (new Set(pool.map((e) => (e.recipient || '').toLowerCase())).size > 1) {
      return null; // personne à comparer et plusieurs destinataires possibles : on ne devine pas
    }
    return best.sort((a, b) => tsOf(sentAt(b)) - tsOf(sentAt(a)))[0];
  }

  function scanRows() {
    $$('tr.zA').forEach((row) => {
      const subject = row.querySelector('.bog')?.textContent?.trim() || '';
      const people = $$('[email]', row).map((el) => (el.getAttribute('email') || '').toLowerCase()).filter(Boolean);
      const sig = `${subject}|${people.join(',')}`;
      let badge = row.querySelector('.pt-row-checks');
      // Gmail réutilise les lignes d'une page à l'autre : on repart de zéro si le contenu a changé
      if (row.dataset.ptSig !== sig) {
        badge?.remove();
        badge = null;
        row.dataset.ptSig = sig;
      }
      if (!emails.length) return;
      const email = matchRow(subject, people);
      if (!email) { badge?.remove(); return; }
      if (!badge) {
        // devant l'objet, comme Mailsuite : la colonne de la date est remplacée par les actions au survol
        const subj = row.querySelector('.bog');
        const cell = subj?.parentElement || row.querySelector('.xW') || row.querySelector('td:last-child');
        if (!cell) return;
        badge = badgeButton('pt-row-checks pt-ui');
        if (subj && subj.parentElement === cell) cell.insertBefore(badge, subj);
        else cell.prepend(badge);
      }
      if (badge.dataset.ptId !== email.id) badge.dataset.ptId = email.id;
      put(badge, {
        cls: `pt-row-checks pt-ui ${opened(email) ? 'pt-row-opened' : 'pt-row-unopened'}${clicked(email) ? ' pt-row-clicked' : ''}`,
        label: statusText(email),
        html: `${ticksOf(email)}${clicked(email) ? icon('link') : ''}`,
      });
    });
  }

  /** à côté de l'objet du fil, seulement si aucun message suivi n'est affiché (messages repliés, images coupées) */
  function paintThreadStatus() {
    const h2 = $$('h2.hP').find((h) => h.offsetParent !== null) || null;
    let old = document.querySelector('.pt-thread-status');
    if (old && old.previousElementSibling !== h2) { old.remove(); old = null; }
    const hasChip = $$('.pt-msg-badge').some((b) => b.offsetParent !== null);
    let email = null;
    if (h2 && !hasChip) {
      const scope = h2.closest('[role="main"]') || document;
      const people = $$('[email]', scope).map((el) => (el.getAttribute('email') || '').toLowerCase()).filter(Boolean);
      email = matchRow(h2.textContent, people);
    }
    if (!email) { old?.remove(); return; }
    const el = old || badgeButton('pt-thread-status pt-ui');
    if (!old) h2.insertAdjacentElement('afterend', el);
    if (el.dataset.ptId !== email.id) el.dataset.ptId = email.id;
    put(el, {
      cls: `pt-thread-status pt-ui pt-s-${stateOf(email)}`,
      label: statusText(email),
      html: `${ticksOf(email)}<span class="pt-chip-txt">${esc(statusText(email))}</span>`,
    });
  }

  function paintAll() {
    scanRows();
    for (const badge of $$('.pt-msg-badge')) paintBadge(badge, statsById.get(badge.dataset.ptId));
    paintThreadStatus();
    paintLauncher();
    if (popVisible()) refreshPop();
  }

  /* ——— Les événements d'un mail, dans l'ordre : 1re ouverture, ré-ouvertures, clics ——— */
  const VIA = {gmail: 'Gmail', apple: 'Apple Mail · peut être automatique', outlook: 'Outlook', yahoo: 'Yahoo Mail', other: ''};
  const IGNORED = {self: 'Vous-même : non compté', dup: 'Même ouverture : non comptée', bot: 'Robot ou antivirus : non compté'};
  function linkLabel(url) {
    try {
      const u = new URL(url);
      return `${u.hostname.replace(/^www\./, '')}${u.pathname !== '/' ? u.pathname : ''}`;
    } catch {
      return url || '';
    }
  }
  function describe(events) {
    const asc = [...(events || [])].sort((a, b) => a.created_at.localeCompare(b.created_at));
    let n = 0;
    return asc.map((ev) => {
      if (!ev.counted) return {ev, kind: ev.type === 'click' ? 'click' : 'open', ignored: true, title: ev.type === 'click' ? 'Clic' : 'Ouverture', sub: IGNORED[ev.reason] || 'Non compté'};
      if (ev.type === 'click') return {ev, kind: 'click', title: 'Lien cliqué', sub: linkLabel(ev.url)};
      n++;
      const base = n === 1 ? 'Ouvert' : `Ré-ouvert (${ordinal(n)} fois)`;
      return {ev, kind: 'open', title: ev.reason === 'implied' ? `${base}, déduit du clic` : base, sub: ev.reason === 'implied' ? 'Images bloquées : le clic prouve l’ouverture' : VIA[ev.reason] || ''};
    }).reverse();
  }
  function byDay(items, at, render) {
    let day = '';
    return items.map((it) => {
      const iso = at(it);
      const label = iso ? dayLabel(iso) : '';
      const head = label && label !== day ? `<div class="pt-day">${label}</div>` : '';
      day = label || day;
      return head + render(it);
    }).join('');
  }

  /* ——— La carte de suivi, au survol d'une coche ——— */
  const BADGES = '.pt-row-checks, .pt-msg-badge, .pt-thread-status';
  const detailsCache = new Map();
  let pop = null;
  let popAnchor = null;
  let popTimer = 0;
  let hideTimer = 0;

  async function getDetails(id, maxAge = 20000) {
    const c = detailsCache.get(id);
    if (c && Date.now() - c.at < maxAge) return c.data;
    const r = await ask({type: 'details', id});
    if (r.ok && r.email) {
      detailsCache.set(id, {at: Date.now(), data: r});
      statsById.set(r.email.id, r.email);
    }
    return r;
  }

  const popVisible = () => Boolean(pop?.classList.contains('pt-pop-show'));
  function ensurePop() {
    if (pop) return pop;
    pop = document.createElement('div');
    pop.className = 'pt-pop pt-ui';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Suivi du mail');
    pop.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    pop.addEventListener('mouseleave', () => hideSoon());
    pop.addEventListener('click', (e) => {
      const more = e.target.closest('[data-pt-open]');
      if (!more) return;
      e.preventDefault();
      const id = more.dataset.ptOpen;
      hidePop();
      openPanel(id);
    });
    document.body.appendChild(pop);
    return pop;
  }
  function hidePop() {
    clearTimeout(popTimer);
    clearTimeout(hideTimer);
    popAnchor = null;
    pop?.classList.remove('pt-pop-show');
  }
  function hideSoon() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hidePop, 220);
  }
  function placePop() {
    if (!pop || !popAnchor?.isConnected) { hidePop(); return; }
    const r = popAnchor.getBoundingClientRect();
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    const left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
    let top = r.bottom + 8;
    let side = 'below';
    if (top + h > window.innerHeight - 8 && r.top - h - 8 >= 8) { top = r.top - h - 8; side = 'above'; }
    pop.style.left = `${Math.round(left)}px`;
    pop.style.top = `${Math.round(top)}px`;
    pop.dataset.side = side;
  }

  const popAct = (x) => `<div class="pt-pop-act pt-k-${x.kind}">${icon(x.kind === 'click' ? 'click' : 'eye')}<span>${esc(x.title)}${x.kind === 'click' && x.sub ? ` <em>${esc(x.sub)}</em>` : ''}</span><time>${esc(ago(x.ev.created_at))}</time></div>`;
  function popHtml(e, d) {
    const h = headline(e);
    const w = who(e.recipient);
    let acts = '<div class="pt-pop-skel"><i></i><i></i></div>';
    if (d?.ok) {
      const list = describe(d.events).filter((x) => !x.ignored).slice(0, 4);
      acts = list.length ? list.map(popAct).join('') : '<div class="pt-pop-empty">Aucune ouverture ni aucun clic pour l’instant.</div>';
    } else if (d) {
      acts = '';
    }
    return `
      <div class="pt-pop-head pt-s-${stateOf(e)}">
        <span class="pt-pop-ico">${ticksOf(e)}</span>
        <div class="pt-pop-head-txt"><div class="pt-pop-title">${esc(h.title)}</div><div class="pt-pop-sub">${esc(h.sub)}</div></div>
      </div>
      <div class="pt-pop-to">${avatar(w)}<div><b>${whoName(w)}</b><span>${esc(e.subject || '(sans objet)')}</span></div><time>${esc(shortWhen(sentAt(e)))}</time></div>
      ${acts ? `<div class="pt-pop-acts">${acts}</div>` : ''}
      <button type="button" class="pt-pop-more" data-pt-open="${esc(e.id)}"><span>Voir toute l’activité</span>${icon('next')}</button>`;
  }

  async function showPop(anchor) {
    const id = anchor.dataset.ptId;
    const e = statsById.get(id);
    if (!e || !anchor.isConnected) return;
    ensurePop();
    popAnchor = anchor;
    const c = detailsCache.get(id);
    put(pop, {html: popHtml(e, c?.data)});
    pop.classList.add('pt-pop-show');
    placePop();
    if (c && Date.now() - c.at < 20000) return;
    const d = await getDetails(id);
    if (popAnchor !== anchor) return;
    put(pop, {html: popHtml(statsById.get(id) || e, d)});
    placePop();
  }
  function refreshPop() {
    const id = popAnchor?.dataset.ptId;
    const e = id && statsById.get(id);
    if (!e) return;
    put(pop, {html: popHtml(e, detailsCache.get(id)?.data)});
    placePop();
  }

  document.addEventListener('mouseover', (e) => {
    const a = e.target.closest?.(BADGES);
    if (!a?.dataset.ptId) return;
    clearTimeout(hideTimer);
    if (a === popAnchor && popVisible()) return;
    clearTimeout(popTimer);
    popTimer = setTimeout(() => showPop(a), popVisible() ? 80 : 300);
  });
  document.addEventListener('mouseout', (e) => {
    const a = e.target.closest?.(BADGES);
    if (!a || a.contains(e.relatedTarget)) return;
    clearTimeout(popTimer);
    if (popVisible()) hideSoon();
  });
  document.addEventListener('focusin', (e) => {
    const a = e.target.closest?.(BADGES);
    if (a?.dataset.ptId && !e.target.matches(':hover')) showPop(a);
  });
  document.addEventListener('focusout', (e) => {
    if (e.target.closest?.(BADGES) && !pop?.contains(e.relatedTarget)) hideSoon();
  });
  window.addEventListener('scroll', (e) => { if (popVisible() && !pop.contains(e.target)) hidePop(); }, true);
  window.addEventListener('resize', () => { if (popVisible()) placePop(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (popVisible()) hidePop();
    else if (panelOpen && panel.contains(e.target)) closePanel();
  });

  /* ——— Le volet de suivi ——— */
  let panel = null;
  let panelOpen = false;
  let selectedId = null;
  let tab = 'activity';
  let query = '';
  let filter = 'all';
  let lastSeen = Date.now(); // dernière visite de l'onglet Activité : ce qui est plus récent est « nouveau »
  let seenBefore = lastSeen;
  const FILTERS = [
    ['all', 'Tous', () => true],
    ['opened', 'Ouverts', opened],
    ['unopened', 'Pas ouverts', (e) => !opened(e)],
    ['clicked', 'Cliqués', clicked],
  ];
  const feedItems = () => emails.map((e) => ({e, sig: lastSignal(e)})).filter((x) => x.sig).sort((a, b) => tsOf(b.sig.at) - tsOf(a.sig.at));
  const bodyEl = () => panel.querySelector('.pt-panel-body');
  const emptyState = (ico, title, text) => `<div class="pt-empty"><span class="pt-empty-ico">${icon(ico)}</span><b>${title}</b><span>${text}</span></div>`;
  const noToken = () => emptyState('warn', 'Jeton manquant', 'Cliquez sur l’icône de Prospect Tracker dans la barre de Chrome, puis sur les réglages, et collez votre jeton.');
  const backBtn = () => `<button type="button" class="pt-back">${icon('back')}<span>Retour</span></button>`;

  function ensureLauncher() {
    if (document.querySelector('.pt-launcher')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pt-launcher pt-ui';
    b.title = 'Suivi des mails';
    b.innerHTML = `${logo()}<span class="pt-launcher-count"></span>`;
    b.addEventListener('click', () => (panelOpen ? closePanel() : openPanel()));
    document.body.appendChild(b);
    paintLauncher();
  }
  function paintLauncher() {
    const b = document.querySelector('.pt-launcher');
    if (!b) return;
    const n = panelOpen && !selectedId && tab === 'activity' ? 0 : feedItems().filter((x) => tsOf(x.sig.at) > lastSeen).length;
    const s = n > 1 ? 's' : '';
    put(b, {cls: `pt-launcher pt-ui${panelOpen ? ' pt-active' : ''}`, label: n ? `Suivi des mails : ${n} nouvelle${s} activité${s}` : 'Suivi des mails'});
    put(b.querySelector('.pt-launcher-count'), {html: n ? (n > 9 ? '9+' : String(n)) : '', cls: `pt-launcher-count${n ? ' pt-on' : ''}`});
  }
  function seeActivity() {
    lastSeen = Date.now();
    store.set({ptLastSeen: lastSeen});
    paintLauncher();
  }

  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement('aside');
    panel.className = 'pt-panel pt-ui';
    panel.setAttribute('aria-label', 'Suivi des mails');
    panel.innerHTML = `
      <header class="pt-panel-head">
        <div class="pt-brand">${logo()}<div class="pt-brand-txt"><b>Suivi des mails</b><small class="pt-account"></small></div></div>
        <button type="button" class="pt-icon-btn pt-refresh" title="Actualiser" aria-label="Actualiser">${icon('refresh')}</button>
        <button type="button" class="pt-icon-btn pt-close" title="Fermer" aria-label="Fermer">${icon('close')}</button>
      </header>
      <nav class="pt-tabs" role="tablist">
        <button type="button" class="pt-tab" role="tab" data-tab="activity">Activité</button>
        <button type="button" class="pt-tab" role="tab" data-tab="mails">Mails suivis</button>
      </nav>
      <div class="pt-panel-body"></div>`;
    panel.querySelector('.pt-close').addEventListener('click', closePanel);
    panel.querySelector('.pt-refresh').addEventListener('click', async (e) => {
      const r = e.currentTarget;
      r.classList.add('pt-spin');
      if (selectedId) detailsCache.delete(selectedId);
      await refreshData(true);
      if (selectedId) await renderDetail(selectedId);
      r.classList.remove('pt-spin');
    });
    panel.querySelectorAll('.pt-tab').forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));
    panel.addEventListener('click', (e) => {
      const item = e.target.closest('[data-open]');
      if (item) { renderDetail(item.dataset.open); return; }
      if (e.target.closest('.pt-back')) { selectedId = null; renderTab(); paintLauncher(); return; }
      const f = e.target.closest('[data-filter]');
      if (f) { filter = f.dataset.filter; renderMails(); }
    });
    const scroller = panel.querySelector('.pt-panel-body');
    scroller.addEventListener('scroll', () => panel.classList.toggle('pt-scrolled', scroller.scrollTop > 4), {passive: true});
    panel.addEventListener('input', (e) => {
      if (!e.target.matches('.pt-search input')) return;
      query = e.target.value;
      paintMails();
    });
    // les raccourcis clavier de Gmail ne doivent pas réagir à ce qu'on tape dans le volet
    for (const t of ['keydown', 'keypress', 'keyup']) panel.addEventListener(t, (e) => { if (e.key !== 'Escape') e.stopPropagation(); });
    document.body.appendChild(panel);
    return panel;
  }

  function showTab(name) {
    tab = name;
    selectedId = null;
    if (name === 'activity') seenBefore = lastSeen;
    renderTab();
    paintLauncher();
  }
  function renderTab() {
    if (!panel) return;
    panel.dataset.view = selectedId ? 'detail' : tab;
    panel.querySelectorAll('.pt-tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === tab)));
    put(panel.querySelector('.pt-account'), {html: esc(account())});
    if (selectedId) return;
    if (tab === 'activity') renderActivity();
    else renderMails();
  }
  async function openPanel(id = null) {
    ensurePanel();
    hidePop();
    panelOpen = true;
    panel.classList.add('pt-open');
    if (id) await renderDetail(id);
    else { showTab(tab); refreshData(true); }
    paintLauncher();
  }
  function closePanel() {
    if (!panel) return;
    panelOpen = false;
    selectedId = null;
    panel.classList.remove('pt-open');
    paintLauncher();
  }

  function renderActivity() {
    const body = bodyEl();
    if (!config.hasToken) { put(body, {html: noToken()}); return; }
    const total = emails.length;
    const nOpen = emails.filter(opened).length;
    const nClick = emails.filter(clicked).length;
    const rate = total ? Math.round((nOpen / total) * 100) : 0;
    const feed = feedItems().slice(0, 60);
    const item = ({e, sig}) => {
      const w = who(e.recipient);
      return `
      <button type="button" class="pt-feed-item${tsOf(sig.at) > seenBefore ? ' pt-new' : ''}" data-open="${esc(e.id)}">
        ${avatar(w, `<i class="pt-av-badge pt-k-${sig.kind}">${icon(sig.kind === 'click' ? 'click' : 'eye')}</i>`)}
        <span class="pt-feed-main"><span class="pt-feed-line"><b>${whoName(w)}</b> ${esc(sig.verb)}</span><span class="pt-feed-subj">${esc(e.subject || '(sans objet)')}</span></span>
        <time>${esc(clock(sig.at))}</time>
      </button>`;
    };
    put(body, {html: `
      <section class="pt-overview">
        <div class="pt-stats">
          <div class="pt-stat pt-k-sent">${icon('send')}<b>${total}</b><span>Suivis</span></div>
          <div class="pt-stat pt-k-open">${icon('eye')}<b>${nOpen}</b><span>Ouverts</span></div>
          <div class="pt-stat pt-k-click">${icon('click')}<b>${nClick}</b><span>Cliqués</span></div>
        </div>
        <div class="pt-rate"><div class="pt-rate-top"><span>Taux d’ouverture</span><b>${rate} %</b></div><div class="pt-rate-bar"><i></i></div></div>
      </section>
      <div class="pt-section-title">Dernière activité</div>
      ${feed.length ? `<div class="pt-feed">${byDay(feed, (x) => x.sig.at, item)}</div>` : emptyState('inbox', 'Pas encore d’activité', 'Dès qu’un destinataire ouvre un mail suivi ou clique un lien, ça s’affiche ici.')}`});
    const bar = body.querySelector('.pt-rate-bar i');
    if (bar && bar.style.width !== `${rate}%`) bar.style.width = `${rate}%`;
    seeActivity();
  }

  function renderMails() {
    const body = bodyEl();
    if (!config.hasToken) { put(body, {html: noToken()}); return; }
    if (!body.querySelector('.pt-tools')) {
      put(body, {html: `
        <div class="pt-tools">
          <label class="pt-search">${icon('search')}<input type="search" placeholder="Rechercher un contact ou un objet" aria-label="Rechercher" autocomplete="off" spellcheck="false"></label>
          <div class="pt-chips" role="group" aria-label="Filtrer"></div>
        </div>
        <div class="pt-mails"></div>`});
      body.querySelector('.pt-search input').value = query;
    }
    put(body.querySelector('.pt-chips'), {html: FILTERS.map(([k, label, fn]) => `<button type="button" class="pt-chip${filter === k ? ' pt-chip-on' : ''}" data-filter="${k}" aria-pressed="${filter === k}">${label}<span>${emails.filter(fn).length}</span></button>`).join('')});
    paintMails();
  }
  function mailRow(e) {
    const w = who(e.recipient);
    const meta = (e.open_count || 0) > 0 ? `Ouvert ${times(e.open_count)} · ${ago(e.last_open_at)}` : clicked(e) ? 'Ouvert' : 'Pas encore ouvert';
    return `
      <button type="button" class="pt-mail" data-open="${esc(e.id)}">
        <span class="pt-status pt-s-${stateOf(e)}">${ticksOf(e)}</span>
        <span class="pt-mail-main">
          <span class="pt-mail-top"><b>${whoName(w)}</b><time>${esc(shortWhen(sentAt(e)))}</time></span>
          <span class="pt-mail-subj">${esc(e.subject || '(sans objet)')}</span>
          <span class="pt-mail-meta"><span class="pt-meta-${opened(e) ? 'open' : 'sent'}">${esc(meta)}</span>${clicked(e) ? `<span class="pt-meta-click">${icon('link')}${clicksTxt(e.click_count)}</span>` : ''}</span>
        </span>
      </button>`;
  }
  function paintMails() {
    const box = panel?.querySelector('.pt-mails');
    if (!box) return;
    const fn = (FILTERS.find(([k]) => k === filter) || FILTERS[0])[2];
    const q = query.trim().toLowerCase();
    const list = emails.filter(fn).filter((e) => !q || `${e.recipient || ''} ${who(e.recipient).name} ${e.subject || ''}`.toLowerCase().includes(q));
    put(box, {html: list.length ? list.slice(0, 150).map(mailRow).join('')
      : q ? emptyState('search', 'Aucun résultat', 'Essayez un autre nom, une autre adresse ou un autre objet.')
        : emptyState('inbox', 'Rien ici pour l’instant', 'Les mails suivis apparaissent ici dès leur envoi.')});
  }

  function tlItem(x, full = false) {
    const ico = x.kind === 'click' ? 'click' : x.kind === 'sent' ? 'send' : 'eye';
    const t = x.ev.created_at;
    return `
      <div class="pt-tl-item pt-k-${x.kind}${x.ignored ? ' pt-tl-off' : ''}">
        <span class="pt-tl-dot">${icon(ico)}</span>
        <div class="pt-tl-copy"><div class="pt-tl-title">${esc(x.title)}</div>${x.sub ? `<div class="pt-tl-sub"${x.ev.url ? ` title="${esc(x.ev.url)}"` : ''}>${esc(x.sub)}</div>` : ''}</div>
        <time>${esc(full && t ? `${fmtDay.format(new Date(t))} ${clock(t)}` : clock(t))}</time>
      </div>`;
  }

  async function renderDetail(id) {
    if (!panel) return;
    selectedId = id;
    panel.dataset.view = 'detail';
    paintLauncher();
    const body = bodyEl();
    put(body, {html: `${backBtn()}<div class="pt-loading"><i class="pt-spinner"></i><span>Chargement de l’activité…</span></div>`});
    body.scrollTop = 0;
    const r = await getDetails(id, 0);
    if (selectedId !== id) return;
    if (!r.ok || !r.email) {
      put(body, {html: `${backBtn()}<div class="pt-error">${icon('warn')}<span>Activité introuvable${r.error ? ` (${esc(r.error)})` : ''}.</span></div>`});
      return;
    }
    const e = r.email;
    const rows = describe(r.events);
    const counted = rows.filter((x) => !x.ignored);
    const ignored = rows.filter((x) => x.ignored);
    const w = who(e.recipient);
    const h = headline(e);
    const facts = [
      ['Envoyé', when(sentAt(e))],
      (e.open_count || 0) > 0 && ['Première ouverture', when(e.first_open_at)],
      (e.open_count || 0) > 0 && ['Dernière ouverture', ago(e.last_open_at)],
      clicked(e) && ['Dernier clic', ago(e.last_click_at)],
    ].filter(Boolean);
    const timeline = [...counted, {kind: 'sent', ev: {created_at: sentAt(e)}, title: 'Envoyé', sub: w.more ? `À ${w.more + 1} destinataires` : ''}];
    const extra = w.name !== w.email || w.more ? e.recipient : '';
    put(body, {html: `
      ${backBtn()}
      <h2 class="pt-detail-subject">${esc(e.subject || '(sans objet)')}</h2>
      <div class="pt-detail-to">${avatar(w)}<div><b>${whoName(w)}</b>${extra ? `<span>${esc(extra)}</span>` : ''}</div></div>
      <div class="pt-hero pt-s-${stateOf(e)}">
        <span class="pt-hero-ico">${ticksOf(e)}</span>
        <div><div class="pt-hero-title">${esc(h.title)}${clicked(e) ? `<span class="pt-hero-clicks">${icon('link')}${clicksTxt(e.click_count)}</span>` : ''}</div><div class="pt-hero-sub">${esc(h.sub)}</div></div>
      </div>
      <div class="pt-facts">${facts.map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>
      <div class="pt-section-title">Activité</div>
      <div class="pt-tl">${byDay(timeline, (x) => x.ev.created_at, (x) => tlItem(x))}</div>
      ${ignored.length ? `<details class="pt-ignored"><summary>${icon('shield')}<span>${ignored.length > 1 ? `${ignored.length} signaux ignorés` : '1 signal ignoré'}</span><small>vous-même, doublons, robots</small>${icon('next')}</summary><div class="pt-tl pt-tl-flat">${ignored.map((x) => tlItem(x, true)).join('')}</div></details>` : ''}
      <p class="pt-note">Une ouverture n’est visible que si le destinataire affiche les images. Un clic compte aussi comme ouverture. Vos propres lectures, les doublons et les antivirus ne sont pas comptés.</p>`});
    paintAll();
  }

  /* ——— Boucle ——— */
  let queued = false;
  function scanAll() {
    if (!config.apiBase) return;
    scanComposes();
    scanMessages();
    scanRows();
    learnNames();
    ensureLauncher();
  }
  const queueScan = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; scanAll(); });
  };

  Promise.all([loadConfig(), store.get('ptLastSeen'), store.get('ptNames')]).then(([, seen, saved]) => {
    if (seen) lastSeen = seen;
    else store.set({ptLastSeen: lastSeen});
    seenBefore = lastSeen;
    for (const [email, name] of Object.entries(saved || {})) if (!names.has(email)) names.set(email, name);
    new MutationObserver(queueScan).observe(document.documentElement, {childList: true, subtree: true});
    scanAll();
    refreshData(true);
    window.addEventListener('focus', () => refreshData(true));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshData(true); });
    setInterval(() => { if (!document.hidden) refreshData(true); }, 30000);
    chrome.storage?.onChanged?.addListener((changes, area) => {
      if (area === 'sync' && (changes.apiBase || changes.apiToken || changes.trackingDefault)) loadConfig().then(() => refreshData(true));
    });
  });
})();
