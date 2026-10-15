/**
 * Aqui os recursos do navegador são conectados ao store de revisão.
 * A chave e a trava dos cartões são independentes das usadas pelo Pomodoro.
 * Isso permite revisar durante uma sessão de foco sem disputar o controle do
 * cronômetro nem gravar respostas no histórico errado.
 */

import { ReviewStore } from './ReviewStore'

export function browserReviewStore() {
  return new ReviewStore({
    storage: {
      getItem: (key) => window.localStorage.getItem(key),
      setItem: (key, value) => window.localStorage.setItem(key, value),
    },
    now: () => Date.now(),
    id: () => crypto.randomUUID(),
    exclusive: navigator.locks
      ? async (task) => {
          await navigator.locks.request('mathquest-review-writes-v1', () =>
            task(),
          )
        }
      : null,
  })
}
