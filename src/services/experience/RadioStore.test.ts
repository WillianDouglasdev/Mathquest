/*
 * O áudio de teste reproduz o contrato do navegador sem tocar música de verdade.
 *  Promessas e pausas ajudam a conferir cancelamento, ausência de autoplay e limpeza.
 */

import { describe, expect, it, vi } from 'vitest'
import { defaults } from './PreferencesStore'
import { RadioStore, type MusicPort } from './RadioStore'
import type { MusicTrack } from '../../data/music'

export const testTracks: MusicTrack[] = [1, 2].map(n => ({ id: `test-${n}`, title: `Teste ${n}`, src: `/audio/test-${n}.ogg`, author: 'Teste', source: 'test fixture, not distributed', license: 'test-only', attribution: '' }))
export function radioFixture() {
  const handlers = new Map<string, () => void>()
  const audio: MusicPort = { src: '', currentTime: 0, volume: 0, loop: false, preload: '', play: vi.fn(async () => {}), pause: vi.fn(), load: vi.fn(), removeAttribute: vi.fn(), addEventListener: (key, fn) => { handlers.set(key, fn) }, removeEventListener: key => { handlers.delete(key) } }
  const create = vi.fn(() => audio)
  const store = new RadioStore(testTracks, create)
  return { store, audio, create, handlers }
}
describe('Rádio MathQuest', () => {
  it('não cria áudio nem inicia ao restaurar preferências habilitadas', () => {
    const f = radioFixture()
    f.store.applyPreferences({ ...defaults, musicEnabled: true, trackId: 'test-2' })
    expect(f.create).not.toHaveBeenCalled()
    expect(f.store.getSnapshot()).toMatchObject({ trackId: 'test-2', playing: false })
  })
  it('reproduz manualmente, em loop, com volume e retoma sem reinicializar recurso', async () => {
    const f = radioFixture()
    f.store.applyPreferences({ ...defaults, musicEnabled: true, musicVolume: .4 })
    await f.store.play()
    expect(f.audio).toMatchObject({ src: '/audio/test-1.ogg', loop: true, volume: .4, preload: 'none' })
    f.audio.currentTime = 13
    f.store.pause()
    await f.store.play()
    expect(f.audio.currentTime).toBe(13)
    expect(f.create).toHaveBeenCalledTimes(1)
  })
  it('troca de faixa e desativação pausam sem autoplay; limpar descarrega e remove listeners', async () => {
    const f = radioFixture()
    f.store.applyPreferences({ ...defaults, musicEnabled: true })
    await f.store.play()
    f.store.applyPreferences({ ...defaults, musicEnabled: true, trackId: 'test-2' })
    expect(f.store.getSnapshot().playing).toBe(false)
    expect(f.audio.play).toHaveBeenCalledTimes(1)
    f.store.dispose()
    expect(f.handlers.size).toBe(0)
    expect(f.audio.removeAttribute).toHaveBeenCalledWith('src')
    expect(f.audio.load).toHaveBeenCalledTimes(1)
  })
  it('ignora conclusão tardia de play após pausar e impede solicitações duplicadas', async () => {
    const f = radioFixture()
    let finish!: () => void
    f.audio.play = vi.fn(() => new Promise<void>(resolve => { finish = resolve }))
    f.store.applyPreferences({ ...defaults, musicEnabled: true })
    const pending = f.store.play()
    await f.store.play()
    expect(f.audio.play).toHaveBeenCalledTimes(1)
    f.store.dispose(); finish(); await pending
    expect(f.store.getSnapshot()).toMatchObject({ playing: false, busy: false })
  })
  it('trata falha de arquivo e rejeição de play sem promessa não tratada', async () => {
    const f = radioFixture()
    f.store.applyPreferences({ ...defaults, musicEnabled: true })
    f.audio.play = vi.fn(async () => { throw Error('missing') })
    await f.store.play()
    expect(f.store.getSnapshot().error).toMatch(/não iniciada/)
    f.handlers.get('error')?.()
    expect(f.store.getSnapshot().error).toMatch(/arquivo local/)
  })
  it('mantém catálogo vazio honesto e recusa fontes externas ou sem licença', async () => {
    const f = new RadioStore([{ ...testTracks[0], src: 'https://example.org/audio.ogg' }, { ...testTracks[1], license: '' }], () => { throw Error('must not create') })
    f.applyPreferences({ ...defaults, musicEnabled: true })
    await f.play()
    expect(f.tracks).toHaveLength(0)
    expect(f.getSnapshot().playing).toBe(false)
  })
})
