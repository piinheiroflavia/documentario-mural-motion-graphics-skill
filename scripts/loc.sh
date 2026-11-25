#!/bin/bash
# uso: loc.sh "consulta" photos|maps N
q=$(python3 -I -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$1")
curl -sS -m 40 "https://www.loc.gov/$2/?q=$q&fo=json&c=${3:-8}" -o ${TMPDIR:-/tmp}/_loc.json
python3 -I -c "
import json;d=json.load(open('${TMPDIR:-/tmp}/_loc.json'))
for r in d.get('results',[]):
    im=(r.get('image_url') or [''])[-1]
    print((r.get('date') or '')[:10],'|',r.get('title','')[:85],'|',im[:120])"
