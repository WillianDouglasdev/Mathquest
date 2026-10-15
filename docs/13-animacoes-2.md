# MathQuest — Fase de Animações 2.0

## Implementação consolidada

Antes de modificar, foram inspecionados o shell, os estilos da sidebar, `StudentAvatar`, Dashboard, controles de experiência, preferências, atlas/cenário e o README do pacote em `art/`. A maior parte do pedido já estava implementada na [entrega anterior](12-cenarios-perfil.md); essa base foi preservada.

Esta execução completou dois ajustes do pedido atual diretamente no código:

- **XP inteiramente estático:** as duas barras de XP — perfil e card de nível — agora usam uma variante CSS sem animação, sem transição e sem transformação, inclusive ao abrir a página. Números/textos permanecem estáticos. O feedback dos outros progressos aprovados não foi alterado.
- **Personagem mais destacado no notebook:** em telas com largura a partir de 701px e altura entre 761–820px, o perfil passa de aproximadamente 118px para **150px**, e o espaço do sprite de corpo inteiro passa de 72px para 104px de altura. Em telas amplas, conserva **176px** e espaço do sprite de 128px. Celulares de até 700px de largura e telas de até 760px de altura usam a versão compacta de aproximadamente 118px.

Nome Estudante, nível demonstrativo 12, barra compacta 730 / 1.000 XP e acesso ao diálogo continuam usando os dados/componentes existentes. Perfil, cenário e links permanecem no fluxo da sidebar; em telas baixas a coluna pode rolar, sem cobrir a navegação. O sprite conserva transparência e proporção com `object-fit: contain` e `image-rendering: pixelated`.

## Animações e elementos preservados

| Área | Resultado final |
| --- | --- |
| Cabeçalho | Nuvens CSS com movimento horizontal lento, ciclos de 100/130 segundos; nenhuma transformação no cenário, castelo, textos ou controles |
| Cenário inferior | Nuvens menores e discretas em ciclos de 110/140 segundos; mensagem e paisagem preservadas, sem sobreposição com links |
| Mascote verde | Idle CSS de 12 segundos com deslocamento vertical de até 2px, sem esticar o sprite |
| Estrela decorativa | Brilho suave por opacidade em ciclo de 18 segundos |
| XP do perfil e card de nível | Sem animação ou transição, desde a montagem |
| Estudante oficial | Still/idle aprovados e limite de dois estudantes animados; cabeçalho e ranking continuam estáticos |

As nuvens são camadas separadas, sem eventos de ponteiro e sem leitura por tecnologias assistivas. Não foi deslocado o cabeçalho inteiro. Quando o menu mobile fecha, suas nuvens pausam e o estudante fora da tela troca para still pelo mecanismo existente.

`prefers-reduced-motion`, a opção Animações decorativas e Modo Foco mantêm os bloqueios aprovados. Movimento desligado usa CSS estático e PNG nos personagens; nenhum WebP continua por trás do bloqueio. Modo Foco continua condicionado à sessão em andamento conforme o comportamento aprovado.

Nenhuma dependência, timer, listener, asset ou efeito sonoro foi adicionado. Os **19 efeitos 8-bit**, suas preferências, Rádio, motores/stores do Pomodoro e flashcards e regras de gamificação foram preservados. FastAPI e Supabase não foram alterados.

## Testes e build executados nesta execução

| Validação | Resultado |
| --- | --- |
| `npm test` | **116 testes aprovados em 19 arquivos**, suíte completa |
| `npm run build` | TypeScript e Vite aprovados; 84 módulos |
| Bundle JS | 349,46 kB / 111,56 kB gzip |
| CSS | 58,63 kB / 12,67 kB gzip |
| Testes existentes | Arquivos intactos; cobrem perfil por teclado, preferências persistentes, redução de movimento, Modo Foco, personagens, 19 sons, player, Pomodoro e flashcards |
| Preservação SHA-256 | Apenas quatro arquivos de aplicação alterados; todos os outros arquivos registrados foram preservados, incluindo os 16 assets publicados, fontes/prévias do pacote, dados, testes, serviços e dependências |
| Assets de produção | Idênticos aos arquivos em `public/assets/` |

Não foram criados testes que apenas reproduzem as regras de CSS. As novas dimensões e o XP estático foram verificados no build renderizado.

Verificação reproduzível de preservação, após o build:

```sh
node docs/reviews/animations-2/verify-preservation.mjs
```

## Conferência renderizada

Navegador integrado disponível; conferência feita no build de produção, em origem local de QA na porta 4178.

| Viewport | Altura medida do perfil | Resultado |
| --- | --- | --- |
| 1440×1080 | 176px | Sem overflow horizontal ou sobreposição |
| 1366×768 | 150px | Perfil maior; sidebar cabe nos 768px |
| 1024×768 | 150px | Perfil maior; sidebar cabe nos 768px |
| 768×1024 | 176px | Coluna estreita, sem sobreposição |
| 390×844 | ≈118px | Menu compacto conferido; todos os links e perfil acessíveis |
| 320×720 | ≈118px | Sem overflow horizontal; sidebar pode rolar cerca de 3px |

Também conferidos:

- Imagens carregadas, sem proporção esticada ou erros de console registrados.
- Duas barras de XP com `animation: none`, `transition-duration: 0s` e `transform: none`.
- Nuvens com transformações horizontais e paisagens com `transform: none`.
- Tab/Shift+Tab no menu circulam entre o último botão e o primeiro link; Escape fecha. Abertura e retorno de foco do perfil também permanecem cobertos pela suíte.
- Desativar animações pelo teclado deixa nuvens, slime e estrela estáticos, troca os estudantes por still e mantém a escolha após recarregar.
- Sessão real de Pomodoro na origem de QA: Modo Foco parou a decoração; navegar para o Dashboard manteve mascote e estrela sem animação; retornar e pausar preservou o tempo confirmado. Sessão de teste deixada pausada apenas nessa origem.
- Movimento reduzido do sistema e sua atualização reativa continuam cobertos pelos testes existentes. A configuração do sistema operacional não foi alterada.

Evidências: [desktop](reviews/animations-2/dashboard-desktop.png), [notebook com perfil de 150px](reviews/animations-2/dashboard-notebook.png), [sidebar mobile](reviews/animations-2/sidebar-mobile.png), [Modo Foco](reviews/animations-2/review-focus.png), [medidas](reviews/animations-2/viewports.json), [estados renderizados](reviews/animations-2/rendered.json) e [preservação](reviews/animations-2/preservation.json).

## Arquivos modificados

- `src/app/App.tsx`: variante estática da barra de XP do perfil.
- `src/app/App.module.css`: separação entre espaçamento compacto e perfil de 150px no notebook; versão mobile preservada.
- `src/features/dashboard/Dashboard.tsx`: variante estática da barra de XP do card de nível.
- `src/features/experience/motion.css`: regra reutilizável para progressos totalmente estáticos.
- `README.md`: resumo vigente da fase.
- `docs/12-cenarios-perfil.md`: indicação explícita de registro histórico.
- Este relatório e evidências/checagem em `docs/reviews/animations-2/`.

## Limitações e pendências

As bandeiras verdes do castelo fazem parte do PNG do cenário. Continuam estáticas porque não existe camada correspondente independente; a bandeira azul do atlas é um ícone diferente. Não foi substituído nem distorcido o castelo para simular movimento. Piscada do slime também depende de asset apropriado, pois olhos e coroa estão no mesmo recorte estático.

As nuvens originais incorporadas à imagem ficam paradas; as camadas CSS adicionais são as que se movem. Capturas estáticas mostram o layout, não o decorrer dos ciclos; o deslocamento das nuvens foi observado por transformações computadas em momentos distintos.

A conferência técnica renderizada está concluída. **Permanece pendente o aceite visual do usuário.** Não foram realizadas auditoria com leitor de tela, zoom de 200% ou medição em dispositivo físico de baixo desempenho. Nenhuma outra funcionalidade foi iniciada.
