/**
 * O guardião recebe uma pose, não uma regra de batalha.
 * Cada estado corresponde a um PNG estático do pacote; CSS acrescenta somente
 * um movimento curto ou idle discreto, quando as preferências permitem.
 *
 * A primeira montagem não deve parecer um ataque ocorrido de verdade. Uma pose
 * restaurada permanece estática, e ações fora da tela não são enfileiradas para
 * tocar depois. O fim da animação encerra o movimento sem temporizadores globais.
 */

import { useEffect, useRef, useState } from 'react'
import { useCharacterVisibility } from '../../components/useCharacterVisibility'
import { useStudentAnimationPolicy } from '../experience/ExperienceProvider'
import { guardianArtwork, guardianLabels, type GuardianState } from './arenaArtwork'
import styles from './ArenaPage.module.css'

export function GuardianSprite({ state = 'idle', decorative = false, className = '', motion = true }: {
  state?: GuardianState
  decorative?: boolean
  className?: string
  motion?: boolean
}) {
  const element = useRef<HTMLSpanElement>(null)
  const allowed = useStudentAnimationPolicy(false)
  const visible = useCharacterVisibility(element, motion && allowed)
  const previous = useRef(state)
  // A pose permanece como informação visual; action representa apenas o movimento
  // curto que pode acompanhar uma troca feita agora. Um não depende do outro.
  const [action, setAction] = useState<GuardianState | null>(null)
  const [failed, setFailed] = useState<Set<string>>(() => new Set())
  const src = guardianArtwork.sources[state]
  useEffect(() => {
    if (previous.current === state) return
    previous.current = state
    // A restored pose never attacks on mount. Hidden events are not queued.
    setAction(motion && allowed && visible && state !== 'idle' ? state : null)
  }, [state, motion, allowed, visible])
  useEffect(() => {
    if (!motion || !allowed || !visible) setAction(null)
  }, [motion, allowed, visible])
  // Keep the semantic pose when motion is off. All four poses are static PNGs.
  return <span ref={element} className={`${styles.guardianSprite} ${className}`}
    data-guardian-state={state} data-guardian-motion={motion && allowed && visible && (state === 'idle' || action === state) ? 'on' : 'off'}
    aria-hidden={decorative ? true : undefined}>
    {!failed.has(src) ? <img src={src} width={guardianArtwork.width} height={guardianArtwork.height}
      alt={decorative ? '' : `Guardião da Lógica — ${guardianLabels[state]}`}
      draggable={false} decoding="async" loading="lazy"
      onAnimationEnd={() => setAction(null)}
      onError={() => setFailed(previous => new Set([...previous, src]))} />
      : <span className={styles.assetNotice}>Guardião indisponível: {guardianLabels[state]}</span>}
  </span>
}
