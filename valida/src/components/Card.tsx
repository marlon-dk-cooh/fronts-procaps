import {
  CubeIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
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
  return (
    <div
      onClick={() => onSelect(r.id)}
      className="rounded-[13px] p-[15px_17px] cursor-pointer transition-colors"
      style={{
        background: selected ? '#FBFEFD' : '#fff',
        border: `1px solid ${selected ? '#0F8B81' : '#E4E7EB'}`,
        borderLeft: `3px solid ${selected ? '#0F8B81' : '#EDEFF1'}`,
      }}
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.borderColor = '#0F8B81'; }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.borderColor = '#E4E7EB'; }}
    >
      {/* ID + badge */}
      <div className="flex items-center justify-between gap-2.5">
        <span className="font-semibold text-[13px] text-[#0F8B81] tracking-[.01em]" style={{ fontFamily: "'IBM Plex Mono'" }}>
          {r.id}
        </span>
        <Badge status={r.status} />
      </div>

      {/* Name */}
      <div className="mt-2 text-[14px] font-semibold leading-[1.4] text-[#26343B] line-clamp-2">{r.name}</div>

      {/* Meta */}
      <div className="mt-2 flex items-center gap-3 text-[12px] text-[#8A969E]">
        <span className="inline-flex items-center gap-[5px]">
          <CubeIcon className="w-[13px] h-[13px] text-[#A7B1B8] flex-none" />
          {r.product}
        </span>
        <span className="inline-flex items-center gap-[5px]">
          <CalendarDaysIcon className="w-[13px] h-[13px] text-[#A7B1B8] flex-none" />
          {r.date}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-[13px] pt-3 border-t border-[#EEF0F2] flex gap-[7px] flex-wrap">
        <button
          onClick={e => { e.stopPropagation(); onEdit(r.id); }}
          className="inline-flex items-center gap-1.5 px-[11px] py-[6px] bg-white border border-[#E4E7EB] rounded-lg font-medium text-[12px] text-[#44525A] cursor-pointer hover:bg-[#F2F4F6] transition-colors"
        >
          <PencilSquareIcon className="w-[13px] h-[13px] text-[#6B7780]" />
          Editar
        </button>

        {r.status === 'terminado' && (
          <button
            onClick={e => { e.stopPropagation(); onWord(r.id); }}
            className="inline-flex items-center gap-1.5 px-[11px] py-[6px] bg-[#E6F4F2] border border-[#CDE7E3] rounded-lg font-semibold text-[12px] text-[#0C6E66] cursor-pointer hover:bg-[#D7ECE8] transition-colors"
          >
            <DocumentTextIcon className="w-[13px] h-[13px]" />
            Word
          </button>
        )}

        <button
          onClick={e => { e.stopPropagation(); onDelete(r.id); }}
          className="inline-flex items-center gap-1.5 px-[11px] py-[6px] bg-white border border-[#F0DAD7] rounded-lg font-medium text-[12px] text-[#B23A2E] cursor-pointer hover:bg-[#FCF2F1] transition-colors ml-auto"
        >
          <TrashIcon className="w-[13px] h-[13px]" />
          Eliminar
        </button>
      </div>
    </div>
  );
}
