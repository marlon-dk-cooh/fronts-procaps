export type ReportStatus = 'en_cola' | 'procesando' | 'terminado' | 'error';

// Fase fina del pipeline mientras status === 'procesando' (alimenta la barra).
export type ReportPhase = 'ocr' | 'reasoning' | 'render' | 'done';

export interface Report {
  id: string;
  name: string;
  product: string;
  date: string;
  status: ReportStatus;
  hasWord: boolean;
  // Contexto del run en bronze/Databricks, poblado al crear el informe y usado
  // por "Aceptar e iniciar" para disparar y monitorear el job VALIDA.
  pathPrefix?: string;
  validaInputPath?: string;
  runId?: string;
  phase?: ReportPhase;
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
  protocolo_file: File | null;
  hojas: string;
  hojas_file: File | null;
  bitacoras: string;
  bitacoras_file: File | null;
  groups: Record<string, { selected: boolean; doc: string; file: string; file_obj: File | null }>;
}
