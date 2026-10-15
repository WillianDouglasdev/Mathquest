# Integração do personagem aprovado

Entrega separada de 15/10/2026. O usuário aprovou os três formatos e autorizou sua integração. A página Revisão e Foco não foi iniciada nesta entrega.

Atualização posterior: o usuário aprovou tecnicamente a integração e solicitou manter explícita a pendência de conferência visual na aplicação renderizada. O desenvolvimento do Pomodoro ocorreu em [entrega separada](06-pomodoro.md), sem alterar novamente os arquivos do personagem.

## Assets e usos

| Arquivo integrado | Origem aprovada | Uso |
| --- | --- | --- |
| `public/assets/characters/student-v2-full.png` | `reviews/student-v2/full-body-candidate.png` | Saudação do Dashboard e diálogo de perfil |
| `public/assets/characters/student-v2-navigation.png` | `reviews/student-v2/navigation-portrait-candidate.png` | Perfil da sidebar e cabeçalho |
| `public/assets/characters/student-v2-ranking.png` | `reviews/student-v2/ranking-avatar-candidate.png` | Lista do ranking no Dashboard e diálogos que reutilizam essa lista |

Os três arquivos foram copiados sem recompressão, recorte ou regeneração. SHA-256 confirma identidade com as imagens aprovadas. O arquivo original do atlas permanece intacto, inclusive seu recorte legado do estudante, mas a interface não o utiliza mais. Esse nome foi retirado do tipo público de `PixelArt`, mantendo sua posição reservada no atlas para não deslocar os demais ícones.

`StudentAvatar` centraliza a seleção de formato, tamanho e dimensões intrínsecas. Seu contêiner preserva os espaços existentes e as regras responsivas do Dashboard; a imagem usa `object-fit: contain`, centralização e `image-rendering: pixelated`. Não há crop/estiramento do corpo para preencher uma caixa quadrada. Os PNGs conservam sua transparência; nenhuma imagem recebe fundo opaco. As molduras coloridas de sidebar/cabeçalho/ranking são as já existentes na interface.

Tamanhos: corpo no Dashboard em caixa de 88px, adaptada pelos breakpoints existentes, e 100px no perfil; retrato de 36px dentro da moldura de 40px da sidebar e 32px dentro da moldura de 36px do cabeçalho; avatar de ranking de 26px dentro da moldura de 30px. Esses tamanhos internos descontam os 2px de borda de cada lado para não cortar o personagem. Imagens são decorativas onde o contexto já identifica o perfil, evitando repetir o mesmo nome no leitor de tela.

Nenhum cenário, mascote, ícone, fonte, token ou componente de navegação foi redesenhado. Conteúdo, pontuações e comportamento do Dashboard continuam demonstrativos.

## Verificação

- `npm test`: **8 testes aprovados**, incluindo um teste integrado dos formatos corretos no Dashboard, sidebar, cabeçalho, ranking e diálogo de perfil.
- `npm run build`: **aprovado**, TypeScript e Vite, 49 módulos; bundle JS ~286 kB / ~91 kB gzip.
- `node docs/reviews/student-v2/integration-check.mjs`: verifica hashes dos assets existentes, identidade das três cópias aprovadas, dimensões/canal RGBA e identidade dos arquivos servidos pelo build em `dist/`.
- PNGs: corpo inteiro 1024×1536; retrato e avatar 1254×1254. Verificação por `System.Drawing` confirmou alpha 0 nos quatro cantos de cada arquivo integrado. A identidade binária com os candidatos preserva todo o canal alpha, não apenas os cantos.
- Busca no código confirmou que não restou nenhum uso de `PixelArt name="student"`.

Relatório dos arquivos: [integration-assets.json](reviews/student-v2/integration-assets.json).

## Limite da validação visual

O inventário de superfícies do navegador retornou `apps: []` e `browsers: []` nesta sessão. Portanto, os contextos foram validados por integração DOM, código/CSS e verificação dos PNGs/build, **sem screenshot da aplicação renderizada**. Isso não comprova visualmente a legibilidade dos avatares pequenos ou o enquadramento final em cada viewport.

Para conferência visual local, usar `npm run dev`: verificar saudação, perfil no rodapé da sidebar, perfil no cabeçalho, cinco avatares do ranking e os diálogos de perfil/ranking, em desktop e mobile. Conferir proporção, ausência de corte, transparência sobre os fundos existentes e leitura em tamanhos pequenos. A prancha aprovada permanece disponível em [revisão do personagem](reviews/student-v2/index.html).

## Próxima entrega

Após validar esta integração, seguir o plano aprovado: motor do Pomodoro independente de React e com testes, flashcards predefinidos locais e página Revisão e Foco funcional. Essas funcionalidades permanecem fora desta entrega.
