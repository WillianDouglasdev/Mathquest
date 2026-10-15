// @vitest-environment node
/*
 * As operações passam por uma trava controlada. Esses cenários verificam se
 *  cliques repetidos e abas concorrentes preservam um único histórico confirmado.
 */

import { describe, expect, it } from 'vitest'
import { ReviewStore, REVIEW_STORAGE_KEY } from './ReviewStore'

function fixture() {
  const data = new Map<string, string>()
  let time = Date.parse('2026-10-15T12:00:00-03:00'),
    sequence = 0,
    fail = false
  let tail: Promise<void> = Promise.resolve()
  const create = (readOnly = false) =>
    new ReviewStore({
      storage: {
        getItem: (key) => data.get(key) ?? null,
        setItem: (key, value) => {
          if (fail) throw new Error('quota')
          data.set(key, value)
        },
      },
      now: () => time,
      id: () => `token-${++sequence}`,
      exclusive: readOnly
        ? null
        : (task) => {
            const result = tail.then(task)
            tail = result.catch(() => {})
            return result
          },
    })
  return {
    data,
    create,
    setFail(value: boolean) {
      fail = value
    },
    setTime(value: number) {
      time = value
    },
  }
}

describe('persistência e concorrência da revisão', () => {
  it('preserva a apresentação revelada e a resposta ao recarregar', async () => {
    const f = fixture(),
      store = f.create()
    store.load()
    await store.start('fractions', 'scheduled')
    const id = store.getSnapshot().snapshot.round!.current!.id
    await store.flip(id)
    const reopened = f.create()
    reopened.load()
    expect(reopened.getSnapshot().snapshot.round?.current?.revealed).toBe(true)
    await reopened.grade(id, 'correct')
    const third = f.create()
    third.load()
    await third.grade(id, 'incorrect')
    expect(third.getSnapshot().snapshot.history).toHaveLength(1)
    expect(third.getSnapshot().snapshot.progress['fr-01']).toMatchObject({
      correct: 1,
      incorrect: 0,
      intervalDays: 3,
      dueDate: '2026-10-18',
    })
  })

  it('ignora chamadas simultâneas da mesma aba antes de a primeira gravação terminar', async () => {
    const f = fixture(),
      store = f.create()
    store.load()
    await store.start('all', 'scheduled')
    const id = store.getSnapshot().snapshot.round!.current!.id
    await store.flip(id)
    await Promise.all([
      store.grade(id, 'correct'),
      store.grade(id, 'incorrect'),
    ])
    expect(store.getSnapshot().snapshot.history).toHaveLength(1)
  })

  it('duas abas não duplicam a mesma apresentação e releem o estado dentro da trava', async () => {
    const f = fixture(),
      first = f.create(),
      second = f.create()
    first.load()
    await first.start('operations', 'scheduled')
    const id = first.getSnapshot().snapshot.round!.current!.id
    await first.flip(id)
    second.load()
    await Promise.all([
      first.grade(id, 'correct'),
      second.grade(id, 'incorrect'),
    ])
    first.load()
    second.load()
    expect(first.getSnapshot().snapshot.history).toHaveLength(1)
    expect(second.getSnapshot().snapshot.progress['op-01']).toMatchObject({
      correct: 1,
      incorrect: 0,
    })
  })

  it('não sobrescreve uma nova apresentação com o token de uma aba antiga', async () => {
    const f = fixture(),
      first = f.create(),
      second = f.create()
    first.load()
    await first.start('operations', 'scheduled')
    const old = first.getSnapshot().snapshot.round!.current!.id
    await first.flip(old)
    second.load()
    await second.start('percentage', 'scheduled')
    await first.grade(old, 'correct')
    expect(first.getSnapshot().snapshot.history).toHaveLength(0)
    expect(first.getSnapshot().snapshot.round?.current?.cardId).toBe('pc-01')
  })

  it('falha de escrita não confirma resposta e o retry registra somente uma vez', async () => {
    const f = fixture(),
      store = f.create()
    store.load()
    await store.start('all', 'scheduled')
    const id = store.getSnapshot().snapshot.round!.current!.id
    await store.flip(id)
    f.setFail(true)
    await store.grade(id, 'correct')
    expect(store.getSnapshot().error).toContain('não confirmado')
    expect(store.getSnapshot().snapshot.history).toHaveLength(0)
    expect(store.getSnapshot().snapshot.round?.current?.answer).toBeNull()
    f.setFail(false)
    store.load()
    await store.grade(id, 'correct')
    expect(store.getSnapshot().snapshot.history).toHaveLength(1)
  })

  it('preserva o JSON inválido e bloqueia mutações até recuperar a leitura', async () => {
    const f = fixture()
    f.data.set(REVIEW_STORAGE_KEY, '{broken')
    const store = f.create()
    store.load()
    await store.start('all', 'scheduled')
    expect(store.getSnapshot().error).toContain('ler')
    expect(f.data.get(REVIEW_STORAGE_KEY)).toBe('{broken')
    f.data.delete(REVIEW_STORAGE_KEY)
    store.load()
    await store.start('all', 'scheduled')
    expect(store.getSnapshot().snapshot.round?.current?.cardId).toBe('op-01')
  })

  it('recalcula vencimentos após a data mudar sem reescrever a agenda', async () => {
    const f = fixture(),
      store = f.create()
    store.load()
    await store.start('all', 'scheduled')
    const id = store.getSnapshot().snapshot.round!.current!.id
    await store.flip(id)
    await store.grade(id, 'incorrect')
    const saved = f.data.get(REVIEW_STORAGE_KEY)
    f.setTime(Date.parse('2026-10-16T00:00:00-03:00'))
    store.tick()
    expect(store.getSnapshot().nowMs).toBe(
      Date.parse('2026-10-16T00:00:00-03:00'),
    )
    expect(f.data.get(REVIEW_STORAGE_KEY)).toBe(saved)
  })

  it('não grava em navegador sem porta de exclusão mútua', async () => {
    const f = fixture(),
      store = f.create(true)
    store.load()
    await store.start('all', 'scheduled')
    expect(store.getSnapshot().readOnly).toBe(true)
    expect(f.data.size).toBe(0)
  })
})
