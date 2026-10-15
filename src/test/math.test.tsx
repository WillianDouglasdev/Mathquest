/*
 * As expressões precisam ter apresentação matemática e um nome textual acessível.
 *  A forma de mostrar uma fração não deve alterar o conteúdo educacional original.
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MathText } from '../components/MathText'

describe('apresentação matemática', () => {
  it('mantém o nome acessível original e estrutura frações nativas', () => {
    const { container } = render(<h3><MathText text="Quanto é 1/2 + 1/3?" /></h3>)
    expect(screen.getByRole('heading', { name: 'Quanto é 1/2 + 1/3?' })).toBeVisible()
    expect(container.querySelectorAll('math mfrac')).toHaveLength(2)
    expect(container.querySelector('math')?.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML')
    expect(container.querySelector('mfrac')?.textContent).toBe('12')
  })
  it('apresenta expoentes sem interpretar HTML ou executar expressões', () => {
    const { container } = render(<MathText text="2³ = 8 <script>erro</script>" />)
    expect(container.querySelector('msup')?.textContent).toBe('23')
    expect(container.querySelector('script')).toBeNull()
  })
  it('preserva textos sem fórmulas, valores brasileiros e sinais', () => {
    render(<MathText text="Desconto de 20%: R$ 120,00; −5 + 8 = 3." />)
    expect(screen.getByText('Desconto de 20%: R$ 120,00; −5 + 8 = 3.')).toBeVisible()
  })
})
