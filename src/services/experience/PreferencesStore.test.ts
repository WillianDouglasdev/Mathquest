/*
 * Preferências antigas, valores inválidos e falhas de storage precisam ter
 *  comportamento previsível, sem apagar uma escolha anterior de silêncio.
 */

import { describe, expect, it } from 'vitest'
import { defaults, EXPERIENCE_KEY, PreferencesStore } from './PreferencesStore'

function fixture(raw: string | null = null) {
  const data = new Map<string, string>(raw ? [[EXPERIENCE_KEY, raw]] : [])
  const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value) } }
  return { data, storage, store: new PreferencesStore(storage) }
}
describe('preferências de experiência', () => {
  it('começa com efeitos ligados, música desligada e persiste a escolha de movimento', () => {
    const f = fixture()
    expect(f.store.getSnapshot().preferences).toEqual(defaults)
    expect(f.store.getSnapshot().preferences).toMatchObject({ effectsEnabled: true, musicEnabled: false })
    f.store.update({ decorativeMotion: false })
    expect(new PreferencesStore(f.storage).getSnapshot().preferences.decorativeMotion).toBe(false)
  })
  it('preserva efeitos desligados explicitamente e aplica o novo padrão quando o campo está ausente', () => {
    const disabled = fixture(JSON.stringify({ version: 1, preferences: { effectsEnabled: false } }))
    expect(disabled.store.getSnapshot().preferences.effectsEnabled).toBe(false)
    disabled.store.update({ musicVolume: .3 })
    expect(new PreferencesStore(disabled.storage).getSnapshot().preferences.effectsEnabled).toBe(false)
    expect(fixture(JSON.stringify({ version: 1, preferences: {} })).store.getSnapshot().preferences.effectsEnabled).toBe(true)
  })
  it('preserva dados corrompidos sem sobrescrever e permite recuperar após correção externa', () => {
    const f = fixture('{broken')
    expect(f.store.getSnapshot().error).toMatch(/ler/)
    f.store.update({ effectsEnabled: true })
    expect(f.data.get(EXPERIENCE_KEY)).toBe('{broken')
    f.data.delete(EXPERIENCE_KEY)
    f.store.load()
    expect(f.store.getSnapshot().error).toBe('')
  })
  it('limita volumes e ignora campos inválidos ao carregar', () => {
    const f = fixture(JSON.stringify({ version: 1, preferences: { musicVolume: 99, effectsVolume: -1, effectsEnabled: 'yes' } }))
    expect(f.store.getSnapshot().preferences).toMatchObject({ musicVolume: 1, effectsVolume: 0, effectsEnabled: false })
    f.store.update({ musicVolume: NaN })
    expect(f.store.getSnapshot().preferences.musicVolume).toBe(.25)
  })
  it('persiste volumes independentes, faixa e modo sem alterar progresso educacional', () => {
    const f = fixture()
    f.data.set('mathquest.review.v1', 'existing-review')
    f.data.set('mathquest.focus.v1', 'existing-focus')
    f.store.update({ musicEnabled: true, musicVolume: .65, effectsEnabled: true, effectsVolume: .1, trackId: 'track-2', focusMode: false })
    expect(new PreferencesStore(f.storage).getSnapshot().preferences).toMatchObject({ musicEnabled: true, musicVolume: .65, effectsVolume: .1, trackId: 'track-2', focusMode: false })
    expect(f.data.get('mathquest.review.v1')).toBe('existing-review')
    expect(f.data.get('mathquest.focus.v1')).toBe('existing-focus')
  })
  it('trata indisponibilidade de armazenamento e remove assinaturas', () => {
    const f = fixture()
    let calls = 0
    const unsubscribe = f.store.subscribe(() => calls++)
    f.storage.setItem = () => { throw Error('quota') }
    f.store.update({ decorativeMotion: false })
    expect(f.store.getSnapshot()).toMatchObject({ preferences: { decorativeMotion: false }, error: expect.stringMatching(/nesta aba/) })
    unsubscribe()
    f.store.update({ decorativeMotion: true })
    expect(calls).toBe(1)
  })
})
