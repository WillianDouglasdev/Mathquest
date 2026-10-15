/**
 * A leitura da matemática precisa continuar confortável, mesmo em uma interface
 * retrô. Frações e potências simples usam MathML nativo, sem um pacote grande
 * de renderização para o conjunto pequeno de expressões deste MVP.
 *
 * A versão textual fica disponível para leitura assistiva. Este componente só
 * apresenta conteúdo: não interpreta respostas nem altera as regras dos cartões.
 */

import { Fragment, createElement } from 'react'
import styles from './MathText.module.css'

// Presentation only: keep source strings/IDs and educational rules unchanged.
// Native MathML avoids a large formula runtime for the predefined content.
const token = /(\d+\/\d+|\d+[²³])/g
export function MathText({ text }: { text: string }) {
  const parts = text.split(token)
  if (parts.length === 1) return <>{text}</>
  return (
    <span className={styles.text}>
      <span className="srOnly">{text}</span>
      <span aria-hidden="true">
        {parts.map((part, index) => {
          let expression
          if (/^\d+\/\d+$/.test(part)) {
            const [top, bottom] = part.split('/')
            expression = createElement('mfrac', null,
              createElement('mn', null, top), createElement('mn', null, bottom))
          } else if (/^\d+[²³]$/.test(part)) {
            expression = createElement('msup', null,
              createElement('mn', null, part.slice(0, -1)),
              createElement('mn', null, part.endsWith('²') ? '2' : '3'))
          }
          return expression
            ? createElement('math', { key: index, xmlns: 'http://www.w3.org/1998/Math/MathML', display: 'inline' }, expression)
            : <Fragment key={index}>{part}</Fragment>
        })}
      </span>
    </span>
  )
}
