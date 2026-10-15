/**
 * Este resumo recebe o progresso já calculado pelo domínio.
 * A barra não deve aumentar por selecionar uma região ou abrir uma prévia.
 * A identificação demonstrativa ajuda a separar esses números dos registros
 * reais de foco e revisão que o estudante guarda no navegador.
 */

import { Card, ProgressBar } from '../../components/ui'
import type { TrailView } from '../../domain/trails/model'
import styles from './TrailsPage.module.css'

export function TrailProgress({ trail }: { trail: TrailView }) {
  return <Card label="Progresso demonstrativo da jornada" className={styles.progressCard}>
    <div><span className={styles.eyebrow}>SUA TRILHA EM NÚMEROS</span><strong>{trail.completed} <small>de {trail.total} atividades demo concluídas</small></strong></div>
    <ProgressBar label="Progresso demonstrativo da trilha" value={trail.percent} className="mq-progress--static" />
    <span className={styles.percent}>{trail.percent}%</span>
  </Card>
}
