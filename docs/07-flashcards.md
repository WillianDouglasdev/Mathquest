# Revisão e Foco — entrega 2: flashcards predefinidos

Implementação técnica concluída em 15/10/2026. Não há integração com FastAPI/Supabase nesta entrega. A conferência visual da aplicação renderizada, incluindo os personagens e o Pomodoro, **permanece pendente** e não é considerada concluída pelos testes DOM.

## Conteúdo e interface

30 cartões estáticos locais: 10 de operações fundamentais, 10 de frações e 10 de porcentagem. Cada cartão tem ID estável, assunto, pergunta, resposta e explicação curta. Conteúdo em `src/data/flashcards.ts`, `contentVersion: 1`; não há geração por IA, criação de cartões personalizados ou dependências novas.

A seção aparece em `/revisao`, junto do Pomodoro. Reutiliza os componentes Card, Button, Badge, ProgressBar, PixelArt, os tokens e o cenário existentes. Os cartões são brancos, com cenário suave no rodapé, expressões matemáticas em texto HTML legível e explicação após revelar. Há animação curta ao virar, desativada com redução de movimento.

O estudante escolhe um assunto e inicia “Revisar pendentes”, ou escolhe “Treinar sem alterar agenda”. A resposta só pode ser marcada com o verso visível. Depois de Acertei/Errei, os dois botões ficam bloqueados e a apresentação permanece visível até “Próximo cartão”/“Concluir revisão”. Um avanço explícito evita que um clique repetido se torne resposta do próximo cartão. Rodada, posição, verso e resposta já salva são recuperados ao recarregar ou retornar à página.

O painel lateral mostra pendentes novos/vencidos, lista expansível das perguntas pendentes, cartões estudados por assunto, acertos/erros agendados e próximas datas. “Estudados” significa ao menos uma revisão agendada, não domínio completo do assunto. Treinos ficam contabilizados separadamente no histórico e não inflacionam esse progresso. Não há XP nesta entrega.

## Regra de revisão espaçada

| Resultado da revisão agendada | Próximo intervalo |
| --- | --- |
| Erro | 1 dia, reiniciando a sequência de acertos |
| Primeiro acerto consecutivo | 3 dias |
| Segundo acerto consecutivo | 7 dias |
| Terceiro acerto consecutivo | 14 dias |
| Quarto acerto e seguintes | 30 dias |

O cálculo parte da data civil da resposta em `America/Sao_Paulo`, e não de blocos de 24 horas. Por exemplo, errar às 23:59 de 15/10 agenda 16/10; o cartão está vencido a partir da mudança do dia local. Meses, ano novo, ano bissexto e uma transição histórica de horário de verão são cobertos por testes. Uma regressão do relógio para antes do último registro bloqueia a transação e pede conferência da data, preservando a ordenação histórica.

Cartões nunca estudados também entram nos pendentes. Revisões vencidas mais antigas aparecem primeiro, com ordem estável entre empates. A fila é fixada no começo da rodada e cada cartão aparece uma vez nessa fila. Novos vencimentos podem ser incluídos ao iniciar outra rodada.

**Treino voluntário:** permitido antes do vencimento, inclusive para consultar cartões novos. Acertei/Errei gera um evento de prática, sem alterar a data, o intervalo, a sequência, os acertos ou os erros da agenda. Um cartão novo treinado continua novo na revisão agendada. Um erro no treino antecipado não antecipa indevidamente uma revisão já marcada; a interface informa isso após responder.

## Separação técnica e persistência

- `src/domain/review/engine.ts`: política de intervalos, filas, apresentação, resposta e progresso; sem React/DOM/storage.
- `src/domain/review/calendar.ts`: calendário civil, com relógio fornecido como parâmetro.
- `src/domain/review/persistence.ts`: validação de formato, versões e consistência do histórico/agenda/rodada.
- `src/services/review/ReviewStore.ts`: portas injetáveis de armazenamento, relógio, IDs e exclusão mútua.
- `src/services/review/browserReviewStore.ts`: adaptador do navegador, separado do adaptador do Pomodoro.
- `src/features/review/FlashcardSection.tsx`: apresentação e interação, sem regras de espaçamento em componentes.

Chave local independente: `mathquest.review.v1`. O snapshot versionado contém progresso por cartão (acertos, erros, sequência, intervalo, vencimento, último registro), eventos históricos e a rodada corrente. Cada evento identifica cartão, rodada e apresentação, modalidade, resultado e instante. A agenda e os contadores são reconstituídos a partir dos eventos na leitura e comparados aos valores armazenados. IDs duplicados, respostas agendadas antecipadas e rodadas incoerentes são rejeitados.

O armazenamento só confirma a nova resposta depois de a escrita terminar. Falha de leitura/corrupção não apaga o JSON existente; falha de escrita mantém a apresentação sem confirmação e oferece recarregar o progresso para tentar novamente. O histórico não é truncado silenciosamente. Há limites de 4 milhões de caracteres e 20 mil eventos; atingir um limite bloqueia novas gravações com aviso.

Web Locks serializa as transações sob uma chave própria, diferente da trava do Pomodoro. A leitura do último snapshot acontece **dentro** da trava. Outra aba com uma apresentação antiga não sobrescreve a nova apresentação nem duplica uma resposta já gravada. Uma aba que muda a rodada sincroniza as demais; por isso não há rodadas independentes simultâneas por aba. A prática normal é retomar a mesma revisão ou iniciar uma nova rodada explicitamente.

Sem Web Locks, a revisão fica em leitura com aviso. Usar localhost/HTTPS e navegador compatível, como já exigido para o Pomodoro. Persistência é restrita ao navegador e à origem; limpar dados do site remove esse progresso. Não há exportação/importação, sincronização entre dispositivos ou migração automática de versões de conteúdo nesta entrega. O histórico local não representa uma pontuação autenticada/competitiva.

## Testes e verificações

| Verificação | Resultado |
| --- | --- |
| `npm test` | **69 testes aprovados em 7 arquivos** |
| Domínio da revisão | 20 testes, incluindo intervalos, teto de 30 dias, erro/reinício, vencimentos, datas e integridade |
| Store de revisão | 8 testes: recarga, duplicação, concorrência, token antigo, quota, corrupção, data e modo leitura |
| Interface da revisão | 5 testes: assunto, verso obrigatório, Tab/Enter/Espaço, clique duplo, recarga, prática, erro e coexistência com Pomodoro |
| Regressões preservadas | Os 36 testes anteriores de Pomodoro/Dashboard continuam passando sem alterar os arquivos de teste existentes |
| Conteúdo matemático | Todos os IDs/campos/distribuição conferidos; as 30 respostas comparadas com cálculos e razões independentes nos testes |
| `npm run build` | **Aprovado**, TypeScript/Vite, 66 módulos, JS ~327 kB / ~104 kB gzip |
| HTTP local do build | 200 em `/`, `/revisao`, `/revisao#flashcards`, tomate, cenário e avatar de ranking |

Teste de coexistência: iniciar Pomodoro, avançar tempo confirmado, revelar/responder flashcard e continuar o mesmo ID de sessão, sem pausar, reiniciar ou gerar XP. Os testes também confirmam recuperação de apresentação já respondida, sem novo registro por clique repetido.

## Preservação e limite visual

O [relatório de preservação](reviews/flashcards/preservation.json) compara hashes de 27 arquivos capturados antes da implementação. A única alteração permitida nessa lista é a composição de `FocusPage.tsx`: import/render da seção e substituição da mensagem que dizia que flashcards chegariam depois. Motor, store, provider, CSS, testes e assets do Pomodoro, personagens, mascote, cenário, componentes base, Dashboard e dependências permanecem intactos.

Responsividade implementada no CSS local: duas colunas alinhadas à grade existente no desktop, empilhamento até 1050px, ajuste a 700px e controles empilhados a 480px, sem alturas fixas que recortem explicações. Os botões de resposta têm largura flexível e padding reduzido em telas pequenas. O foco permanece no botão de virar ao revelar e passa ao novo cartão após avançar; a lista rolável de pendentes também recebe foco por teclado. Botões são nativos e têm alvos de pelo menos 44px; status textual acompanha cor e animação.

O inventário do navegador retornou `apps: []` e `browsers: []`. Não foi possível fazer screenshots ou conferir a página em navegador real. Portanto, **responsividade, nitidez e composição renderizadas continuam pendentes de conferência visual**, assim como os personagens aprovados. Testes DOM e revisão de CSS não são apresentados como essa validação.

Para conferir localmente: `npm run dev` → `/revisao`. Verificar 1440×1080, 1024×768, 768×1024, 390×844 e 320×720, zoom 200%, teclado e movimento reduzido. Testar uma rodada por assunto, recarga com verso aberto, recarga após responder, treino antes do vencimento e revisão enquanto o Pomodoro executa. Não iniciar FastAPI/Supabase antes da validação desta entrega.
