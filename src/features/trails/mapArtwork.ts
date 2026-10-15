/**
 * O registro da arte concentra caminho e dimensão do mapa oficial.
 * O componente também aceita ausência do arquivo: nesse caso, informa o problema
 * e mantém as posições demonstrativas, sem buscar uma paisagem substituta.
 * A cópia pública precisa continuar idêntica à fonte aprovada em art/.
 */

export type WorldMapArtwork = Readonly<{ src: string; width: number; height: number }>

// Byte-identical runtime copy of art/Mapa_test.png. Null is also supported,
// without fetching a missing file or substituting another landscape.
export const officialWorldMap: WorldMapArtwork | null = {
  src: '/assets/maps/mathquest-world.png', width: 1672, height: 941,
}
