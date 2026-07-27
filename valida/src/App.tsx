import { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import type { Report, WizardForm } from './interface/Report';
import { INITIAL_REPORTS } from './mock/data';
import Header from './components/Header';
import Modal from './components/Modal';
import ReportsPage from './page/Reports';
import CreateReport from './page/CreateReport';
import EditReport from './page/EditReport';
import SystemPage from './page/System';

export const EMPTY_FORM: WizardForm = {
  nombreReporte: '', codigoInforme: '', nombreProducto: '', codigoProducto: '',
  ingredientes: '', rango: '', protocolo: '', hojas: '', bitacoras: '', groups: {},
};

function App() {
  const [modal, setModal]     = useState<{ id: string } | null>(null);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const t = timers.current;
    return () => { Object.values(t).forEach(clearTimeout); };
  }, []);

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const addReport = (rep: Report) => {
    setReports(prev => [rep, ...prev]);
  };

  const updateReport = (id: string, patch: Partial<Report>) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const confirmStart = () => {
    if (!modal) return;
    const id = modal.id;
    setModal(null);
    updateReport(id, { status: 'procesando' });
    timers.current[id] = setTimeout(() => {
      updateReport(id, { status: 'terminado', hasWord: true });
    }, 4200);
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <ReportsPage
              reports={reports}
              onStart={id => setModal({ id })}
              onDelete={deleteReport}
            />
          }
        />
        <Route
          path="/create"
          element={<CreateReport addReport={addReport} />}
        />
        <Route
          path="/edit"
          element={<EditReport reports={reports} updateReport={updateReport} />}
        />
        <Route
          path="/system"
          element={<SystemPage />}
        />
      </Routes>

      {modal && <Modal onClose={() => setModal(null)} onConfirm={confirmStart} />}
    </div>
  );
}

export default App;
