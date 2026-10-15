/**
 * O HUD apresenta nome, nível e HP recebidos pela cena.
 * Limitar o valor entre zero e cem é um cuidado de exibição; não é cálculo de
 * dano nem validação de uma partida. Texto numérico e barra acessível acompanham
 * a cor, e os retratos ficam estáticos para não sobrecarregar o cabeçalho da cena.
 */

import { StudentAvatar } from '../../components/StudentAvatar'
import { ProgressBar } from '../../components/ui'
import { GuardianSprite } from './GuardianSprite'
import styles from './ArenaPage.module.css'

export function BattleHUD({ name, level, hp, participant }: {
  name: string
  level: number
  hp: number
  participant: 'student' | 'guardian'
}) {
  const safeHp = Math.round(Math.min(100, Math.max(0, Number.isFinite(hp) ? hp : 0)))
  return <section aria-label={`Status de ${name}`} className={styles.hud} data-battle-hud={participant}>
    <span className={styles.hudPortrait} aria-hidden="true">
      {participant === 'student' ? <StudentAvatar variant="navigation" size={44} />
        : <GuardianSprite decorative motion={false} />}
    </span>
    <div className={styles.hudInfo}>
      <h2>{name}</h2>
      <span className={styles.level}>Nível {level}</span>
      <div className={styles.hp} data-hp-low={safeHp <= 40}>
        <ProgressBar value={safeHp} label={`HP de ${name}`} className="mq-progress--static" />
        <span>{safeHp} / 100 HP</span>
      </div>
    </div>
  </section>
}
