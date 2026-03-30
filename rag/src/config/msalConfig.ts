// ============================================================
// MSAL CONFIG — Archivo de referencia (no activo)
// ============================================================
// Si necesitas integrar Azure AD / Microsoft Entra ID, instala:
//   npm install @azure/msal-browser @azure/msal-react
//
// Luego restaura este archivo y conéctalo en App.tsx con MsalProvider.
// Agrega las variables en .env:
//   VITE_CLIENT_ID=...
//   VITE_TENANT_ID=...
//   VITE_REDIRECT_URI=...
// ============================================================

// import { PublicClientApplication } from '@azure/msal-browser';
//
// export const msalConfig = {
//   auth: {
//     clientId: import.meta.env.VITE_CLIENT_ID,
//     authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}/v2.0`,
//     redirectUri: import.meta.env.VITE_REDIRECT_URI,
//   },
//   cache: {
//     cacheLocation: 'sessionStorage',
//     storeAuthStateInCookie: true,
//   },
// };
//
// export const msalInstance = new PublicClientApplication(msalConfig);
// export const loginRequest = {
//   scopes: [`api://${import.meta.env.VITE_CLIENT_ID}/chat_access`],
// };
