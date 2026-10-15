/**
 * A instância da rádio nasce uma vez no provider, acima das rotas.
 * É isso que permite continuar uma faixa ao navegar entre Dashboard, Trilhas,
 * Arena e Revisão. A desmontagem da aplicação libera o áudio; a troca de página,
 * por si só, não deve criar outro elemento ou começar a faixa novamente.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { RadioStore } from '../../services/experience/RadioStore'
import { musicTracks } from '../../data/music'
import { useExperience } from './ExperienceProvider'

const Context = createContext<RadioStore | null>(null)
export function RadioProvider({ children, providedStore }: { children: ReactNode; providedStore?: RadioStore }) {
  const [store] = useState(() => providedStore ?? new RadioStore(musicTracks, () => new Audio()))
  const { preferences } = useExperience()
  useEffect(() => { store.applyPreferences(preferences) }, [store, preferences])
  useEffect(() => () => store.dispose(), [store])
  return <Context.Provider value={store}>{children}</Context.Provider>
}
export const useRadio = () => useContext(Context)
