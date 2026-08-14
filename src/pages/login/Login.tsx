// ============================================================
// LOGIN PAGE — No enrutada: App.tsx redirige a Azure AD automáticamente
// vía AuthGate/MSAL antes de renderizar rutas. Se conserva como fallback
// manual (p.ej. si loginRedirect automático falla y hay que reintentar).
// ============================================================

import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/config/msalConfig";

export default function Login() {
  const { instance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      await instance.loginRedirect(loginRequest);
    } catch {
      setError("No se pudo iniciar sesión. Por favor intenta de nuevo.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-lg flex flex-col items-center gap-6">
        {/* Logo / nombre de la app */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-primary">AI Chat</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Inicia sesión para continuar
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-3 rounded-md bg-brand-primary text-brand-primary-foreground font-medium hover:opacity-80 transition disabled:opacity-50"
        >
          {isLoading ? "Redirigiendo..." : "Iniciar sesión con Microsoft"}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          ¿Problemas para ingresar? Contacta al administrador.
        </p>
      </div>
    </div>
  );
}
