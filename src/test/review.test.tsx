/*
 * Revelar, responder e avançar são passos distintos do estudo. Os testes conferem
 *  esse fluxo e sua persistência, sem interferir no Pomodoro ou duplicar respostas.
 */

import { act, render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { FlashcardSection } from '../features/review/FlashcardSection'
import { ReviewStore, REVIEW_STORAGE_KEY } from '../services/review/ReviewStore'
import { FocusStore } from '../services/focus/FocusStore'
import { App } from '../app/App'

const descriptor = Object.getOwnPropertyDescriptor(navigator, 'locks')
beforeEach(() => {
  localStorage.clear()
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: {
      request: async (
        _name: string,
        optionsOrCallback: unknown,
        callback?: (lock: object) => Promise<void>,
      ) => {
        if (typeof optionsOrCallback === 'function')
          return optionsOrCallback({ name: _name })
        return callback?.({ name: _name })
      },
    },
  })
})
afterEach(() => {
  localStorage.clear()
  if (descriptor) Object.defineProperty(navigator, 'locks', descriptor)
  else Reflect.deleteProperty(navigator, 'locks')
})

function fixture() {
  const data = new Map<string, string>()
  let id = 0
  const create = () =>
    new ReviewStore({
      storage: {
        getItem: (key) => data.get(key) ?? null,
        setItem: (key, value) => {
          data.set(key, value)
        },
      },
      now: () => Date.parse('2026-10-15T12:00:00-03:00'),
      id: () => `ui-${++id}`,
      exclusive: async (task) => {
        task()
      },
    })
  const store = create()
  const mount = (target = store) =>
    render(<FlashcardSection providedStore={target} />)
  return { store, data, create, mount }
}

describe('flashcards na interface', () => {
  it('seleciona assunto e exige revelar antes de registrar; funciona por teclado', async () => {
    const f = fixture(),
      user = userEvent.setup()
    f.mount()
    await user.selectOptions(screen.getByLabelText('Assunto'), 'fractions')
    await user.click(
      screen.getByRole('button', { name: 'Revisar pendentes (10)' }),
    )
    const review = screen.getByRole('region', { name: 'Flashcards de revisão' })
    expect(
      within(review).getByText('Qual é a forma simplificada de 6/8?'),
    ).toBeVisible()
    const wrong = within(review).getByRole('button', { name: 'Errei' }),
      correct = within(review).getByRole('button', { name: 'Acertei' })
    expect(wrong).toBeDisabled()
    expect(correct).toBeDisabled()
    const flip = within(review).getByRole('button', {
      name: 'Virar cartão e revelar resposta',
    })
    flip.focus()
    await user.keyboard('{Enter}')
    expect(within(review).getByRole('heading', { name: '3/4' })).toBeVisible()
    expect(
      within(review).getByText(/Divida numerador e denominador por 2/),
    ).toBeVisible()
    await user.tab()
    expect(wrong).toHaveFocus()
    await user.tab()
    expect(correct).toHaveFocus()
    await user.keyboard(' ')
    await waitFor(() => expect(correct).toBeDisabled())
    expect(f.store.getSnapshot().snapshot.history).toHaveLength(1)
    expect(within(review).getByText(/18\/10\/2026/)).toBeVisible()
    expect(
      screen.getByRole('progressbar', { name: 'Cartões estudados: Frações' }),
    ).toHaveAttribute('aria-valuenow', '10')
    await user.click(
      within(review).getByRole('button', { name: 'Próximo cartão' }),
    )
    expect(screen.getByRole('group', { name: 'Cartão fr-02' })).toHaveFocus()
    const pendingList = screen.getByRole('list', { name: 'Cartões pendentes' })
    pendingList.focus()
    expect(pendingList).toHaveFocus()
    expect(
      within(review).getByRole('button', { name: 'Acertei' }),
    ).toBeDisabled()
  })

  it('não duplica uma resposta por clique duplo nem depois de recarregar', async () => {
    const f = fixture(),
      user = userEvent.setup()
    const first = f.mount()
    await user.click(
      screen.getByRole('button', { name: 'Revisar pendentes (30)' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Virar cartão e revelar resposta' }),
    )
    await user.dblClick(screen.getByRole('button', { name: 'Acertei' }))
    expect(f.store.getSnapshot().snapshot.history).toHaveLength(1)
    first.unmount()
    const reopened = f.create()
    f.mount(reopened)
    expect(screen.getByRole('button', { name: 'Acertei' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próximo cartão' })).toBeEnabled()
    expect(reopened.getSnapshot().snapshot.progress['op-01'].correct).toBe(1)
  })

  it('permite treino antecipado e mantém a agenda mesmo ao errar', async () => {
    const f = fixture()
    f.store.load()
    await f.store.start('operations', 'scheduled')
    const token = f.store.getSnapshot().snapshot.round!.current!.id
    await f.store.flip(token)
    await f.store.grade(token, 'correct')
    const progress = structuredClone(f.store.getSnapshot().snapshot.progress)
    const user = userEvent.setup()
    f.mount()
    await user.click(
      screen.getByRole('button', { name: 'Treinar sem alterar agenda' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Virar cartão e revelar resposta' }),
    )
    await user.click(screen.getByRole('button', { name: 'Errei' }))
    expect(
      screen.getByText(/Treino registrado. A data e o intervalo/),
    ).toBeVisible()
    expect(f.store.getSnapshot().snapshot.progress).toEqual(progress)
    expect(f.store.getSnapshot().snapshot.history.at(-1)?.mode).toBe('practice')
  })

  it('mostra falha de leitura, bloqueia respostas e recupera sem apagar silenciosamente', async () => {
    const f = fixture()
    f.data.set(REVIEW_STORAGE_KEY, '{broken')
    const user = userEvent.setup()
    f.mount()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Os dados foram preservados',
    )
    expect(
      screen.getByRole('button', { name: 'Revisar pendentes (30)' }),
    ).toBeDisabled()
    expect(f.data.get(REVIEW_STORAGE_KEY)).toBe('{broken')
    f.data.delete(REVIEW_STORAGE_KEY)
    await user.click(
      screen.getByRole('button', { name: 'Recarregar progresso' }),
    )
    expect(
      screen.getByRole('button', { name: 'Revisar pendentes (30)' }),
    ).toBeEnabled()
  })

  it('revisar matemática não reinicia, pausa ou pontua o Pomodoro', async () => {
    let now = {
      monotonicMs: 0,
      wallMs: Date.parse('2026-10-15T12:00:00-03:00'),
    }
    const focusData = new Map<string, string>()
    const focus = new FocusStore(
      {
        getItem: (key) => focusData.get(key) ?? null,
        setItem: (key, value) => {
          focusData.set(key, value)
        },
      },
      () => now,
    )
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/revisao']}>
        <App focusStore={focus} />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: 'Iniciar sessão' }))
    const sessionId = focus.getSnapshot().state.current!.id
    act(() => {
      now = { monotonicMs: 4_000, wallMs: now.wallMs + 4_000 }
      focus.tick()
    })
    await user.click(
      screen.getByRole('button', { name: 'Revisar pendentes (30)' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Virar cartão e revelar resposta' }),
    )
    await user.click(screen.getByRole('button', { name: 'Acertei' }))
    expect(
      JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY)!).history,
    ).toHaveLength(1)
    expect(focus.getSnapshot().state.current).toMatchObject({
      id: sessionId,
      status: 'running',
      elapsedMs: 4_000,
    })
    act(() => {
      now = { monotonicMs: 7_000, wallMs: now.wallMs + 3_000 }
      focus.tick()
    })
    expect(screen.getByLabelText('Tempo restante: 24:53')).toBeVisible()
    await user.click(screen.getByRole('link', { name: 'Início' }))
    expect(
      screen.getByRole('progressbar', {
        name: 'Experiência até o próximo nível',
      }),
    ).toHaveAttribute('aria-valuenow', '73')
  })
})
