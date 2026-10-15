/**
 * Este catálogo liga as seis regiões à arte oficial do mapa. As coordenadas são
 * percentuais da imagem inteira, e não da largura disponível na tela; por isso
 * os pontos continuam sobre os mesmos lugares durante a exploração no celular.
 *
 * Cada região apresenta quatro tipos de atividade. As dependências e os IDs de
 * conclusão alimentam o seletor do domínio, que calcula os estados. O progresso
 * abaixo é demonstrativo e fica separado do estudo real salvo em Revisão e Foco.
 */

import type { ActivityKind, TrailActivity, TrailDemoProgress, TrailRegion } from '../domain/trails/model'

const activities = (id: string, subject: string, objectives: readonly [string, string, string, string]): readonly TrailActivity[] => {
  const kinds: ActivityKind[] = ['lesson', 'practice', 'review', 'challenge']
  const titles = ['Primeiros passos', 'Vamos praticar', 'Hora de lembrar', 'Desafio da região']
  return kinds.map((kind, index) => ({
    id: `${id}-${kind}`, title: `${titles[index]}: ${subject}`, kind, objective: objectives[index],
    requiredActivityIds: kind === 'lesson' ? [] : kind === 'challenge'
      ? [`${id}-practice`, `${id}-review`] : [`${id}-lesson`],
  }))
}

// Os pontos correspondem aos centros das seis clareiras na arte aprovada de 1672×941.
// As coordenadas são percentuais da imagem inteira, sem considerar recortes da tela.
export const trailRegions: readonly TrailRegion[] = [
  {
    id: 'campo', name: 'Campo dos Números', description: 'Sua jornada começa entre os campos. Reconheça os números que dão forma ao mundo.',
    position: { x: 13.76, y: 71.63 }, labelPlacement: 'below', requiredActivityIds: [],
    activities: activities('campo', 'números naturais', ['Reconhecer e ordenar números naturais.', 'Comparar números em situações do dia a dia.', 'Recordar valor posicional e sequências.', 'Interpretar uma sequência de números.']),
  },
  {
    id: 'vila', name: 'Vila das Operações', description: 'Na vila, cada pequena tarefa é uma oportunidade de descobrir como as operações se conectam.',
    position: { x: 31.7, y: 65.04 }, labelPlacement: 'above', requiredActivityIds: ['campo-challenge'],
    activities: activities('vila', 'operações fundamentais', ['Relacionar adição, subtração, multiplicação e divisão.', 'Escolher operações para resolver situações simples.', 'Relembrar a ordem das operações.', 'Planejar a solução de um problema com operações.']),
  },
  {
    id: 'floresta', name: 'Floresta das Frações', description: 'Explore as clareiras da floresta e descubra como partes diferentes podem formar o mesmo todo.',
    position: { x: 44.2, y: 55.47 }, labelPlacement: 'below', requiredActivityIds: ['vila-challenge'],
    activities: activities('floresta', 'frações', ['Identificar numerador, denominador e partes do todo.', 'Comparar frações e reconhecer equivalências.', 'Recordar representações de frações.', 'Escolher uma estratégia para comparar frações.']),
  },
  {
    id: 'ponte', name: 'Ponte da Proporção', description: 'Depois da ponte, aprenda a reconhecer relações que crescem ou diminuem juntas.',
    position: { x: 63.7, y: 61.85 }, labelPlacement: 'below', requiredActivityIds: ['vila-challenge', 'floresta-lesson'],
    activities: activities('ponte', 'razão e proporção', ['Reconhecer uma razão entre duas quantidades.', 'Relacionar grandezas em exemplos cotidianos.', 'Relembrar razões equivalentes.', 'Interpretar uma situação de proporcionalidade.']),
  },
  {
    id: 'montanha', name: 'Montanha das Porcentagens', description: 'Suba a montanha para enxergar porcentagens como partes de cem e compreender seus usos.',
    position: { x: 86.3, y: 49.73 }, labelPlacement: 'below', requiredActivityIds: ['ponte-challenge'],
    activities: activities('montanha', 'porcentagem', ['Relacionar porcentagem, fração e decimal.', 'Interpretar porcentagens em preços e quantidades.', 'Recordar porcentagens frequentes.', 'Planejar o cálculo de um desconto.']),
  },
  {
    id: 'torre', name: 'Torre do Conhecimento', description: 'O castelo reúne as descobertas do caminho. Uma chegada para celebrar o que você aprendeu.',
    position: { x: 91.15, y: 34.22 }, labelPlacement: 'above', requiredActivityIds: ['floresta-challenge', 'montanha-challenge'],
    activities: activities('torre', 'conexões matemáticas', ['Relacionar os assuntos explorados na trilha.', 'Escolher ferramentas matemáticas para um problema.', 'Revisar as principais ideias da jornada.', 'Combinar estratégias em um desafio final.']),
  },
]

export const trailDemoProgress: TrailDemoProgress = {
  completedActivityIds: [...trailRegions[0].activities, ...trailRegions[1].activities].map(activity => activity.id).concat('floresta-lesson'),
  perfectActivityIds: trailRegions[0].activities.map(activity => activity.id),
  currentActivityId: 'floresta-practice',
}
