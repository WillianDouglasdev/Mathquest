/**
 * O store faz a ponte entre o motor puro e os recursos externos. Relógio e
 * armazenamento são recebidos pelo construtor, o que permite trocar o navegador
 * por versões controladas nos testes.
 *
 * Só a aba dona do cronômetro pode enviar comandos e gravar. Se uma leitura falha,
 * o dado existente não é substituído; se uma gravação falha, o cronômetro para e
 * mantém o estado em memória. A prioridade é não mostrar como salvo um esforço
 * que o navegador ainda não conseguiu confirmar.
 */

import {
  initialState,
  isActive,
  restore,
  snapshotOf,
  transition,
  type Command,
  type FocusState,
  type TimePoint,
} from '../../domain/focus/engine'
import { decodeSnapshot } from '../../domain/focus/persistence'

export const FOCUS_STORAGE_KEY = 'mathquest.focus.v1'
export type StoragePort = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}
export type FocusView = {
  state: FocusState
  control: 'waiting' | 'owner' | 'observer' | 'unsupported'
  error: string
  nowMs: number
}

// Sem dependência de React; relógio e armazenamento chegam por interfaces injetadas.
export class FocusStore {
  private view: FocusView = {
    state: initialState(),
    control: 'waiting',
    error: '',
    nowMs: 0,
  }
  private listeners = new Set<() => void>()
  private failure: 'read' | 'write' | null = null
  constructor(
    private readonly storage: StoragePort,
    private readonly clock: () => TimePoint,
  ) {
    this.view.nowMs = clock().wallMs
  }

  getSnapshot = () => this.view
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
  private update(view: FocusView) {
    this.view = view
    for (const listener of this.listeners) listener()
  }

  acquire() {
    this.update({ ...this.view, control: 'owner' })
    this.read(true)
  }
  observe(unsupported = false) {
    this.update({
      ...this.view,
      control: unsupported ? 'unsupported' : 'observer',
    })
    this.read(false)
  }
  refresh = () => {
    if (this.view.control !== 'owner') this.read(false)
  }
  private read(recover: boolean) {
    try {
      const raw = this.storage.getItem(FOCUS_STORAGE_KEY)
      const state = raw ? restore(decodeSnapshot(raw), recover) : initialState()
      this.failure = null
      this.update({
        ...this.view,
        state,
        error: '',
        nowMs: this.clock().wallMs,
      })
      if (recover && raw && state.notice) this.persist()
    } catch {
      this.failure = 'read'
      this.update({
        ...this.view,
        error:
          'Não foi possível ler seu progresso local. Os dados existentes foram preservados. Tente recuperar antes de iniciar.',
      })
    }
  }
  private persist() {
    try {
      const raw = JSON.stringify(snapshotOf(this.view.state))
      if (raw.length > 4_000_000 || this.view.state.history.length > 10_000)
        throw new Error('Limite de armazenamento atingido.')
      this.storage.setItem(FOCUS_STORAGE_KEY, raw)
      this.failure = null
      if (this.view.error) this.update({ ...this.view, error: '' })
    } catch {
      this.failure = 'write'
      const state = transition(this.view.state, { type: 'pause' }, this.clock())
      this.update({
        ...this.view,
        state,
        error:
          'Não foi possível salvar no navegador. O cronômetro foi parado; os dados estão nesta aba. Libere espaço/permissão e tente salvar novamente antes de fechar.',
      })
    }
  }
  dispatch(command: Command) {
    if (this.view.control !== 'owner' || this.view.error) return
    const now = this.clock()
    const state = transition(this.view.state, command, now)
    if (state === this.view.state) return
    this.update({ ...this.view, state, nowMs: now.wallMs })
    this.persist()
  }
  tick = () => {
    this.dispatch({ type: 'tick' })
    const nowMs = this.clock().wallMs
    // Atualizamos a data das estatísticas mesmo quando o cronômetro está parado.
    if (Math.floor(nowMs / 60_000) !== Math.floor(this.view.nowMs / 60_000))
      this.update({ ...this.view, nowMs })
  }
  retry = () => {
    if (this.view.control !== 'owner') return
    if (this.failure === 'write') this.persist()
    else this.read(true)
  }
  release = () => {
    if (this.view.control !== 'owner') return
    if (!this.view.error && isActive(this.view.state.current))
      this.dispatch({ type: 'pause' })
    this.update({ ...this.view, control: 'observer' })
  }
}
