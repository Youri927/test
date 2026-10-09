#!/bin/bash
# Rendu complet par segments (image muette), raccord, puis son mixé à part (sound/mix.mjs).
# Usage : bash tools/render.sh   (depuis le dossier du projet)
set -e
mkdir -p out/seg
TOTAL=$(node -e "import('./src/beats.ts').then(m => console.log(m.SCENE_BEATS.reduce((n, s) => n + s[1], 0) * m.BEAT))")
STEP=1080
: > out/seg/list.txt
for ((a = 0; a < TOTAL; a += STEP)); do
  b=$((a + STEP - 1)); if [ $b -ge $TOTAL ]; then b=$((TOTAL - 1)); fi
  r="$a-$b"
  f="out/seg/seg-${r}.mp4"
  if [ ! -s "$f" ]; then
    echo "→ images $r"
    npx remotion render Presentation-RobAbel-Muet "$f" --frames="$r" --muted --crf=16 --log=error
  fi
  echo "file 'seg-${r}.mp4'" >> out/seg/list.txt
done
ffmpeg -v error -y -f concat -safe 0 -i out/seg/list.txt -c copy out/video.mp4
node --no-warnings sound/mix.mjs out/audio.wav
ffmpeg -v error -y -i out/video.mp4 -i out/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart out/presentation-robabel.mp4
echo fini
