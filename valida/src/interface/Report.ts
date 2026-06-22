export type ReportStatus = 'en_cola' | 'procesando' | 'terminado' | 'error';

export interface Report {
  id: string;
  name: string;
  product: string;
  date: string;
  status: ReportStatus;
  hasWord: boolean;
}

export interface DocumentGroup {
  name: string;
  doc: string;
  files: number;
}

export interface WizardForm {
  nombreReporte: string;
  codigoInforme: string;
  nombreProducto: string;
  codigoProducto: string;
  ingredientes: string;
  rango: string;
  protocolo: string;
  hojas: string;
  bitacoras: string;
  groups: Record<string, { selected: boolean; doc: string; file: string }>;
}
