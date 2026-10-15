/**
 * O mapa é uma projeção do catálogo e dos dados de progresso recebidos.
 * Este seletor não salva nada: selecionar uma região ou abrir sua prévia não
 * equivale a concluir uma atividade.
 *
 * Os requisitos são calculados por ID, e a região atual vem de uma atividade
 * acessível. Quando o ID atual não serve mais, a primeira atividade acessível é
 * usada como referência. Concluída e perfeita continuam contando uma única vez.
 */

import type { TrailDemoProgress, TrailRegion, TrailState, TrailView } from './model'

export const canPreview = (state: TrailState) => state !== 'locked'

// Estes seletores apenas consultam: explorar o mapa não registra estudo concluído.
export function deriveTrail(regions: readonly TrailRegion[], progress: TrailDemoProgress): TrailView {
  const completed = new Set(progress.completedActivityIds)
  // O catálogo define o total da trilha. IDs repetidos ou que nem pertencem a ele
  // não devem inflar a porcentagem apresentada ao estudante.
  const perfect = new Set(progress.perfectActivityIds)
  const missing = (ids: readonly string[]) => [...new Set(ids)].filter(id => !completed.has(id))
  const entries = regions.flatMap(region => region.activities.map(activity => ({ region, activity })))
  const accessible = entries.filter(({ region, activity }) => !completed.has(activity.id)
    && missing([...region.requiredActivityIds, ...activity.requiredActivityIds]).length === 0)
  const current = accessible.find(({ activity }) => activity.id === progress.currentActivityId) ?? accessible[0]
  // Selecionar uma região na interface é outra coisa: este ponto atual só muda
  // quando os dados de progresso usados na projeção mudam.
  const views = regions.map(region => {
    const done = region.activities.filter(activity => completed.has(activity.id)).length
    const allDone = region.activities.length > 0 && done === region.activities.length
    const requirements = missing(region.requiredActivityIds)
    const state: TrailState = allDone
      ? region.activities.every(activity => perfect.has(activity.id)) ? 'perfect' : 'completed'
      : requirements.length ? 'locked' : current?.region.id === region.id ? 'current' : 'available'
    return {
      ...region, state, completed: done, missingRequirements: requirements,
      activities: region.activities.map(activity => {
        const requirements = missing([...region.requiredActivityIds, ...activity.requiredActivityIds])
        const state: TrailState = completed.has(activity.id)
          ? perfect.has(activity.id) ? 'perfect' : 'completed'
          : requirements.length ? 'locked' : current?.activity.id === activity.id ? 'current' : 'available'
        return { ...activity, state, missingRequirements: requirements }
      }),
    }
  })
  const done = views.reduce((sum, region) => sum + region.completed, 0)
  return { regions: views, currentRegionId: current?.region.id ?? null, completed: done, total: entries.length,
    percent: entries.length ? Math.round(done / entries.length * 100) : 0 }
}
