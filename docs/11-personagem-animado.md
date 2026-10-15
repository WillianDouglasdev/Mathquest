# MathQuest — pacote do personagem animado v1

## Inspeção antes da integração

O frontend React/Vite está na **raiz**, com `src/`, `public/` e `package.json`; não existe pasta `frontend/`. O destino equivalente ao indicado no README do pacote é, portanto, **`public/assets/animations/characters/`**. Não foi criada uma segunda estrutura de frontend.

Lido `art/README.md`, que identifica o pacote como derivado dos três PNGs aprovados, sem redesenho. Foram comparados visualmente corpo, retrato e avatar com `public/assets/characters/student-v2-{full,navigation,ranking}.png`: cabelo, rosto, mochila, roupa e paleta correspondem à identidade oficial. As versões compactas têm dimensões e hashes diferentes dos PNGs originais, como esperado; não foi alegada identidade binária entre exportações de tamanhos diferentes.

Inventário real:

| Pasta | Conteúdo |
| --- | --- |
| `art/characters/` | 6 WebPs animados (idle/celebrate em 3 formatos) e 3 PNGs estáticos |
| `art/previews/` | 3 GIFs de prévia idle |
| `characters/` | 9 duplicatas binariamente idênticas de `art/characters/` |
| `previews/` | 3 duplicatas binariamente idênticas de `art/previews/` |

O [inventário](reviews/character-animations/inventory.json) registra SHA-256, dimensões, formato, transparência, número de quadros, duração e 12 grupos de duplicatas. Fontes canônicas são as de `art/`; pastas duplicadas preexistentes foram preservadas, sem novas referências da aplicação a elas. O README e todos os arquivos de entrada permanecem intactos.

| Formato | Dimensões | Idle | Celebrate |
| --- | --- | --- | --- |
| Corpo inteiro | 192×280 | 5 quadros / 2 s | 10 quadros / 1 s |
| Retrato | 192×192 | 5 quadros / 2 s | 10 quadros / 1 s |
| Avatar | 96×96 | 5 quadros / 2 s | 10 quadros / 1 s |

Os WebPs são animados de fato, com transparência em todos os quadros e loop infinito no arquivo. Idle contém 3 quadros visuais únicos distribuídos nas 5 etapas; celebrate contém 10. Os GIFs são prévias e não são publicados na aplicação.

## Organização sem substituição dos originais

Publicados seis arquivos, copiados byte a byte de `art/characters/`:

- `student-full-still.png`, `student-full-idle.webp`, `student-full-celebrate.webp`.
- `student-portrait-still.png`, `student-portrait-idle.webp`.
- `student-avatar-still.png`.

Não foram publicados avatar animado, retrato celebrate ou GIFs, pois não há uso atual. Os três PNGs originais aprovados continuam intactos em `public/assets/characters/` e servem de fallback adicional. Os estáticos compactos do pacote mantêm o mesmo canvas das animações, evitando mudança de enquadramento ao pausar. Total publicado: **523.821 bytes**, sem preload de todos os WebPs.

## Integrações atuais

| Contexto | Resultado |
| --- | --- |
| Dashboard | Corpo inteiro em idle, enquanto visível e movimento permitido |
| Sidebar | Retrato idle discreto; fora da tela ou em navegação oculta fica estático |
| Cabeçalho e diálogo de perfil | Estáticos, para evitar animações extras |
| Ranking | Avatar estático de 96×96, inclusive os cinco participantes |
| Revisão e Foco | Corpo/retrato só podem usar idle se a opção Modo Foco estiver desligada |
| Sessão em andamento com Modo Foco | Personagens estáticos também ao navegar para Dashboard |

`StudentAvatar` centraliza seleção de arquivo, dimensões e fallback, preservando os tamanhos de uso e o CSS existente: `object-fit: contain`, proporção intrínseca, transparência e `image-rendering: pixelated`.

Movimento reduzido do sistema e controle Animações decorativas trocam o **arquivo** por PNG; somente desativar CSS não pausaria um WebP. `IntersectionObserver` exige pelo menos 15% do elemento na tela. Aba oculta e conteúdo inerte também usam estático. Sem suporte ao observer ou sem provider de experiência, o comportamento conservador é estático.

Há limite compartilhado de **dois estudantes animados**, priorizando uma comemoração sobre idle. Ranking e cabeçalho não disputam posições. Não há intervalos JavaScript para animar quadros; observers/listeners são desconectados no unmount. Falha de WebP usa still; falha do still tenta o PNG original; falha de todas as fontes evita manter um ícone de imagem quebrada.

## Comemorações: componente pronto, conexão funcional pendente

Missões e desafios da aplicação **ainda são demonstrativos**: `/desafios` aponta para uma página de próxima fase, e os botões do Dashboard abrem prévias. Não existem eventos reais de conclusão de missão ou correção de desafio a conectar nesta entrega. Não foram criadas essas funcionalidades, nem houve comemoração ao abrir uma prévia, ao carregar ou por dados demo.

O componente recebe um evento confirmado por propriedade:

```tsx
<StudentAvatar
  variant="full"
  motion="idle"
  celebration={confirmedEvent}
/>
// confirmedEvent: { id: ID estável da confirmação, type: 'mission-completed' | 'challenge-correct' }
```

Essa propriedade deve mudar **após** a confirmação real no fluxo existente/futuro, sem fabricar IDs durante renderização. Um evento presente na montagem é tratado como restaurado e não toca. Novo ID permite celebrate por uma janela de 1 s; repetição é ignorada. Evento com movimento bloqueado/fora de tela é descartado sem reprodução posterior. Sair da tela, desativar movimento ou desmontar cancela o timeout.

Isso prepara e testa a integração visual das duas comemorações solicitadas, mas **o disparo real em missão/desafio permanece pendente**, pois depende de fluxos ainda inexistentes. Não foi substituído por acerto de flashcard nem conclusão do Pomodoro.

## Validação

| Verificação | Resultado |
| --- | --- |
| Suíte completa | **115 testes aprovados em 19 arquivos** |
| Novos testes | 11 de integração do personagem e 2 de limite/prioridade de animação |
| Teste existente adaptado | Um teste do Dashboard atualizou URLs/dimensões para as exportações compactas; cenários e asserts funcionais mantidos |
| Build completo | TypeScript/Vite aprovados; 84 módulos; JS 348,48 kB / 111,20 kB gzip |
| Assets/build | Seis cópias idênticas à fonte e ao build; seis URLs HTTP 200 |
| Preservação | Todos os PNGs aprovados, demais assets, fontes de entrada, motores, stores de progresso, dados e dependências preservados |

Testes exercitam teto simultâneo, prioridade, offscreen, aba oculta, conteúdo inerte, movimento reduzido reativo, configuração local, Modo Foco, ID restaurado/repetido, novos tipos de confirmação, cancelamento, limpeza de observers/timers e fallback de imagens.

Conferência no build renderizado: Dashboard com idle de corpo/retrato; cabeçalho e cinco rankings estáticos, todos carregados; controle de decoração desativado resultou em zero estudantes animados; abrir prévia de missão não iniciou celebrate; Revisão com modo ligado ficou estática e com opção desligada permitiu idle. Navegar por teclado para controles de flashcard deixou o estudante fora da tela em PNG. Verificado layout mobile de 390×844, sem overflow horizontal detectado. A avaliação visual do usuário permanece pendente.

Evidências: [Dashboard](reviews/character-animations/dashboard-desktop.jpg), [foco ligado](reviews/character-animations/review-focus-on.jpg), [foco desligado](reviews/character-animations/review-focus-off.jpg), [mobile](reviews/character-animations/review-mobile.jpg). [Preservação](reviews/character-animations/preservation.json), reproduzível com `node docs/reviews/character-animations/verify-preservation.mjs`; [URLs verificadas](reviews/character-animations/http.json).

## Arquivos e limites

Alterados: `StudentAvatar.tsx`, `ExperienceProvider.tsx`, composições em `Dashboard.tsx`, `App.tsx` e `FocusPage.tsx`, um teste de apresentação do Dashboard. Novos: `useCharacterVisibility.ts`, `CharacterMotionSlots.ts` e testes, seis assets runtime, inventário e relatório. Nenhum token, CSS do avatar, mascote verde, cenário ou sprite original foi modificado.

Limites: comemorações sem fonte real de eventos ainda não disparam na aplicação; testes usam eventos confirmados injetados no componente. WebP não oferece pausa/reset granular de frames: a reprodução é limitada por janela temporal e retorna ao PNG/idle, sem garantia de sincronismo exato sob atraso de rede ou da thread principal. Sem suporte a WebP/observer usa-se estático. Dispositivos físicos, zoom 200% e auditoria com leitor de tela não foram realizados. Nenhuma funcionalidade educacional nova, FastAPI ou Supabase foi implementada.
