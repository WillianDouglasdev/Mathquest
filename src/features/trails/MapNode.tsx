/**
 * Cada ponto é um botão de verdade, com nome, estado e seleção acessíveis.
 * Símbolos acompanham as cores para que bloqueio, conclusão e perfeição não
 * dependam apenas da percepção visual. Pontos bloqueados continuam selecionáveis:
 * é assim que o estudante descobre o que falta para acessar aquela região.
 */

import { PixelArt } from '../../components/ui'
import { stateLabels, type RegionView, type TrailState } from '../../domain/trails/model'
import styles from './TrailsPage.module.css'

export function StateSymbol({ state }: { state: TrailState }) {
  return state === 'completed' ? <span aria-hidden="true" className={styles.check}>✓</span>
    : <PixelArt name={state === 'perfect' ? 'star' : state === 'locked' ? 'lock' : state === 'current' ? 'flag' : 'book'} size={27} className={styles.stateIcon} />
}

export function MapNode({ region, selected, onSelect }: { region: RegionView; selected: boolean; onSelect: (id: string) => void }) {
  return <li className={styles.nodePosition} style={{ left: `${region.position.x}%`, top: `${region.position.y}%` }}>
    <button id={`map-region-${region.id}`} type="button"
      className={`${styles.node} ${styles[region.state]} ${selected ? styles.selected : ''}`}
      aria-label={`${region.name} — ${stateLabels[region.state]}`}
      aria-pressed={selected} aria-current={region.state === 'current' ? 'step' : undefined}
      aria-controls="region-details" data-ui-sound="select"
      onFocus={event => event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' })}
      onClick={() => onSelect(region.id)}>
      <StateSymbol state={region.state} />
      <span className={`${styles.nodeLabel} ${region.labelPlacement === 'above' ? styles.labelAbove : ''}`} aria-hidden="true">
        <strong>{region.name}</strong><small>{stateLabels[region.state]}</small>
      </span>
    </button>
  </li>
}
