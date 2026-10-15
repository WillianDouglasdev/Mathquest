/**
 * O serviço de sons é único e acompanha as preferências globais.
 * A captura de clique permite que controles comuns declarem um evento sem abrir
 * novos sintetizadores. Ações ligadas a registros confirmados usam o serviço
 * diretamente e evitam um segundo som automático no mesmo botão.
 *
 * A conclusão do Pomodoro é reconhecida pela transição de uma sessão já observada
 * em andamento. Restaurar uma sessão concluída não deve tocar uma vitória antiga.
 */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { SoundService, isSoundEvent } from '../../services/experience/SoundService'
import { BrowserSynth } from '../../services/experience/BrowserSynth'
import { useExperience } from './ExperienceProvider'
import { useFocus } from '../focus/FocusProvider'

const Context = createContext<SoundService | null>(null)
const silent = () => {}
export function SoundProvider({ children, providedService }: { children: ReactNode; providedService?: SoundService }) {
  const [service] = useState(() => providedService ?? new SoundService(() => new BrowserSynth()))
  const { preferences, focusActive } = useExperience()
  const { state, control } = useFocus()
  const current = state.current
  const previous = useRef({ id: current?.id, status: current?.status })
  useEffect(() => { service.configure(preferences.effectsEnabled, preferences.effectsVolume, focusActive) }, [service, preferences.effectsEnabled, preferences.effectsVolume, focusActive])
  useEffect(() => {
    if (control === 'owner' && current?.status === 'completed' && previous.current.id === current.id && previous.current.status === 'running') {
      service.play('pomodoro', { userInitiated: false, id: `focus-${current.id}` })
    }
    previous.current = { id: current?.id, status: current?.status }
  }, [service, control, current?.id, current?.status])
  useEffect(() => () => service.dispose(), [service])
  return <Context.Provider value={service}>
    <div onClickCapture={event => {
      if (event.target instanceof Element) {
        const target = event.target.closest<HTMLElement>('[data-ui-sound]')
        const sound = target?.getAttribute('data-ui-sound') ?? null
        if (target && !(target instanceof HTMLButtonElement && target.disabled) && target.getAttribute('aria-disabled') !== 'true' && isSoundEvent(sound)) service.play(sound)
      }
    }}>{children}</div>
  </Context.Provider>
}
export function useSounds() {
  const service = useContext(Context)
  return service?.play ?? silent
}
export const useSoundService = () => useContext(Context)
