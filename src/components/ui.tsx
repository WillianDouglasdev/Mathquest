/**
 * Estas são as peças compartilhadas da interface. A intenção é manter a mesma
 * linguagem visual nos cards, botões, barras e diálogos, sem copiar estilos em
 * cada página. Mudanças aqui alcançam boa parte da aplicação.
 *
 * Os ícones vêm de recortes do atlas aprovado. O estudante tem um componente próprio,
 * pois seus formatos e animações não devem voltar a usar o sprite antigo do atlas.
 * Texto e informações funcionais continuam em HTML, inclusive quando a decoração
 * ao redor usa pixel art.
 */

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import styles from './ui.module.css'
import type { SoundEvent } from '../services/experience/SoundService'

export type IconName =
  | 'slime'
  | 'book'
  | 'trophy'
  | 'home'
  | 'star'
  | 'chart'
  | 'cards'
  | 'target'
  | 'fire'
  | 'flag'
  | 'lock'
  | 'bell'
  | 'shield'
  | 'coin'
  | 'mountain'
// O espaço do estudante antigo fica reservado para não deslocar os ícones do atlas.
// Novos usos do personagem passam pelo StudentAvatar e suas variantes aprovadas.
const icons: (IconName | 'student')[] = [
  'student',
  'slime',
  'book',
  'trophy',
  'home',
  'star',
  'chart',
  'cards',
  'target',
  'fire',
  'flag',
  'lock',
  'bell',
  'shield',
  'coin',
  'mountain',
]
const regions = [
  [35, 10, 250, 365],
  [325, 100, 280, 270],
  [625, 130, 300, 235],
  [960, 55, 275, 305],
  [10, 380, 300, 275],
  [335, 395, 275, 260],
  [630, 400, 290, 260],
  [950, 395, 290, 270],
  [15, 670, 290, 280],
  [330, 660, 280, 295],
  [645, 675, 290, 280],
  [975, 670, 250, 285],
  [25, 970, 270, 265],
  [335, 955, 280, 280],
  [635, 970, 275, 265],
  [940, 955, 305, 280],
]

export function PixelArt({
  name,
  size = 32,
  className = '',
  label,
}: {
  name: IconName
  size?: number
  className?: string
  label?: string
}) {
  const [failed, setFailed] = useState(false)
  const index = icons.indexOf(name)
  return (
    <span
      className={`${styles.art} ${className} ${name === 'slime' ? 'mq-mascot' : name === 'flag' ? 'mq-flag' : name === 'trophy' || name === 'star' ? 'mq-trophy mq-reward' : name === 'fire' ? 'mq-reward' : ''}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: size, height: size }}
    >
      {!failed && (
        <svg
          viewBox={regions[index].join(' ')}
          width="100%"
          height="100%"
          aria-hidden="true"
          focusable="false"
        >
          <image
            href="/assets/sprites.png"
            width="1254"
            height="1254"
            onError={() => setFailed(true)}
          />
        </svg>
      )}
      {failed && (
        <span className={styles.assetFallback}>Asset {name} pendente</span>
      )}
    </span>
  )
}

export function Arrow({
  direction = 'right',
}: {
  direction?: 'right' | 'down'
}) {
  return (
    <span
      aria-hidden="true"
      className={direction === 'down' ? styles.down : styles.arrow}
    >
      {direction === 'down' ? '⌄' : '→'}
    </span>
  )
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  sound = true,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'blue' | 'quiet'
  children: ReactNode
  sound?: boolean | SoundEvent
}) {
  return (
    <button
      {...props}
      data-ui-sound={typeof sound === 'string' ? sound : sound && variant !== 'quiet' ? 'primary' : undefined}
      className={`${styles.button} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Card({
  children,
  className = '',
  id,
  label,
}: {
  children: ReactNode
  className?: string
  id?: string
  label: string
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className={`${styles.card} ${className}`}
    >
      {children}
    </section>
  )
}

export function ProgressBar({
  value,
  label,
  className = '',
}: {
  value: number
  label: string
  className?: string
}) {
  const safeValue = Math.min(100, Math.max(0, value))
  return (
    <div
      className={`${styles.progress} mq-progress ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <span style={{ width: `${safeValue}%` }} />
    </div>
  )
}

export function Badge({
  children,
  gold = false,
}: {
  children: ReactNode
  gold?: boolean
}) {
  return (
    <span className={`${styles.badge} ${gold ? styles.gold : ''}`}>
      {children}
    </span>
  )
}

export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const panel = useRef<HTMLDivElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    close.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])
  return (
    <div
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panel}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose()
          if (event.key === 'Tab') {
            const elements = panel.current?.querySelectorAll<HTMLElement>(
              'button, a[href], input, [tabindex="0"]',
            )
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
        <div className={styles.dialogHeading}>
          <h2 id="dialog-title">{title}</h2>
          <button
            ref={close}
            className={styles.close}
            onClick={onClose}
            aria-label="Fechar diálogo"
            data-ui-sound="close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
