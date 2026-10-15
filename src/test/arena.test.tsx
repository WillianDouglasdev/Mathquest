/*
 * A Arena ainda é uma prévia artística. Os testes protegem poses, acessibilidade
 *  e preferências, além de garantir que escolher um exemplo não gere XP ou progresso.
 */

import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../app/App'
import { ArenaPage } from '../features/arena/ArenaPage'
import { BattleHUD } from '../features/arena/BattleHUD'
import { BattleScene } from '../features/arena/BattleScene'
import { GuardianSprite } from '../features/arena/GuardianSprite'
import { guardianArtwork, guardianLabels, guardianStates, type GuardianState } from '../features/arena/arenaArtwork'
import { ExperienceProvider } from '../features/experience/ExperienceProvider'
import { EXPERIENCE_KEY } from '../services/experience/PreferencesStore'
import { SoundService } from '../services/experience/SoundService'

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
const sprite = (container: HTMLElement) => container.querySelector('[data-guardian-state]')!
beforeEach(() => { localStorage.clear(); vi.stubGlobal('IntersectionObserver', ViewportObserver) })
afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); observers.clear() })

describe('Guardião oficial — poses e políticas de movimento', () => {
  it.each(guardianStates)('usa o PNG aprovado para %s, inclusive com movimento desativado', state => {
    const f = render(<ExperienceProvider focusRunning><GuardianSprite state={state} /></ExperienceProvider>)
    const image = screen.getByRole('img', { name: `Guardião da Lógica — ${guardianLabels[state]}` })
    expect(image).toHaveAttribute('src', guardianArtwork.sources[state])
    expect(image).toHaveAttribute('width', '1254')
    expect(image).toHaveAttribute('height', '1254')
    viewport()
    expect(sprite(f.container)).toHaveAttribute('data-guardian-state', state)
    expect(sprite(f.container)).toHaveAttribute('data-guardian-motion', 'off')
  })
  it('anima idle somente visível e limpa os observadores ao desmontar', () => {
    const f = render(<ExperienceProvider><GuardianSprite /></ExperienceProvider>)
    expect(sprite(f.container)).toHaveAttribute('data-guardian-motion', 'off')
    viewport()
    expect(sprite(f.container)).toHaveAttribute('data-guardian-motion', 'on')
    viewport(false)
    expect(sprite(f.container)).toHaveAttribute('data-guardian-motion', 'off')
    f.unmount()
    expect(observers.size).toBe(0)
  })
  it('não ataca ao carregar, executa uma transição e não repete ao voltar à tela', () => {
    const content = (state: GuardianState) => <ExperienceProvider><GuardianSprite state={state} /></ExperienceProvider>
    const f = render(content('attack'))
    viewport()
    expect(sprite(f.container)).toHaveAttribute('data-guardian-motion', 'off')
    f.rerender(content('damage'))
    expect(sprite(f.container)).toHaveAttribute('data-guardian-motion', 'on')
    fireEvent.animationEnd(f.container.querySelector('img')!)
    expect(sprite(f.container)).toHaveAttribute('data-guardian-motion', 'off')
    viewport(false)
    viewport()
    expect(sprite(f.container)).toHaveAttribute('data-guardian-motion', 'off')
    viewport(false)
    f.rerender(content('defeated'))
    viewport()
    expect(sprite(f.container)).toHaveAttribute('data-guardian-motion', 'off')
  })
  it('responde à preferência persistida e à mudança de movimento reduzido, sem perder a pose', () => {
    const media = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    vi.stubGlobal('matchMedia', () => media)
    const f = render(<ExperienceProvider><GuardianSprite /></ExperienceProvider>)
    viewport()
    expect(sprite(f.container)).toHaveAttribute('data-guardian-motion', 'on')
    media.matches = true
    act(() => media.addEventListener.mock.calls[0][1]())
    expect(sprite(f.container)).toHaveAttribute('data-guardian-motion', 'off')
    media.matches = false
    act(() => media.addEventListener.mock.calls[0][1]())
    viewport()
    expect(sprite(f.container)).toHaveAttribute('data-guardian-motion', 'on')
    act(() => {
      localStorage.setItem(EXPERIENCE_KEY, JSON.stringify({ version: 1, preferences: { decorativeMotion: false } }))
      window.dispatchEvent(new StorageEvent('storage', { key: EXPERIENCE_KEY }))
    })
    expect(sprite(f.container)).toHaveAttribute('data-guardian-motion', 'off')
    f.unmount()
    const next = render(<ExperienceProvider><GuardianSprite state="damage" /></ExperienceProvider>)
    viewport()
    expect(sprite(next.container)).toHaveAttribute('data-guardian-state', 'damage')
    expect(sprite(next.container)).toHaveAttribute('data-guardian-motion', 'off')
    expect(media.removeEventListener).toHaveBeenCalled()
  })
  it('mostra a indisponibilidade de uma pose sem substituir pelo mascote ou por outra arte', () => {
    const f = render(<ExperienceProvider><GuardianSprite state="damage" /></ExperienceProvider>)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByText('Guardião indisponível: Dano')).toBeVisible()
    expect(f.container.querySelector('img')).toBeNull()
    expect(f.container.querySelector('svg')).toBeNull()
  })
})

describe('Arena — integração artística sem motor de batalha', () => {
  it('separa cenário, estudante, guardião e interface; mantém o cenário panorâmico original', () => {
    const f = render(<ExperienceProvider><BattleScene dialogue="Bem-vindo à Arena!" /></ExperienceProvider>)
    const background = f.container.querySelector('img[src$="arena-forest-ruins.png"]')!
    expect(background).toHaveAttribute('width', '1536')
    expect(background).toHaveAttribute('height', '418')
    expect(background).toHaveAttribute('alt', '')
    expect(f.container.querySelector('[data-arena-student] img')).toHaveAttribute('src', '/assets/animations/characters/student-full-still.png')
    expect(f.container.querySelector('[data-arena-guardian] img')).toHaveAttribute('src', guardianArtwork.sources.idle)
    expect(f.container.querySelector('img[src*="preview-arena"]')).toBeNull()
    expect(screen.getAllByRole('progressbar')).toHaveLength(2)
    expect(screen.getByRole('status')).toHaveTextContent('Bem-vindo à Arena!')
  })
  it('permite conferir as quatro poses por teclado sem gravar progresso ou recompensas', async () => {
    const user = userEvent.setup()
    const f = render(<MemoryRouter initialEntries={['/arena']}><App /></MemoryRouter>)
    const group = screen.getByRole('group', { name: 'Poses do guardião' })
    const before = JSON.stringify({ ...localStorage })
    for (const [label, hp] of [['Ataque', '100'], ['Dano', '40'], ['Derrota', '0'], ['Em repouso', '100']]) {
      const button = within(group).getByRole('button', { name: label })
      button.focus()
      await user.keyboard('{Enter}')
      expect(button).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('progressbar', { name: 'HP de Guardião da Lógica' })).toHaveAttribute('aria-valuenow', hp)
      expect(screen.getByRole('progressbar', { name: 'HP de Estudante' })).toHaveAttribute('aria-valuenow', '100')
    }
    expect(JSON.stringify({ ...localStorage })).toBe(before)
    expect(screen.getByRole('progressbar', { name: 'Experiência do perfil demonstrativo' })).toHaveAttribute('aria-valuenow', '73')
    expect(f.container.querySelector('form')).toBeNull()
    expect(screen.getByText(/não há batalha em andamento/)).toBeVisible()
  })
  it('reutiliza apenas o som de seleção por ação, sem som ao carregar ou reaplicar a pose', async () => {
    const user = userEvent.setup()
    const service = new SoundService(() => ({ play: async () => {}, stop() {}, dispose() {} }))
    const play = vi.spyOn(service, 'play')
    render(<MemoryRouter initialEntries={['/arena']}><App soundService={service} /></MemoryRouter>)
    expect(play).not.toHaveBeenCalled()
    const group = screen.getByRole('group', { name: 'Poses do guardião' })
    await user.click(within(group).getByRole('button', { name: 'Ataque' }))
    expect(play).toHaveBeenCalledExactlyOnceWith('select')
    await user.click(within(group).getByRole('button', { name: 'Ataque' }))
    expect(play).toHaveBeenCalledTimes(1)
  })
  it('mantém o caminho antigo acessível e permite navegar para Trilhas e Revisão', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/desafios']}><App /></MemoryRouter>)
    expect(await screen.findByRole('heading', { name: 'MathQuest Arena', level: 1 })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Arena' })).toHaveAttribute('aria-current', 'page')
    await user.click(screen.getByRole('link', { name: 'Trilhas' }))
    expect(screen.getByRole('heading', { name: 'Trilha de Matemática Básica', level: 1 })).toBeVisible()
    await user.click(screen.getByRole('link', { name: 'Revisão e Foco' }))
    expect(screen.getByRole('heading', { name: 'Revisão e Foco', level: 1 })).toBeVisible()
    await user.click(screen.getByRole('link', { name: 'Arena' }))
    expect(screen.getByRole('heading', { name: 'MathQuest Arena', level: 1 })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Em repouso' })).toHaveAttribute('aria-pressed', 'true')
  })
  it('comunica falha do cenário sem usar uma imagem substituta', () => {
    const f = render(<ExperienceProvider><ArenaPage /></ExperienceProvider>)
    fireEvent.error(f.container.querySelector('img[src$="arena-forest-ruins.png"]')!)
    expect(screen.getByText('Não foi possível carregar o cenário oficial da Arena.')).toHaveAttribute('role', 'status')
    expect(f.container.querySelector('img[src$="arena-forest-ruins.png"]')).toBeNull()
    expect(f.container.querySelector('img[src*="landscape"]')).toBeNull()
  })
  it('mantém o HP apresentado dentro dos limites sem criar regras de dano', () => {
    const f = render(<ExperienceProvider><BattleHUD participant="student" name="Estudante" level={12} hp={-20} /></ExperienceProvider>)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    f.rerender(<ExperienceProvider><BattleHUD participant="student" name="Estudante" level={12} hp={180} /></ExperienceProvider>)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })
})
