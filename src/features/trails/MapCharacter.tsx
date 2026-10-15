/**
 * O estudante fica perto da região atual derivada do progresso, não da seleção.
 * O deslocamento em pixels serve apenas para não cobrir o botão do mapa; não é
 * movimentação livre. A política de idle continua sendo a do personagem oficial.
 */

import { StudentAvatar } from '../../components/StudentAvatar'
import type { RegionView } from '../../domain/trails/model'
import styles from './TrailsPage.module.css'

export function MapCharacter({ region }: { region?: RegionView }) {
  if (!region) return null
  return <div className={styles.character} aria-hidden="true" data-map-character={region.id}
    style={{ left: `calc(${region.position.x}% + 30px)`, top: `calc(${region.position.y}% - 78px)` }}>
    <StudentAvatar variant="full" size={96} motion="idle" />
  </div>
}
