/*
 * O destaque das configurações não muda a escolha do estudante: perfis novos
 *  começam com efeitos, e preferências de silêncio já salvas continuam valendo.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../app/App'
import { SoundService, cues, type Note } from '../services/experience/SoundService'
import { EXPERIENCE_KEY } from '../services/experience/PreferencesStore'

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())
function fixture() {
  let now = 0
  const synth = { play: vi.fn(async (_notes: readonly Note[], _volume: number) => {}), stop: vi.fn(), dispose: vi.fn() }
  const create = vi.fn(() => synth)
  const service = new SoundService(create, () => now += 200)
  const mount = () => render(<MemoryRouter><App soundService={service} /></MemoryRouter>)
  return { synth, create, mount }
}
describe('sons em destaque', () => {
  it('começa habilitado sem tocar no carregamento; o atalho abre, foca e informa estado', async () => {
    const f = fixture(), user = userEvent.setup()
    f.mount()
    expect(f.create).not.toHaveBeenCalled()
    expect(screen.getByText('Efeitos ligados')).toBeVisible()
    const shortcut = screen.getByRole('button', { name: 'Configurações de som' })
    shortcut.focus(); await user.keyboard('{Enter}')
    expect(shortcut).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('checkbox', { name: 'Efeitos sonoros' })).toBeChecked()
    expect(document.activeElement?.tagName).toBe('SUMMARY')
    expect(f.synth.play).toHaveBeenCalledWith(cues.open, .2)
    await user.keyboard('{Escape}')
    expect(shortcut).toHaveAttribute('aria-expanded', 'false')
  })
  it('oferece 19 prévias; selecionar não toca e ouvir usa o efeito escolhido', async () => {
    const f = fixture(), user = userEvent.setup()
    f.mount()
    await user.click(screen.getByRole('button', { name: 'Configurações de som' }))
    const select = screen.getByRole('combobox', { name: 'Prévia de efeito' })
    expect(select.querySelectorAll('option')).toHaveLength(19)
    const calls = f.synth.play.mock.calls.length
    await user.selectOptions(select, 'mission')
    expect(f.synth.play).toHaveBeenCalledTimes(calls)
    await user.click(screen.getByRole('button', { name: 'Ouvir teste' }))
    expect(f.synth.play).toHaveBeenLastCalledWith(cues.mission, .2)
  })
  it('emite variações de navegação e missão sem tocar por hover; respeita silêncio após recarga', async () => {
    const f = fixture(), user = userEvent.setup()
    const first = f.mount()
    await user.hover(screen.getByRole('button', { name: 'Continuar missão' }))
    expect(f.create).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Continuar missão' }))
    expect(f.synth.play).toHaveBeenLastCalledWith(cues.mission, .2)
    await user.click(screen.getByRole('button', { name: 'Fechar diálogo' }))
    await user.click(screen.getByRole('link', { name: 'Trilhas' }))
    expect(f.synth.play).toHaveBeenLastCalledWith(cues.navigate, .2)
    await user.click(screen.getByRole('button', { name: 'Configurações de som' }))
    await user.click(screen.getByRole('checkbox', { name: 'Efeitos sonoros' }))
    expect(JSON.parse(localStorage.getItem(EXPERIENCE_KEY)!).preferences.effectsEnabled).toBe(false)
    first.unmount(); f.mount()
    const calls = f.synth.play.mock.calls.length
    await user.click(screen.getByRole('button', { name: 'Configurações de som' }))
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Efeitos sonoros' })).not.toBeChecked())
    expect(f.synth.play).toHaveBeenCalledTimes(calls)
  })
})
