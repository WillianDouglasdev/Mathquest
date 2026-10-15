/*
 * A visibilidade é controlada para conferir quando um WebP pode ser usado.
 *  Comemorações exigem evento novo e não devem voltar ao reencontrar o personagem.
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../app/App'
import { StudentAvatar, STUDENT_CELEBRATION_MS, type StudentCelebration } from '../components/StudentAvatar'
import { ExperienceProvider } from '../features/experience/ExperienceProvider'
import { ExperienceControls } from '../features/experience/ExperienceControls'
import { EXPERIENCE_KEY } from '../services/experience/PreferencesStore'

const observers = new Set<ViewportObserver>()
class ViewportObserver {
  target?: Element
  constructor(private callback: IntersectionObserverCallback) { observers.add(this) }
  observe(element: Element) { this.target = element }
  disconnect() { observers.delete(this) }
  emit(visible: boolean) {
    if (this.target) this.callback([{ target: this.target, isIntersecting: visible, intersectionRatio: visible ? 1 : 0 } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }
}
const viewport = (visible = true) => act(() => { [...observers].forEach(observer => observer.emit(visible)) })
const asset = (container: HTMLElement) => container.querySelector('img')!
const state = (container: HTMLElement) => container.querySelector('[data-student-state]')?.getAttribute('data-student-state')
beforeEach(() => { localStorage.clear(); vi.stubGlobal('IntersectionObserver', ViewportObserver) })
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.clear(); observers.clear() })

describe('personagem oficial animado', () => {
  it('usa still até entrar na tela, preserva dimensões e troca para estático fora dela', () => {
    const f = render(<ExperienceProvider><StudentAvatar motion="idle" /></ExperienceProvider>)
    expect(asset(f.container)).toHaveAttribute('src', '/assets/animations/characters/student-full-still.png')
    viewport()
    expect(state(f.container)).toBe('idle')
    expect(asset(f.container)).toHaveAttribute('width', '192')
    expect(asset(f.container)).toHaveAttribute('height', '280')
    viewport(false)
    expect(state(f.container)).toBe('static')
    f.unmount()
    expect(observers.size).toBe(0)
  })
  it('mantém ranking e cabeçalho estáticos, com no máximo dois WebPs no Dashboard', () => {
    const f = render(<MemoryRouter><App /></MemoryRouter>)
    viewport()
    expect(f.container.querySelectorAll('img[src$=".webp"]')).toHaveLength(2)
    const ranking = screen.getByRole('region', { name: 'Ranking semanal demonstrativo' })
    expect(ranking.querySelectorAll('img')).toHaveLength(5)
    expect(ranking.querySelector('img[src$=".webp"]')).toBeNull()
    expect(screen.getByRole('button', { name: 'Abrir perfil demonstrativo' }).querySelector('img')?.src).toMatch(/portrait-still.png$/)
  })
  it('ignora movimentos por preferência do sistema e acompanha sua mudança', () => {
    const media = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    vi.stubGlobal('matchMedia', () => media)
    const f = render(<ExperienceProvider><StudentAvatar motion="idle" /></ExperienceProvider>)
    viewport()
    expect(state(f.container)).toBe('static')
    media.matches = false
    act(() => media.addEventListener.mock.calls[0][1]())
    viewport()
    expect(state(f.container)).toBe('idle')
    f.unmount()
    expect(media.removeEventListener).toHaveBeenCalled()
  })
  it('respeita o controle de decoração e usa still na página de foco até desligar Modo Foco', async () => {
    const user = userEvent.setup()
    const f = render(<ExperienceProvider><ExperienceControls /><StudentAvatar motion="idle" focusSensitive /></ExperienceProvider>)
    viewport()
    expect(state(f.container)).toBe('static')
    await user.click(screen.getByText('Ambiente MathQuest'))
    await user.click(screen.getByRole('checkbox', { name: 'Modo Foco durante o Pomodoro' }))
    viewport()
    expect(state(f.container)).toBe('idle')
    await user.click(screen.getByRole('checkbox', { name: 'Animações decorativas' }))
    expect(state(f.container)).toBe('static')
  })
  it('também pausa idle fora da revisão quando há uma sessão com Modo Foco ativo', () => {
    const f = render(<ExperienceProvider focusRunning><StudentAvatar motion="idle" /></ExperienceProvider>)
    viewport()
    expect(state(f.container)).toBe('static')
  })
  it('não comemora estado restaurado; novo evento confirmado toca só um ciclo e não repete o ID', () => {
    vi.useFakeTimers()
    const content = (event: StudentCelebration) => <ExperienceProvider><StudentAvatar motion="idle" celebration={event} /></ExperienceProvider>
    const f = render(content({ id: 'restored', type: 'mission-completed' }))
    viewport()
    expect(state(f.container)).toBe('idle')
    f.rerender(content({ id: 'confirmed-1', type: 'mission-completed' }))
    expect(state(f.container)).toBe('celebrate')
    act(() => vi.advanceTimersByTime(STUDENT_CELEBRATION_MS))
    expect(state(f.container)).toBe('idle')
    f.rerender(content({ id: 'confirmed-1', type: 'mission-completed' }))
    expect(state(f.container)).toBe('idle')
    f.rerender(content({ id: 'confirmed-2', type: 'challenge-correct' }))
    expect(state(f.container)).toBe('celebrate')
    f.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('descarta comemoração fora de tela ou com movimento desativado, sem reproduzir depois', () => {
    const content = (id: string) => <ExperienceProvider><StudentAvatar motion="idle" celebration={{ id, type: 'challenge-correct' }} /></ExperienceProvider>
    const f = render(content('initial'))
    f.rerender(content('hidden-event'))
    viewport()
    expect(state(f.container)).toBe('idle')
    act(() => {
      localStorage.setItem(EXPERIENCE_KEY, JSON.stringify({ version: 1, preferences: { decorativeMotion: false } }))
      window.dispatchEvent(new StorageEvent('storage', { key: EXPERIENCE_KEY }))
    })
    f.rerender(content('disabled-event'))
    expect(state(f.container)).toBe('static')
    act(() => {
      localStorage.setItem(EXPERIENCE_KEY, JSON.stringify({ version: 1, preferences: { decorativeMotion: true } }))
      window.dispatchEvent(new StorageEvent('storage', { key: EXPERIENCE_KEY }))
    })
    viewport()
    expect(state(f.container)).toBe('idle')
  })
  it('usa estático em aba oculta ou conteúdo inerte e retoma somente o idle', async () => {
    const f = render(<ExperienceProvider><StudentAvatar motion="idle" /></ExperienceProvider>)
    viewport()
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(state(f.container)).toBe('static')
    visibility.mockReturnValue('visible')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(state(f.container)).toBe('idle')
    f.container.setAttribute('inert', '')
    await waitFor(() => expect(state(f.container)).toBe('static'))
    f.container.removeAttribute('inert')
    await waitFor(() => expect(state(f.container)).toBe('idle'))
  })
  it('cancela a comemoração ao sair da tela e não a retoma ao voltar', () => {
    vi.useFakeTimers()
    const content = (id: string) => <ExperienceProvider><StudentAvatar motion="idle" celebration={{ id, type: 'mission-completed' }} /></ExperienceProvider>
    const f = render(content('initial'))
    viewport()
    f.rerender(content('completed'))
    expect(state(f.container)).toBe('celebrate')
    viewport(false)
    expect(state(f.container)).toBe('static')
    expect(vi.getTimerCount()).toBe(0)
    viewport()
    expect(state(f.container)).toBe('idle')
  })
  it('recupera WebP ausente com still e PNG original, sem imagem quebrada persistente', () => {
    const f = render(<ExperienceProvider><StudentAvatar motion="idle" /></ExperienceProvider>)
    viewport()
    fireEvent.error(asset(f.container))
    expect(state(f.container)).toBe('static')
    expect(asset(f.container)).toHaveAttribute('src', '/assets/animations/characters/student-full-still.png')
    fireEvent.error(asset(f.container))
    expect(asset(f.container)).toHaveAttribute('src', '/assets/characters/student-v2-full.png')
    fireEvent.error(asset(f.container))
    expect(f.container.querySelector('img')).toBeNull()
  })
  it('é estático sem provider ou sem IntersectionObserver', () => {
    const first = render(<StudentAvatar motion="idle" />)
    expect(state(first.container)).toBe('static')
    first.unmount()
    vi.stubGlobal('IntersectionObserver', undefined)
    const f = render(<ExperienceProvider><StudentAvatar motion="idle" /></ExperienceProvider>)
    expect(state(f.container)).toBe('static')
  })
})
