/*
 * Os efeitos devem acompanhar ações e registros reais. A montagem da página
 *  e a recuperação de uma sessão concluída não podem disparar um evento antigo.
 */

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../app/App'
import { SoundService, cues, type Note } from '../services/experience/SoundService'
import { defaults, EXPERIENCE_KEY } from '../services/experience/PreferencesStore'
import { FocusStore } from '../services/focus/FocusStore'

const originalLocks = Object.getOwnPropertyDescriptor(navigator, 'locks')
beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(EXPERIENCE_KEY, JSON.stringify({ version: 1, preferences: { ...defaults, effectsEnabled: true } }))
  Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: async (_name: string, options: unknown, callback?: (lock: object) => Promise<void>) => typeof options === 'function' ? options({}) : callback?.({}) } })
})
afterEach(() => {
  localStorage.clear()
  if (originalLocks) Object.defineProperty(navigator, 'locks', originalLocks)
  else Reflect.deleteProperty(navigator, 'locks')
})
function sounds() {
  let now = 0
  const synth = { play: vi.fn(async (_notes: readonly Note[], _volume: number) => {}), stop: vi.fn(), dispose: vi.fn() }
  const create = vi.fn(() => synth)
  return { synth, create, service: new SoundService(create, () => now += 200) }
}
describe('eventos de áudio reais', () => {
  it('não toca ao montar; virar/responder toca uma confirmação sem duplicar o histórico', async () => {
    const f = sounds(), user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/revisao']}><App soundService={f.service} /></MemoryRouter>)
    expect(f.create).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Revisar pendentes (30)' }))
    await user.click(screen.getByRole('button', { name: 'Virar cartão e revelar resposta' }))
    await waitFor(() => expect(f.synth.play).toHaveBeenCalledWith(cues.flip, .2))
    await user.dblClick(screen.getByRole('button', { name: 'Acertei' }))
    await waitFor(() => expect(f.synth.play).toHaveBeenCalledWith(cues.correct, .2))
    expect(f.synth.play.mock.calls.filter(call => call[0] === cues.correct)).toHaveLength(1)
    expect(JSON.parse(localStorage.getItem('mathquest.review.v1')!).history).toHaveLength(1)
  })
  it('emite conclusão uma vez após sessão real e não ao reabrir uma sessão concluída', async () => {
    const f = sounds(), user = userEvent.setup(), data = new Map<string, string>()
    let now = { wallMs: Date.parse('2026-10-15T15:00:00Z'), monotonicMs: 0 }
    const store = new FocusStore({ getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value) } }, () => now)
    const mount = () => render(<MemoryRouter initialEntries={['/revisao']}><App focusStore={store} soundService={f.service} /></MemoryRouter>)
    const first = mount()
    await user.click(screen.getByRole('button', { name: '15 minutos' }))
    await user.click(screen.getByRole('button', { name: 'Iniciar sessão' }))
    act(() => { for (let i = 0; i < 90; i++) { now = { wallMs: now.wallMs + 10000, monotonicMs: now.monotonicMs + 10000 }; store.tick() } })
    expect(f.synth.play.mock.calls.filter(call => call[0] === cues.pomodoro)).toHaveLength(1)
    first.unmount(); mount()
    expect(f.synth.play.mock.calls.filter(call => call[0] === cues.pomodoro)).toHaveLength(1)
  })
})
