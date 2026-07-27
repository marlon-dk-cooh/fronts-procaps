import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserMenu } from '@/components/custom/UserMenu';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-[60px] flex items-center justify-between px-6 bg-white dark:bg-neutral-900 border-b border-[#E4E7EB] dark:border-neutral-800">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          title="Volver al portal"
          className="flex items-center gap-1 text-[13px] font-medium text-[#44525A] dark:text-neutral-400 hover:text-[#0F8B81] dark:hover:text-[#2DD4C4] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Portal
        </button>
        <div className="w-px h-6 bg-[#E4E7EB] dark:bg-neutral-800" />
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/valida')}>
          <div className="w-[34px] h-[34px] rounded-[9px] bg-[#0F8B81] flex items-center justify-center text-white font-bold text-base shadow-[0_2px_8px_rgba(15,139,129,.32)]">
            V
          </div>
          <div className="leading-[1.15]">
            <div className="text-[15px] font-bold tracking-[.05em] text-[#1A2B32] dark:text-neutral-100">VALIDA</div>
            <div className="text-[11px] text-[#8A969E] dark:text-neutral-500 font-medium">Agente de reportes de validación · Procaps</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-[14px]">
        <UserMenu />
      </div>
    </header>
  );
}
