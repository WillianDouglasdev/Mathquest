# MathQuest Arena — integração artística v1

## Escopo e inspeção

Entrega restrita à **cena visual**, sem motor de batalha, avaliação de respostas, IA, persistência de batalha ou alteração de XP global. A próxima etapa depende da validação visual do usuário.

Foram lidos o briefing, `art/PROMPT-CODEX.txt` e o README disponível em `art/`. **O README encontrado ainda descreve o pacote anterior de animações do estudante**, não a Arena. Não foi localizado outro README ou diretório chamado `mathquest_arena_integration_v1` no projeto; os arquivos do pacote estão extraídos em `art/assets/`. A instrução específica da Arena em `PROMPT-CODEX.txt` foi seguida. Essa diferença de documentação foi preservada para não sobrescrever a documentação dos personagens.

Inspecionados o shell, rotas, tokens, componentes, `StudentAvatar`, observação de visibilidade, preferências de experiência e serviço de sons. Referências visuais conferidas: `art/arena_UX.png`, cenário oficial, quatro PNGs, `guardian-sprites-reference.png` e `preview-arena.png`. Referências/conceitos não são utilizados como componentes funcionais.

## Assets utilizados

Fontes em `art/` intactas; uma cópia runtime por arquivo em `public/assets/arena/`, com os mesmos bytes, dimensões e transparência.

| Fonte em `art/assets/` | Dimensões | Formato | Bytes |
| --- | --- | --- | --- |
| `background/arena-forest-ruins.png` | 1536×418 | PNG RGB | 1.153.154 |
| `guardian/guardian-idle.png` | 1254×1254 | PNG RGBA | 455.010 |
| `guardian/guardian-attack.png` | 1254×1254 | PNG RGBA | 630.030 |
| `guardian/guardian-damage.png` | 1254×1254 | PNG RGBA | 415.541 |
| `guardian/guardian-defeated.png` | 1254×1254 | PNG RGBA | 372.364 |

Os guardiões têm alpha de 0 a 255, com cantos transparentes. Nenhum PNG foi redesenhado, recortado ou convertido. O fundo é idêntico ao conceito duplicado existente, mas a cópia runtime vem especificamente de `art/assets/background/`. Não foram copiadas prévias, referências ou novos estudantes para runtime. O mascote verde não foi usado como adversário nem recolorido.

São cerca de 3,03 MB nos cinco arquivos. A primeira exibição solicita o fundo e idle; as demais poses são solicitadas quando selecionadas. Não há preload das quatro poses, novos pacotes, shaders ou bibliotecas de animação.

## Cena e navegação

- `/arena`: título, identificação **Prévia visual**, cena e controles de poses. A sidebar apresenta **Arena** e o breadcrumb acompanha a rota. O ícone de troféu existente foi reutilizado.
- `/desafios`: redirecionamento com substituição do histórico para `/arena`, preservando o acesso pelo endereço antigo. As outras rotas continuam intactas.
- Estudante oficial à esquerda e guardião à direita, em camadas independentes. Retratos e personagens não fazem parte do cenário.
- HP, nomes, níveis e diálogo são elementos React. `BattleHUD` recebe valores externos e limita apenas sua apresentação a 0–100; não calcula dano. Barras são estáticas, sem loops ou crescimento na montagem.
- O estudante utiliza `StudentAvatar`, still/idle aprovados, proporção original, nitidez pixel art, política de visibilidade e limite compartilhado de animações.
- O cenário é panorâmico e usa `object-fit: cover`, centralizado, sem deformação. A área usa proporção preferencial 2,65 no desktop e aumenta sua altura relativa em telas pequenas. Há recorte horizontal deliberado; a imagem inteira não é comprimida para caber em celulares.
- A largura explícita de 100% impede que a altura mínima transfira uma largura excessiva pela regra de `aspect-ratio`. Perfis/sidebar e navegação não são sobrepostos pela cena.
- Os canvases dos guardiões continuam quadrados. Pequenos deslocamentos de layout por pose alinham o contato com o chão, sem alterar proporção ou imagem.

## Quatro estados visuais

`GuardianSprite` recebe `idle | attack | damage | defeated`. Os assets são **poses estáticas**, e não spritesheets animadas. CSS acrescenta apenas:

| Pose | Movimento opcional | HP ilustrativo |
| --- | --- | --- |
| Em repouso | Idle vertical de 2px em 12s | 100 |
| Ataque | Deslocamento de até 5px, uma vez, 0,45s | 100 |
| Dano | Movimento lateral de até 2px, uma vez, 0,32s | 40 |
| Derrota | Acomodação vertical curta, uma vez, 0,35s | 0 |

Os números são fixtures de direção artística escolhidas pelos controles; **não há golpe, regra de HP, vitória registrada ou recompensa real**. O estudante continua com 100 HP em todos os exemplos. A interface explica isso antes dos controles.

Não há ataque/dano/derrota ao montar ou restaurar a página. Transições de ação ocorrem quando uma nova pose é selecionada, terminam por `animationend` e não são repetidas ao retornar à área visível. Eventos fora da tela ou com movimentos desativados são descartados. Não foram criados timers globais ou intervalos.

## Acessibilidade e experiência

- Botões nativos, grupo nomeado, `aria-pressed`, foco com contorno e sombra interna, Enter/Espaço e alvos com altura mínima medida de 46px.
- HP com rótulos acessíveis, valores numéricos e texto; o significado não depende apenas da cor.
- Alterações do diálogo anunciadas em região `status`, sem repetir todo o HUD a cada escolha.
- Retratos duplicados decorativos ocultos da árvore acessível. Cenário decorativo com alt vazio; estudante e guardião principais com nomes acessíveis.
- Poses estáticas permanecem identificáveis com movimento reduzido, preferência de decoração desativada e Modo Foco ativo. Idle é desligado fora da tela, em aba oculta e em conteúdo inerte, reutilizando o observador existente.
- Único som novo em contexto: o evento **select** já existente, em seleção efetiva. Repetir a pose, carregar a página ou passar o cursor não toca som. Sem novos efeitos, alteração de volumes ou preferências.
- Falha de imagem mostra indisponibilidade específica; não há troca por outra arte, emoji ou mascote.

## Validação

| Verificação | Resultado |
| --- | --- |
| `npm test`, versão final | **143 testes aprovados em 22 arquivos** |
| Testes novos | **14**, em `src/test/arena.test.tsx` |
| Testes anteriores | Todos preservados e aprovados |
| `npm run build`, versão final | TypeScript e Vite aprovados, 102 módulos |
| JavaScript | 371,75 kB / 119,22 kB gzip |
| CSS | 72,51 kB / 15,60 kB gzip |
| Assets | Fonte, runtime e build comparados por SHA-256 |
| Dependências | Nenhuma adicionada; manifestos e lockfile preservados |

Testes cobrem as quatro poses, movimento reduzido, preferência persistida, Modo Foco, visibilidade e limpeza de observadores, transições sem replay ou ataque na montagem, falha de asset, separação entre imagem/interface, teclado, HP ilustrativo, ausência de gravação/XP, som sem duplicação, endereço antigo e navegação entre Arena, Trilhas e Revisão.

A primeira execução apontou uma expectativa incorreta no teste novo de navegação: o título real é “Trilha de Matemática Básica”. Somente essa expectativa foi corrigida; os testes anteriores não foram editados. Execução completa final aprovada após os ajustes finais de CSS.

A primeira tentativa de testes no sandbox encontrou a restrição de leitura de diretório do esbuild. As execuções autorizadas de testes e build fora dessa restrição concluíram normalmente.

### Conferência no navegador

Build servido em origem local de QA, porta 4180. Foram medidos **1440×1000, 1366×768, 1024×768, 768×1024, 390×844 e 320×720**. Em todos:

- Cena e contêiner com a mesma largura.
- Nenhum overflow horizontal da página.
- Controles com pelo menos 46px de altura e sem overflow interno.
- Nenhuma imagem quebrada no conteúdo.

Conferidos seleção de ataque/dano/derrota por Enter, PNG da derrota carregado com HP ilustrativo 0, preferência de animação desativada e persistida após recarga, estudante estático, guardião sem movimento e diálogo acessível. Na recarga, a prévia volta ao idle; a pose não é progresso persistente.

Com sessão real de 15 minutos iniciada apenas nessa origem de QA, navegar à Arena manteve Modo Foco ativo, movimentos desligados e XP em 73%. Ao retornar, o cronômetro estava em 14:31 e Pausar continuava disponível. A sessão de QA foi pausada, sem alterar dados de outra origem. Console consultado sem avisos/erros.

**Conferência visual por captura e aceite visual do usuário permanecem pendentes.** O navegador respondeu às inspeções de DOM e interações, mas a captura `Page.captureScreenshot` excedeu o tempo de resposta, inclusive após reabrir a aba. Não foi produzida nem apresentada captura como se estivesse validada. As medidas não substituem a avaliação artística da composição. Não foram executados gesto físico em celular, leitor de tela, zoom de 200% ou avaliação auditiva humana.

Evidências técnicas: `docs/reviews/arena-v1/viewports.json`, `rendered.json`, `baseline.json` e `preservation.json`.

## Arquivos

Novos:

- `src/features/arena/arenaArtwork.ts`: registro dos cinco assets e tipos de pose.
- `src/features/arena/GuardianSprite.tsx`: poses, visibilidade, movimentos e fallback.
- `src/features/arena/BattleHUD.tsx`: HP acessível e retratos estáticos.
- `src/features/arena/BattleScene.tsx`: camadas do cenário, personagens, HUDs e diálogo.
- `src/features/arena/ArenaPage.tsx`: prévia artística e fixtures sem motor.
- `src/features/arena/ArenaPage.module.css`: composição, responsividade e movimentos opcionais.
- `src/test/arena.test.tsx`: 14 testes de integração artística.
- Cinco cópias exatas em `public/assets/arena/background/` e `public/assets/arena/guardian/`.
- Este relatório e evidências/scripts em `docs/reviews/arena-v1/`.

Modificados: `src/app/App.tsx` (importação, rota, redirecionamento, rótulo e breadcrumb) e `README.md` (registro da entrega). Os demais arquivos anteriores de src/public/art e os testes existentes são verificados contra o baseline.

Verificação reproduzível após o build: `node docs/reviews/arena-v1/verify-preservation.mjs`.

## Limitações e próxima decisão

O estudante disponível é a pose frontal oficial; a pose de costas presente no conceito não está no pacote. O componente aprovado foi reutilizado sem redesenho ou espelhamento. O guardião utiliza os quatro PNGs fornecidos; expressões, detalhes da coroa e proporções internas são os dos assets, sem tentar reconstruí-los por CSS.

O cenário contém nuvens, água e ruínas na mesma imagem estática: não foram inventadas animações separadas dessas partes. Não há projéteis extras, novas poses de estudante ou artes de interface desenhadas na imagem. O efeito de energia do ataque pertence ao PNG oficial.

Lobby, respostas/justificativas, julgamento, motor de HP, recompensas reais, backend, IA e Supabase não foram implementados. Aguardar a **validação visual desta cena** antes de avançar para o motor completo.
