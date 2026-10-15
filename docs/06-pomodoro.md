# Revisão e Foco — entrega 1: Pomodoro

Entrega técnica concluída em 15/10/2026: motor, persistência, estatísticas e interface do Pomodoro. Flashcards predefinidos permanecem na entrega 2, separada, conforme solicitado. Nenhum asset existente foi regenerado. A conferência visual renderizada continua pendente.

## Pendência registrada antes do início

A integração dos três formatos do personagem foi aprovada **tecnicamente** pelo usuário. Ainda é necessário validar visualmente os personagens na aplicação renderizada, em especial sidebar e ranking nos tamanhos pequenos. Não alterar os personagens para tentar resolver uma pendência de conferência visual. Preservar arquivos aprovados, mascote, cenários, componentes e design system.

## Critérios desta entrega

- Motor TypeScript independente de React/DOM/storage e testes em Node.
- Sessões 15/25/50, iniciar/pausar/retomar/finalizar/reiniciar.
- Intervalos medem tempo, não contam callbacks; atrasos normais não causam deriva.
- Lacunas grandes, alteração do relógio e reabertura recuperam pausado sem crédito automático da ausência.
- Checkpoints e persistência versionada, tratamento de falha/corrupção, transições idempotentes.
- Histórico distingue concluídas e interrompidas; estatísticas reais diárias/semanais.
- Rota `/revisao`, acesso rápido na Home, tomate PNG novo e controles acessíveis.
- Nenhum XP ou alteração do progresso demonstrativo.
- Testes, build e preservação dos assets registrados ao encerrar.

## Implementação e comportamento

`src/domain/focus/engine.ts` contém estados e transições puros; `persistence.ts` valida snapshots e `statistics.ts` deriva as estatísticas. O domínio não importa React, não lê relógio global, não agenda timers e não acessa DOM/storage. Os testes desses módulos executam em ambiente Node. `FocusStore` recebe portas de relógio/armazenamento; `FocusProvider` conecta essas portas e o ciclo de vida do navegador ao React, acima das rotas.

- Duração inicial 25 minutos; seleção de 15/25/50 antes de iniciar. Não trocar a duração de uma sessão em execução/pausa.
- Iniciar cria ID único; pausar confirma o último intervalo; retomar exclui a pausa; finalizar antes da meta registra uma interrupção.
- Atingir a meta registra uma conclusão uma única vez, limitada à duração escolhida, mesmo que o callback chegue atrasado. O fim é marcado no instante em que a meta foi atingida, não na chegada tardia do callback.
- Reiniciar preserva o tempo anterior como sessão interrompida, prepara a duração inteira e aguarda novo início. Uma sessão já concluída mantém sua conclusão.
- Não há XP, níveis, bônus ou alteração de fixtures por usar o Pomodoro.

O navegador fornece `performance.now()` para medir deltas e `Date.now()` para o calendário e detecção de alterações anômalas. O callback de um segundo só solicita uma amostra: não representa um segundo de estudo. Uma amostra com 4,7 segundos reais acrescenta 4,7 segundos. O motor conserva milissegundos e arredonda apenas a apresentação.

A política conservadora pausa sem creditar o intervalo se a lacuna entre amostras exceder **15 segundos**, se o relógio regredir ou se o tempo civil divergir mais de 2 segundos do monotônico. Isso evita atribuir suspensão/horas ausentes a estudo, incluindo diferenças entre plataformas ao suspender. Uma aba em segundo plano continua enquanto as amostras chegam dentro desse limite; throttling agressivo também pode causar pausa. Não se trata de medição de atenção.

Fundamentação das APIs: relógio monotônico e diferenças durante suspensão em [MDN — performance.now](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now); exclusão mútua entre abas em [MDN — Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API).

## Persistência e múltiplas abas

Chave `mathquest.focus.v1` em localStorage, com `schemaVersion: 1`, duração selecionada, sessão corrente, intervalos confirmados e histórico. A âncora monotônica é apenas de runtime e nunca reutilizada após reload. Checkpoints são escritos a cada amostra válida de execução, normalmente a cada segundo, e em cada transição. `pagehide` tenta confirmar/pausar antes de liberar o controle.

Uma sessão recuperada do estado running volta **pausada**, mantendo apenas o último tempo salvo; nenhum delta até a reabertura é acrescentado. Fechamento abrupto pode perder o intervalo desde o último checkpoint — normalmente até um segundo, podendo ser maior sob throttling — mas não credita ausência. Navegação interna mantém o provider e a mesma sessão.

Web Locks permite apenas uma aba escritora por origem. As demais leem/sincronizam o histórico, bloqueiam os comandos e oferecem assumir o controle depois de liberar a outra aba. Ao assumir, o estado running persistido é recuperado pausado. Não há fallback de escrita concorrente: sem Web Locks/conexão apropriada, a página informa a limitação e fica em leitura. Executar pelo Vite/localhost ou HTTPS, não abrindo `index.html` diretamente no sistema de arquivos.

Dados inválidos/versão incompatível não são sobrescritos silenciosamente. Falhas de leitura bloqueiam início e oferecem tentar recuperar. Quota/permissão de escrita pausa a contagem, conserva dados em memória e oferece tentar salvar; o aviso orienta a não fechar antes disso. A validação limita tamanho/quantidade do histórico sem apagar registros automaticamente. Nenhuma importação/exportação foi incluída nesta etapa.

## Estatísticas e interface

Tempo diário/semanal é calculado a partir dos intervalos confirmados de sessões em andamento, pausadas, concluídas ou interrompidas, sem duplicar a sessão corrente já arquivada. Os intervalos são divididos na meia-noite de `America/Sao_Paulo`; a semana começa segunda e termina domingo. Conclusões/interrupções contam na data de encerramento. O calendário atualiza também com o timer parado. Não há comparações percentuais ou histórico fictício.

A rota `/revisao` reutiliza shell, estudante aprovado, mascote, cards, botões, badges, progresso, fontes e tokens. A Home mantém os seis cards e ganha um atalho compacto para `/revisao#pomodoro`, mostrando a sessão atual ao navegar. O novo tomate é um PNG independente em `public/assets/focus/tomato.png`, 1297×1213, com transparência, gerado pela ferramenta integrada Imagegen; o visor e seus números são HTML. [Prompt exato e origem](pomodoro-asset.json).

Responsividade implementada por grid de 12 colunas, empilhamento até 1050px, ajustes a 700px e controles/tomate empilhados a 480px. Revisão de código considerou 320px: durações flexíveis, botões que quebram linha, histórico com wrap e imagens proporcionais. Alvos têm pelo menos 44px; legendas, estado pressionado, foco visível e mensagens `aria-live` acompanham os controles. O visor não anuncia cada segundo como alerta. Os estados podem ser operados com Tab/Enter/Espaço; a base continua respeitando redução de movimento.

## Resultados registrados

| Verificação | Resultado |
| --- | --- |
| `npm test` | **36 testes aprovados em 4 arquivos**: 16 domínio/estatísticas, 7 store, 5 interface de foco e 8 regressões do Dashboard |
| `npm run build` | **Aprovado**, TypeScript/Vite, 58 módulos, JS ~305 kB / ~98 kB gzip |
| Durações e precisão | Testes 15/25/50, callback atrasado cruzando a meta, pausa/retomada e ausência de deriva por contagem de callbacks |
| Persistência | Checkpoint, reabertura pausada, ausência de um dia, leitura negada, corrupção, quota, retry e liberação da aba |
| Calendário | Virada domingo/segunda, ano novo, minutos distribuídos entre dias, contagens únicas e atualização em repouso |
| Interface/teclado | Iniciar, pausar, retomar, finalizar e reiniciar; seleção acessível; conclusão e histórico reais; atalho sem reiniciar a sessão; XP permanece igual |
| HTTP do build | 200 em `/`, `/revisao`, `/revisao#pomodoro`, novo tomate e personagem |
| Assets preservados | Hashes do cenário, atlas/mascote, fontes e três PNGs do estudante inalterados; cópias do estudante idênticas no build |
| Novo PNG | Canal RGBA; canto com alpha 0 conferido com System.Drawing |

A correção final de tipagem removeu uma opção não suportada das consultas de teste; as mesmas consultas já haviam passado funcionalmente. O build final passou depois desse ajuste. Não há dependências novas.

## Limite de verificação e entrega seguinte

O inventário de superfícies retornou `apps: []` e `browsers: []` nesta sessão. Não foi possível capturar screenshots nem verificar responsividade em navegador real; testes DOM e revisão de CSS **não substituem essa conferência**. A pendência visual dos personagens permanece registrada e seus arquivos foram preservados.

Roteiro local: `npm run dev`, acessar `/revisao`; conferir tomate/visor e personagens em 1440×1080, 1024×768, 768×1024, 390×844 e 320×720, zoom 200%, teclado e redução de movimento. Iniciar, trocar de rota pelo Dashboard, retornar pelo atalho, pausar/recarregar/retomar, finalizar e reiniciar; abrir outra aba para confirmar o bloqueio. Testar histórico vazio e o fim de uma sessão. O servidor temporário usado para o teste HTTP foi encerrado após a verificação.

Esta entrega encerra a etapa do Pomodoro. A próxima entrega será de flashcards predefinidos locais, mantendo motor e persistência separados e sem misturar os dois resultados.
