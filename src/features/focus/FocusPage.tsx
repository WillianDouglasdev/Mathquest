/**
 * Esta tela apresenta o estado do Pomodoro e encaminha ações ao store.
 * Durações, tempo aceito e encerramento continuam no motor; a interface não
 * recalcula essas regras com um contador próprio.
 *
 * A mesma página reúne revisão e histórico, mas os dois registros são separados.
 * Uma resposta de flashcard não altera a sessão de foco, e concluir o cronômetro
 * não concede XP. Mensagens de falha ou de outra aba no controle ficam explícitas.
 */

import { useState } from 'react'
import { Badge, Button, Card, PixelArt, ProgressBar } from '../../components/ui'
import { StudentAvatar } from '../../components/StudentAvatar'
import { durations, isActive, remainingMs } from '../../domain/focus/engine'
import {
  allSessions,
  statistics,
  FOCUS_TIMEZONE,
} from '../../domain/focus/statistics'
import { useFocus } from './FocusProvider'
import { formatMinutes, formatTimer } from './format'
import styles from './FocusPage.module.css'
import { FlashcardSection } from '../review/FlashcardSection'

const civilDate = (key: string) => key.slice(8) + '/' + key.slice(5, 7)
const dateTime = (timestamp: number) =>
  new Intl.DateTimeFormat('pt-BR', {
    timeZone: FOCUS_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
export function FocusPage() {
  const { state, control, error, nowMs, dispatch, retry, requestControl } =
    useFocus()
  const [showAll, setShowAll] = useState(false)
  const current = state.current
  const status = current?.status ?? 'idle'
  const enabled = control === 'owner' && !error
  const stats = statistics(state, nowMs)
  const history = allSessions(state)
  const visibleHistory = showAll ? history : history.slice(0, 5)
  const peak = Math.max(60_000, ...stats.days.map((day) => day.milliseconds))
  const start = () => dispatch({ type: 'start', id: crypto.randomUUID() })
  const [imageFailed, setImageFailed] = useState(false)
  return (
    <>
      <div className={styles.heading}>
        <StudentAvatar variant="full" size={88} motion="idle" focusSensitive />
        <div>
          <div className={styles.eyebrow}>UM PASSO DE CADA VEZ</div>
          <h1>Revisão e Foco</h1>
          <p>
            Reserve um tempo para aprender. Sua próxima conquista começa aqui.
          </p>
        </div>
        <Badge>Progresso local real</Badge>
      </div>
      {error && (
        <div className={styles.alert} role="alert">
          <p>{error}</p>
          <Button
            variant="quiet"
            onClick={retry}
            disabled={control !== 'owner'}
          >
            Tentar recuperar e salvar
          </Button>
        </div>
      )}
      {control !== 'owner' && (
        <div className={styles.controlNotice} role="status">
          <p>
            {control === 'waiting'
              ? 'Preparando seu espaço de foco…'
              : control === 'unsupported'
                ? 'Este navegador não permite controlar o cronômetro com segurança entre abas. Use um navegador atualizado e abra a aplicação por uma conexão segura ou local.'
                : 'Outra aba está no controle. O histórico é sincronizado; feche a outra aba para continuar aqui.'}
          </p>
          {control === 'observer' && (
            <Button variant="quiet" onClick={requestControl}>
              Assumir controle nesta aba
            </Button>
          )}
        </div>
      )}
      <div className={styles.grid}>
        <Card
          id="pomodoro"
          label="Pomodoro de estudos"
          className={styles.timerCard}
        >
          <div className={styles.cardHeading}>
            <h2>
              <img src="/assets/focus/tomato.png" alt="" />
              Pomodoro de estudos
            </h2>
            <Badge gold>Sem XP automático</Badge>
          </div>
          <p className={styles.description}>
            Escolha um tempo, prepare seu material e faça uma coisa por vez.
          </p>
          <div className={styles.timerBody}>
            <div className={`${styles.tomato} mq-tomato`} data-state={status}>
              {!imageFailed ? (
                <img
                  src="/assets/focus/tomato.png"
                  alt=""
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <span className={styles.artPending}>
                  Ilustração de tomate indisponível
                </span>
              )}
              <div className={styles.timerDisplay}>
                <span className="srOnly">Tempo restante</span>
                <time
                  aria-label={`Tempo restante: ${formatTimer(remainingMs(state))}`}
                >
                  {formatTimer(remainingMs(state))}
                </time>
              </div>
            </div>
            <div className={styles.settings}>
              <fieldset disabled={!enabled || isActive(current)}>
                <legend>Duração da sessão</legend>
                <div className={styles.durations}>
                  {durations.map((minutes) => (
                    <button
                      key={minutes}
                      aria-label={`${minutes} minutos`}
                      aria-pressed={state.minutes === minutes}
                      data-ui-sound="select"
                      onClick={() => dispatch({ type: 'select', minutes })}
                    >
                      <strong>{minutes}</strong>
                      <span>min</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className={styles.tip}>
                <PixelArt name="book" size={33} />
                <p>
                  <strong>Prepare sua aventura</strong>
                  <br />
                  Um caderno, uma questão e um pouco de foco. Você consegue!
                </p>
              </div>
              <div className={styles.stateLabel}>
                {
                  {
                    idle: 'Pronto para começar',
                    running: 'Foco em andamento',
                    paused: 'Sessão em pausa',
                    completed: 'Meta concluída!',
                    interrupted: 'Sessão interrompida',
                  }[status]
                }
              </div>
            </div>
          </div>
          <div className={styles.controls}>
            <Button
              sound={status === 'paused' ? 'resume' : 'start'}
              onClick={
                status === 'paused' ? () => dispatch({ type: 'resume' }) : start
              }
              disabled={!enabled || status === 'running'}
            >
              {status === 'paused' ? 'Retomar sessão' : 'Iniciar sessão'}
            </Button>
            <Button
              variant="quiet"
              sound="pause"
              onClick={() => dispatch({ type: 'pause' })}
              disabled={!enabled || status !== 'running'}
            >
              Pausar
            </Button>
            <Button
              variant="blue"
              sound="finish"
              onClick={() => dispatch({ type: 'finish' })}
              disabled={!enabled || !isActive(current)}
            >
              Finalizar
            </Button>
          </div>
          <div className={styles.progressRow}>
            <ProgressBar
              label="Tempo confirmado da sessão"
              value={
                ((current?.elapsedMs ?? 0) / (state.minutes * 60_000)) * 100
              }
            />
            <span>{formatMinutes(current?.elapsedMs ?? 0)} min ativos</span>
          </div>
          <div className={styles.timerFooter}>
            <p>
              Reiniciar salva a sessão atual como interrompida e prepara o tempo
              inteiro.
            </p>
            <button
              onClick={() => dispatch({ type: 'reset' })}
              data-ui-sound="reset"
              disabled={!enabled || !current}
            >
              Reiniciar
            </button>
          </div>
          <p className={styles.live} role="status" aria-live="polite">
            {state.notice ||
              'Seu tempo é salvo apenas durante a execução. Sem pressa para começar.'}
          </p>
        </Card>
        <Card label="Minha semana de foco" className={styles.weekCard}>
          <div className={styles.cardHeading}>
            <h2>
              <PixelArt name="chart" size={33} />
              Minha semana
            </h2>
            <span>
              {civilDate(stats.days[0].date)} — {civilDate(stats.days[6].date)}
            </span>
          </div>
          {error ? (
            <p className={styles.description}>
              As estatísticas podem não estar completas enquanto o armazenamento
              estiver indisponível.
            </p>
          ) : null}
          <div className={styles.metrics}>
            <div>
              <strong>
                {formatMinutes(stats.week.milliseconds)} <small>min</small>
              </strong>
              <span>estudados nesta semana</span>
            </div>
            <div>
              <strong>{stats.week.completed}</strong>
              <span>sessões concluídas</span>
            </div>
          </div>
          <div
            className={styles.chart}
            role="img"
            aria-label={stats.days
              .map(
                (day, index) =>
                  `${['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][index]}: ${formatMinutes(day.milliseconds)} minutos, ${day.completed} sessões concluídas`,
              )
              .join('; ')}
          >
            {stats.days.map((day, index) => (
              <div key={day.date}>
                <span>{formatMinutes(day.milliseconds)}</span>
                <div className={styles.barTrack}>
                  <i
                    style={{ height: `${(day.milliseconds / peak) * 100}%` }}
                  />
                </div>
                <span>
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][index]}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.today}>
            <span>Hoje</span>
            <strong>{formatMinutes(stats.today.milliseconds)} min</strong>
            <span>
              {stats.today.completed} concluídas · {stats.today.interrupted}{' '}
              interrompidas
            </span>
          </div>
          <p className={styles.calendar}>
            Segunda a domingo · horário de São Paulo
          </p>
        </Card>
        <FlashcardSection />
        <Card label="Seu histórico de foco" className={styles.history}>
          <div className={styles.cardHeading}>
            <h2>
              <PixelArt name="book" size={33} />
              Seu histórico de foco
            </h2>
            <Badge>Salvo neste navegador</Badge>
          </div>
          {!history.length ? (
            <div className={styles.empty}>
              <PixelArt name="flag" size={55} />
              <h3>Sua primeira sessão está logo ali.</h3>
              <p>Quando você estudar, seu tempo confirmado aparecerá aqui.</p>
            </div>
          ) : (
            <>
              <ul className={styles.sessionList}>
                {visibleHistory.map((session) => (
                  <li key={session.id}>
                    <span>
                      <strong>{session.minutes} min de foco</strong>
                      <small>{dateTime(session.startedAt)}</small>
                    </span>
                    <span>{formatMinutes(session.elapsedMs)} min ativos</span>
                    <Badge gold={session.status === 'interrupted'}>
                      {
                        {
                          running: 'Em andamento',
                          paused: 'Em pausa',
                          completed: 'Concluída',
                          interrupted: 'Interrompida',
                        }[session.status]
                      }
                    </Badge>
                  </li>
                ))}
              </ul>
              {history.length > 5 && (
                <Button variant="quiet" onClick={() => setShowAll(!showAll)}>
                  {showAll ? 'Mostrar recentes' : 'Ver todo o histórico'}
                </Button>
              )}
            </>
          )}
        </Card>
        <Card label="Seu ritmo de estudo" className={styles.encouragement}>
          <div className={styles.cardHeading}>
            <h2>
              <PixelArt name="slime" size={36} />
              Pequenos passos
            </h2>
          </div>
          <div>
            <PixelArt name="slime" size={90} />
            <p>
              <strong>
                {status === 'completed'
                  ? 'Mais uma conquista no seu caminho!'
                  : 'Consistência começa com um primeiro passo.'}
              </strong>
              <br />
              Faça uma pausa quando precisar. Finalizar antes da meta também
              registra seu esforço.
            </p>
          </div>
          <p>
            O Pomodoro registra foco, sem conceder XP. Você também pode revisar
            matemática com os flashcards, no seu ritmo.
          </p>
        </Card>
      </div>
      <p className={styles.privacy}>
        Ao reabrir, a sessão volta pausada no último checkpoint. Tempo com a
        aplicação fechada não é contado.
      </p>
    </>
  )
}
