---
name: documentario-mural-motion-graphics
description: Produz vídeos documentários educativos em motion graphics 2.5D estilo "mural de investigação" + Vox — horizontal 1920×1080 (~10 min), câmera contínua sobre um mural com fotos e mapas de acervos em domínio público presos com tachinhas e ligados por fio vermelho, mapa animado, linha do tempo, capítulos narrados (voz Kokoro), checagem automática de layout, 2 opções de capa e Shorts verticais no estilo Vox. A identidade do canal (nome, voz, idioma, vinheta, textos) vem de um perfil. Use quando pedirem vídeo longo/documentário/vídeo educativo, documentário estilo Vox, mural de investigação, capa ou Shorts a partir de um vídeo longo, sobre qualquer tema.
---


# Documentário em mural (motion graphics 2.5D)

Linguagem: **motion graphics 2.5D em colagem documental** (tudo animado em código; registros reais recortados; câmera com profundidade). Leia `references/estilo.md` antes de produzir. Exemplo completo: `exemplo/` (Roma, 476).

## 0. Perfil do canal
A identidade do canal fica em `PROJETO/perfil.json` (copie de `perfis/padrao-pt-br.json` ou `perfis/default-en.json`): nome e @ do canal, voz Kokoro (`kokoro`, `lang`, `velocidade`), tema de mural padrão, imagem da vinheta final (opcional, em `A/`), itens da vinheta (curtir/inscrever/compartilhar) e todos os rótulos na tela ("PALAVRA-CHAVE", "VOCÊ SABIA?", chamada para comentários etc.). Se não houver perfil, pergunte à pessoa o nome do canal, idioma e voz antes de começar.

## Fluxo

1. **Pesquisa e fatos**: fonte para cada número, data e nome; hipótese marcada como hipótese.
2. **Roteiro de ~10 min**: 1.300–1.500 palavras, 6–8 capítulos. Ids: introdução `i1…`; capítulo `C1` (narrado: "Capítulo 1: …") + trechos `c1a, c1b…`; recapitulação narrada `R1` a cada 1–2 capítulos; fechamento `f1` (resumo), `f2` (pergunta para comentários), `f3` (vinheta curta/inscreva/compartilhe). Mostre 3 ganchos e espere a escolha da pessoa.
   Grave `PROJETO/roteiro.json` = `[{"id","txt","say"}]` (`say` com números por extenso quando preciso).
3. **Imagens** em `PROJETO/A/` (domínio público, crédito sempre na tela):
   `metsearch.py "consulta"` (The Met, só domínio público) · `loc.sh "consulta" photos|maps` (Library of Congress; fotocromos e mapas antigos) · mapa base Natural Earth já incluso.
   Tratamento: `paper.py` (P&B, papel rasgado) · `paper_color.py` (mosaicos, mapas, pinturas) · `cutout.py` (busto/objeto recortado; `TH`, `DARK`) · `coin.py` (moedas). Baixe numa pasta nova e rode Python com `-I`.
4. **Narração**: `python3 scripts/narr.py PROJETO --kokoro PASTA_DO_MODELO` (voz e idioma do perfil) → `narr/*.wav` + `narr/timeline.json` (mostra a duração; ajuste o roteiro até ~10 min). `--only c2b` regenera um trecho.
5. **Plano do mural** `PROJETO/plano.json` (um item por trecho do roteiro, mesma ordem) e **montagem automática**: `python3 scripts/gerar_mural.py PROJETO` → `world.js` com posições, câmera, superfícies, fios, mapas e caixas. Ajuste fino, se preciso, direto no `world.js`.
6. **Prévia e checagem**: `python3 scripts/build.py PROJETO` → `node scripts/render.js PROJETO 5 30 60 …` (PNGs em `previa/`) → `node scripts/checar.js PROJETO 0.5` (relatório em `checagem/relatorio.txt` + quadro de cada problema: texto embaixo da legenda/linha do tempo/caixas fixas, cortado na borda, sobreposto). Corrija até "Nenhum problema encontrado". Mudança de estilo → teste curto (30–60 s) para aprovação antes do vídeo inteiro.
7. **Trilha**: `python3 scripts/mix.py PROJETO` (acordes suaves + toque nos capítulos; sem som quando imagem aparece).
8. **Render final**: `scripts/render.sh PROJETO SAIDA.mp4` (~1 h para 10 min).
9. **Capas** com `python3 scripts/capa_vox.py PROJETO capa.json SAIDA.png` (longo 1280×720 → exporta 2560×1440; Short 1080×1920). **Longo = capa HÍBRIDA mural + Vox** (fundo de cortiça ou tapete escuro, fotos em papel rasgado presas com tachinhas, bilhetes, fio vermelho ligando as ideias, busto recortado grande, etiqueta laranja) — modelos `exemplo/capa-cortica.json` e `exemplo/capa-mesa-escura.json`. **Short = capa Vox pura** — modelo `exemplo/capa-short.json`. **Sempre entregue 2 opções de capa do longo**: (1) **cortiça** — duas fotos em papel rasgado presas com tachinhas, dois bilhetes ligados por fio vermelho (ex.: data riscada × data/pergunta à mão), busto recortado no centro e etiqueta laranja com a pergunta; (2) **mesa escura** — mapa ou documento grande preso com tachinhas e fio ligando dois pontos, título em dois bilhetes (palavra-chave em vermelho), busto grande à direita, etiqueta com datas e anotação à mão. A pessoa escolhe; não publique sem a escolha. Camadas extras: `fundo` (estilo cortica/escuro), `papel` (imagem com borda de papel de `A/`), `bilhete` (texto em papel, `fonte`), `pino`, `fio` (d SVG; coloque fios logo depois das fotos para passarem por trás dos bilhetes). Tachinhas: ponta na borda de cima do papel, nunca sobre o texto nem atrás do busto.
   Regras de capa que chamam atenção: 3–4 palavras grandes no máximo; um rosto/busto recortado grande com contorno branco; contraste forte de cores (duotone vermelho × azul, laranja, amarelo); um elemento de curiosidade (número riscado, "?", seta, anotação à mão); nada de texto pequeno; nunca repetir o título do vídeo palavra por palavra. Camadas: `foto` (duo, rasgado, clip), `recorte`, `letras` (src = imagem dentro, contorno, italico, sombra), `etiqueta`, `mao`, `traco` (d SVG), `faixa` (cor/gradiente).
   (Alternativa simples: `node scripts/capa.js PROJETO ID "Título" "DESTAQUE" "ETIQUETA" recorte.png`.)
10. **Shorts verticais** (2–3 por longo): `scripts/short.sh PROJETO ID_INICIO ID_FIM "Título do Short" SAIDA.mp4` → 1080×1920, mesmo mural, título no topo e "VÍDEO COMPLETO NO CANAL" no fim. Escolha trechos de 25–50 s com uma revelação forte e muitas imagens (texto grande à direita pode ficar cortado no vertical).
10b. **Shorts no ESTILO VOX** (recomendado para os Shorts derivados): `python3 scripts/vox_short.py PROJETO cenas.json SAIDA.mp4` (prévia: acrescente `previa 2 8 14`). Linguagem: fotos em retícula com duotone (`duo`: azul, sepia, verm), letras serifadas gigantes com a imagem dentro (`letras` + `src`), recortes com contorno branco em camadas de profundidade (`recorte`, `z`), setas, círculos e tracejados desenhados à mão (`seta`, `circulo`, `traco` com caminho SVG `d`), etiquetas laranja (`etiqueta`), frase serifada com itálico vermelho (`serif`, ex. "Olha só <i>isso</i>…" — sempre em português), anotação cursiva (`mao`) e jornal com marca-texto amarelo (`jornal` com `<mark data-at>`). Uma cena por trecho de narração; câmera com leve aproximação e parallax pelas camadas; troca de cena com corte diagonal. Coloque as fotos originais (sem borda de papel) em `A/` com prefixo `raw_`. Modelo: `exemplo/short-vox.json`.
11. **Publicação**: título, descrição com capítulos e tempos (de `timeline.json`), fontes, créditos das imagens, comentário fixado; marcar conteúdo sintético quando a voz for gerada.

## `plano.json`

```json
{"tema":"cortica|quadro|caderno", "fim_capitulos":"f1",
 "cidades":{"atenas":[23.7,37.98,"Atenas"]},
 "trechos":[{"id":"i1","tipo":"titulo", ...}, ...]}
```
- **tema**: `cortica` (história, padrão), `quadro` (ciência/tecnologia; tachinhas azuis), `caderno` (corpo humano, "como funciona").
- Campos comuns de um trecho: `imagens` (até 3: `src`, `credito`, `w`, `rot`, e efeitos `reveal:true` foto revelada, `polaroid:"legenda à mão"`, `fg:{src,x,y,w}` camada de primeiro plano 2.5D, `quem:[{cx,cy,txt}]` rótulos "quem é quem" em posição relativa da imagem), `notas` (`[{"html","at","ideia":true}]` — `ideia` vira "PARA TER UMA IDEIA"), `marca` (anotação à mão), `onde` (minimapa: id de cidade), `sabia` (texto "VOCÊ SABIA?"), `palavra` (`["termo","definição"]`), `ano` ou `anos:[[seg,ano],…]`, `marks`, `fill`, `band` (linha do tempo).
- **tipo**: `normal` (padrão) · `titulo` (`tag`, `titulo` com `<mark class="hl" data-at="2.6">`) · `agenda` (`itens`) · `capitulo` (`n`, `titulo`, `fundo`) · `mapa` (`vista` med/full/italy/ital2, `cidades`, `foco`, `rota`, `coroa`, `regioes`, `anotacao`, `imagens` com `cidade`, `notas` com `cidade`) · `citacao` (`original`, `traducao`, `ref`) · `jornal` (`nome`, `data`, `titulo`, `texto` com `<u class="sub" data-at="1.2">sublinhado</u>`; se não for documento da época, dizer no `credito`) · `arvore` · `fluxo` (`passos:[[título,texto,seg]]`) · `calendario` (`meses`) · `colunas` (`colunas:[{titulo,itens,cor,quem,fixo}]`) · `recap` (`itens`, imagens viram polaroides à direita) · `pergunta` (`pergunta`, imagem vira fundo) · `vinheta` (nome do canal, imagem opcional e itens do perfil).

Mapas que se transformam com o tempo (fronteiras por ano) e coisas muito específicas: escreva direto no `world.js` gerado (veja o `world.js` gerado: `MAPS` aceita `polys:[[pontos lon/lat],'#cor',opacidade]` por ano).

## Regras de layout
Um bloco por trecho; nada importante no canto superior direito (título do capítulo) nem abaixo de ~880 px (legenda e linha do tempo); a checagem automática aponta o resto.
