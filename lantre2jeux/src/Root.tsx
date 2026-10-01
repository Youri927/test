import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './lib/anim';
import {TOTAL_FRAMES, Video} from './Video';
import {Ad, AD_FRAMES} from './ad/Ad';

export const Root: React.FC = () => (
  <>
    <Composition id="Lantre2Jeux" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{sound: true}} />
    {/* version muette, pour poser une musique tendance directement dans TikTok / Reels */}
    <Composition id="Lantre2Jeux-Muet" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{sound: false}} />
    {/* pub verticale v2, charte du nouveau site */}
    <Composition id="Pub-Lantre2Jeux" component={Ad} durationInFrames={AD_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{sound: true}} />
    <Composition id="Pub-Lantre2Jeux-Muet" component={Ad} durationInFrames={AD_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{sound: false}} />
  </>
);
