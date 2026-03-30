// TODO: Conecta este botón con tu proveedor de autenticación.
// Actualmente solo limpia el token local y redirige a "/".
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { clearAuthToken } from "@/utils/auth";

export function LogoutButton() {
  const handleLogout = () => {
    clearAuthToken();
    // TODO: Agrega logout de tu auth provider aquí
    window.location.href = "/";
  };

  return (
    <Button
      variant="outline"
      className="border border-gray text-red-600 hover:bg-red-600 hover:text-white dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white flex items-center gap-2 h-10 transition-colors"
      onClick={handleLogout}
    >
      Cerrar sesión
      <LogOut className="h-[1.2rem] w-[1.2rem]" />
    </Button>
  );
}
