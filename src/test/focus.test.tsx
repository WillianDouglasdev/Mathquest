/*
 * As ações do Pomodoro são exercitadas pela interface, inclusive por teclado.
 *  O store controlado permite conferir conclusão, recuperação e navegação sem esperar.
 */

import { act, render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../app/App'
import { FocusStore } from '../services/focus/FocusStore'

const originalLocks = Object.getOwnPropertyDescriptor(navigator, 'locks')
beforeEach(() => {
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: {
      request: async (
        _name: string,
        _options: unknown,
        callback: (lock: object) => Promise<void>,
      ) => callback({ name: 'focus-test' }),
    },
  })
})
afterEach(() => {
  if (originalLocks) Object.defineProperty(navigator, 'locks', originalLocks)
  else Reflect.deleteProperty(navigator, 'locks')
})

function fixture() {
  let now = { monotonicMs: 0, wallMs: Date.parse('2026-10-15T15:00:00Z') }
  const data = new Map<string, string>()
  const create = () =>
    new FocusStore(
      {
        getItem: (key) => data.get(key) ?? null,
        setItem: (key, value) => {
          data.set(key, value)
        },
      },
      () => now,
    )
  const store = create()
  const mount = (target = store) =>
    render(
      <MemoryRouter initialEntries={['/revisao']}>
        <App focusStore={target} />
      </MemoryRouter>,
    )
  return {
    store,
    create,
    mount,
    advance(ms: number) {
      now = { monotonicMs: now.monotonicMs + ms, wallMs: now.wallMs + ms }
      act(() => store.tick())
    },
  }
}

describe('Revisão e Foco — Pomodoro', () => {
  it('mostra conclusão, estatísticas reais e histórico único ao atingir a meta', async () => {
    const f = fixture(),
      user = userEvent.setup()
    f.mount()
    await user.click(screen.getByRole('button', { name: '15 minutos' }))
    await user.click(screen.getByRole('button', { name: 'Iniciar sessão' }))
    act(() => {
      for (let index = 0; index < 90; index++) f.advance(10_000)
    })
    expect(screen.getByLabelText('Tempo restante: 00:00')).toBeVisible()
    expect(screen.getByText('Meta concluída!')).toBeVisible()
    expect(
      within(
        screen.getByRole('region', { name: 'Seu histórico de foco' }),
      ).getAllByText('Concluída'),
    ).toHaveLength(1)
    expect(
      screen.getByRole('img', {
        name: /Quinta: 15 minutos, 1 sessões concluídas/,
      }),
    ).toBeVisible()
    expect(f.store.getSnapshot().state.history).toHaveLength(1)
  })
  it('seleciona duração e permite iniciar/pausar/retomar/finalizar/reiniciar pelo teclado', async () => {
    const f = fixture(),
      user = userEvent.setup()
    f.mount()
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Iniciar sessão' }),
      ).toBeEnabled(),
    )
    const fifteen = screen.getByRole('button', { name: '15 minutos' })
    fifteen.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('Tempo restante: 15:00')).toBeVisible()
    const start = screen.getByRole('button', { name: 'Iniciar sessão' })
    await user.tab()
    expect(screen.getByRole('button', { name: '25 minutos' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: '50 minutos' })).toHaveFocus()
    await user.tab()
    expect(start).toHaveFocus()
    await user.keyboard('{Enter}')
    f.advance(4_000)
    expect(screen.getByLabelText('Tempo restante: 14:56')).toBeVisible()
    expect(fifteen).toBeDisabled()
    screen.getByRole('button', { name: 'Pausar' }).focus()
    await user.keyboard(' ')
    f.advance(60_000)
    expect(screen.getByLabelText('Tempo restante: 14:56')).toBeVisible()
    screen.getByRole('button', { name: 'Retomar sessão' }).focus()
    await user.keyboard('{Enter}')
    f.advance(1_000)
    await user.click(screen.getByRole('button', { name: 'Finalizar' }))
    const history = screen.getByRole('region', {
      name: 'Seu histórico de foco',
    })
    expect(within(history).getByText('Interrompida')).toBeVisible()
    expect(f.store.getSnapshot().state.history[0].elapsedMs).toBe(5_000)
    await user.click(screen.getByRole('button', { name: 'Reiniciar' }))
    expect(screen.getByLabelText('Tempo restante: 15:00')).toBeVisible()
    expect(within(history).getByText('Interrompida')).toBeVisible()
  })

  it('mantém a mesma sessão ao navegar pelo Dashboard e atalho', async () => {
    const f = fixture(),
      user = userEvent.setup()
    f.mount()
    await user.click(screen.getByRole('button', { name: 'Iniciar sessão' }))
    f.advance(3_000)
    const id = f.store.getSnapshot().state.current?.id
    await user.click(screen.getByRole('link', { name: 'Início' }))
    const shortcut = screen.getByRole('link', { name: /Retomar foco/ })
    expect(shortcut).toHaveAttribute('href', '/revisao#pomodoro')
    expect(shortcut).toHaveTextContent('24:57')
    await user.click(shortcut)
    expect(
      screen.getByRole('heading', { name: 'Revisão e Foco' }),
    ).toBeVisible()
    expect(f.store.getSnapshot().state.current?.id).toBe(id)
    expect(screen.getByLabelText('Tempo restante: 24:57')).toBeVisible()
  })

  it('reabre pausado, mantém o histórico e não concede XP', async () => {
    const f = fixture(),
      user = userEvent.setup()
    const first = f.mount()
    await user.click(screen.getByRole('button', { name: 'Iniciar sessão' }))
    f.advance(5_000)
    first.unmount()
    f.advance(86_400_000)
    const reopened = f.create()
    f.mount(reopened)
    expect(screen.getByRole('button', { name: 'Retomar sessão' })).toBeEnabled()
    expect(screen.getByLabelText('Tempo restante: 24:55')).toBeVisible()
    expect(screen.getByText('Sem XP automático')).toBeVisible()
    expect(reopened.getSnapshot().state.current?.elapsedMs).toBe(5_000)
    await user.click(screen.getByRole('link', { name: 'Início' }))
    expect(
      screen.getByRole('progressbar', {
        name: 'Experiência até o próximo nível',
      }),
    ).toHaveAttribute('aria-valuenow', '73')
  })

  it('apresenta modo observador sem permitir outra sessão quando a trava está ocupada', async () => {
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: {
        request: async (
          _name: string,
          _options: unknown,
          callback: (lock: null) => void,
        ) => callback(null),
      },
    })
    const f = fixture()
    f.mount()
    expect(screen.getByText(/Outra aba está no controle/)).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Iniciar sessão' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Assumir controle nesta aba' }),
    ).toBeEnabled()
  })
})
