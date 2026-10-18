import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Brand, Rise, rise} from '../Bits';
import {END} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, F, range} from '../util';

/** La phrase de l'accueil, comme sur le site : Montagu Slab très fine, serrée */
const LINE = {fontFamily: F.serif, fontWeight: 250, fontSize: 120, lineHeight: 1, letterSpacing: '-0.025em', color: C.ink, whiteSpace: 'nowrap'} as const;

/**
 * Fin, sur le blanc du site : le Z de l'accueil, rejoué en grand et aux temps du site. Le métier paraît, « The people who
 * show up. » monte en haut à gauche ; le bandeau de la maison neuve et de sa piscine s'ouvre depuis sa ligne d'horizon
 * (1,5 s, --ease-io) pendant que la photo se pose (de 1,06 à 1) ; « Every single day. » monte en bas à droite ; puis, à la
 * place du texte et du bouton de l'accueil, le logo et l'adresse du site. Fondu au noir.
 */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const t = END.l1;
  const fade = range(f, len - 46, len - 4, 1, 0, E.inOut);
  const band = range(f, t + 15, t + 105, 0, 1, E.inOut);
  const settle = range(f, t + 15, t + 129, 0, 1, E.out);
  const kicker = range(f, t, t + 48, 0, 1, E.out);
  const tail = range(f, t + 75, t + 129, 0, 1, E.out);
  // le bandeau s'ouvre depuis sa ligne d'horizon : deux volets du blanc de la page s'écartent vers le haut et le bas,
  // déplacés au sous-pixel (un calque composité chacun) ; une découpe (clip-path) avancerait au pixel entier
  const cover = (240 * band + 2).toFixed(3);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fade, background: C.paper}}>
        <div style={{position: 'absolute', left: 96, top: 104, ...BODY, fontWeight: 500, fontSize: 24, color: C.vein, opacity: kicker}}>
          Custom homes and renovations in Naples and Marco Island
        </div>
        <div style={{position: 'absolute', left: 96, top: 146}}>
          <Rise p={rise(f, t + 3)} style={LINE}>
            The people who show up.
          </Rise>
        </div>
        {/* le bandeau, un peu plus haut que sur le site (l'image est plus large) : la maison et sa piscine, comme à l'accueil */}
        <div style={{position: 'absolute', left: 0, top: 286, width: 1920, height: 480, overflow: 'hidden', background: C.stone}}>
          <Img
            src={staticFile('img/hero.jpg')}
            style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 66%', transform: `scale(${(1.06 - 0.06 * settle).toFixed(5)})`, willChange: 'transform'}}
          />
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 242, background: C.paper, transform: `translate3d(0, -${cover}px, 0)`, willChange: 'transform'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 242, background: C.paper, transform: `translate3d(0, ${cover}px, 0)`, willChange: 'transform'}} />
        </div>
        <div style={{position: 'absolute', right: 96, top: 784}}>
          <Rise p={rise(f, t + 51)} style={LINE}>
            Every single day.
          </Rise>
        </div>
        <div style={{position: 'absolute', left: 96, top: 806, opacity: tail}}>
          <Brand height={58} />
          <div style={{...BODY, marginTop: 28, fontWeight: 600, fontSize: 38, lineHeight: 1.1, letterSpacing: '0.005em', color: C.ink}}>zyndahomes.com</div>
          <div style={{...BODY, marginTop: 10, fontSize: 22, color: C.vein}}>Website redesign concept, October 2026</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
