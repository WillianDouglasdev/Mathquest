/**
 * Os números deste arquivo são dados de apresentação: ajudam a conferir nível,
 * ranking, sequência e a composição do Dashboard enquanto o perfil é demonstrativo.
 * Não são um histórico de aprendizagem nem devem receber os resultados reais
 * do Pomodoro ou dos flashcards. Os atalhos da busca também pertencem a essa prévia.
 */

export const profile = {
  name: 'Estudante',
  level: 12,
  xp: 730,
  nextLevelXp: 1000,
  trailPercent: 28,
  completedLessons: 7,
  totalLessons: 25,
  streak: 6,
  weeklyXp: 1730,
  record: 320,
} as const

export const modules = [
  { name: 'Operações fundamentais', short: 'Operações', status: 'completed' },
  { name: 'Números e frações', short: 'Números e frações', status: 'current' },
  { name: 'Razão e proporção', short: 'Razão e proporção', status: 'locked' },
  { name: 'Porcentagem', short: 'Porcentagem', status: 'locked' },
  { name: 'Álgebra inicial', short: 'Álgebra inicial', status: 'locked' },
  {
    name: 'Leitura de dados e estatística básica',
    short: 'Dados e estatística',
    status: 'locked',
  },
] as const

export const ranking = [
  { name: 'Lívia', xp: 2430, color: 'purple' },
  { name: 'Pedro', xp: 1980, color: 'blue' },
  { name: 'Você', xp: profile.weeklyXp, color: 'green' },
  { name: 'Mariana', xp: 1520, color: 'pink' },
  { name: 'Lucas', xp: 1310, color: 'gold' },
] as const

export const shortcuts = [
  { title: 'Matemática Básica', detail: 'Sua trilha atual', target: 'trilha' },
  { title: 'Missão do dia', detail: 'Exercícios de frações', target: 'missao' },
  {
    title: 'Comparando frações',
    detail: 'Seu próximo desafio',
    target: 'desafio',
  },
  {
    title: 'Ranking semanal',
    detail: 'Classificação demonstrativa',
    target: 'ranking',
  },
] as const

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('pt-BR').format(value)

export function findShortcuts(query: string) {
  const normalize = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  const term = normalize(query.trim())
  return term
    ? shortcuts.filter((item) =>
        normalize(`${item.title} ${item.detail}`).includes(term),
      )
    : []
}
