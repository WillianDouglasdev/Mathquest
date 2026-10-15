/*
 * Além de informar catálogo vazio, a interface precisa manter a mesma instância
 *  de áudio durante a navegação. Reabrir preferências não é uma nova ordem de tocar.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../app/App'
import { RadioStore, type MusicPort } from '../services/experience/RadioStore'

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())
describe('player global', () => {
  it('informa catálogo vazio e não finge reprodução', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    await userEvent.click(screen.getByText('Ambiente MathQuest'))
    expect(screen.getByText(/Nenhuma música local disponível/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'Reproduzir música' })).toBeDisabled()
  })
  it('mantém o mesmo áudio durante navegação React, aceita teclado e não restaura autoplay', async () => {
    const user = userEvent.setup()
    const audio: MusicPort = { src: '', currentTime: 0, volume: 0, loop: false, preload: '', play: vi.fn(async () => {}), pause: vi.fn(), load: vi.fn(), removeAttribute: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }
    const create = vi.fn(() => audio)
    const store = new RadioStore([1, 2].map(n => ({ id: `local-test-${n}`, title: `Faixa de teste ${n}`, src: `/audio/test-${n}.ogg`, author: 'Teste', source: 'fixture', license: 'test-only', attribution: '' })), create)
    const mount = () => render(<MemoryRouter><App radioStore={store} /></MemoryRouter>)
    const first = mount()
    await user.click(screen.getByText('Ambiente MathQuest'))
    await user.click(screen.getByRole('checkbox', { name: 'Música ambiente' }))
    const play = screen.getByRole('button', { name: 'Reproduzir música' })
    play.focus(); await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Pausar música' })).toBeVisible())
    audio.currentTime = 19
    await user.click(screen.getByRole('link', { name: 'Revisão e Foco' }))
    expect(screen.getByRole('button', { name: 'Pausar música' })).toBeVisible()
    expect(audio.currentTime).toBe(19)
    expect(create).toHaveBeenCalledTimes(1)
    await user.selectOptions(screen.getByLabelText('Faixa'), 'local-test-2')
    expect(screen.getByRole('button', { name: 'Reproduzir música' })).toBeVisible()
    expect(audio.play).toHaveBeenCalledTimes(1)
    first.unmount()
    mount()
    await user.click(screen.getByText('Ambiente MathQuest'))
    expect(screen.getByRole('checkbox', { name: 'Música ambiente' })).toBeChecked()
    expect(screen.getByLabelText('Faixa')).toHaveValue('local-test-2')
    expect(screen.getByRole('button', { name: 'Reproduzir música' })).toBeVisible()
    expect(audio.play).toHaveBeenCalledTimes(1)
  })
})
