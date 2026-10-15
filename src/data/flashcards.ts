/**
 * O primeiro baralho é local e predefinido: dez cartões para cada assunto.
 * Pergunta, resposta e explicação ficam juntas para facilitar a revisão pedagógica.
 *
 * Os identificadores fazem parte do vínculo com o progresso salvo. Corrigir um texto
 * não exige trocar o ID; uma mudança incompatível no catálogo precisa considerar
 * a versão do conteúdo e a recuperação dos dados que já existem no navegador.
 */

export const subjects = {
  operations: 'Operações fundamentais',
  fractions: 'Frações',
  percentage: 'Porcentagem',
} as const
export type Subject = keyof typeof subjects
export type SubjectFilter = Subject | 'all'
export type Flashcard = {
  id: string
  subject: Subject
  question: string
  answer: string
  explanation: string
}
export const CONTENT_VERSION = 1

// Curated local content: stable IDs, no runtime generation or external service.
export const flashcards: readonly Flashcard[] = [
  {
    id: 'op-01',
    subject: 'operations',
    question: 'Quanto é 27 + 15?',
    answer: '42',
    explanation: 'Some 27 + 10 = 37 e depois mais 5: 42.',
  },
  {
    id: 'op-02',
    subject: 'operations',
    question: 'Quanto é 63 − 28?',
    answer: '35',
    explanation: '63 − 20 = 43. Depois, 43 − 8 = 35.',
  },
  {
    id: 'op-03',
    subject: 'operations',
    question: 'Quanto é 8 × 7?',
    answer: '56',
    explanation: 'Multiplicar 8 por 7 é somar sete grupos de oito: 56.',
  },
  {
    id: 'op-04',
    subject: 'operations',
    question: 'Quanto é 72 ÷ 9?',
    answer: '8',
    explanation: 'Como 9 × 8 = 72, a divisão de 72 por 9 é 8.',
  },
  {
    id: 'op-05',
    subject: 'operations',
    question: 'Quanto é 3 + 4 × 2?',
    answer: '11',
    explanation:
      'Faça a multiplicação primeiro: 4 × 2 = 8. Depois, 3 + 8 = 11.',
  },
  {
    id: 'op-06',
    subject: 'operations',
    question: 'Quanto é (18 − 6) ÷ 3?',
    answer: '4',
    explanation: 'Resolva os parênteses: 18 − 6 = 12. Então, 12 ÷ 3 = 4.',
  },
  {
    id: 'op-07',
    subject: 'operations',
    question: 'Quanto é −5 + 8?',
    answer: '3',
    explanation: 'Partindo de −5 e avançando 8 unidades, você chega a 3.',
  },
  {
    id: 'op-08',
    subject: 'operations',
    question: 'Quanto é (−4) × (−3)?',
    answer: '12',
    explanation:
      'O produto de dois números negativos é positivo. Como 4 × 3 = 12, o resultado é 12.',
  },
  {
    id: 'op-09',
    subject: 'operations',
    question: 'Quanto é 2³?',
    answer: '8',
    explanation: 'O expoente 3 indica três fatores iguais a 2: 2 × 2 × 2 = 8.',
  },
  {
    id: 'op-10',
    subject: 'operations',
    question: 'Três cadernos iguais custam R$ 12,00. Quanto custa cada um?',
    answer: 'R$ 4,00',
    explanation: 'Divida o preço total pela quantidade: 12 ÷ 3 = 4 reais.',
  },
  {
    id: 'fr-01',
    subject: 'fractions',
    question: 'Qual é a forma simplificada de 6/8?',
    answer: '3/4',
    explanation: 'Divida numerador e denominador por 2: 6 ÷ 2 = 3 e 8 ÷ 2 = 4.',
  },
  {
    id: 'fr-02',
    subject: 'fractions',
    question: 'Qual fração de denominador 10 é equivalente a 1/2?',
    answer: '5/10',
    explanation:
      'Multiplique numerador e denominador por 5. O valor da fração permanece o mesmo.',
  },
  {
    id: 'fr-03',
    subject: 'fractions',
    question: 'Quanto é 1/4 + 2/4?',
    answer: '3/4',
    explanation:
      'Com denominadores iguais, some os numeradores e mantenha o denominador: (1 + 2)/4 = 3/4.',
  },
  {
    id: 'fr-04',
    subject: 'fractions',
    question: 'Quanto é 1/2 + 1/3?',
    answer: '5/6',
    explanation:
      'Use denominador comum 6: 1/2 = 3/6 e 1/3 = 2/6. A soma é 5/6.',
  },
  {
    id: 'fr-05',
    subject: 'fractions',
    question: 'Quanto é 3/4 − 1/2?',
    answer: '1/4',
    explanation: 'Escreva 1/2 como 2/4. Assim, 3/4 − 2/4 = 1/4.',
  },
  {
    id: 'fr-06',
    subject: 'fractions',
    question: 'Quanto é (2/3) × (3/5)?',
    answer: '2/5',
    explanation:
      'Multiplique numeradores e denominadores: 6/15. Simplificando por 3, obtemos 2/5.',
  },
  {
    id: 'fr-07',
    subject: 'fractions',
    question: 'Quanto é (3/4) ÷ (1/2)?',
    answer: '3/2',
    explanation:
      'Multiplique pela inversa da segunda fração: (3/4) × (2/1) = 6/4 = 3/2.',
  },
  {
    id: 'fr-08',
    subject: 'fractions',
    question: 'Qual fração é maior: 2/3 ou 3/4?',
    answer: '3/4',
    explanation:
      'Em doze avos, 2/3 = 8/12 e 3/4 = 9/12. Portanto, 3/4 é maior.',
  },
  {
    id: 'fr-09',
    subject: 'fractions',
    question: 'Quanto é 3/5 de 20?',
    answer: '12',
    explanation: 'Divida 20 por 5 e multiplique por 3: 4 × 3 = 12.',
  },
  {
    id: 'fr-10',
    subject: 'fractions',
    question: 'Como escrever 1/4 em número decimal?',
    answer: '0,25',
    explanation: 'Divida 1 por 4. Outra forma é escrever 1/4 = 25/100 = 0,25.',
  },
  {
    id: 'pc-01',
    subject: 'percentage',
    question: 'Quanto é 10% de 80?',
    answer: '8',
    explanation: '10% é um décimo. Divida 80 por 10: o resultado é 8.',
  },
  {
    id: 'pc-02',
    subject: 'percentage',
    question: 'Quanto é 25% de 200?',
    answer: '50',
    explanation: '25% equivale a 1/4. Divida 200 por 4: 50.',
  },
  {
    id: 'pc-03',
    subject: 'percentage',
    question: 'Quanto é 15% de 100?',
    answer: '15',
    explanation: '15% significa 15 de cada 100. Portanto, 15% de 100 é 15.',
  },
  {
    id: 'pc-04',
    subject: 'percentage',
    question:
      'Um produto de R$ 150,00 tem 20% de desconto. Qual é o preço final?',
    answer: 'R$ 120,00',
    explanation:
      'O desconto é 150 × 0,20 = 30 reais. Subtraia do preço original: 150 − 30 = 120.',
  },
  {
    id: 'pc-05',
    subject: 'percentage',
    question: 'Um valor de R$ 80,00 aumenta 10%. Qual é o novo valor?',
    answer: 'R$ 88,00',
    explanation: '10% de 80 é 8. Some o aumento ao valor inicial: 80 + 8 = 88.',
  },
  {
    id: 'pc-06',
    subject: 'percentage',
    question:
      '30 estudantes de uma turma de 120 usam bicicleta. Qual é a porcentagem?',
    answer: '25%',
    explanation: 'A razão é 30/120 = 1/4. Multiplicando por 100, obtemos 25%.',
  },
  {
    id: 'pc-07',
    subject: 'percentage',
    question: 'Como escrever 0,35 em porcentagem?',
    answer: '35%',
    explanation: 'Multiplique o número decimal por 100: 0,35 × 100 = 35%.',
  },
  {
    id: 'pc-08',
    subject: 'percentage',
    question: 'Quanto é 12% de 50?',
    answer: '6',
    explanation: 'Converta 12% em 0,12 e multiplique: 0,12 × 50 = 6.',
  },
  {
    id: 'pc-09',
    subject: 'percentage',
    question:
      'Um produto de R$ 100,00 recebe descontos sucessivos de 20% e 10%. Qual é o preço final?',
    answer: 'R$ 72,00',
    explanation:
      'Após 20%, o preço é 80 reais. O segundo desconto é 10% de 80, ou 8 reais. O preço final é 72 reais.',
  },
  {
    id: 'pc-10',
    subject: 'percentage',
    question:
      'Um preço passa de R$ 200,00 para R$ 250,00. Qual foi o aumento percentual?',
    answer: '25%',
    explanation:
      'O aumento foi de 50 reais. Compare com o valor inicial: 50/200 = 0,25 = 25%.',
  },
]

export const findFlashcard = (id: string) =>
  flashcards.find((card) => card.id === id)
