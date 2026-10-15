/**
 * O painel reúne as opções de som, música, movimento e foco sem criar outra
 * fonte de preferências. O atalho do cabeçalho abre esse mesmo painel e direciona
 * o foco para ele, tornando a configuração fácil de encontrar pelo teclado.
 * Escape fecha o painel e mantém o usuário em um controle conhecido.
 */

import { useEffect, useRef } from 'react'
import { useExperience } from './ExperienceProvider'
import styles from './ExperienceControls.module.css'
import { RadioPlayer } from './RadioPlayer'
import { SoundControls } from './SoundControls'
import { Button } from '../../components/ui'

export function ExperienceControls() {
  const { preferences, update, reload, reducedMotion, focusActive, error, settingsOpen, setSettingsOpen, settingsRequest } = useExperience()
  const panel = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    if (!settingsRequest) return
    panel.current?.querySelector('summary')?.focus()
    panel.current?.scrollIntoView({ block: 'start' })
  }, [settingsRequest])
  return <details ref={panel} id="configuracoes-som" className={styles.panel} open={settingsOpen}
    onToggle={event => setSettingsOpen(event.currentTarget.open)}
    onKeyDown={event => { if (event.key === 'Escape') { setSettingsOpen(false); panel.current?.querySelector('summary')?.focus() } }}>
    <summary data-ui-sound={settingsOpen ? 'close' : 'open'}>
      <span className={styles.speaker}><SpeakerIcon /></span>
      <span className={styles.summaryCopy}><span>Ambiente MathQuest</span><strong>Sons 8-bit e ambiente</strong><small>Configurar efeitos, música e foco</small></span>
      <span className={styles.soundState}>{focusActive ? 'Foco ativo' : preferences.effectsEnabled ? 'Efeitos ligados' : 'Efeitos desligados'}</span>
      <span className={styles.chevron} aria-hidden="true">{settingsOpen ? '−' : '+'}</span>
    </summary>
    <div className={styles.controls}>
      <SoundControls />
      <RadioPlayer />
      <label><input type="checkbox" checked={preferences.decorativeMotion} onChange={e => update({ decorativeMotion: e.target.checked })} /> Animações decorativas</label>
      <label><input type="checkbox" checked={preferences.focusMode} onChange={e => update({ focusMode: e.target.checked })} /> Modo Foco durante o Pomodoro</label>
      <p aria-live="polite">{focusActive ? 'Modo Foco ativo: decoração e efeitos da interface silenciados. Sua música permanece como você escolheu.' : 'Modo Foco reduz decoração e efeitos enquanto o cronômetro está em andamento. Não pausa o estudo nem a música.'}</p>
      {reducedMotion && <p>Movimento reduzido pelo sistema. A decoração permanece estática.</p>}
      {error && <><p role="status">{error}</p><Button variant="quiet" onClick={reload}>Recarregar preferências</Button></>}
    </div>
  </details>
}

function SpeakerIcon() {
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" focusable="false">
    <path d="M3 9h4l6-5v16l-6-5H3z" fill="currentColor" />
    <path d="M17 8v8m4-11v14" stroke="currentColor" strokeWidth="2" />
  </svg>
}
export function SoundSettingsShortcut() {
  const { settingsOpen, openSoundSettings } = useExperience()
  return <button type="button" className={styles.shortcut} aria-label="Configurações de som" aria-controls="configuracoes-som" aria-expanded={settingsOpen} data-ui-sound="open" onClick={openSoundSettings}>
    <SpeakerIcon /><span>Sons</span>
  </button>
}
