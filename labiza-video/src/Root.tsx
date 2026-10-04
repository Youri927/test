import React from 'react';
import {Composition} from 'remotion';
import {Film, FILM_FRAMES} from './Film';
import {FPS, H, W} from './util';

export const Root: React.FC = () => (
  <>
    <Composition id="Journee" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={W} height={H} defaultProps={{sound: true}} />
    <Composition id="Journee-Muet" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={W} height={H} defaultProps={{sound: false}} />
  </>
);
