import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// VALIDA se monta embebido en un <iframe> dentro del hub (ver
// hub/src/pages/valida/Valida.tsx), así que "volver al portal" tiene que
// navegar la ventana top, no solo el iframe. En dev standalone (fuera del
// hub) window.top === window.self y simplemente navega esta misma ventana.
function goToPortal() {
  const top = window.top;
  if (top && top !== window.self) {
    top.location.href = '/';
  } else {
    window.location.href = '/';
  }
}

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-[60px] flex items-center justify-between px-6 bg-white border-b border-[#E4E7EB]">
      <div className="flex items-center gap-4">
        <button
          onClick={goToPortal}
          title="Volver al portal"
          className="flex items-center gap-1 text-[13px] font-medium text-[#44525A] hover:text-[#0F8B81] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Portal
        </button>
        <div className="w-px h-6 bg-[#E4E7EB]" />
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-[34px] h-[34px] rounded-[9px] bg-[#0F8B81] flex items-center justify-center text-white font-bold text-base shadow-[0_2px_8px_rgba(15,139,129,.32)]">
            V
          </div>
          <div className="leading-[1.15]">
            <div className="text-[15px] font-bold tracking-[.05em]">VALIDA</div>
            <div className="text-[11px] text-[#8A969E] font-medium">Agente de reportes de validación · Procaps</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-[14px]">
        <div className="w-8 h-8 rounded-full bg-[#EDEFF1] flex items-center justify-center font-semibold text-[12px] text-[#5A6B75]">
          DK
        </div>
      </div>
    </header>
  );
}
