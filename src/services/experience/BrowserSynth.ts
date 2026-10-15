/**
 * O sintetizador transforma as notas do serviço em osciladores da Web Audio API.
 * O ganho sobe e desce rapidamente para suavizar as bordas do som, sem remover
 * o caráter retrô. As notas são agendadas no relógio do próprio áudio.
 *
 * Uma nova reprodução encerra as vozes anteriores. Ao terminar ou desmontar,
 * osciladores e conexões são liberados; esse cuidado importa em sessões longas,
 * nas quais abrir e fechar páginas não pode acumular recursos de áudio.
 */

import type { Note, SynthPort } from './SoundService'

export class BrowserSynth implements SynthPort {
  private context?: AudioContext
  private voices = new Set<{ oscillator: OscillatorNode; gain: GainNode }>()
  private generation = 0
  async play(notes: readonly Note[], volume: number) {
    this.stop()
    const generation = this.generation
    const context = this.context ??= new AudioContext()
    if (context.state === 'suspended') await context.resume()
    if (generation !== this.generation) return
    let at = context.currentTime
    for (const [frequency, duration] of notes) {
      const oscillator = context.createOscillator(), gain = context.createGain()
      const voice = { oscillator, gain }
      this.voices.add(voice)
      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(frequency, at)
      gain.gain.setValueAtTime(.0001, at)
      gain.gain.exponentialRampToValueAtTime(Math.max(.0001, volume * .06), at + .008)
      gain.gain.exponentialRampToValueAtTime(.0001, at + duration)
      oscillator.connect(gain); gain.connect(context.destination)
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); this.voices.delete(voice) }
      oscillator.start(at); oscillator.stop(at + duration + .01)
      at += duration + .015
    }
  }
  stop() {
    this.generation++
    for (const { oscillator, gain } of this.voices) {
      oscillator.onended = null
      try { oscillator.stop() } catch { /* O oscilador já havia terminado. */ }
      oscillator.disconnect(); gain.disconnect()
    }
    this.voices.clear()
  }
  dispose() {
    this.stop()
    if (this.context && this.context.state !== 'closed') void this.context.close().catch(() => {})
    this.context = undefined
  }
}
