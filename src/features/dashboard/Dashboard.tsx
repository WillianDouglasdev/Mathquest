/**
 * O Dashboard apresenta a visão geral da aventura e preserva os cards aprovados.
 * Seus valores de perfil e ranking vêm dos dados demonstrativos; os botões de
 * conteúdo ainda indisponível abrem uma prévia identificada.
 *
 * O atalho de foco consulta o Pomodoro existente, em vez de manter outro contador
 * nesta página. Assim, sair de Revisão e Foco não interrompe o estudo nem cria
 * uma segunda sessão escondida atrás do resumo visual.
 */

import { Link } from 'react-router-dom'
import { StudentAvatar } from '../../components/StudentAvatar'
import { RankingList, Search, type OpenModal } from '../../app/App'
import {
  Arrow,
  Badge,
  Button,
  Card,
  PixelArt,
  ProgressBar,
} from '../../components/ui'
import { formatNumber, modules, profile } from '../../data/demo'
import styles from './Dashboard.module.css'
import { FocusShortcut } from '../focus/FocusShortcut'

export function Dashboard({ openModal }: { openModal: OpenModal }) {
  const previewStudy = (mission = false) =>
    openModal(
      mission
        ? 'Sua missão: praticar frações'
        : 'Próximo desafio: comparando frações',
      <>
        <PixelArt name={mission ? 'target' : 'book'} size={65} />
        <p>
          {mission
            ? 'A missão será resolver 5 exercícios de frações e ganhar 100 XP.'
            : 'Neste desafio você vai comparar frações e descobrir qual representa a maior parte de um todo.'}
        </p>
        <p>
          Esta é uma prévia do Dashboard. Os exercícios e o registro de
          progresso entram na próxima fase, após a revisão visual.
        </p>
        <Badge>Disponível na próxima fase</Badge>
      </>,
    )

  return (
    <>
      <div className={styles.welcome}>
        <div className={styles.greeting}>
          <StudentAvatar variant="full" size={88} motion="idle" />
          <div>
            <div className={styles.eyebrow}>
              BOM TE VER POR AQUI, AVENTUREIRO
            </div>
            <h1>Olá, Estudante!</h1>
            <p>Um novo dia. Uma nova conquista na matemática.</p>
          </div>
        </div>
        <Search />
      </div>
      <FocusShortcut />
      <div className={styles.grid}>
        <Card id="trilha" label="Sua trilha atual" className={styles.trail}>
          <div className={styles.trailHeading}>
            <PixelArt name="book" size={65} />
            <div>
              <div className={styles.label}>SUA TRILHA ATUAL</div>
              <h2>Matemática Básica</h2>
            </div>
            <Link to="/trilhas" className={styles.smallLink} data-ui-sound="navigate">
              Ver trilha <Arrow />
            </Link>
          </div>
          <div className={styles.trailProgress}>
            <ProgressBar
              value={profile.trailPercent}
              label="Progresso da trilha"
            />
            <strong>{profile.trailPercent}%</strong>
          </div>
          <div className={styles.lessonCount}>
            {profile.completedLessons} de {profile.totalLessons} lições
            concluídas <span>Sua próxima parada: frações</span>
          </div>
          <ol className={styles.moduleList}>
            {modules.map((module) => (
              <li key={module.name} className={styles[module.status]}>
                <button
                  aria-label={`${module.name}: ${module.status === 'completed' ? 'concluído' : module.status === 'current' ? 'módulo atual' : 'bloqueado'}`}
                  data-ui-sound="open"
                  onClick={() =>
                    openModal(
                      module.name,
                      <>
                        <PixelArt
                          name={module.status === 'locked' ? 'lock' : 'book'}
                          size={60}
                        />
                        <p>
                          {module.status === 'completed'
                            ? 'Este módulo aparece como concluído no perfil demo. A revisão de lições será liberada na próxima fase.'
                            : module.status === 'current'
                              ? 'Este é o módulo atual do perfil demo. Explicações, exemplos e exercícios serão adicionados na fase de aprendizagem.'
                              : 'Na trilha completa, este módulo será liberado depois da conclusão da etapa anterior.'}
                        </p>
                        <Badge>Prévia da trilha</Badge>
                      </>,
                    )
                  }
                >
                  <span className={styles.moduleIcon}>
                    {module.status === 'completed' ? (
                      <span className={styles.check} />
                    ) : (
                      <PixelArt
                        name={module.status === 'current' ? 'flag' : 'lock'}
                        size={28}
                      />
                    )}
                  </span>
                  <span>{module.short}</span>
                </button>
              </li>
            ))}
          </ol>
        </Card>
        <Card label="Seu nível e experiência" className={styles.level}>
          <div className={styles.levelTop}>
            <div className={styles.levelShield}>
              <PixelArt name="shield" size={106} />
              <div>
                <span>NÍVEL</span>
                <strong>{profile.level}</strong>
              </div>
            </div>
            <div className={styles.levelProgress}>
              <div>
                <strong>{profile.xp}</strong>
                <span> / {formatNumber(profile.nextLevelXp)} XP</span>
              </div>
              <ProgressBar
                value={(profile.xp / profile.nextLevelXp) * 100}
                label="Experiência até o próximo nível"
                className="mq-progress--static"
              />
              <small>EXPLORE. APRENDA. EVOLUA.</small>
            </div>
          </div>
          <div className={styles.mascotMessage}>
            <PixelArt name="slime" size={77} />
            <div>
              Faltam <strong>{profile.nextLevelXp - profile.xp} XP</strong> para
              o nível {profile.level + 1}.<br />
              Sua próxima conquista está logo ali!
            </div>
            <span className={`${styles.sparkle} mq-sparkle`} aria-hidden="true">
              ✦
            </span>
          </div>
        </Card>
        <Card label="Sequência de estudos" className={styles.streak}>
          <div className={styles.cardHeading}>
            <h2>
              <PixelArt name="fire" size={33} />
              Sequência de estudos
            </h2>
            <Badge>{profile.streak} dias seguidos!</Badge>
          </div>
          <div className={styles.week}>
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(
              (day, index) => (
                <div key={day}>
                  <span
                    className={
                      index < 6 ? styles.dayComplete : styles.dayLocked
                    }
                    aria-label={`${day}: ${index < 6 ? 'concluído na demonstração' : 'próxima meta'}`}
                  >
                    {index < 6 ? (
                      <span className={styles.check} />
                    ) : (
                      <PixelArt name="shield" size={25} />
                    )}
                  </span>
                  <span>{day}</span>
                </div>
              ),
            )}
          </div>
          <p className={styles.streakNote}>
            Só mais um dia para conquistar seu escudo!
          </p>
        </Card>
        <Card id="missao" label="Missão do dia" className={styles.mission}>
          <div className={styles.cardHeading}>
            <h2>
              <PixelArt name="target" size={35} />
              Missão do dia
            </h2>
            <Badge gold>+ 100 XP</Badge>
          </div>
          <div className={styles.missionBody}>
            <div className={styles.missionInfo}>
              <PixelArt name="flag" size={60} />
              <div>
                <h3>
                  Um pequeno passo,
                  <br />
                  cinco novas descobertas.
                </h3>
                <p>Resolva 5 exercícios de frações</p>
                <div className={styles.missionProgress}>
                  <ProgressBar value={0} label="Progresso da missão" />
                  <span>0 / 5</span>
                </div>
              </div>
            </div>
            <Button sound="mission" onClick={() => previewStudy(true)}>
              Continuar missão <Arrow />
            </Button>
          </div>
        </Card>
        <Card id="desafio" label="Próximo desafio" className={styles.challenge}>
          <div className={styles.cardHeading}>
            <h2>
              <PixelArt name="trophy" size={34} />
              Seu próximo desafio
            </h2>
          </div>
          <div className={styles.challengeBody}>
            <div
              className={styles.challengeArt}
              role="img"
              aria-label="Duas placas de frações em um cenário de aventura"
            >
              <div className={styles.fraction}>
                <span>1</span>
                <span>2</span>
              </div>
              <span className={styles.versus}>?</span>
              <div className={styles.fraction}>
                <span>3</span>
                <span>4</span>
              </div>
            </div>
            <div className={styles.challengeCopy}>
              <Badge>PRATIQUE SEU CONHECIMENTO</Badge>
              <h3>Comparando frações</h3>
              <p>
                Qual fração é maior?
                <br />
                Use sua lógica e descubra!
              </p>
              <div className={styles.challengeMeta}>
                <span>
                  <span className={styles.bars} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>{' '}
                  Nível fácil
                </span>
                <span>
                  <span className={styles.clock} aria-hidden="true" /> ~ 10 min
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="blue"
            className={styles.fullButton}
            onClick={() => previewStudy()}
            sound="mission"
          >
            Iniciar desafio <Arrow />
          </Button>
        </Card>
        <Card
          id="ranking"
          label="Ranking semanal demonstrativo"
          className={styles.ranking}
        >
          <div className={styles.cardHeading}>
            <h2>
              <PixelArt name="trophy" size={34} />
              Ranking semanal
            </h2>
            <button
              className={styles.textButton}
              data-ui-sound="open"
              onClick={() =>
                openModal(
                  'Ranking semanal completo',
                  <>
                    <p>
                      Estes participantes e pontuações são fictícios. A
                      classificação demonstra a interface da MathQuest.
                    </p>
                    <RankingList />
                    <Badge>Ranking demonstrativo</Badge>
                  </>,
                )
              }
            >
              Ver ranking <Arrow />
            </button>
          </div>
          <div className={styles.rankingBody}>
            <div className={styles.rankingTable}>
              <span className={styles.demoLabel}>
                CLASSIFICAÇÃO DEMONSTRATIVA
              </span>
              <RankingList />
            </div>
            <div className={styles.record}>
              <div className={styles.recordLabel}>SEU RECORDE PESSOAL</div>
              <strong>{profile.record} XP</strong>
              <span>em um único dia</span>
              <PixelArt name="trophy" size={76} />
              <p>
                Seu próximo recorde
                <br />
                começa com um passo.
              </p>
            </div>
          </div>
        </Card>
      </div>
      <div className={styles.bottomNote}>
        <PixelArt name="slime" size={27} />
        <span>
          Você não precisa saber tudo para começar.{' '}
          <strong>Só precisa dar o primeiro passo.</strong>
        </span>
      </div>
    </>
  )
}
