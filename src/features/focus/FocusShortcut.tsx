/**
 * O atalho do Dashboard lê a sessão compartilhada para mostrar o tempo restante.
 * Ele só navega até o Pomodoro: retomar a página não significa retomar a contagem.
 * Se a sessão estiver pausada, a decisão de continuar permanece com o estudante.
 */

import { Link } from 'react-router-dom'
import { isActive, remainingMs } from '../../domain/focus/engine'
import { useFocus } from './FocusProvider'
import { formatTimer } from './format'
import styles from './FocusPage.module.css'

export function FocusShortcut() {
  const { state } = useFocus()
  const active = isActive(state.current)
  return (
    <Link className={styles.shortcut} to="/revisao#pomodoro" data-ui-sound="navigate">
      <span className={styles.shortcutIcon} aria-hidden="true" />
      <span>
        <strong>{active ? 'Retomar foco' : 'Estudar com Pomodoro'}</strong>
        <small>
          {active
            ? `${formatTimer(remainingMs(state))} restantes · ${state.current?.status === 'paused' ? 'em pausa' : 'em andamento'}`
            : '15, 25 ou 50 minutos. Um passo de cada vez.'}
        </small>
      </span>
      <span aria-hidden="true">→</span>
    </Link>
  )
}
