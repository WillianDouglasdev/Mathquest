/**
 * As estatísticas partem dos trechos de tempo realmente confirmados, não apenas
 * da diferença entre início e fim de uma sessão. Uma pausa não deve aparecer como
 * minutos estudados no gráfico.
 *
 * O calendário usa o horário de São Paulo. Quando um trecho atravessa a meia-noite,
 * ele é repartido entre os dias; a conclusão ou interrupção pertence ao dia do
 * encerramento. A semana apresentada vai de segunda a domingo.
 */

import type { Session, Snapshot } from './engine'

export const FOCUS_TIMEZONE = 'America/Sao_Paulo'
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: FOCUS_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
export function dateKey(timestamp: number): string {
  const parts = formatter.formatToParts(timestamp)
  const get = (type: string) => parts.find((part) => part.type === type)!.value
  return `${get('year')}-${get('month')}-${get('day')}`
}
export function addDays(key: string, days: number) {
  const date = new Date(`${key}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}
export function allSessions(snapshot: Snapshot): Session[] {
  // Uma sessão encerrada pode estar no histórico e ainda ser a sessão atual.
  // A chave por ID impede que o resumo conte os mesmos minutos duas vezes.
  const sessions = new Map(
    snapshot.history.map((session) => [session.id, session]),
  )
  if (snapshot.current) sessions.set(snapshot.current.id, snapshot.current)
  return [...sessions.values()].sort((a, b) => b.startedAt - a.startedAt)
}
export function statistics(snapshot: Snapshot, now: number) {
  const today = dateKey(now)
  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay()
  const monday = addDays(today, -(weekday === 0 ? 6 : weekday - 1))
  const days = Array.from({ length: 7 }, (_, index) => ({
    date: addDays(monday, index),
    milliseconds: 0,
    completed: 0,
    interrupted: 0,
  }))
  const buckets = new Map<
    string,
    { milliseconds: number; completed: number; interrupted: number }
  >()
  const bucket = (key: string) => {
    if (!buckets.has(key))
      buckets.set(key, { milliseconds: 0, completed: 0, interrupted: 0 })
    return buckets.get(key)!
  }
  for (const session of allSessions(snapshot)) {
    for (const segment of session.segments) {
      let cursor = segment.start
      while (cursor < segment.end) {
        const key = dateKey(cursor)
        let end = segment.end
        if (dateKey(end - 1) !== key) {
          /*
           * O limite do dia é procurado pelo próprio calendário, em vez de somar
           * um número fixo de horas. Assim, o agrupamento respeita o fuso escolhido
           * e reparte o mesmo trecho com precisão entre os dias envolvidos.
           */
          let low = cursor,
            high = end
          while (high - low > 1) {
            const middle = Math.floor((low + high) / 2)
            if (dateKey(middle) === key) low = middle
            else high = middle
          }
          end = high
        }
        bucket(key).milliseconds += end - cursor
        cursor = end
      }
    }
    if (session.endedAt !== null) {
      const result = bucket(dateKey(session.endedAt))
      if (session.status === 'completed') result.completed++
      else if (session.status === 'interrupted') result.interrupted++
    }
  }
  for (const day of days) Object.assign(day, buckets.get(day.date))
  return {
    today: {
      date: today,
      ...(buckets.get(today) ?? {
        milliseconds: 0,
        completed: 0,
        interrupted: 0,
      }),
    },
    days,
    week: days.reduce(
      (total, day) => ({
        milliseconds: total.milliseconds + day.milliseconds,
        completed: total.completed + day.completed,
        interrupted: total.interrupted + day.interrupted,
      }),
      { milliseconds: 0, completed: 0, interrupted: 0 },
    ),
  }
}
