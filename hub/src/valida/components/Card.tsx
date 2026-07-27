import {
  CubeIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '@/context/ThemeContext';
import type { Report } from '../interface/Report';
import Badge from './Badge';

interface CardProps {
  report: Report;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onWord: (id: string) => void;
}

export default function Card({ report: r, selected, onSelect, onEdit, onDelete, onWord }: CardProps) {
  const { isDarkMode } = useTheme();
  const borderIdle = isDarkMode ? '#3F3F46' : '#E4E7EB';

  return (
    <div
      onClick={() => onSelect(r.id)}
      className="rounded-[13px] p-[15px_17px] cursor-pointer transition-colors"
      style={{
        background: selected ? (isDarkMode ? '#132320' : '#FBFEFD') : (isDarkMode ? '#18181B' : '#fff'),
        border: `1px solid ${selected ? '#0F8B81' : borderIdle}`,
        borderLeft: `3px solid ${selected ? '#0F8B81' : (isDarkMode ? '#3F3F46' : '#EDEFF1')}`,
      }}
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.borderColor = '#0F8B81'; }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.borderColor = borderIdle; }}
    >
      {/* ID + badge */}
      <div className="flex items-center justify-between gap-2.5">
        <span className="font-semibold text-[13px] text-[#0F8B81] dark:text-[#2DD4C4] tracking-[.01em]" style={{ fontFamily: "'IBM Plex Mono'" }}>
          {r.id}
        </span>
        <Badge status={r.status} />
      </div>

      {/* Name */}
      <div className="mt-2 text-[14px] font-semibold leading-[1.4] text-[#26343B] dark:text-neutral-100 line-clamp-2">{r.name}</div>

      {/* Meta */}
      <div className="mt-2 flex items-center gap-3 text-[12px] text-[#8A969E] dark:text-neutral-500">
        <span className="inline-flex items-center gap-[5px]">
          <CubeIcon className="w-[13px] h-[13px] text-[#A7B1B8] dark:text-neutral-600 flex-none" />
          {r.product}
        </span>
        <span className="inline-flex items-center gap-[5px]">
          <CalendarDaysIcon className="w-[13px] h-[13px] text-[#A7B1B8] dark:text-neutral-600 flex-none" />
          {r.date}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-[13px] pt-3 border-t border-[#EEF0F2] dark:border-neutral-800 flex gap-[7px] flex-wrap">
        <button
          onClick={e => { e.stopPropagation(); onEdit(r.id); }}
          className="inline-flex items-center gap-1.5 px-[11px] py-[6px] bg-white dark:bg-neutral-900 border border-[#E4E7EB] dark:border-neutral-700 rounded-lg font-medium text-[12px] text-[#44525A] dark:text-neutral-300 cursor-pointer hover:bg-[#F2F4F6] dark:hover:bg-neutral-800 transition-colors"
        >
          <PencilSquareIcon className="w-[13px] h-[13px] text-[#6B7780] dark:text-neutral-400" />
          Editar
        </button>

        {r.status === 'terminado' && (
          <button
            onClick={e => { e.stopPropagation(); onWord(r.id); }}
            className="inline-flex items-center gap-1.5 px-[11px] py-[6px] bg-[#E6F4F2] dark:bg-[#123326] border border-[#CDE7E3] dark:border-[#1F5C4D] rounded-lg font-semibold text-[12px] text-[#0C6E66] dark:text-[#4ADE94] cursor-pointer hover:bg-[#D7ECE8] dark:hover:bg-[#164031] transition-colors"
          >
            <DocumentTextIcon className="w-[13px] h-[13px]" />
            Word
          </button>
        )}

        <button
          onClick={e => { e.stopPropagation(); onDelete(r.id); }}
          className="inline-flex items-center gap-1.5 px-[11px] py-[6px] bg-white dark:bg-neutral-900 border border-[#F0DAD7] dark:border-[#5C2C26] rounded-lg font-medium text-[12px] text-[#B23A2E] dark:text-[#F87066] cursor-pointer hover:bg-[#FCF2F1] dark:hover:bg-[#3F1613] transition-colors ml-auto"
        >
          <TrashIcon className="w-[13px] h-[13px]" />
          Eliminar
        </button>
      </div>
    </div>
  );
}
