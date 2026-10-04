import React from 'react';
import {Composition} from 'remotion';
import {Presentation, PRES_FRAMES} from './Presentation';

export const Root: React.FC = () => (
  <>
    <Composition id="Presentation-Scottsdale" component={Presentation} durationInFrames={PRES_FRAMES} fps={60} width={1920} height={1080} defaultProps={{sound: true}} />
    <Composition id="Presentation-Scottsdale-Bruitages" component={Presentation} durationInFrames={PRES_FRAMES} fps={60} width={1920} height={1080} defaultProps={{sound: true, music: false}} />
    <Composition id="Presentation-Scottsdale-Muet" component={Presentation} durationInFrames={PRES_FRAMES} fps={60} width={1920} height={1080} defaultProps={{sound: false}} />
  </>
);
