/**
 * O controle de efeitos usa volume independente da música.
 * Escolher uma opção na lista não toca som: a prévia só acontece ao pressionar
 * Ouvir teste. A confirmação automática desse botão fica desligada para que
 * o próprio clique não cubra o efeito que o estudante está tentando ouvir.
 */

import { useState, useSyncExternalStore } from 'react'
import { Button } from '../../components/ui'
import { useExperience } from './ExperienceProvider'
import { useSoundService } from './SoundProvider'
import { soundLabels, type SoundEvent, type SoundService } from '../../services/experience/SoundService'
import styles from './ExperienceControls.module.css'

export function SoundControls() {
  const service = useSoundService()
  return service ? <Connected service={service} /> : null
}
function Connected({ service }: { service: SoundService }) {
  const { preferences, update, focusActive } = useExperience()
  const { error } = useSyncExternalStore(service.subscribe, service.getSnapshot)
  const [preview, setPreview] = useState<SoundEvent>('primary')
  return <fieldset className={styles.radio}>
    <legend>Efeitos 8-bit</legend>
    <label><input type="checkbox" checked={preferences.effectsEnabled} onChange={e => update({ effectsEnabled: e.target.checked })} /> Efeitos sonoros</label>
    <div className={styles.playerRow}>
      <label>Volume dos efeitos ({Math.round(preferences.effectsVolume * 100)}%)
        <input aria-label="Volume dos efeitos" type="range" min="0" max="100" value={Math.round(preferences.effectsVolume * 100)} onChange={e => update({ effectsVolume: Number(e.target.value) / 100 })} />
      </label>
      <label>Prévia de efeito<select value={preview} onChange={event => setPreview(event.target.value as SoundEvent)}>
        {Object.entries(soundLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select></label>
      <Button variant="quiet" sound={false} disabled={!preferences.effectsEnabled || focusActive} onClick={() => service.play(preview)}>Ouvir teste</Button>
    </div>
    <p aria-live="polite">{focusActive ? 'Efeitos da interface silenciados pelo Modo Foco.' : error || 'Sons breves e opcionais. Nenhum som ao abrir páginas ou passar o cursor.'}</p>
  </fieldset>
}
