import { useState } from "react";
import { User, Moon, Sun, LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/context/ThemeContext";
import { clearAuthToken } from "@/utils/auth";

export function UserMenu() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    clearAuthToken();
    // TODO: Agrega logout de tu auth provider aquí
    window.location.href = "/";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-10 h-10 rounded-full bg-[#00A19B] dark:bg-[#28C9C2] hover:bg-[#1B4B5A] dark:hover:bg-[#1B4B5A] flex items-center justify-center text-white transition-colors flex-none"
          aria-label="Cuenta"
        >
          <User className="h-[1.1rem] w-[1.1rem]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-56 p-1.5">
        <button
          onClick={() => { toggleTheme(); setOpen(false); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left text-foreground hover:bg-muted transition-colors"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          Cambiar a modo {isDarkMode ? "claro" : "oscuro"}
        </button>
        <div className="my-1 h-px bg-border" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </PopoverContent>
    </Popover>
  );
}
