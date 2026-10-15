/**
 * Estes tipos separam o conteúdo da trilha daquilo que a interface calcula.
 * Uma região descreve arte, posição, atividades e requisitos; a versão de exibição
 * acrescenta estado e contagem. Assim, os componentes não precisam inventar regras
 * de desbloqueio. Os nomes acessíveis usam os mesmos rótulos da legenda.
 */

export type TrailState = 'completed' | 'current' | 'available' | 'locked' | 'perfect'
export type ActivityKind = 'lesson' | 'practice' | 'review' | 'challenge'
export type MapPosition = Readonly<{ x: number; y: number }>
export type TrailActivity = Readonly<{
  id: string
  title: string
  kind: ActivityKind
  objective: string
  requiredActivityIds: readonly string[]
}>
export type TrailRegion = Readonly<{
  id: string
  name: string
  description: string
  position: MapPosition
  labelPlacement: 'above' | 'below'
  requiredActivityIds: readonly string[]
  activities: readonly TrailActivity[]
}>
export type TrailDemoProgress = Readonly<{
  completedActivityIds: readonly string[]
  perfectActivityIds: readonly string[]
  currentActivityId: string | null
}>
export type ActivityView = TrailActivity & { state: TrailState; missingRequirements: readonly string[] }
export type RegionView = Omit<TrailRegion, 'activities'> & {
  state: TrailState
  completed: number
  activities: readonly ActivityView[]
  missingRequirements: readonly string[]
}
export type TrailView = {
  regions: readonly RegionView[]
  currentRegionId: string | null
  completed: number
  total: number
  percent: number
}

export const stateLabels: Record<TrailState, string> = {
  completed: 'Concluída', current: 'Atual', available: 'Disponível', locked: 'Bloqueada', perfect: 'Perfeita',
}
export const activityLabels: Record<ActivityKind, string> = {
  lesson: 'Aula', practice: 'Prática', review: 'Revisão', challenge: 'Desafio',
}
