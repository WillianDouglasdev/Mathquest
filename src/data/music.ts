/**
 * O catálogo começa vazio de propósito: não há faixa fictícia que pareça tocável.
 * Para incluir uma música, o arquivo precisa estar em public/audio e ter origem,
 * autor e licença registrados. O serviço limita o catálogo a três faixas locais;
 * esta etapa não usa streaming ou busca automática de músicas.
 */

export type MusicTrack = {
  id: string
  title: string
  src: string
  author: string
  source: string
  license: string
  attribution: string
}
// Add only verified, licensed local files; never expose fictitious playable songs.
// See public/audio/README.md for the catalog and licensing checklist.
export const musicTracks: readonly MusicTrack[] = []
