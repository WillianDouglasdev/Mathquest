# MathQuest — sons 8-bit em destaque

## Resultado

O catálogo passou de 7 para **19 efeitos curtos originais**, com a mesma síntese local, volume independente e limite de rajadas. Novas variações: navegação, abrir/fechar painel, missão, escolher duração, iniciar/pausar/retomar/finalizar/reiniciar foco, próximo cartão e conclusão da revisão. As prévias de conquista/sequence continuam identificadas como prévias, sem inventar recompensas.

Efeitos vêm **ligados por padrão a 20%** em perfis novos ou preferências sem esse campo. Uma preferência válida já salva como desligada é respeitada; não foi feita uma migração que reative som contra essa escolha. Preferências ilegíveis ou campo inválido permanecem silenciosos com tratamento de erro. Música continua desligada por padrão e sem autoplay.

Nenhum som é emitido ao montar/carregar uma página. O primeiro som acontece em uma interação, como navegar ou abrir o painel. Sem efeitos de hover. O Modo Foco mantém o silêncio da interface durante o cronômetro em andamento; os sons de pausa/finalização, assim como outros efeitos, também respeitam essa opção.

## Configurações mais visíveis

- Atalho **Sons** no cabeçalho de todas as páginas; no celular, ícone de alto-falante com nome acessível.
- Faixa destacada **Sons 8-bit e ambiente**, com ícone e indicador Efeitos ligados/desligados ou Foco ativo.
- Abrir pelo atalho leva foco e rolagem ao painel. Teclado Enter/Espaço e Escape preservados; `aria-expanded` e `aria-controls` relacionam o acesso com o painel.
- Efeitos aparecem primeiro, com volume e seletor de **19 prévias**. Escolher uma prévia não reproduz; o botão Ouvir teste dispara o som escolhido.
- Painel continua recolhível, sem ocupar permanentemente a área de estudo. Música, animações e foco continuam no mesmo local.

## Implementação

Arquivos alterados: `PreferencesStore.ts`, `SoundService.ts`, `SoundProvider.tsx`, `SoundControls.tsx`, `ExperienceProvider.tsx`, `ExperienceControls.tsx`/CSS, `components/ui.tsx`, `app/App.tsx`/CSS, `Dashboard.tsx`, `FocusPage.tsx`, `FocusShortcut.tsx` e `FlashcardSection.tsx`.

Botões/links declaram o tipo de som e reutilizam a captura central; eventos desconhecidos são ignorados. Próximo cartão/conclusão da revisão só emitem após a transição confirmada. Não foram alteradas regras de revisão, tempo, pontuação ou armazenamento educacional. Sem novos pacotes, arquivos de áudio, serviços externos ou sprites.

## Validação

| Verificação | Resultado |
| --- | --- |
| Suíte completa | **102 testes em 17 arquivos aprovados** |
| Build | TypeScript/Vite aprovados; 82 módulos; JS 345,23 kB / 110,19 kB gzip; CSS 55,98 kB / 12,08 kB gzip |
| Novos testes | Padrão habilitado, preferência desligada preservada, foco pelo atalho, teclado/Escape, 19 prévias, nenhuma reprodução por seleção/hover, variações e silêncio após recarga |
| Testes adaptados | Preferências refletindo o novo padrão; Modo Foco distinguindo silêncio na montagem de som intencional ao abrir o painel |
| Preservação | Motores, progresso, dados, provider do foco, 10 assets e dependências idênticos à referência |

Conferência renderizada no build de produção: atalho e faixa no Dashboard; efeitos inicialmente habilitados em uma origem local de teste nova; abertura do painel, seletor com 19 opções e botão de prévia. Layout conferido em 320, 390, 768, 1024 e 1440 px, sem overflow horizontal detectado. O seletor foi ajustado para caber na largura interna do card em celular. Conferência auditiva subjetiva do usuário, dispositivos físicos e zoom 200% continuam pendentes.

Evidências em `docs/reviews/sounds-v2/`; [preservação](reviews/sounds-v2/preservation.json), reproduzível com `node docs/reviews/sounds-v2/verify-preservation.mjs`. Origem/licença: [registro de áudio](audio-assets.md). A Rádio permanece com catálogo vazio até receber músicas licenciadas. Nenhum trabalho de FastAPI/Supabase iniciado.
