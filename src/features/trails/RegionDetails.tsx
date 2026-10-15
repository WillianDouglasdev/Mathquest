/**
 * O painel explica a região selecionada e os requisitos de acesso.
 * As verificações também aparecem nas ações, além do estado visual dos botões,
 * para não abrir uma atividade bloqueada por um caminho alternativo da interface.
 * Conteúdo em preparação é apresentado como prévia, sem prometer uma aula pronta.
 */

import { Badge, Button, Card, ProgressBar } from '../../components/ui'
import { activityLabels, stateLabels, type ActivityView, type RegionView } from '../../domain/trails/model'
import { canPreview } from '../../domain/trails/progress'
import styles from './TrailsPage.module.css'

export function RegionDetails({ region, describeRequirement, onPreview }: {
  region: RegionView; describeRequirement: (id: string) => string; onPreview: (activity: ActivityView) => void
}) {
  const next = region.activities.find(activity => activity.state === 'current')
    ?? region.activities.find(activity => activity.state === 'available') ?? region.activities.find(activity => canPreview(activity.state))
  return <Card id="region-details" label="Detalhes da região selecionada" className={styles.details}>
    <span className={styles.eyebrow}>SUA PRÓXIMA DESCOBERTA</span>
    <h2 id="region-details-title" tabIndex={-1}>{region.name}</h2>
    <Badge>{stateLabels[region.state]}</Badge>
    <p className={styles.description}>{region.description}</p>
    <div className={styles.regionProgress}><span>{region.completed} / {region.activities.length} atividades demo</span>
      <ProgressBar label={`Progresso de ${region.name}`} value={region.completed / region.activities.length * 100} className="mq-progress--static" />
    </div>
    {region.missingRequirements.length > 0 && <div className={styles.requirements} id="region-requirements">
      <strong>Para desbloquear</strong><ul>{region.missingRequirements.map(id => <li key={id}>{describeRequirement(id)}</li>)}</ul>
    </div>}
    <Button className={styles.regionAction} disabled={region.state === 'locked' || !next} sound="open"
      aria-describedby={region.state === 'locked' ? 'region-requirements' : undefined}
      onClick={() => { if (next && canPreview(next.state) && canPreview(region.state)) onPreview(next) }}>
      {region.state === 'locked' ? 'Região bloqueada' : region.state === 'current' ? 'Continuar exploração' : region.state === 'completed' || region.state === 'perfect' ? 'Revisitar região' : 'Explorar região'}
    </Button>
    <h3 className={styles.activitiesTitle}>Nesta região</h3>
    <ul className={styles.activities}>
      {region.activities.map(activity => <li key={activity.id}>
        <div className={styles.activityHeading}><strong>{activityLabels[activity.kind]}</strong><span>{stateLabels[activity.state]}</span></div>
        <p>{activity.title}</p>
        {activity.state === 'locked' && region.state !== 'locked' && <small>{activity.missingRequirements.map(describeRequirement).join(' ')}</small>}
        <Button variant="quiet" sound="open" disabled={!canPreview(activity.state)}
          aria-label={`Ver prévia de ${activity.title}`} onClick={() => { if (canPreview(activity.state)) onPreview(activity) }}>Ver prévia</Button>
      </li>)}
    </ul>
    <p className={styles.demoNote}>Prévia demonstrativa. Aulas e exercícios definitivos ainda não estão disponíveis. Nenhuma ação aqui concede XP.</p>
  </Card>
}
