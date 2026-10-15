# MathQuest — primeira entrega

> Atualização de 15/10/2026: a base visual foi aprovada pelo usuário, com ressalva ao personagem. O [plano de continuidade](04-plano-de-continuidade.md) foi aprovado com ajustes: apresentar três formatos do personagem e aguardar validação antes de integrar; manter o motor do Pomodoro independente de React; entregar flashcards predefinidos locais junto da página Revisão e Foco, antes da API/banco. O código continua sendo o da primeira entrega.

> Estado posterior: o usuário aprovou os três formatos e autorizou sua integração, agora concluída em código com testes/build aprovados. Ver [relatório da integração e limites de validação](05-integracao-personagem.md). Revisão e Foco permanece para a próxima entrega.

## 1. Leitura das referências e arquitetura

As seis imagens fornecidas definem a direção: RPG educativo em pixel art, sidebar azul-marinho, céu azul e castelo, superfícies claras, contornos azul-acinzentados em degraus, verdes luminosos para progresso e amarelo para recompensas. O Dashboard de referência organiza trilha/nível, sequência/missão e desafio/ranking em três linhas. A adaptação preservará essa hierarquia com espaçamento legível, sem transformar texto em imagem.

Frontend em React + TypeScript + Vite, navegação com React Router e CSS Modules. CSS Modules permite encapsular os componentes e desenhar contornos retrô com tokens compartilhados sem dependência de um framework visual. O repositório contém apenas o frontend neste momento. Na continuidade, Python/FastAPI/Pydantic será responsável pela API de conteúdo, validação de respostas, lógica dos desafios e cálculo de pontuação; Supabase PostgreSQL armazenará conteúdo predefinido. Progresso individual e Pomodoro permanecerão locais, sem login.

Camadas: `app` (router e composição), `components` (primitivas e shell), `features/dashboard` (cards e dados demonstrativos), `data` (contratos e fixtures), `styles` (tokens e estilos globais), `public/assets` (arquivos reutilizáveis), `docs` (decisões e validação). Regras futuras ficam fora de componentes de apresentação.

## 2. Design system

| Token | Valor / uso |
| --- | --- |
| Navy | #102350, títulos e contornos fortes |
| Sidebar | #17457e, navegação persistente |
| Primary | #176bd6, ações secundárias de estudo |
| Green | #80d65a, ação principal e progresso |
| Green text | #235b2d, texto sobre fundos verdes |
| Surface | #ffffff / #f5f9ff |
| Border | #bed3e6, contornos de cards |
| Muted | #596e8d, conteúdo secundário |
| Gold | #ffcf4c, recompensa e destaque |
| Espaçamento | 4, 8, 12, 16, 24, 32, 40px |
| Tipografia | Pixel nos títulos (Pixelify Sans), Nunito Sans no corpo; fontes locais com fallback system-ui |
| Interação | Foco visível, alvos de pelo menos 44px, feedback textual e movimento reduzido |

Primitivas implementadas: PixelArt, Button, Card, ProgressBar, Badge, Dialog. AppShell contém sidebar e cabeçalho. Cards têm bordas de 2px e cantos em degraus, sombras discretas e interiores espaçosos. Barras de progresso têm segmentos visuais e valor acessível. Animações serão decorativas e desativadas por `prefers-reduced-motion`.

## 3. Inventário de assets

| Asset | Aplicação | Estado inicial |
| --- | --- | --- |
| landscape.png | Céu, castelo, montanhas, árvores; cabeçalho e cards | Entregue e aprovado; preservar |
| sprites.png | Atlas transparente: estudante, slime coroado, livro, troféu, casa, estrela, gráfico, revisão, alvo, fogo, bandeira, cadeado, sino, escudo, moeda, montanha | Entregue; preservar mascote e ícones. Estudante não aprovado, substituir em arquivos próprios |
| fontes WOFF2 | Títulos e texto legível | Entregues localmente; preservar |
| student-v2-full.png / student-v2-portrait.png | Personagem padrão em corpo inteiro e retrato | Planejados; cabelo castanho, mochila, roupa azul/verde, fidelidade à UX original |
| Tomate/relógio pixel art | Pomodoro funcional em Revisão e Foco | Planejado; números e controles em HTML |
| Cena exclusiva de comparação de frações | Card do próximo desafio | Pendente para fase de conteúdo; usar recorte do cenário e números HTML, identificado no inventário |
| Mago, loja e animações por estado | Página de desafio/estudo | Pendentes, fora da primeira entrega |

Não usar emojis nem desenhar personagens complexos em CSS. Falhas de carregamento terão placeholder textual identificado. Assets gerados são propostas para validação visual, não arquivos originais extraídos das imagens anexadas.

## 4. Componentes e rotas

`AppShell → Sidebar + Header + Outlet`. `Dashboard → Welcome + TrailCard + LevelCard + StreakCard + MissionCard + ChallengeCard + RankingCard`. Os cards usam primitivas compartilhadas. Busca filtra atalhos do próprio Dashboard, perfil e notificações abrem diálogos; ranking completo e conquistas mostram fixtures identificadas. Botões de estudo explicam que a funcionalidade pertence à próxima fase.

| Rota | Primeira entrega | Fase posterior |
| --- | --- | --- |
| `/` | Dashboard completo com fixtures | Acesso rápido ao Pomodoro, depois progresso real local; preservar os seis cards |
| `/trilhas` | Aviso de próxima fase no shell | Seis módulos sequenciais |
| `/trilhas/:modulo/:licao` | Aviso de próxima fase no shell | Lições e exercícios |
| `/desafios` | Aviso de próxima fase no shell | Banco de 15 desafios e rotação mensal |
| `/revisao` | Aviso de próxima fase no shell | Revisão e Foco: Pomodoro completo, histórico e flashcards locais na mesma entrega funcional; API/banco depois |
| `*` | Página não encontrada com retorno ao início | Igual |

## 5. Modelo de dados planejado

Conteúdo Supabase: `Module(id, slug, title, order)`, `Lesson(id, moduleId, slug, objective, explanation, examples, videoUrl, order)`, `Question(id, lessonId?, challengeId?, type, prompt, choices?, explanation)`, `Answer(questionId, correctChoice?, numericValue?, tolerance?)`, `Challenge(id, title, context, difficulty, hint, xp, cycleOrder)`, `Flashcard(id, moduleId, front, back)`. Estes são contratos conceituais; o modelo relacional e seus vínculos serão definidos nas migrações. Gabaritos serão consultados pelo backend para correção e não publicados nas respostas de conteúdo. Nenhuma chave administrativa será exposta no frontend.

Progresso local versionado: `DemoProfile`, `LessonProgress`, `AwardLedger(activityId, awardedAt, xp)`, `ReviewState(cardId, dueAt, intervalDays, successes, failures)` e `Achievement(id, earnedAt)`. O modelo inicial de Pomodoro foi ampliado no plano de continuidade para sessões, intervalos ativos e checkpoints; tempo diário/semanal será derivado do histórico em segundos, sem contadores independentes. Eventos únicos evitam XP duplicado no fluxo normal. O calendário inicial será `America/Sao_Paulo`, com semana de segunda a domingo; sequência de sete dias concede escudo e bônus com início e expiração explícitos. Importação valida versão, tipos e limites antes de substituir dados. Nada disso é apresentado como implementado nesta fase.

API futura FastAPI/Pydantic: conteúdo, validação de respostas obrigatoriamente em Python, seleção/lógica dos desafios e cálculo de XP. React consumirá a API, sem acessar diretamente gabaritos ou credenciais do Supabase. Banco com grants/RLS e escrita apenas por processo administrativo; credencial de servidor com privilégios mínimos. Perfil sem login e progresso apenas no navegador, com exportação/importação futura. O ledger local impede duplicações no fluxo normal, sem garantir integridade competitiva de dados editáveis no cliente.

## 6. Fases iniciais — ordem substituída

A lista abaixo registra o plano da primeira entrega. O usuário priorizou o Pomodoro antes da ampliação de conteúdo; a sequência vigente, com entregas e testes, está em [plano de continuidade, seção 5](04-plano-de-continuidade.md#5-entregas-pequenas-e-verificáveis).

1. Fundação visual e Dashboard demonstrativo; tipografia, assets, componentes, responsividade e comparação visual. **Entregue; base visual aprovada pelo usuário, personagem a revisar.**
2. Após validação visual: seis módulos, conteúdo correto, exercícios e correção numérica brasileira; progresso local, exportação/importação e testes de correção.
3. Quinze desafios, rotação mensal e ledger de XP; testes de pontuação, repetição, virada do mês e nível.
4. Flashcards e revisão espaçada; Pomodoro persistente 15/25/50; testes de agendamento, pausa e recuperação.
5. Sequência, escudo, bônus temporário e conquistas; testes de datas, limites e acessibilidade, FastAPI/Supabase integrados com RLS.

## 7. Critérios de aceitação da primeira página

- [ ] Sidebar azul, navegação com pixel art e item ativo verde.
- [ ] Céu/castelo, estudante e slime coroado coerentes com as referências.
- [ ] Seis cards com trilha, XP/nível, sequência, missão, desafio e ranking.
- [ ] Perfil e ranking claramente demonstrativos; valores coerentes entre cards.
- [ ] Componentes compartilhados, React/TS/Vite/Router, CSS Modules.
- [ ] Nenhum botão sem resposta; rotas futuras explicitamente identificadas.
- [ ] Desktop e mobile sem overflow horizontal, foco/teclado e movimento reduzido.
- [ ] Build e testes pertinentes aprovados; comparação visual documentada antes de avançar.
- [ ] Assets presentes no projeto; pendências registradas.

O usuário aprovou a direção visual e solicitou este planejamento antes de novas funcionalidades. Os critérios acima preservam a lista original de revisão técnica; o estado atual e as ressalvas estão em [validação](03-validacao.md). A implementação seguinte seguirá o plano de continuidade.
