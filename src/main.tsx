import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MsalProvider } from '@azure/msal-react'
import './index.css'
import App from './App'
import { msalInstance } from './config/msalConfig'

console.log("[MSAL] initialize() — origin:", window.location.origin, "href:", window.location.href)
await msalInstance.initialize()

const redirectResult = await msalInstance.handleRedirectPromise().catch((error) => {
  // No relanzar: si esto falla, la app debe poder renderizar igual y
  // reintentar el login. Pero se loguea para poder diagnosticar loops
  // de redirect (state_mismatch, interaction_in_progress, etc.).
  console.error("[MSAL] handleRedirectPromise() falló:", error)
  return null
})
console.log("[MSAL] handleRedirectPromise() resultado:", redirectResult)
console.log("[MSAL] cuentas en caché tras el arranque:", msalInstance.getAllAccounts())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>,
)
