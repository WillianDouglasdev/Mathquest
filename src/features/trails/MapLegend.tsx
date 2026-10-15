/**
 * A legenda reutiliza o mesmo símbolo e os mesmos rótulos dos pontos do mapa.
 * Dessa forma, uma mudança de estado não precisa ser explicada de duas maneiras.
 * Os ícones aqui são informativos e permanecem estáticos, sem disputar atenção
 * com a exploração da trilha.
 */

import { stateLabels, type TrailState } from '../../domain/trails/model'
import { StateSymbol } from './MapNode'
import styles from './TrailsPage.module.css'

const states: TrailState[] = ['completed', 'current', 'available', 'locked', 'perfect']
export function MapLegend() {
  return <ul className={styles.legend} aria-label="Legenda dos estados do mapa">
    {states.map(state => <li key={state}><span className={`${styles.legendSymbol} ${styles[state]}`}><StateSymbol state={state} /></span>{stateLabels[state]}</li>)}
  </ul>
}
