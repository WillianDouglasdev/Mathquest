# <img src="public/favicon.svg" alt="" width="32" height="32" /> MathQuest

Uma aventura para aprender matemática, criar constância e revisar no próprio ritmo.

A MathQuest combina sessões de foco e revisão espaçada com uma interface inspirada em RPGs 8-bit. O projeto explora como uma experiência visual acolhedora pode tornar o estudo de Matemática Básica mais organizado e motivador.

**Status:** MVP em desenvolvimento. Pomodoro e flashcards possuem registros locais funcionais; Trilhas e Arena apresentam as primeiras experiências interativas de navegação e composição visual.

## Funcionalidades

### Foco e revisão

- **Pomodoro:** sessões de 15, 25 e 50 minutos, com início, pausa, retomada, finalização e reinício.
- **Tempo confirmado:** o histórico considera o período efetivamente registrado, sem contabilizar automaticamente o tempo com a aplicação fechada.
- **Histórico de estudo:** minutos e sessões concluídas organizados por dia e semana.
- **30 flashcards:** operações fundamentais, frações e porcentagem, com pergunta, resposta e explicação.
- **Revisão espaçada:** erros retornam no dia seguinte; acertos consecutivos avançam para 3, 7, 14 e 30 dias.
- **Treino livre:** revisão antecipada sem alterar a agenda dos cartões.

### Mundo MathQuest

- **Trilhas:** mapa de aventura com seis regiões, pontos selecionáveis e requisitos de acesso demonstrativos. O conteúdo completo das aulas ainda está em desenvolvimento.
- **Arena:** cenário de batalha com estudante, Guardião da Lógica, diálogos e quatro poses de apresentação. As regras completas de batalha ainda não estão implementadas.
- **Dashboard:** visão geral da jornada, com perfil, ranking e recompensas demonstrativos.
- **Ambiente:** 19 efeitos sonoros opcionais, controle de volume, animações discretas e Modo Foco. O player de música local está preparado, mas ainda não inclui faixas.

A interface oferece navegação por teclado, layout responsivo e respeito à preferência do sistema por movimento reduzido. Nesta versão, as atividades de foco e revisão não concedem XP.

## Tecnologias

- React 19 e TypeScript.
- Vite para desenvolvimento e build.
- React Router para navegação.
- CSS Modules e fontes locais Pixelify Sans e Nunito Sans.
- Vitest e Testing Library para testes.
- Web Audio API para os efeitos sonoros.
- localStorage e Web Locks para persistência e coordenação entre abas.

O frontend funciona sem login ou serviços externos. Python/FastAPI e Supabase PostgreSQL fazem parte da arquitetura planejada para as próximas etapas.

## Executar localmente

Requer **Node.js 24.x** e npm.

```sh
git clone https://github.com/WillianDouglasdev/Mathquest.git
cd Mathquest
npm ci
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://127.0.0.1:5173`. Não é necessário configurar variáveis de ambiente nesta versão.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Iniciar o ambiente de desenvolvimento |
| `npm test` | Executar os testes de domínio, serviços e interface |
| `npm run build` | Verificar o TypeScript e gerar a versão de produção |
| `npm run check:deploy` | Conferir caminhos para Linux, referências de assets e arquivos gerados |
| `npm run preview` | Servir localmente o último build de produção |

O build é gerado em `dist/`. Execute `npm run build` antes de `check:deploy` ou `preview`.

## Estrutura do projeto

```text
src/
  app/          rotas, navegação e estrutura compartilhada
  components/   componentes reutilizáveis e apresentação matemática
  data/         flashcards, catálogo de músicas e dados demonstrativos
  domain/       regras de foco, revisão espaçada e progresso das trilhas
  services/     persistência, coordenação entre abas, preferências e áudio
  features/     Dashboard, Trilhas, Revisão e Foco, Arena e ambiente
  styles/       tokens e estilos globais
  test/         testes de interação
public/         favicon, fontes, cenários, personagens e áudio local
art/            fontes e referências dos assets
scripts/        verificações de publicação
docs/           documentação técnica e registros de desenvolvimento
```

As regras do Pomodoro e da revisão espaçada ficam fora dos componentes React. Os serviços cuidam de armazenamento e recursos do navegador; a interface apresenta o estado e encaminha as ações. Essa separação permite testar regras sem depender da renderização das páginas.

## Dados e persistência

O progresso é salvo no navegador, por domínio. O histórico de localhost não é transferido automaticamente para uma publicação ou para outro dispositivo.

Pomodoro e flashcards usam chaves e travas independentes. Ao reabrir a aplicação, uma sessão de foco em andamento é recuperada em pausa. Sem suporte a Web Locks, os controles que exigem gravação segura entre abas ficam em modo de leitura.

Perfil, ranking, progresso das Trilhas e HP da prévia da Arena continuam demonstrativos e não são usados como registros reais de desempenho.

## Publicar na Vercel

Importe o repositório na Vercel com o preset **Vite** e o diretório raiz do projeto. A configuração já está versionada em `vercel.json`:

| Opção | Valor |
| --- | --- |
| Node.js | 24.x |
| Instalação | `npm ci` |
| Build | `npm run build` |
| Diretório de saída | `dist` |
| Navegação SPA | Fallback para `/index.html` |

O fallback permite abrir e recarregar diretamente `/trilhas`, `/revisao` e `/arena`. O endereço antigo `/desafios` redireciona para a Arena.

Antes de publicar, execute os testes, o build e a checagem de deploy. Não há variáveis de ambiente obrigatórias para o frontend atual.

## Próximos passos

- Expandir o conteúdo de aulas, práticas e desafios das Trilhas.
- Implementar o motor de batalha e o fluxo educacional da Arena.
- Disponibilizar a API de conteúdo em Python/FastAPI.
- Integrar o catálogo educacional ao Supabase PostgreSQL.

## Licenças

As licenças de Pixelify Sans e Nunito Sans acompanham os arquivos em [`public/assets/fonts/`](public/assets/fonts/). A documentação de áudio está em [`docs/audio-assets.md`](docs/audio-assets.md).

O projeto ainda não define uma licença geral de distribuição.
