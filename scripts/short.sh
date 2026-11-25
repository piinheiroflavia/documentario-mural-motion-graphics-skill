#!/bin/bash
# Short vertical 1080×1920 tirado do vídeo longo (mesmo mural, câmera reenquadrada, título no topo e "vídeo completo no canal" no fim).
# uso: short.sh PROJETO ID_INICIO ID_FIM "Título do Short" SAIDA.mp4
set -e; P=$(cd "$1"; pwd); D=$(dirname "$0")
read INI FIM <<<$(python3 -c "
import json;tl=json.load(open('$P/narr/timeline.json'));ids=[s['id'] for s in tl['seg']];S={s['id']:s for s in tl['seg']}
i=ids.index('$3'); f=S['$3']['b']+0.8 if i+1>=len(ids) else S[ids[i+1]]['a']-0.3
print(round(S['$2']['a']-0.4,3),round(f+1.5,3))")
DUR=$(python3 -c "print(round($FIM-$INI,3))"); T=$(python3 -c "import urllib.parse;print(urllib.parse.quote('''$4'''))")
H="vertical&titulo=$T&fim=$FIM"; F="$P/short_frames"; rm -rf "$F"; N=$(python3 -c "import math;print(math.ceil($DUR*30))"); Q=$(( (N+1)/2 ))
node "$D/render_faixa.js" "$P" $INI $FIM "$F" "$H" 0 $Q & node "$D/render_faixa.js" "$P" $INI $FIM "$F" "$H" $Q $N & wait
ffmpeg -loglevel error -y -ss $INI -t $DUR -i "$P/mix.wav" -af "afade=t=in:d=0.3,afade=t=out:st=$(python3 -c "print($DUR-1.2)"):d=1.2,loudnorm=I=-14" "$P/short.wav"
ffmpeg -loglevel error -y -framerate 30 -i "$F/f%05d.jpg" -i "$P/short.wav" -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "$5"
echo "short pronto: $5 (${DUR}s)"
