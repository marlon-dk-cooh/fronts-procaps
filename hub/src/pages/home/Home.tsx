import { useNavigate } from "react-router-dom";

const agents = [
  {
    id: "sema",
    name: "SEMA",
    description:
      "Motor de búsqueda semántica impulsado por IA. Encuentra información relevante en tus documentos usando lenguaje natural, sin necesidad de conocer las palabras exactas.",
    path: "/sema",
    color: "from-red-500 to-rose-600",
  },
  {
    id: "valida",
    name: "VALIDA",
    description:
      "Agente de validación inteligente. Verifica, analiza y certifica la coherencia y calidad de tus datos y documentos de forma automatizada.",
    path: "/valida",
    color: "from-blue-500 to-indigo-600",
  },
  // {
  //   id: "aura",
  //   name: "AURA",
  //   description:
  //     "Asistente unificado de razonamiento avanzado. Combina múltiples fuentes de conocimiento para generar respuestas contextuales y recomendaciones precisas.",
  //   path: "/aura",
  //   color: "from-amber-400 to-orange-500",
  // },
];

export function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: "linear-gradient(63deg, rgba(0,166,156,1) 0%, rgba(95,173,227,1) 50%, rgba(33,38,78,1) 100%)" }}
    >
      <div className="mb-12 text-center">
        <h1
          className="text-4xl font-bold tracking-tight text-white mb-3"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5), 0 0 2px rgba(0,0,0,0.8)" }}
        >
          Mis agentes
        </h1>
        <p className="text-white/70 text-lg max-w-xl">
          Selecciona un agente para comenzar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => navigate(agent.path)}
            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <div className="p-6 flex flex-col items-center text-center">
              <h2 className="mt-3 text-xl font-semibold text-white">
                {agent.name}
              </h2>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                {agent.description}
              </p>
            </div>
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${agent.color} transition-opacity duration-200`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
