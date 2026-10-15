# MathQuest — cenários e perfil, refinamento visual v2

Registro histórico da primeira implementação. A [consolidação da Fase de Animações 2.0](13-animacoes-2.md) deixa as barras de XP totalmente estáticas e amplia o perfil intermediário para 150px em notebooks. As medidas e resultados abaixo correspondem à entrega anterior.

Entrega de 15/10/2026. Escopo: cabeçalho, paisagem inferior da sidebar, mascote/estrela do card de XP e perfil inferior. Nenhuma nova funcionalidade educacional, FastAPI ou Supabase.

## Inspeção antes das alterações

- `public/assets/landscape.png`: PNG único de 2172×724. Céu, nuvens originais, montanhas, castelo, bandeiras e paisagem estão na mesma imagem; não há bandeira do castelo em camada independente.
- `public/assets/sprites.png`: atlas RGBA de 1254×1254. O slime aprovado inclui olhos e coroa no mesmo recorte. Não existe asset de piscada nem coroa separada. A bandeira azul do atlas é outro ícone, não corresponde às bandeiras verdes do castelo.
- `public/assets/animations/characters/`: corpo inteiro oficial em still/idle já integrado, com transparência, canvas 192×280 e fallback. Reutilizado sem cópia ou alteração. PNGs originais e fontes em `art/` permanecem intactos.
- A estrela ao lado da mensagem de XP já era um elemento separado na interface; pôde receber brilho apenas com CSS.
- Já existiam o sistema global de movimento, os controles persistentes, `prefers-reduced-motion`, Modo Foco e o limite de dois estudantes animados. Foram reutilizados.

## Resultado

| Área | Alteração |
| --- | --- |
| Cabeçalho | Duas nuvens CSS em camada decorativa, com deslocamento lento de 104px, ciclos de 100/130 segundos e passos de 1px. Cenário, castelo, textos, botões e controles não recebem transformação. |
| Paisagem inferior | Mesma imagem e mensagem aprovadas; duas nuvens menores, mais transparentes, atrás da mensagem, com ciclos de 110/140 segundos. Camada sem interação ou leitura por tecnologias assistivas. |
| Mascote | Idle de 12 segundos, longos períodos em repouso e deslocamento vertical de até 2px. Removido o achatamento/esticamento do idle CSS anterior. |
| Estrela do card de XP | Brilho suave por opacidade em um ciclo de 18 segundos, sem zoom, piscada abrupta ou novo sprite. |
| XP | Mantida animação breve de entrada de 0,35 segundo e transição apenas quando o valor muda. Nenhum loop contínuo na barra. Valores/regras demo não mudaram. |
| Perfil inferior | Card de 176px com personagem oficial de corpo inteiro, nome Estudante, nível 12, indicação de perfil demo, acesso ao diálogo e 730 / 1.000 XP com barra compacta. Hover e foco visível sem mover o personagem ou a área de clique. |
| Layout compacto | Aproximadamente 118px em larguras até 700px ou alturas até 820px. Corpo inteiro menor e mesmo acesso ao perfil, nível e XP. Espaçamentos se ajustam também abaixo de 1150px. |

O perfil permanece no fluxo flex/grid da sidebar, depois do cenário, sem posicionamento absoluto sobre os links. A navegação não encolhe sobre o conteúdo. A sidebar pode rolar em telas muito baixas; em 320×720 foram medidos 723px de conteúdo, sem sobreposição nem overflow horizontal.

Usados `StudentAvatar`, `ProgressBar`, `Arrow`, dados demonstrativos e fontes/tokens existentes. A imagem usa `object-fit: contain` e `image-rendering: pixelated`; o avatar do ranking e o retrato do cabeçalho continuam estáticos. A barra de XP fica fora do botão de perfil, preservando sua semântica acessível independente.

## Movimento, foco e recursos

O controle Animações decorativas e a preferência do sistema removem as animações CSS. O personagem troca para o PNG correspondente pelo mecanismo existente, pois CSS sozinho não pausaria um WebP. Ativar Modo Foco durante uma sessão bloqueia os efeitos ambientais também ao navegar para o Dashboard, sem alterar tempo ou progresso. A política específica da página Revisão e Foco foi preservada.

As nuvens adicionais da sidebar ficam pausadas quando o menu mobile está fechado. O observador existente mantém o estudante estático fora da tela, com a aba oculta ou em conteúdo inerte. O limite compartilhado de dois personagens animados permanece ativo.

Nenhuma dependência, timer ou listener JavaScript novo foi adicionado. As nuvens e o slime usam somente transformações; o brilho usa opacidade. Não há animação do fundo inteiro, filtro de blur animado ou `will-change` aplicado indiscriminadamente. Sons, Rádio, motores/stores do Pomodoro e dos flashcards, persistência e gamificação não foram modificados.

## Testes e build

| Verificação | Resultado |
| --- | --- |
| Suíte completa `npm test` | **116 testes aprovados em 19 arquivos** |
| Teste novo | Perfil: XP coerente com os dados demo, barra acessível, abertura por Enter e restauração de foco após Escape |
| Teste adaptado | Formato da sidebar passa de retrato para corpo inteiro; os asserts de cabeçalho, Dashboard e ranking permanecem |
| Cobertura existente preservada | Movimento reduzido, preferência persistente, Modo Foco, teto/offscreen dos personagens, sons, navegação, player, motores e persistência educacional |
| Build final `npm run build` | TypeScript e Vite aprovados; 84 módulos |
| Tamanhos de produção | JS 349,39 kB / 111,53 kB gzip; CSS 58,26 kB / 12,61 kB gzip |
| Preservação SHA-256 | 16 arquivos em `public/assets/`, 25 arquivos de fontes/prévias e 61 outros arquivos da aplicação preservados; dependências intactas |
| Assets do build | Idênticos aos arquivos de `public/assets/`; nenhum asset novo ou substituído |

A suíte completa passou após a alteração estrutural e o teste novo. Os ajustes posteriores foram somente CSS de dimensões/espaçamento; cada um foi validado no build e no navegador. Não foram removidos testes aprovados.

Reprodução da checagem de preservação, depois do build:

```sh
node docs/reviews/visual-refinement-v2/verify-preservation.mjs
```

## Conferência renderizada

Prévia local do build de produção, em origem de QA na porta 4177:

| Viewport | Perfil | Resultado |
| --- | --- | --- |
| 1440×1080 | 176px | Sem overflow horizontal ou sobreposição |
| 1024×900 | 176px | Sidebar cabe nos 900px; cenário e mensagem preservados |
| 1024×768 | ≈118px | Versão compacta; sem sobreposição |
| 768×1024 | 176px | Coluna estreita, sem overflow horizontal |
| 390×844 | ≈118px | Menu aberto conferido visualmente; todos os links e perfil acessíveis |
| 320×720 | ≈118px | Sem overflow horizontal; pequena rolagem vertical na sidebar |

Verificações observadas:

- Imagens carregadas, proporção preservada e zero erros de console registrados.
- Dois estudantes idle no Dashboard; cabeçalho e ranking estáticos.
- Cenário/header com `transform: none`; apenas as nuvens apresentam deslocamento. Nenhuma barra tem repetição infinita.
- Desativação por teclado resulta em nuvens, mascote e estrela sem animação, e personagens em still. Escolha permaneceu após recarregar.
- Enter no novo perfil abre o diálogo; Escape devolve o foco. No menu mobile, Tab/Shift+Tab circulam entre o último botão e o primeiro link; Escape fecha e devolve o foco ao botão do menu.
- Com o menu mobile fechado, nuvens da sidebar pausadas e estudante estático.
- Sessão real iniciada na origem de QA: Modo Foco parou nuvens/personagens; navegar para Dashboard manteve mascote/estrela estáticos. Retornar e pausar preservou o tempo confirmado. A sessão de teste ficou pausada nessa origem; nenhum armazenamento de outra porta foi alterado.
- `prefers-reduced-motion` segue coberto pelos testes existentes de mudança da preferência e pelos bloqueios globais CSS. Não foi necessário alterar a preferência do sistema operacional.

Evidências: [Dashboard](reviews/visual-refinement-v2/dashboard-desktop.png), [tablet](reviews/visual-refinement-v2/dashboard-tablet.png), [tela baixa](reviews/visual-refinement-v2/dashboard-short-screen.png), [menu mobile](reviews/visual-refinement-v2/sidebar-mobile.png), [Modo Foco ativo](reviews/visual-refinement-v2/review-focus-active.png), [medidas por viewport](reviews/visual-refinement-v2/viewports.json), [estilos/estado renderizados](reviews/visual-refinement-v2/rendered-state.json) e [preservação](reviews/visual-refinement-v2/preservation.json).

## Arquivos modificados

- `src/app/App.tsx`: camada ambiental da sidebar e composição acessível do perfil com corpo inteiro/XP.
- `src/app/App.module.css`: perfil, hover/foco, espaçamentos e responsividade da sidebar.
- `src/features/experience/motion.css`: nuvens reutilizáveis, idle vertical e brilho lento; bloqueios globais preservados.
- `src/features/dashboard/Dashboard.tsx`: aplicação da classe de brilho à estrela já existente.
- `src/test/dashboard.test.tsx`: expectativa do formato e teste de perfil/teclado.
- `README.md`, este relatório e evidências em `docs/reviews/visual-refinement-v2/`.

## Limitações e próxima validação

As bandeiras do castelo continuam estáticas: animá-las isoladamente exigiria um asset em camada separada ou extração/redesenho da imagem, fora do escopo de preservar o pacote aprovado. Não foi aplicada distorção ao castelo inteiro. O slime não ganhou piscada porque não existe arquivo adequado; o movimento vertical e o brilho na estrela atendem ao refinamento sem desenhar olhos sobre o sprite.

As nuvens originais dentro do cenário permanecem estáticas; as novas camadas decorativas são as que se movem. Capturas estáticas não demonstram a passagem do tempo; ciclos foram conferidos pelo estado renderizado e transformações computadas. Não houve medição em hardware físico de baixo desempenho, auditoria com leitor de tela ou zoom de 200% nesta entrega.

A conferência renderizada técnica foi feita. **A aprovação visual do usuário permanece pendente**, incluindo a avaliação dos personagens na aplicação. Não avançar para backend nesta entrega.
