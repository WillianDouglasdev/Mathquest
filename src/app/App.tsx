/**
 * A estrutura geral fica reunida aqui: navegação, cabeçalho, rotas e diálogos.
 * Os providers envolvem as páginas para que trocar de tela não recrie o Pomodoro,
 * o player ou as preferências do estudante.
 *
 * Há uma separação importante no MVP: perfil, ranking e conquistas são demonstrações
 * visuais; o tempo de foco e as revisões têm registros locais reais. Uma interação
 * de prévia não deve se transformar, por acaso, em XP ou progresso confirmado.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { Arrow, Badge, Dialog, PixelArt, ProgressBar, type IconName } from '../components/ui'
import { StudentAvatar } from '../components/StudentAvatar'
import { findShortcuts, formatNumber, profile, ranking } from '../data/demo'
import { Dashboard } from '../features/dashboard/Dashboard'
import { TrailsPage } from '../features/trails/TrailsPage'
import { ArenaPage } from '../features/arena/ArenaPage'
import styles from './App.module.css'
import { FocusProvider } from '../features/focus/FocusProvider'
import { FocusPage } from '../features/focus/FocusPage'
import type { FocusStore } from '../services/focus/FocusStore'
import { ExperienceRoot } from '../features/experience/ExperienceRoot'
import { ExperienceControls, SoundSettingsShortcut } from '../features/experience/ExperienceControls'
import { RadioProvider } from '../features/experience/RadioProvider'
import type { RadioStore } from '../services/experience/RadioStore'
import { SoundProvider } from '../features/experience/SoundProvider'
import type { SoundService } from '../services/experience/SoundService'

type Modal = { title: string; content: ReactNode } | null
export type OpenModal = (title: string, content: ReactNode) => void

export function App({ focusStore, radioStore, soundService }: { focusStore?: FocusStore; radioStore?: RadioStore; soundService?: SoundService } = {}) {
  const [modal, setModal] = useState<Modal>(null)
  const openModal: OpenModal = (title, content) => setModal({ title, content })
  return (
    <FocusProvider providedStore={focusStore}>
      <ExperienceRoot>
        <RadioProvider providedStore={radioStore}>
          <SoundProvider providedService={soundService}>
      <Routes>
        <Route element={<AppShell openModal={openModal} />}>
          <Route index element={<Dashboard openModal={openModal} />} />
          <Route
            path="trilhas"
            element={<TrailsPage />}
          />
          <Route
            path="trilhas/:modulo/:licao"
            element={<FuturePage title="Uma nova lição vem aí" />}
          />
          <Route
            path="desafios"
            // Manter o endereço antigo útil evita quebrar favoritos já salvos.
            element={<Navigate to="/arena" replace />}
          />
          <Route path="arena" element={<ArenaPage />} />
          <Route path="revisao" element={<FocusPage />} />
          <Route
            path="*"
            element={
              <FuturePage
                title="Você encontrou um caminho inexplorado"
                notFound
              />
            }
          />
        </Route>
      </Routes>
      {modal && (
        <Dialog title={modal.title} onClose={() => setModal(null)}>
          {modal.content}
        </Dialog>
      )}
          </SoundProvider>
        </RadioProvider>
      </ExperienceRoot>
    </FocusProvider>
  )
}

function AppShell({ openModal }: { openModal: OpenModal }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const sidebar = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!menuOpen) return
    // No mobile, o menu assume o foco temporariamente. Ao fechar, a pessoa volta
    // ao controle de origem, sem perder seu lugar na navegação por teclado.
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    sidebar.current?.querySelector<HTMLElement>('a,button')?.focus()
    return () => {
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [menuOpen])
  const location = useLocation()
  const nav: {
    label: string
    icon: IconName
    to?: string
    action?: () => void
  }[] = [
    { label: 'Início', icon: 'home', to: '/' },
    { label: 'Trilhas', icon: 'book', to: '/trilhas' },
    { label: 'Arena', icon: 'trophy', to: '/arena' },
    { label: 'Revisão e Foco', icon: 'cards', to: '/revisao' },
    {
      label: 'Conquistas',
      icon: 'star',
      action: () =>
        openModal(
          'Seu mural de conquistas',
          <>
            <p>Uma pequena vitória por vez, uma grande jornada pela frente.</p>
            <div className={styles.achievement}>
              <PixelArt name="star" size={64} />
              <div>
                <strong>Primeiros passos</strong>
                <p>Conquista ilustrativa do perfil demonstrativo.</p>
              </div>
            </div>
            <div className={styles.achievement}>
              <PixelArt name="shield" size={64} />
              <div>
                <strong>Escudo da constância</strong>
                <p>
                  Prévia: estude por 7 dias consecutivos para conquistar seu
                  escudo.
                </p>
              </div>
            </div>
            <Badge>Prévia demonstrativa</Badge>
          </>,
        ),
    },
    {
      label: 'Ranking',
      icon: 'chart',
      action: () =>
        openModal(
          'Ranking semanal',
          <>
            <p>
              Classificação fictícia para demonstrar a interface. Não há
              competição real nesta entrega.
            </p>
            <RankingList />
            <Badge>Dados demonstrativos</Badge>
          </>,
        ),
    },
  ]
  const showProfile = () =>
    openModal(
      'Seu perfil de aventureiro',
      <>
        <div className={styles.profilePreview}>
          <StudentAvatar variant="full" size={100} />
          <div>
            <h3>{profile.name}</h3>
            <p>
              Nível {profile.level} · {profile.xp} /{' '}
              {formatNumber(profile.nextLevelXp)} XP
            </p>
            <Badge>Perfil demonstrativo</Badge>
          </div>
        </div>
        <p>
          Você está explorando a primeira versão visual da MathQuest. Os números
          são fictícios e não mudam ao clicar.
        </p>
        <p>
          O progresso local, a exportação e a importação serão adicionados na
          fase de aprendizagem.
        </p>
      </>,
    )
  return (
    <div className={styles.shell}>
      <a href="#conteudo" className={styles.skip}>
        Pular para o conteúdo
      </a>
      {menuOpen && (
        <button
          tabIndex={-1}
          className={styles.menuBackdrop}
          aria-label="Fechar navegação"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        ref={sidebar}
        id="navegacao"
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setMenuOpen(false)
          if (menuOpen && event.key === 'Tab') {
            const elements =
              sidebar.current?.querySelectorAll<HTMLElement>('a,button')
            if (!elements?.length) return
            const first = elements[0],
              last = elements[elements.length - 1]
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault()
              last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault()
              first.focus()
            }
          }
        }}
      >
        <Link
          to="/"
          className={styles.logo}
          aria-label="MathQuest — início"
          data-ui-sound="navigate"
          onClick={() => setMenuOpen(false)}
        >
          <PixelArt name="mountain" size={68} />
          <span>
            Math<span>Quest</span>
          </span>
        </Link>
        <div className={styles.navLabel}>SUA AVENTURA</div>
        <nav aria-label="Navegação principal" className={styles.nav}>
          {nav.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/'}
                data-ui-sound="navigate"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <PixelArt name={item.icon} size={38} />
                <span>{item.label}</span>
              </NavLink>
            ) : (
              <button
                key={item.label}
                className={styles.navItem}
                data-ui-sound="open"
                onClick={() => {
                  setMenuOpen(false)
                  item.action?.()
                }}
              >
                <PixelArt name={item.icon} size={38} />
                <span>{item.label}</span>
              </button>
            ),
          )}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.quote}>
            Pequenos passos.
            <br />
            <strong>Grandes conquistas.</strong>
            <span>Uma aventura por dia.</span>
          </div>
          <div className={styles.sideLandscape} aria-hidden="true">
            <div className={`mq-clouds mq-clouds--sidebar ${styles.sideClouds}`} />
          </div>
        </div>
        <section className={styles.sidebarProfile} aria-label="Perfil do estudante">
          <button
            className={styles.profileAccess}
            aria-label={`Abrir perfil de ${profile.name}, nível ${profile.level}`}
            data-ui-sound="open"
            onClick={() => {
              setMenuOpen(false)
              showProfile()
            }}
          >
            <StudentAvatar
              variant="full"
              size={128}
              className={styles.profileStudent}
              motion="idle"
              focusSensitive={location.pathname === '/revisao'}
            />
            <span className={styles.profileInfo}>
              <small>Perfil demo</small>
              <strong>{profile.name}</strong>
              <span className={styles.profileLevel}>Nível {profile.level}</span>
              <span className={styles.profileLink}>Ver perfil <Arrow /></span>
            </span>
          </button>
          <div className={styles.profileXp}>
            <span>{formatNumber(profile.xp)} / {formatNumber(profile.nextLevelXp)} XP</span>
            <ProgressBar value={(profile.xp / profile.nextLevelXp) * 100} label="Experiência do perfil demonstrativo" className="mq-progress--static" />
          </div>
        </section>
      </aside>
      <div className={styles.main} inert={menuOpen}>
        <header className={styles.header}>
          <div className="mq-clouds" aria-hidden="true" />
          <button
            className={styles.menuButton}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="navegacao"
            data-ui-sound={menuOpen ? 'close' : 'open'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
          <div className={styles.breadcrumb}>
            Seu mundo de possibilidades <span>/</span>{' '}
            <strong>
              {location.pathname === '/'
                ? 'Início'
                : location.pathname === '/revisao'
                  ? 'Revisão e Foco'
                  : location.pathname === '/trilhas'
                    ? 'Trilhas'
                  : location.pathname === '/arena'
                    ? 'Arena'
                  : 'Explorar'}
            </strong>
          </div>
          <div className={styles.headerActions}>
            <Badge>VERSÃO DEMO</Badge>
            <SoundSettingsShortcut />
            <button
              className={styles.notifications}
              aria-label="Notificações, 1 novidade"
              data-ui-sound="open"
              onClick={() =>
                openModal(
                  'Novidades da sua aventura',
                  <>
                    <PixelArt name="bell" size={56} />
                    <h3>Bem-vindo à MathQuest!</h3>
                    <p>
                      Sua primeira aventura começa aqui. Explore o Dashboard e
                      descubra o que estamos preparando.
                    </p>
                    <Badge>Fundação visual · primeira entrega</Badge>
                  </>,
                )
              }
            >
              <PixelArt name="bell" size={29} />
              <span />
            </button>
            <button
              className={styles.profileButton}
              aria-label="Abrir perfil demonstrativo"
              data-ui-sound="open"
              onClick={showProfile}
            >
              <span className={styles.avatar}>
                <StudentAvatar variant="navigation" size={32} />
              </span>
              <Arrow direction="down" />
            </button>
          </div>
        </header>
        <main id="conteudo" tabIndex={-1} className={styles.content}>
          <ExperienceControls />
          <Outlet />
        </main>
        <footer className={styles.footer}>
          <span>
            MathQuest <span>·</span> Aprender também é uma aventura.
          </span>
          <span>
            {location.pathname === '/revisao'
              ? 'Foco real · Salvo neste navegador'
              : 'Perfil e ranking demonstrativos'}
          </span>
        </footer>
      </div>
    </div>
  )
}

export function RankingList() {
  return (
    <ol className={styles.rankingList}>
      {ranking.map((person, index) => (
        <li
          key={person.name}
          className={person.name === 'Você' ? styles.you : ''}
        >
          <span className={`${styles.position} ${styles[`position${index}`]}`}>
            {index + 1}
          </span>
          <span className={`${styles.miniAvatar} ${styles[person.color]}`}>
            <StudentAvatar variant="ranking" size={26} />
          </span>
          <strong>{person.name}</strong>
          <span>
            {formatNumber(person.xp)} <small>XP</small>
          </span>
        </li>
      ))}
    </ol>
  )
}

export function Search() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const results = findShortcuts(query)
  return (
    <div
      className={styles.search}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setOpen(false)
      }}
    >
      <span className={styles.searchGlyph} aria-hidden="true" />
      <label className="srOnly" htmlFor="dashboard-search">
        Buscar no Dashboard
      </label>
      <input
        id="dashboard-search"
        type="search"
        value={query}
        placeholder="Buscar trilha, missão ou desafio…"
        autoComplete="off"
        aria-controls={open && query.trim() ? 'search-results' : undefined}
        aria-expanded={open && !!query.trim()}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
      />
      {open && query.trim() && (
        <div id="search-results" className={styles.searchResults}>
          <span role="status">
            {results.length
              ? `${results.length} atalho${results.length > 1 ? 's' : ''} no Dashboard`
              : 'Nenhum atalho encontrado. Tente “frações” ou “missão”.'}
          </span>
          {results.map((result) => (
            <a
              key={result.target}
              href={`/#${result.target}`}
              onClick={() => {
                setOpen(false)
                setQuery('')
                document
                  .getElementById(result.target)
                  ?.scrollIntoView({ block: 'center' })
              }}
            >
              <strong>{result.title}</strong>
              <small>{result.detail}</small>
              <Arrow />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function FuturePage({
  title,
  notFound = false,
}: {
  title: string
  notFound?: boolean
}) {
  return (
    <div className={styles.future}>
      <PixelArt name={notFound ? 'flag' : 'book'} size={110} />
      <Badge>{notFound ? 'Caminho não encontrado' : 'Próxima fase'}</Badge>
      <h1>{title}</h1>
      <p>
        {notFound
          ? 'Este endereço não faz parte do mapa. Volte ao início para continuar explorando.'
          : 'Esta primeira entrega apresenta a identidade visual e o Dashboard. O conteúdo interativo será desenvolvido após a revisão desta página.'}
      </p>
      <Link to="/" className={styles.returnLink}>
        Voltar ao início <Arrow />
      </Link>
    </div>
  )
}
