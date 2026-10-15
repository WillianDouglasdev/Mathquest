/**
 * Esta entrega é uma bancada visual da Arena, claramente identificada na tela.
 * Escolher uma pose muda apenas os exemplos de diálogo e HP para permitir avaliar
 * a composição. Não existe resposta corrigida, dano acumulado ou recompensa salva.
 *
 * As amostras ficam separadas de um futuro motor para que a aprovação da arte
 * não vire uma decisão escondida sobre regras de jogo. O próximo passo depende
 * da validação visual; IA e XP global continuam fora desta fase.
 */

import { useState } from 'react'
import { Badge, Button, Card } from '../../components/ui'
import { useSounds } from '../experience/SoundProvider'
import { BattleScene } from './BattleScene'
import { guardianLabels, guardianStates, type GuardianState } from './arenaArtwork'
import styles from './ArenaPage.module.css'

// São amostras para conferir a arte. Selecionar uma pose não calcula dano,
// conclui missão, salva progresso ou concede recompensas.
const previews: Record<GuardianState, { hp: number; dialogue: string; description: string }> = {
  // Estes valores não são acumulados entre cliques. Eles servem para conferir
  // como o HUD fica cheio, baixo e zerado antes de existir um motor de batalha.
  idle: {
    hp: 100,
    dialogue: 'Olá, jovem aventureiro! Nesta Arena, resolver e explicar caminham juntos. Cada descoberta faz parte da sua jornada.',
    description: 'O guardião aguarda o estudante na clareira.',
  },
  attack: {
    hp: 100,
    dialogue: 'Um desafio se aproxima! Observe com calma: um bom raciocínio começa por entender o problema.',
    description: 'Pose de ataque com o efeito de energia do pacote oficial.',
  },
  damage: {
    hp: 40,
    dialogue: 'Cada etapa bem explicada torna seu raciocínio mais forte. Continue explorando as ideias!',
    description: 'Pose de dano. O HP de 40 é apenas uma amostra visual.',
  },
  defeated: {
    hp: 0,
    dialogue: 'Toda jornada reserva novas descobertas. Vamos continuar aprendendo, uma aventura de cada vez!',
    description: 'Pose de derrota. O HP de 0 é apenas uma amostra visual.',
  },
}

export function ArenaPage() {
  const [state, setState] = useState<GuardianState>('idle')
  const play = useSounds()
  const preview = previews[state]
  return <div className={styles.page}>
    <div className={styles.pageHeading}>
      <div>
        <span className={styles.eyebrow}>SUA PRÓXIMA AVENTURA</span>
        <h1>MathQuest Arena</h1>
        <p>Resolva, explique e descubra a força do seu raciocínio.</p>
      </div>
      <Badge gold>Prévia visual</Badge>
    </div>
    <Card label="Encontro com o Guardião da Lógica" className={styles.sceneCard}>
      <BattleScene state={state} guardianHp={preview.hp} dialogue={preview.dialogue} />
    </Card>
    <Card label="Estados do guardião" className={styles.previewCard}>
      <div className={styles.previewHeading}>
        <h2>Conheça o Guardião da Lógica</h2>
        <p id="arena-preview-description">Escolha uma pose para conferir a cena. O HP é ilustrativo; não há batalha em andamento nem recompensas nesta prévia.</p>
      </div>
      <div className={styles.stateControls} role="group" aria-label="Poses do guardião" aria-describedby="arena-preview-description">
        {guardianStates.map(pose => <Button key={pose} variant={state === pose ? 'primary' : 'quiet'}
          aria-pressed={state === pose} sound={false}
          onClick={() => {
            if (state === pose) return
            setState(pose)
            play('select')
          }}>{guardianLabels[pose]}</Button>)}
      </div>
      <p className={styles.poseDescription}>{preview.description}</p>
    </Card>
  </div>
}
