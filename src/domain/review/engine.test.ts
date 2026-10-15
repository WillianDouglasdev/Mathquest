// @vitest-environment node
/*
 * As datas são escolhidas para conferir a agenda e as mudanças de dia de forma
 *  reproduzível. Duplicação e treino antecipado são regras, não só detalhes de botão.
 */

import { describe, expect, it } from 'vitest'
import { CONTENT_VERSION, flashcards, subjects } from '../../data/flashcards'
import { addReviewDays, reviewDay } from './calendar'
import {
  emptyReview,
  pendingCards,
  reviewTransition,
  schedule,
  subjectSummary,
  type CardProgress,
  type Mode,
  type Outcome,
  type ReviewSnapshot,
} from './engine'
import { decodeReview } from './persistence'

const START = Date.parse('2026-10-15T12:00:00-03:00')
function runner() {
  let snapshot = emptyReview(),
    now = START,
    sequence = 0
  const id = () => `id-${++sequence}`
  return {
    get snapshot() {
      return snapshot
    },
    get current() {
      return snapshot.round!.current!
    },
    setTime(value: number) {
      now = value
    },
    start(mode: Mode = 'scheduled') {
      snapshot = reviewTransition(
        snapshot,
        {
          type: 'start',
          mode,
          subject: 'operations',
          roundId: id(),
          presentationId: id(),
        },
        now,
      )
    },
    flip() {
      snapshot = reviewTransition(
        snapshot,
        { type: 'flip', presentationId: this.current.id },
        now,
      )
    },
    grade(outcome: Outcome = 'correct') {
      snapshot = reviewTransition(
        snapshot,
        { type: 'grade', presentationId: this.current.id, outcome },
        now,
      )
    },
    next() {
      snapshot = reviewTransition(
        snapshot,
        { type: 'next', presentationId: this.current.id, nextId: id() },
        now,
      )
    },
  }
}

describe('agenda pura de repetição espaçada', () => {
  it('avança os acertos para 3, 7, 14 e 30 dias, mantendo o teto de 30', () => {
    let progress: CardProgress | undefined
    let now = START
    for (const interval of [3, 7, 14, 30, 30]) {
      progress = schedule(progress, 'correct', now)
      expect(progress.intervalDays).toBe(interval)
      expect(progress.dueDate).toBe(addReviewDays(reviewDay(now), interval))
      now = Date.parse(`${progress.dueDate}T12:00:00-03:00`)
    }
    expect(progress?.correct).toBe(5)
    expect(progress?.incorrect).toBe(0)
  })

  it('erro agenda o próximo dia, zera a sequência e o próximo acerto volta a 3 dias', () => {
    let progress = schedule(undefined, 'correct', START)
    progress = schedule(progress, 'correct', START)
    progress = schedule(progress, 'incorrect', START)
    expect(progress).toMatchObject({
      correct: 2,
      incorrect: 1,
      streak: 0,
      intervalDays: 1,
      dueDate: '2026-10-16',
    })
    expect(schedule(progress, 'correct', START).intervalDays).toBe(3)
  })

  it.each([
    ['2026-12-31T23:59:59-03:00', 'incorrect', '2027-01-01'],
    ['2028-02-28T12:00:00-03:00', 'incorrect', '2028-02-29'],
    ['2028-02-28T12:00:00-03:00', 'correct', '2028-03-02'],
    ['2026-01-30T12:00:00-03:00', 'correct', '2026-02-02'],
    ['2018-11-03T23:59:00-03:00', 'incorrect', '2018-11-04'],
  ])('usa calendário civil: %s → %s → %s', (time, outcome, expected) => {
    expect(
      schedule(undefined, outcome as Outcome, Date.parse(time)).dueDate,
    ).toBe(expected)
  })

  it('considera novos e vencidos, com fronteira na meia-noite de São Paulo', () => {
    const run = runner()
    run.setTime(Date.parse('2026-10-15T23:59:00-03:00'))
    run.start()
    run.flip()
    run.grade('incorrect')
    expect(
      pendingCards(
        run.snapshot,
        'operations',
        Date.parse('2026-10-16T01:00:00Z'),
      ).some((card) => card.id === 'op-01'),
    ).toBe(false)
    expect(
      pendingCards(
        run.snapshot,
        'operations',
        Date.parse('2026-10-16T00:00:00-03:00'),
      ).some((card) => card.id === 'op-01'),
    ).toBe(true)
    expect(pendingCards(emptyReview(), 'all', START)).toHaveLength(30)
    expect(subjectSummary(run.snapshot, 'operations', START)).toMatchObject({
      total: 10,
      studied: 1,
      pending: 9,
      correct: 0,
      incorrect: 1,
    })
  })
})

describe('apresentações, duplicação e treino voluntário', () => {
  it('exige revelar e não avança automaticamente ao responder', () => {
    const run = runner()
    run.start()
    run.grade()
    run.next()
    expect(run.snapshot.history).toHaveLength(0)
    expect(run.snapshot.round?.position).toBe(0)
    run.flip()
    run.flip()
    run.grade()
    expect(run.snapshot.history).toHaveLength(0)
    run.flip()
    run.grade()
    expect(run.snapshot.history).toHaveLength(1)
    expect(run.snapshot.round?.position).toBe(0)
    expect(run.current.answer).toBe('correct')
  })

  it('ignora clique duplicado, resposta oposta e próximo com token antigo', () => {
    const run = runner()
    run.start()
    run.flip()
    const token = run.current.id
    run.grade()
    run.grade('incorrect')
    expect(run.snapshot.history).toHaveLength(1)
    expect(run.snapshot.progress['op-01']).toMatchObject({
      correct: 1,
      incorrect: 0,
    })
    run.next()
    const after = reviewTransition(
      run.snapshot,
      { type: 'next', presentationId: token, nextId: 'extra' },
      START,
    )
    expect(after).toBe(run.snapshot)
    expect(after.round?.position).toBe(1)
    expect(after.round?.current?.revealed).toBe(false)
  })

  it('treino antes do vencimento registra prática e não muda data, intervalo ou acertos agendados', () => {
    const run = runner()
    run.start()
    run.flip()
    run.grade()
    const before = structuredClone(run.snapshot.progress)
    run.start('practice')
    run.flip()
    run.grade('incorrect')
    expect(run.snapshot.progress).toEqual(before)
    expect(run.snapshot.history).toHaveLength(2)
    expect(run.snapshot.history[1].mode).toBe('practice')
    expect(run.snapshot.progress['op-01'].dueDate).toBe('2026-10-18')
  })

  it('treino de cartão novo não o apresenta como estudado/agendado', () => {
    const run = runner()
    run.start('practice')
    run.flip()
    run.grade()
    expect(subjectSummary(run.snapshot, 'operations', START)).toMatchObject({
      studied: 0,
      pending: 10,
      correct: 0,
      incorrect: 0,
    })
    expect(run.snapshot.history[0].outcome).toBe('correct')
  })

  it('conclui uma fila de 10 cartões sem repeti-los e volta com zero pendentes', () => {
    const run = runner()
    run.start()
    for (let index = 0; index < 10; index++) {
      run.flip()
      run.grade()
      run.next()
    }
    expect(run.snapshot.round?.current).toBeNull()
    expect(run.snapshot.round?.position).toBe(10)
    expect(run.snapshot.history).toHaveLength(10)
    expect(
      new Set(run.snapshot.history.map((event) => event.cardId)).size,
    ).toBe(10)
    expect(pendingCards(run.snapshot, 'operations', START)).toHaveLength(0)
    expect(decodeReview(JSON.stringify(run.snapshot))).toEqual(run.snapshot)
  })

  it('pausa o registro com relógio anterior ao último evento', () => {
    const run = runner()
    run.start()
    run.flip()
    run.grade()
    expect(() =>
      reviewTransition(
        run.snapshot,
        {
          type: 'start',
          roundId: 'back',
          presentationId: 'back-card',
          subject: 'all',
          mode: 'practice',
        },
        START - 1,
      ),
    ).toThrow(/relógio/)
  })
})

describe('integridade do snapshot', () => {
  it('recupera frente, verso e resposta já registrada sem duplicação', () => {
    const run = runner()
    run.start()
    expect(
      decodeReview(JSON.stringify(run.snapshot)).round?.current?.revealed,
    ).toBe(false)
    run.flip()
    expect(
      decodeReview(JSON.stringify(run.snapshot)).round?.current?.revealed,
    ).toBe(true)
    run.grade()
    const loaded = decodeReview(JSON.stringify(run.snapshot))
    expect(
      reviewTransition(
        loaded,
        { type: 'grade', presentationId: run.current.id, outcome: 'incorrect' },
        START,
      ),
    ).toBe(loaded)
  })

  it('rejeita duplicação do histórico, contadores adulterados e rodada inconsistente', () => {
    const run = runner()
    run.start()
    run.flip()
    run.grade()
    const duplicate = {
      ...run.snapshot,
      history: [...run.snapshot.history, ...run.snapshot.history],
    }
    expect(() => decodeReview(JSON.stringify(duplicate))).toThrow()
    const modified = structuredClone(run.snapshot)
    modified.progress['op-01'].correct = 9
    expect(() => decodeReview(JSON.stringify(modified))).toThrow()
    const skipped = structuredClone(run.snapshot)
    skipped.round!.position = 5
    expect(() => decodeReview(JSON.stringify(skipped))).toThrow()
  })

  it('rejeita registro agendado antecipado mesmo com outro identificador', () => {
    const run = runner()
    run.start()
    run.flip()
    run.grade()
    const forged = structuredClone(run.snapshot)
    forged.history.push({
      ...forged.history[0],
      id: 'other-presentation',
      roundId: 'other-round',
    })
    expect(() => decodeReview(JSON.stringify(forged))).toThrow(/vencimento/)
  })

  it('rejeita JSON corrompido, versões desconhecidas e cartões inexistentes', () => {
    expect(() => decodeReview('{')).toThrow()
    expect(() =>
      decodeReview(JSON.stringify({ ...emptyReview(), schemaVersion: 99 })),
    ).toThrow()
    expect(() =>
      decodeReview(
        JSON.stringify({
          ...emptyReview(),
          contentVersion: CONTENT_VERSION + 1,
        }),
      ),
    ).toThrow()
    const run = runner()
    run.start()
    const invalid: ReviewSnapshot = structuredClone(run.snapshot)
    invalid.round!.queue[0] = 'not-a-card'
    expect(() => decodeReview(JSON.stringify(invalid))).toThrow()
  })
})

describe('conteúdo matemático predefinido', () => {
  it('contém exatamente 30 IDs únicos, 10 por assunto e todos os campos', () => {
    expect(flashcards).toHaveLength(30)
    expect(new Set(flashcards.map((card) => card.id)).size).toBe(30)
    for (const subject of Object.keys(subjects))
      expect(
        flashcards.filter((card) => card.subject === subject),
      ).toHaveLength(10)
    for (const card of flashcards) {
      expect(card.question.length).toBeGreaterThan(8)
      expect(card.answer.length).toBeGreaterThan(0)
      expect(card.explanation.length).toBeGreaterThan(15)
    }
  })

  it('confere as 30 respostas com operações e razões independentes', () => {
    const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
    const fraction = (a: number, b: number) => {
      const divisor = gcd(a, b)
      return `${a / divisor}/${b / divisor}`
    }
    const money = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`
    const answers: Record<string, string> = {
      'op-01': String(27 + 15),
      'op-02': String(63 - 28),
      'op-03': String(8 * 7),
      'op-04': String(72 / 9),
      'op-05': String(3 + 4 * 2),
      'op-06': String((18 - 6) / 3),
      'op-07': String(-5 + 8),
      'op-08': String(-4 * -3),
      'op-09': String(2 ** 3),
      'op-10': money(12 / 3),
      'fr-01': fraction(6, 8),
      'fr-02': `${1 * 5}/${2 * 5}`,
      'fr-03': fraction(1 + 2, 4),
      'fr-04': fraction(1 * 3 + 1 * 2, 2 * 3),
      'fr-05': fraction(3 - 2, 4),
      'fr-06': fraction(2 * 3, 3 * 5),
      'fr-07': fraction(3 * 2, 4 * 1),
      'fr-08': 3 / 4 > 2 / 3 ? '3/4' : '2/3',
      'fr-09': String((20 * 3) / 5),
      'fr-10': (1 / 4).toLocaleString('pt-BR'),
      'pc-01': String((80 * 10) / 100),
      'pc-02': String((200 * 25) / 100),
      'pc-03': String((100 * 15) / 100),
      'pc-04': money(150 * 0.8),
      'pc-05': money(80 * 1.1),
      'pc-06': `${(30 / 120) * 100}%`,
      'pc-07': `${0.35 * 100}%`,
      'pc-08': String((50 * 12) / 100),
      'pc-09': money(100 * 0.8 * 0.9),
      'pc-10': `${((250 - 200) / 200) * 100}%`,
    }
    for (const card of flashcards)
      expect(card.answer, card.id).toBe(answers[card.id])
  })
})
