/**
 * O player mostra o catálogo validado pelo serviço e as preferências salvas.
 * Catálogo vazio é um estado normal nesta fase: os controles explicam a ausência
 * de arquivos locais e não fingem reprodução. Selecionar ou habilitar música
 * continua separado de pressionar Reproduzir.
 */

import { useSyncExternalStore } from 'react'
import { Button } from '../../components/ui'
import { useExperience } from './ExperienceProvider'
import { useRadio } from './RadioProvider'
import type { RadioStore } from '../../services/experience/RadioStore'
import styles from './ExperienceControls.module.css'

export function RadioPlayer() {
  const store = useRadio()
  return store ? <ConnectedPlayer store={store} /> : null
}
function ConnectedPlayer({ store }: { store: RadioStore }) {
  const radio = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const { preferences, update } = useExperience()
  const track = store.tracks.find(t => t.id === radio.trackId)
  return <fieldset className={styles.radio}>
    <legend>Rádio MathQuest</legend>
    <label><input type="checkbox" checked={preferences.musicEnabled} onChange={e => update({ musicEnabled: e.target.checked })} /> Música ambiente</label>
    {track ? <>
      <label>Faixa<select value={radio.trackId} onChange={e => update({ trackId: e.target.value })}>
        {store.tracks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
      </select></label>
      <p>{track.title} · {track.author} · {track.license}{track.attribution ? ` · ${track.attribution}` : ''}</p>
    </> : <p>Nenhuma música local disponível. As faixas aparecerão aqui após inclusão de arquivos com licença registrada.</p>}
    <div className={styles.playerRow}>
      <Button variant="quiet" disabled={!track || !preferences.musicEnabled} onClick={() => radio.playing || radio.busy ? store.pause() : void store.play()}>
        {radio.playing || radio.busy ? 'Pausar música' : 'Reproduzir música'}
      </Button>
      <label>Volume da música ({Math.round(preferences.musicVolume * 100)}%)
        <input aria-label="Volume da música" type="range" min="0" max="100" value={Math.round(preferences.musicVolume * 100)} onChange={e => update({ musicVolume: Number(e.target.value) / 100 })} />
      </label>
    </div>
    <p aria-live="polite">{radio.error || (radio.playing ? 'Reproduzindo em loop.' : radio.busy ? 'Iniciando reprodução…' : 'Somente começa quando você pressiona Reproduzir.')}</p>
  </fieldset>
}
