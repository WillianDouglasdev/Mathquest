/**
 * Este é o ponto de entrada da aplicação. O BrowserRouter lê o endereço do navegador
 * e mantém a navegação dentro do React, sem recarregar a página a cada clique.
 *
 * O StrictMode fica ativo para ajudar a perceber efeitos que não foram limpos
 * corretamente. Isso é especialmente importante aqui, porque há cronômetro,
 * observadores de visibilidade e recursos de áudio com ciclos de vida próprios.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
