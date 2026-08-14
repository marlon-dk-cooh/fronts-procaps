import { useEffect, useRef } from "react";
import "./App.css";
import { ThemeProvider } from "./context/ThemeContext";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./PrivateRoutes";
import { Toaster } from "sonner";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { loginRequest } from "./config/msalConfig";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  // Evita disparar loginRedirect más de una vez.
  const redirectStarted = useRef(false);

  useEffect(() => {
    console.log(
      "[MSAL][AuthGate] evaluando: accounts=%d inProgress=%s redirectStarted=%s",
      accounts.length,
      inProgress,
      redirectStarted.current
    );

    if (accounts.length === 0 && inProgress === "none" && !redirectStarted.current) {
      console.log("[MSAL][AuthGate] disparando loginRedirect()");
      redirectStarted.current = true;
      instance
        .loginRedirect(loginRequest)
        .then(() => {
          console.log("[MSAL][AuthGate] loginRedirect() resuelto (no debería verse: navega fuera de la página)");
        })
        .catch((error) => {
          console.error("[MSAL][AuthGate] loginRedirect() falló:", error);
          redirectStarted.current = false;
        });
    }
  }, [accounts, inProgress, instance]);

  return (
    <>
      <AuthenticatedTemplate>{children}</AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <div className="flex h-screen w-screen items-center justify-center">
          Redirigiendo al inicio de sesión...
        </div>
      </UnauthenticatedTemplate>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthGate>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthGate>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
