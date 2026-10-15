/*
 * O ambiente de testes oferece o que o DOM simulado não implementa, como a rolagem
 *  até um elemento. A limpeza após cada caso impede que uma tela contamine a seguinte.
 */

import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(cleanup)
if (typeof Element !== 'undefined') Element.prototype.scrollIntoView = vi.fn()
