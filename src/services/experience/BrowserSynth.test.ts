/*
 * A Web Audio API é simulada para observar agendamento e liberação das vozes.
 *  Um teste não deve deixar osciladores ou conexões ativos depois de terminar.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { BrowserSynth } from './BrowserSynth'

afterEach(() => vi.unstubAllGlobals())
describe('recursos do sintetizador', () => {
  it('cria o contexto sob demanda, limita vozes e desconecta/fecha ao liberar', async () => {
    const oscillators: { stop: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>; onended: null | (() => void) }[] = []
    const gains: { disconnect: ReturnType<typeof vi.fn> }[] = []
    const close = vi.fn(async () => {})
    const createContext = vi.fn(function () { return {
      state: 'running', currentTime: 0, destination: {}, close,
      createOscillator: () => { const node = { type: '', frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(), stop: vi.fn(), disconnect: vi.fn(), onended: null }; oscillators.push(node); return node },
      createGain: () => { const node = { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() }; gains.push(node); return node },
    } })
    vi.stubGlobal('AudioContext', createContext)
    const synth = new BrowserSynth()
    expect(createContext).not.toHaveBeenCalled()
    await synth.play([[440, .035]], .2)
    await synth.play([[523, .06]], .2)
    expect(createContext).toHaveBeenCalledTimes(1)
    expect(oscillators[0].disconnect).toHaveBeenCalled()
    synth.dispose()
    expect(oscillators[1].disconnect).toHaveBeenCalled()
    expect(gains.every(g => g.disconnect.mock.calls.length > 0)).toBe(true)
    expect(close).toHaveBeenCalledTimes(1)
  })
})
