import type { ValidaStatePayload } from '../utils/buildValidaState';

// Cognitive backend base (e.g. http://localhost:8000/api/v1). The valida router
// is mounted at /api/v1/valida in app/main.py.
const API_BASE =
  (import.meta.env.VITE_APP_API_URL_GPT as string | undefined) ??
  'http://localhost:8000/api/v1';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export interface ValidaUploadedFile {
  path: string;
  bytes: number;
}

export interface ValidaUploadResponse {
  folder: string;
  container: string;
  valida_state_path: string;
  uploaded_files: ValidaUploadedFile[];
  skipped: string[];
  total_bytes: number;
}

/**
 * POST the wizard's ValidaState payload to the intake endpoint, which decodes
 * each descriptor's content_base64 and stages the PDFs + valida_state.json under
 * bronze/{folder}/.
 *
 * With VITE_USE_MOCKS=true the call is short-circuited (no backend needed).
 */
export async function uploadValidaState(
  payload: ValidaStatePayload,
): Promise<ValidaUploadResponse> {
  if (USE_MOCKS) {
    return {
      folder: payload.path_prefix,
      container: 'bronze',
      valida_state_path: payload.valida_input_path,
      uploaded_files: [],
      skipped: [],
      total_bytes: 0,
    };
  }

  const res = await fetch(`${API_BASE}/valida/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Upload a bronze falló (HTTP ${res.status}): ${detail}`);
  }

  return res.json() as Promise<ValidaUploadResponse>;
}

export interface ValidaRunResponse {
  run_id: string;
}

export type ValidaPhase = 'ocr' | 'reasoning' | 'render' | 'done';

export interface ValidaRunStatusResponse {
  run_id: string;
  status: 'procesando' | 'terminado' | 'error';
  phase: ValidaPhase;
  report_available: boolean;
  life_cycle_state: string;
  result_state: string;
  detail: string;
}

/** Report metadata carried into the OCR filename lookup + DOCX render. */
export interface ValidaRunMeta {
  nombreReporte: string;
  codigoInforme?: string;
  nombreProducto?: string;
  codigoProducto?: string;
  rangoValidacion?: string;
}

/**
 * Triggers the Databricks VALIDA job for a report already staged in bronze.
 * Returns the run_id immediately (the job runs async on Databricks; the backend
 * then auto-chains the reasoning + render agent once the OCR finishes).
 *
 * With VITE_USE_MOCKS=true a fake run_id is returned (no backend needed).
 */
export async function startValidationRun(
  pathPrefix: string,
  validaInputPath: string,
  meta: ValidaRunMeta,
): Promise<ValidaRunResponse> {
  if (USE_MOCKS) {
    return { run_id: `mock-${Date.now()}` };
  }

  const res = await fetch(`${API_BASE}/valida/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path_prefix: pathPrefix,
      valida_input: validaInputPath,
      nombre_reporte: meta.nombreReporte,
      codigo_informe: meta.codigoInforme ?? '',
      nombre_producto: meta.nombreProducto ?? '',
      codigo_producto: meta.codigoProducto ?? '',
      rango_validacion: meta.rangoValidacion ?? '',
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`No se pudo iniciar la validación (HTTP ${res.status}): ${detail}`);
  }

  return res.json() as Promise<ValidaRunResponse>;
}

/**
 * Polls the unified VALIDA pipeline status (OCR -> reasoning -> render). `status`
 * maps to ReportStatus; `phase` drives the progress message.
 *
 * With VITE_USE_MOCKS=true it resolves to a done/terminado state.
 */
export async function getRunStatus(runId: string): Promise<ValidaRunStatusResponse> {
  if (USE_MOCKS) {
    return {
      run_id: runId, status: 'terminado', phase: 'done', report_available: true,
      life_cycle_state: 'TERMINATED', result_state: 'SUCCESS', detail: '',
    };
  }

  const res = await fetch(`${API_BASE}/valida/run/${encodeURIComponent(runId)}/status`);

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`No se pudo consultar el estado (HTTP ${res.status}): ${detail}`);
  }

  return res.json() as Promise<ValidaRunStatusResponse>;
}

/**
 * Downloads the generated DOCX for a finished run and opens it in the browser
 * (triggers a download). No-op-ish under mocks (nothing to download).
 */
export async function downloadReport(runId: string): Promise<void> {
  if (USE_MOCKS) {
    window.alert('Modo mock: no hay reporte real para descargar.');
    return;
  }

  const res = await fetch(`${API_BASE}/valida/run/${encodeURIComponent(runId)}/report`);
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`No se pudo descargar el reporte (HTTP ${res.status}): ${detail}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Reporte de validación.docx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
