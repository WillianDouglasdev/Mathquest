/*
 * Modo Foco afeta ambiente e efeitos, não o estudo que está sendo contado.
 *  Esses casos mantêm cronômetro e música separados das mudanças decorativas.
 */

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../app/App'
import { FocusStore } from '../services/focus/FocusStore'
import { defaults, EXPERIENCE_KEY } from '../services/experience/PreferencesStore'
import { RadioStore, type MusicPort } from '../services/experience/RadioStore'
import { SoundService } from '../services/experience/SoundService'

const originalLocks = Object.getOwnPropertyDescriptor(navigator, 'locks')
beforeEach(() => {
  localStorage.clear()
  Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: async (_name: string, _options: unknown, callback: (lock: object) => Promise<void>) => callback({}) } })
})
afterEach(() => {
  localStorage.clear()
  if (originalLocks) Object.defineProperty(navigator, 'locks', originalLocks)
  else Reflect.deleteProperty(navigator, 'locks')
})
describe('Modo Foco', () => {
  it('reduz decoração e efeitos sem alterar sessão, tempo ou música em reprodução', async () => {
    localStorage.setItem(EXPERIENCE_KEY, JSON.stringify({ version: 1, preferences: { ...defaults, musicEnabled: true, effectsEnabled: true } }))
    const user = userEvent.setup(), data = new Map<string, string>()
    let now = { monotonicMs: 0, wallMs: Date.parse('2026-10-15T15:00:00Z') }
    const focus = new FocusStore({ getItem: k => data.get(k) ?? null, setItem: (k, v) => { data.set(k, v) } }, () => now)
    const audio: MusicPort = { src: '', currentTime: 0, volume: 0, loop: false, preload: '', play: vi.fn(async () => {}), pause: vi.fn(), load: vi.fn(), removeAttribute: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }
    const radio = new RadioStore([{ id: 'local', title: 'Fixture', src: '/audio/fixture.ogg', author: 'Teste', source: 'fixture', license: 'test-only', attribution: '' }], () => audio)
    const synth = { play: vi.fn(async () => {}), stop: vi.fn(), dispose: vi.fn() }
    let soundNow = 0
    const service = new SoundService(() => synth, () => soundNow += 200)
    const f = render(<MemoryRouter initialEntries={['/revisao']}><App focusStore={focus} radioStore={radio} soundService={service} /></MemoryRouter>)
    await user.click(screen.getByText('Ambiente MathQuest'))
    await user.click(screen.getByRole('button', { name: 'Reproduzir música' }))
    audio.currentTime = 17
    await user.click(screen.getByRole('button', { name: 'Iniciar sessão' }))
    const id = focus.getSnapshot().state.current!.id
    now = { monotonicMs: 2000, wallMs: now.wallMs + 2000 }
    act(() => focus.tick())
    expect(f.container.querySelector('[data-decorative-motion]')).toHaveAttribute('data-decorative-motion', 'off')
    expect(screen.getByRole('button', { name: 'Ouvir teste' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Pausar música' })).toBeVisible()
    const mode = screen.getByRole('checkbox', { name: 'Modo Foco durante o Pomodoro' })
    mode.focus(); await user.keyboard(' ')
    expect(f.container.querySelector('[data-decorative-motion]')).toHaveAttribute('data-decorative-motion', 'on')
    expect(screen.getByRole('button', { name: 'Ouvir teste' })).toBeEnabled()
    expect(focus.getSnapshot().state.current).toMatchObject({ id, status: 'running', elapsedMs: 2000 })
    expect(audio.currentTime).toBe(17)
    expect(audio.play).toHaveBeenCalledTimes(1)
    expect(radio.getSnapshot().playing).toBe(true)
    expect(JSON.parse(localStorage.getItem(EXPERIENCE_KEY)!).preferences.focusMode).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Ouvir teste' }))
    const calls = synth.play.mock.calls.length
    await user.click(mode)
    act(() => service.play('primary'))
    expect(synth.play).toHaveBeenCalledTimes(calls)
    expect(focus.getSnapshot().state.current?.status).toBe('running')
  })
  it('mantém a escolha desativada depois de reabrir sem criar efeitos por montagem', async () => {
    localStorage.setItem(EXPERIENCE_KEY, JSON.stringify({ version: 1, preferences: { ...defaults, focusMode: false, effectsEnabled: true } }))
    const synth = vi.fn(() => ({ play: vi.fn(async () => {}), stop: vi.fn(), dispose: vi.fn() }))
    render(<MemoryRouter><App soundService={new SoundService(synth)} /></MemoryRouter>)
    expect(synth).not.toHaveBeenCalled()
    await userEvent.click(screen.getByText('Ambiente MathQuest'))
    expect(screen.getByRole('checkbox', { name: 'Modo Foco durante o Pomodoro' })).not.toBeChecked()
    expect(synth).toHaveBeenCalledTimes(1) // Abrir as configurações tem um efeito intencional.
  })
})
