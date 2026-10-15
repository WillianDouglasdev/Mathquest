/**
 * Este registro aponta apenas para o cenário e as quatro poses oficiais.
 * Referências de composição continuam em art/ e não entram como fundo funcional.
 * Os PNGs públicos preservam os bytes, a transparência e as dimensões da origem;
 * interface, textos e HP serão sempre camadas independentes.
 */

// Runtime copies are byte-identical to art/assets/. References/previews stay in art/.
export const arenaBackground = {
  src: '/assets/arena/background/arena-forest-ruins.png',
  width: 1536,
  height: 418,
} as const

export const guardianStates = ['idle', 'attack', 'damage', 'defeated'] as const
export type GuardianState = (typeof guardianStates)[number]
export const guardianLabels: Record<GuardianState, string> = {
  idle: 'Em repouso', attack: 'Ataque', damage: 'Dano', defeated: 'Derrota',
}
export const guardianArtwork = {
  width: 1254,
  height: 1254,
  sources: {
    idle: '/assets/arena/guardian/guardian-idle.png',
    attack: '/assets/arena/guardian/guardian-attack.png',
    damage: '/assets/arena/guardian/guardian-damage.png',
    defeated: '/assets/arena/guardian/guardian-defeated.png',
  },
} as const
