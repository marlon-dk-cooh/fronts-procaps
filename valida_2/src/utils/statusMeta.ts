import type { ReportStatus } from '../interface/Report';

export const STATUS_META: Record<ReportStatus, { label: string; bg: string; color: string; dot: string; pulse: boolean }> = {
  en_cola:    { label: 'En cola',    bg: '#EEF1F4', color: '#5A6B75', dot: '#94A3AD', pulse: false },
  procesando: { label: 'Procesando', bg: '#FFF4E0', color: '#9A6B00', dot: '#E0A000', pulse: true  },
  terminado:  { label: 'Terminado',  bg: '#E5F3EC', color: '#1F7A4D', dot: '#2B9D63', pulse: false },
  error:      { label: 'Error',      bg: '#FCE9E7', color: '#B23A2E', dot: '#D9483B', pulse: false },
};
