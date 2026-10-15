# Personagem MathQuest — proposta para validação

Estado: três formatos aprovados pelo usuário e integrados em cópias binariamente idênticas. Esta pasta preserva os candidatos e o registro da proposta original. Ver [relatório de integração](../../05-integracao-personagem.md). A página Revisão e Foco permanece para a próxima entrega.

## Material de revisão

- [Prancha local dos três formatos](index.html), com PNGs ampliados sobre transparência e simulações dos tamanhos de uso.
- [Corpo inteiro](full-body-candidate.png), derivado do estudante aventureiro na UX original de Revisão e Foco.
- [Retrato de navegação](navigation-portrait-candidate.png), derivado do mesmo corpo inteiro.
- [Avatar pequeno de ranking](ranking-avatar-candidate.png), derivado do mesmo corpo inteiro com simplificação para tamanho pequeno.
- [Prompts exatos e origem](prompts.json). Geração com a ferramenta integrada `image_gen.imagegen`, sem CLI/API externa.

Não são três personagens alternativos: são três formatos de uma identidade proposta. O pedido é conferir semelhança com a UX, cabelo castanho, rosto amigável, roupa azul/verde, mochila e consistência entre os formatos. O corpo inteiro serve de referência comum para os dois retratos.

Os PNGs candidatos são imagens ampliadas de revisão, não sprites finais quantizados. As miniaturas da prancha usam CSS com `image-rendering: pixelated`; a legibilidade nos tamanhos reais ainda deve ser confirmada visualmente. Ajustes finais de recorte/exportação serão feitos após a validação, sem modificar os assets atuais.

## Preservação

`approved-baseline.json` registra SHA-256 de 22 arquivos antes da proposta. O script `verify.mjs` e seu relatório `verification.json` são históricos da etapa de proposta e verificam a condição anterior à integração. Para a entrega integrada, usar `node docs/reviews/student-v2/integration-check.mjs`, que verifica preservação dos assets existentes e identidade das três cópias aprovadas, inclusive no build. Os candidatos originais permanecem arquivados aqui; a aplicação utiliza suas cópias em `public/assets/characters/`. Cenários, mascote verde, atlas, fontes e dependências continuam preservados.

Na proposta original não houve mudança executável. A integração posterior passou em build e 8 testes; a documentação da entrega distingue essa verificação da conferência visual em navegador, ainda limitada pelo ambiente. A prancha HTML é um artefato local de revisão, não uma nova rota ou funcionalidade do produto.

## Próxima entrega, depois da validação

Validar a integração e seguir o [plano ajustado](../../04-plano-de-continuidade.md): motor do Pomodoro independente de React e testado em Node, flashcards predefinidos locais e interface completa de Revisão e Foco antes da API/banco. Concluir e validar cada parte antes de avançar à dependente.
