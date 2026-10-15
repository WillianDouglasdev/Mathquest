// @vitest-environment node
/*
 * O relógio é controlado para testar minutos de foco sem esperar minutos reais.
 *  Os casos protegem principalmente pausas, lacunas, retomada e encerramento único.
 */

import { describe, expect, it } from 'vitest'
import {
  initialState,
  remainingMs,
  restore,
  snapshotOf,
  transition,
  type Duration,
  type FocusState,
} from './engine'
import { decodeSnapshot } from './persistence'
import { statistics } from './statistics'

const START = Date.parse('2026-10-15T12:00:00-03:00')
function runner(minutes: Duration = 25, start = START) {
  let state = transition(
    initialState(),
    { type: 'select', minutes },
    { monotonicMs: 0, wallMs: start },
  )
  let mono = 0,
    wall = start
  return {
    get state() {
      return state
    },
    command(
      type: 'start' | 'pause' | 'resume' | 'finish' | 'reset' | 'tick',
      id = 'session-1',
    ) {
      state = transition(state, type === 'start' ? { type, id } : { type }, {
        monotonicMs: mono,
        wallMs: wall,
      })
    },
    advance(ms: number, tick = true, civilMs = ms) {
      mono += ms
      wall += civilMs
      if (tick)
        state = transition(
          state,
          { type: 'tick' },
          { monotonicMs: mono, wallMs: wall },
        )
    },
    study(ms: number) {
      while (ms > 0) {
        const chunk = Math.min(10_000, ms)
        this.advance(chunk)
        ms -= chunk
      }
    },
    restore() {
      state = restore(decodeSnapshot(JSON.stringify(snapshotOf(state))))
    },
  }
}

describe('motor puro de foco', () => {
  it.each([15, 25, 50] as Duration[])(
    'conclui exatamente %i minutos e não duplica a conclusão',
    (minutes) => {
      const run = runner(minutes)
      run.command('start')
      run.study(minutes * 60_000 - 1_000)
      run.advance(4_000) // An ordinary delayed callback crosses the deadline.
      expect(run.state.current?.status).toBe('completed')
      expect(run.state.current?.elapsedMs).toBe(minutes * 60_000)
      expect(remainingMs(run.state)).toBe(0)
      run.command('finish')
      run.command('tick')
      run.command('pause')
      expect(run.state.history).toHaveLength(1)
      expect(run.state.history[0].endedAt).toBe(START + minutes * 60_000)
      expect(
        decodeSnapshot(JSON.stringify(snapshotOf(run.state))).history,
      ).toHaveLength(1)
    },
  )

  it('registra 15 minutos ativos e 10 restantes após 10 + pausa de 2 + 5 minutos', () => {
    const run = runner()
    run.command('start')
    run.study(600_000)
    run.command('pause')
    run.advance(120_000)
    run.command('resume')
    run.study(300_000)
    expect(run.state.current?.elapsedMs).toBe(900_000)
    expect(remainingMs(run.state)).toBe(600_000)
    expect(run.state.current?.segments).toHaveLength(2)
  })

  it('mede um callback atrasado por 4,7s sem assumir um segundo', () => {
    const run = runner()
    run.command('start')
    run.advance(4_700)
    expect(run.state.current?.elapsedMs).toBe(4_700)
    expect(remainingMs(run.state)).toBe(1_495_300)
  })

  it.each([
    [120_000, 120_000],
    [1_000, 120_000],
    [1_000, -1_000],
  ])(
    'pausa sem creditar lacuna ou relógio alterado (%i / %i)',
    (mono, wall) => {
      const run = runner()
      run.command('start')
      run.study(5_000)
      run.advance(mono, true, wall)
      expect(run.state.current?.status).toBe('paused')
      expect(run.state.current?.elapsedMs).toBe(5_000)
      expect(run.state.notice).toContain('lacuna')
    },
  )

  it('finalizar após mudança regressiva de relógio mantém histórico válido', () => {
    const run = runner()
    run.command('start')
    run.study(5_000)
    run.advance(1_000, true, -120_000)
    run.command('finish')
    expect(() =>
      decodeSnapshot(JSON.stringify(snapshotOf(run.state))),
    ).not.toThrow()
    expect(run.state.current?.elapsedMs).toBe(5_000)
  })

  it('recupera uma sessão running pausada e exclui um dia de ausência', () => {
    const run = runner()
    run.command('start')
    run.study(90_000)
    run.restore()
    run.advance(86_400_000)
    expect(run.state.current?.status).toBe('paused')
    expect(run.state.notice).toContain('ausência')
    expect(run.state.current?.elapsedMs).toBe(90_000)
    run.command('resume')
    run.study(10_000)
    expect(run.state.current?.elapsedMs).toBe(100_000)
  })

  it('finaliza parcialmente, preserva tempo no reinício e impede cliques duplicados', () => {
    const run = runner()
    run.command('start')
    run.command('start', 'duplicate')
    run.study(30_000)
    run.command('finish')
    run.command('finish')
    expect(run.state.history).toHaveLength(1)
    expect(run.state.history[0]).toMatchObject({
      id: 'session-1',
      elapsedMs: 30_000,
      status: 'interrupted',
      reason: 'manual',
    })
    run.command('reset')
    expect(run.state.current).toBeNull()
    expect(remainingMs(run.state)).toBe(1_500_000)
    run.command('start', 'session-2')
    run.study(2_000)
    run.command('reset')
    expect(run.state.history).toHaveLength(2)
    expect(run.state.history[1]).toMatchObject({
      reason: 'restart',
      elapsedMs: 2_000,
    })
  })

  it('bloqueia troca de duração durante execução ou pausa', () => {
    const run = runner()
    run.command('start')
    let state: FocusState = transition(
      run.state,
      { type: 'select', minutes: 50 },
      { monotonicMs: 0, wallMs: START },
    )
    expect(state.minutes).toBe(25)
    run.command('pause')
    state = transition(
      run.state,
      { type: 'select', minutes: 15 },
      { monotonicMs: 0, wallMs: START },
    )
    expect(state.minutes).toBe(25)
  })
})

describe('persistência versionada e estatísticas', () => {
  it('rejeita versão, durações, tempo e IDs inconsistentes', () => {
    expect(() => decodeSnapshot('{')).toThrow()
    expect(() =>
      decodeSnapshot(
        JSON.stringify({ ...snapshotOf(initialState()), schemaVersion: 2 }),
      ),
    ).toThrow()
    expect(() =>
      decodeSnapshot(
        JSON.stringify({ ...snapshotOf(initialState()), minutes: 99 }),
      ),
    ).toThrow()
    const run = runner()
    run.command('start')
    run.study(1_000)
    run.command('finish')
    const snapshot = snapshotOf(run.state)
    expect(() =>
      decodeSnapshot(
        JSON.stringify({
          ...snapshot,
          history: [...snapshot.history, ...snapshot.history],
        }),
      ),
    ).toThrow()
    expect(() =>
      decodeSnapshot(
        JSON.stringify({
          ...snapshot,
          current: { ...snapshot.current, elapsedMs: 50_000 },
        }),
      ),
    ).toThrow()
  })

  it('divide os minutos entre domingo e segunda e separa semanas', () => {
    const sunday = Date.parse('2026-10-18T23:59:30-03:00')
    const run = runner(15, sunday)
    run.command('start')
    run.study(60_000)
    run.command('finish')
    const previous = statistics(run.state, sunday)
    const next = statistics(run.state, sunday + 60_000)
    expect(previous.today.milliseconds).toBe(30_000)
    expect(previous.week.milliseconds).toBe(30_000)
    expect(next.today.milliseconds).toBe(30_000)
    expect(next.week.milliseconds).toBe(30_000)
    expect(next.week.completed).toBe(0)
    expect(next.week.interrupted).toBe(1)
    expect(next.days[0].date).toBe('2026-10-19')
  })

  it('conta uma conclusão na data final, sem duplicar o current arquivado', () => {
    const start = Date.parse('2026-12-31T23:50:00-03:00')
    const run = runner(15, start)
    run.command('start')
    run.study(900_000)
    const result = statistics(run.state, start + 900_000)
    expect(result.today.milliseconds).toBe(300_000)
    expect(result.today.completed).toBe(1)
    expect(result.week.milliseconds).toBe(900_000)
    expect(result.week.completed).toBe(1)
  })

  it('começa em zero e inclui tempo ativo confirmado sem inventar conclusão', () => {
    expect(statistics(initialState(), START).week).toEqual({
      milliseconds: 0,
      completed: 0,
      interrupted: 0,
    })
    const run = runner()
    run.command('start')
    run.study(7_500)
    const result = statistics(run.state, START)
    expect(result.today.milliseconds).toBe(7_500)
    expect(result.week.completed).toBe(0)
    expect(result.week.interrupted).toBe(0)
  })
})
