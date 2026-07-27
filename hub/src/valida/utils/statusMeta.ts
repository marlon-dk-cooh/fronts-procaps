import type { ReportStatus } from '../interface/Report';

export const STATUS_META: Record<ReportStatus, {
  label: string;
  bg: string; bgDark: string;
  color: string; colorDark: string;
  dot: string; dotDark: string;
  pulse: boolean;
}> = {
  en_cola:    { label: 'En cola',    bg: '#EEF1F4', bgDark: '#27272A', color: '#5A6B75', colorDark: '#A1A1AA', dot: '#94A3AD', dotDark: '#A1A1AA', pulse: false },
  procesando: { label: 'Procesando', bg: '#FFF4E0', bgDark: '#4A3B0F', color: '#9A6B00', colorDark: '#F5C451', dot: '#E0A000', dotDark: '#F5C451', pulse: true  },
  terminado:  { label: 'Terminado',  bg: '#E5F3EC', bgDark: '#123326', color: '#1F7A4D', colorDark: '#4ADE94', dot: '#2B9D63', dotDark: '#4ADE94', pulse: false },
  error:      { label: 'Error',      bg: '#FCE9E7', bgDark: '#3F1613', color: '#B23A2E', colorDark: '#F87066', dot: '#D9483B', dotDark: '#F87066', pulse: false },
};
