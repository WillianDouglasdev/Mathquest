/**
 * A tela de revisão conecta o baralho, o store e os controles de estudo.
 * Ela permite tentar lembrar antes de revelar e só habilita Acertei/Errei depois
 * que a resposta apareceu. O domínio repete essa proteção, pois desabilitar um
 * botão sozinho não garante a integridade dos dados.
 *
 * Sons e mudança de cartão acompanham uma gravação confirmada. Se houver falha
 * ou disputa entre abas, a interface mantém a apresentação e informa o problema,
 * em vez de dar um feedback de sucesso que o histórico ainda não reconhece.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Badge, Button, Card, PixelArt, ProgressBar } from '../../components/ui'
import {
  flashcards,
  findFlashcard,
  subjects,
  type SubjectFilter,
} from '../../data/flashcards'
import { pendingCards, subjectSummary } from '../../domain/review/engine'
import { reviewDay } from '../../domain/review/calendar'
import {
  ReviewStore,
  REVIEW_STORAGE_KEY,
} from '../../services/review/ReviewStore'
import { browserReviewStore } from '../../services/review/browserReviewStore'
import styles from './FlashcardSection.module.css'
import { MathText } from '../../components/MathText'
import { useSounds } from '../experience/SoundProvider'

const readableDay = (day: string) =>
  `${day.slice(8)}/${day.slice(5, 7)}/${day.slice(0, 4)}`
export function FlashcardSection({
  providedStore,
}: {
  providedStore?: ReviewStore
}) {
  const [store] = useState(() => providedStore ?? browserReviewStore())
  const view = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const { snapshot, nowMs, busy, loaded, readOnly, error } = view
  const [subject, setSubject] = useState<SubjectFilter>('all')
  const [showPending, setShowPending] = useState(false)
  const face = useRef<HTMLDivElement>(null)
  const playSound = useSounds()
  useEffect(() => {
    store.load()
    setSubject(store.getSnapshot().snapshot.round?.subject ?? 'all')
    const storage = (event: StorageEvent) => {
      if (event.key === REVIEW_STORAGE_KEY || event.key === null) store.load()
    }
    const visibility = () => {
      if (document.visibilityState === 'visible') store.load()
    }
    const interval = window.setInterval(store.tick, 1000)
    window.addEventListener('storage', storage)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('storage', storage)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [store])
  const round = snapshot.round,
    current = round?.current
  const card = current ? findFlashcard(current.cardId) : undefined
  const summary = subjectSummary(snapshot, subject, nowMs)
  const enabled = loaded && !busy && !error && !readOnly
  const answered = current?.answer !== null && current?.answer !== undefined
  const progress = card ? snapshot.progress[card.id] : undefined
  const upcoming = flashcards
    .filter((card) => snapshot.progress[card.id]?.dueDate > reviewDay(nowMs))
    .sort((a, b) =>
      snapshot.progress[a.id].dueDate.localeCompare(
        snapshot.progress[b.id].dueDate,
      ),
    )
  const done = round ? round.position + Number(answered) : 0
  const pending = pendingCards(snapshot, 'all', nowMs)
  const next = async () => {
    if (current) {
      await store.next(current.id)
      const after = store.getSnapshot().snapshot.round
      if (after && after.current?.id !== current.id) {
        playSound(after.position >= after.queue.length ? 'reviewComplete' : 'next', { id: `next-${current.id}` })
      }
      face.current?.focus()
    }
  }
  const grade = async (outcome: 'correct' | 'incorrect') => {
    if (!current) return
    const before = store.getSnapshot().snapshot.history.length
    await store.grade(current.id, outcome)
    const after = store.getSnapshot().snapshot
    // Feedback de acerto/erro acompanha o evento realmente registrado. Um clique
    // recusado por duplicação ou falha de armazenamento não merece som de sucesso.
    if (after.history.length > before && after.history.some(event => event.id === current.id && event.outcome === outcome)) {
      playSound(outcome, { id: `review-${current.id}` })
    }
  }
  const flip = async () => {
    if (!current) return
    await store.flip(current.id)
    const after = store.getSnapshot().snapshot.round?.current
    if (after?.id === current.id && after.revealed !== current.revealed) playSound('flip')
  }
  return (
    <>
      <Card
        id="flashcards"
        label="Flashcards de revisão"
        className={styles.review}
      >
        <div className={styles.heading}>
          <h2>
            <PixelArt name="cards" size={34} />
            Flashcards de revisão
          </h2>
          <Badge>30 cartões predefinidos</Badge>
        </div>
        <p className={styles.description}>
          Tente lembrar antes de virar. Cada descoberta fortalece sua base.
        </p>
        {error && (
          <div role="alert" className={styles.alert}>
            <p>{error}</p>
            <Button variant="quiet" onClick={store.load} disabled={busy}>
              Recarregar progresso
            </Button>
          </div>
        )}
        {readOnly && (
          <p role="status" className={styles.alert}>
            Este navegador não disponibilizou o controle seguro de gravação
            entre abas. A revisão está em leitura; use um navegador atualizado
            em conexão segura ou local para registrar.
          </p>
        )}
        <div className={styles.toolbar}>
          <div>
            <label htmlFor="review-subject">Assunto</label>
            <select
              id="review-subject"
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value as SubjectFilter)
              }
              disabled={busy}
            >
              <option value="all">Todos os assuntos</option>
              {Object.entries(subjects).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="blue"
            disabled={!enabled || !summary.pending}
            onClick={() => void store.start(subject, 'scheduled')}
          >
            Revisar pendentes ({summary.pending})
          </Button>
          <Button
            variant="quiet"
            disabled={!enabled}
            onClick={() => void store.start(subject, 'practice')}
          >
            Treinar sem alterar agenda
          </Button>
        </div>
        {card && current && round ? (
          <>
            <div className={styles.roundInfo}>
              <Badge>{subjects[card.subject]}</Badge>
              <span>
                {round.position + 1} / {round.queue.length}
              </span>
              <span>
                {round.mode === 'practice'
                  ? 'Treino livre · agenda preservada'
                  : 'Revisão agendada'}
              </span>
            </div>
            <div
              ref={face}
              tabIndex={-1}
              role="group"
              className={styles.flashcard}
              aria-label={`Cartão ${card.id}`}
            >
              <div
                key={`${current.id}-${current.revealed}`}
                className={styles.face}
              >
                <span className={styles.sideLabel}>
                  {current.revealed ? 'RESPOSTA' : 'LEMBRE SEM OLHAR'}
                </span>
                {current.revealed ? (
                  <>
                    <h3><MathText text={card.answer} /></h3>
                    <p><MathText text={card.explanation} /></p>
                  </>
                ) : (
                  <h3><MathText text={card.question} /></h3>
                )}
              </div>
            </div>
            <Button
              variant="quiet"
              className={styles.flip}
              onClick={() => void flip()}
              disabled={!enabled || answered}
            >
              {current.revealed
                ? 'Ver pergunta'
                : 'Virar cartão e revelar resposta'}
            </Button>
            <div className={styles.actions}>
              <Button
                variant="quiet"
                disabled={!enabled || !current.revealed || answered}
                sound={false}
                onClick={() => void grade('incorrect')}
              >
                Errei
              </Button>
              <Button
                disabled={!enabled || !current.revealed || answered}
                sound={false}
                onClick={() => void grade('correct')}
              >
                Acertei
              </Button>
            </div>
            {!current.revealed && (
              <p className={styles.help}>
                Revele a resposta para registrar como foi sua lembrança.
              </p>
            )}
            {answered && (
              <div className={styles.feedback}>
                <p>
                  <strong>
                    {current.answer === 'correct'
                      ? 'Boa lembrança!'
                      : 'Cada tentativa também ensina.'}
                  </strong>{' '}
                  {round.mode === 'practice'
                    ? 'Treino registrado. A data e o intervalo da revisão agendada não mudaram.'
                    : progress
                      ? `Próxima revisão em ${progress.intervalDays} ${progress.intervalDays === 1 ? 'dia' : 'dias'}: ${readableDay(progress.dueDate)}.`
                      : 'Agenda salva no navegador.'}
                </p>
                <Button
                  variant="blue"
                  sound={false}
                  onClick={() => void next()}
                  disabled={!enabled}
                >
                  {round.position + 1 === round.queue.length
                    ? 'Concluir revisão'
                    : 'Próximo cartão'}
                </Button>
              </div>
            )}
            <div className={styles.roundProgress}>
              <ProgressBar
                label="Progresso desta rodada de flashcards"
                value={(done / round.queue.length) * 100}
              />
              <span>
                {done} de {round.queue.length} respondidos
              </span>
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <PixelArt name={round ? 'star' : 'book'} size={65} />
            <h3>
              {!loaded
                ? 'Preparando seus cartões…'
                : round
                  ? 'Rodada concluída!'
                  : summary.pending
                    ? 'Sua próxima descoberta está aqui.'
                    : 'Tudo em dia por aqui!'}
            </h3>
            <p>
              {round
                ? `${round.position} cartões nesta rodada. Escolha um assunto para continuar ou faça um treino livre.`
                : summary.pending
                  ? `${summary.pending} cartões novos ou vencidos esperam por você. Escolha “Revisar pendentes” para começar.`
                  : 'Você pode treinar antes do vencimento sem mudar a agenda.'}
            </p>
          </div>
        )}
        <p className={styles.notice} role="status" aria-live="polite">
          {view.notice}
        </p>
        <p className={styles.help}>
          Agenda por dia, no horário de São Paulo. Treino livre e flashcards não
          concedem XP.
        </p>
      </Card>
      <Card label="Progresso e próximas revisões" className={styles.summary}>
        <div className={styles.heading}>
          <h2>
            <PixelArt name="chart" size={33} />
            Seu mapa de revisão
          </h2>
        </div>
        <div className={styles.total}>
          <strong>
            {error || !loaded
              ? '—'
              : subjectSummary(snapshot, 'all', nowMs).pending}
          </strong>
          <span>cartões novos ou vencidos</span>
        </div>
        <ul className={styles.subjects}>
          {Object.entries(subjects).map(([id, name]) => {
            const status = subjectSummary(snapshot, id as SubjectFilter, nowMs)
            return (
              <li key={id}>
                <div>
                  <strong>{name}</strong>
                  <span>
                    {status.studied} / {status.total} estudados
                  </span>
                </div>
                <ProgressBar
                  label={`Cartões estudados: ${name}`}
                  value={(status.studied / status.total) * 100}
                />
                <p>
                  {status.pending} pendentes · {status.correct} acertos ·{' '}
                  {status.incorrect} erros
                </p>
              </li>
            )
          })}
        </ul>
        <p className={styles.help}>
          “Estudados” indica cartões com ao menos uma revisão agendada. Treinos
          livres ficam separados no histórico.
        </p>
        <h3 className={styles.upcomingTitle}>Pendentes de agora</h3>
        {pending.length ? (
          <>
            <ul
              className={styles.pending}
              tabIndex={0}
              aria-label="Cartões pendentes"
            >
              {pending
                .slice(0, showPending ? pending.length : 3)
                .map((card) => (
                  <li key={card.id}>
                    {card.question}
                    <small>
                      {subjects[card.subject]} ·{' '}
                      {snapshot.progress[card.id]
                        ? `Revisão desde ${readableDay(snapshot.progress[card.id].dueDate)}`
                        : 'Cartão novo'}
                    </small>
                  </li>
                ))}
            </ul>
            {pending.length > 3 && (
              <Button
                variant="quiet"
                className={styles.expand}
                onClick={() => setShowPending(!showPending)}
              >
                {showPending
                  ? 'Mostrar menos pendentes'
                  : `Ver os ${pending.length} pendentes`}
              </Button>
            )}
          </>
        ) : (
          <p className={styles.description}>
            Nenhum cartão pendente. Você pode fazer um treino livre.
          </p>
        )}
        <h3 className={styles.upcomingTitle}>Próximas revisões</h3>
        {upcoming.length ? (
          <ul className={styles.upcoming}>
            {upcoming.slice(0, 3).map((card) => (
              <li key={card.id}>
                <span>
                  <strong>{card.id}</strong> · {subjects[card.subject]}
                </span>
                <span>{readableDay(snapshot.progress[card.id].dueDate)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.description}>
            As próximas datas aparecem depois das suas respostas.
          </p>
        )}
        <p className={styles.help}>
          {snapshot.history.filter((event) => event.mode === 'practice').length}{' '}
          respostas de treino livre ·{' '}
          {
            snapshot.history.filter((event) => event.mode === 'scheduled')
              .length
          }{' '}
          respostas agendadas salvas
        </p>
      </Card>
    </>
  )
}
