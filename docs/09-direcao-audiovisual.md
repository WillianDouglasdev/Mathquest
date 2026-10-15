# MathQuest — direção audiovisual 1.0

Atualização posterior: [sons em destaque](10-sons-em-destaque.md) amplia para 19 efeitos, habilitados por padrão em perfis novos, com novo acesso no cabeçalho e painel destacado. Os números e padrões abaixo registram a entrega audiovisual original.

Implementação em cinco entregas sucessivas. As regras dos motores de foco/revisão e as recompensas permanecem fora do escopo. Sem Python, FastAPI ou Supabase.

## 1. Correção tipográfica

Concluída tecnicamente: **72 testes / 8 arquivos e build aprovados**. Pixelify Sans permanece na marca, títulos curtos e destaques; Nunito Sans passa a todos os botões, além da navegação e textos já revisados. Assets de fontes locais preservados.

Arquivos: `src/components/ui.module.css`, `src/features/focus/FocusPage.module.css`, `src/features/review/FlashcardSection.module.css`, `src/features/review/FlashcardSection.tsx`; novos `src/components/MathText.tsx`, `MathText.module.css` e `src/test/math.test.tsx`.

MathText apresenta frações numéricas e potências quadrada/cúbica em MathML nativo. Perguntas, respostas, IDs e explicações permanecem iguais. O texto original continua acessível e serve de alternativa para leitores de tela. Não executa expressões nem interpreta HTML. É uma camada de apresentação para o conteúdo predefinido, sem editor/parser TeX genérico; expressões e sinais comuns permanecem como texto legível. Pendente avaliação visual do usuário e auditoria com leitores de tela/dispositivos físicos.

## 2. Sistema de animações

Concluída tecnicamente: **79 testes / 10 arquivos e build aprovados**. Nuvens lentas no cabeçalho, idle de slime, bandeiras discretas, brilho lento em troféus/estrelas, entrada curta nas recompensas, barras com transição curta e tomate com feedback ao concluir. O giro discreto dos flashcards e o hover de botões existentes são reaproveitados. Áreas de leitura permanecem estáticas. Preferência local para desligar decoração e respeito ao movimento reduzido do sistema, inclusive mudanças do sistema durante o uso.

Arquivos novos: `src/features/experience/{ExperienceProvider,ExperienceControls}.tsx`, `ExperienceControls.module.css`, `motion.css`; `src/services/experience/PreferencesStore.ts` e teste; `src/test/experience.test.tsx`. Integrações em `src/app/App.tsx`, `src/components/ui.tsx` e atributo visual no tomate em `FocusPage.tsx`. Sem novos timers para animações. Listeners de mídia/storage removidos no unmount. Pendente avaliação visual do usuário.

## 3. Rádio MathQuest

Concluída tecnicamente: **87 testes / 12 arquivos e build aprovados**. Serviço independente `RadioStore`, provider acima das rotas, player nativo em Ambiente MathQuest, play/pause, volume, faixa, seleção de até três arquivos e loop. Catálogo vazio explícito: nenhum arquivo musical com licença verificável foi fornecido/encontrado. Sem streaming e sem placeholders falsamente reproduzíveis. Origem, licença, autor e atribuição são campos do catálogo e estão descritos em `public/audio/README.md`.

Arquivos: novos `src/data/music.ts`, `src/services/experience/RadioStore.ts` e teste, `src/features/experience/{RadioProvider,RadioPlayer}.tsx`, `src/test/radio.test.tsx` e `public/audio/README.md`; integrações em App/ExperienceControls/CSS. Os testes usam somente fixtures de áudio injetáveis (não faixas distribuídas). Nenhum recurso de áudio criado ao carregar; seleção, habilitação persistida ou troca entre abas não iniciam playback. Mudar de faixa pausa e requer play explícito. Navegação React preserva o recurso e a posição; unmount pausa, remove listeners e descarrega a fonte. Pendentes: adicionar músicas licenciadas e validar reprodução auditiva com arquivos reais.

## 4. Efeitos sonoros

Concluída tecnicamente: **94 testes / 15 arquivos e build aprovados**. Serviço central `SoundService` e sintetizador `BrowserSynth`, volume independente, opt-in, sem sons de hover e sem sons ao montar a página. Clique principal, virada, acerto/erro após gravação confirmada, conclusão de sessão emitida uma vez somente na aba proprietária. Eventos de conquista/sequence disponíveis sem inventar ganhos no perfil demo.

Arquivos: `src/services/experience/{SoundService,BrowserSynth}.ts` e testes, `src/features/experience/{SoundProvider,SoundControls}.tsx`, `src/test/sound.test.tsx`; integrações em App, Button, FlashcardSection e ExperienceControls. [Origem e atribuição dos sons](audio-assets.md). Rajadas limitadas a 120 ms, uma sequência por vez, contexto sob demanda e recursos desconectados/fechados no unmount. Pendente conferência auditiva humana; testes validam parâmetros e execução por portas de áudio simuladas.

## 5. Modo Foco e validação final

Concluída tecnicamente: **98 testes / 16 arquivos e build completo aprovados**. Opção persistida “Modo Foco durante o Pomodoro”, ativada por padrão, reduz a decoração e silencia efeitos da interface somente enquanto a sessão está em andamento. Música permanece sob o controle independente do estudante. Pausa/finalização devolvem a preferência normal de decoração. O aviso de conclusão pode tocar após o foco terminar, se os efeitos já tiverem sido ativados manualmente nesta sessão.

Arquivos: novo `src/features/experience/ExperienceRoot.tsx` (ponte somente de leitura), `src/test/focus-mode.test.tsx`; ajustes em ExperienceProvider/Controls, SoundProvider/Controls e proteção contra callbacks tardios em SoundService. Complementos nos testes de preferências, rádio e sons. Nenhum comando do cronômetro é disparado por esses controles.

O teste de coexistência confirma o mesmo ID da sessão e 2 segundos de tempo confirmado ao alternar o modo, sem pausar/reiniciar; música mantém o mesmo recurso e posição. Os testes também cobrem recuperação de preferências, volumes independentes, troca manual de faixa, ausência de autoplay, bloqueio de rajadas, respostas sem duplicação e descarte de promessas tardias.

## Validação final e preservação

| Verificação | Resultado |
| --- | --- |
| Suíte completa final | 98 testes aprovados em 16 arquivos; os 69 testes anteriores foram preservados |
| Build final | TypeScript + Vite aprovados; 82 módulos; JS 341,40 kB / 108,98 kB gzip; CSS 54,38 kB / 11,76 kB gzip |
| Dependências | Nenhuma adicionada; `package.json` e lockfile idênticos à referência |
| Preservação | 10 assets aprovados idênticos; motores, stores de progresso, dados locais, provider do Pomodoro e testes anteriores idênticos |
| Animações | CSS, sem timers novos; opção local e preferência de movimento reduzido com listener removido ao desmontar |
| Recursos sonoros | Rádio sob demanda com limpeza de listeners/fonte; osciladores/gains desconectados e contexto fechado; promessas tardias ignoradas |

[Relatório de preservação](reviews/audiovisual-v1/preservation.json), reproduzível com `node docs/reviews/audiovisual-v1/verify-preservation.mjs`. O relatório enumera os sete arquivos existentes alterados; os arquivos novos e integrações estão listados por etapa acima.

Conferência renderizada no build de produção em origem local de teste:

- Painel Ambiente, menu, tipografia dos botões, estado vazio da rádio e controles por teclado.
- Preferência de movimento desligada com `animation-name: none`; reativação com idle do mascote. Volume da música alterado por teclado e preservado após recarga, independentemente dos efeitos.
- Efeitos habilitados manualmente e botão de teste acionado, sem erro de disponibilidade apresentado pela interface. Isso não substitui uma avaliação auditiva humana.
- Fração 3/4 renderizada em MathML, com resposta revelada por Enter, sem registrar avaliação do flashcard.
- Sessão real de teste de 15 min iniciada, Modo Foco ligado/desligado sem reiniciar o contador; sessão pausada/finalizada como interrompida ao concluir a conferência. A origem de teste é separada da origem habitual de desenvolvimento.
- Larguras de 320, 390, 768, 1024 e 1440 px na página de revisão/painel, sem overflow horizontal detectado. [Medições](reviews/audiovisual-v1/responsiveness.json) descontam a barra de rolagem do navegador.

Evidências: [painel desktop](reviews/audiovisual-v1/ambiente-desktop.jpg), [Dashboard](reviews/audiovisual-v1/dashboard-desktop.jpg), [painel mobile](reviews/audiovisual-v1/ambiente-mobile.jpg), [fração mobile](reviews/audiovisual-v1/fracao-mobile.jpg), [foco ativo](reviews/audiovisual-v1/foco-ativo-mobile.jpg).

## Pendências e limites

- Nenhuma música local licenciada foi fornecida; a Rádio está funcional como infraestrutura e apresenta catálogo vazio. Reprodução musical foi validada com portas simuladas, ainda requer arquivos licenciados e teste auditivo real.
- Sons são originais sintetizados, sem arquivos de terceiros ou serviços externos; [origem, atribuição e durações](audio-assets.md). Conquista/streak são eventos preparados, sem criar premiações demonstrativas.
- Avaliação visual/auditiva do usuário permanece pendente. Também faltam dispositivos físicos, zoom 200% e auditoria com leitores de tela. O movimento reduzido do sistema foi exercitado em teste automatizado; não foi alterada a configuração do sistema operacional durante a conferência.
- MathML nativo atende as frações numéricas e potências do conteúdo atual, com texto original acessível. Não inclui parser/editor TeX genérico ou matemática arbitrária.
- Preferências ficam no navegador e na origem; falhas/corrupção são informadas sem apagar dados. Não há sincronização entre dispositivos. Faixa/prefs podem sincronizar entre abas, mas o áudio não é iniciado por essa sincronização. Duas abas podem tocar música se o estudante iniciar manualmente em ambas.
- A escolha música habilitada é persistida, mas o estado “tocando” não é restaurado após recarga. Não há autoplay.
- Nenhum trabalho de Python/FastAPI/Supabase iniciado.
