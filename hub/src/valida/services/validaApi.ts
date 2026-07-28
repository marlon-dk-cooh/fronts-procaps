import { getAuthToken } from "@/utils/auth";
import type { ValidaStatePayload } from '../utils/buildValidaState';
import type { Report, ReportPhase, ReportStatus } from '../interface/Report';

// Cognitive backend base (e.g. http://localhost:8000/api/v1). The valida router
// is mounted at /api/v1/valida in app/main.py.
const API_BASE =
  (import.meta.env.VITE_APP_API_URL_VALIDA as string | undefined) ??
  'http://localhost:8000/api/v1';

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getAuthToken()}` };
}

/** Single fetch wrapper: auth headers + uniform error message with the backend detail. */
async function request<T>(
  path: string,
  { method = 'GET', body, action }: { method?: string; body?: unknown; action: string },
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body === undefined
      ? authHeaders()
      : { 'Content-Type': 'application/json', ...authHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`${action} (HTTP ${res.status}): ${detail}`);
  }

  return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>);
}

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
 */
export function uploadValidaState(
  payload: ValidaStatePayload,
): Promise<ValidaUploadResponse> {
  return request('/valida/upload', {
    method: 'POST', body: payload, action: 'Upload a bronze falló',
  });
}

export type ValidaPhase = ReportPhase;

/** Mirrors ValidaReportOut: the Cosmos document as served by the backend. */
export interface ValidaReportDto {
  id: string;
  run_id: string | null;
  userId: string;
  path_prefix: string;
  nombre_reporte: string;
  report_meta: Record<string, string>;
  phase: ValidaPhase;
  status: ReportStatus;
  docx_path: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface ValidaReportsListResponse {
  reports: ValidaReportDto[];
  counts: Record<string, number>;
}

export interface ValidaRunResponse {
  run_id: string;
  report_id: string;
}

export interface ValidaRunStatusResponse {
  report_id: string;
  run_id: string | null;
  status: ReportStatus;
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

/** `created_at` arrives as "YYYY-MM-DD HH:MM:SS" (Bogotá); show it as "18 Jun 2026". */
function formatCreatedAt(createdAt: string): string {
  const parsed = new Date(createdAt.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return createdAt;
  return parsed.toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/** Cosmos document -> the shape the UI renders. `id` is the report id, not the run id. */
export function toReport(dto: ValidaReportDto): Report {
  return {
    id: dto.id,
    name: dto.nombre_reporte,
    product: dto.report_meta?.nombre_producto ?? '',
    date: formatCreatedAt(dto.created_at),
    status: dto.status,
    hasWord: dto.phase === 'done' && Boolean(dto.docx_path),
    pathPrefix: dto.path_prefix,
    validaInputPath: dto.report_meta?.valida_input ?? '',
    runId: dto.run_id ?? undefined,
    phase: dto.phase,
  };
}

/**
 * Registers the report in Cosmos right after the wizard stages its files in bronze,
 * before any Databricks job exists. From here on the report is server-owned: the list
 * always comes from the store, so a refresh no longer loses it.
 */
export function createReport(
  pathPrefix: string,
  validaInputPath: string,
  meta: ValidaRunMeta,
): Promise<ValidaReportDto> {
  return request('/valida/reports', {
    method: 'POST',
    action: 'No se pudo registrar el informe',
    body: {
      path_prefix: pathPrefix,
      valida_input: validaInputPath,
      nombre_reporte: meta.nombreReporte,
      codigo_informe: meta.codigoInforme ?? '',
      nombre_producto: meta.nombreProducto ?? '',
      codigo_producto: meta.codigoProducto ?? '',
      rango_validacion: meta.rangoValidacion ?? '',
    },
  });
}

/** All reports owned by the caller, newest first, plus per-status counts for the tabs. */
export function listReports(limit = 100): Promise<ValidaReportsListResponse> {
  return request(`/valida/reports?limit=${limit}`, {
    action: 'No se pudieron cargar los informes',
  });
}

/**
 * Triggers the Databricks VALIDA job for a report already registered in Cosmos.
 * Returns the run_id immediately (the job runs async on Databricks; the backend
 * then auto-chains the reasoning + render agent once the OCR finishes).
 */
export function startValidationRun(reportId: string): Promise<ValidaRunResponse> {
  return request('/valida/run', {
    method: 'POST',
    body: { report_id: reportId },
    action: 'No se pudo iniciar la validación',
  });
}

/**
 * Polls the unified VALIDA pipeline status (OCR -> reasoning -> render). `status`
 * maps to ReportStatus; `phase` drives the progress message.
 */
export function getRunStatus(reportId: string): Promise<ValidaRunStatusResponse> {
  return request(`/valida/run/${encodeURIComponent(reportId)}/status`, {
    action: 'No se pudo consultar el estado',
  });
}

/** Renames the report in Cosmos (the wizard's "editar" flow). */
export function renameReport(
  reportId: string,
  nombreReporte: string,
): Promise<ValidaReportDto> {
  return request(`/valida/run/${encodeURIComponent(reportId)}`, {
    method: 'PATCH',
    body: { nombre_reporte: nombreReporte },
    action: 'No se pudo renombrar el informe',
  });
}

/** Deletes the report document (does not touch the files staged in ADLS). */
export function deleteReport(reportId: string): Promise<void> {
  return request(`/valida/run/${encodeURIComponent(reportId)}`, {
    method: 'DELETE',
    action: 'No se pudo borrar el informe',
  });
}

/**
 * Downloads the generated DOCX for a finished report and opens it in the browser
 * (triggers a download).
 */
export async function downloadReport(reportId: string): Promise<void> {
  const res = await fetch(
    `${API_BASE}/valida/run/${encodeURIComponent(reportId)}/report`,
    { headers: authHeaders() },
  );
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
