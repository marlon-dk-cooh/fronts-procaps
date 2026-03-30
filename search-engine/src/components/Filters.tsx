import type { SearchFilters } from "../interface/FormSearch";
import { Chip } from "./Chip";

type Props = {
  showFilters: boolean;
  border: string;
  textMuted: string;
  surface2: string;
  a: string;
  text: string;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
};

const CATEGORIES: string[] = [
  "Todos",
  "Arquitectura",
  "Seguridad",
  "DevOps",
  "Reportes",
  "Wiki",
];
const FILE_TYPES: string[] = ["Todos", "PDF", "Markdown", "Word"];
const DATE_RANGES: string[] = [
  "Cualquier fecha",
  "Última semana",
  "Último mes",
  "Último trimestre",
  "Último año",
];

const Filters = ({
  showFilters,
  border,
  textMuted,
  surface2,
  a,
  text,
  filters,
  setFilters
}: Props) => {
  return (
    <div
      className="transition-all duration-400 overflow-hidden"
      style={{
        maxHeight: showFilters ? 300 : 0,
        opacity: showFilters ? 1 : 0,
      }}
    >
      <div
        style={{
          padding: "0 20px 18px",
          borderTop: `1px solid ${border}`,
        }}
      >
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 8,
            }}
          >
            Categoría
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                active={filters.category === cat}
                onClick={() => setFilters({ ...filters, category: cat })}
                accent={a}
                surface2={surface2}
                textMuted={textMuted}
                border={border}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-6 mt-4">
          <div className="flex-1">
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 8,
              }}
            >
              Tipo de archivo
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILE_TYPES.map((ft) => (
                <Chip
                  key={ft}
                  label={ft}
                  active={filters.file === ft}
                  onClick={() => setFilters({ ...filters, file: ft })}
                  accent={a}
                  surface2={surface2}
                  textMuted={textMuted}
                  border={border}
                />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 8,
              }}
            >
              Rango de fecha
            </div>
            <select
              name="dateRange"
              className="w-full outline-none cursor-pointer"
              style={{
                padding: "8px 12px",
                borderRadius: 9,
                fontSize: 12.5,
                background: surface2,
                color: text,
                border: `1px solid ${border}`,
                fontFamily: "inherit",
              }}
            >
              {DATE_RANGES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 8 }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Relevancia mínima
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: a,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {filters.minRelevance}%
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={filters.minRelevance}
            onChange={(e) => setFilters({ ...filters, minRelevance: Number(e.target.value) })}
            className="w-full"
            style={{ accentColor: a, height: 4 }}
          />
        </div>
      </div>
    </div>
  );
};

export default Filters;
