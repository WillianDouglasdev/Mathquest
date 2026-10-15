/**
 * Preferências de ambiente ficam em uma chave própria, sem se misturar com
 * tempo estudado ou agenda de revisão. O carregamento valida cada opção e limita
 * volumes para manter um estado utilizável mesmo com dados antigos.
 *
 * Efeitos começam ligados em um perfil novo, mas uma escolha anterior de silêncio
 * é respeitada. Música habilitada significa preferência, não autorização para
 * autoplay: o início da reprodução continua dependendo da ação do estudante.
 */

export const EXPERIENCE_KEY = 'mathquest.experience.v1'
export type Preferences = {
  decorativeMotion: boolean
  musicEnabled: boolean
  musicVolume: number
  trackId: string
  effectsEnabled: boolean
  effectsVolume: number
  focusMode: boolean
}
export const defaults: Readonly<Preferences> = {
  decorativeMotion: true, musicEnabled: false, musicVolume: 0.25,
  trackId: '', effectsEnabled: true, effectsVolume: 0.2, focusMode: true,
}
export type PreferencesStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}
const volume = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback
export class PreferencesStore {
  private view = { preferences: { ...defaults }, error: '' }
  private listeners = new Set<() => void>()
  constructor(private storage: PreferencesStorage) { this.load() }
  getSnapshot = () => this.view
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private publish(preferences: Preferences, error = '') {
    this.view = { preferences, error }
    this.listeners.forEach(listener => listener())
  }
  load = () => {
    try {
      const raw = this.storage.getItem(EXPERIENCE_KEY)
      if (!raw) { this.publish({ ...defaults }); return }
      const data = JSON.parse(raw)
      if (data?.version !== 1 || !data.preferences || typeof data.preferences !== 'object' || Array.isArray(data.preferences)) throw Error()
      const p = data.preferences
      this.publish({
        decorativeMotion: typeof p.decorativeMotion === 'boolean' ? p.decorativeMotion : defaults.decorativeMotion,
        musicEnabled: typeof p.musicEnabled === 'boolean' ? p.musicEnabled : defaults.musicEnabled,
        musicVolume: volume(p.musicVolume, defaults.musicVolume),
        trackId: typeof p.trackId === 'string' && p.trackId.length <= 100 ? p.trackId : '',
        effectsEnabled: p.effectsEnabled === undefined ? defaults.effectsEnabled : typeof p.effectsEnabled === 'boolean' ? p.effectsEnabled : false,
        effectsVolume: volume(p.effectsVolume, defaults.effectsVolume),
        focusMode: typeof p.focusMode === 'boolean' ? p.focusMode : defaults.focusMode,
      })
    } catch {
      this.publish({ ...defaults, decorativeMotion: false, effectsEnabled: false }, 'Não foi possível ler as preferências. Os dados existentes foram preservados.')
    }
  }
  update = (patch: Partial<Preferences>) => {
    const preferences = { ...this.view.preferences, ...patch }
    preferences.musicVolume = volume(preferences.musicVolume, defaults.musicVolume)
    preferences.effectsVolume = volume(preferences.effectsVolume, defaults.effectsVolume)
    try {
      // Never overwrite an unreadable snapshot implicitly.
      if (this.view.error.startsWith('Não foi possível ler')) return
      this.storage.setItem(EXPERIENCE_KEY, JSON.stringify({ version: 1, preferences }))
      this.publish(preferences)
    } catch {
      this.publish(preferences, 'Preferências aplicadas nesta aba, mas não foi possível salvar no navegador.')
    }
  }
}
