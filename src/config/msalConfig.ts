// ============================================================
// MSAL CONFIG — Azure AD / Microsoft Entra ID
// ============================================================
// Variables requeridas en .env:
//   VITE_CLIENT_ID=...
//   VITE_TENANT_ID=...
//   VITE_REDIRECT_URI=...
// ============================================================

import {
  AuthenticationResult,
  EventType,
  PublicClientApplication,
} from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Backend valida audience = client_id (ver AuthConfig.resolve_from_env_and_compute_defaults),
// así que .default basta: no depende de un scope específico expuesto en "Expose an API".
export const loginRequest = {
  scopes: [`${import.meta.env.VITE_CLIENT_ID}/.default`],
};

// Tras un login exitoso, fija la cuenta como activa para que acquireTokenSilent
// (en utils/auth.ts) sepa para cuál cuenta pedir el token sin pasarla explícitamente.
msalInstance.addEventCallback((event) => {
  if (
    event.eventType === EventType.LOGIN_SUCCESS &&
    event.payload &&
    (event.payload as AuthenticationResult).account
  ) {
    msalInstance.setActiveAccount((event.payload as AuthenticationResult).account);
  }
});
