/**
 * Um único componente cuida da identidade do estudante em todos os contextos.
 * Corpo inteiro, retrato e avatar pequeno têm arquivos próprios, mas representam
 * o mesmo personagem aprovado. A proporção da imagem é preservada pelo CSS.
 *
 * Animação não é sinônimo de estado: o personagem pode estar presente e estático.
 * Preferências, Modo Foco, visibilidade e o limite compartilhado decidem se o WebP
 * pode entrar em cena. Comemorações precisam de um evento novo; não devem reaparecer
 * só porque o usuário voltou à página ou reabriu uma sessão.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import styles from './StudentAvatar.module.css'
import { useStudentAnimationPolicy } from '../features/experience/ExperienceProvider'
import { characterMotionSlots } from '../services/experience/CharacterMotionSlots'
import { useCharacterVisibility } from './useCharacterVisibility'

// Approved variants share one identity; each crop serves its own display size.
export const studentAssets = {
  full: {
    src: '/assets/characters/student-v2-full.png',
    width: 1024,
    height: 1536,
    defaultSize: 88,
  },
  navigation: {
    src: '/assets/characters/student-v2-navigation.png',
    width: 1254,
    height: 1254,
    defaultSize: 40,
  },
  ranking: {
    src: '/assets/characters/student-v2-ranking.png',
    width: 1254,
    height: 1254,
    defaultSize: 30,
  },
} as const

type StudentVariant = keyof typeof studentAssets
export const studentAnimationAssets = {
  full: { still: '/assets/animations/characters/student-full-still.png', idle: '/assets/animations/characters/student-full-idle.webp', celebrate: '/assets/animations/characters/student-full-celebrate.webp', width: 192, height: 280 },
  navigation: { still: '/assets/animations/characters/student-portrait-still.png', idle: '/assets/animations/characters/student-portrait-idle.webp', width: 192, height: 192 },
  ranking: { still: '/assets/animations/characters/student-avatar-still.png', width: 96, height: 96 },
} as const
export type StudentCelebration = { id: string; type: 'mission-completed' | 'challenge-correct' }
export const STUDENT_CELEBRATION_MS = 1000

export function StudentAvatar({
  variant = 'full',
  size,
  label,
  className = '',
  motion = 'static',
  focusSensitive = false,
  celebration,
}: {
  variant?: StudentVariant
  size?: number
  label?: string
  className?: string
  motion?: 'static' | 'idle'
  focusSensitive?: boolean
  celebration?: StudentCelebration
}) {
  const asset = studentAssets[variant]
  const animation = studentAnimationAssets[variant]
  const displaySize = size ?? asset.defaultSize
  const element = useRef<HTMLSpanElement>(null)
  const allowed = useStudentAnimationPolicy(focusSensitive)
  const visible = useCharacterVisibility(element, allowed && (motion === 'idle' || Boolean(celebration)))
  const [slot] = useState(() => Symbol('student'))
  const hasSlot = useSyncExternalStore(characterMotionSlots.subscribe, () => characterMotionSlots.has(slot))
  const [celebrating, setCelebrating] = useState<string | null>(null)
  const seen = useRef(new Set(celebration ? [celebration.id] : []))
  // O evento que já veio na montagem é tratado como conhecido. Isso impede que
  // retornar à página transforme uma conquista antiga em nova comemoração.
  const [failed, setFailed] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (!celebration?.id || seen.current.has(celebration.id)) return
    if (celebration.type !== 'mission-completed' && celebration.type !== 'challenge-correct') return
    if (seen.current.size >= 1000) seen.current.delete(seen.current.values().next().value!)
    seen.current.add(celebration.id)
    // Consume, but never queue/replay an event while hidden or movement is off.
    if (variant === 'full' && allowed && visible) setCelebrating(celebration.id)
  }, [celebration?.id, celebration?.type, allowed, visible, variant])
  useEffect(() => {
    if (!celebrating) return
    if (!allowed || !visible) { setCelebrating(null); return }
    const timeout = window.setTimeout(() => setCelebrating(null), STUDENT_CELEBRATION_MS)
    return () => window.clearTimeout(timeout)
  }, [celebrating, allowed, visible])
  const motionSrc = celebrating && 'celebrate' in animation ? animation.celebrate : motion === 'idle' && 'idle' in animation ? animation.idle : undefined
  const wantsMotion = allowed && visible && Boolean(motionSrc && !failed.has(motionSrc))
  useEffect(() => {
    if (!wantsMotion) return
    return characterMotionSlots.acquire(slot, celebrating ? 100 : variant === 'full' ? 20 : 10)
  }, [slot, wantsMotion, celebrating, variant])

  const desired = hasSlot && wantsMotion && motionSrc ? motionSrc : animation.still
  const src = !failed.has(desired) ? desired : !failed.has(animation.still) ? animation.still : asset.src
  const legacy = src === asset.src
  // O fallback usa apenas variantes já aprovadas. A falha de um WebP não autoriza
  // buscar outro personagem ou voltar ao estudante antigo do atlas.
  const state = src.endsWith('-celebrate.webp') ? 'celebrate' : src.endsWith('-idle.webp') ? 'idle' : 'static'

  return (
    <span
      ref={element}
      className={`${styles.avatar} ${className}`}
      style={{ width: displaySize, height: displaySize }}
      aria-hidden={label ? undefined : true}
      data-student-variant={variant}
      data-student-state={state}
    >
      {!failed.has(src) ? (
      <img
        key={state === 'celebrate' ? celebrating : state}
        src={src}
        width={legacy ? asset.width : animation.width}
        height={legacy ? asset.height : animation.height}
        alt={label ?? ''}
        draggable={false}
        decoding="async"
        loading="lazy"
        onError={() => setFailed(previous => new Set([...previous, src]))}
      />
      ) : <span className="srOnly">{label ?? 'Personagem indisponível'}</span>}
    </span>
  )
}
