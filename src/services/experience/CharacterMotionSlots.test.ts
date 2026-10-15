/*
 * O orçamento de animações é conferido por prioridade e devolução de vagas.
 *  O limite é compartilhado; não deve depender da ordem em que as páginas renderizam.
 */

import { describe, expect, it, vi } from 'vitest'
import { CharacterMotionSlots } from './CharacterMotionSlots'

describe('limite de personagens animados', () => {
  it('limita a duas animações e prioriza comemoração sobre idle', () => {
    const slots = new CharacterMotionSlots(2), full = Symbol(), portrait = Symbol(), celebration = Symbol()
    slots.acquire(full, 20); slots.acquire(portrait, 10)
    expect(slots.has(full) && slots.has(portrait)).toBe(true)
    const release = slots.acquire(celebration, 100)
    expect(slots.has(celebration) && slots.has(full)).toBe(true)
    expect(slots.has(portrait)).toBe(false)
    release()
    expect(slots.has(portrait)).toBe(true)
  })
  it('libera posições e assinaturas sem deixar solicitações órfãs', () => {
    const slots = new CharacterMotionSlots(1), first = Symbol(), next = Symbol(), fn = vi.fn()
    const unsubscribe = slots.subscribe(fn)
    const release = slots.acquire(first, 1)
    slots.acquire(next, 1)
    expect(slots.has(next)).toBe(false)
    release()
    expect(slots.has(next)).toBe(true)
    unsubscribe()
    slots.acquire(Symbol(), 5)
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
