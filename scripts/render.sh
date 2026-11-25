#!/bin/bash
# uso: render.sh PROJETO SAIDA.mp4   → renderiza em 4 processos e junta com mix.wav
set -e; P=$(cd "$1"; pwd); OUT="$2"; D=$(dirname "$0")
N=$(python3 -c "import json,math;print(math.ceil(json.load(open('$P/narr/timeline.json'))['end']*30))"); Q=$(( (N+3)/4 ))
rm -rf "$P/frames"; mkdir -p "$P/frames"
node "$D/render.js" "$P" all 0 $Q & node "$D/render.js" "$P" all $Q $((2*Q)) & node "$D/render.js" "$P" all $((2*Q)) $((3*Q)) & node "$D/render.js" "$P" all $((3*Q)) $N & wait
ffmpeg -loglevel error -y -framerate 30 -i "$P/frames/f%05d.jpg" -i "$P/mix.wav" -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -af loudnorm=I=-14 -shortest "$OUT"
echo "pronto: $OUT"
