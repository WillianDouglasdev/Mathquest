/**
 * Aqui ficam as regras de revisão, independentes da tela e do armazenamento.
 * Cada apresentação de cartão tem identidade própria. Isso permite reconhecer um
 * envio repetido mesmo se o estudante clicar duas vezes ou retomar a página.
 *
 * Revisão agendada e treino livre têm objetivos diferentes: a primeira atualiza a
 * agenda; o segundo registra a tentativa sem antecipar o vencimento. O histórico
 * guarda os dois modos, mas os contadores de espaçamento são reconstruídos apenas
 * com os eventos agendados. Não há geração de cartões ou concessão de XP.
 */

import {
  CONTENT_VERSION,
  flashcards,
  findFlashcard,
  type SubjectFilter,
} from '../../data/flashcards'
import { addReviewDays, reviewDay } from './calendar'

export type Mode = 'scheduled' | 'practice'
export type Outcome = 'correct' | 'incorrect'
export type CardProgress = {
  correct: number
  incorrect: number
  streak: number
  intervalDays: number
  dueDate: string
  lastReviewedAt: number
}
export type ReviewEvent = {
  id: string
  roundId: string
  cardId: string
  mode: Mode
  outcome: Outcome
  reviewedAt: number
}
export type Presentation = {
  id: string
  cardId: string
  openedAt: number
  revealed: boolean
  answer: Outcome | null
}
export type ReviewRound = {
  id: string
  subject: SubjectFilter
  mode: Mode
  queue: string[]
  position: number
  current: Presentation | null
}
export type ReviewSnapshot = {
  schemaVersion: 1
  contentVersion: number
  progress: Record<string, CardProgress>
  history: ReviewEvent[]
  round: ReviewRound | null
}
export type ReviewCommand =
  | {
      type: 'start'
      roundId: string
      presentationId: string
      subject: SubjectFilter
      mode: Mode
    }
  | { type: 'flip'; presentationId: string }
  | { type: 'grade'; presentationId: string; outcome: Outcome }
  | { type: 'next'; presentationId: string; nextId: string }

export const emptyReview = (): ReviewSnapshot => ({
  schemaVersion: 1,
  contentVersion: CONTENT_VERSION,
  progress: {},
  history: [],
  round: null,
})
export const correctIntervals = [3, 7, 14, 30] as const
// Um erro reinicia a sequência e volta a revisão para amanhã. Depois do quarto
// acerto seguido, o intervalo permanece em 30 dias; ele não cresce sem limite.
export function schedule(
  previous: CardProgress | undefined,
  outcome: Outcome,
  now: number,
): CardProgress {
  const correct = outcome === 'correct'
  const streak = correct ? (previous?.streak ?? 0) + 1 : 0
  const intervalDays = correct
    ? correctIntervals[Math.min(streak - 1, correctIntervals.length - 1)]
    : 1
  return {
    correct: (previous?.correct ?? 0) + Number(correct),
    incorrect: (previous?.incorrect ?? 0) + Number(!correct),
    streak,
    intervalDays,
    dueDate: addReviewDays(reviewDay(now), intervalDays),
    lastReviewedAt: now,
  }
}
export function pendingCards(
  snapshot: ReviewSnapshot,
  subject: SubjectFilter,
  now: number,
) {
  const today = reviewDay(now)
  return flashcards
    .filter(
      (card) =>
        (subject === 'all' || card.subject === subject) &&
        (!snapshot.progress[card.id] ||
          snapshot.progress[card.id].dueDate <= today),
    )
    .sort((a, b) =>
      (snapshot.progress[a.id]?.dueDate ?? today).localeCompare(
        snapshot.progress[b.id]?.dueDate ?? today,
      ),
    )
}
export function subjectSummary(
  snapshot: ReviewSnapshot,
  subject: SubjectFilter,
  now: number,
) {
  const cards = flashcards.filter(
    (card) => subject === 'all' || card.subject === subject,
  )
  const results = cards
    .map((card) => snapshot.progress[card.id])
    .filter(Boolean)
  return {
    total: cards.length,
    studied: results.length,
    pending: pendingCards(snapshot, subject, now).length,
    correct: results.reduce((sum, result) => sum + result.correct, 0),
    incorrect: results.reduce((sum, result) => sum + result.incorrect, 0),
  }
}

export function reviewTransition(
  snapshot: ReviewSnapshot,
  command: ReviewCommand,
  now: number,
): ReviewSnapshot {
  if (!Number.isSafeInteger(now) || now < 0 || now > Date.UTC(9999, 0, 1))
    throw new Error('Data do navegador inválida.')
  if (snapshot.history.length && now < snapshot.history.at(-1)!.reviewedAt)
    throw new Error(
      'O relógio está anterior ao último registro. Confira a data do dispositivo.',
    )
  const used = (id: string) =>
    !id || id.length > 128 || snapshot.history.some((event) => event.id === id)
  if (command.type === 'start') {
    if (
      used(command.presentationId) ||
      !command.roundId ||
      snapshot.history.some((event) => event.roundId === command.roundId)
    )
      return snapshot
    const cards =
      command.mode === 'scheduled'
        ? pendingCards(snapshot, command.subject, now)
        : flashcards.filter(
            (card) =>
              command.subject === 'all' || card.subject === command.subject,
          )
    const queue = cards.map((card) => card.id)
    return {
      ...snapshot,
      round: {
        id: command.roundId,
        subject: command.subject,
        mode: command.mode,
        queue,
        position: 0,
        current: queue.length
          ? {
              id: command.presentationId,
              cardId: queue[0],
              openedAt: now,
              revealed: false,
              answer: null,
            }
          : null,
      },
    }
  }
  const round = snapshot.round,
    current = round?.current
  if (!round || !current || current.id !== command.presentationId)
    return snapshot
  if (command.type === 'flip') {
    if (current.answer !== null) return snapshot
    return {
      ...snapshot,
      round: { ...round, current: { ...current, revealed: !current.revealed } },
    }
  }
  if (command.type === 'grade') {
    /*
     * A autorização para registrar mora aqui também, não só nos botões da tela.
     * O mesmo ID pode chegar de um clique repetido, de uma aba atrasada ou depois
     * de uma recarga. Uma apresentação já respondida deve ser uma operação neutra.
     */
    if (
      !current.revealed ||
      current.answer !== null ||
      used(current.id) ||
      now < current.openedAt
    )
      return snapshot
    const previous = snapshot.progress[current.cardId]
    if (
      round.mode === 'scheduled' &&
      previous &&
      previous.dueDate > reviewDay(now)
    )
      return snapshot
    const event: ReviewEvent = {
      id: current.id,
      roundId: round.id,
      cardId: current.cardId,
      mode: round.mode,
      outcome: command.outcome,
      reviewedAt: now,
    }
    return {
      ...snapshot,
      progress:
        // Treino voluntário tem evento próprio, mas não muda a agenda já marcada.
        round.mode === 'scheduled'
          ? {
              ...snapshot.progress,
              [current.cardId]: schedule(previous, command.outcome, now),
            }
          : snapshot.progress,
      history: [...snapshot.history, event],
      round: { ...round, current: { ...current, answer: command.outcome } },
    }
  }
  if (
    current.answer === null ||
    used(command.nextId) ||
    command.nextId === current.id
  )
    return snapshot
  const position = round.position + 1
  return {
    ...snapshot,
    round: {
      ...round,
      position,
      current:
        position < round.queue.length
          ? {
              id: command.nextId,
              cardId: round.queue[position],
              openedAt: now,
              revealed: false,
              answer: null,
            }
          : null,
    },
  }
}

// Reproduzir o histórico permite conferir contadores e agenda ao reabrir a página.
export function replayHistory(
  history: ReviewEvent[],
): Record<string, CardProgress> {
  const progress: Record<string, CardProgress> = {}
  const ids = new Set<string>()
  const roundCards = new Set<string>()
  let previousTime = 0
  for (const event of history) {
    if (
      typeof event.id !== 'string' ||
      !event.id ||
      typeof event.roundId !== 'string' ||
      !event.roundId ||
      event.roundId.length > 128 ||
      roundCards.has(`${event.roundId}:${event.cardId}`) ||
      event.id.length > 128 ||
      ids.has(event.id) ||
      !findFlashcard(event.cardId) ||
      !['scheduled', 'practice'].includes(event.mode) ||
      !['correct', 'incorrect'].includes(event.outcome) ||
      !Number.isSafeInteger(event.reviewedAt) ||
      event.reviewedAt < previousTime ||
      event.reviewedAt > Date.UTC(9999, 0, 1)
    )
      throw new Error('Histórico de revisão inválido.')
    ids.add(event.id)
    roundCards.add(`${event.roundId}:${event.cardId}`)
    previousTime = event.reviewedAt
    if (event.mode === 'practice') continue
    // A reconstrução considera somente revisões que podiam alterar o vencimento.
    const previous = progress[event.cardId]
    if (previous && previous.dueDate > reviewDay(event.reviewedAt))
      throw new Error('Revisão duplicada antes do vencimento.')
    progress[event.cardId] = schedule(previous, event.outcome, event.reviewedAt)
  }
  return progress
}
