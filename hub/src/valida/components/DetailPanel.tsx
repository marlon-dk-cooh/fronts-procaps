import {
  DocumentIcon,
  ArrowPathIcon,
  PlayIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import type { Report, ReportPhase } from '../interface/Report';
import Badge from './Badge';

// Mensajes de barra de progreso.
const PHASE_MESSAGE: Record<ReportPhase, string> = {
  ocr: 'Extrayendo info de tus reportes...⏳⏳⏳',
  reasoning: 'Pensando en tus reportes 🧠...',
  render: 'Ya casi lo tenemos 📄...',
  done: 'Listo ✅',
};

interface DetailPanelProps {
  report: Report | null;
  onStart: (id: string) => void;
  onWord: (id: string) => void;
}

export default function DetailPanel({ report, onStart, onWord }: DetailPanelProps) {
  if (!report) {
    return (
      <div className="sticky top-[84px] bg-white dark:bg-neutral-900 border border-[#E4E7EB] dark:border-neutral-800 rounded-[14px] overflow-hidden">
        <div className="py-14 px-6 text-center">
          <div className="w-11 h-11 mx-auto rounded-[11px] bg-[#F2F4F6] dark:bg-neutral-800 flex items-center justify-center">
            <DocumentIcon className="w-5 h-5 text-[#A7B1B8] dark:text-neutral-500" />
          </div>
          <div className="mt-3.5 text-[13px] text-[#8A969E] dark:text-neutral-500">Selecciona un informe para ver sus grupos de documentos.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-[84px] bg-white dark:bg-neutral-900 border border-[#E4E7EB] dark:border-neutral-800 rounded-[14px] overflow-hidden">
      {/* Header del panel */}
      <div className="px-5 py-[18px] border-b border-[#EEF0F2] dark:border-neutral-800">
        <div className="flex items-center justify-between gap-2.5">
          <div className="font-semibold text-[13px] text-[#0F8B81] dark:text-[#2DD4C4]" style={{ fontFamily: "'IBM Plex Mono'" }}>{report.id}</div>
          <Badge status={report.status} />
        </div>
        <div className="mt-2 text-[13.5px] font-semibold leading-[1.45] text-[#26343B] dark:text-neutral-100">{report.name}</div>
      </div>

      {/* Procesando */}
      {report.status === 'procesando' && (
        <div className="px-5 py-4 border-b border-[#EEF0F2] dark:border-neutral-800 bg-[#FFFBF2] dark:bg-[#2E260D]">
          <div className="flex items-center gap-2 text-[12.5px] font-semibold text-[#9A6B00] dark:text-[#F5C451]">
            <ArrowPathIcon className="w-[15px] h-[15px] text-[#E0A000] dark:text-[#F5C451] animate-spin" />
            {PHASE_MESSAGE[report.phase ?? 'ocr']}
          </div>
          <div className="mt-2.5 relative h-1.5 bg-[#F3E6C8] dark:bg-[#4A3B0F] rounded-full overflow-hidden">
            <div className="absolute top-0 w-[35%] h-full bg-[#E0A000] dark:bg-[#F5C451] rounded-full animate-valida-bar" />
          </div>
          <div className="mt-2 text-[11.5px] text-[#A98A3E] dark:text-[#C9A64F]">Extracción de información → Análisis → Generación de reporte</div>
        </div>
      )}

      {/* En cola: puede iniciar */}
      {report.status === 'en_cola' && (
        <div className="px-5 py-4 border-b border-[#EEF0F2] dark:border-neutral-800 bg-[#F8FBFB] dark:bg-neutral-800/50">
          <div className="text-[12.5px] text-[#5A6B75] dark:text-neutral-400 leading-relaxed">
            Documentos cargados. Inicia el proceso de validación para generar el reporte.
          </div>
          <button
            onClick={() => onStart(report.id)}
            className="mt-[11px] w-full inline-flex items-center justify-center gap-2 py-[11px] bg-[#0F8B81] text-white border-none rounded-[10px] font-semibold text-[14px] cursor-pointer hover:bg-[#0C6E66] transition-colors"
          >
            <PlayIcon className="w-4 h-4" />
            Iniciar validación
          </button>
        </div>
      )}

      {/* Documento Word generado */}
      {report.hasWord && (
        <div className="px-5 pb-[18px]">
          <div className="flex items-center gap-3 px-[14px] py-[13px] bg-[#E6F4F2] dark:bg-[#123326] border border-[#CDE7E3] dark:border-[#1F5C4D] rounded-[11px]">
            <div className="w-[34px] h-[34px] rounded-lg bg-white dark:bg-neutral-900 flex items-center justify-center flex-none">
              <DocumentTextIcon className="w-[17px] h-[17px] text-[#0C6E66] dark:text-[#4ADE94]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[#0C6E66] dark:text-[#4ADE94]">Reporte de validación.docx</div>
              <div className="text-[11.5px] text-[#3F8F86] dark:text-[#6FBFB2]">Documento generado · listo para descargar</div>
            </div>
            <button
              onClick={() => onWord(report.id)}
              className="px-[13px] py-[7px] bg-[#0F8B81] text-white border-none rounded-lg font-semibold text-[12px] cursor-pointer hover:bg-[#0C6E66] transition-colors flex-none"
            >
              Abrir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
