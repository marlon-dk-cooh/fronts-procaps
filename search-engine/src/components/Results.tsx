import { useState } from "react";
import type { SearchState } from "../interface/FormSearch";

type Props = {
  hasResults: boolean;
  textMuted: string;
  text: string;
  a: string;
  cardBg: string;
  border: string;
  surface2: string;
  state: SearchState;
};

const relevanceBadge = (score: number): { label: string; color: string } => {
  if (score >= 0.95) return { label: "Exacto", color: "#10B981" };
  if (score >= 0.85) return { label: "Alto", color: "#3B82F6" };
  if (score >= 0.7) return { label: "Medio", color: "#F59E0B" };
  return { label: "Bajo", color: "#EF4444" };
};

const highlightSnippet = (
  text: string,
  highlights: string[],
  accentColor: string,
): string => {
  if (!highlights?.length) return text;
  let result = text;
  highlights.forEach((h) => {
    result = result.replace(
      new RegExp(`(${h})`, "gi"),
      `<mark style="background:${accentColor}22;color:${accentColor};padding:1px 4px;border-radius:3px;font-weight:600">${h}</mark>`,
    );
  });
  return result;
};

const Results = ({
  hasResults,
  textMuted,
  text,
  a,
  cardBg,
  border,
  state,
  surface2,
}: Props) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <>
      {hasResults && (
        <div
          className="w-full transition-all duration-500"
          style={{ maxWidth: 820, padding: "24px 24px 60px" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div style={{ fontSize: 13, color: textMuted }}>
              <span style={{ fontWeight: 600, color: text }}>
                {state.results!.length}
              </span>{" "}
              resultado{state.results!.length !== 1 && "s"} para{" "}
              <span style={{ color: a, fontWeight: 500 }}>"{state.query}"</span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: textMuted,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              ~120ms
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {state.results!.map((result, idx) => {
              const badge = relevanceBadge(result.relevance);
              const isExpanded = expandedId === result.id;
              return (
                <div
                  key={result.id}
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => setExpandedId(isExpanded ? null : result.id)}
                  style={{
                    background: cardBg,
                    borderRadius: 14,
                    border: `1px solid ${isExpanded ? `${a}44` : border}`,
                    overflow: "hidden",
                    boxShadow: isExpanded ? `0 4px 20px ${a}12` : "none",
                    animation: `fadeSlideIn 0.4s ease ${idx * 0.07}s both`,
                  }}
                >
                  <div style={{ padding: "18px 20px" }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex items-center justify-center flex-shrink-0"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: `${a}10`,
                            color: a,
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <div>
                          <div
                            className="font-semibold"
                            style={{ fontSize: 14.5, lineHeight: 1.3 }}
                          >
                            {result.title}
                          </div>
                          <div
                            style={{
                              fontSize: 11.5,
                              color: textMuted,
                              fontFamily: "'IBM Plex Mono', monospace",
                              marginTop: 2,
                            }}
                          >
                            {result.source}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: badge.color,
                          background: `${badge.color}15`,
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontFamily: "'IBM Plex Mono', monospace",
                          flexShrink: 0,
                        }}
                      >
                        {(result.relevance * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div
                      className="mt-3"
                      style={{
                        fontSize: 13.5,
                        lineHeight: 1.75,
                        color: textMuted,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: highlightSnippet(
                          result.snippet,
                          result.highlights,
                          a,
                        ),
                      }}
                    />
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span
                        style={{
                          fontSize: 11,
                          padding: "3px 10px",
                          borderRadius: 6,
                          background: surface2,
                          color: textMuted,
                          fontWeight: 500,
                        }}
                      >
                        {result.category}
                      </span>
                      <span style={{ fontSize: 11, color: textMuted }}>
                        {result.date}
                      </span>
                      <span style={{ fontSize: 11, color: textMuted }}>
                        {result.chunks} chunk{result.chunks > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div
                    className="transition-all duration-300 overflow-hidden"
                    style={{
                      maxHeight: isExpanded ? 200 : 0,
                      opacity: isExpanded ? 1 : 0,
                    }}
                  >
                    <div
                      style={{
                        padding: "16px 20px",
                        borderTop: `1px solid ${border}`,
                        background: `${a}06`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          style={{
                            width: 3,
                            height: 16,
                            borderRadius: 2,
                            background: a,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: a,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          Contexto expandido
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          lineHeight: 1.8,
                          color: textMuted,
                        }}
                      >
                        Fragmento recuperado con cosine similarity de{" "}
                        {result.relevance.toFixed(4)}. {result.chunks} chunks en
                        "{result.source.split("/").pop()}".
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 500,
                            background: a,
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Ver documento
                        </button>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 500,
                            background: surface2,
                            color: text,
                            border: `1px solid ${border}`,
                            cursor: "pointer",
                          }}
                        >
                          Copiar fragmento
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {state.results!.length === 0 && (
            <div className="text-center py-16" style={{ color: textMuted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div className="font-semibold mb-1" style={{ fontSize: 16 }}>
                Sin resultados
              </div>
              <div style={{ fontSize: 13 }}>
                Intenta otra consulta o ajusta los filtros
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Results;
