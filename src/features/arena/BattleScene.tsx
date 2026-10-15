/**
 * A composição segue o encontro da UX: estudante à esquerda, guardião à direita,
 * status sobre o cenário e diálogo logo abaixo. As posições pertencem à camada
 * de apresentação; os sprites não carregam barras, nomes ou textos desenhados.
 *
 * O cenário panorâmico pode ter recorte nas laterais em telas pequenas, mas não
 * é esticado. O estudante continua sendo o componente aprovado, sem criar uma
 * pose nova ou alterar o personagem para imitar a imagem conceitual.
 */

import { useState } from 'react'
import { StudentAvatar } from '../../components/StudentAvatar'
import { profile } from '../../data/demo'
import { BattleHUD } from './BattleHUD'
import { GuardianSprite } from './GuardianSprite'
import { arenaBackground, type GuardianState } from './arenaArtwork'
import styles from './ArenaPage.module.css'

export function BattleScene({ state = 'idle', guardianHp = 100, dialogue }: {
  state?: GuardianState
  guardianHp?: number
  dialogue: string
}) {
  const [backgroundFailed, setBackgroundFailed] = useState(false)
  return <section aria-label="Cena de batalha da Arena" className={styles.battle}>
    <div className={styles.stage} data-arena-stage>
      {!backgroundFailed ? <img className={styles.background} src={arenaBackground.src}
        width={arenaBackground.width} height={arenaBackground.height} alt=""
        draggable={false} decoding="async" onError={() => setBackgroundFailed(true)} />
        : <p className={styles.backgroundNotice} role="status">Não foi possível carregar o cenário oficial da Arena.</p>}
      <div className={styles.hudRow}>
        <BattleHUD name={profile.name} level={profile.level} hp={100} participant="student" />
        <BattleHUD name="Guardião da Lógica" level={10} hp={guardianHp} participant="guardian" />
      </div>
      <div className={styles.studentPosition} data-arena-student>
        <StudentAvatar variant="full" size={196} motion="idle" label="Estudante aventureiro" className={styles.studentSprite} />
      </div>
      <div className={styles.guardianPosition} data-arena-guardian>
        <GuardianSprite state={state} />
      </div>
    </div>
    <div className={styles.dialogue}>
      <GuardianSprite decorative motion={false} className={styles.dialoguePortrait} />
      <div>
        <h2>Guardião da Lógica</h2>
        <p role="status" aria-live="polite" aria-atomic="true">{dialogue}</p>
      </div>
    </div>
  </section>
}
