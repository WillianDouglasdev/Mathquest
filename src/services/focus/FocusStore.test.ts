// @vitest-environment node
/*
 * Relógio e armazenamento falsos permitem provocar falhas de leitura e gravação.
 *  O objetivo é não confundir estado em memória com progresso realmente salvo.
 */

import { describe, expect, it } from 'vitest'
import { FocusStore, FOCUS_STORAGE_KEY, type StoragePort } from './FocusStore'

function fixture() {
  const data = new Map<string, string>()
  let now = { monotonicMs: 0, wallMs: Date.parse('2026-10-15T15:00:00Z') }
  let failWrite = false,
    failRead = false
  const storage: StoragePort = {
    getItem: (key) => {
      if (failRead) throw new Error('blocked')
      return data.get(key) ?? null
    },
    setItem: (key, value) => {
      if (failWrite) throw new Error('quota')
      data.set(key, value)
    },
  }
  const create = () => new FocusStore(storage, () => now)
  return {
    data,
    create,
    advance(ms: number) {
      now = { monotonicMs: now.monotonicMs + ms, wallMs: now.wallMs + ms }
    },
    setReadFailure(value: boolean) {
      failRead = value
    },
    setWriteFailure(value: boolean) {
      failWrite = value
    },
  }
}

describe('adaptador de progresso local', () => {
  it('atualiza o calendário mesmo com o cronômetro parado', () => {
    const f = fixture(),
      store = f.create()
    store.acquire()
    const previous = store.getSnapshot().nowMs
    f.advance(86_400_000)
    store.tick()
    expect(store.getSnapshot().nowMs - previous).toBe(86_400_000)
    expect(store.getSnapshot().state.current).toBeNull()
    expect(f.data.size).toBe(0)
  })
  it('salva checkpoints e reabre pausado sem contabilizar ausência', () => {
    const f = fixture(),
      first = f.create()
    first.acquire()
    first.dispatch({ type: 'start', id: 'a' })
    f.advance(5_000)
    first.tick()
    expect(JSON.parse(f.data.get(FOCUS_STORAGE_KEY)!).current.elapsedMs).toBe(
      5_000,
    )
    f.advance(86_400_000)
    const reopened = f.create()
    reopened.acquire()
    expect(reopened.getSnapshot().state.current).toMatchObject({
      status: 'paused',
      elapsedMs: 5_000,
    })
    expect(reopened.getSnapshot().state.notice).toContain('ausência')
    f.advance(10_000)
    reopened.tick()
    expect(reopened.getSnapshot().state.current?.elapsedMs).toBe(5_000)
  })

  it('erro de quota pausa e preserva o estado em memória para tentar salvar', () => {
    const f = fixture(),
      store = f.create()
    store.acquire()
    store.dispatch({ type: 'start', id: 'a' })
    f.setWriteFailure(true)
    f.advance(2_000)
    store.tick()
    expect(store.getSnapshot().error).toContain('salvar')
    expect(store.getSnapshot().state.current).toMatchObject({
      status: 'paused',
      elapsedMs: 2_000,
    })
    f.advance(60_000)
    store.dispatch({ type: 'resume' })
    expect(store.getSnapshot().state.current?.status).toBe('paused')
    f.setWriteFailure(false)
    store.retry()
    expect(store.getSnapshot().error).toBe('')
    expect(JSON.parse(f.data.get(FOCUS_STORAGE_KEY)!).current.elapsedMs).toBe(
      2_000,
    )
  })

  it('não sobrescreve dados corrompidos e permite nova leitura após reparo', () => {
    const f = fixture()
    f.data.set(FOCUS_STORAGE_KEY, '{invalid')
    const store = f.create()
    store.acquire()
    store.dispatch({ type: 'start', id: 'a' })
    expect(store.getSnapshot().error).toContain('ler')
    expect(f.data.get(FOCUS_STORAGE_KEY)).toBe('{invalid')
    f.data.delete(FOCUS_STORAGE_KEY)
    store.retry()
    expect(store.getSnapshot().error).toBe('')
    store.dispatch({ type: 'start', id: 'valid' })
    expect(store.getSnapshot().state.current?.id).toBe('valid')
  })

  it('trata acesso de leitura negado sem inventar progresso', () => {
    const f = fixture()
    f.setReadFailure(true)
    const store = f.create()
    store.acquire()
    expect(store.getSnapshot().error).not.toBe('')
    expect(store.getSnapshot().state.history).toEqual([])
  })

  it('aba observadora não inicia nem sobrescreve a sessão do proprietário', () => {
    const f = fixture(),
      owner = f.create(),
      observer = f.create()
    owner.acquire()
    owner.dispatch({ type: 'start', id: 'owner' })
    observer.observe()
    observer.dispatch({ type: 'start', id: 'observer' })
    f.advance(3_000)
    owner.tick()
    observer.refresh()
    expect(observer.getSnapshot().state.current).toMatchObject({
      id: 'owner',
      elapsedMs: 3_000,
    })
    expect(JSON.parse(f.data.get(FOCUS_STORAGE_KEY)!).current.id).toBe('owner')
    owner.release()
    observer.acquire()
    expect(observer.getSnapshot().state.current?.status).toBe('paused')
  })

  it('release confirma o último intervalo e libera pausado', () => {
    const f = fixture(),
      store = f.create()
    store.acquire()
    store.dispatch({ type: 'start', id: 'a' })
    f.advance(450)
    store.release()
    expect(store.getSnapshot().state.current).toMatchObject({
      status: 'paused',
      elapsedMs: 450,
    })
    expect(store.getSnapshot().control).toBe('observer')
  })
})
