/**
 * A formatação fica separada da contagem para que exibir minutos não altere o
 * tempo confirmado. O cronômetro arredonda para cima ao mostrar os segundos:
 * uma fração de segundo restante ainda aparece como tempo a cumprir, não como
 * uma conclusão antecipada.
 */

export const formatMinutes = (milliseconds: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(
    milliseconds / 60_000,
  )
export function formatTimer(milliseconds: number) {
  const seconds = Math.ceil(milliseconds / 1000)
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}
