"""Carrega o perfil do canal: PROJETO/perfil.json (ou perfis/padrao-pt-br.json) mesclado com o padrão."""
import json, os
K=os.path.dirname(os.path.abspath(__file__))+'/..'
PADRAO_TXT={"palavra_chave":"PALAVRA-CHAVE","voce_sabia":"VOCÊ SABIA?","onde_fica":"ONDE FICA","para_ter_ideia":"PARA TER UMA IDEIA","neste_video":"NESTE VÍDEO","recapitulando":"Recapitulando","fonte_da_epoca":"FONTE DA ÉPOCA","comente":"Conta aqui nos comentários 👇","video_completo":"VÍDEO COMPLETO NO CANAL ▶","credito_mapa":"Mapa base: Natural Earth (domínio público) · fronteiras aproximadas","olha_so":"Olha só <i>isso</i>…"}
def carregar(proj):
    base=json.load(open(K+'/perfis/padrao-pt-br.json'))
    f=proj+'/perfil.json'
    if os.path.exists(f):
        p=json.load(open(f))
        for k,v in p.items():
            if isinstance(v,dict) and isinstance(base.get(k),dict): base[k]={**base[k],**v}
            else: base[k]=v
    base['textos']={**PADRAO_TXT,**base.get('textos',{})}
    return base
def aplicar(txt,perfil):
    """troca os rótulos padrão (pt-BR) do motor pelos do perfil"""
    T=perfil['textos']
    pares=[("PALAVRA-CHAVE",T['palavra_chave']),("VOCÊ SABIA?",T['voce_sabia']),("ONDE FICA",T['onde_fica']),("NESTE VÍDEO",T['neste_video']),("FONTE DA ÉPOCA",T['fonte_da_epoca']),("VÍDEO COMPLETO NO CANAL ▶",T['video_completo']),("Mapa base: Natural Earth (domínio público) · fronteiras aproximadas",T['credito_mapa'])]
    for a,b in pares: txt=txt.replace(a,b)
    return txt
