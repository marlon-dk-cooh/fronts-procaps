import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../config/msalConfig";
import logoMicrosoft from "@/assets/microsoft-logo.svg";
import loginBanner from "@/assets/login-banner.jpg";
import { toast } from "sonner";

export default function Login() {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);

      const account = instance.getAllAccounts()[0];
      if (account) {
        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account,
        });
        sessionStorage.setItem("accessToken", response.accessToken);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al iniciar sesión");
    }
  };

  // Decidir qué opciones usar
 return (
    <div
      className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${loginBanner})`,
      }}
    >
      {/* Caja del login */}
      <div className="relative z-10 w-11/12 max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl flex flex-col items-center text-center border border-white/20">
        {/* Logo */}
        <img
          src={"/SofIA_Blanco.png"}
          alt="Alquería Logo"
          className="mx-auto mb-4 w-[260px] hover:scale-110 transition-transform duration-300 ease-in-out cursor-pointer"
        />

        <h1 className="text-3xl font-bold text-gray-200 mb-4 tracking-wide leading-tight">
          Alquería <span className="font-light">SofIA</span>
        </h1>

        <p className="text-base text-gray-200 mb-6">
          Conecta, consulta y actúa: descubre lo que los datos tienen para
          contarte.
        </p>

        {/* Botón login */}
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-2 bg-[#ed1b2e] text-white px-4 py-3 rounded-md hover:opacity-80 transition font-medium shadow-lg"
        >
          <img src={logoMicrosoft} alt="Microsoft logo" className="w-5 h-5" />
          Iniciar sesión con Microsoft
        </button>

        <p className="text-sm text-gray-200 mt-4">
          Contacta al administrador para obtener acceso.
        </p>

        {/* Pata blanca */}
        <img src="/Pata_Blanca.png" alt="" className="mt-6 h-30 opacity-80" />

        {/* Footer */}
        <div className="mt-6 text-sm text-gray-300 flex justify-center gap-4">
          <a href="#" className="hover:underline">
            Aviso sobre privacidad
          </a>
          <a href="#" className="hover:underline">
            Más sobre SofIA
          </a>
        </div>
      </div>
    </div>
  );
}
