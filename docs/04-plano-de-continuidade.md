# MathQuest — plano de continuidade

Direção vigente: [audiovisual 1.0](09-direcao-audiovisual.md), com as cinco etapas implementadas e verificadas, 98 testes e build aprovados. Rádio com catálogo local vazio explícito, aguardando arquivos licenciados; aprovação visual/auditiva do usuário pendente. Esta fase não inicia API/banco. As atualizações abaixo permanecem como histórico das decisões anteriores.

Atualização vigente após aprovação técnica dos flashcards: antes da API e banco, executar as quatro entregas de [polimento de experiência](08-polimento-experiencia.md): tipografia → microanimações → player local de música → efeitos opcionais. Etapa 1 implementada e entregue separadamente, com 69 testes aprovados, build e evidências renderizadas. As demais etapas permanecem pendentes. Os registros abaixo documentam a evolução anterior e não autorizam antecipar FastAPI/Supabase.

Status: plano aprovado pelo usuário em 15/10/2026, com três ajustes incorporados: flashcards locais antecipados, motor do Pomodoro independente de React e aprovação visual do personagem antes de integração. Os três formatos foram posteriormente aprovados e integrados na entrega 1b; ver [verificações e limite da conferência visual](05-integracao-personagem.md). A página Revisão e Foco permanece para a próxima entrega, separada desta integração.

Atualização de execução: integração do personagem aprovada tecnicamente, com conferência visual renderizada pendente. Conforme o pedido mais recente, a implementação funcional foi dividida em **Pomodoro primeiro, flashcards depois**. Motor e interface do Pomodoro estão implementados com 36 testes e build aprovados; [registro da entrega 1](06-pomodoro.md). Flashcards não foram iniciados nessa entrega.

Entrega 2 posterior: os [30 flashcards locais](07-flashcards.md) foram implementados com as regras mais recentes do usuário, totalizando 69 testes aprovados e build completo. Pomodoro/assets preservados. Conferência visual renderizada continua pendente. FastAPI/Supabase não foram iniciados.

Este documento atualiza a ordem das fases do planejamento inicial. A aprovação visual comunicada pelo usuário passa a ser a referência de continuidade, com ressalva expressa ao personagem atual. A imagem de **Revisão e Foco** anexada nesta revisão orientará a nova página.

## 1. Decisões registradas

| Área | Decisão |
| --- | --- |
| Base aprovada | Preservar paleta, tokens, fontes, componentes, organização do Dashboard, cenários e mascote verde |
| Personagem atual | Não aprovado; apresentar corpo inteiro, retrato e avatar pequeno consistentes; integrar somente após validação visual do usuário |
| Pomodoro | Funcionalidade central; antecipar sua implementação, com acesso rápido na Home e página `/revisao` |
| Navegação | Usar o nome “Revisão e Foco”, preservando a URL `/revisao` |
| Flashcards | Baralhos predefinidos locais antecipados para a primeira página funcional de Revisão e Foco; migração à API/banco depois |
| Motor de foco | TypeScript independente de React, DOM e storage; relógio injetável e testes automatizados; adaptadores cuidam dos efeitos |
| Python | FastAPI/Pydantic responsáveis pela API de conteúdo, validação de respostas, desafios e cálculo de pontuação |
| Supabase PostgreSQL | Armazenar conteúdo predefinido e seus gabaritos; acesso de runtime mediado pelo backend |
| Perfil sem login | Progresso, sessões, revisão, sequência e ledger de recompensas permanecem locais e versionados |
| Entrega atual | Integrar os três formatos já aprovados, validar testes/build e preservar os demais assets; manter Revisão e Foco para a próxima entrega |

## 2. Personagem e continuidade visual

Criar primeiro uma ficha visual do estudante: cabelo castanho, mochila visível, roupas azuis e verdes, expressão amigável, proporções e contornos próximos do estudante das imagens originais de UX. A ficha fixa paleta, tamanho do pixel, silhueta, rosto, roupa e proporção entre cabeça e corpo. A imagem do estudante isolado é referência complementar; o estudante nas telas de UX é a referência principal para sua aplicação na interface.

Produzir três formatos do mesmo personagem: corpo inteiro para saudação/página de foco, retrato para cabeçalho e navegação e avatar pequeno dedicado ao ranking. Fixar cabelo, rosto, roupa, paleta e contornos entre os formatos, ajustando a quantidade de detalhe para legibilidade. Não reduzir o corpo inteiro até tornar o rosto ilegível. Expressões ou poses de sucesso poderão ser derivadas da mesma ficha posteriormente, quando houver uma interação que as utilize.

Propostas ficam inicialmente em `docs/reviews/student-v2/`, com nomes `full-body-candidate.png`, `navigation-portrait-candidate.png` e `ranking-avatar-candidate.png`. Essa pasta não é carregada pela aplicação. Após validação explícita, copiar apenas as versões aprovadas para arquivos próprios em `public/assets/characters/`, com transparência e manifesto de variantes/tamanhos. Preservar `landscape.png` e `sprites.png`. Um componente `StudentAvatar` poderá centralizar os usos no Dashboard, cabeçalho, sidebar, perfil e ranking demonstrativo. Não regenerar o atlas completo.

Critérios visuais: comparar rosto e silhueta com a UX em tamanho real de uso; inspecionar o retrato em 40/48px, o avatar em 24/30/32px e o corpo em 72/88/100px, sem recortes indevidos, desfoque ou variação de identidade. Apresentar os três formatos ao usuário e registrar sua decisão antes de alterar qualquer referência da interface. Registrar antes/depois na integração e confirmar que os cenários e o slime permanecem intactos.

Novos detalhes ilustrativos serão pontuais: tomate/relógio pixel art para o Pomodoro e feedback curto do mascote ao concluir uma sessão. Conservar espaço em branco e hierarquia atuais. Usar texto HTML para números, rótulos e mensagens, sem embuti-los nas imagens. Respeitar redução de movimento e não depender de animação, som ou cor para comunicar resultados.

## 3. Pomodoro funcional

### Motor independente da interface

Implementar o domínio em `src/domain/focus/`, com tipos, transições, contabilização e recuperação sem imports de React, acesso a `window`/`document`, timers globais ou `localStorage`. O relógio e os eventos entram como parâmetros/dependências injetáveis. O motor retorna novo estado e eventos de domínio; adaptadores em `src/services/focus/` executam relógio/checkpoints, persistência e sincronização. Hooks/provider apenas conectam esse serviço ao React e não concentram regras de tempo.

Executar os testes do motor com Vitest em ambiente `node`, com relógio controlado; testes da interface continuam em `jsdom`. Uma alteração visual não deve mudar as regras do motor. Registro de tempo ativo confirmado, recuperação pausada e ausência de XP automático são decisões aprovadas.

### Estados e controles

Estados explícitos: `idle`, `running`, `paused`, `completed` e `ended`. Durações: 15, 25 ou 50 minutos. Seleção de duração antes de iniciar; durante uma sessão, o usuário deve finalizá-la para selecionar outra.

- **Iniciar:** cria uma sessão com ID único, duração e início do primeiro intervalo ativo.
- **Pausar:** fecha o intervalo ativo, salva o tempo acumulado e congela o restante.
- **Continuar:** abre novo intervalo ativo na mesma sessão, sem zerar o tempo anterior.
- **Finalizar:** fecha a sessão antecipadamente, registra somente o tempo acumulado e informa “sessão finalizada antes da meta”. Não conta como sessão concluída.
- **Conclusão automática:** ao atingir a duração, registra uma única conclusão e limita o tempo à meta. Exibe feedback acessível e permite iniciar outra sessão.

Controles inválidos ficam desabilitados com estado compreensível. Cliques repetidos, remontagem de componentes e atualização não podem duplicar sessão, tempo ou conclusão.

### Contagem de tempo e recuperação

“Tempo efetivamente estudado” significa tempo confirmado com a sessão em execução; não é uma medição de atenção. Pausas e período com a aplicação fechada são excluídos. O histórico é a fonte das estatísticas; não manter contadores diários independentes que possam divergir das sessões.

O contador deve calcular tempo por intervalos e relógio, sem assumir que cada chamada de `setInterval` vale exatamente um segundo. Usar relógio monotônico durante a execução e timestamps civis para distribuir intervalos entre dias. Uma sessão com meta de 25 minutos, 10 minutos ativos, 2 minutos pausados e mais 5 minutos ativos deve registrar **15 minutos estudados** e **10 minutos restantes**.

Persistir transições imediatamente e checkpoints durante execução, com intervalo alvo de até 5 segundos e tentativa de gravação em `pagehide`/mudança de visibilidade. Navegar entre rotas mantém a sessão no provider compartilhado. Recarregar ou reabrir recupera a sessão **pausada**, com o último tempo confirmado e aviso para continuar; o intervalo desde o último checkpoint até o retorno não é creditado automaticamente. Suspensão do dispositivo ou grandes lacunas de execução devem levar à recuperação conservadora, sem converter horas ausentes em estudo. Uma terminação abrupta pode perder até o intervalo do checkpoint em condições normais; essa limitação deve ser documentada e testada.

Alvo de UX: permitir uso em segundo plano enquanto a sessão continua executando; não tratar apenas a troca de aba como pausa. Se houver lacuna sem evidência de execução, não atribuir tempo silenciosamente. Os testes devem simular throttling, suspensão e relógio alterado para definir esse comportamento com clareza.

### Persistência e histórico

Store local com `schemaVersion`, sessão ativa, sessões encerradas e intervalos confirmados. Campos mínimos: `sessionId`, `plannedSeconds`, `status`, `startedAt`, `updatedAt`, `activeSegments`, `confirmedActiveSeconds`, `endedAt?` e `endReason?`. Persistir timestamps com offset/UTC e manter a convenção de calendário documentada. Armazenar segundos; arredondar apenas na apresentação.

Histórico diário e semanal com tempo real acumulado, sessões completas e sessões encerradas antecipadamente separadas. Semana de segunda a domingo; calendário inicialmente `America/Sao_Paulo`, explicitado na interface de histórico e compartilhado com os cálculos de desafios. Intervalos que atravessam meia-noite devem ser divididos entre os dias corretos. Semana anterior só terá comparação quando houver dados; ausência de histórico não gera porcentagens artificiais.

Evitar execução simultânea da mesma sessão em duas abas por exclusão mútua local e sincronização; a segunda aba mostra o estado recebido e informa qual aba controla a sessão. Definir recuperação da trava após fechamento e testar concorrência. Falhas de storage, quota ou dados corrompidos devem produzir aviso e recuperação segura, sem apresentar salvamento como bem-sucedido. Exportação/importação terá versão, validação e substituição explícita, sem somar o mesmo histórico duas vezes.

### Página e acesso na Home

Adicionar à Home um acesso compacto “Estudar com Pomodoro” apontando para `/revisao#pomodoro`, sem remover ou reorganizar os seis cards aprovados. Com sessão ativa, mostrar o estado real e “Retomar foco”. A ação deve usar a mesma sessão exibida na página, sem iniciar um segundo contador.

Em `/revisao`, reutilizar `AppShell`, `Card`, `Button`, `ProgressBar`, `Badge`, tokens e cenários. A referência orienta Pomodoro à esquerda, “Minha semana” à direita, flashcards abaixo e próximas revisões baseadas em dados reais, com empilhamento no mobile. O display do tomate terá números HTML legíveis. Histórico vazio começará em zero, com orientação para a primeira sessão. A primeira entrega funcional da página deve incluir **Pomodoro e flashcards locais**, antes da integração do banco.

**XP:** na entrega do Pomodoro, não conceder XP por passagem de tempo. O feedback pode celebrar a sessão, mas o cronômetro não gera pontos nem ativa bônus 2x. Recompensas por exercícios e revisão válida serão calculadas em Python na entrega de gamificação. Os números 320 min, 12 sessões, sequência de 7 dias e 2x XP da imagem são exemplos visuais, não dados iniciais do usuário.

### Flashcards locais antecipados

Escopo atualizado pelo usuário e implementado na entrega 2: 30 cartões predefinidos, 10 de operações fundamentais, 10 de frações e 10 de porcentagem. Conteúdo educacional real local, sem desempenho inicial fictício. Cada cartão tem ID estável, assunto, pergunta, resposta e explicação curta; o catálogo possui versão. Não oferecer criação de cartões personalizados nem geração por IA.

Seleção por assunto, pergunta/resposta, animação discreta, “Acertei”/“Errei”, avanço explícito e fim da revisão. Só registrar após revelar e uma vez por apresentação. Regra vigente: erro agenda o dia seguinte e reinicia a sequência; acertos consecutivos agendam 3, 7, 14 e 30 dias, com teto de 30 dias. Treino voluntário antes do vencimento registra eventos separados, preservando toda a agenda. Abrir/virar não altera o desempenho.

O snapshot versionado salva acertos, erros, sequência, intervalo, vencimento por data civil e último registro por cartão; eventos identificam rodada/apresentação/cartão. Calendário de São Paulo, relógio injetável, estados de vazio/conclusão, lista de pendentes e próximas revisões reais. Histórico e agenda são verificados por reconstrução dos eventos ao ler. Sem XP nesta versão local.

A fonte inicial está isolada no módulo estático `src/data/flashcards.ts`; a migração futura para um repositório/adaptador FastAPI preservará IDs e exigirá tratamento explícito das versões. Não iniciar essa integração antes da validação atual. Testes cobrem conteúdo, agenda, duplicação, recarga, corrupção, concorrência, datas, fim de rodada e execução conjunta com o Pomodoro.

## 4. Arquitetura e responsabilidades

```text
React + TypeScript + Vite
  ├─ componentes e páginas existentes
  ├─ domain/focus: motor puro de tempo, sem React/DOM/storage
  ├─ services/focus: relógio, persistência e sincronização
  ├─ features/focus: interface do Pomodoro e histórico
  ├─ features/review: flashcards e conteúdo local predefinido
  ├─ services/api: cliente tipado e tratamento de erros
  └─ storage: progresso local, versões e importação/exportação
            │ HTTPS / JSON
            ▼
Python + FastAPI + Pydantic
  ├─ routers: conteúdo, submissões e desafios
  ├─ services: validação, seleção mensal e pontuação
  ├─ repositories: acesso ao conteúdo
  └─ schemas: contratos de entrada/saída e erros
            │ acesso exclusivo do servidor
            ▼
Supabase PostgreSQL
  módulos, lições, questões, alternativas, gabaritos,
  desafios, vínculos desafio/questões e flashcards predefinidos
```

Pomodoro, histórico e a primeira revisão por flashcards funcionam localmente, sem aguardar API ou banco. O auto-relato “acertei/errei” dos flashcards atualiza a revisão local e não equivale à validação de exercícios. O React apresenta o conteúdo e o feedback; a correção de questões e a decisão de pontuação educacional serão do Python. Seleção mensal usa uma data de referência e ordem de ciclo explícitas, com repetição após os 15 desafios, independente do relógio do frontend.

O backend recebe a resposta e o identificador/versionamento da atividade; consulta o gabarito e a regra de recompensa. Nunca aceita do cliente uma flag de acerto ou um valor de XP como autoridade. Questões numéricas usam `Decimal` e regra de normalização documentada para formatos brasileiros, tolerâncias e entradas ambíguas. As respostas de conteúdo não incluem gabaritos antecipados; a submissão retorna correção e explicação.

Sem login, o backend valida respostas e calcula recompensas, mas **não pode garantir identidade, integridade do progresso local ou impedir adulteração manual/replay por pessoa**. O ledger local impede repetição no fluxo normal; não constitui proteção de um ranking competitivo. Importação ou armazenamento editado não devem ser apresentados como resultados verificados. O ranking permanece demonstrativo.

### Contratos propostos para a primeira integração

| Endpoint | Responsabilidade |
| --- | --- |
| `GET /api/v1/health` | Saúde do serviço, sem credenciais ou detalhes internos |
| `GET /api/v1/modules` | Ordem e metadados dos seis módulos |
| `GET /api/v1/modules/{slug}/lessons/{lesson}` | Objetivo, conteúdo, exemplos e questões públicas |
| `POST /api/v1/questions/{id}/submissions` | Validar alternativa/resposta numérica e retornar explicação, XP calculado e chave de recompensa |
| `GET /api/v1/challenges/current` | Desafio mensal selecionado no servidor e identificação de ciclo/período |
| `POST /api/v1/challenges/{id}/submissions` | Validar tentativa de desafio e aplicar suas regras de pontuação |
| `GET /api/v1/flashcards?module={slug}` | Baralhos predefinidos; sem criação pública de cartões |

Os contratos são propostas para implementação incremental. Pydantic define os schemas e OpenAPI documenta o acordo com o frontend. Erros de entrada, atividade inexistente e indisponibilidade devem ter respostas previsíveis e mensagens adequadas. Nenhum endpoint de gravação administrativa será público.

### Credenciais, banco e implantação

Somente o backend acessará o Supabase. Usar credencial/role dedicada com os privilégios mínimos de leitura necessários; escrever conteúdo via migrações e seeds controlados. Habilitar RLS e restringir grants nas tabelas expostas pelo Supabase; `anon`/`authenticated` não devem ler gabaritos nem alterar conteúdo. Verificar isso com testes de acesso, sem depender apenas de CORS. Caso alguma tarefa administrativa exija `service_role`, seu uso será restrito ao ambiente de servidor/administração; essa chave pode ignorar RLS e nunca é uma credencial do frontend.

O frontend terá apenas uma configuração pública como `VITE_API_BASE_URL`. URL privada de conexão, senha e chaves privilegiadas ficarão em variáveis do backend, fora do Git e sem prefixo `VITE_`. `.env.example` conterá somente placeholders. Configurar origens permitidas no FastAPI, limites de requisição e timeouts conforme a API for exposta. O plano não pressupõe um projeto Supabase já conectado nem credenciais disponíveis.

Estrutura aditiva proposta: `backend/app/{routers,services,repositories,schemas}`, `backend/tests`, `supabase/migrations`, `supabase/seed.sql` e as novas pastas de feature/serviços no `src`. Manter o frontend na raiz. Extrações pequenas de `Search` e `RankingList` de `app/App.tsx` para componentes compartilhados podem remover o acoplamento atual com o Dashboard quando necessário; não justificam reescrever o shell.

## 5. Entregas pequenas e verificáveis

Cada linha é uma entrega independente. Sua verificação deve terminar antes da próxima dependente. Build e os testes existentes acompanham toda mudança de frontend; Python recebe `pytest` e testes de contratos. A duração de uma etapa não é uma estimativa de prazo.

| Etapa | Escopo e resultado verificável | Testes e aceite |
| --- | --- | --- |
| 0 — Registro | Revisar os documentos e este plano | Decisões alinhadas ao pedido; nenhum código/asset alterado nesta etapa |
| 1a — Proposta visual | Corpo inteiro, retrato de navegação e avatar de ranking isolados da aplicação | Apresentar três formatos consistentes da mesma identidade e aguardar validação visual do usuário; nenhuma substituição |
| 1b — Personagem aprovado | Somente após 1a validada: integrar os três formatos nos usos atuais | Comparação em tamanhos reais; cenários e mascote preservados; build e testes de regressão |
| 2 — Motor de foco | Máquina de estados independente de React; adaptadores separados para store local, relógio e recuperação | Vitest em Node com relógio controlado: 15/25/50, pausa/retomada, término parcial, conclusão única e lacunas; testes dos adaptadores para recarga, falha de storage e duas abas |
| 3a — Pomodoro na interface | Entrega 1: atalho na Home, Pomodoro completo, histórico diário/semanal e recuperação local | Motor e interface implementados; testes/build aprovados. Conferência visual em navegador continua pendente |
| 3b — Revisão local | Entrega 2 implementada: 30 cartões predefinidos, desempenho, agenda e integração na página de foco | 69 testes e build aprovados; conteúdo, datas, duplicação, persistência e coexistência verificados; conferência visual pendente. Validar antes da API/banco |
| 4 — API Python mínima | FastAPI/Pydantic, contrato de conteúdo e submissão, repositório de fixtures apenas em desenvolvimento/testes | `pytest`/TestClient: respostas corretas/incorretas, formato brasileiro, tolerância, input inválido, conteúdo inexistente, XP calculado no servidor; fixture claramente identificada |
| 5 — Supabase | Migrações, modelo relacional e seed de uma lição completa; trocar adapter por PostgreSQL | Banco de teste recriável, constraints, leitura pela API, gabaritos protegidos, escrita pública negada, falha do banco tratada; nenhuma chave privilegiada no bundle |
| 6 — Primeira lição integrada | Uma lição real React → FastAPI → Supabase, correção, feedback, progresso local e exportação/importação | Fluxo ponta a ponta, acerto/erro, indisponibilidade, refresh, conclusão/recompensa sem duplicação e importação inválida; validar antes de ampliar aos seis módulos |
| 7 — Desafios e regras | Banco de 15 desafios, seleção mensal e pontuação em Python; ledger, níveis, sequência de 7 dias, escudo e bônus 2x com expiração de 2 dias | Ciclo completo e virada do mês/ano; datas fixas; tentativas repetidas; aplicação única de bônus; expiração; nenhuma recompensa por apenas manter timer aberto |
| 8 — Flashcards via API | Migrar a fonte dos baralhos locais já funcionais para FastAPI/Supabase, conservando o desempenho compatível | IDs/versões, migração do progresso, indisponibilidade e testes de contrato; sem recriar a página ou introduzir baralhos personalizados; testes Python de recompensa se aplicada |

Na etapa 3b, histórico de foco e revisão são reais e locais; os demais cards do Dashboard continuam explicitamente demonstrativos. Na etapa 6, a migração dos dados fictícios para progresso local real deve ser deliberada: perfil novo começa com dados reais próprios; fixtures não são importadas como estudo ou XP conquistado. Identificar separadamente os cards ainda demonstrativos até sua substituição.

## 6. Roteiro de validação e limites

Para cada alteração visual, comparar com as telas originais e com a Home aprovada em 1440×1080, 1024×768, 768×1024, 390×844 e 320×720, incluindo zoom de 200%, Tab/Shift+Tab/Escape e movimento reduzido. Verificar legendas legíveis, ausência de overflow e identidade dos sprites. A aprovação visual já comunicada não substitui os testes técnicos futuros de responsividade; a limitação anterior de navegador permanece no registro histórico.

Nos testes de tempo, usar relógio injetável para dias, viradas de semana e recuperação; não aguardar sessões de 50 minutos. Nos testes de banco, usar ambiente descartável de desenvolvimento/teste, sem executar migrações em produção por padrão. Revisar a normalização de respostas e as regras de XP no backend com exemplos matematicamente conferidos.

Sequência vigente após o pedido mais recente: **personagem integrado e tecnicamente aprovado → motor e interface do Pomodoro (entrega 1) → flashcards locais na mesma página (entrega 2) → API Python → Supabase → primeira lição integrada**, depois desafios e migração dos flashcards para API. Concluir e validar cada entrega antes da dependente. A conferência visual renderizada dos personagens e da página permanece uma pendência explícita; os personagens aprovados não devem ser regenerados para tentar suprir essa conferência.
