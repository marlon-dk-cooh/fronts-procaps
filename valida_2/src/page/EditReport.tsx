import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Report, WizardForm } from '../interface/Report';
import { EMPTY_FORM } from '../App';
import WizardShell from '../components/WizardShell';

interface Props {
  reports: Report[];
  updateReport: (id: string, patch: Partial<Report>) => void;
}

function reportToForm(r: Report): WizardForm {
  return {
    ...EMPTY_FORM,
    nombreReporte:  r.name,
    codigoInforme:  r.id,
    nombreProducto: r.product,
  };
}

export default function EditReport({ reports, updateReport }: Props) {
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
        <p className="text-[#8A969E]">Informe no encontrado.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-5 py-[10px] bg-[#0F8B81] text-white border-none rounded-[9px] font-semibold text-[13.5px] cursor-pointer"
        >
          Volver
        </button>
      </main>
    );
  }

  const guardar = () => {
    if (!form.hojas && !form.bitacoras) { setShowErrors(true); return; }
    updateReport(id, {
      name:    form.nombreReporte || id,
      product: form.nombreProducto || '—',
    });
    navigate(`/?id=${encodeURIComponent(id)}`);
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
      onCancel={() => navigate(`/?id=${encodeURIComponent(id)}`)}
      onSave={guardar}
    />
  );
}
