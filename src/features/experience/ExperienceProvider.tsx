/**
 * As preferências de ambiente são compartilhadas por toda a aplicação.
 * O estado efetivo de foco combina uma sessão em andamento com a opção do usuário;
 * a preferência do sistema por movimento reduzido tem efeito independente.
 *
 * Os atributos no contêiner permitem que CSS e componentes sigam a mesma política.
 * Mudar decoração ou volume não envia comandos ao Pomodoro e não reinicia o player.
 * A sincronização entre abas atualiza preferências sem recriar a aplicação.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { EXPERIENCE_KEY, PreferencesStore } from '../../services/experience/PreferencesStore'
import './motion.css'

const Context = createContext<{
  store: PreferencesStore
  reducedMotion: boolean
  focusActive: boolean
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
  settingsRequest: number
  openSoundSettings: () => void
} | null>(null)
const staticPolicy = { preferences: { decorativeMotion: false, focusMode: true } }
const noSubscribe = () => () => {}
const getStaticPolicy = () => staticPolicy
export function ExperienceProvider({ children, focusRunning = false }: { children: ReactNode; focusRunning?: boolean }) {
  const [store] = useState(() => new PreferencesStore({
    getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value),
  }))
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  const { preferences } = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const focusActive = focusRunning && preferences.focusMode
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsRequest, setSettingsRequest] = useState(0)
  const openSoundSettings = useCallback(() => { setSettingsOpen(true); setSettingsRequest(value => value + 1) }, [])
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const change = () => setReducedMotion(media?.matches ?? false)
    const storage = (event: StorageEvent) => { if (event.key === EXPERIENCE_KEY || event.key === null) store.load() }
    media?.addEventListener('change', change)
    window.addEventListener('storage', storage)
    return () => { media?.removeEventListener('change', change); window.removeEventListener('storage', storage) }
  }, [store])
  const context = useMemo(() => ({ store, reducedMotion, focusActive, settingsOpen, setSettingsOpen, settingsRequest, openSoundSettings }), [store, reducedMotion, focusActive, settingsOpen, settingsRequest, openSoundSettings])
  return <Context.Provider value={context}>
    <div data-focus-mode={focusActive ? 'on' : 'off'} data-decorative-motion={preferences.decorativeMotion && !reducedMotion && !focusActive ? 'on' : 'off'}>{children}</div>
  </Context.Provider>
}
export function useExperience() {
  const context = useContext(Context)
  if (!context) throw Error('ExperienceProvider ausente.')
  return { ...useSyncExternalStore(context.store.subscribe, context.store.getSnapshot), update: context.store.update, reload: context.store.load, reducedMotion: context.reducedMotion, focusActive: context.focusActive, settingsOpen: context.settingsOpen, setSettingsOpen: context.setSettingsOpen, settingsRequest: context.settingsRequest, openSoundSettings: context.openSoundSettings }
}

// StudentAvatar remains usable without the app providers, conservatively static.
export function useStudentAnimationPolicy(focusSensitive: boolean) {
  const context = useContext(Context)
  const { preferences } = useSyncExternalStore(context?.store.subscribe ?? noSubscribe, context?.store.getSnapshot ?? getStaticPolicy)
  return Boolean(context && preferences.decorativeMotion && !context.reducedMotion && !context.focusActive && !(focusSensitive && preferences.focusMode))
}
