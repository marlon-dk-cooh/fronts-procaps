import type { ReportStatus } from '../interface/Report';
import { STATUS_META } from '../utils/statusMeta';

export default function Badge({ status }: { status: ReportStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-[10px] py-1 rounded-full font-semibold text-[11.5px] shrink-0"
      style={{ background: m.bg, color: m.color }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-none ${m.pulse ? 'animate-valida-pulse' : ''}`}
        style={{ background: m.dot }}
      />
      {m.label}
    </span>
  );
}
