import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import before from '../../public/before/marks.json';
import {Line} from '../Bits';
import {BrowserAt, Box} from '../Stage';
import {barH, browserH} from '../Screen';
import {TODAY} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, F, H2, H3, range} from '../util';

// le site actuel, capturé en entier en 2× le 8 octobre 2026 (capture/before.mjs) : 1440 px CSS de large
const PAGE_W = 1440;
const B: Box = {x: 1296, y: 566, w: 1060};
const VW = B.w;
const VH = browserH(B.w) - barH(B.w);

type Page = {name: 'home' | 'product' | 'book' | 'contact'; path: string; h: number};
const PAGES: Page[] = [
  {name: 'home', path: '', h: before.home.height},
  {name: 'product', path: '/products/dental-implants', h: before.product.height},
  {name: 'book', path: '/pages/book-an-appointment', h: before.book.height},
  {name: 'contact', path: '/pages/contact', h: before.contact.height},
];

/** Cadrages : page affichée, point du document au centre de la fenêtre, grossissement */
type View = {t: number; page: number; cx: number; cy: number; z: number};
const [N1, N2, N3] = TODAY.pages;
const VIEWS: View[] = [
  {t: 0, page: 0, cx: 720, cy: 450, z: 1},
  {t: N1, page: 0, cx: 720, cy: 480, z: 1.05},
  // un soin vendu comme un produit : le prix, le panier, PayPal
  {t: N1, page: 1, cx: 720, cy: 450, z: 1},
  {t: N1 + 26, page: 1, cx: 720, cy: 450, z: 1},
  {t: N1 + 78, page: 1, cx: 720, cy: 384, z: 1.78},
  {t: N2, page: 1, cx: 724, cy: 388, z: 1.82},
  // la page de rendez-vous : une diapositive du modèle
  {t: N2, page: 2, cx: 720, cy: 450, z: 1},
  {t: N2 + 26, page: 2, cx: 720, cy: 450, z: 1},
  {t: N2 + 76, page: 2, cx: 720, cy: 590, z: 1.72},
  {t: N3, page: 2, cx: 722, cy: 594, z: 1.76},
  // la page Contact : un numéro qu'on ne peut pas toucher, un formulaire en texte
  {t: N3, page: 3, cx: 720, cy: 450, z: 1},
  {t: N3 + 26, page: 3, cx: 720, cy: 450, z: 1},
  {t: N3 + 80, page: 3, cx: 720, cy: 806, z: 1.58},
  {t: 880, page: 3, cx: 722, cy: 812, z: 1.62},
];
const viewAt = (t: number): View => {
  let a = VIEWS[0];
  for (let i = 1; i < VIEWS.length; i++) {
    const b = VIEWS[i];
    if (t < b.t) {
      if (a.page !== b.page) return a;
      const u = E.inOut((t - a.t) / (b.t - a.t));
      return {t, page: a.page, cx: a.cx + (b.cx - a.cx) * u, cy: a.cy + (b.cy - a.cy) * u, z: Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * u)};
    }
    a = b;
  }
  return VIEWS[VIEWS.length - 1];
};

/** Les preuves surlignées (px CSS du document), page et image d'apparition */
type Mark = {page: number; at: number; x: number; y: number; w: number; h: number};
const [M1, M2, M3, M4, M5, M6] = TODAY.marks;
const MARKS: Mark[] = [
  {page: 1, at: M1, x: 660, y: 256, w: 120, h: 40}, // $0.00 USD
  {page: 1, at: M2, x: 568, y: 406, w: 304, h: 50}, // Add to cart
  {page: 1, at: M3, x: 568, y: 464, w: 304, h: 50}, // Pay with PayPal
  {page: 2, at: M4, x: 552, y: 504, w: 336, h: 108}, // Image slide / Tell your brand's story through images
  {page: 3, at: M5, x: 626, y: 662, w: 212, h: 38}, // Phone: (239) 241-2951, en texte
  {page: 3, at: M6, x: 458, y: 910, w: 524, h: 40}, // [Contact Form: Name, Email, Phone, Message]
];

const FINDINGS: [string, string][] = [
  ['Treatments sold as products', 'Dental implants at $0.00, with Add to cart and Pay with PayPal.'],
  ['Placeholder text left in place', '“Image slide” and “Tell your brand’s story through images” on the appointment page.'],
  ['Hard to book a visit', 'No phone number can be tapped, and where the form should be, a placeholder.'],
];

/** Aujourd'hui : le site actuel dans un navigateur ; trois constats tirés de l'analyse, la caméra va chercher chaque preuve */
export const Today: React.FC = () => {
  const t = useCurrentFrame();
  const len = LEN.Today;
  const v = viewAt(t);
  const page = PAGES[v.page];
  const k = (VW / PAGE_W) * v.z;
  const left = Math.min(0, Math.max(VW - PAGE_W * k, VW / 2 - v.cx * k));
  const top = Math.min(0, Math.max(VH - page.h * k, VH / 2 - v.cy * k));
  // navigation : la page se vide un instant, puis la suivante apparaît
  const nav = TODAY.pages.reduce((acc, n) => Math.max(acc, range(t, n - 8, n, 0, 1) * (1 - range(t, n, n + 14, 0, 1))), 0);
  const shift = (at: number) => range(t, at, at + 44, 118, 0, E.out);
  const up = (at: number) => ({opacity: range(t, at, at + 30, 0, 1), transform: `translateY(${range(t, at, at + 40, 18, 0, E.out)}px)`});
  const current = TODAY.findings.reduce((acc, at, i) => (t >= at ? i : acc), -1);
  // le navigateur arrive par le bas
  const arrive = range(t, 0, 42, 1, 0, E.out);
  return (
    <AbsoluteFill style={{background: C.today}}>
      <AbsoluteFill style={{transform: `translateY(${arrive * 640}px)`}}>
        <BrowserAt b={B} path={page.path}>
          <div style={{position: 'absolute', left, top, width: PAGE_W * k, height: page.h * k}}>
            <Img src={staticFile(`before/${page.name}.jpg`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
            {MARKS.filter((m) => m.page === v.page).map((m) => {
              const p = range(t, m.at, m.at + 26, 0, 1, E.out);
              if (p <= 0) return null;
              return (
                <React.Fragment key={m.at}>
                  <div style={{position: 'absolute', left: m.x * k, top: m.y * k, width: m.w * k * p, height: m.h * k, background: 'rgba(35, 172, 172, 0.3)', mixBlendMode: 'multiply', borderRadius: 4 * k}} />
                  <div
                    style={{
                      position: 'absolute',
                      left: m.x * k,
                      top: m.y * k,
                      width: m.w * k,
                      height: m.h * k,
                      border: `${Math.max(2.5, 1.8 * k)}px solid ${C.ink}`,
                      borderRadius: 6 * k,
                      opacity: p,
                      transform: `scale(${1.12 - 0.12 * p})`,
                    }}
                  />
                </React.Fragment>
              );
            })}
          </div>
          <div style={{position: 'absolute', inset: 0, background: C.white, opacity: nav}} />
        </BrowserAt>
      </AbsoluteFill>

      <div style={{position: 'absolute', left: 112, top: 150, width: 560}}>
        <div style={{...H2, fontSize: 76, color: C.ink}}>
          <Line shift={shift(6)}>Today, the site</Line>
          <Line shift={shift(16)}>is a web store</Line>
        </div>
        <div style={{...BODY, marginTop: 26, fontSize: 24, lineHeight: 1.45, color: C.todaySoft, ...up(44)}}>
          A Shopify store template, with the template’s placeholders still showing.
        </div>
        <div style={{marginTop: 40, borderTop: `1.5px solid ${C.todayLine}`}}>
          {FINDINGS.map(([h, p], i) => {
            const at = TODAY.findings[i];
            const on = i === current;
            return (
              <div key={h} style={{position: 'relative', padding: '20px 0 20px 46px', borderBottom: `1.5px solid ${C.todayLine}`, ...up(at), opacity: range(t, at, at + 30, 0, 1) * (on ? 1 : 0.45)}}>
                <span style={{position: 'absolute', left: 0, top: 29, width: 28, height: 14, borderRadius: 99, background: on ? C.teal : 'transparent', boxShadow: `inset 0 0 0 1.5px ${on ? C.teal : C.todaySoft}`}} />
                <div style={{...H3, fontSize: 32, color: C.ink}}>{h}</div>
                <div style={{...BODY, marginTop: 6, fontSize: 19.5, lineHeight: 1.45, color: C.todaySoft}}>{p}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 112, bottom: 44, fontFamily: F.sans, fontSize: 17, color: C.todaySoft, opacity: 0.85 * range(t, 60, 90) * (1 - range(t, len - 40, len - 10))}}>
        The current site, naplescomprehensivedentist.com, captured on October 8, 2026
      </div>
    </AbsoluteFill>
  );
};
