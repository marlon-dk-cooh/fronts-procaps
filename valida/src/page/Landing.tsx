import { ArrowUpTrayIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const STEPS = [
  { num: '01', label: 'Carga documentos' },
  { num: '02', label: 'Procesa con IA' },
  { num: '03', label: 'Genera reporte Word' },
];

export default function Landing({ goDashboard }: { goDashboard: () => void }) {
  return (
    <main
      className="min-h-[calc(100vh-60px)] flex items-center justify-center px-6 py-14"
      style={{ background: 'radial-gradient(900px 420px at 50% -140px, #E2F1EF 0%, #F6F7F9 62%)' }}
    >
      <div className="max-w-[660px] text-center">
        <div className="inline-flex items-center gap-[7px] px-3 py-[5px] bg-[#E6F4F2] border border-[#CDE7E3] rounded-full font-semibold text-[12px] text-[#0C6E66] tracking-[.02em]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B81]" />
          Procaps · I+D Analítico
        </div>

        <div
          className="mx-auto mt-7 mb-[22px] w-[84px] h-[84px] rounded-[22px] flex items-center justify-center shadow-[0_14px_30px_rgba(15,139,129,.30)]"
          style={{ background: 'linear-gradient(150deg, #159B90, #0C6E66)' }}
        >
          <ArrowUpTrayIcon className="w-[38px] h-[38px] text-white" strokeWidth={1.5} />
        </div>

        <h1 className="m-0 text-[38px] leading-[1.12] font-bold tracking-[-0.02em]">
          Gestiona tus validaciones<br />
          de forma <span className="text-[#0F8B81]">inteligente</span>
        </h1>
        <p className="mt-[18px] mx-auto max-w-[480px] text-[16px] leading-[1.55] text-[#5A6B75]">
          Adjunta, administra y genera informes de validación analítica en un solo lugar, con extracción de información asistida por IA.
        </p>

        <button
          onClick={goDashboard}
          className="mt-[30px] inline-flex items-center gap-[9px] px-[26px] py-[14px] bg-[#0F8B81] text-white border-none rounded-[11px] font-semibold text-[15px] cursor-pointer hover:bg-[#0C6E66] transition-colors shadow-[0_6px_16px_rgba(15,139,129,.30)]"
        >
          Generar validación
          <ArrowRightIcon className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </button>

        <div className="mt-[52px] flex items-center justify-center gap-2">
          {STEPS.flatMap((step, i) => [
            i > 0 && <div key={`line-${i}`} className="w-[34px] h-px bg-[#D6DBDF]" />,
            <div key={step.num} className="flex flex-col items-center gap-2 w-[150px]">
              <div
                className="w-9 h-9 rounded-[9px] bg-white border border-[#E4E7EB] flex items-center justify-center font-semibold text-[13px] text-[#0F8B81]"
                style={{ fontFamily: "'IBM Plex Mono'" }}
              >
                {step.num}
              </div>
              <div className="text-[13px] font-semibold text-[#44525A]">{step.label}</div>
            </div>,
          ])}
        </div>
      </div>
    </main>
  );
}
