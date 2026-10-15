/*
 * O sintetizador é substituído por um contrato observável. Assim é possível
 *  conferir silêncio, volume, foco e deduplicação sem depender da saída de som.
 */

import { describe, expect, it, vi } from 'vitest'
import { SoundService, cues } from './SoundService'

function fixture() {
  let now = 1000
  const synth = { play: vi.fn(async () => {}), stop: vi.fn(), dispose: vi.fn() }
  const create = vi.fn(() => synth)
  const service = new SoundService(create, () => now)
  return { synth, create, service, advance: () => { now += 200 } }
}
describe('efeitos centralizados', () => {
  it('fica silencioso no carregamento, desativado e antes de interação manual', () => {
    const f = fixture()
    f.service.play('primary')
    f.service.configure(true, .2)
    f.service.play('pomodoro', { userInitiated: false })
    expect(f.create).not.toHaveBeenCalled()
  })
  it('limita rajadas, deduplica o ID de confirmação e mantém volume independente', () => {
    const f = fixture()
    f.service.configure(true, .15)
    f.service.play('correct', { id: 'card-1' })
    f.service.play('incorrect', { id: 'card-2' })
    f.advance()
    f.service.play('correct', { id: 'card-1' })
    expect(f.synth.play).toHaveBeenCalledTimes(1)
    expect(f.synth.play).toHaveBeenCalledWith(cues.correct, .15)
    f.service.play('pomodoro', { userInitiated: false, id: 'session-1' })
    expect(f.synth.play).toHaveBeenCalledTimes(2)
  })
  it('silencia imediatamente ao desativar, suprimir ou zerar volume', () => {
    const f = fixture()
    f.service.configure(true, .2)
    f.service.play('primary')
    f.advance(); f.service.configure(true, .2, true); f.service.play('flip')
    f.advance(); f.service.configure(false, .2); f.service.play('primary')
    f.advance(); f.service.configure(true, 0); f.service.play('primary')
    expect(f.synth.play).toHaveBeenCalledTimes(1)
    expect(f.synth.stop).toHaveBeenCalled()
  })
  it('trata falta de áudio sem afetar a interface e libera recursos', async () => {
    const f = fixture()
    f.synth.play.mockRejectedValue(Error('audio unavailable'))
    f.service.configure(true, .2)
    f.service.play('primary')
    await Promise.resolve(); await Promise.resolve()
    expect(f.service.getSnapshot().error).toMatch(/indisponíveis/)
    f.service.dispose()
    expect(f.synth.dispose).toHaveBeenCalledTimes(1)
  })
  it('ignora falha assíncrona de um recurso já liberado', async () => {
    const f = fixture()
    let fail!: (reason: Error) => void
    f.synth.play.mockImplementation(() => new Promise<void>((_resolve, reject) => { fail = reject }))
    f.service.configure(true, .2)
    f.service.play('primary')
    f.service.dispose()
    fail(Error('late'))
    await Promise.resolve(); await Promise.resolve()
    expect(f.service.getSnapshot().error).toBe('')
  })
})
