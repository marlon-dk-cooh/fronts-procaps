import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { WizardForm } from '../interface/Report';
import { EMPTY_FORM, type ValidaOutletContext } from '../ValidaLayout';
import WizardShell from '../components/WizardShell';
import { buildValidaState } from '../utils/buildValidaState';
import { uploadValidaState } from '../services/validaApi';

export default function CreateReport() {
  const { addReport } = useOutletContext<ValidaOutletContext>();
  const navigate = useNavigate();
  const [form, setForm]           = useState<WizardForm>(EMPTY_FORM);
  const [step, setStep]           = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [uploading, setUploading]   = useState(false);

  const registrar = async () => {
    if (!form.hojas || !form.bitacoras) { setShowErrors(true); return; }
    if (uploading) return;
    const id = form.codigoInforme.trim() || `TEST-${Math.floor(Math.random() * 900) + 100}`;

    // Reads each attached File as base64 and builds the ValidaState JSON, then
    // uploads PDFs + valida_state.json to bronze/{folder}/ via the intake backend.
    setUploading(true);
    // Sanitized folder + valida_state.json path returned by the intake backend;
    // carried onto the Report so "Aceptar e iniciar" can trigger the job.
    let pathPrefix = '';
    let validaInputPath = '';
    try {
      const validaState = await buildValidaState(form);
      const result = await uploadValidaState(validaState);
      console.log('[VALIDA] staged to bronze →', result);
      pathPrefix = result.folder;
      validaInputPath = result.valida_state_path;
    } catch (err) {
      console.error('[VALIDA] upload failed:', err);
      window.alert(
        `No se pudo subir el informe a ADLS bronze.\n\n${(err as Error).message}`,
      );
      setUploading(false);
      return;
    }
    setUploading(false);

    addReport({
      id,
      name: form.nombreReporte || id,
      product: form.nombreProducto || '—',
      date: '21 Jun 2026',
      status: 'en_cola',
      hasWord: false,
      // Carried so "Aceptar e iniciar" can trigger the Databricks job for this folder.
      pathPrefix,
      validaInputPath,
    });
    navigate(`/valida?id=${encodeURIComponent(id)}`);
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
      onCancel={() => navigate('/valida')}
      onSave={registrar}
    />
  );
}
