import { useState } from 'react';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import type { Report, WizardForm } from '../interface/Report';
import { EMPTY_FORM, type ValidaOutletContext } from '../ValidaLayout';
import WizardShell from '../components/WizardShell';

function reportToForm(r: Report): WizardForm {
  return {
    ...EMPTY_FORM,
    nombreReporte:  r.name,
    codigoInforme:  r.id,
    nombreProducto: r.product,
  };
}

export default function EditReport() {
  const { reports, renameReport } = useOutletContext<ValidaOutletContext>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') ?? '';

  const report = reports.find(r => r.id === id);

  const [form, setForm]             = useState<WizardForm>(() => report ? reportToForm(report) : EMPTY_FORM);
  const [step, setStep]             = useState(1);
  const [showErrors, setShowErrors] = useState(false);

  if (!report) {
    return (
      <main className="max-w-[880px] mx-auto px-7 pt-14 text-center">
        <p className="text-[#8A969E] dark:text-neutral-500">Informe no encontrado.</p>
        <button
          onClick={() => navigate('/valida')}
          className="mt-4 px-5 py-[10px] bg-[#0F8B81] text-white border-none rounded-[9px] font-semibold text-[13.5px] cursor-pointer"
        >
          Volver
        </button>
      </main>
    );
  }

  const guardar = async () => {
    if (!form.hojas && !form.bitacoras) { setShowErrors(true); return; }
    try {
      // Sólo el nombre es editable en Cosmos (PATCH /valida/run/{id}).
      await renameReport(id, form.nombreReporte || id);
      navigate(`/valida?id=${encodeURIComponent(id)}`);
    } catch (err) {
      console.error('[VALIDA] rename report failed:', err);
      window.alert(`No se pudo guardar el informe.\n\n${(err as Error).message}`);
    }
  };

  return (
    <WizardShell
      title={`Editar informe · ${id}`}
      form={form}
      setForm={setForm}
      step={step}
      setStep={setStep}
      showErrors={showErrors}
      setShowErrors={setShowErrors}
      onCancel={() => navigate(`/valida?id=${encodeURIComponent(id)}`)}
      onSave={guardar}
    />
  );
}
