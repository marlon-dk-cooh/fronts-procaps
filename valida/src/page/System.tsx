import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import type { ReportStatus } from '../interface/Report';

const COLORS = [
  { name: 'Primary',       hex: '#0F8B81', desc: 'Brand principal'     },
  { name: 'Dark',          hex: '#0C6E66', desc: 'Hover / énfasis'     },
  { name: 'Light BG',      hex: '#E6F4F2', desc: 'Fondos ligeros'      },
  { name: 'Surface',       hex: '#F6F7F9', desc: 'Fondo de app'        },
  { name: 'Text primary',  hex: '#1A2B32', desc: 'Texto principal'      },
  { name: 'Text muted',    hex: '#8A969E', desc: 'Texto secundario'     },
  { name: 'Border',        hex: '#E4E7EB', desc: 'Separadores'          },
  { name: 'Error',         hex: '#D9483B', desc: 'Error / eliminar'     },
];

const TYPE_SCALE = [
  { label: 'Display',   size: '38px', weight: 700,  sample: 'Gestiona tus validaciones'      },
  { label: 'Heading 1', size: '24px', weight: 700,  sample: 'Informes de validación'          },
  { label: 'Heading 2', size: '18px', weight: 700,  sample: 'Iniciar proceso'                 },
  { label: 'Heading 3', size: '16px', weight: 700,  sample: 'Datos del informe'               },
  { label: 'Body',      size: '14px', weight: 400,  sample: 'Texto de cuerpo estándar'        },
  { label: 'Small',     size: '12.5px', weight: 400, sample: 'Texto auxiliar y leyendas'      },
  { label: 'Mono',      size: '13px', weight: 600,  sample: 'REP-I&D-0561', mono: true       },
];

const STATUSES: ReportStatus[] = ['en_cola', 'procesando', 'terminado', 'error'];

const BUTTONS = [
  { label: 'Primario',   cls: 'bg-[#0F8B81] text-white hover:bg-[#0C6E66] shadow-[0_3px_10px_rgba(15,139,129,.25)]' },
  { label: 'Secundario', cls: 'bg-white text-[#44525A] border border-[#D6DBDF] hover:bg-[#F2F4F6]'                  },
  { label: 'Peligro',    cls: 'bg-white text-[#B23A2E] border border-[#F0DAD7] hover:bg-[#FCF2F1]'                  },
  { label: 'Teal suave', cls: 'bg-[#E6F4F2] text-[#0C6E66] border border-[#CDE7E3] hover:bg-[#D7ECE8]'             },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="text-[11px] font-bold tracking-[.08em] uppercase text-[#8A969E] mb-4">{title}</div>
      {children}
    </section>
  );
}

export default function SystemPage() {
  const navigate = useNavigate();
  return (
    <main className="max-w-[960px] mx-auto px-7 pt-7 pb-16">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-[7px] py-1.5 mb-2 bg-transparent border-none font-medium text-[13px] text-[#8A969E] cursor-pointer hover:text-[#44525A] transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A969E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
        </svg>
        Volver a informes
      </button>
      <h1 className="m-0 text-[24px] font-bold tracking-[-0.01em]">Sistema de diseño</h1>
      <p className="mt-1.5 mb-8 text-[13px] text-[#8A969E]">Referencia visual del lenguaje de diseño de VALIDA · Procaps I+D Analítico.</p>

      {/* Colors */}
      <Section title="Colores">
        <div className="grid grid-cols-4 gap-3">
          {COLORS.map(c => (
            <div key={c.hex} className="bg-white border border-[#E4E7EB] rounded-[12px] overflow-hidden">
              <div className="h-16" style={{ background: c.hex }} />
              <div className="px-3 py-[10px]">
                <div className="text-[13px] font-semibold text-[#26343B]">{c.name}</div>
                <div className="text-[11px] text-[#8A969E]">{c.desc}</div>
                <div className="mt-[3px] text-[11px] text-[#A7B1B8]" style={{ fontFamily: "'IBM Plex Mono'" }}>{c.hex}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section title="Tipografía">
        <div className="bg-white border border-[#E4E7EB] rounded-[14px] overflow-hidden divide-y divide-[#EEF0F2]">
          {TYPE_SCALE.map(t => (
            <div key={t.label} className="flex items-center gap-6 px-5 py-4">
              <div className="w-[110px] flex-none">
                <div className="text-[12px] font-semibold text-[#44525A]">{t.label}</div>
                <div className="text-[11px] text-[#A7B1B8]" style={{ fontFamily: "'IBM Plex Mono'" }}>{t.size} / w{t.weight}</div>
              </div>
              <div
                className="flex-1 text-[#1A2B32] leading-snug"
                style={{ fontSize: t.size, fontWeight: t.weight, fontFamily: t.mono ? "'IBM Plex Mono'" : undefined }}
              >
                {t.sample}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Badges */}
      <Section title="Estado (Badges)">
        <div className="flex flex-wrap gap-3">
          {STATUSES.map(s => <Badge key={s} status={s} />)}
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Botones">
        <div className="flex flex-wrap gap-3">
          {BUTTONS.map(b => (
            <button
              key={b.label}
              className={`px-[18px] py-[10px] rounded-[10px] font-semibold text-[14px] cursor-pointer transition-colors ${b.cls}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Inputs */}
      <Section title="Campos de entrada">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-[#44525A] mb-1.5">Campo normal</label>
            <input
              defaultValue=""
              placeholder="Ej. PRUEBA-VALIDA-DK"
              className="w-full px-3 py-[10px] text-[14px] border border-[#D6DBDF] rounded-[9px] bg-white focus:border-[#0F8B81]"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-[#44525A] mb-1.5">Campo con error</label>
            <input
              defaultValue=""
              placeholder="Campo obligatorio"
              className="w-full px-3 py-[10px] text-[14px] border rounded-[9px] bg-white"
              style={{ borderColor: '#D9483B' }}
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-[#44525A] mb-1.5">Campo monoespaciado</label>
            <input
              defaultValue="REP-I&D-0561"
              className="w-full px-3 py-[10px] text-[14px] border border-[#9ED2CB] rounded-[9px] bg-[#F2FAF9]"
              style={{ fontFamily: "'IBM Plex Mono'" }}
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-[#44525A] mb-1.5">Select</label>
            <select className="w-full px-3 py-[10px] text-[14px] border border-[#D6DBDF] rounded-[9px] bg-white cursor-pointer">
              <option>Reporte LIMS</option>
              <option>Soportes Cromatográficos</option>
            </select>
          </div>
        </div>
      </Section>
    </main>
  );
}
