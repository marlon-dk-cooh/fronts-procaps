// ============================================================
// AUTH UTILITIES — Conecta tu sistema de autenticación aquí
// ============================================================
// Estas funciones centralizan el manejo del token de acceso.
//
// TODO: Reemplaza la implementación de getAuthToken() con la de tu
// proveedor de autenticación. Opciones comunes:
//
//   - JWT en localStorage:  return localStorage.getItem('token') ?? ''
//   - Azure MSAL:           usar instance.acquireTokenSilent()
//   - Auth0:                usar getAccessTokenSilently() del SDK
//   - Keycloak:             usar keycloak.token
//   - Cookie httpOnly:      no necesitas token aquí (el browser lo adjunta)
// ============================================================

const TOKEN_KEY = 'authToken';

/**
 * Obtiene el token de autenticación activo.
 * Reemplaza con la lógica de tu proveedor de auth.
 */
export function getAuthToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? '';
}

/**
 * Guarda el token tras un login exitoso.
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Elimina el token al hacer logout.
 */
export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
