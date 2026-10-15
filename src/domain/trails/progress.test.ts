// @vitest-environment node
/*
 * O seletor é testado sem renderizar o mapa. A mesma entrada precisa produzir
 *  estados e contagens coerentes, inclusive com IDs repetidos ou requisitos pendentes.
 */

import { describe, expect, it } from 'vitest'
import { trailDemoProgress, trailRegions } from '../../data/trails'
import { canPreview, deriveTrail } from './progress'

describe('progresso demonstrativo da trilha', () => {
  it('deriva os cinco estados e conta perfeitas uma única vez', () => {
    const result = deriveTrail(trailRegions, trailDemoProgress)
    expect(result.regions.map(region => region.state)).toEqual(['perfect', 'completed', 'current', 'available', 'locked', 'locked'])
    expect(result).toMatchObject({ completed: 9, total: 24, percent: 38, currentRegionId: 'floresta' })
    expect(result.regions[2].activities.map(activity => activity.state)).toEqual(['completed', 'current', 'available', 'locked'])
    expect(trailRegions[2]).not.toHaveProperty('state')
  })
  it('desbloqueia a região e as atividades exclusivamente pelos pré-requisitos', () => {
    const progress = { ...trailDemoProgress, completedActivityIds: [...trailDemoProgress.completedActivityIds, 'ponte-lesson', 'ponte-practice', 'ponte-review', 'ponte-challenge'] }
    const mountain = deriveTrail(trailRegions, progress).regions[4]
    expect(mountain.state).toBe('available')
    expect(mountain.activities[0].state).toBe('available')
    expect(mountain.activities[3].state).toBe('locked')
    expect(mountain.activities[3].missingRequirements).toEqual(['montanha-practice', 'montanha-review'])
  })
  it('não permite perfeição sem conclusão e ignora IDs e repetições estranhos ao catálogo', () => {
    const result = deriveTrail(trailRegions, { completedActivityIds: ['campo-lesson', 'campo-lesson', 'unknown'], perfectActivityIds: trailRegions[0].activities.map(a => a.id), currentActivityId: 'unknown' })
    expect(result.completed).toBe(1)
    expect(result.regions[0].state).toBe('current')
    expect(result.regions[0].activities.map(a => a.state)).toEqual(['perfect', 'current', 'available', 'locked'])
    expect(canPreview(result.regions[1].state)).toBe(false)
  })
  it('trata trilha vazia ou totalmente concluída sem personagem atual fictício', () => {
    expect(deriveTrail([], trailDemoProgress)).toMatchObject({ completed: 0, total: 0, percent: 0, currentRegionId: null })
    const ids = trailRegions.flatMap(region => region.activities.map(activity => activity.id))
    const result = deriveTrail(trailRegions, { completedActivityIds: ids, perfectActivityIds: ids, currentActivityId: 'campo-lesson' })
    expect(result).toMatchObject({ completed: 24, total: 24, percent: 100, currentRegionId: null })
    expect(result.regions.every(region => region.state === 'perfect')).toBe(true)
  })
  it('mantém IDs, dependências e coordenadas válidos no catálogo de seis regiões', () => {
    const regionIds = trailRegions.map(region => region.id)
    const activities = trailRegions.flatMap(region => region.activities)
    const ids = activities.map(activity => activity.id)
    expect(new Set(regionIds).size).toBe(6)
    expect(new Set(ids).size).toBe(24)
    for (const region of trailRegions) {
      expect(region.activities.map(activity => activity.kind)).toEqual(['lesson', 'practice', 'review', 'challenge'])
      expect(region.position.x).toBeGreaterThan(0); expect(region.position.x).toBeLessThan(100)
      expect(region.position.y).toBeGreaterThan(0); expect(region.position.y).toBeLessThan(100)
      for (const id of region.requiredActivityIds) expect(ids).toContain(id)
    }
    for (const activity of activities) for (const id of activity.requiredActivityIds) {
      expect(ids).toContain(id)
      expect(id).not.toBe(activity.id)
    }
  })
})
