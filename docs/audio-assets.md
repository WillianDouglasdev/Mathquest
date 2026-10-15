# Assets e síntese de áudio

## Música

Nenhum arquivo musical foi adicionado. `src/data/music.ts` é um catálogo vazio. A Rádio informa o estado vazio e não tenta reproduzir faixas fictícias. Instruções e campos de licença/atribuição: `public/audio/README.md`.

## Efeitos 8-bit originais

Não há arquivos baixados ou amostras de terceiros. Os **19 efeitos** são sequências mínimas originais de frequências, descritas em `src/services/experience/SoundService.ts`, sintetizadas por osciladores triangulares com envelope curto em `BrowserSynth.ts`, usando Web Audio nativo. Origem: código deste projeto; autoria: implementação MathQuest; atribuição externa: nenhuma. Nenhuma licença de música de terceiros é reivindicada para estes sons. A distribuição do código/sons segue a licença que o titular atribuir ao próprio projeto. O catálogo original de sete foi ampliado conforme [sons em destaque](10-sons-em-destaque.md).

| Evento | Duração aproximada |
| --- | --- |
| Clique principal | 45 ms |
| Virada de cartão | 95 ms |
| Acerto | 175 ms |
| Erro | 195 ms |
| Pomodoro concluído | 380 ms |
| Conquista | 300 ms |
| Sequência | 195 ms |

Efeitos ativados por padrão em perfis novos, a 20%, respeitando a preferência desligada já salva. Habilitação e volume são independentes da música. Preferência habilitada ao reabrir não emite som. O contexto de áudio é criado apenas após interação; conclusão do timer só usa áudio previamente ativado por uma interação nesta sessão. Sem sons de hover ou de montagem de componentes. Um novo efeito substitui as vozes anteriores; há intervalo mínimo de 120 ms entre disparos e deduplicação de IDs de confirmação. Falha de áudio não bloqueia o estudo. As novas doze variações duram aproximadamente 45–280 ms e abrangem navegação, painéis, missão, controles de foco e revisão.

Conquista/sequence têm eventos disponíveis no serviço, sem dispará-los para dados ilustrativos do Dashboard. Não foram criadas recompensas nem regras de gamificação. Serão conectados a eventos reais quando a plataforma tiver essas funcionalidades.
