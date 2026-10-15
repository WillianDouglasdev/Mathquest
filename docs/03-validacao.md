# Validação da primeira entrega

## Integração posterior do personagem aprovado

Os três formatos foram aprovados pelo usuário e integrados em entrega separada. Testes e build foram reexecutados: **8 testes aprovados e build aprovado**. O teste integrado cobre seleção dos formatos em Dashboard, sidebar, cabeçalho, ranking e diálogo de perfil. Hashes confirmam preservação dos assets anteriores e cópias exatas dos PNGs aprovados, inclusive no build. Conferência visual renderizada segue limitada pela ausência de navegador conectado. Detalhes em [integração do personagem](05-integracao-personagem.md). Os resultados abaixo permanecem como histórico da primeira entrega.

## Retorno do usuário — 15/10/2026

Atualização posterior: o plano de continuidade foi aprovado com flashcards locais antecipados para Revisão e Foco, motor do Pomodoro independente de React e validação visual obrigatória de corpo inteiro/retrato/avatar antes de substituir o personagem. A revisão atual prepara propostas isoladas; não altera os arquivos usados pela aplicação. O registro visual e a verificação de preservação estão em `docs/reviews/student-v2/`.

O usuário aprovou a paleta, os componentes, os cenários pixel art e a organização do Dashboard. O avatar atual foi rejeitado por estar abaixo da referência original de UX. Cenários e mascote verde devem ser preservados. A referência adicional de **Revisão e Foco** orienta o Pomodoro funcional, agora priorizado.

Esse retorno registra aprovação da direção visual com ressalva ao personagem; não representa uma nova execução automatizada nem comprova testes de viewport/acessibilidade ainda pendentes. Esta revisão alterou apenas documentação e não reexecutou build/testes, pois não houve mudança de código. Resultados técnicos abaixo são históricos da primeira entrega. O [plano de continuidade](04-plano-de-continuidade.md) define a próxima sequência.

## Comparação com as referências fornecidas

Comparação de composição planejada e assets inspecionados na primeira entrega. A direção visual foi posteriormente aprovada pelo usuário, com revisão do estudante solicitada; **a verificação técnica da página em múltiplos viewports continua pendente**.

| Referência | Implementação nesta entrega | Diferença intencional |
| --- | --- | --- |
| Sidebar azul com logo e navegação pixel art | Sidebar persistente, item inicial verde, atlas PNG para ícones e montanha | Revisão adicionada à navegação para refletir as rotas do briefing |
| Céu, nuvens e castelo no topo | Cenário PNG gerado, castelo à direita | Cenário adaptado, não extraído da imagem |
| Saudação com estudante | Estudante do atlas, título Pixelify e corpo Nunito | Texto de saudação encurtado para leitura em telas pequenas |
| Trilha e nível na primeira linha | Cards 7/12 e 5/12 no desktop; barras segmentadas, livro, escudo, slime | Trilha 28% = 7/25 lições, mantendo frações como etapa atual |
| Sequência e missão na segunda linha | Semana com seis dias, próximo escudo, missão sobre cenário | Seis dias e um escudo futuro evitam afirmar recompensa já concedida |
| Desafio e ranking na terceira linha | Frações 1/2 e 3/4, CTA azul, ranking e recorde | Ranking explicitamente demonstrativo; reutilização do avatar |
| Contornos retrô e verde de progresso | Cards com bordas em degraus e tokens compartilhados | Geometria simplificada para manter texto HTML e flexibilidade |

Os assets gerados foram vistos e o atlas teve os recortes ajustados por coordenadas. PNGs locais conferidos por cabeçalho: cenário RGB de 2172×724 e atlas RGBA de 1254×1254. WOFF2 e licenças estão presentes no projeto.

## Verificação automatizada

Resultado final desta sessão:

| Verificação | Resultado |
| --- | --- |
| `npm run build` | Aprovado; 47 módulos; bundle JS ~285 kB / ~91 kB gzip |
| `npm test` | 7 testes aprovados, 1 arquivo |
| HTTP local do build | 200 em `/`, `/trilhas`, `/trilhas/numeros/fracoes`, `/desafios`, `/revisao` |
| Assets e fontes por HTTP | 200 nos dois PNGs e nos dois WOFF2, com os content-types esperados |
| Screenshots e comparação da página renderizada | Pendente; sem navegador disponível |

Servidor temporário de verificação encerrado ao final. Para revisar localmente, executar `npm run dev`.

- Build de produção: TypeScript estrito e Vite.
- Vitest/Testing Library: coerência do progresso, indicação demonstrativa, busca sem acentos, estado vazio, Escape, foco/restauração em diálogos, ausência de XP por clique, rotas de próxima fase e página não encontrada.
- Revisão de código para breakpoints de 1600, 1200, 1150, 1000, 900, 700 e 480px; SVGs decorativos, barras acessíveis, foco visível e `prefers-reduced-motion`.
- Regras futuras de pontuação, sequência e revisão espaçada ainda não existem nesta fase e terão testes quando forem implementadas.

## Limite do ambiente e revisão pendente

A tentativa de abrir a prévia pelo navegador integrado retornou `Browser is not available: iab`. A consulta de superfícies disponíveis retornou `apps: []` e `browsers: []`. Portanto, não foi possível capturar screenshots ou validar visualmente a renderização desktop/mobile nesta sessão. Testes DOM não substituem essa validação.

A próxima mudança visual deverá usar `npm run dev` e comparar o Dashboard às imagens originais e à base aprovada em pelo menos 1440×1080, 1024×768, 768×1024, 390×844 e 320×720. Conferir ausência de overflow, legibilidade das legendas, recortes do atlas, contraste e ordem de foco. Usar Tab/Shift+Tab/Escape nos diálogos e menu mobile; confirmar que todos os botões apresentam feedback. Conferir também com redução de movimento e zoom de 200%.

Nenhuma outra página funcional do MVP foi implementada antes desta revisão.
