import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function Modal({ onClose, onConfirm }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[rgba(26,43,50,.42)] dark:bg-[rgba(0,0,0,.65)]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-white dark:bg-neutral-900 rounded-[16px] p-[26px] shadow-[0_24px_60px_rgba(0,0,0,.22)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-[46px] h-[46px] rounded-[11px] bg-[#FFF4E0] dark:bg-[#4A3B0F] flex items-center justify-center">
          <ExclamationTriangleIcon className="w-[22px] h-[22px] text-[#9A6B00] dark:text-[#F5C451]" />
        </div>
        <h2 className="mt-4 mb-1.5 text-[18px] font-bold text-[#1A2B32] dark:text-neutral-100">Iniciar proceso de validación</h2>
        <p className="m-0 text-[14px] leading-[1.55] text-[#5A6B75] dark:text-neutral-400">
          Este paso iniciará el procesamiento con el agente IA y no podrá deshacerse. ¿Deseas proceder?
        </p>
        <div className="flex gap-2.5 mt-[22px]">
          <button
            onClick={onClose}
            className="flex-1 py-[11px] bg-white dark:bg-neutral-900 border border-[#D6DBDF] dark:border-neutral-700 rounded-[10px] font-semibold text-[14px] text-[#44525A] dark:text-neutral-300 cursor-pointer hover:bg-[#F2F4F6] dark:hover:bg-neutral-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-[11px] bg-[#0F8B81] text-white border-none rounded-[10px] font-semibold text-[14px] cursor-pointer hover:bg-[#0C6E66] transition-colors"
          >
            Aceptar e iniciar
          </button>
        </div>
      </div>
    </div>
  );
}
