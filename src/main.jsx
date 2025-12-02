import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// Esta línea es OBLIGATORIA para que cargue Tailwind y tus estilos
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)