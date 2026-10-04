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
  /** n'écrit dans la page que si quelque chose change (sinon l'observateur de Gmail tournerait en boucle) */
  function put(el, {html, cls, title}) {
    if (html !== undefined && el.__ptHtml !== html) { el.innerHTML = html; el.__ptHtml = html; }
    if (cls !== undefined && el.className !== cls) el.className = cls;
    if (title !== undefined && el.title !== title) { el.title = title; el.setAttribute('aria-label', title); }
  }
  const times = (n) => (n === 1 ? '1 fois' : `${n} fois`);
  const clicksTxt = (n) => (n === 1 ? '1 clic' : `${n} clics`);
  const ordinal = (n) => (n === 1 ? '1re' : `${n}e`);

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

  function toast(message) {
    document.querySelector('.pt-toast')?.remove();
    const el = document.createElement('div');
    el.className = 'pt-toast';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 6000);
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
    if (drawerOpen && !selectedId) renderList();
  }

  const opened = (e) => (e?.open_count || 0) > 0 || (e?.click_count || 0) > 0;
  function summary(e) {
    if (!e) return 'Suivi';
    const parts = [];
    if ((e.open_count || 0) > 0) parts.push(`Ouvert ${times(e.open_count)} · dernière ouverture ${ago(e.last_open_at)}`);
    else parts.push('Pas encore d’ouverture détectée');
    if ((e.click_count || 0) > 0) parts.push(`${clicksTxt(e.click_count)} · dernier ${ago(e.last_click_at)}`);
    return parts.join(' · ');
  }
  const checks = (e) => (opened(e) ? '<span>✓</span><span>✓</span>' : '<span>✓</span>');

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
  function subjectOf(root) {
    const s = root.querySelector('input[name="subjectbox"]')?.value?.trim();
    if (s) return s;
    const thread = document.querySelector('h2.hP')?.textContent?.trim();
    return thread ? (/^re\s*:/i.test(thread) ? thread : `Re: ${thread}`) : '';
  }
  function recipientsOf(root) {
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
      off: config.hasToken ? 'Suivi désactivé pour ce mail (cliquer pour l’activer)' : 'Ajoutez votre jeton dans les réglages de Prospect Tracker',
      error: `Suivi indisponible : ${st.error}. Cliquer pour réessayer.`,
      on: 'Suivi activé : ouvertures et clics de ce mail (cliquer pour désactiver)',
      pending: 'Préparation du suivi…',
    }[state];
    b.innerHTML = `<span class="pt-check-icon"><i>✓</i><i>✓</i></span><span class="pt-compose-label">${{off: 'Sans suivi', error: 'Suivi ⚠', on: 'Suivi', pending: 'Suivi…'}[state]}</span>`;
  }

  function addToggle(st) {
    const send = findSend(st.root);
    if (!send || st.root.querySelector('.pt-compose-toggle')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pt-compose-toggle';
    b.setAttribute('aria-label', 'Suivi Prospect Tracker');
    const anchor = send.parentElement || send;
    anchor.parentElement?.insertBefore(b, anchor.nextSibling);
    st.toggle = b;
    paintToggle(st);
    b.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!config.hasToken) { toast('Ajoutez votre jeton dans les réglages de Prospect Tracker (icône de l’extension).'); return; }
      if (st.error) { st.enabled = true; ensureId(st); return; }
      st.enabled = !st.enabled;
      if (st.enabled) ensureId(st);
      else removeTracking(st);
      paintToggle(st);
      toast(st.enabled ? 'Suivi activé pour ce mail' : 'Suivi désactivé pour ce mail');
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
      toast(`Suivi indisponible (${err.message}). Le mail n’est PAS parti : cliquez à nouveau sur Envoyer pour l’envoyer sans suivi.`);
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
  function scanMessages() {
    let latest = null;
    for (const body of messageBodies()) {
      const {own, quoted} = idsIn(body);
      // le message vient de s'afficher : si c'est vous l'expéditeur, cette ouverture est la vôtre
      if (!seenBodies.has(body) && own.length + quoted.length) {
        seenBodies.add(body);
        [...own, ...quoted].forEach((id) => selfPing(id, 'view'));
      }
      const id = own[0];
      if (!id) continue;
      latest = id;
      const box = body.closest('.adn, [data-message-id]') || body.parentElement;
      let badge = box.querySelector(':scope .pt-msg-badge');
      if (!badge) {
        badge = document.createElement('button');
        badge.type = 'button';
        badge.className = 'pt-msg-badge';
        badge.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openDrawer(badge.dataset.ptId); }, true);
        const date = box.querySelector('.gH .g3') || box.querySelector('.g3');
        if (date?.parentElement) date.parentElement.insertBefore(badge, date);
        else body.parentElement.insertBefore(badge, body);
      }
      badge.dataset.ptId = id;
      paintBadge(badge, statsById.get(id));
    }
    paintThreadStatus(latest);
  }

  function paintBadge(badge, e) {
    put(badge, {
      cls: `pt-msg-badge ${opened(e) ? 'pt-opened' : ''}`,
      title: e ? summary(e) : 'Message suivi',
      html: `<span class="pt-ticks">${checks(e)}</span>${e ? `<span>${(e.open_count || 0) > 0 ? `Ouvert ${times(e.open_count)}` : 'Pas encore ouvert'}${(e.click_count || 0) > 0 ? ` · ${clicksTxt(e.click_count)}` : ''}</span>` : '<span>Suivi</span>'}`,
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
    }
    return best.sort((a, b) => Date.parse(b.sent_at || b.created_at) - Date.parse(a.sent_at || a.created_at))[0];
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
        const cell = row.querySelector('.xW') || row.querySelector('td:last-child');
        if (!cell) return;
        badge = document.createElement('button');
        badge.type = 'button';
        badge.className = 'pt-row-checks';
        badge.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openDrawer(badge.dataset.ptId); }, true);
        cell.prepend(badge);
      }
      if (badge.dataset.ptId !== email.id) badge.dataset.ptId = email.id;
      put(badge, {
        cls: `pt-row-checks ${opened(email) ? 'pt-row-opened' : 'pt-row-unopened'}${(email.click_count || 0) > 0 ? ' pt-row-clicked' : ''}`,
        title: summary(email),
        html: checks(email),
      });
    });
  }

  function paintThreadStatus(latestId) {
    const h2 = document.querySelector('h2.hP');
    const old = document.querySelector('.pt-thread-status');
    let email = latestId ? statsById.get(latestId) : null;
    if (!email && h2) email = emails.filter((e) => norm(e.subject) === norm(h2.textContent)).sort((a, b) => Date.parse(b.sent_at || b.created_at) - Date.parse(a.sent_at || a.created_at))[0] || null;
    if (!email || !h2) { old?.remove(); return; }
    const el = old || document.createElement('button');
    if (!old) {
      el.type = 'button';
      el.addEventListener('click', () => openDrawer(el.dataset.ptId));
      h2.insertAdjacentElement('afterend', el);
    }
    if (el.dataset.ptId !== email.id) el.dataset.ptId = email.id;
    put(el, {
      cls: `pt-thread-status ${opened(email) ? 'pt-opened' : ''}`,
      title: summary(email),
      html: `${opened(email) ? '✓✓' : '✓'} <span>${(email.open_count || 0) > 0 ? `Ouvert ${times(email.open_count)}` : 'Pas encore ouvert'}${(email.click_count || 0) > 0 ? ` · ${clicksTxt(email.click_count)}` : ''}</span>`,
    });
  }

  function paintAll() {
    scanRows();
    for (const badge of $$('.pt-msg-badge')) paintBadge(badge, statsById.get(badge.dataset.ptId));
    const latest = displayedIds().at(-1) || null;
    paintThreadStatus(latest);
  }

  /* ——— Le volet de suivi ——— */
  let drawer = null;
  let drawerOpen = false;
  let selectedId = null;

  function ensureLauncher() {
    if (document.querySelector('.pt-gmail-launcher')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pt-gmail-launcher';
    b.title = 'Ouvrir Prospect Tracker';
    b.innerHTML = '<span class="pt-launcher-icon">✓✓</span><span class="pt-launcher-text">Suivi</span>';
    b.addEventListener('click', () => (drawerOpen ? closeDrawer() : openDrawer()));
    document.body.appendChild(b);
  }

  function ensureDrawer() {
    if (drawer) return drawer;
    drawer = document.createElement('aside');
    drawer.className = 'pt-drawer';
    drawer.innerHTML = `
      <div class="pt-drawer-head">
        <div class="pt-brand"><span class="pt-brand-icon">✓✓</span><span>Prospect Tracker</span></div>
        <div class="pt-head-actions">
          <button class="pt-icon-btn pt-refresh" title="Actualiser">↻</button>
          <button class="pt-icon-btn pt-close" title="Fermer">×</button>
        </div>
      </div>
      <div class="pt-drawer-body"></div>`;
    drawer.querySelector('.pt-close').addEventListener('click', closeDrawer);
    drawer.querySelector('.pt-refresh').addEventListener('click', async () => {
      const r = drawer.querySelector('.pt-refresh');
      r.classList.add('pt-spin');
      await refreshData(true);
      if (selectedId) await renderDetail(selectedId);
      else renderList();
      r.classList.remove('pt-spin');
    });
    document.body.appendChild(drawer);
    return drawer;
  }

  async function openDrawer(id = null) {
    ensureDrawer();
    drawerOpen = true;
    selectedId = id;
    drawer.classList.add('pt-drawer-open');
    if (id) await renderDetail(id);
    else { renderList(); refreshData(true); }
  }

  function closeDrawer() {
    if (!drawer) return;
    drawerOpen = false;
    selectedId = null;
    drawer.classList.remove('pt-drawer-open');
  }

  function renderList() {
    if (!drawer) return;
    const body = drawer.querySelector('.pt-drawer-body');
    if (!config.hasToken) {
      body.innerHTML = '<div class="pt-error">Ajoutez votre jeton dans les réglages de Prospect Tracker (icône de l’extension, puis « Réglages »).</div>';
      return;
    }
    const list = emails.slice(0, 80);
    body.innerHTML = `
      <div class="pt-summary">
        <div><strong>${list.length}</strong><span>Suivis</span></div>
        <div><strong>${list.filter(opened).length}</strong><span>Ouverts</span></div>
        <div><strong>${list.filter((e) => (e.click_count || 0) > 0).length}</strong><span>Cliqués</span></div>
      </div>
      <div class="pt-section-title">Derniers mails suivis</div>
      <div class="pt-mail-list">${list.length ? list.map((e) => `
        <button class="pt-mail-card" data-id="${esc(e.id)}">
          <div class="pt-mail-status ${opened(e) ? 'opened' : ''}">${opened(e) ? '✓✓' : '✓'}</div>
          <div class="pt-mail-main">
            <div class="pt-mail-to">${esc(e.recipient || 'Destinataire inconnu')}</div>
            <div class="pt-mail-subject">${esc(e.subject || '(sans objet)')}</div>
            <div class="pt-mail-meta">${(e.open_count || 0) > 0 ? `Ouvert ${times(e.open_count)} · ${ago(e.last_open_at)}` : `Pas encore ouvert · envoyé ${ago(e.sent_at || e.created_at)}`}${(e.click_count || 0) > 0 ? ` · ${clicksTxt(e.click_count)}` : ''}</div>
          </div>
          <div class="pt-mail-arrow">›</div>
        </button>`).join('') : '<div class="pt-empty">Aucun mail suivi pour l’instant.</div>'}
      </div>`;
    body.querySelectorAll('.pt-mail-card').forEach((card) => card.addEventListener('click', () => renderDetail(card.dataset.id)));
  }

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

  async function renderDetail(id) {
    if (!drawer) return;
    selectedId = id;
    const body = drawer.querySelector('.pt-drawer-body');
    body.innerHTML = '<div class="pt-loading">Chargement de l’activité…</div>';
    const r = await ask({type: 'details', id});
    if (selectedId !== id) return;
    if (!r.ok || !r.email) {
      body.innerHTML = `<button class="pt-back">‹ Tous les mails suivis</button><div class="pt-error">Activité introuvable${r.error ? ` (${esc(r.error)})` : ''}.</div>`;
      body.querySelector('.pt-back').addEventListener('click', () => { selectedId = null; renderList(); });
      return;
    }
    const e = r.email;
    statsById.set(e.id, e);
    // les signaux comptés, numérotés dans l'ordre : 1re ouverture, puis ré-ouvertures
    const asc = [...(r.events || [])].sort((a, b) => a.created_at.localeCompare(b.created_at));
    let n = 0;
    const rows = asc.map((ev) => {
      if (!ev.counted) return {ev, ignored: true, title: ev.type === 'click' ? 'Clic' : 'Ouverture', sub: IGNORED[ev.reason] || 'Non compté'};
      if (ev.type === 'click') return {ev, title: 'Lien cliqué', sub: linkLabel(ev.url)};
      n++;
      const base = n === 1 ? 'Ouvert' : `Ré-ouvert (${ordinal(n)} fois)`;
      return {ev, title: ev.reason === 'implied' ? `${base}, déduit du clic` : base, sub: ev.reason === 'implied' ? 'Le clic prouve l’ouverture (images bloquées)' : VIA[ev.reason] || ''};
    }).reverse();
    const counted = rows.filter((x) => !x.ignored);
    const ignored = rows.filter((x) => x.ignored);
    const item = (x) => `
      <div class="pt-event ${x.ignored ? 'pt-event-ignored' : ''}">
        <div class="pt-event-icon ${x.ev.type === 'click' ? 'click' : 'open'}">${x.ev.type === 'click' ? '↗' : '◉'}</div>
        <div class="pt-event-copy"><strong>${esc(x.title)}</strong><span>${esc(when(x.ev.created_at))}${x.sub ? ` · ${esc(x.sub)}` : ''}</span></div>
      </div>`;
    const isOpen = opened(e);
    body.innerHTML = `
      <button class="pt-back">‹ Tous les mails suivis</button>
      <div class="pt-detail-title">${esc(e.subject || '(sans objet)')}</div>
      <div class="pt-detail-meta">Envoyé ${esc(when(e.sent_at || e.created_at))}<br>À ${esc(e.recipient || 'destinataire inconnu')}</div>
      <div class="pt-detail-status ${isOpen ? 'opened' : ''}">
        <span class="pt-detail-checks">${isOpen ? '✓✓' : '✓'}</span>
        <span>${(e.open_count || 0) > 0 ? `Ouvert ${times(e.open_count)}` : 'Pas encore d’ouverture détectée'}</span>
        ${(e.click_count || 0) > 0 ? `<span class="pt-click-count">${clicksTxt(e.click_count)}</span>` : ''}
      </div>
      ${(e.open_count || 0) > 0 ? `<div class="pt-facts"><div><span>Première ouverture</span><b>${esc(when(e.first_open_at))}</b></div><div><span>Dernière ouverture</span><b>${esc(ago(e.last_open_at))}</b></div>${(e.click_count || 0) > 0 ? `<div><span>Dernier clic</span><b>${esc(ago(e.last_click_at))}</b></div>` : ''}</div>` : ''}
      <div class="pt-section-title">Activité</div>
      <div class="pt-timeline">${counted.length ? counted.map(item).join('') : '<div class="pt-empty pt-empty-activity">Aucune ouverture ni aucun clic pour l’instant.</div>'}</div>
      ${ignored.length ? `<details class="pt-ignored"><summary>${ignored.length > 1 ? `${ignored.length} signaux ignorés` : '1 signal ignoré'} (vous-même, doublons, robots)</summary>${ignored.map(item).join('')}</details>` : ''}
      <p class="pt-note">Une ouverture n’est détectée que si les images s’affichent chez le destinataire ; un clic compte aussi comme ouverture. Vos propres lectures, les doublons et les antivirus ne sont pas comptés.</p>`;
    body.querySelector('.pt-back').addEventListener('click', () => { selectedId = null; renderList(); });
  }

  /* ——— Boucle ——— */
  let queued = false;
  function scanAll() {
    if (!config.apiBase) return;
    scanComposes();
    scanMessages();
    scanRows();
    ensureLauncher();
  }
  const queueScan = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; scanAll(); });
  };

  loadConfig().then(() => {
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
