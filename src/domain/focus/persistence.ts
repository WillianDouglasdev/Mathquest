/**
 * Os dados do navegador passam por validação antes de voltar ao motor.
 * Um JSON válido ainda pode conter duração impossível, IDs repetidos ou um total
 * de tempo diferente da soma dos trechos registrados.
 *
 * A leitura rejeita essas inconsistências em vez de apagar silenciosamente o
 * histórico. A interface pode então informar o problema e permitir recuperação,
 * preservando o dado original para uma tentativa posterior.
 */

import { durations, type Session, type Snapshot } from './engine'

const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)
const number = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
function validSession(value: unknown): value is Session {
  if (
    !object(value) ||
    typeof value.id !== 'string' ||
    !value.id ||
    value.id.length > 128 ||
    !durations.includes(value.minutes as 15) ||
    !['running', 'paused', 'completed', 'interrupted'].includes(
      String(value.status),
    ) ||
    !number(value.startedAt) ||
    !number(value.elapsedMs) ||
    value.elapsedMs > Number(value.minutes) * 60_000 ||
    !Array.isArray(value.segments) ||
    value.segments.length > 20_000
  )
    return false
  let sum = 0,
    last = value.startedAt
  for (const segment of value.segments) {
    if (
      !object(segment) ||
      !number(segment.start) ||
      !number(segment.end) ||
      segment.start < last ||
      segment.end <= segment.start
    )
      return false
    last = segment.end
    sum += segment.end - segment.start
  }
  if (Math.abs(sum - value.elapsedMs) > 2) return false
  if (value.status === 'completed')
    return (
      value.elapsedMs === Number(value.minutes) * 60_000 &&
      number(value.endedAt) &&
      value.endedAt >= last &&
      value.reason === 'goal'
    )
  if (value.status === 'interrupted')
    return (
      number(value.endedAt) &&
      value.endedAt >= last &&
      value.elapsedMs < Number(value.minutes) * 60_000 &&
      ['manual', 'restart'].includes(String(value.reason))
    )
  return (
    value.elapsedMs < Number(value.minutes) * 60_000 &&
    value.endedAt === null &&
    value.reason === null
  )
}

export function decodeSnapshot(raw: string): Snapshot {
  if (raw.length > 4_000_000)
    throw new Error('Histórico grande demais para leitura segura.')
  const value: unknown = JSON.parse(raw)
  if (
    !object(value) ||
    value.schemaVersion !== 1 ||
    !durations.includes(value.minutes as 15) ||
    !Array.isArray(value.history) ||
    value.history.length > 10_000 ||
    !value.history.every(validSession) ||
    value.history.some(
      (item) => !['completed', 'interrupted'].includes(item.status),
    ) ||
    new Set(value.history.map((item) => item.id)).size !==
      value.history.length ||
    (value.current !== null && !validSession(value.current))
  )
    throw new Error('Progresso local inválido ou de versão incompatível.')
  const current = value.current as Session | null
  if (current) {
    if (current.minutes !== value.minutes)
      throw new Error('Duração inconsistente.')
    const archived = value.history.find((item) => item.id === current.id)
    if (
      ['running', 'paused'].includes(current.status)
        ? !!archived
        : !archived || JSON.stringify(archived) !== JSON.stringify(current)
    )
      throw new Error('Histórico inconsistente.')
  }
  return value as Snapshot
}
