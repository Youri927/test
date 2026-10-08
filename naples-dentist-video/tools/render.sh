#!/bin/bash
# Rendu complet par segments (image muette), raccord, puis son mixé à part (sound/mix.mjs) et finalisation.
# Usage : bash tools/render.sh   (depuis le dossier du projet)
set -e
mkdir -p out/seg
SEGS=("0-1279" "1280-2159" "2160-3199" "3200-4319" "4320-5439" "5440-6479")
: > out/seg/list.txt
for r in "${SEGS[@]}"; do
  f="out/seg/seg-${r}.mp4"
  if [ ! -s "$f" ]; then
    echo "→ images $r"
    npx remotion render Presentation-Naples-Muet "$f" --frames="$r" --muted --crf=16 --log=error
  fi
  echo "file 'seg-${r}.mp4'" >> out/seg/list.txt
done
ffmpeg -v error -y -f concat -safe 0 -i out/seg/list.txt -c copy out/video.mp4
node --no-warnings sound/mix.mjs out/audio.wav
ffmpeg -v error -y -i out/video.mp4 -i out/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart out/presentation-naples.mp4
echo fini
