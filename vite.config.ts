import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/*
 * O mesmo projeto usa Vite para desenvolvimento/build e Vitest para validação.
 * A hospedagem recebe os arquivos estáticos de dist; nenhuma chave ou serviço
 * de backend precisa ser embutido no bundle para esta versão funcionar.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
