import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { UserMenu } from "@/components/custom/UserMenu";
import isotipoSrc from "@/assets/isotipo.png";

const agents = [
  {
    id: "sema",
    name: "SEMA",
    tag: "Búsqueda semántica con IA",
    description:
      "Motor de búsqueda semántica impulsado por IA. Encuentra información relevante en tus documentos usando lenguaje natural, sin necesidad de conocer las palabras exactas.",
    path: "/sema",
    accent: "#00A19B",
    accentDark: "#28C9C2",
    iconBg: "#E3F5F3",
    iconBgDark: "#0F2422",
    tint: "#E3F5F3",
    tintDark: "#0F2422",
  },
  {
    id: "valida",
    name: "VALIDA",
    tag: "Validación de documentos",
    description:
      "Agente de validación inteligente. Verifica, analiza y certifica la coherencia y calidad de tus datos y documentos de forma automatizada.",
    path: "/valida",
    accent: "#0F8B81",
    accentDark: "#2DD4C4",
    iconBg: "#0F8B81",
    iconBgDark: "#0F8B81",
    tint: "#E5F5F3",
    tintDark: "#123326",
  },
  // {
  //   id: "aura",
  //   name: "AURA",
  //   tag: "Razonamiento avanzado",
  //   description:
  //     "Asistente unificado de razonamiento avanzado. Combina múltiples fuentes de conocimiento para generar respuestas contextuales y recomendaciones precisas.",
  //   path: "/aura",
  //   accent: "#F59E0B",
  //   accentDark: "#FBBF24",
  //   iconBg: "#FEF3E2",
  //   iconBgDark: "#2E260D",
  //   tint: "#FEF3E2",
  //   tintDark: "#2E260D",
  // },
];

export function Home() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const idleBorder = isDarkMode ? "#27272A" : "#E4E7EB";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: isDarkMode
          ? "linear-gradient(135deg, #0D211F 0%, #0A0A0A 55%, #050505 100%)"
          : "linear-gradient(135deg, #EAFBF8 0%, #F5FBFA 45%, #FFFFFF 100%)",
      }}
    >
      <header className="w-full flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <img src={isotipoSrc} alt="" className="h-8 w-auto" />
          <span className="text-lg font-bold tracking-tight text-[#0F2A28] dark:text-neutral-100">
            Procaps IA
          </span>
        </div>
        <UserMenu />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#0F2A28] dark:text-neutral-100 mb-3">
            Mis agentes
          </h1>
          <p className="text-[#5A6B75] dark:text-neutral-400 text-lg max-w-xl">
            Selecciona un agente para comenzar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {agents.map((agent) => {
          const accent = isDarkMode ? agent.accentDark : agent.accent;
          const iconBg = isDarkMode ? agent.iconBgDark : agent.iconBg;
          const tint = isDarkMode ? agent.tintDark : agent.tint;
          return (
            <button
              key={agent.id}
              onClick={() => navigate(agent.path)}
              className="group relative overflow-hidden rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm transition-all duration-200 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#0F8B81]/40 text-left"
              style={{ borderColor: idleBorder }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = accent)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = idleBorder)}
            >
              <div className="p-7 flex flex-col items-start">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-none shadow-sm"
                  style={{ background: iconBg }}
                >
                  {agent.id === "sema" ? (
                    <img src={isotipoSrc} alt="" className="w-9 h-9 object-contain" />
                  ) : (
                    <span className="text-white font-bold text-2xl">V</span>
                  )}
                </div>

                <span
                  className="mt-4 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ background: tint, color: accent }}
                >
                  {agent.tag}
                </span>

                <h2 className="mt-3 text-xl font-semibold text-[#1A2B32] dark:text-neutral-100">
                  {agent.name}
                </h2>
                <p className="mt-2 text-sm text-[#5A6B75] dark:text-neutral-400 leading-relaxed">
                  {agent.description}
                </p>

                <div
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{ color: accent }}
                >
                  Entrar
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              <div
                className="absolute inset-x-0 bottom-0 h-[3px] opacity-80"
                style={{ background: accent }}
              />
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
