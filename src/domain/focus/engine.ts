/**
 * O motor do Pomodoro não conhece React, localStorage ou intervalos do navegador.
 * Ele recebe estado, comando e dois relógios, e devolve o próximo estado. Essa
 * separação permite testar pausas, atrasos e recuperação sem esperar minutos reais.
 *
 * O ponto mais delicado é o tempo confirmado. Um intervalo JavaScript pode atrasar,
 * e o relógio civil pode mudar. Por isso, a contagem usa o relógio monotônico e
 * confere sua coerência com o horário civil. Lacunas grandes não viram estudo
 * automaticamente: a sessão é pausada para não premiar um período sem confirmação.
 */

export const durations = [15, 25, 50] as const
export type Duration = (typeof durations)[number]
export type SessionStatus = 'running' | 'paused' | 'completed' | 'interrupted'
export type TimePoint = { monotonicMs: number; wallMs: number }
export type Segment = { start: number; end: number }
export type Session = {
  id: string
  minutes: Duration
  status: SessionStatus
  startedAt: number
  elapsedMs: number
  segments: Segment[]
  endedAt: number | null
  reason: 'goal' | 'manual' | 'restart' | null
}
export type Snapshot = {
  schemaVersion: 1
  minutes: Duration
  current: Session | null
  history: Session[]
}
export type FocusState = Snapshot & { anchor: TimePoint | null; notice: string }
export type Command =
  | { type: 'start'; id: string }
  | { type: 'select'; minutes: Duration }
  | { type: 'tick' | 'pause' | 'resume' | 'finish' | 'reset' }

// Lacunas longas não comprovam estudo contínuo e não recebem crédito de tempo.
export const MAX_GAP_MS = 15_000
export const CLOCK_TOLERANCE_MS = 2_000
export const isActive = (session: Session | null) =>
  session?.status === 'running' || session?.status === 'paused'
export const emptySnapshot = (): Snapshot => ({
  schemaVersion: 1,
  minutes: 25,
  current: null,
  history: [],
})
export const initialState = (): FocusState => ({
  ...emptySnapshot(),
  anchor: null,
  notice: '',
})
export const remainingMs = (state: FocusState) =>
  Math.max(0, state.minutes * 60_000 - (state.current?.elapsedMs ?? 0))

export function snapshotOf(state: FocusState): Snapshot {
  return {
    schemaVersion: 1,
    minutes: state.minutes,
    current: state.current,
    history: state.history,
  }
}

export function restore(snapshot: Snapshot, recoverRunning = true): FocusState {
  // Reabrir uma aba não comprova que o estudante continuou focado durante a ausência.
  // A âncora é descartada e a retomada precisa de uma ação explícita do usuário.
  const recovered = recoverRunning && snapshot.current?.status === 'running'
  return {
    ...snapshot,
    current: recovered
      ? { ...snapshot.current!, status: 'paused' }
      : snapshot.current,
    anchor: null,
    notice: recovered
      ? 'Sessão recuperada em pausa. O tempo de ausência não foi contabilizado.'
      : '',
  }
}

function archive(state: FocusState, session: Session): FocusState {
  return {
    ...state,
    current: session,
    anchor: null,
    history: [
      ...state.history.filter((item) => item.id !== session.id),
      session,
    ],
  }
}

function advance(state: FocusState, now: TimePoint): FocusState {
  const session = state.current
  const anchor = state.anchor
  if (session?.status !== 'running' || !anchor) return state
  const elapsed = now.monotonicMs - anchor.monotonicMs
  const civilElapsed = now.wallMs - anchor.wallMs
  /*
   * Os dois relógios têm funções diferentes: o monotônico mede duração; o civil
   * localiza os trechos no calendário. Se eles deixam de concordar, somar a lacuna
   * poderia registrar suspensão do computador ou ajuste de hora como estudo.
   */
  if (
    elapsed < 0 ||
    civilElapsed < 0 ||
    elapsed > MAX_GAP_MS ||
    Math.abs(civilElapsed - elapsed) > CLOCK_TOLERANCE_MS
  ) {
    return {
      ...state,
      current: { ...session, status: 'paused' },
      anchor: null,
      notice:
        'Detectamos uma interrupção ou mudança de relógio. A sessão foi pausada sem contabilizar a lacuna.',
    }
  }
  if (!elapsed) return state
  const accepted = Math.min(
    elapsed,
    session.minutes * 60_000 - session.elapsedMs,
  )
  const segments = session.segments.slice()
  // A última atualização pode passar da meta por alguns milissegundos.
  // O limite acima garante que o histórico receba somente o tempo da sessão.
  const last = segments.at(-1)
  // Preservamos a continuidade dos trechos apesar do arredondamento do relógio.
  const start =
    last && Math.abs(last.end - anchor.wallMs) < 5
      ? last.end
      : Math.max(last?.end ?? 0, anchor.wallMs)
  if (last && start === last.end)
    segments[segments.length - 1] = { start: last.start, end: start + accepted }
  else segments.push({ start, end: start + accepted })
  const current = {
    ...session,
    elapsedMs: session.elapsedMs + accepted,
    segments,
  }
  if (current.elapsedMs >= current.minutes * 60_000) {
    return {
      ...archive(state, {
        ...current,
        status: 'completed',
        endedAt: start + accepted,
        reason: 'goal',
      }),
      notice:
        'Sessão concluída! Seu tempo de foco foi registrado. Uma pequena pausa vai bem.',
    }
  }
  return { ...state, current, anchor: now }
}

export function transition(
  state: FocusState,
  command: Command,
  now: TimePoint,
): FocusState {
  if (!Number.isFinite(now.monotonicMs) || !Number.isFinite(now.wallMs))
    return state
  if (command.type === 'select') {
    if (isActive(state.current) || !durations.includes(command.minutes))
      return state
    return {
      ...state,
      minutes: command.minutes,
      current: null,
      anchor: null,
      notice: '',
    }
  }
  if (command.type === 'start') {
    if (
      isActive(state.current) ||
      !command.id ||
      state.history.some((session) => session.id === command.id)
    )
      return state
    return {
      ...state,
      anchor: now,
      notice: 'Sessão iniciada. Um passo de cada vez.',
      current: {
        id: command.id,
        minutes: state.minutes,
        status: 'running',
        startedAt: now.wallMs,
        elapsedMs: 0,
        segments: [],
        endedAt: null,
        reason: null,
      },
    }
  }
  if (command.type === 'resume') {
    if (state.current?.status !== 'paused') return state
    return {
      ...state,
      current: { ...state.current, status: 'running' },
      anchor: now,
      notice: 'Foco retomado. Bom estudo!',
    }
  }
  const advanced = advance(state, now)
  // Confirmar o último trecho antes de pausar/finalizar evita perder a fração
  // estudada desde a última atualização da interface.
  if (command.type === 'tick') return advanced
  if (command.type === 'pause') {
    return advanced.current?.status === 'running'
      ? {
          ...advanced,
          current: { ...advanced.current, status: 'paused' },
          anchor: null,
          notice: 'Em pausa. Continue quando estiver pronto.',
        }
      : advanced
  }
  if (command.type === 'finish' || command.type === 'reset') {
    const ended = isActive(advanced.current)
      ? archive(advanced, {
          ...advanced.current!,
          status: 'interrupted',
          endedAt: Math.max(
            now.wallMs,
            advanced.current!.segments.at(-1)?.end ??
              advanced.current!.startedAt,
          ),
          reason: command.type === 'reset' ? 'restart' : 'manual',
        })
      : advanced
    if (command.type === 'reset')
      return {
        ...ended,
        current: null,
        anchor: null,
        notice:
          'Cronômetro reiniciado. O tempo anterior permanece no histórico; inicie quando quiser.',
      }
    return ended !== advanced
      ? {
          ...ended,
          notice:
            'Sessão interrompida. O tempo ativo foi salvo, sem contar uma conclusão.',
        }
      : ended
  }
  return advanced
}
