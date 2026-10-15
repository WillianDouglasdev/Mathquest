/**
 * A revisão salva tanto o histórico quanto um resumo de progresso. Na leitura,
 * o resumo é conferido contra o resultado de reproduzir os eventos novamente;
 * não basta confiar em contadores que vieram prontos do localStorage.
 *
 * A rodada em andamento também precisa concordar com a fila e com as respostas já
 * registradas. Esse cuidado evita que um cartão apareça como respondido na tela
 * enquanto seu evento está ausente, duplicado ou vinculado a outra apresentação.
 */

import { CONTENT_VERSION, findFlashcard, subjects } from '../../data/flashcards'
import { replayHistory, type ReviewSnapshot } from './engine'

const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)
const id = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= 128
const timestamp = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isSafeInteger(value) &&
  value >= 0 &&
  value <= Date.UTC(9999, 0, 1)

export function decodeReview(raw: string): ReviewSnapshot {
  if (raw.length > 4_000_000)
    throw new Error('Histórico de revisão muito grande.')
  const data: unknown = JSON.parse(raw)
  if (
    !object(data) ||
    data.schemaVersion !== 1 ||
    data.contentVersion !== CONTENT_VERSION ||
    !object(data.progress) ||
    !Array.isArray(data.history) ||
    data.history.length > 20_000
  )
    throw new Error('Versão ou formato de revisão inválido.')
  const progress = replayHistory(data.history)
  if (Object.keys(progress).length !== Object.keys(data.progress).length)
    throw new Error('Contadores inconsistentes.')
  for (const [cardId, expected] of Object.entries(progress)) {
    const stored = data.progress[cardId]
    if (
      !object(stored) ||
      Object.entries(expected).some(([key, value]) => stored[key] !== value)
    )
      throw new Error('Agenda incompatível com o histórico.')
  }
  if (data.round !== null) {
    const round = data.round
    if (
      !object(round) ||
      !id(round.id) ||
      !['scheduled', 'practice'].includes(String(round.mode)) ||
      !['all', ...Object.keys(subjects)].includes(String(round.subject)) ||
      !Array.isArray(round.queue) ||
      round.queue.length > 30 ||
      new Set(round.queue).size !== round.queue.length ||
      !Number.isInteger(round.position) ||
      Number(round.position) < 0 ||
      Number(round.position) > round.queue.length
    )
      throw new Error('Sessão de revisão inválida.')
    for (const cardId of round.queue) {
      const card =
        typeof cardId === 'string' ? findFlashcard(cardId) : undefined
      if (!card || (round.subject !== 'all' && card.subject !== round.subject))
        throw new Error('Cartão desconhecido na sessão.')
    }
    const queue = round.queue
    const events = data.history.filter((event) => event.roundId === round.id)
    const completed =
      Number(round.position) +
      (object(round.current) && round.current.answer !== null ? 1 : 0)
    if (
      events.length !== completed ||
      events.some(
        (event, index) =>
          event.cardId !== queue[index] || event.mode !== round.mode,
      )
    )
      throw new Error('Histórico da rodada inconsistente.')
    if (round.current === null) {
      if (round.position !== round.queue.length)
        throw new Error('Posição de revisão inválida.')
    } else {
      const current = round.current
      if (
        !object(current) ||
        !id(current.id) ||
        current.cardId !== round.queue[Number(round.position)] ||
        !timestamp(current.openedAt) ||
        typeof current.revealed !== 'boolean' ||
        ![null, 'correct', 'incorrect'].includes(current.answer as null)
      )
        throw new Error('Apresentação inválida.')
      const event = data.history.find((event) => event.id === current.id)
      if (
        current.answer === null
          ? !!event
          : !current.revealed ||
            !event ||
            event.cardId !== current.cardId ||
            event.mode !== round.mode ||
            event.outcome !== current.answer ||
            event.reviewedAt < current.openedAt
      )
        throw new Error('Apresentação incompatível com o registro.')
    }
  }
  return data as ReviewSnapshot
}
