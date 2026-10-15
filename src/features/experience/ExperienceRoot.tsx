/**
 * Esta ponte apenas observa se há uma sessão de foco em andamento.
 * O sentido da comunicação é importante: o Pomodoro informa a experiência visual,
 * mas a configuração de ambiente não inicia, pausa ou finaliza uma sessão.
 */

import type { ReactNode } from 'react'
import { useFocus } from '../focus/FocusProvider'
import { ExperienceProvider } from './ExperienceProvider'

// Esta ponte só observa; configurações de ambiente não comandam o cronômetro.
export function ExperienceRoot({ children }: { children: ReactNode }) {
  const { state } = useFocus()
  return <ExperienceProvider focusRunning={state.current?.status === 'running'}>{children}</ExperienceProvider>
}
