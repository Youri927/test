import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './lib/anim';
import {TOTAL_FRAMES, Video} from './Video';

export const Root: React.FC = () => (
  <>
    <Composition id="Lantre2Jeux" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{sound: true}} />
    {/* version muette, pour poser une musique tendance directement dans TikTok / Reels */}
    <Composition id="Lantre2Jeux-Muet" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{sound: false}} />
  </>
);
