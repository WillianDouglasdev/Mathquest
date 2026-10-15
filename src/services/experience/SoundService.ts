/**
 * Os efeitos 8-bit são sequências curtas de notas definidas localmente.
 * Este serviço concentra volume, silêncio, Modo Foco e proteção contra excesso;
 * cada componente não precisa abrir seu próprio contexto de áudio.
 *
 * Há duas proteções com finalidades distintas: o pequeno intervalo entre sons
 * evita sobreposição em ações rápidas, enquanto o ID evita repetir o mesmo evento
 * de conclusão. Carregar uma página ou passar o cursor não é motivo para tocar.
 */

export type SoundEvent = 'primary' | 'correct' | 'incorrect' | 'pomodoro' | 'achievement' | 'streak' | 'flip'
  | 'navigate' | 'open' | 'close' | 'mission' | 'select' | 'start' | 'pause' | 'resume' | 'finish' | 'reset' | 'next' | 'reviewComplete'
export type Note = readonly [frequency: number, duration: number]
// Original minimal cues, in seconds. No samples or external sound service.
export const cues: Record<SoundEvent, readonly Note[]> = {
  primary: [[440, .035]], flip: [[330, .035], [440, .035]],
  correct: [[523.25, .06], [659.25, .09]], incorrect: [[220, .07], [196, .1]],
  pomodoro: [[523.25, .09], [659.25, .09], [783.99, .16]],
  achievement: [[659.25, .07], [783.99, .07], [1046.5, .12]],
  streak: [[392, .07], [523.25, .1]],
  navigate: [[392, .03], [523.25, .04]],
  open: [[330, .035], [493.88, .05]], close: [[493.88, .03], [330, .035]],
  mission: [[392, .045], [523.25, .045], [659.25, .08]],
  select: [[587.33, .035]], start: [[392, .04], [523.25, .06]],
  pause: [[392, .04], [293.66, .06]], resume: [[293.66, .04], [392, .065]],
  finish: [[392, .045], [261.63, .08]], reset: [[349.23, .035], [261.63, .04]],
  next: [[440, .03], [587.33, .04]],
  reviewComplete: [[523.25, .055], [659.25, .055], [880, .13]],
}
export const soundLabels: Record<SoundEvent, string> = {
  primary: 'Clique principal', navigate: 'Navegar pelo mapa', open: 'Abrir painel', close: 'Fechar painel',
  mission: 'Abrir missão', select: 'Escolher duração', start: 'Iniciar foco', pause: 'Pausar foco',
  resume: 'Retomar foco', finish: 'Finalizar sessão', reset: 'Reiniciar sessão',
  flip: 'Virar cartão', correct: 'Resposta correta', incorrect: 'Resposta errada',
  next: 'Próximo cartão', reviewComplete: 'Concluir revisão', pomodoro: 'Concluir Pomodoro',
  achievement: 'Conquista (prévia)', streak: 'Sequência de estudos (prévia)',
}
export const isSoundEvent = (value: string | null): value is SoundEvent => value !== null && Object.hasOwn(cues, value)
export type SynthPort = { play(notes: readonly Note[], volume: number): Promise<void>; stop(): void; dispose(): void }
export class SoundService {
  private enabled = false
  private volume = .2
  private suppressed = false
  private armed = false
  private last = -Infinity
  private ids = new Set<string>()
  private synth?: SynthPort
  private view = { error: '' }
  private generation = 0
  private listeners = new Set<() => void>()
  constructor(private createSynth: () => SynthPort, private now = () => performance.now()) {}
  getSnapshot = () => this.view
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn) } }
  private error(message: string) { this.view = { error: message }; this.listeners.forEach(fn => fn()) }
  configure(enabled: boolean, volume: number, suppressed = false) {
    if (!enabled || suppressed || volume !== this.volume) { this.generation++; this.synth?.stop() }
    if (!enabled) this.armed = false
    this.enabled = enabled
    this.volume = Math.max(0, Math.min(1, Number.isFinite(volume) ? volume : 0))
    this.suppressed = suppressed
  }
  play = (event: SoundEvent, options: { userInitiated?: boolean; id?: string } = {}) => {
    // Primeiro vem a escolha do estudante. Nem mesmo uma conclusão confirmada
    // deve contornar silêncio, volume zero ou o Modo Foco.
    if (!this.enabled || !this.volume || this.suppressed) return
    if (options.userInitiated === false && !this.armed) return
    if (options.userInitiated !== false) this.armed = true
    if (options.id && this.ids.has(options.id)) return
    const now = this.now()
    if (now - this.last < .12 * 1000) return
    this.last = now
    const generation = ++this.generation
    if (options.id) { if (this.ids.size >= 1000) this.ids.clear(); this.ids.add(options.id) }
    try {
      this.synth ??= this.createSynth()
      // New cue replaces the previous cue; no unbounded overlapping voices.
      void this.synth.play(cues[event], this.volume).then(() => {
        if (generation === this.generation && this.view.error) this.error('')
      }).catch(() => { if (generation === this.generation) this.error('Efeitos sonoros indisponíveis neste navegador. Você pode continuar estudando sem som.') })
    } catch { this.error('Efeitos sonoros indisponíveis neste navegador. Você pode continuar estudando sem som.') }
  }
  dispose = () => { this.generation++; this.synth?.dispose(); this.synth = undefined; this.armed = false; this.last = -Infinity }
}
