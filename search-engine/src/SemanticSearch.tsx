import { useState, useRef, useEffect, useActionState, type JSX } from "react";
import { useFormStatus } from "react-dom";
import type { SearchFilters, SearchState } from "./interface/FormSearch";
import Filters from "./components/Filters";
import { ArrowRight, Moon, Search, SlidersHorizontal, Sun } from "lucide-react";
import Results from "./components/Results";
import { MOCK_RESULTS } from "./mock/Results";

/* ─────────────────────── Types ─────────────────────── */

interface SubmitButtonProps {
  accent: string;
}

interface PendingBarProps {
  accent: string;
  textMuted: string;
}

/* ──────────── Form action (async — useActionState) ──────────── */
async function searchAction(
  _prevState: SearchState,
  formData: FormData,
): Promise<SearchState> {
  const query = formData.get("query")?.toString().trim() ?? "";
  const category = formData.get("category")?.toString() ?? "Todos";
  const minRelevance = Number(formData.get("minRelevance") ?? 0);

  if (!query) {
    return {
      ..._prevState,
      error: "Escribe una consulta",
      results: null,
      query: "",
    };
  }

  // ── Replace with your real RAG API call ──
  // const res = await fetch("/api/search", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ query, category, minRelevance }),
  // });
  // const data = await res.json();
  // return { error: null, results: data.results, query };

  await new Promise<void>((r) => setTimeout(r, 1200));
  let filtered = [...MOCK_RESULTS];
  if (category !== "Todos") {
    filtered = filtered.filter((r) => r.category === category);
  }
  if (minRelevance > 0) {
    filtered = filtered.filter((r) => r.relevance >= minRelevance / 100);
  }
  return { ..._prevState, error: null, results: filtered, query };
  // ── End mock ──
}

/* ──────────── SubmitButton — reads useFormStatus ──────────── */
function SubmitButton({ accent }: SubmitButtonProps): JSX.Element {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0"
      style={{
        width: 42,
        height: 42,
        borderRadius: 11,
        background: `linear-gradient(135deg, ${accent}, #A78BFA)`,
        color: "#fff",
        border: "none",
        opacity: pending ? 0.7 : 1,
      }}
    >
      {pending ? (
        <div
          className="animate-spin"
          style={{
            width: 18,
            height: 18,
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff",
            borderRadius: "50%",
          }}
        />
      ) : (
        <ArrowRight size={18} color="#fff" />
      )}
    </button>
  );
}

/* ──────────── PendingBar — reads useFormStatus ──────────── */
function PendingBar({
  accent,
  textMuted,
}: PendingBarProps): JSX.Element | null {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <div
      style={{
        padding: "12px 20px 14px",
        borderTop: `1px solid ${textMuted}22`,
      }}
    >
      <div
        className="flex items-center gap-2.5"
        style={{ color: textMuted, fontSize: 13 }}
      >
        <div
          className="animate-spin"
          style={{
            width: 14,
            height: 14,
            border: `2px solid ${textMuted}33`,
            borderTopColor: accent,
            borderRadius: "50%",
          }}
        />
        Buscando en la base de conocimiento...
      </div>
      <div
        className="mt-2 overflow-hidden"
        style={{ height: 3, borderRadius: 2, background: `${accent}15` }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 2,
            background: accent,
            animation: "shimmer 1.5s ease-in-out infinite",
            width: "40%",
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────── Main Component ─────────────────────── */
export default function SemanticSearch(): JSX.Element {
  const [dark, setDark] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: "Todos",
    file: "Todos",
    minRelevance: 0,
    rangeDate: "Cualquier fecha",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState<SearchState, FormData>(
    searchAction,
    {
      error: null,
      results: null,
      query: "",
      filters: {
        category: "Todos",
        file: "Todos",
        minRelevance: 0,
        rangeDate: "",
      },
    },
  );

  const hasResults = state.results !== null;

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (
        e.key === "/" &&
        (document.activeElement as HTMLElement)?.tagName !== "INPUT"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ── Theme ── */
  const a = dark ? "#60A5FA" : "#2563EB";
  const bg = dark ? "#0B0D10" : "#F4F5F7";
  const surface = dark ? "#13161B" : "#FFFFFF";
  const surface2 = dark ? "#1A1E25" : "#F0F1F4";
  const border = dark ? "#252A33" : "#E0E2E7";
  const text = dark ? "#E8EBF0" : "#111318";
  const textMuted = dark ? "#6B7586" : "#6B7280";
  const cardBg = dark ? "#161A21" : "#FAFBFC";

  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{
        background: bg,
        color: text,
        fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif",
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: dark
            ? `radial-gradient(circle at 20% 20%, ${a}08 0%, transparent 50%), radial-gradient(circle at 80% 80%, #8B5CF608 0%, transparent 50%)`
            : `radial-gradient(circle at 30% 30%, ${a}06 0%, transparent 50%)`,
        }}
      />

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between backdrop-blur-xl"
        style={{
          padding: "12px 24px",
          background: `${surface}DD`,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              height: 34,
              borderRadius: 9,
              background: `linear-gradient(135deg, ${a}, #A78BFA)`,
              color: "#fff",
              fontWeight: 800,
              fontSize: 15,
              padding: "0 14px",
            }}
          >
            LOGO
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight">
              Semantic Search
            </div>
            <div style={{ fontSize: 11, color: textMuted }}>
              RAG-powered retrieval
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasResults && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="transition-all duration-200 cursor-pointer"
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                color: textMuted,
                background: surface2,
                border: `1px solid ${border}`,
              }}
            >
              Nueva búsqueda
            </button>
          )}
          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="transition-all duration-200 cursor-pointer flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              border: `1px solid ${border}`,
              background: surface2,
              fontSize: 15,
            }}
          >
            {dark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main
        className="relative z-10 flex flex-col items-center transition-all duration-700 ease-out"
        style={{
          paddingTop: hasResults ? 32 : "22vh",
          minHeight: "calc(100vh - 61px)",
        }}
      >
        <div
          className="w-full transition-all duration-700 ease-out"
          style={{ maxWidth: hasResults ? 820 : 640, padding: "0 24px" }}
        >
          {/* Title */}
          <div
            className="text-center transition-all duration-500 overflow-hidden"
            style={{
              maxHeight: hasResults ? 0 : 160,
              opacity: hasResults ? 0 : 1,
              marginBottom: hasResults ? 0 : 32,
            }}
          >
            <h1
              className="font-bold tracking-tight"
              style={{ fontSize: 38, lineHeight: 1.15, marginBottom: 10 }}
            >
              Busca en tu{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${a}, #A78BFA)`,
                  padding: "4px",
                  borderRadius: 8,
                }}
              >
                base de conocimiento
              </span>
            </h1>
            <p
              style={{
                color: textMuted,
                fontSize: 15,
                maxWidth: 420,
                margin: "0 auto",
              }}
            >
              Búsqueda semántica impulsada por embeddings
            </p>
          </div>

          {/* ── Form (native action + useActionState) ── */}
          <form
            action={formAction}
            className="transition-all duration-300"
            style={{
              background: surface,
              borderRadius: 16,
              border: `1px solid ${border}`,
              boxShadow: `0 4px 24px ${dark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.06)"}`,
              overflow: "hidden",
            }}
          >
            {/* Poner los inputs ocultos de datos de los filtros para obtenerlos más fácilmente */}
            <input type="hidden" name="category" value={filters.category} />
            <input type="hidden" name="fileType" value={filters.file} />
            <input
              type="hidden"
              name="minRelevance"
              value={filters.minRelevance}
            />

            <div
              className="flex items-center gap-3"
              style={{ padding: "6px 8px 6px 20px" }}
            >
              <Search size={20} color={textMuted} />
              <input
                ref={inputRef}
                name="query"
                defaultValue=""
                placeholder="¿Qué estás buscando?"
                className="flex-1 outline-none bg-transparent"
                style={{
                  fontSize: 15,
                  color: text,
                  fontFamily: "inherit",
                  padding: "12px 0",
                }}
              />
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 cursor-pointer transition-all duration-200 shrink-0"
                style={{
                  padding: "8px 12px",
                  borderRadius: 9,
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: showFilters ? a : textMuted,
                  background: showFilters ? `${a}12` : "transparent",
                  border: `1px solid ${showFilters ? `${a}33` : "transparent"}`,
                }}
              >
                <SlidersHorizontal
                  color={showFilters ? a : textMuted}
                  size={16}
                />
                Filtros
              </button>
              <SubmitButton accent={a} />
            </div>

            {/* Filters */}
            <Filters
              a={a}
              textMuted={textMuted}
              surface2={surface2}
              border={border}
              text={text}
              filters={filters}
              setFilters={setFilters}
              showFilters={showFilters}
            />

            <PendingBar accent={a} textMuted={textMuted} />
          </form>

          {state.error && (
            <div
              className="mt-2 text-center"
              style={{ fontSize: 13, color: "#EF4444" }}
            >
              {state.error}
            </div>
          )}
          {!hasResults && !isPending && (
            <div
              className="text-center mt-4"
              style={{ fontSize: 12, color: textMuted }}
            >
              Presiona Enter para buscar
            </div>
          )}
        </div>
        {/* ── Results ── */}
        <Results
          hasResults={hasResults}
          textMuted={textMuted}
          text={text}
          a={a}
          cardBg={cardBg}
          border={border}
          surface2={surface2}
          state={state}
        />
      </main>

      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }
        input::placeholder { color: ${textMuted} !important; }
        input[type="range"] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; background: ${surface2}; outline: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${a}; cursor: pointer; border: 2px solid ${surface}; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
        select { -webkit-appearance: none; appearance: none; }
        *::-webkit-scrollbar { width: 5px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: ${border}; border-radius: 3px; }
      `}</style>
    </div>
  );
}
