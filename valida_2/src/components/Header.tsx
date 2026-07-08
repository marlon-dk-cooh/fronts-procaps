import { useNavigate, useLocation } from 'react-router-dom';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-30 h-[60px] flex items-center justify-between px-6 bg-white border-b border-[#E4E7EB]">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-[34px] h-[34px] rounded-[9px] bg-[#0F8B81] flex items-center justify-center text-white font-bold text-base shadow-[0_2px_8px_rgba(15,139,129,.32)]">
          V
        </div>
        <div className="leading-[1.15]">
          <div className="text-[15px] font-bold tracking-[.05em]">VALIDA</div>
          <div className="text-[11px] text-[#8A969E] font-medium">Agente de reportes de validación · Procaps</div>
        </div>
      </div>

      <div className="flex items-center gap-[14px]">
        <button
          onClick={() => navigate('/system')}
          className={`inline-flex items-center gap-[7px] px-[13px] py-[7px] border rounded-lg font-medium text-[13px] cursor-pointer transition-colors ${
            pathname === '/system'
              ? 'bg-[#E6F4F2] border-[#CDE7E3] text-[#0C6E66]'
              : 'bg-transparent border-[#E4E7EB] text-[#44525A] hover:bg-[#F2F4F6]'
          }`}
        >
          <Squares2X2Icon className="w-[15px] h-[15px] text-[#0F8B81]" />
          Sistema de diseño
        </button>
        <div className="w-px h-6 bg-[#E4E7EB]" />
        <div className="w-8 h-8 rounded-full bg-[#EDEFF1] flex items-center justify-center font-semibold text-[12px] text-[#5A6B75]">
          DK
        </div>
      </div>
    </header>
  );
}
