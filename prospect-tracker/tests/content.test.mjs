// Teste le script injecté (extension/content.js) dans un Gmail simulé, avec Playwright.
// node tests/content.test.mjs
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');
const here = dirname(fileURLToPath(import.meta.url));
const CONTENT = readFileSync(resolve(here, '../extension/content.js'), 'utf8');
const CSS = readFileSync(resolve(here, '../extension/content.css'), 'utf8');
const BASE = 'https://demo.supabase.co/functions/v1/mail-tracker';
const enc = encodeURIComponent;

const oldLink = `${BASE}?action=click&id=OLD&u=${enc('https://monsite.fr/portfolio')}`;
const googleWrapped = `https://www.google.com/url?q=${enc(`${BASE}?action=click&id=OLD2&u=${enc('https://monsite.fr/contact')}`)}&source=gmail&ust=1`;
const oldPixel = `https://ci3.googleusercontent.com/meips/ADKq_abc=s0-d-e1-ft#${BASE}?action=open&id=OLD`;

const PAGE = `<!doctype html><html><head><meta charset="utf-8"><title>Boîte de réception - moi@gmail.com - Gmail</title><style>${CSS}</style></head><body>
<!-- une liste -->
<table><tbody>
  <tr class="zA" id="row1"><td><span email="prospect@acme.fr" name="Jean Dupont">Jean</span></td><td><span class="bog">Votre site</span></td><td class="xW"><span>10:12</span></td></tr>
  <tr class="zA" id="row2"><td><span email="autre@b.fr">Paul</span></td><td><span class="bog">Votre site</span></td><td class="xW"><span>09:40</span></td></tr>
  <tr class="zA" id="row3"><td><span email="moi@gmail.com" name="moi">moi</span>, <span email="prospect@acme.fr" name="Jean Dupont">Jean</span></td><td><span class="bog">RE : Votre site</span></td><td class="xW"><span>hier</span></td></tr>
  <tr class="zA" id="row4"><td><span email="inconnu@c.fr">X</span></td><td><span class="bog">Votre site</span></td><td class="xW"><span>lun.</span></td></tr>
</tbody></table>

<!-- un fil affiché -->
<div role="main">
  <h2 class="hP">Votre site</h2>
  <div class="adn" data-message-id="m1">
    <table><tr><td><span class="gD" email="moi@gmail.com" name="Moi">Moi</span> à <span class="g2" email="prospect@acme.fr" name="Jean Dupont">Jean</span></td><td class="gH"><span class="g3">10:12</span></td></tr></table>
    <div class="a3s"><img src="https://ci3.googleusercontent.com/meips/xyz=s0-d-e1-ft#${BASE}?action=open&amp;id=E1" width="1" height="1">
      Bonjour, voici <a id="tracked" href="https://www.google.com/url?q=${enc(`${BASE}?action=click&id=E1&u=${enc('https://monsite.fr/offre')}`)}">notre offre</a>.
      <div class="gmail_quote"><img src="https://ci3.googleusercontent.com/meips/q=s0#${BASE}?action=open&amp;id=E0"></div>
    </div>
  </div>
</div>

<!-- une nouvelle rédaction (fenêtre) -->
<div role="dialog" id="compose">
  <input name="subjectbox" value="Votre site">
  <div class="to"><span email="prospect@acme.fr">Jean</span></div>
  <div class="editor-and-toolbar">
  <div contenteditable="true" role="textbox" id="body1"><div dir="ltr">Bonjour Jean,<br>Notre offre : https://monsite.fr/offre.<br>
    Portfolio : <a href="${oldLink}">ici</a>, contact : <a href="${googleWrapped}">là</a>, <a href="mailto:a@b.fr">mail</a>
    <img src="${oldPixel}" width="1" height="1"></div>
    <div class="gmail_quote">Le 3 oct. Jean a écrit : <a href="${oldLink}">ancien lien</a><img src="${BASE}?action=open&amp;id=OLD"></div>
  </div>
  <table><tr><td><div class="dC"><div role="button" id="send1" data-tooltip="Envoyer ‪(Ctrl+Entrée)‬" aria-label="Envoyer ‪(Ctrl+Entrée)‬">Envoyer</div></div></td>
  <td><div role="button" aria-label="Plus d'options d'envoi">▾</div></td></tr></table>
  </div>
</div>

<!-- une réponse tapée dans le fil -->
<div class="inline-reply" id="reply">
  <span email="prospect@acme.fr">Jean</span>
  <div contenteditable="true" g_editable="true" role="textbox" id="body2">Je reviens vers vous : <a href="https://monsite.fr/rdv">prendre rendez-vous</a></div>
  <div><div role="button" id="send2" data-tooltip="Envoyer ‪(Ctrl+Entrée)‬">Envoyer</div></div>
</div>

<script>
  // ——— Gmail simulé : au clic sur Envoyer (ou Ctrl+Entrée), il « envoie » le contenu tel qu'il est à cet instant ———
  window.sent = [];
  const send = (btn) => {
    const root = btn.closest('#compose, #reply');
    const body = root.querySelector('[contenteditable]');
    window.sent.push({root: root.id, html: body.innerHTML, at: Date.now()});
    root.remove();
  };
  document.addEventListener('click', (e) => { const b = e.target.closest('#send1, #send2'); if (b) send(b); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) { const root = e.target.closest('#compose, #reply'); if (root) send(root.querySelector('[role=button]')); }
  });

  // ——— chrome.* simulé : le service en arrière-plan ———
  window.messages = [];
  window.registerDelay = 120;
  let n = 0;
  const now = Date.now();
  const iso = (ms) => new Date(now - ms).toISOString();
  const EMAILS = [
    {id: 'E1', recipient: 'prospect@acme.fr', subject: 'Votre site', sent_at: iso(3600e3), created_at: iso(3600e3), open_count: 2, click_count: 1, first_open_at: iso(3000e3), last_open_at: iso(300e3), last_click_at: iso(200e3)},
    {id: 'E0', recipient: 'autre@b.fr', subject: 'Votre site', sent_at: iso(7200e3), created_at: iso(7200e3), open_count: 0, click_count: 0},
  ];
  window.chrome = {
    storage: {onChanged: {addListener() {}}},
    runtime: {
      lastError: null,
      sendMessage(msg, cb) {
        window.messages.push(msg);
        const reply = (data, delay = 5) => setTimeout(() => cb({ok: true, ...data}), delay);
        if (msg.type === 'config') return reply({apiBase: '${BASE}', trackingDefault: true, hasToken: true});
        if (msg.type === 'register') return reply({id: 'NEW' + (++n)}, window.registerDelay);
        if (msg.type === 'refresh') return reply({emails: EMAILS});
        if (msg.type === 'stats') return reply({emails: EMAILS.filter((e) => msg.ids.includes(e.id))});
        if (msg.type === 'details' && msg.id !== 'E1') return reply({email: EMAILS.find((e) => e.id === msg.id), events: []});
        if (msg.type === 'details') return reply({email: EMAILS[0], events: [
          {type: 'open', counted: true, reason: 'gmail', created_at: iso(3000e3)},
          {type: 'open', counted: false, reason: 'dup', created_at: iso(2990e3)},
          {type: 'open', counted: false, reason: 'self', created_at: iso(1000e3)},
          {type: 'click', counted: true, reason: 'human', url: 'https://monsite.fr/offre', created_at: iso(200e3)},
          {type: 'open', counted: true, reason: 'implied', created_at: iso(200e3)},
          {type: 'click', counted: false, reason: 'bot', url: 'https://monsite.fr/offre', created_at: iso(3590e3)},
        ]});
        return reply({});
      },
    },
  };
</script>
<script>${CONTENT.replace(/<\/script/gi, '<\\/script')}</script>
</body></html>`;

const b = await chromium.launch();
const page = await b.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.setContent(PAGE);
await page.waitForTimeout(500);
const results = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push(`✓ ${name}`);
  } catch (err) {
    results.push(`✗ ${name}\n    ${err.message.split('\n').join('\n    ')}`);
  }
};

await check('l’interrupteur « Suivi » apparaît dans la fenêtre et dans la réponse du fil', async () => {
  assert.equal(await page.locator('#compose .pt-compose-toggle').count(), 1);
  assert.equal(await page.locator('#reply .pt-compose-toggle').count(), 1);
  assert.equal(await page.locator('#compose .pt-compose-toggle').getAttribute('data-state'), 'on');
});

await check('à l’envoi : tous les liens portent l’identifiant du NOUVEAU mail, anciens pixels retirés', async () => {
  await page.click('#send1');
  await page.waitForTimeout(100);
  const sent = await page.evaluate(() => window.sent.find((s) => s.root === 'compose'));
  assert.ok(sent, 'le mail est parti');
  const doc = await page.evaluate((html) => {
    const d = document.createElement('div');
    d.innerHTML = html;
    return {
      links: [...d.querySelectorAll('a')].map((a) => a.getAttribute('href')),
      pixels: [...d.querySelectorAll('img')].map((i) => i.getAttribute('src')),
      firstIsPixel: d.firstElementChild?.tagName === 'IMG',
    };
  }, sent.html);
  assert.ok(!/OLD/.test(sent.html), 'plus aucune trace des anciens mails');
  const targets = doc.links.filter((h) => h.startsWith('http')).map((h) => {
    const u = new URL(h);
    return `${u.searchParams.get('id')} → ${u.searchParams.get('u')}`;
  });
  assert.deepEqual(targets, ['NEW1 → https://monsite.fr/offre', 'NEW1 → https://monsite.fr/portfolio', 'NEW1 → https://monsite.fr/contact', 'NEW1 → https://monsite.fr/portfolio']);
  assert.ok(doc.links.includes('mailto:a@b.fr'), 'les liens mailto ne sont pas touchés');
  assert.deepEqual(doc.pixels, [`${BASE}?action=open&id=NEW1`]);
  assert.ok(doc.firstIsPixel, 'le pixel est en tête, hors citation et signature');
});

await check('le mail n’est noté « envoyé » qu’une fois la fenêtre fermée, avec objet et destinataire', async () => {
  await page.waitForTimeout(900);
  const m = await page.evaluate(() => window.messages.filter((x) => x.type === 'mark-sent'));
  assert.equal(m.length, 1);
  assert.equal(m[0].id, 'NEW1');
  assert.equal(m[0].subject, 'Votre site');
  assert.equal(m[0].recipient, 'prospect@acme.fr');
  assert.equal(m[0].sender, 'moi@gmail.com');
});

await check('réponse dans le fil envoyée au clavier (Ctrl+Entrée) : suivie aussi', async () => {
  await page.focus('#body2');
  await page.keyboard.press('Control+Enter');
  await page.waitForTimeout(100);
  const sent = await page.evaluate(() => window.sent.find((s) => s.root === 'reply'));
  assert.ok(sent, 'la réponse est partie');
  assert.match(sent.html, /action=click&amp;id=NEW2&amp;u=https%3A%2F%2Fmonsite\.fr%2Frdv/);
  assert.match(sent.html, /action=open&amp;id=NEW2/);
  const reg = await page.evaluate(() => window.messages.filter((x) => x.type === 'register').at(-1));
  assert.equal(reg.subject, 'Re: Votre site');
});

await check('si le serveur est lent, l’envoi attend l’identifiant puis part, préparé', async () => {
  await page.evaluate(() => {
    window.registerDelay = 1200;
    document.body.insertAdjacentHTML('beforeend', `<div role="dialog" id="compose"><input name="subjectbox" value="Relance"><span email="x@y.fr">X</span>
      <div contenteditable="true" role="textbox">Voir https://monsite.fr</div>
      <div><div role="button" id="send1" data-tooltip="Envoyer">Envoyer</div></div></div>`);
  });
  await page.waitForTimeout(150);
  await page.click('#send1');
  await page.waitForTimeout(300);
  let n = await page.evaluate(() => window.sent.filter((s) => s.root === 'compose').length);
  assert.equal(n, 1, 'retenu tant que l’identifiant n’est pas arrivé');
  await page.waitForTimeout(1300);
  const last = await page.evaluate(() => window.sent.filter((s) => s.root === 'compose').at(-1));
  n = await page.evaluate(() => window.sent.filter((s) => s.root === 'compose').length);
  assert.equal(n, 2, 'puis envoyé');
  assert.match(last.html, /id=NEW3/);
});

await check('fil affiché : statut du message lu dans son propre pixel, sans doublon sur l’objet', async () => {
  const txt = await page.locator('.adn .pt-msg-badge').textContent();
  assert.match(txt, /Ouvert 2 fois · 1 clic/);
  assert.match(await page.locator('.adn .pt-msg-badge').getAttribute('class'), /pt-s-clicked/);
  assert.equal(await page.locator('.pt-thread-status').count(), 0);
});

await check('vos propres lectures sont signalées (message affiché et citation)', async () => {
  const pings = await page.evaluate(() => window.messages.filter((x) => x.type === 'self').map((x) => `${x.id}:${x.kind}:${x.viewer}`));
  assert.ok(pings.includes('E1:view:moi@gmail.com'));
  assert.ok(pings.includes('E0:view:moi@gmail.com'));
});

await check('votre propre clic sur un lien suivi est signalé', async () => {
  await page.evaluate(() => document.getElementById('tracked').addEventListener('click', (e) => e.preventDefault()));
  await page.click('#tracked');
  const pings = await page.evaluate(() => window.messages.filter((x) => x.type === 'self' && x.kind === 'click').map((x) => x.id));
  assert.deepEqual(pings, ['E1']);
});

await check('liste : objet ET destinataire ; jamais le statut d’un autre mail au même objet', async () => {
  const cls = async (id) => page.locator(`#${id} .pt-row-checks`).count().then((c) => (c ? page.locator(`#${id} .pt-row-checks`).getAttribute('class') : 'aucun'));
  assert.match(await cls('row1'), /pt-row-opened/);
  assert.match(await cls('row2'), /pt-row-unopened/);
  assert.match(await cls('row3'), /pt-row-opened/);
  assert.equal(await cls('row4'), 'aucun');
  assert.equal(await page.locator('#row1 .pt-row-checks').getAttribute('data-pt-id'), 'E1');
  assert.equal(await page.locator('#row2 .pt-row-checks').getAttribute('data-pt-id'), 'E0');
});

await check('Gmail réutilise une ligne pour un autre mail : l’ancien statut disparaît', async () => {
  await page.evaluate(() => {
    const r = document.getElementById('row1');
    r.querySelector('.bog').textContent = 'Facture octobre';
    r.querySelector('[email]').setAttribute('email', 'compta@z.fr');
  });
  await page.waitForTimeout(200);
  assert.equal(await page.locator('#row1 .pt-row-checks').count(), 0);
});

await check('pas de boucle : la page ne bouge plus quand rien ne change', async () => {
  const count = await page.evaluate(() => new Promise((ok) => {
    let n = 0;
    const mo = new MutationObserver((l) => { n += l.length; });
    mo.observe(document.body, {childList: true, subtree: true, attributes: true, characterData: true});
    setTimeout(() => { mo.disconnect(); ok(n); }, 1200);
  }));
  assert.ok(count < 5, `${count} modifications en 1,2 s`);
});

await check('volet : ouvertures numérotées, clic, ouverture déduite, signaux ignorés à part', async () => {
  await page.click('.adn .pt-msg-badge');
  await page.waitForTimeout(150);
  assert.equal(await page.locator('.pt-panel').getAttribute('data-view'), 'detail');
  const text = await page.locator('.pt-panel-body').innerText();
  for (const s of ['Ouvert 2 fois', 'Ré-ouvert (2e fois), déduit du clic', 'Lien cliqué', 'monsite.fr/offre', 'Ouvert\n', '3 signaux ignorés', 'Première ouverture', 'Jean Dupont', 'Envoyé']) assert.ok(text.includes(s), `manque « ${s.trim()} »\n${text}`);
  await page.click('.pt-close');
  await page.waitForTimeout(50);
  assert.doesNotMatch(await page.locator('.pt-panel').getAttribute('class'), /pt-open/);
});

await check('carte au survol d’une coche : statut, contact, dernières actions, lien vers le détail', async () => {
  await page.hover('#row3 .pt-row-checks');
  await page.waitForTimeout(500);
  const pop = page.locator('.pt-pop');
  assert.match(await pop.getAttribute('class'), /pt-pop-show/);
  const text = await pop.innerText();
  for (const s of ['Ouvert 2 fois', 'Dernière ouverture', 'Jean Dupont', 'Votre site', 'Lien cliqué', 'Ré-ouvert (2e fois), déduit du clic', 'Voir toute l’activité']) assert.ok(text.includes(s), `manque « ${s} »\n${text}`);
  assert.ok(!text.includes('Robot'), 'les signaux ignorés ne sont pas dans la carte');
  const box = await pop.boundingBox();
  const vp = page.viewportSize();
  assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= vp.width && box.y + box.height <= vp.height, 'la carte reste dans la fenêtre');
  await page.click('.pt-pop-more');
  await page.waitForTimeout(150);
  assert.equal(await page.locator('.pt-panel').getAttribute('data-view'), 'detail');
  assert.doesNotMatch(await pop.getAttribute('class'), /pt-pop-show/);
  await page.click('.pt-close');
  await page.mouse.move(5, 5);
});

await check('volet, onglet Activité : chiffres et fil des derniers gestes', async () => {
  await page.click('.pt-launcher');
  await page.waitForTimeout(150);
  assert.equal(await page.locator('.pt-panel').getAttribute('data-view'), 'activity');
  const text = await page.locator('.pt-panel-body').innerText();
  for (const s of ['Suivis', 'Ouverts', 'Cliqués', '50 %', 'Jean Dupont a cliqué un lien', 'Aujourd’hui']) assert.ok(text.includes(s), `manque « ${s} »\n${text}`);
  assert.ok(!text.includes('autre@b.fr'), 'un mail jamais ouvert n’est pas une activité');
});

await check('volet, onglet Mails suivis : filtres et recherche', async () => {
  await page.click('.pt-tab[data-tab="mails"]');
  await page.waitForTimeout(50);
  assert.equal(await page.locator('.pt-mail').count(), 2);
  await page.click('[data-filter="unopened"]');
  assert.equal(await page.locator('.pt-mail').count(), 1);
  assert.match(await page.locator('.pt-mail').innerText(), /autre@b\.fr/);
  await page.click('[data-filter="all"]');
  await page.fill('.pt-search input', 'dupont');
  assert.equal(await page.locator('.pt-mail').count(), 1);
  assert.match(await page.locator('.pt-mail').innerText(), /Ouvert 2 fois/);
  await page.fill('.pt-search input', 'zzz');
  assert.match(await page.locator('.pt-mails').innerText(), /Aucun résultat/);
  await page.click('.pt-close');
});

await check('message replié : le statut passe à côté de l’objet du fil (objet ET destinataire)', async () => {
  await page.evaluate(() => { document.querySelector('.adn .a3s').remove(); document.querySelector('.adn .pt-msg-badge').remove(); });
  await page.waitForTimeout(150);
  assert.match(await page.locator('.pt-thread-status').textContent(), /Ouvert 2 fois/);
  assert.equal(await page.locator('.pt-thread-status').getAttribute('data-pt-id'), 'E1');
});

await check('interrupteur : un clic coupe le suivi du mail, avec un message', async () => {
  await page.evaluate(() => { window.registerDelay = 50; });
  await page.evaluate(() => document.body.insertAdjacentHTML('beforeend', `<div role="dialog" id="compose3"><input name="subjectbox" value="Test"><span email="z@z.fr">Z</span>
    <div contenteditable="true" role="textbox">Bonjour</div><div><div role="button" data-tooltip="Envoyer">Envoyer</div></div></div>`));
  await page.waitForTimeout(400);
  const t = page.locator('#compose3 .pt-compose-toggle');
  assert.equal(await t.getAttribute('data-state'), 'on');
  await t.click();
  assert.equal(await t.getAttribute('data-state'), 'off');
  assert.equal(await t.getAttribute('aria-pressed'), 'false');
  assert.match(await page.locator('.pt-toast').innerText(), /Suivi désactivé/);
});

console.log(results.join('\n'));
if (errors.length) console.log('Erreurs JS :', errors);
await b.close();
const failed = results.filter((r) => r.startsWith('✗')).length + errors.length;
console.log(failed ? `\n${failed} échec(s)` : '\nTout est bon.');
process.exit(failed ? 1 : 0);
