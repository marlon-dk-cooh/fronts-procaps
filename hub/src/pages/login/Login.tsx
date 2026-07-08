// ============================================================
// LOGIN PAGE — Plantilla genérica
// ============================================================
// TODO: Conecta handleLogin() con tu proveedor de autenticación.
//
// Ejemplos:
//   - JWT propio:  const { token } = await authApi.post('/login', { email, password })
//                  setAuthToken(token); navigate('/');
//   - Azure MSAL:  await instance.loginPopup(loginRequest)
//   - Auth0:       loginWithRedirect()
//   - Google:      signInWithPopup(auth, googleProvider)
// ============================================================

import { useState, FormEvent } from "react";
import { setAuthToken } from "@/utils/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // TODO: Reemplaza con tu API de autenticación
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const { token } = await response.json();
      // setAuthToken(token);
      // navigate('/');

      console.log("Login con:", email, password);
      setAuthToken("demo-token");
      navigate("/");
    } catch {
      setError("Credenciales inválidas. Por favor intenta de nuevo.");
    } finally {
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

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-md bg-brand-primary text-brand-primary-foreground font-medium hover:opacity-80 transition disabled:opacity-50"
          >
            {isLoading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          ¿Problemas para ingresar? Contacta al administrador.
        </p>
      </div>
    </div>
  );
}
