import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { WizardForm } from '../interface/Report';
import { EMPTY_FORM, type ValidaOutletContext } from '../ValidaLayout';
import WizardShell from '../components/WizardShell';
import { buildValidaState } from '../utils/buildValidaState';
import { uploadValidaState } from '../services/validaApi';

export default function CreateReport() {
  const { createReport } = useOutletContext<ValidaOutletContext>();
  const navigate = useNavigate();
  const [form, setForm]           = useState<WizardForm>(EMPTY_FORM);
  const [step, setStep]           = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [uploading, setUploading]   = useState(false);

  const registrar = async () => {
    if (!form.hojas || !form.bitacoras) { setShowErrors(true); return; }
    if (uploading) return;

    // Reads each attached File as base64 and builds the ValidaState JSON, then
    // uploads PDFs + valida_state.json to bronze/{folder}/ via the intake backend.
    setUploading(true);
    try {
      const validaState = await buildValidaState(form);
      const result = await uploadValidaState(validaState);
      console.log('[VALIDA] staged to bronze →', result);

      // El informe se registra en Cosmos apenas queda staged en bronze, antes de
      // disparar el job: a partir de aquí el listado sale del store, no del cliente.
      const created = await createReport(result.folder, result.valida_state_path, {
        nombreReporte: form.nombreReporte || form.codigoInforme || 'Informe sin nombre',
        codigoInforme: form.codigoInforme,
        nombreProducto: form.nombreProducto,
        codigoProducto: form.codigoProducto,
        rangoValidacion: form.rango,
      });
      navigate(`/valida?id=${encodeURIComponent(created.id)}`);
    } catch (err) {
      console.error('[VALIDA] create report failed:', err);
      window.alert(`No se pudo registrar el informe.\n\n${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
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
