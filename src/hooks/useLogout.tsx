// ============================================================
// USER / LOGOUT HOOK — Azure AD / MSAL
// ============================================================

import { User } from "@/interfaces/interfaces";
import { useMsal } from "@azure/msal-react";

export default function UseLogout() {
  const { instance, accounts } = useMsal();
  const account = accounts[0];

  const user: User = {
    email: account?.username ?? "",
    name: account?.name ?? "",
    roles: (account?.idTokenClaims?.roles as string[] | undefined) ?? [],
  };

  const logout = (status?: string | number) => {
    // Solo redirige en errores de autenticación reales
    const isAuthError =
      status === "Unauthorized" ||
      status === "Token inválido" ||
      status === "Token expirado" ||
      status === "Not authenticated" ||
      status === 401;

    if (isAuthError) {
      instance.logoutRedirect();
    }
  };

  return { logout, user };
}
