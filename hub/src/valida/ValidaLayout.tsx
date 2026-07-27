import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import type { Report, WizardForm } from './interface/Report';
import { INITIAL_REPORTS } from './mock/data';
import Header from './components/Header';
import Modal from './components/Modal';
import { startValidationRun, getRunStatus, downloadReport } from './services/validaApi';

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
  addReport: (rep: Report) => void;
  updateReport: (id: string, patch: Partial<Report>) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
  onWord: (id: string) => void;
}

export default function ValidaLayout() {
  const [modal, setModal]     = useState<{ id: string } | null>(null);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const t = timers.current;
    return () => { Object.values(t).forEach(clearInterval); };
  }, []);

  const stopPolling = (id: string) => {
    if (timers.current[id]) {
      clearInterval(timers.current[id]);
      delete timers.current[id];
    }
  };

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const addReport = (rep: Report) => {
    setReports(prev => [rep, ...prev]);
  };

  const updateReport = (id: string, patch: Partial<Report>) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const confirmStart = async () => {
    if (!modal) return;
    const id = modal.id;
    setModal(null);

    const report = reports.find(r => r.id === id);
    if (!report?.pathPrefix || !report?.validaInputPath) {
      updateReport(id, { status: 'error' });
      window.alert('Falta el contexto del informe (carpeta en bronze). Vuelve a crear el informe.');
      return;
    }

    updateReport(id, { status: 'procesando', phase: 'ocr' });
    try {
      const { run_id } = await startValidationRun(
        report.pathPrefix,
        report.validaInputPath,
        { nombreReporte: report.name, nombreProducto: report.product },
      );
      updateReport(id, { runId: run_id });

      // Poll the unified pipeline (OCR -> reasoning -> render). The progress bar in
      // DetailPanel keys off status === 'procesando' and shows a phase message.
      timers.current[id] = setInterval(async () => {
        try {
          const { status, phase } = await getRunStatus(run_id);
          if (status === 'terminado') {
            stopPolling(id);
            updateReport(id, { status: 'terminado', phase: 'done', hasWord: true });
          } else if (status === 'error') {
            stopPolling(id);
            updateReport(id, { status: 'error' });
          } else {
            updateReport(id, { phase });
          }
        } catch (err) {
          // Transient poll failure: keep polling, just log it.
          console.error('[VALIDA] poll status failed:', err);
        }
      }, POLL_INTERVAL_MS);
    } catch (err) {
      console.error('[VALIDA] start run failed:', err);
      updateReport(id, { status: 'error' });
      window.alert(`No se pudo iniciar la validación.\n\n${(err as Error).message}`);
    }
  };

  const openReport = async (id: string) => {
    const report = reports.find(r => r.id === id);
    if (!report?.runId) {
      window.alert('El reporte aún no está disponible.');
      return;
    }
    try {
      await downloadReport(report.runId);
    } catch (err) {
      console.error('[VALIDA] download report failed:', err);
      window.alert(`No se pudo descargar el reporte.\n\n${(err as Error).message}`);
    }
  };

  const context: ValidaOutletContext = {
    reports,
    addReport,
    updateReport,
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
