# MathQuest — Pacote de animações v1

Animações derivadas dos três PNGs aprovados, sem redesenhar personagens. Movimentos: idle (deslocamento vertical discreto) e celebrate (pequeno salto + brilhos).

## Uso
Copie `characters/` para `frontend/public/assets/animations/characters/`.

```tsx
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
<img src={reducedMotion ? '/assets/animations/characters/student-portrait-still.png' : '/assets/animations/characters/student-portrait-idle.webp'} alt="Estudante aventureiro" style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
```

Para preferências reativas do usuário, utilize um hook de media query e configuração de Modo Foco. Os arquivos de comemoração são loops; se desejar um efeito de execução única, controle a exibição via componente/estado e troque para idle após 1s. Animar com WebP não garante pausa nativa: use a variante estática no Modo Foco.

**Importante:** mantenha os PNGs aprovados no repositório como fonte; esta entrega não altera o projeto existente.
