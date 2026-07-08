import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { Report } from '../interface/Report';
import Card from '../components/Card';
import DetailPanel from '../components/DetailPanel';

type FilterKey = 'todos' | 'en_cola' | 'procesando' | 'terminado' | 'error';

const CHIP_DEFS: { key: FilterKey; label: string }[] = [
  { key: 'todos',      label: 'Todos'      },
  { key: 'en_cola',    label: 'En cola'    },
  { key: 'procesando', label: 'Procesando' },
  { key: 'terminado',  label: 'Terminado'  },
  { key: 'error',      label: 'Error'      },
];

interface ReportsPageProps {
  reports: Report[];
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
  onWord: (id: string) => void;
}

export default function ReportsPage({ reports, onStart, onDelete, onWord }: ReportsPageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedId = searchParams.get('id');
  const filter = (searchParams.get('filter') ?? 'todos') as FilterKey;

  const setSelectedId = (id: string) => setSearchParams({ filter, id });
  const setFilter = (f: FilterKey) => setSearchParams(selectedId ? { filter: f, id: selectedId } : { filter: f });

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: reports.length, en_cola: 0, procesando: 0, terminado: 0, error: 0 };
    reports.forEach(r => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }, [reports]);

  const filtered = useMemo(() =>
    filter === 'todos' ? reports : reports.filter(r => r.status === filter),
    [reports, filter],
  );

  const selected = reports.find(r => r.id === selectedId) ?? null;
  const totalLabel = `${reports.length} informes · ${counts.procesando || 0} en proceso · ${counts.en_cola || 0} en cola`;

  return (
    <main className="max-w-[1320px] mx-auto px-7 pt-7 pb-14">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="m-0 text-[24px] font-bold tracking-[-0.01em]">Informes de validación</h1>
          <p className="mt-1.5 mb-0 text-[13px] text-[#8A969E]">{totalLabel}</p>
        </div>
        <button
          onClick={() => navigate('/create')}
          className="inline-flex items-center gap-2 px-[18px] py-[11px] bg-[#0F8B81] text-white border-none rounded-[10px] font-semibold text-[14px] cursor-pointer hover:bg-[#0C6E66] transition-colors shadow-[0_3px_10px_rgba(15,139,129,.25)]"
        >
          <PlusIcon className="w-[17px] h-[17px]" strokeWidth={2.2} />
          Nuevo informe
        </button>
      </div>

      <div className="flex gap-2 mt-[22px] flex-wrap">
        {CHIP_DEFS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`inline-flex items-center gap-[7px] px-[13px] py-[7px] border rounded-full font-semibold text-[12.5px] cursor-pointer transition-colors ${
                active
                  ? 'bg-[#0F8B81] border-[#0F8B81] text-white'
                  : 'bg-white border-[#E4E7EB] text-[#5A6B75] hover:bg-[#F2F4F6]'
              }`}
            >
              {label}
              <span
                className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full font-semibold text-[11px] ${
                  active ? 'bg-[rgba(255,255,255,.22)] text-white' : 'bg-[#F2F4F6] text-[#8A969E]'
                }`}
                style={{ fontFamily: "'IBM Plex Mono'" }}
              >
                {counts[key] || 0}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="grid gap-[22px] mt-[22px] items-start"
        style={{ gridTemplateColumns: 'minmax(0,1.25fr) minmax(0,1fr)' }}
      >
        <div className="flex flex-col gap-3">
          {filtered.map(report => (
            <Card
              key={report.id}
              report={report}
              selected={report.id === selectedId}
              onSelect={setSelectedId}
              onEdit={id => navigate(`/edit?id=${encodeURIComponent(id)}`)}
              onDelete={onDelete}
              onWord={onWord}
            />
          ))}
          {filtered.length === 0 && (
            <div className="p-12 text-center bg-white border border-dashed border-[#D6DBDF] rounded-[13px] text-[13px] text-[#8A969E]">
              No hay informes con este estado.
            </div>
          )}
        </div>

        <DetailPanel report={selected} onStart={onStart} onWord={onWord} />
      </div>
    </main>
  );
}
