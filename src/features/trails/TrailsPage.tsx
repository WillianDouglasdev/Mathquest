/**
 * A página mantém a região selecionada como estado de interface. Essa escolha
 * não muda a atividade atual da trilha e não desloca o estudante para um ponto
 * bloqueado só porque alguém quis ler seus detalhes.
 *
 * As ações disponíveis abrem uma prévia de conteúdo, sem registrar conclusão.
 * O catálogo e o seletor de progresso ficam fora do JSX para manter a mesma
 * regra de acesso no mapa e no painel lateral.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Dialog } from '../../components/ui'
import { trailDemoProgress, trailRegions } from '../../data/trails'
import { activityLabels, stateLabels, type ActivityView } from '../../domain/trails/model'
import { canPreview, deriveTrail } from '../../domain/trails/progress'
import { MapLegend } from './MapLegend'
import { RegionDetails } from './RegionDetails'
import { TrailProgress } from './TrailProgress'
import { WorldMap } from './WorldMap'
import styles from './TrailsPage.module.css'

const trail = deriveTrail(trailRegions, trailDemoProgress)

export function TrailsPage() {
  const [selectedId, setSelectedId] = useState(trail.currentRegionId ?? trail.regions[0].id)
  const [preview, setPreview] = useState<{ regionName: string; activity: ActivityView } | null>(null)
  const selected = trail.regions.find(region => region.id === selectedId) ?? trail.regions[0]
  const describeRequirement = (id: string) => {
    const region = trail.regions.find(item => item.activities.some(activity => activity.id === id))
    const activity = region?.activities.find(item => item.id === id)
    return activity && region ? `Conclua “${activity.title}”, em ${region.name}.` : 'Conclua a atividade anterior.'
  }
  return <div className={styles.page}>
    <header className={styles.pageHeading}>
      <div><p className={styles.eyebrow}>CADA DESCOBERTA ABRE UM NOVO CAMINHO</p><h1>Trilha de Matemática Básica</h1>
        <p>Explore o mundo, conheça as regiões e encontre sua próxima aventura.</p></div>
      <div className={styles.headingAside}><Badge>Trilha demonstrativa</Badge><Link to="/" data-ui-sound="navigate">← Voltar ao início</Link></div>
    </header>
    <TrailProgress trail={trail} />
    <p className={styles.demoIntro}>Progresso ilustrativo desta trilha: explorar e abrir prévias não altera seus estudos, seu perfil ou seu XP.</p>
    <div className={styles.layout}>
      <div className={styles.mapColumn}>
        <WorldMap regions={trail.regions} selectedId={selected.id} currentRegionId={trail.currentRegionId} onSelect={setSelectedId} />
        <MapLegend />
      </div>
      <RegionDetails region={selected} describeRequirement={describeRequirement} onPreview={activity => {
        if (canPreview(selected.state) && canPreview(activity.state)) setPreview({ regionName: selected.name, activity })
      }} />
    </div>
    <p className="srOnly" role="status">{selected.name} selecionada. Estado: {stateLabels[selected.state]}.</p>
    {preview && <Dialog title={`Prévia: ${preview.activity.title}`} onClose={() => setPreview(null)}>
      <Badge>Conteúdo em preparação</Badge>
      <p className={styles.previewMeta}>{preview.regionName} · {activityLabels[preview.activity.kind]}</p>
      <h3>Seu objetivo</h3><p>{preview.activity.objective}</p>
      <p className={styles.previewNote}>Esta é uma prévia de navegação. O conteúdo educacional será disponibilizado em uma próxima entrega; não há exercícios, conclusão automática ou recompensas nesta tela.</p>
    </Dialog>}
  </div>
}
