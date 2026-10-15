/**
 * Este orçamento compartilhado limita os estudantes animados ao mesmo tempo.
 * Um personagem visível solicita uma vaga e a devolve ao sair de cena. A prioridade
 * favorece comemorações curtas e o corpo inteiro, sem criar um loop de frames em
 * JavaScript. Os demais componentes continuam presentes com a imagem estática.
 */

// Limite compartilhado dos WebPs do estudante, sem ciclo de quadros em JavaScript.
export class CharacterMotionSlots {
  private clients = new Map<symbol, number>()
  private granted = new Set<symbol>()
  private listeners = new Set<() => void>()
  constructor(private limit = 2) {}
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  has = (id: symbol) => this.granted.has(id)
  private publish() {
    this.granted = new Set([...this.clients].sort((a, b) => b[1] - a[1]).slice(0, this.limit).map(([id]) => id))
    this.listeners.forEach(listener => listener())
  }
  acquire(id: symbol, priority: number) {
    this.clients.set(id, priority)
    this.publish()
    return () => { this.clients.delete(id); this.publish() }
  }
}
export const characterMotionSlots = new CharacterMotionSlots(2)
