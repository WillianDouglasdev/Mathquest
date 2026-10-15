/**
 * Este hook responde se vale a pena manter um personagem animado neste momento.
 * Não basta o elemento existir no DOM: ele precisa estar suficientemente visível,
 * com a aba aberta para leitura e fora de uma região escondida ou inerte.
 *
 * Sem suporte à observação de viewport, a escolha é conservadora: manter a imagem
 * estática. Todos os observadores e listeners pertencem ao efeito e são removidos
 * juntos, evitando que navegações acumulem trabalho em segundo plano.
 */

import { useEffect, useState, type RefObject } from 'react'

export function useCharacterVisibility(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(false)
    const element = ref.current
    // Conservative fallback: without viewport observation, use the still image.
    if (!enabled || !element || typeof IntersectionObserver === 'undefined') return
    let intersecting = false
    const publish = () => setVisible(intersecting && document.visibilityState === 'visible' && !element.closest('[inert], [hidden]'))
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.target === element) intersecting = entry.isIntersecting && entry.intersectionRatio >= .15
      publish()
    }, { threshold: [0, .15] })
    observer.observe(element)
    const inertObserver = new MutationObserver(publish)
    inertObserver.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['inert', 'hidden'] })
    document.addEventListener('visibilitychange', publish)
    return () => { observer.disconnect(); inertObserver.disconnect(); document.removeEventListener('visibilitychange', publish) }
  }, [ref, enabled])
  return visible
}
