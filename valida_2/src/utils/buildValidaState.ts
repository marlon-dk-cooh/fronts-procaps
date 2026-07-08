import type { WizardForm } from '../interface/Report';

// Maps UI METHODS (WizardShell step 2) → DocumentGroupName enum values used by
// s01_valida_ocr.py / valida_sets.py DOC_KEY_TO_GROUP.
// Accents differ deliberately: "Precisión" (UI) vs "Precision" (enum), etc.
const UI_METHOD_TO_GROUP: Record<string, string> = {
  'Linealidad':             'Linealidad',
  'Precisión del sistema':  'Precision del sistema',
  'Precisión del método':   'Precision del método',
  'Precisión intermedia':   'Precision Intermedia',
  'Exactitud':              'Exactitud',
  'Estabilidad solución':   'Estabilidad solución',
  'Estabilidad fase móvil': 'Estabilidad fase móvil',
  'Robustez':               'Robustez',
};

export interface FileDescriptor {
  name: string;
  url: string | null;
  size: number;
  content_type: string;
  source: string;
  checksum: string | null;
  // Populated when a File object is available so s01_valida_ocr can resolve bytes
  // directly (content_base64 is the highest-priority path in _descriptor_to_bytes).
  // This lets the Databricks job run without the file being staged in ADLS first,
  // which is useful for testing before the intake backend is built.
  content_base64: string | null;
  file_path: string;
}

export interface ValidaStatePayload {
  // Form metadata — carried through for downstream VALIDA nodes
  codigo_informe: string;
  nombre_reporte: string;
  nombre_producto: string;
  codigo_producto: string;
  ingredientes_activos: string;
  rango_validacion: string;
  // Core payload consumed by s01_valida_ocr --valida_input
  document_groups: Record<string, FileDescriptor[]>;
  // Runtime context used by the intake backend when it triggers the Databricks job
  folder_name: string;
  path_prefix: string;
  valida_input_path: string;
}

/** Returns the bronze folder name for this run: [NOMBRE_REPORTE]_[yy_mm_dd_hh] */
export function buildFolderName(form: WizardForm): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const base = (form.nombreReporte || form.codigoInforme || 'REPORTE')
    .toUpperCase()
    .replace(/[^A-Z0-9\-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return `${base}_${yy}_${mm}_${dd}_${hh}`;
}

/** Reads a File as a pure base64 string (no data-URL prefix). */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // dataUrl = "data:application/pdf;base64,<base64>"
      resolve(dataUrl.slice(dataUrl.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function descriptor(
  docName: string,
  file: File | null,
  folderName: string,
  filename: string,
): Promise<FileDescriptor> {
  return {
    name: docName,
    url: null,
    size: file?.size ?? 0,
    content_type: 'application/pdf',
    source: 'upload',
    checksum: null,
    content_base64: file ? await readFileAsBase64(file) : null,
    // Relative path inside bronze container — matches how s01 resolves file_path via ADLS.
    // When content_base64 is present s01 uses it directly; file_path is the fallback
    // for when the intake backend has staged the file to bronze.
    file_path: `${folderName}/${filename}`,
  };
}

/**
 * Builds the ValidaState JSON from the 3-step wizard form.
 *
 * When File objects are present the descriptors include content_base64 so that
 * s01_valida_ocr --valida_input can extract bytes without ADLS staging. This
 * makes the payload self-contained for Databricks testing before the intake
 * backend (bronze upload + run-now) is built.
 *
 * Invariant: document_groups keys MUST match DocumentGroupName enum values
 * in Valida/src/graph/state.py (see DOC_KEY_TO_GROUP in valida_sets.py).
 */
export async function buildValidaState(form: WizardForm): Promise<ValidaStatePayload> {
  const folderName = buildFolderName(form);
  const documentGroups: Record<string, FileDescriptor[]> = {};

  // Fixed groups — always present when the user has attached the file
  if (form.protocolo) {
    documentGroups['Protocolo'] = [
      await descriptor('Protocolo', form.protocolo_file, folderName, form.protocolo),
    ];
  }
  if (form.hojas) {
    documentGroups['Hojas de Trabajo Preparacion'] = [
      await descriptor('Hojas de Trabajo Preparacion', form.hojas_file, folderName, form.hojas),
    ];
  }
  if (form.bitacoras) {
    documentGroups['Preparacion Bitacoras'] = [
      await descriptor('Preparacion Bitacoras', form.bitacoras_file, folderName, form.bitacoras),
    ];
  }

  // Method groups (step 2): each selected + attached group → one FileDescriptor
  for (const [uiName, g] of Object.entries(form.groups)) {
    if (!g.selected || !g.file) continue;
    const groupName = UI_METHOD_TO_GROUP[uiName];
    if (!groupName) continue;
    const existing = documentGroups[groupName] ?? [];
    existing.push(await descriptor(g.doc, g.file_obj, folderName, g.file));
    documentGroups[groupName] = existing;
  }

  return {
    codigo_informe: form.codigoInforme,
    nombre_reporte: form.nombreReporte,
    nombre_producto: form.nombreProducto,
    codigo_producto: form.codigoProducto,
    ingredientes_activos: form.ingredientes,
    rango_validacion: form.rango,
    document_groups: documentGroups,
    folder_name: folderName,
    path_prefix: folderName,
    valida_input_path: `${folderName}/valida_state.json`,
  };
}
