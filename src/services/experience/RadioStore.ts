/**
 * A rádio mantém uma única instância de áudio e recebe suas dependências por
 * uma interface pequena. Isso facilita testar reprodução, pausa e falha sem
 * precisar tocar um arquivo de verdade durante a suíte.
 *
 * Uma mudança de preferência pode pausar ou trocar a seleção, mas nunca iniciar
 * som sozinha. O token identifica a tentativa de reprodução atual: uma promessa
 * antiga que termina depois de uma pausa não pode recolocar o player em tocando.
 */

import type { MusicTrack } from '../../data/music'
import type { Preferences } from './PreferencesStore'

export type MusicPort = {
  src: string; volume: number; loop: boolean; preload: string; currentTime: number
  play(): Promise<void>; pause(): void; load(): void; removeAttribute(name: string): void
  addEventListener(name: string, listener: () => void): void
  removeEventListener(name: string, listener: () => void): void
}
export class RadioStore {
  readonly tracks: readonly MusicTrack[]
  private view = { trackId: '', playing: false, busy: false, error: '' }
  private listeners = new Set<() => void>()
  private audio?: MusicPort
  private token = 0
  private enabled = false
  private volume = .25
  constructor(tracks: readonly MusicTrack[], private createAudio: () => MusicPort) {
    this.tracks = tracks.filter(track => /^\/audio\/[\w/-]+\.(mp3|ogg|wav)$/.test(track.src) && !track.src.includes('..') && track.id && track.license && track.source && track.author)
      .filter((track, i, all) => all.findIndex(t => t.id === track.id) === i).slice(0, 3)
    this.view.trackId = this.tracks[0]?.id ?? ''
  }
  getSnapshot = () => this.view
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private set(patch: Partial<typeof this.view>) { this.view = { ...this.view, ...patch }; this.listeners.forEach(fn => fn()) }
  private onPause = () => this.set({ playing: false })
  private onError = () => { this.pause(); this.set({ error: 'Não foi possível reproduzir este arquivo local. Escolha outra faixa ou tente novamente.' }) }
  private onEnded = () => this.set({ playing: false })
  applyPreferences = (preferences: Preferences) => {
    const selected = this.tracks.find(t => t.id === preferences.trackId)?.id ?? this.tracks[0]?.id ?? ''
    const changed = selected !== this.view.trackId
    this.enabled = preferences.musicEnabled
    this.volume = preferences.musicVolume
    if (!this.enabled || changed) this.pause()
    if (changed) { if (this.audio) this.audio.removeAttribute('src'); this.set({ trackId: selected, error: '' }) }
    if (this.audio) this.audio.volume = this.volume
    // A restored preference or cross-tab change never starts playback.
  }
  play = async () => {
    const track = this.tracks.find(t => t.id === this.view.trackId)
    if (!this.enabled || !track || this.view.busy || this.view.playing) return
    const request = ++this.token
    // Guardar a geração da tentativa evita que um play antigo vença uma pausa
    // feita enquanto o navegador ainda estava resolvendo a reprodução.
    this.set({ busy: true, error: '' })
    try {
      if (!this.audio) {
        this.audio = this.createAudio()
        this.audio.addEventListener('pause', this.onPause)
        this.audio.addEventListener('error', this.onError)
        this.audio.addEventListener('ended', this.onEnded)
      }
      const audio = this.audio
      audio.preload = 'none'; audio.loop = true; audio.volume = this.volume
      // Absolute URL normalization is left to the browser; do not reload the same source on resume.
      if (!audio.src.endsWith(track.src)) audio.src = track.src
      await audio.play()
      if (request === this.token) this.set({ playing: true, busy: false })
    } catch {
      if (request === this.token) this.set({ busy: false, playing: false, error: 'Reprodução não iniciada. Verifique o arquivo e pressione Reproduzir para tentar novamente.' })
    }
  }
  pause = () => { this.token++; this.audio?.pause(); if (this.view.playing || this.view.busy) this.set({ playing: false, busy: false }) }
  dispose = () => {
    this.pause()
    if (!this.audio) return
    this.audio.removeEventListener('pause', this.onPause)
    this.audio.removeEventListener('error', this.onError)
    this.audio.removeEventListener('ended', this.onEnded)
    this.audio.removeAttribute('src'); this.audio.load(); this.audio = undefined
  }
}
