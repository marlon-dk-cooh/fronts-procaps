import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Report, WizardForm } from '../interface/Report';
import { EMPTY_FORM } from '../App';
import WizardShell from '../components/WizardShell';

interface Props {
  addReport: (rep: Report) => void;
}

export default function CreateReport({ addReport }: Props) {
  const navigate = useNavigate();
  const [form, setForm]           = useState<WizardForm>(EMPTY_FORM);
  const [step, setStep]           = useState(1);
  const [showErrors, setShowErrors] = useState(false);

  const registrar = () => {
    if (!form.hojas || !form.bitacoras) { setShowErrors(true); return; }
    const id = form.codigoInforme.trim() || `TEST-${Math.floor(Math.random() * 900) + 100}`;
    addReport({
      id,
      name: form.nombreReporte || id,
      product: form.nombreProducto || '—',
      date: '21 Jun 2026',
      status: 'en_cola',
      hasWord: false,
    });
    navigate(`/?id=${encodeURIComponent(id)}`);
  };

  return (
    <WizardShell
      title="Nuevo informe de validación"
      form={form}
      setForm={setForm}
      step={step}
      setStep={setStep}
      showErrors={showErrors}
      setShowErrors={setShowErrors}
      onCancel={() => navigate('/')}
      onSave={registrar}
    />
  );
}
