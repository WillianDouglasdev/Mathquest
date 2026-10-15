/*
 * A preferência deve acompanhar a pessoa depois de fechar o painel ou reabrir
 *  a página. O teclado e a sincronização entre abas fazem parte desse comportamento.
 */

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ExperienceProvider } from '../features/experience/ExperienceProvider'
import { ExperienceControls } from '../features/experience/ExperienceControls'
import { App } from '../app/App'
import { EXPERIENCE_KEY } from '../services/experience/PreferencesStore'

beforeEach(() => localStorage.clear())
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear() })
describe('animações e controles de ambiente', () => {
  it('permite desligar decoração por teclado e mantém a escolha ao reabrir', async () => {
    const user = userEvent.setup()
    const mount = () => render(<ExperienceProvider><ExperienceControls /></ExperienceProvider>)
    const first = mount()
    await user.click(screen.getByText('Ambiente MathQuest'))
    const checkbox = screen.getByRole('checkbox', { name: 'Animações decorativas' })
    checkbox.focus()
    await user.keyboard(' ')
    expect(first.container.querySelector('[data-decorative-motion]')).toHaveAttribute('data-decorative-motion', 'off')
    first.unmount()
    const next = mount()
    expect(next.container.querySelector('[data-decorative-motion]')).toHaveAttribute('data-decorative-motion', 'off')
  })
  it('acompanha movimento reduzido do sistema e remove o listener ao desmontar', () => {
    const media = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    vi.stubGlobal('matchMedia', () => media)
    const f = render(<ExperienceProvider><ExperienceControls /></ExperienceProvider>)
    expect(f.container.querySelector('[data-decorative-motion]')).toHaveAttribute('data-decorative-motion', 'off')
    const handler = media.addEventListener.mock.calls[0][1]
    media.matches = false
    act(() => handler())
    expect(f.container.querySelector('[data-decorative-motion]')).toHaveAttribute('data-decorative-motion', 'on')
    f.unmount()
    expect(media.removeEventListener).toHaveBeenCalledWith('change', handler)
  })
  it('sincroniza preferências de outra aba sem recriar a página', () => {
    const f = render(<MemoryRouter><App /></MemoryRouter>)
    localStorage.setItem(EXPERIENCE_KEY, JSON.stringify({ version: 1, preferences: { decorativeMotion: false } }))
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: EXPERIENCE_KEY })))
    expect(f.container.querySelector('[data-decorative-motion]')).toHaveAttribute('data-decorative-motion', 'off')
    expect(screen.getByRole('heading', { name: 'Olá, Estudante!' })).toBeVisible()
  })
})
