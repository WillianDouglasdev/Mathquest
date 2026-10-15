/*
 * Os cenários conferem os dados demonstrativos e os caminhos de navegação.
 *  Abrir uma prévia não deve ser interpretado como concluir estudo ou ganhar XP.
 */

import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../app/App'
import { findShortcuts, profile } from '../data/demo'

const renderApp = (route = '/') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )

describe('Dashboard demonstrativo', () => {
  it('usa os formatos aprovados em Dashboard, navegação, perfil e ranking', async () => {
    const user = userEvent.setup()
    renderApp()

    const full = screen.getByRole('main').querySelector('img')
    expect(full).toHaveAttribute('src', '/assets/animations/characters/student-full-still.png')
    expect(full).toHaveAttribute('width', '192')
    expect(full).toHaveAttribute('height', '280')

    const sidebar = screen.getByRole('complementary')
    const sidebarProfile = within(sidebar).getByRole('button', { name: /Estudante/ })
    expect(sidebarProfile.querySelector('img')).toHaveAttribute(
      'src', '/assets/animations/characters/student-full-still.png',
    )
    const headerProfile = screen.getByRole('button', { name: 'Abrir perfil demonstrativo' })
    expect(headerProfile.querySelector('img')).toHaveAttribute(
      'src', '/assets/animations/characters/student-portrait-still.png',
    )

    const ranking = screen.getByRole('region', { name: 'Ranking semanal demonstrativo' })
    const avatars = ranking.querySelectorAll('img')
    expect(avatars).toHaveLength(5)
    for (const avatar of avatars) {
      expect(avatar).toHaveAttribute('src', '/assets/animations/characters/student-avatar-still.png')
      expect(avatar).toHaveAttribute('width', '96')
      expect(avatar).toHaveAttribute('height', '96')
    }

    await user.click(sidebarProfile)
    expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute(
      'src', '/assets/animations/characters/student-full-still.png',
    )
  })

  it('mostra XP coerente no perfil da sidebar e mantém acesso pelo teclado', async () => {
    const user = userEvent.setup()
    renderApp()
    const sidebarProfile = screen.getByRole('region', { name: 'Perfil do estudante' })
    expect(within(sidebarProfile).getByText('730 / 1.000 XP')).toBeVisible()
    expect(within(sidebarProfile).getByRole('progressbar', { name: 'Experiência do perfil demonstrativo' }))
      .toHaveAttribute('aria-valuenow', String(profile.xp / profile.nextLevelXp * 100))
    const trigger = within(sidebarProfile).getByRole('button', { name: 'Abrir perfil de Estudante, nível 12' })
    trigger.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('dialog', { name: 'Seu perfil de aventureiro' })).toBeVisible()
    await user.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
  })

  it('apresenta os dados coerentes e informa que o ranking é demonstrativo', () => {
    renderApp()
    expect(
      screen.getByRole('heading', { name: 'Olá, Estudante!' }),
    ).toBeVisible()
    expect(
      screen.getByRole('progressbar', { name: 'Progresso da trilha' }),
    ).toHaveAttribute(
      'aria-valuenow',
      String(
        Math.round((profile.completedLessons / profile.totalLessons) * 100),
      ),
    )
    expect(
      screen.getByRole('progressbar', {
        name: 'Experiência até o próximo nível',
      }),
    ).toHaveAttribute('aria-valuenow', '73')
    expect(screen.getByText('CLASSIFICAÇÃO DEMONSTRATIVA')).toBeVisible()
  })

  it('busca sem acentos e apresenta um estado vazio sem fabricar resultados', async () => {
    const user = userEvent.setup()
    renderApp()
    const search = screen.getByRole('searchbox', {
      name: 'Buscar no Dashboard',
    })
    await user.type(search, 'fracoes')
    expect(
      screen.getByRole('link', { name: /Comparando frações/ }),
    ).toHaveAttribute('href', '/#desafio')
    await user.clear(search)
    await user.type(search, 'inexistente')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhum atalho encontrado',
    )
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('informa a próxima fase ao iniciar a missão sem conceder XP fictício', async () => {
    const user = userEvent.setup()
    renderApp()
    const trigger = screen.getByRole('button', { name: /Continuar missão/ })
    await user.click(trigger)
    const dialog = screen.getByRole('dialog', {
      name: 'Sua missão: praticar frações',
    })
    expect(within(dialog).getByText('Disponível na próxima fase')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Fechar diálogo' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(
      screen.getByRole('progressbar', {
        name: 'Experiência até o próximo nível',
      }),
    ).toHaveAttribute('aria-valuenow', '73')
  })

  it('retém foco no diálogo e permite fechar pelo teclado', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(
      screen.getByRole('button', { name: 'Abrir perfil demonstrativo' }),
    )
    const close = screen.getByRole('button', { name: 'Fechar diálogo' })
    await user.tab()
    expect(close).toHaveFocus()
    await user.tab({ shift: true })
    expect(close).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('direciona a trilha ao mapa demonstrativo e permite voltar', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('link', { name: /Ver trilha/ }))
    expect(
      screen.getByRole('heading', { name: 'Trilha de Matemática Básica' }),
    ).toBeVisible()
    await user.click(screen.getByRole('link', { name: /Voltar ao início/ }))
    expect(
      screen.getByRole('heading', { name: 'Olá, Estudante!' }),
    ).toBeVisible()
  })

  it('trata endereços desconhecidos', () => {
    renderApp('/caminho-inexistente')
    expect(screen.getByText('Caminho não encontrado')).toBeVisible()
    expect(
      screen.getByRole('link', { name: /Voltar ao início/ }),
    ).toHaveAttribute('href', '/')
  })
})

describe('atalhos', () => {
  it('normaliza caixa, acentuação e espaços e ignora consulta vazia', () => {
    expect(findShortcuts('  MATEMATICA  ')).toHaveLength(1)
    expect(findShortcuts('missao')[0].target).toBe('missao')
    expect(findShortcuts('   ')).toEqual([])
  })
})
