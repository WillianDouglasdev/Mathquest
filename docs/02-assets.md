# Assets da primeira entrega

## Decisão de continuidade — 15/10/2026

Paleta, cenários e mascote verde aprovados pelo usuário. Preservar `landscape.png`, o slime e os ícones de `sprites.png`. O estudante atual **não foi aprovado** e será substituído por um personagem baseado no aventureiro da UX original: cabelo castanho, mochila, roupas azuis e verdes e expressão amigável.

Antes de qualquer substituição, o usuário deve validar três formatos do mesmo personagem: corpo inteiro, retrato de navegação e avatar pequeno de ranking. As propostas são preparadas em `docs/reviews/student-v2/`, fora dos assets públicos e sem uso pela aplicação. Após validação, a integração será aditiva, com arquivos próprios e um componente compartilhado. Não regenerar o atlas nem substituir cenários/mascote para corrigir o personagem. Todas as ocorrências do estudante deverão ser revisadas. Novo asset de tomate/relógio para o Pomodoro ficará para a etapa funcional. Ver [plano de continuidade](04-plano-de-continuidade.md#2-personagem-e-continuidade-visual).

Os três PNGs da [prancha de revisão](reviews/student-v2/index.html) foram aprovados pelo usuário e integrados sem alteração binária em `public/assets/characters/`. [Prompts exatos](reviews/student-v2/prompts.json), [registro histórico de preservação da proposta](reviews/student-v2/verification.json) e [verificação da integração](reviews/student-v2/integration-assets.json) acompanham os arquivos. Cenários, atlas e mascote permanecem intactos. Ver [integração e seus limites de validação](05-integracao-personagem.md).

## Arquivos existentes e origem

Novo asset aditivo do Pomodoro: `public/assets/focus/tomato.png` (1297×1213, RGBA), gerado com Imagegen integrada. Números e controles são HTML. [Prompt exato](pomodoro-asset.json) e [validação da entrega](06-pomodoro.md). Cenários, mascote, fontes e personagens aprovados permanecem intactos.

Os arquivos PNG foram criados com a ferramenta integrada Imagegen e copiados para este projeto. São interpretações da direção de arte fornecida, para revisão. Os originais anexados na conversa não estavam disponíveis como arquivos de imagem no diretório de attachments.

| Arquivo local | Dimensões | Uso |
| --- | --- | --- |
| `public/assets/landscape.png` | 2172 × 724, RGB | Cenário de castelo, céu, floresta e cachoeira; cabeçalho e fundos de cards |
| `public/assets/sprites.png` | 1254 × 1254, RGBA | Atlas de 16 personagens/objetos com transparência |
| `public/assets/fonts/pixelify-latin.woff2` | Fonte variável 400–700 | Títulos e botões |
| `public/assets/fonts/nunito-latin.woff2` | Fonte variável | Textos de interface |

O atlas não alinha perfeitamente todos os sprites a células idênticas. Por isso `PixelArt` usa coordenadas explícitas com `viewBox` e referencia o PNG dentro de SVG; os desenhos continuam raster, não são recriados em CSS ou por caminhos vetoriais. O navegador baixa um único atlas reutilizável. O fallback exibe um texto de asset pendente se o arquivo falhar.

Fontes obtidas pelos pacotes `@fontsource-variable/pixelify-sans` e `@fontsource-variable/nunito-sans`. Licenças SIL Open Font License em `public/assets/fonts/*-LICENSE.txt`. Fontes e imagens são servidas localmente, sem dependência de Google Fonts em runtime.

## Prompt final — landscape.png

```text
Use case: stylized-concept. Asset type: reusable environment background for MathQuest educational RPG dashboard. Create a wide 3:1 landscape pixel art game background, crisp deliberately large square pixels, limited 16-bit console palette, no smoothing. Bright pale azure daytime sky fills upper 55 percent with a few blocky white clouds. At far right a small white medieval castle with dark blue pointed turrets and green flags on a grassy hill, distant blue triangular mountains, evergreen trees, a little turquoise waterfall. Lower 20 percent lush green grassy platform with dirt edge. Left and center mostly open pale sky to allow web UI text overlay. Cheerful educational RPG, clean coherent silhouettes, like polished retro webgame environment. Navy outlines, azure sky, white clouds, bright lime greens. No text, no UI, no lettering, no people, no emoji. This asset will be reused as CSS background behind real HTML. Output landscape.
```

## Prompt final — sprites.png

Gerado com `transparent_background: true`.

```text
Use case: stylized-concept. Asset type: ONE transparent game sprite atlas PNG, 4 by 4 equal square cells, for MathQuest educational RPG web dashboard. Exactly 16 sprites with generous transparent padding in their cells. Transparent background, no grid lines, no text or letters or numbers. All sprites crisp chunky 16-bit pixel art, square pixels, dark navy stepped outlines, bright saturated colors, consistent pixel sizes and light from upper left. Each sprite centered within its equal cell, no sprite exceeds 75% of the cell. Row 1 left to right: (1) friendly brown-haired young student adventurer full body facing front wearing blue jacket, cream shirt, brown shorts and backpack, (2) cute bright green slime mascot with two small dark eyes, smiling mouth, tiny golden crown, (3) open cream book with blue cover, (4) golden trophy cup on blue base. Row 2: (1) little white house blue roof, (2) golden five-point star, (3) white and pale blue ascending bar chart, (4) stack of pale blue flashcards. Row 3: (1) red white bullseye target with tiny arrow, (2) orange red campfire flame, (3) dark blue flag on pole, (4) silver blue padlock. Row 4: (1) little golden notification bell, (2) royal blue level shield with blank blue center, (3) bright golden coin with small star, (4) snowy blue mountain with green pennant. Sprites separated, no shadows crossing cell boundaries, no background, no words, no UI. This is a single production sprite atlas consumed by background-position in a web app.
```

A estratégia de recorte mudou de `background-position` para janelas SVG depois de inspecionar o resultado, para preservar cada sprite inteiro.

## Assets pendentes e adaptações

- O desafio usa um recorte do cenário e duas placas numéricas em HTML. A cena exclusiva de comparação de frações permanece pendente para a fase de conteúdo.
- A mascote foi adaptada para verde, como nos screenshots do Dashboard. A variação azul translúcida da primeira referência não foi produzida nesta fase.
- Avatares do ranking ainda reutilizam o estudante com fundos diferentes. O retrato atual será substituído junto aos demais contextos; todos os usos do personagem principal deverão derivar da mesma ficha visual, sem sprites genéricos inconsistentes. O ranking continuará demonstrativo.
- Mago, loja, objetos educacionais específicos e animações por estado não são necessários ao Dashboard e permanecem pendentes.
