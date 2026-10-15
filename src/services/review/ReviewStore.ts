/**
 * Este store coordena a leitura e a gravação dos flashcards. O componente pede
 * uma ação; a transação lê o estado mais recente, aplica a regra e só então publica
 * o resultado. Isso reduz a chance de a tela avançar antes de a resposta ser salva.
 *
 * A trava entre abas é parte da integridade do histórico. Sem ela, a revisão fica
 * em leitura. O bloqueio local de operação em andamento ajuda contra cliques
 * repetidos, mas a proteção definitiva continua no ID e nas regras do domínio.
 */

import {
  emptyReview,
  reviewTransition,
  type ReviewCommand,
  type ReviewSnapshot,
  type Mode,
  type Outcome,
} from '../../domain/review/engine'
import { reviewDay } from '../../domain/review/calendar'
import { decodeReview } from '../../domain/review/persistence'
import type { SubjectFilter } from '../../data/flashcards'

export const REVIEW_STORAGE_KEY = 'mathquest.review.v1'
type Ports = {
  storage: {
    getItem(key: string): string | null
    setItem(key: string, value: string): void
  }
  now: () => number
  id: () => string
  exclusive: ((task: () => void) => Promise<void>) | null
}
export type ReviewView = {
  snapshot: ReviewSnapshot
  nowMs: number
  loaded: boolean
  busy: boolean
  readOnly: boolean
  error: string
  notice: string
}

export class ReviewStore {
  private view: ReviewView
  private listeners = new Set<() => void>()
  constructor(private readonly ports: Ports) {
    this.view = {
      snapshot: emptyReview(),
      nowMs: ports.now(),
      loaded: false,
      busy: false,
      readOnly: !ports.exclusive,
      error: '',
      notice: '',
    }
  }
  getSnapshot = () => this.view
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
  private update(change: Partial<ReviewView>) {
    this.view = { ...this.view, ...change }
    for (const listener of this.listeners) listener()
  }
  private read() {
    const raw = this.ports.storage.getItem(REVIEW_STORAGE_KEY)
    return raw ? decodeReview(raw) : emptyReview()
  }
  load = () => {
    if (this.view.busy) return
    try {
      this.update({
        snapshot: this.read(),
        nowMs: this.ports.now(),
        loaded: true,
        error: '',
      })
    } catch {
      this.update({
        loaded: true,
        error:
          'Não foi possível ler a revisão local. Os dados foram preservados. Tente recarregar antes de registrar respostas.',
      })
    }
  }
  tick = () => {
    if (reviewDay(this.ports.now()) !== reviewDay(this.view.nowMs)) this.load()
  }
  private async commit(makeCommand: () => ReviewCommand) {
    if (
      this.view.busy ||
      this.view.error ||
      !this.view.loaded ||
      !this.ports.exclusive
    )
      return
    this.update({ busy: true, notice: '' })
    try {
      await this.ports.exclusive(() => {
        /*
         * A leitura precisa acontecer dentro da trava. Ler antes de esperar a vez
         * deixaria uma janela para outra aba salvar uma resposta que seria perdida
         * quando esta aba gravasse um estado antigo por cima.
         */
        // A leitura sob a trava impede que uma aba atrasada sobrescreva respostas novas.
        const latest = this.read(),
          now = this.ports.now(),
          command = makeCommand()
        const next = reviewTransition(latest, command, now)
        if (next !== latest) {
          const raw = JSON.stringify(next)
          if (raw.length > 4_000_000 || next.history.length > 20_000)
            throw new Error('Limite de histórico atingido.')
          this.ports.storage.setItem(REVIEW_STORAGE_KEY, raw)
        }
        // A tela recebe o novo snapshot somente depois de a gravação terminar.
        this.update({
          snapshot: next,
          nowMs: now,
          notice:
            next === latest
              ? 'Esta apresentação já foi respondida ou mudou em outra aba. O histórico foi sincronizado.'
              : command.type === 'grade'
                ? 'Resposta salva neste navegador.'
                : '',
        })
      })
    } catch (error) {
      const clockError =
        error instanceof Error &&
        /relógio|Data do navegador/.test(error.message)
      this.update({
        error: clockError
          ? error.message
          : 'Registro não confirmado. Não avançamos o cartão nesta aba. Confira o armazenamento e recarregue o progresso antes de tentar novamente.',
      })
    } finally {
      this.update({ busy: false })
    }
  }
  start = (subject: SubjectFilter, mode: Mode) =>
    this.commit(() => ({
      type: 'start',
      subject,
      mode,
      roundId: this.ports.id(),
      presentationId: this.ports.id(),
    }))
  flip = (presentationId: string) =>
    this.commit(() => ({ type: 'flip', presentationId }))
  grade = (presentationId: string, outcome: Outcome) =>
    this.commit(() => ({ type: 'grade', presentationId, outcome }))
  next = (presentationId: string) =>
    this.commit(() => ({
      type: 'next',
      presentationId,
      nextId: this.ports.id(),
    }))
}
