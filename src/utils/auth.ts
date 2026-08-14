// ============================================================
// AUTH UTILITIES — Azure AD / MSAL
// ============================================================
// getAuthToken() adquiere el access token en silencio via MSAL. Si la sesión
// expiró o requiere interacción (MFA, consentimiento, etc.), redirige a login.
// ============================================================

import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { loginRequest, msalInstance } from "@/config/msalConfig";

/**
 * Obtiene el access token de la cuenta activa. Devuelve '' si no hay cuenta
 * o si la adquisición silenciosa falla sin requerir interacción del usuario.
 */
export async function getAuthToken(): Promise<string> {
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  if (!account) return "";

  try {
    const result = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
    return result.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      await msalInstance.acquireTokenRedirect({ ...loginRequest, account });
    }
    return "";
  }
}
