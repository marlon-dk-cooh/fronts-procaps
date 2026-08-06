import React, { useEffect, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
  description: string;
};

const MODELS: Option[] = [
  {
    value: "am-bom-extractor",
    label: "AM BOM Extractor",
    description: "Extracción de BOM desde métodos analíticos PDF",
  },
  {
    value: "bd-bom-builder",
    label: "BD BOM Builder",
    description: "Extracción de BOM desde métodos analíticos PDF",
  },
  {
    value: "bom-planner",
    label: "Analytical BOM Planner",
    description: "Planificación de insumos para la planta analítica",
  }
];

export const DEFAULT_MODEL = MODELS[0].value;

type Props = {
  setValue: React.Dispatch<React.SetStateAction<string>>;
  value: string;
};

export default function DropdownModel({ value, setValue }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("model");
    const isValid = saved && MODELS.some((m) => m.value === saved);
    const next = isValid ? (saved as string) : DEFAULT_MODEL;
    setValue(next);
    localStorage.setItem("model", next);
  }, [setValue]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdown = (newValue: string) => {
    if (value !== newValue) {
      setValue(newValue);
      localStorage.setItem("model", newValue);
    }
    setOpen(false);
  };

  const current = MODELS.find((m) => m.value === value);

  return (
    <>
      {/* Fondo oscuro móvil */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
          open ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
      ></div>

      <div ref={dropdownRef} className="relative inline-block text-left">
        {/* Menú desplegable */}
        {open && (
          <div
            className="fixed lg:absolute bottom-0 lg:bottom-full left-0 lg:left-auto lg:right-0 z-[1000] lg:w-60 w-full max-h-[320px] overflow-y-auto mt-2 bg-neutral-50 border border-default-medium rounded-b-none lg:rounded-lg lg:mb-1 shadow-lg dark:bg-neutral-800 dark:border-neutral-700"
          >
            <ul className="p-2 text-sm text-body font-medium">
              {MODELS.map(({ value: val, label, description }) => (
                <li key={val}>
                  <button
                    onClick={() => handleDropdown(val)}
                    className={`w-full text-start p-2 rounded transition ${
                      value === val
                        ? "bg-neutral-200 dark:bg-neutral-600"
                        : "hover:bg-neutral-200 dark:hover:bg-neutral-500"
                    }`}
                  >
                    <h4 className="font-semibold text-lg">{label}</h4>
                    <span className="font-normal text-sm dark:text-neutral-400 text-neutral-700">
                      {description}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Botón principal */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center border border-input bg-background hover:opacity-70 hover:text-accent-foreground h-10 px-4 py-2 text-sm font-medium rounded-md transition"
          type="button"
        >
          {current?.label ?? MODELS[0].label}
          <svg
            className={`w-4 h-4 ms-1.5 -me-0.5 transition-transform ${
              open ? "rotate-180" : "rotate-0"
            }`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 9-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
