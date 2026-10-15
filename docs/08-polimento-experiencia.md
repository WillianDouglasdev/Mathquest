# MathQuest — polimento de experiência

Registro histórico da primeira entrega de tipografia. A direção seguinte está implementada em [audiovisual 1.0](09-direcao-audiovisual.md), incluindo Nunito Sans também nos botões, MathML, animações, Rádio, efeitos e Modo Foco. Os estados e resultados abaixo documentam a entrega anterior.

## Entregas separadas

Flashcards e Pomodoro aprovados tecnicamente. A nova sequência anterior a FastAPI/Supabase é:

| Etapa | Estado | Critério da entrega |
| --- | --- | --- |
| 1. Tipografia | Implementada; testes e build aprovados; evidências renderizadas disponíveis para validação do usuário | Leitura, navegação e conteúdo matemático, mantendo a identidade retro |
| 2. Microanimações | Pendente, separada da etapa 1 | UI curta, cenários lentos, sem flashes, com movimento reduzido |
| 3. Música ambiente | Pendente | Player nativo; arquivos locais ou placeholder; play manual, volume e preferências persistidas; nunca iniciar som automaticamente |
| 4. Efeitos 8-bit | Pendente | Controle independente da música, volume, eventos pontuais sem repetições por hover |

Não há implementação de FastAPI ou Supabase nesta entrega. Música e efeitos ainda não foram adicionados; nenhum asset de áudio foi incorporado.

## Etapa 1 — estratégia tipográfica

Reutilizadas as duas fontes WOFF2 locais: Pixelify e Nunito. Os tokens `--font-display` e `--font-body` explicitam os papéis; `--pixel` continua compatível com os componentes existentes.

- Pixelify: marca, títulos principais curtos, botões principais, recompensas e números em destaque (timer, níveis, XP e posições).
- Nunito: navegação, títulos de cards, nomes no ranking, labels, menus, ações secundárias, explicações, perguntas e respostas matemáticas.
- Textos pequenos dos módulos revisados têm piso de 12 px; parágrafos e instruções usam pelo menos 14 px. Os textos educativos mantêm entrelinha confortável e não recebem espaçamento negativo.
- Títulos principais preservam a fonte retro, com entrelinha de 1,25 e sem comprimir letras. Títulos menores usam entrelinha de 1,35; missão usa 1,4.
- Botões permitem quebra entre palavras. Badges longos podem quebrar linha. Títulos de cards não dependem de `nowrap`.
- A trilha passa a três colunas em telas pequenas, evitando seis labels espremidos. Sidebar ganha rolagem vertical quando a altura não comporta toda a navegação. O piso de largura do body não força overflow quando a barra de rolagem ocupa parte de uma tela de 320 px.

Paleta, ilustrações, bordas, componentes React, conteúdos e funcionalidades foram preservados. Alterações de implementação limitadas a seis folhas CSS; nenhum pacote ou fonte adicionado, nenhuma consulta externa. Não foram introduzidos loops, timers ou novos efeitos nesta etapa.

## Verificação técnica

| Verificação | Resultado |
| --- | --- |
| Suíte existente completa | 69 testes aprovados em 7 arquivos |
| Build completo | TypeScript e Vite aprovados; 66 módulos; JS aproximadamente 327 kB / 104 kB gzip |
| Preservação por SHA-256 | 48 arquivos de referência; somente seis CSS alterados; 10 assets aprovados idênticos |
| Lógica e testes | Motores, stores, persistência, conteúdo, componentes TSX, testes e dependências idênticos à referência |
| Novos testes unitários | Não adicionados: esta etapa altera somente apresentação CSS; regressões funcionais cobertas pela suíte existente e inspeção renderizada |

O [relatório de preservação](reviews/typography/preservation.json) compara o estado atual com a [referência capturada antes dos ajustes](reviews/typography/baseline.json). As verificações históricas das entregas anteriores permanecem como evidência daquela fase; os CSS agora alterados são expressamente autorizados por esta etapa de tipografia.

## Conferência renderizada

O navegador integrado passou a estar disponível nesta sessão. Dashboard, sidebar/menu, ranking e Revisão e Foco foram inspecionados renderizados; há evidências em [reviews/typography](reviews/typography/). Isso atualiza a limitação técnica das entregas anteriores, sem substituir a aprovação visual do usuário.

Verificados layouts entre 320 e 1440 px, com atenção a quebras de títulos e controles. No cartão de revisão, resposta e explicação foram reveladas com Enter, sem registrar acerto/erro; a agenda não foi alterada. O menu foi aberto e fechado por teclado com Escape. Os testes existentes também verificam Tab/Enter/Espaço, diálogos, flashcards e controles do Pomodoro.

Evidências: [Dashboard desktop](reviews/typography/dashboard-desktop.jpg), [Dashboard mobile](reviews/typography/dashboard-mobile.jpg), [menu mobile](reviews/typography/menu-mobile.jpg), [revisão mobile](reviews/typography/review-mobile.jpg), [revisão desktop](reviews/typography/review-desktop.jpg).

Limites: falta a avaliação visual do usuário, conferência em dispositivos físicos e zoom de 200%. A conferência do Pomodoro observou seu modo de outra aba no controle; não foi forçada a posse da sessão nem alterado seu funcionamento para esta revisão de tipografia. Conclusão, recuperação e estatísticas continuam cobertas pelos testes existentes. Não foi realizada uma auditoria completa com leitor de tela. A regra global de movimento reduzido permanece preservada; as novas animações serão tratadas na etapa 2.
