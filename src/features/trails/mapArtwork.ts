/**
 * O registro da arte concentra caminho e dimensão do mapa oficial.
 * O componente também aceita ausência do arquivo: nesse caso, informa o problema
 * e mantém as posições demonstrativas, sem buscar uma paisagem substituta.
 * A cópia pública precisa continuar idêntica à fonte aprovada em art/.
 */

export type WorldMapArtwork = Readonly<{ src: string; width: number; height: number }>

// A cópia pública é idêntica a art/Mapa_test.png. Também aceitamos ausência da arte,
// sem solicitar um arquivo inexistente ou substituir a paisagem aprovada.
export const officialWorldMap: WorldMapArtwork | null = {
  src: '/assets/maps/mathquest-world.png', width: 1672, height: 941,
}
