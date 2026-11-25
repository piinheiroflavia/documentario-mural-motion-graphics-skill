import sys, json, urllib.request, urllib.parse, time
q=sys.argv[1]; lim=int(sys.argv[2]) if len(sys.argv)>2 else 12
u="https://collectionapi.metmuseum.org/public/collection/v1.1/search?hasImages=true&limit=%d&q=%s"%(lim,urllib.parse.quote(q))
ids=json.load(urllib.request.urlopen(u,timeout=30)).get('objectIDs') or []
for i in ids[:lim]:
    try:
        d=json.load(urllib.request.urlopen("https://collectionapi.metmuseum.org/public/collection/v1/objects/%d"%i,timeout=30))
    except Exception as e: continue
    if not d.get('isPublicDomain') or not d.get('primaryImage'): continue
    print(i,'|',d.get('title','')[:80],'|',d.get('objectDate',''),'|',d.get('artistDisplayName','')[:30],'|',d.get('primaryImage'))
