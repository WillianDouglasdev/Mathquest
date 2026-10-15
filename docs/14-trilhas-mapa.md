# MathQuest — Trilhas no mapa oficial 8-bit

## Arte e inspeção

Foram inspecionados a rota existente, o design system, os componentes compartilhados, as fontes/tokens e as políticas de som, movimento e personagem. A rota `/trilhas` era uma página de espera. Nenhum serviço educacional foi reescrito.

O usuário identificou o mapa aprovado como **`art/Mapa_test.png`**. A imagem foi localizada e inspecionada: **1672×941**, 3.027.793 bytes, com seis clareiras de progressão ligadas pelos caminhos de terra. O arquivo original foi preservado. Há uma única cópia runtime, `public/assets/maps/mathquest-world.png`, idêntica byte a byte à fonte e ao arquivo do build.

Não foi gerado outro mapa, personagem ou cenário. A imagem é uma camada independente, com proporção intrínseca e `object-fit: contain`; não usa recorte `cover`. Não foram incorporados textos ou informações funcionais ao PNG. Florestas, vilas, pontes, rios, montanhas e castelo são os da arte aprovada.

## Experiência entregue

- Seis pontos de região selecionáveis sobre as clareiras da imagem, com nome e estado em HTML. Há **24 atividades locais tipadas**, quatro por região: aula, prática, revisão e desafio, apresentadas no painel de detalhes.
- Layout de mapa/painel em proporção **3:1**, cerca de 75/25 das colunas, nas telas amplas. Até 1150px, os detalhes passam para baixo do mapa.
- O mundo mantém largura mínima de **832px**, para conservar alvos de 56×56px e etiquetas legíveis; telas menores exploram a imagem por deslocamento horizontal nativo. A página inteira não ganha overflow horizontal.
- Tab alcança a área e os seis pontos na ordem da jornada. Enter/Espaço selecionam. Setas esquerda/direita deslocam a área quando o próprio viewport está em foco; não interceptam teclas nos pontos. Há foco visível, `aria-pressed`, `aria-current`, descrição de navegação e anúncio de seleção.
- **Região atual** seleciona e traz o ponto atual para a área visível. **Ver detalhes** leva o foco ao título do painel, incluindo no mobile, sem criar um painel sobre a sidebar.
- Seleção e região atual são conceitos independentes: selecionar uma região bloqueada atualiza os detalhes, mas o estudante continua junto à Floresta das Frações, atual nos dados demo.
- Regiões bloqueadas explicam os requisitos; suas ações de entrada e prévia permanecem desabilitadas. Atividades bloqueadas dentro de uma região também são protegidas.
- Ações permitidas abrem o diálogo existente com tipo, objetivo e indicação **Conteúdo em preparação**. Não apontam para URLs de aulas inexistentes. Escape fecha e restaura o foco ao acionador.

### Posicionamento na arte

Percentuais relativos à imagem completa, sem ajuste por resolução de tela:

| Região | X | Y | Etiqueta |
| --- | --- | --- | --- |
| Campo dos Números | 13,76% | 71,63% | Abaixo |
| Vila das Operações | 31,70% | 65,04% | Acima |
| Floresta das Frações | 44,20% | 55,47% | Abaixo |
| Ponte da Proporção | 63,70% | 61,85% | Abaixo |
| Montanha das Porcentagens | 86,30% | 49,73% | Abaixo |
| Torre do Conhecimento | 91,15% | 34,22% | Acima |

As etiquetas foram alternadas para não cobrir outros pontos. O estudante oficial está ancorado próximo à região atual, em camada própria. Não existe movimentação livre.

## Estados derivados e progresso

`deriveTrail`, em `src/domain/trails/`, recebe catálogo e progresso demonstrativo, sem React, DOM ou storage. Calcula requisitos pendentes, atividade/região atual, estados e percentual. IDs de conclusão repetidos ou externos ao catálogo não aumentam a contagem. Perfeita exige conclusão e conta uma única vez.

| Estado | Apresentação | Condição |
| --- | --- | --- |
| Concluída | Verde com check | Todas as atividades concluídas |
| Atual | Dourado com bandeira e estudante próximo | Região da atividade atual acessível |
| Disponível | Azul com livro | Requisitos de acesso cumpridos |
| Bloqueada | Cinza com cadeado | Requisitos pendentes |
| Perfeita | Estrela dourada | Todas as atividades concluídas com marca demo de perfeição |

Os cinco estados são demonstrados simultaneamente. Campo é perfeito, Vila concluída, Floresta atual, Ponte disponível e Montanha/Torre bloqueadas. Ponte depende do desafio da Vila e da aula introdutória de Frações, permitindo a ramificação demonstrativa. Prática e revisão de uma região dependem da aula; desafio depende de ambas.

O mapa exibe **9/24 atividades demo, 38%**. Esses números são separados dos **7/25 e 28%** existentes no Dashboard. Não foram migrados dados fictícios para estudo real. Selecionar, inspecionar e abrir prévias não grava conclusão, pontuação, XP ou desempenho em Pomodoro/flashcards. Seleção e deslocamento ficam somente na interface; ao recarregar, a seleção retorna à região atual dos dados demo.

## Movimento, áudio e preservação

O mapa recebe somente realce suave do ponto atual, idle oficial e transições discretas de seleção. Os demais ícones do mapa e da legenda ficam estáticos, inclusive estrela e bandeira. Água e bandeiras da ilustração permanecem estáticas; não há asset animado separado correspondente. Não foi simulado movimento do cenário inteiro.

O estudante usa `StudentAvatar`, still/idle aprovados, `image-rendering: pixelated`, visibilidade observada e o limite compartilhado de dois personagens animados. Modo Foco e movimento reduzido trocam para PNG e desligam o realce CSS; o estado atual continua identificável pelo dourado, símbolo e texto.

Nenhuma dependência, serviço de áudio, timer de animação ou regra de XP foi adicionada. Os eventos de seleção/abertura reutilizam os efeitos já existentes e respeitam silêncio e Modo Foco. Não há som por hover ou por carregar a página. Fonte, tokens, shell, Dashboard, Pomodoro, flashcards, Rádio e 19 efeitos foram preservados.

## Testes e build

| Verificação | Resultado |
| --- | --- |
| Suíte completa `npm test` | **129 testes aprovados em 21 arquivos** |
| Novos testes | 5 do domínio e 8 da interface/arte/navegação |
| Teste existente adaptado | Navegação do Dashboard agora espera o mapa, mantendo retorno ao início |
| Build completo | TypeScript estrito e Vite aprovados; 96 módulos |
| JavaScript | 364,74 kB / 117,07 kB gzip |
| CSS | 65,93 kB / 14,31 kB gzip |
| Fonte, runtime e build do mapa | SHA-256 idêntico: `923614e2a3126a0a8db3cd73729d0053c42b35f0c93511408a5ec93b57eb0b7a` |
| Preservação | 16 assets anteriores intactos; todos os arquivos de baseline fora da rota e do teste de navegação preservados |

A suíte nova cobre estados derivados, requisitos e desbloqueio, progresso perfeito sem duplicação, catálogo, trilha vazia/concluída, seleção bloqueada, ações restritas, prévia por teclado, retorno de foco, ausência de gravação/XP, separação do Dashboard, proporção, deslocamento por teclado, ausência/falha da imagem sem substituição e bloqueio por movimento reduzido/Modo Foco. Todos os testes anteriores continuam presentes. Após a suíte, o único ajuste de código foi reduzir a largura mínima CSS de 840 para 832px, evitando uma barra horizontal de apenas 2px no desktop de 1440px; build e medidas renderizadas foram refeitos.

Preservação reproduzível depois do build:

```sh
node docs/reviews/trails-v1/verify-preservation.mjs
```

## Conferência renderizada

Build de produção servido em origem local de QA na porta 4179, com navegador integrado disponível:

| Viewport | Layout | Resultado |
| --- | --- | --- |
| 1440×1080 | Mapa/painel 75/25 | Arte inteira cabe na área do mapa; sem colisões entre pontos/etiquetas |
| 1366×768 | Mapa/painel 75/25 | Exploração horizontal discreta do mapa; alvos permanecem em 56px |
| 1024×768 | Detalhes abaixo | Sem overflow horizontal da página |
| 768×1024 | Detalhes abaixo | Mundo explorável, sem reduzir os pontos |
| 390×844 | Detalhes abaixo | Retorno à região atual, deslocamento horizontal e acesso ao painel conferidos |
| 320×720 | Detalhes abaixo | Sem overflow horizontal da página ou colisões entre pontos/etiquetas |

Foram medidos os retângulos dos botões e etiquetas das diferentes regiões: nenhuma interseção nos seis tamanhos. Imagem carregada em 1672×941, com proporção preservada, sem imagens quebradas ou erros de console registrados. Inspecionados visualmente mapa, painel mobile e diálogo de prévia.

Também conferidos no navegador: seleção de bloqueada, requisito e ação indisponível; prévia permitida por Enter e retorno por Escape; personagem permanece na região atual; desligar animações persiste após recarga e torna realce/estudante estáticos. Em sessão real iniciada no Pomodoro, navegar para Trilhas manteve o tempo em execução, o realce parado e o estudante estático; retornar e pausar preservou o tempo confirmado e o perfil em 73% de XP. A sessão de teste ficou pausada somente nessa origem de QA.

Evidências: [visão geral](reviews/trails-v1/trails-overview.png), [mapa no desktop](reviews/trails-v1/trails-map.png), [exploração mobile](reviews/trails-v1/trails-mobile-map.png), [painel inferior](reviews/trails-v1/trails-mobile-details.png), [prévia](reviews/trails-v1/preview-dialog.png), [medidas finais](reviews/trails-v1/viewports.json), [estado renderizado](reviews/trails-v1/rendered.json), [preservação](reviews/trails-v1/preservation.json).

## Arquivos

Novos:

- `src/data/trails.ts`: seis regiões, coordenadas, 24 atividades e progresso demo.
- `src/domain/trails/model.ts`, `progress.ts`, `progress.test.ts`: tipos, seletores puros e testes.
- `src/features/trails/WorldMap.tsx`, `MapNode.tsx`, `MapCharacter.tsx`, `RegionDetails.tsx`, `MapLegend.tsx`, `TrailProgress.tsx`: componentes solicitados.
- `src/features/trails/TrailsPage.tsx`, `TrailsPage.module.css`, `mapArtwork.ts`: página, apresentação e registro da arte.
- `src/test/trails.test.tsx`: testes da página e do mapa.
- `public/assets/maps/mathquest-world.png`: cópia exata do mapa oficial.
- Este relatório e evidências em `docs/reviews/trails-v1/`.

Modificados: `src/app/App.tsx` (rota e breadcrumb), `src/test/dashboard.test.tsx` (expectativa da navegação) e `README.md` (registro da entrega). `art/Mapa_test.png` e todos os componentes/serviços já aprovados continuam intactos.

## Limitações e pendências

- **Aceite visual do usuário pendente.** A conferência renderizada técnica foi realizada.
- Mobile foi conferido por viewport, clique e teclado; gesto físico em telefone/tablet, zoom de 200% e auditoria com leitor de tela não foram executados.
- A imagem original de aproximadamente 3 MB foi mantida sem transformação para preservar a fidelidade. É solicitada somente ao montar a página de Trilhas, fora do bundle JavaScript. Uma eventual otimização de formato deverá preservar o visual e ser validada separadamente.
- Aulas, exercícios e desafios definitivos não fazem parte desta versão. As prévias não geram estudo, XP ou desbloqueio real.
- Não houve implementação de backend, Supabase, geração procedural ou movimento livre. Nenhuma etapa seguinte foi iniciada.
