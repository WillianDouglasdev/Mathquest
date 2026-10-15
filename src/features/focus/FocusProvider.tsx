/**
 * O provider mantém o Pomodoro acima das páginas e administra seu ciclo de vida
 * no navegador. A trava Web Locks escolhe a aba responsável por gravar; as outras
 * acompanham o progresso em modo de observação.
 *
 * O intervalo de um segundo apenas pede uma atualização ao motor. Ele não soma
 * um segundo por chamada: quem decide o tempo aceito são os relógios do domínio.
 * Ao desmontar, sair da página ou recuperar pelo cache de navegação, listeners,
 * trava e intervalo precisam continuar coerentes e sem duplicação.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { FocusStore, FOCUS_STORAGE_KEY } from '../../services/focus/FocusStore'

const Context = createContext<{
  store: FocusStore
  requestControl: () => void
} | null>(null)
const browserStore = () =>
  new FocusStore(
    {
      getItem: (key) => window.localStorage.getItem(key),
      setItem: (key, value) => window.localStorage.setItem(key, value),
    },
    () => ({ monotonicMs: Math.floor(performance.now()), wallMs: Date.now() }),
  )

export function FocusProvider({
  children,
  providedStore,
}: {
  children: ReactNode
  providedStore?: FocusStore
}) {
  const [store] = useState(() => providedStore ?? browserStore())
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    let unlock: (() => void) | undefined
    const request = () => {
      if (!navigator.locks) {
        store.observe(true)
        return
      }
      void navigator.locks
        .request(
          'mathquest-focus-owner-v1',
          { ifAvailable: true },
          async (lock) => {
            if (!active) return
            if (!lock) {
              store.observe()
              return
            }
            await new Promise<void>((resolve) => {
              unlock = resolve
              store.acquire()
            })
          },
        )
        .catch(() => {
          if (active) store.observe(true)
        })
    }
    request()
    const interval = window.setInterval(() => {
      // Este pulso atualiza a tela; a duração é medida pelo motor com relógios.
      store.tick()
      store.refresh()
    }, 1000)
    const storage = (event: StorageEvent) => {
      if (event.key === FOCUS_STORAGE_KEY || event.key === null) store.refresh()
    }
    const visibility = () => store.tick()
    const hide = () => {
      store.release()
      unlock?.()
      unlock = undefined
    }
    const show = (event: PageTransitionEvent) => {
      if (event.persisted) setAttempt((value) => value + 1)
    }
    window.addEventListener('storage', storage)
    window.addEventListener('pagehide', hide)
    window.addEventListener('pageshow', show)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      // O React pode montar o efeito novamente. A limpeza precisa devolver tudo
      // que esta execução abriu, inclusive a posse da trava entre abas.
      active = false
      window.clearInterval(interval)
      window.removeEventListener('storage', storage)
      window.removeEventListener('pagehide', hide)
      window.removeEventListener('pageshow', show)
      document.removeEventListener('visibilitychange', visibility)
      store.release()
      unlock?.()
    }
  }, [store, attempt])
  return (
    <Context.Provider
      value={{ store, requestControl: () => setAttempt((value) => value + 1) }}
    >
      {children}
    </Context.Provider>
  )
}

export function useFocus() {
  const context = useContext(Context)
  if (!context) throw new Error('FocusProvider ausente.')
  const view = useSyncExternalStore(
    context.store.subscribe,
    context.store.getSnapshot,
  )
  return {
    ...view,
    dispatch: context.store.dispatch.bind(context.store),
    retry: context.store.retry,
    requestControl: context.requestControl,
  }
}
