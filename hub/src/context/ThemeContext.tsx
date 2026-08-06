import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { DEFAULT_MODEL } from "@/components/gpt/DropdownModel";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  modelSelect: string;
  setModelSelect: Dispatch<SetStateAction<string>>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  // Por defecto un flujo SEMA real: cualquier otro valor hace que el backend
  // enrute al agente genérico y los PDFs se procesen como texto plano.
  const [modelSelect, setModelSelect] = useState(() => {
    return localStorage.getItem("model") || DEFAULT_MODEL;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    if (!modelSelect) return;
    localStorage.setItem("model", modelSelect);
  }, [modelSelect]);

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, toggleTheme, modelSelect, setModelSelect }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
