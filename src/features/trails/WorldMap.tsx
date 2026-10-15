/**
 * O cenário e os pontos têm responsabilidades distintas: a imagem cuida da
 * paisagem; React cuida de seleção, rótulos e personagem. As coordenadas usam a
 * proporção completa da arte, inclusive quando o viewport mostra só uma parte.
 *
 * Em telas menores, a área é explorável horizontalmente para manter os pontos
 * legíveis. As setas só deslocam o mapa quando o próprio viewport tem foco;
 * dentro dos botões, o comportamento nativo de teclado é preservado.
 */

import { useRef, useState } from 'react'
import { Button, Card } from '../../components/ui'
import type { RegionView } from '../../domain/trails/model'
import { MapCharacter } from './MapCharacter'
import { MapNode } from './MapNode'
import { officialWorldMap, type WorldMapArtwork } from './mapArtwork'
import styles from './TrailsPage.module.css'

export function WorldMap({ regions, selectedId, currentRegionId, onSelect, artwork = officialWorldMap }: {
  regions: readonly RegionView[]; selectedId: string; currentRegionId: string | null
  onSelect: (id: string) => void; artwork?: WorldMapArtwork | null
}) {
  const viewport = useRef<HTMLDivElement>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const [loaded, setLoaded] = useState<(WorldMapArtwork & { natural: true }) | null>(null)
  const image = artwork && artwork.src !== failedSrc ? artwork : null
  const dimensions = image && loaded?.src === image.src ? loaded : image ?? { width: 1672, height: 941 }
  const current = regions.find(region => region.id === currentRegionId)
  return <Card className={styles.mapCard} label="Mapa de aventura matemática">
    <div className={styles.mapToolbar}>
      <div><h2>Seu mundo de descobertas</h2><p>Seis regiões. Uma aventura de cada vez.</p></div>
      <div className={styles.mapActions}>
        <Button variant="quiet" sound="navigate" disabled={!current} onClick={() => {
          if (!current) return
          onSelect(current.id)
          document.getElementById(`map-region-${current.id}`)?.focus()
        }}>Região atual</Button>
        <Button variant="quiet" sound={false} onClick={() => document.getElementById('region-details-title')?.focus()}>Ver detalhes</Button>
      </div>
    </div>
    {!image && <p role="status" className={styles.artworkNotice}>
      <strong>{artwork ? 'Não foi possível carregar o mapa oficial.' : 'O mapa oficial ainda não foi adicionado.'}</strong>
      {' '}A área abaixo mostra somente posições de demonstração. Nenhuma outra paisagem foi utilizada.
    </p>}
    <p id="map-instructions" className={styles.mapInstructions}>Deslize para explorar o mapa. Use Tab e Enter nos pontos; as setas deslocam a área quando ela está em foco.</p>
    <div ref={viewport} className={styles.mapViewport} tabIndex={0} role="group" aria-label="Área explorável do mapa"
      aria-describedby="map-instructions" onKeyDown={event => {
        if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          event.currentTarget.scrollLeft += event.key === 'ArrowRight' ? 240 : -240
        }
      }}>
      <div className={`${styles.world} ${!image ? styles.worldEmpty : ''}`} style={{ aspectRatio: `${dimensions.width} / ${dimensions.height}` }}>
        {image && <img className={styles.worldImage} src={image.src} width={image.width} height={image.height}
          alt="" aria-hidden="true" decoding="async" fetchPriority="high"
          onError={() => setFailedSrc(image.src)} onLoad={event => {
            const { naturalWidth, naturalHeight } = event.currentTarget
            if (naturalWidth > 0 && naturalHeight > 0) setLoaded({ src: image.src, width: naturalWidth, height: naturalHeight, natural: true })
          }} />}
        <ol className={styles.mapNodes} aria-label="Regiões da trilha">
          {regions.map(region => <MapNode key={region.id} region={region} selected={selectedId === region.id} onSelect={onSelect} />)}
        </ol>
        <MapCharacter region={current} />
      </div>
    </div>
    <p className={styles.mapFootnote}>Os caminhos fazem parte da arte. Pontos, estados e estudante são elementos interativos independentes.</p>
  </Card>
}
