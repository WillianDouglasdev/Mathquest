/**
 * A agenda trabalha com dias de calendário no horário de São Paulo.
 * Guardar uma data como ano-mês-dia facilita comparar vencimentos sem depender
 * da hora em que o estudante abriu o aplicativo.
 *
 * Para somar dias, o cálculo usa uma referência ao meio-dia em UTC. O resultado
 * continua sendo uma data, sem misturar a agenda com horas de sessão ou com o
 * fuso configurado no computador de quem está estudando.
 */

export const REVIEW_TIMEZONE = 'America/Sao_Paulo'
const calendar = new Intl.DateTimeFormat('en-CA', {
  timeZone: REVIEW_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
export function reviewDay(timestamp: number): string {
  const parts = calendar.formatToParts(timestamp)
  const get = (type: string) => parts.find((part) => part.type === type)!.value
  return `${get('year')}-${get('month')}-${get('day')}`
}
export function addReviewDays(day: string, days: number): string {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}
