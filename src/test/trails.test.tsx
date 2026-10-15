/*
 * Seleção, bloqueio e acesso aos detalhes são exercitados como ações do usuário.
 *  A arte oficial precisa continuar independente dos pontos e do progresso demonstrativo.
 */

import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../app/App'
import { trailDemoProgress, trailRegions } from '../data/trails'
import { deriveTrail } from '../domain/trails/progress'
import { ExperienceProvider } from '../features/experience/ExperienceProvider'
import { WorldMap } from '../features/trails/WorldMap'
import { EXPERIENCE_KEY } from '../services/experience/PreferencesStore'

beforeEach(() => localStorage.clear())
afterEach(() => { localStorage.clear(); vi.unstubAllGlobals() })
const renderApp = () => render(<MemoryRouter initialEntries={['/trilhas']}><App /></MemoryRouter>)
const selectRegion = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name} —`) })

describe('Trilhas — mapa oficial e prévias', () => {
  it('carrega o mapa oficial, apresenta seis regiões e não altera o progresso do Dashboard', async () => {
    const user = userEvent.setup()
    const f = renderApp()
    expect(f.container.querySelector('img[src="/assets/maps/mathquest-world.png"]')).toHaveAttribute('width', '1672')
    expect(screen.getByRole('list', { name: 'Regiões da trilha' }).children).toHaveLength(6)
    expect(screen.getByRole('progressbar', { name: 'Progresso demonstrativo da trilha' })).toHaveAttribute('aria-valuenow', '38')
    expect(selectRegion('Floresta das Frações')).toHaveAttribute('aria-current', 'step')
    expect(f.container.querySelector('[data-map-character]')).toHaveAttribute('data-map-character', 'floresta')
    expect(f.container.querySelector('[data-map-character] img')).toHaveAttribute('src', '/assets/animations/characters/student-full-still.png')
    await user.click(screen.getByRole('link', { name: /Voltar ao início/ }))
    expect(screen.getByRole('progressbar', { name: 'Progresso da trilha' })).toHaveAttribute('aria-valuenow', '28')
    expect(screen.getByRole('progressbar', { name: 'Experiência até o próximo nível' })).toHaveAttribute('aria-valuenow', '73')
  })
  it('permite selecionar bloqueadas e explica o requisito, sem habilitar prévias restritas', async () => {
    const user = userEvent.setup()
    const f = renderApp()
    await user.click(selectRegion('Montanha das Porcentagens'))
    const details = screen.getByRole('region', { name: 'Detalhes da região selecionada' })
    expect(within(details).getByRole('heading', { name: 'Montanha das Porcentagens' })).toBeVisible()
    expect(within(details).getByText(/Conclua “Desafio da região: razão e proporção”, em Ponte da Proporção/)).toBeVisible()
    expect(within(details).getByRole('button', { name: 'Região bloqueada' })).toBeDisabled()
    for (const button of within(details).getAllByRole('button', { name: /Ver prévia de/ })) {
      expect(button).toBeDisabled()
      fireEvent.click(button)
    }
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(f.container.querySelector('[data-map-character]')).toHaveAttribute('data-map-character', 'floresta')
    expect(selectRegion('Floresta das Frações')).toHaveAttribute('aria-current', 'step')
    expect(selectRegion('Montanha das Porcentagens')).toHaveAttribute('aria-pressed', 'true')
  })
  it('abre uma prévia honesta por teclado, restaura foco e não registra conclusão nem XP', async () => {
    const user = userEvent.setup()
    renderApp()
    selectRegion('Ponte da Proporção').focus()
    await user.keyboard('{Enter}')
    const details = screen.getByRole('region', { name: 'Detalhes da região selecionada' })
    const trigger = within(details).getByRole('button', { name: 'Explorar região' })
    trigger.focus()
    const snapshot = JSON.stringify({ ...localStorage })
    await user.keyboard('{Enter}')
    const dialog = screen.getByRole('dialog', { name: 'Prévia: Primeiros passos: razão e proporção' })
    expect(within(dialog).getByText('Conteúdo em preparação')).toBeVisible()
    expect(within(dialog).getByText('Reconhecer uma razão entre duas quantidades.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Fechar diálogo' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
    expect(JSON.stringify({ ...localStorage })).toBe(snapshot)
    expect(screen.getByRole('progressbar', { name: 'Progresso demonstrativo da trilha' })).toHaveAttribute('aria-valuenow', '38')
  })
  it('separa atividades disponíveis e bloqueadas dentro da região atual e permite revisitar perfeitas', async () => {
    const user = userEvent.setup()
    renderApp()
    const details = screen.getByRole('region', { name: 'Detalhes da região selecionada' })
    expect(within(details).getByRole('button', { name: 'Ver prévia de Hora de lembrar: frações' })).toBeEnabled()
    expect(within(details).getByRole('button', { name: 'Ver prévia de Desafio da região: frações' })).toBeDisabled()
    await user.click(selectRegion('Campo dos Números'))
    await user.click(within(details).getByRole('button', { name: 'Revisitar região' }))
    expect(screen.getByRole('dialog', { name: 'Prévia: Primeiros passos: números naturais' })).toBeVisible()
  })
  it('usa estático e bloqueia animações sob preferência do sistema ou Modo Foco', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const f = renderApp()
    expect(f.container.querySelector('[data-decorative-motion]')).toHaveAttribute('data-decorative-motion', 'off')
    expect(f.container.querySelector('[data-map-character] [data-student-state]')).toHaveAttribute('data-student-state', 'static')
    f.unmount()
    vi.unstubAllGlobals()
    const trail = deriveTrail(trailRegions, trailDemoProgress)
    const next = render(<ExperienceProvider focusRunning><WorldMap regions={trail.regions} selectedId="floresta" currentRegionId="floresta" onSelect={() => {}} /></ExperienceProvider>)
    expect(next.container.querySelector('[data-decorative-motion]')).toHaveAttribute('data-decorative-motion', 'off')
    expect(next.container.querySelector('[data-map-character] [data-student-state]')).toHaveAttribute('data-student-state', 'static')
    expect(localStorage.getItem(EXPERIENCE_KEY)).toBeNull()
  })
})

describe('WorldMap — arte e navegação', () => {
  const trail = deriveTrail(trailRegions, trailDemoProgress)
  const content = (artwork?: { src: string; width: number; height: number } | null) =>
    <ExperienceProvider><WorldMap regions={trail.regions} selectedId="floresta" currentRegionId="floresta" onSelect={() => {}} artwork={artwork} /></ExperienceProvider>
  it('não usa outro cenário quando o arquivo está ausente ou falha', () => {
    const f = render(content(null))
    expect(screen.getByRole('status')).toHaveTextContent('O mapa oficial ainda não foi adicionado.')
    expect(f.container.querySelector('img[src*="landscape"]')).toBeNull()
    expect(screen.getByRole('list', { name: 'Regiões da trilha' }).children).toHaveLength(6)
    f.rerender(content())
    fireEvent.error(f.container.querySelector('img[src="/assets/maps/mathquest-world.png"]')!)
    expect(screen.getByRole('status')).toHaveTextContent('Não foi possível carregar o mapa oficial.')
    expect(f.container.querySelector('img[src="/assets/maps/mathquest-world.png"]')).toBeNull()
    expect(f.container.querySelector('img[src*="landscape"]')).toBeNull()
  })
  it('mantém a proporção real da imagem sem recorte', () => {
    const f = render(content())
    const image = f.container.querySelector('img[src="/assets/maps/mathquest-world.png"]')!
    Object.defineProperties(image, { naturalWidth: { value: 1672 }, naturalHeight: { value: 941 } })
    fireEvent.load(image)
    expect(image.parentElement).toHaveStyle({ aspectRatio: '1672 / 941' })
  })
  it('permite deslocamento por teclado sem interceptar as teclas dos pontos', () => {
    render(content())
    const area = screen.getByRole('group', { name: 'Área explorável do mapa' })
    fireEvent.keyDown(area, { key: 'ArrowRight' })
    expect(area.scrollLeft).toBe(240)
    fireEvent.keyDown(selectRegion('Campo dos Números'), { key: 'ArrowRight' })
    expect(area.scrollLeft).toBe(240)
    fireEvent.keyDown(area, { key: 'ArrowLeft' })
    expect(area.scrollLeft).toBe(0)
  })
})
