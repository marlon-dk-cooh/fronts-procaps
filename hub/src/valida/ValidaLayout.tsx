import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import type { Report, WizardForm } from './interface/Report';
import Header from './components/Header';
import Modal from './components/Modal';
import {
  listReports,
  createReport as apiCreateReport,
  renameReport as apiRenameReport,
  deleteReport as apiDeleteReport,
  startValidationRun,
  getRunStatus,
  downloadReport,
  toReport,
  type ValidaRunMeta,
} from './services/validaApi';

const POLL_INTERVAL_MS = 5000;

export const EMPTY_FORM: WizardForm = {
  nombreReporte: '', codigoInforme: '', nombreProducto: '', codigoProducto: '',
  ingredientes: '', rango: '',
  protocolo: '', protocolo_file: null,
  hojas: '', hojas_file: null,
  bitacoras: '', bitacoras_file: null,
  groups: {},
};

export interface ValidaOutletContext {
  reports: Report[];
  loading: boolean;
  loadError: string | null;
  createReport: (
    pathPrefix: string,
    validaInputPath: string,
    meta: ValidaRunMeta,
  ) => Promise<Report>;
  renameReport: (id: string, nombreReporte: string) => Promise<void>;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
  onWord: (id: string) => void;
}

export default function ValidaLayout() {
  const [modal, setModal]         = useState<{ id: string } | null>(null);
  const [reports, setReports]     = useState<Report[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const updateReport = useCallback((id: string, patch: Partial<Report>) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }, []);

  const stopPolling = useCallback((id: string) => {
    if (timers.current[id]) {
      clearInterval(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  // Polls the unified pipeline (OCR -> reasoning -> render) for one report. The
  // progress bar in DetailPanel keys off status === 'procesando' + phase.
  const startPolling = useCallback((id: string) => {
    if (timers.current[id]) return;
    timers.current[id] = setInterval(async () => {
      try {
        const { status, phase, report_available } = await getRunStatus(id);
        if (status === 'terminado') {
          stopPolling(id);
          updateReport(id, { status: 'terminado', phase: 'done', hasWord: report_available });
        } else if (status === 'error') {
          stopPolling(id);
          updateReport(id, { status: 'error' });
        } else {
          updateReport(id, { status, phase });
        }
      } catch (err) {
        // Transient poll failure: keep polling, just log it.
        console.error('[VALIDA] poll status failed:', err);
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling, updateReport]);

  // Single source of truth: the report list always comes from Cosmos. Runs still in
  // flight when the page loads (e.g. after a refresh) resume polling on their own.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { reports: dtos } = await listReports();
        if (cancelled) return;
        const loaded = dtos.map(toReport);
        setReports(loaded);
        loaded
          .filter(r => r.status === 'procesando' && r.runId)
          .forEach(r => startPolling(r.id));
      } catch (err) {
        if (cancelled) return;
        console.error('[VALIDA] load reports failed:', err);
        setLoadError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [startPolling]);

  useEffect(() => {
    const t = timers.current;
    return () => { Object.values(t).forEach(clearInterval); };
  }, []);

  const createReport = useCallback(async (
    pathPrefix: string,
    validaInputPath: string,
    meta: ValidaRunMeta,
  ): Promise<Report> => {
    const created = toReport(await apiCreateReport(pathPrefix, validaInputPath, meta));
    setReports(prev => [created, ...prev]);
    return created;
  }, []);

  const renameReport = useCallback(async (id: string, nombreReporte: string) => {
    const updated = toReport(await apiRenameReport(id, nombreReporte));
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
  }, []);

  const deleteReport = useCallback(async (id: string) => {
    stopPolling(id);
    try {
      await apiDeleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('[VALIDA] delete report failed:', err);
      window.alert(`No se pudo borrar el informe.\n\n${(err as Error).message}`);
    }
  }, [stopPolling]);

  const confirmStart = async () => {
    if (!modal) return;
    const id = modal.id;
    setModal(null);

    updateReport(id, { status: 'procesando', phase: 'ocr' });
    try {
      const { run_id } = await startValidationRun(id);
      updateReport(id, { runId: run_id });
      startPolling(id);
    } catch (err) {
      console.error('[VALIDA] start run failed:', err);
      updateReport(id, { status: 'error' });
      window.alert(`No se pudo iniciar la validación.\n\n${(err as Error).message}`);
    }
  };

  const openReport = async (id: string) => {
    const report = reports.find(r => r.id === id);
    if (!report?.hasWord) {
      window.alert('El reporte aún no está disponible.');
      return;
    }
    try {
      await downloadReport(id);
    } catch (err) {
      console.error('[VALIDA] download report failed:', err);
      window.alert(`No se pudo descargar el reporte.\n\n${(err as Error).message}`);
    }
  };

  const context: ValidaOutletContext = {
    reports,
    loading,
    loadError,
    createReport,
    renameReport,
    onDelete: deleteReport,
    onStart: id => setModal({ id }),
    onWord: openReport,
  };

  return (
    <div className="h-screen overflow-y-auto bg-[#F6F7F9] dark:bg-neutral-950">
      <Header />
      <Outlet context={context} />
      {modal && <Modal onClose={() => setModal(null)} onConfirm={confirmStart} />}
    </div>
  );
}
