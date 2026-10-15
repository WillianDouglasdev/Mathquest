# MathQuest

MathQuest em React + TypeScript + Vite + React Router: Dashboard demonstrativo, **Trilhas** com mapa oficial interativo e **Revisão e Foco** com Pomodoro funcional, 30 flashcards predefinidos e progresso local real. FastAPI/Supabase e demais atividades educacionais pertencem às fases seguintes.

Os três formatos do personagem, o Pomodoro e os flashcards estão tecnicamente aprovados e preservados. A primeira conferência renderizada está registrada na entrega de tipografia; a aprovação visual do usuário permanece pendente. A revisão oferece 10 cartões por assunto (operações, frações e porcentagem), resposta após revelar, agenda de 1 dia por erro e 3/7/14/30 dias por acertos sucessivos, treino antecipado sem alterar a agenda e histórico persistente sem registros duplicados. Ver [resultado dos flashcards](docs/07-flashcards.md) e [resultado do Pomodoro](docs/06-pomodoro.md). Nenhuma dessas atividades concede XP nesta versão.

## Executar

Arena, integração artística: `/arena` apresenta o cenário oficial, estudante aprovado e quatro poses do Guardião da Lógica, com HP e diálogo em React. Os controles são uma **prévia visual**, sem motor de dano, correção ou XP. `/desafios` redireciona para a Arena. Respeita preferências de animação, movimento reduzido e Modo Foco; fontes em `art/` preservadas. **143 testes em 22 arquivos e build aprovados.** [Arquivos, testes e limitações](docs/15-arena-integracao-artistica.md). A aprovação visual do usuário é necessária antes do motor completo.

Trilhas 8-bit: mapa oficial `art/Mapa_test.png` integrado sem alterações, seis regiões selecionáveis, cinco estados derivados de dados e 24 atividades demonstrativas em prévias. Layout de mapa/painel 75/25 no desktop amplo e exploração horizontal com detalhes abaixo em telas menores. **129 testes em 21 arquivos e build aprovados**. [Entrega, arquivos e validação](docs/14-trilhas-mapa.md). Progresso do mapa é demonstrativo e independente dos estudos reais; nenhuma ação concede XP.

Fase de animações 2.0: nuvens independentes no cabeçalho e na sidebar, idle vertical de 2px do slime e brilho discreto na estrela. Perfil com corpo inteiro, nível e XP: 176px em telas amplas, 150px em notebooks de 768px de altura e versão compacta em celulares/telas baixas. Barras de XP totalmente estáticas, inclusive na entrada. **116 testes e build aprovados novamente**; conferência renderizada em seis tamanhos de tela. [Entrega, arquivos e limitações](docs/13-animacoes-2.md). Assets e funcionalidades aprovadas preservados; avaliação visual do usuário permanece pendente.

Personagem animado: [pacote visual v1](docs/11-personagem-animado.md) com idle no Dashboard/sidebar, ranking estático, bloqueios por movimento reduzido/Modo Foco e teto de dois estudantes animados. PNGs originais preservados. **115 testes e build aprovados**. Comemorações prontas no componente, aguardando eventos reais de missão/desafio (atualmente prévias).

Atualização de sons: **19 efeitos 8-bit**, ligados por padrão em perfis novos, com atalho **Sons** no cabeçalho e painel destacado. Preferências de silêncio já salvas são respeitadas. **102 testes e build aprovados**; [resultado e validação](docs/10-sons-em-destaque.md).

Polimento atual: [direção audiovisual 1.0](docs/09-direcao-audiovisual.md), entregue em cinco etapas verificadas: fontes híbridas e frações nativas, animações opcionais, Rádio MathQuest, efeitos 8-bit e Modo Foco. **98 testes aprovados e build completo**. Painel “Ambiente MathQuest” disponível em todas as páginas; preferências locais, sem autoplay. A Rádio informa catálogo vazio até a inclusão de músicas licenciadas; os efeitos são sintetizados localmente e opcionais. [Origem e atribuição do áudio](docs/audio-assets.md). Avaliação visual/auditiva do usuário permanece pendente; FastAPI/Supabase não iniciados.

Requer Node.js 24.x e npm, a mesma versão principal definida para a Vercel.

```sh
npm ci
npm run dev
```

Abra a URL apresentada pelo Vite (normalmente `http://127.0.0.1:5173`).

```sh
npm test
npm run build
npm run preview
```

O build estático é gerado em `dist/`. Ao hospedar, configure fallback para `index.html` para que as rotas do React Router funcionem por acesso direto.

## Publicar na Vercel

O projeto está preparado para importação do GitHub como **Vite**, usando a raiz do repositório. O `vercel.json` define instalação com `npm ci`, build com `npm run build`, saída `dist` e fallback de navegação para `index.html`. Node **24.x** está definido em `package.json` e `.nvmrc`. Não há variáveis de ambiente obrigatórias nesta versão.

Depois de importar o repositório, mantenha **Root Directory** na raiz, confira o preset **Vite** e publique. Os endereços `/arena`, `/trilhas`, `/revisao` e `/desafios` devem funcionar também ao abrir um link direto ou recarregar a página. O redirecionamento antigo de Desafios continua a cargo do React Router.

Antes de enviar mudanças, execute:

```sh
npm ci
npm test
npm run build
npm run check:deploy
```

O último comando verifica grafia dos imports para Linux, referências de assets e integridade das cópias públicas no build. Progresso continua local a cada navegador e domínio: publicar o site não transfere automaticamente o histórico salvo em localhost. FastAPI, Supabase, IA e XP global não foram adicionados.

Detalhes, resultados e limites estão em [comentários e preparação da publicação](docs/16-comentarios-publicacao.md). A configuração de SPA segue a [documentação oficial da Vercel para Vite](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas).

## Como ler o código

Os módulos têm comentários em português sobre decisões e cuidados de implementação, incluindo os casos que parecem detalhes de interface, mas protegem registros reais de estudo. Um caminho de leitura útil é começar pelo domínio, passar pelos stores e então ver os componentes que apresentam o resultado.

| Área | Onde começar | Decisão principal |
| --- | --- | --- |
| Pomodoro | `src/domain/focus/engine.ts` | Medir tempo confirmado e não creditar ausência |
| Revisão | `src/domain/review/engine.ts` | Separar treino livre da agenda e impedir respostas duplicadas |
| Persistência | `src/services/focus/` e `src/services/review/` | Confirmar gravação e coordenar as abas |
| Trilhas | `src/domain/trails/progress.ts` | Derivar estados dos requisitos, sem gravar progresso de prévias |
| Ambiente | `src/services/experience/` | Manter áudio, foco e preferências independentes |
| Arena | `src/features/arena/` | Separar a cena artística das futuras regras de batalha |
| Interface | `src/components/` e `src/styles/` | Reutilizar identidade, leitura acessível e controle de movimento |

O Pomodoro usa localStorage e Web Locks para impedir duas abas escritoras. Abra por localhost ou HTTPS em navegador compatível; sem o controle de abas, a página fica em leitura e informa a limitação. Fechar/reabrir recupera pausado no último checkpoint, sem crédito de ausência.

Flashcards usam uma chave de storage e uma trava independentes, sem interferir no Pomodoro. Estado da apresentação, resultados e agenda são salvos localmente. No treino livre, os eventos são registrados separadamente e não alteram a data/intervalo da revisão agendada.

## Entrega

- Sidebar, cabeçalho e seis cards do Dashboard; layout adaptável a desktop e mobile.
- `/trilhas`: seis regiões sobre o mapa pixel art oficial, seleção acessível, detalhes, requisitos de desbloqueio e prévias honestas de conteúdo futuro.
- Busca por atalhos do Dashboard, diálogos acessíveis de perfil, conquistas, notificações e ranking.
- `/revisao`: Pomodoro, histórico de foco, flashcards, pendentes e progresso por assunto; acesso rápido ao Pomodoro pelo Dashboard.
- Rotas futuras identificadas como próxima fase e fallback para endereço desconhecido.
- Assets PNG e fontes WOFF2 locais. Sem login, credenciais ou serviços externos em runtime.
- Cards educacionais/ranking do Dashboard continuam demonstrativos. Foco e revisão registram atividades reais locais e não concedem XP.

Documentação: [Flashcards e validação](docs/07-flashcards.md), [Pomodoro e validação](docs/06-pomodoro.md), [plano de continuidade vigente](docs/04-plano-de-continuidade.md), [planejamento inicial](docs/01-planejamento.md), [assets e prompts](docs/02-assets.md), [validação e retorno do usuário](docs/03-validacao.md).

Referência visual aprovada: [personagem em três formatos](docs/reviews/student-v2/index.html). Os candidatos permanecem arquivados; cópias idênticas estão integradas em `public/assets/characters/`.

## Organização

```text
src/
  app/                  shell, navegação, rotas e diálogos
  components/           primitivas compartilhadas e recortes do atlas
  data/                 fixtures demonstrativas e 30 flashcards estáticos
  features/dashboard/   primeira página e composição dos cards
  features/trails/      mapa oficial, pontos, personagem, legenda e detalhes
  domain/trails/        seletores puros de estados e progresso demonstrativo
  features/focus/       interface, provider e atalho do Pomodoro
  domain/focus/         motor puro, validação e estatísticas, testes Node
  services/focus/       store com relógio/storage injetáveis
  features/review/      cartões, treino e mapa de revisão
  domain/review/        espaçamento, calendário e validação, testes Node
  services/review/      transações locais e sincronização entre abas
  styles/               tokens, fontes e base acessível
  test/                 testes de interação e consistência
public/assets/          cenário, atlas e fontes locais
docs/                   arquitetura, modelo futuro, fases e QA
```

CSS Modules encapsula os estilos dos componentes; tokens globais compartilham paleta e tipografia. O atlas PNG é exibido por janelas SVG, sem redesenhar os personagens e sem duplicar o arquivo por ícone.

Não há backend nesta fase. O modelo planejado para FastAPI/Pydantic e Supabase PostgreSQL, incluindo acesso e proteção de credenciais, está descrito no planejamento.
