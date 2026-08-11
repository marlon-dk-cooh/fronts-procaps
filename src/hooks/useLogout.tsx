// ============================================================
// USER / LOGOUT HOOK — Conecta tu sistema de autenticación aquí
// ============================================================
// TODO: Reemplaza esta implementación con la de tu proveedor de auth.
//
// Ejemplos:
//   - MSAL: usar useMsal() y instance.logoutRedirect()
//   - Auth0: usar useAuth0() y logout()
//   - Keycloak: usar useKeycloak() y keycloak.logout()
//   - JWT propio: limpiar token y redirigir a /login
// ============================================================

import { User } from "@/interfaces/interfaces";
import { clearAuthToken } from "@/utils/auth";
import { useState } from "react";

export default function UseLogout() {
  // TODO: Reemplaza con el usuario real de tu auth provider
  const [user] = useState<User>({
    email: "usuario@ejemplo.com",
    name: "Usuario",
    roles: [],
  });

  const logout = (status?: string | number) => {
    // Solo redirige en errores de autenticación reales
    const isAuthError =
      status === "Unauthorized" ||
      status === "Token inválido" ||
      status === "Token expirado" ||
      status === "Not authenticated" ||
      status === 401;

    if (isAuthError) {
      // TODO: Agrega lógica de logout de tu proveedor aquí
      clearAuthToken();
      window.location.href = "/";
    }
  };

  return { logout, user };
}
