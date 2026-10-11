import {Config} from '@remotion/cli/config';
import {existsSync} from 'node:fs';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
Config.setConcurrency(4);

// Conteneur cloud : on réutilise le Chromium headless déjà installé par Playwright.
const pwHeadless = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (existsSync(pwHeadless)) {
  Config.setBrowserExecutable(pwHeadless);
}
