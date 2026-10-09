import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import before from '../../public/before/marks.json';
import {Line} from '../Bits';
import {BrowserAt, Box} from '../Stage';
import {barH, browserH} from '../Screen';
import {TODAY} from '../beats.ts';
import {LEN, pre} from '../timeline';
import {BODY, C, E, F, H2, H3, range} from '../util';

// le site actuel, capturé en 2× le 9 octobre 2026 (capture/before.mjs) : 1440 px CSS de large
const PAGE_W = 1440;
const B: Box = {x: 1296, y: 566, w: 1060};
const VW = B.w;
const VH = browserH(B.w) - barH(B.w);

type Page = {name: 'home' | 'manufacturing' | 'freeform' | 'installations' | 'barrier'; path: string; h: number};
const PAGES: Page[] = [
  {name: 'home', path: '', h: before.home.height},
  {name: 'manufacturing', path: '/barrierreef-manufacturing', h: before.manufacturing.height},
  {name: 'freeform', path: '/br-free-form-pools', h: before.freeform.height},
  {name: 'installations', path: '/fiberglass-installations', h: before.installations.height},
  {name: 'barrier', path: '/barrier-reef-pools', h: before.barrier.height},
];

type R = {x: number; y: number; w: number; h: number};
const mid = (r: R) => ({cx: r.x + r.w / 2, cy: r.y + r.h / 2});
const specials = before.manufacturing.specials as R;
const coveLen = before.freeform.coveLength as R;
const coveWid = before.freeform.coveWidth as R;
const coveTitle = before.freeform.coveTitle as R;
const gift = before.installations.gift as R;
const giftBtn = before.installations.giftButton as R;
const pdf = before.barrier.pdfLinks[0] as R;

/** Cadrages : page affichée, point du document au centre de la fenêtre, grossissement */
type View = {t: number; page: number; cx: number; cy: number; z: number};
const [N1, N2, N3, N4] = TODAY.pages;
const VIEWS: View[] = [
  {t: 0, page: 0, cx: 720, cy: 450, z: 1},
  {t: N1, page: 0, cx: 900, cy: 560, z: 1.12},
  // la page Fabrication : « Daily Specials », une offre de piscine municipale
  {t: N1, page: 1, cx: 720, cy: 1300, z: 1},
  {t: N1 + 24, page: 1, cx: 720, cy: 1330, z: 1},
  {t: N1 + 84, page: 1, ...mid({x: 560, y: 1500, w: 740, h: 140}), z: 1.62},
  {t: N2, page: 1, cx: 935, cy: 1574, z: 1.7},
  // les formes libres : la fiche du Billabong Cove
  {t: N2, page: 2, cx: 720, cy: 980, z: 1},
  {t: N2 + 24, page: 2, cx: 720, cy: 990, z: 1},
  {t: N2 + 84, page: 2, cx: coveTitle.x + 70, cy: coveTitle.y + 70, z: 2.0},
  {t: N3, page: 2, cx: coveTitle.x + 74, cy: coveTitle.y + 74, z: 2.06},
  // « Fiberglass Installations » : une carte cadeau
  {t: N3, page: 3, cx: 720, cy: 450, z: 1},
  {t: N3 + 20, page: 3, cx: 720, cy: 450, z: 1},
  {t: N3 + 80, page: 3, cx: 960, cy: 380, z: 1.3},
  {t: N4, page: 3, cx: 966, cy: 384, z: 1.32},
  // la page Barrier Reef : la fiche 2025, en lien PDF
  {t: N4, page: 4, cx: 720, cy: pdf.y + 120, z: 1},
  {t: N4 + 20, page: 4, cx: 720, cy: pdf.y + 120, z: 1},
  {t: N4 + 76, page: 4, cx: 720, cy: pdf.y + 40, z: 1.9},
  {t: 900, page: 4, cx: 720, cy: pdf.y + 30, z: 2.0},
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

/** Les preuves mesurées (px CSS du document), page et image d'apparition */
type Mark = {page: number; at: number} & R;
const [M1, M2, M3, M4, M5, M6] = TODAY.marks;
const pad = (r: R, p: number, q = p): R => ({x: r.x - p, y: r.y - q, w: r.w + 2 * p, h: r.h + 2 * q});
const MARKS: Mark[] = [
  {page: 1, at: M1, ...pad(specials, 10, 8)}, // Daily Specials : demi-tarif pour les moins de 12 ans le mardi
  {page: 1, at: M2, ...pad(before.manufacturing.slide as R, 4, 3)}, // water slide
  {page: 2, at: M3, ...pad(coveLen, 4, 2)}, // Length: 40' - 35'
  {page: 2, at: M4, ...pad(coveWid, 4, 2)}, // Width: 15' 8" - 15' 8"
  {page: 3, at: M5, ...pad({x: gift.x, y: gift.y, w: gift.w, h: giftBtn.y + giftBtn.h - gift.y}, 16, 14)}, // la carte cadeau
  {page: 4, at: M6, ...pad(pdf, 10, 6)}, // Download PDF
];

const FINDINGS: [string, string][] = [
  ['Template text left in place', '“Daily Specials”, with half-price admission for kids under 12, on the Manufacturing page.'],
  ['Cards that don’t match the models', 'Billabong Cove: 40′–35′ × 15′ 8″ on the card, 35′ 3⅛″ × 16′ on Barrier Reef’s sheet.'],
  ['A gift card for a page', '“Fiberglass Installations” holds a single block: Buy a Gift Card.'],
];

/** Une preuve mesurée : le cadre se trace, sa cote au-dessus */
const Measured: React.FC<{m: Mark; k: number; t: number}> = ({m, k, t}) => {
  const p = range(t, m.at, m.at + 30, 0, 1, E.out);
  if (p <= 0) return null;
  const sw = Math.max(2.5, 1.6 * k);
  const tick = 9 * k;
  return (
    <>
      <div style={{position: 'absolute', left: m.x * k, top: m.y * k, width: m.w * k, height: m.h * k, background: 'rgba(8, 148, 252, 0.16)', mixBlendMode: 'multiply', opacity: p, borderRadius: 4 * k}} />
      <svg width={m.w * k} height={m.h * k} style={{position: 'absolute', left: m.x * k, top: m.y * k, overflow: 'visible'}}>
        <rect x={0} y={0} width={m.w * k} height={m.h * k} rx={4 * k} fill="none" stroke={C.azure} strokeWidth={sw} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
        {/* la cote au-dessus du passage */}
        <g opacity={range(t, m.at + 8, m.at + 26)}>
          <line x1={0} x2={m.w * k * range(t, m.at + 8, m.at + 30, 0, 1, E.out)} y1={-tick * 1.4} y2={-tick * 1.4} stroke={C.azure} strokeWidth={sw * 0.8} />
          <line x1={0} x2={0} y1={-tick * 2} y2={-tick * 0.8} stroke={C.azure} strokeWidth={sw * 0.8} />
          <line x1={m.w * k} x2={m.w * k} y1={-tick * 2} y2={-tick * 0.8} stroke={C.azure} strokeWidth={sw * 0.8} opacity={p > 0.95 ? 1 : 0} />
        </g>
      </svg>
    </>
  );
};

/** Aujourd'hui : le site actuel dans un navigateur ; trois constats tirés de l'analyse, la caméra va chercher chaque preuve */
export const Today: React.FC = () => {
  // temps de la scène : la règle qui l'ouvre passe avant (images négatives)
  const t = useCurrentFrame() - pre('Today');
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
            {MARKS.filter((m) => m.page === v.page).map((m) => (
              <Measured key={m.at} m={m} k={k} t={t} />
            ))}
          </div>
          <div style={{position: 'absolute', inset: 0, background: C.white, opacity: nav}} />
        </BrowserAt>
      </AbsoluteFill>

      <div style={{position: 'absolute', left: 112, top: 140, width: 580}}>
        <div style={{...H2, fontSize: 78, color: C.ink}}>
          <Line shift={shift(6)}>Today, a GoDaddy</Line>
          <Line shift={shift(16)}>template from 2022</Line>
        </div>
        <div style={{...BODY, marginTop: 26, fontSize: 24, lineHeight: 1.45, color: C.todaySoft, ...up(44)}}>
          Their work is in there, and so is the template’s own text.
        </div>
        <div style={{marginTop: 40, borderTop: `1.5px solid ${C.todayLine}`}}>
          {FINDINGS.map(([h, p], i) => {
            const at = TODAY.findings[i];
            const on = i === current;
            return (
              <div key={h} style={{position: 'relative', padding: '20px 0 20px 46px', borderBottom: `1.5px solid ${C.todayLine}`, ...up(at), opacity: range(t, at, at + 30, 0, 1) * (on ? 1 : 0.45)}}>
                {/* une petite cote à la place de la puce */}
                <svg width={28} height={14} style={{position: 'absolute', left: 0, top: 30}}>
                  <line x1={1} x2={27} y1={7} y2={7} stroke={on ? C.azure : C.todaySoft} strokeWidth={2} />
                  <line x1={1} x2={1} y1={1} y2={13} stroke={on ? C.azure : C.todaySoft} strokeWidth={2} />
                  <line x1={27} x2={27} y1={1} y2={13} stroke={on ? C.azure : C.todaySoft} strokeWidth={2} />
                </svg>
                <div style={{...H3, fontSize: 32, color: C.ink}}>{h}</div>
                <div style={{...BODY, marginTop: 6, fontSize: 19.5, lineHeight: 1.45, color: C.todaySoft}}>{p}</div>
              </div>
            );
          })}
        </div>
        <div style={{...BODY, marginTop: 30, fontSize: 22, fontWeight: 600, color: C.azureInk, ...up(N4 + 30)}}>And their best page is a PDF.</div>
      </div>
      <div style={{position: 'absolute', left: 112, bottom: 44, fontFamily: F.sans, fontSize: 17, color: C.todaySoft, opacity: 0.85 * range(t, 60, 90) * (1 - range(t, len - 40, len - 10))}}>
        The current site, graciepools.com, captured on October 9, 2026
      </div>
    </AbsoluteFill>
  );
};
