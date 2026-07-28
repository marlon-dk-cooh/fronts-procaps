import { useRef, useState } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PaperClipIcon,
  DocumentIcon,
  CheckIcon,
  InformationCircleIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import type { WizardForm } from '../interface/Report';
import { METHODS } from '../config/methods';

type ScalarKey = 'nombreReporte' | 'codigoInforme' | 'nombreProducto' | 'codigoProducto'
  | 'ingredientes' | 'rango' | 'protocolo' | 'hojas' | 'bitacoras';

function dz(val: string, err: boolean) {
  return {
    bg:        val ? '#F2FAF9' : '#FBFCFC',
    border:    val ? '#9ED2CB' : (err ? '#E9B5AF' : '#D6DBDF'),
    iconColor: val ? '#0F8B81' : '#A7B1B8',
    text:      val || 'Adjuntar un archivo',
    textColor: val ? '#0C6E66' : '#6B7780',
  };
}

function AttachButton({ val, err, icon, label, onClick }: {
  val: string; err: boolean; icon: React.ReactNode; label: string; onClick: () => void;
}) {
  const d = dz(val, err);
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-[11px] cursor-pointer text-left transition-colors border-[1.5px] border-dashed hover:border-[#0F8B81]"
      style={{ background: d.bg, borderColor: d.border }}
    >
      <div className="w-9 h-9 rounded-[9px] bg-white border border-[#E4E7EB] flex items-center justify-center flex-none">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-[13.5px] font-semibold" style={{ color: d.textColor }}>{d.text}</div>
        <div className="text-[11.5px] text-[#8A969E] mt-0.5">{label} · obligatorio</div>
      </div>
    </button>
  );
}

interface Props {
  title: string;
  form: WizardForm;
  setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  showErrors: boolean;
  setShowErrors: (v: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function WizardShell({
  title, form, setForm, step, setStep, showErrors, setShowErrors, onCancel, onSave,
}: Props) {
  const req = (v: string) => showErrors && !v.trim() ? '#D9483B' : '#D6DBDF';

  // Single hidden file input shared across all attach buttons.
  // pendingAttach tracks which slot triggered the picker:
  //   'protocolo' | 'hojas' | 'bitacoras' | <METHODS name>
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAttach, setPendingAttach] = useState('');

  const openFilePicker = (key: string) => {
    setPendingAttach(key);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = ''; // reset so the same file can be re-selected
    if (!f || !pendingAttach) return;

    if (pendingAttach === 'protocolo') {
      setForm(prev => ({ ...prev, protocolo: f.name, protocolo_file: f }));
    } else if (pendingAttach === 'hojas') {
      setForm(prev => ({ ...prev, hojas: f.name, hojas_file: f }));
    } else if (pendingAttach === 'bitacoras') {
      setForm(prev => ({ ...prev, bitacoras: f.name, bitacoras_file: f }));
    } else {
      setForm(prev => {
        const g = { ...prev.groups };
        g[pendingAttach] = {
          ...(g[pendingAttach] || { selected: true, doc: 'Reporte LIMS', file: '', file_obj: null }),
          file: f.name,
          file_obj: f,
        };
        return { ...prev, groups: g };
      });
    }
    setPendingAttach('');
  };

  const next = () => {
    if (step === 1) {
      const ok = form.nombreReporte && form.codigoInforme && form.nombreProducto &&
                 form.codigoProducto && form.ingredientes && form.rango && form.protocolo;
      if (!ok) { setShowErrors(true); return; }
    }
    if (step === 2) {
      const sel = METHODS.filter(n => form.groups[n]?.selected);
      if (!sel.length) { setShowErrors(true); return; }
    }
    setShowErrors(false);
    setStep(s => Math.min(3, s + 1));
    window.scrollTo(0, 0);
  };

  const back = () => {
    if (step === 1) { onCancel(); return; }
    setShowErrors(false);
    setStep(s => s - 1);
  };

  const set = (key: ScalarKey, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleGroup = (name: string) =>
    setForm(prev => {
      const g = { ...prev.groups };
      const cur = g[name] || { selected: false, doc: 'Reporte LIMS', file: '', file_obj: null };
      g[name] = { ...cur, selected: !cur.selected };
      return { ...prev, groups: g };
    });

  const setGroupDoc = (name: string, doc: string) =>
    setForm(prev => {
      const g = { ...prev.groups };
      g[name] = { ...(g[name] || { selected: true, doc: 'Reporte LIMS', file: '', file_obj: null }), doc };
      return { ...prev, groups: g };
    });

  const groups = form.groups || {};
  const selectedGroupNames = METHODS.filter(n => groups[n]?.selected);

  const steps = [
    { num: 1, label: 'Datos' },
    { num: 2, label: 'Métodos y adjuntos' },
    { num: 3, label: 'Soportes' },
  ];

  const proto   = dz(form.protocolo, showErrors && !form.protocolo);
  const hojasDz = dz(form.hojas,     showErrors && !form.hojas);
  const bitaDz  = dz(form.bitacoras, showErrors && !form.bitacoras);

  return (
    <main className="max-w-[880px] mx-auto px-7 pt-7 pb-16">
      {/* Shared hidden file picker — triggered programmatically by openFilePicker() */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-[7px] py-1.5 bg-transparent border-none font-medium text-[13px] text-[#8A969E] cursor-pointer hover:text-[#44525A] transition-colors"
      >
        <ArrowLeftIcon className="w-[15px] h-[15px]" />
        Volver a informes
      </button>
      <h1 className="mt-2.5 mb-0 text-[24px] font-bold tracking-[-0.01em]">{title}</h1>

      {/* Stepper */}
      <div className="flex items-center mt-[22px] mb-6">
        {steps.map((s, i) => {
          const done = s.num < step, active = s.num === step, isLast = i === steps.length - 1;
          return (
            <div key={s.num} className="flex items-center gap-[11px]" style={{ flex: isLast ? undefined : 1 }}>
              <div
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-semibold text-[13px] flex-none border-[1.5px]"
                style={{
                  background: done ? '#0F8B81' : (active ? '#E6F4F2' : '#fff'),
                  color: done ? '#fff' : (active ? '#0C6E66' : '#A7B1B8'),
                  borderColor: (done || active) ? '#0F8B81' : '#D6DBDF',
                }}
              >
                {done
                  ? <CheckIcon className="w-[14px] h-[14px]" strokeWidth={2.5} />
                  : s.num}
              </div>
              <div className="text-[13px] font-semibold whitespace-nowrap" style={{ color: active ? '#26343B' : (done ? '#44525A' : '#A7B1B8') }}>
                {s.label}
              </div>
              {!isLast && <div className="h-[1.5px] flex-1 mx-1" style={{ background: done ? '#0F8B81' : '#E4E7EB' }} />}
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-[#E4E7EB] rounded-[16px] px-7 py-[26px]">

        {/* PASO 1 */}
        {step === 1 && (
          <div>
            <div className="text-[16px] font-bold">Datos del informe</div>
            <div className="text-[13px] text-[#8A969E] mt-[3px]">
              Los campos marcados con <span className="text-[#D9483B] font-bold">*</span> son obligatorios.
            </div>
            <div className="grid grid-cols-2 gap-x-[18px] gap-y-4 mt-[22px]">
              {([
                { key: 'nombreReporte',  label: 'Nombre del reporte',  placeholder: 'Ej. PRUEBA-VALIDA-DK', mono: false },
                { key: 'codigoInforme',  label: 'Código del informe',  placeholder: 'Ej. REP-I&D-0000',      mono: true  },
                { key: 'nombreProducto', label: 'Nombre del producto', placeholder: 'Ej. Hidrocona 10 mg',   mono: false },
                { key: 'codigoProducto', label: 'Código del producto', placeholder: 'Ej. PT-00000',           mono: true  },
              ] as { key: ScalarKey; label: string; placeholder: string; mono: boolean }[]).map(f => (
                <div key={f.key}>
                  <label className="block text-[12.5px] font-semibold text-[#44525A] mb-1.5">
                    {f.label} <span className="text-[#D9483B]">*</span>
                  </label>
                  <input
                    value={form[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-[10px] text-[14px] text-[#1A2B32] border rounded-[9px] bg-white focus:border-[#0F8B81]"
                    style={{ borderColor: req(form[f.key]), fontFamily: f.mono ? "'IBM Plex Mono'" : undefined }}
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-[12.5px] font-semibold text-[#44525A] mb-1.5">
                  Ingredientes activos <span className="text-[#D9483B]">*</span>
                </label>
                <textarea
                  value={form.ingredientes}
                  onChange={e => set('ingredientes', e.target.value)}
                  placeholder="Ej. Hidrocodona, Acetaminofén"
                  rows={2}
                  className="w-full px-3 py-[10px] text-[14px] text-[#1A2B32] border rounded-[9px] bg-white resize-y focus:border-[#0F8B81]"
                  style={{ borderColor: req(form.ingredientes) }}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[12.5px] font-semibold text-[#44525A] mb-1.5">
                  Rango de validación <span className="text-[#D9483B]">*</span>
                </label>
                <input
                  value={form.rango}
                  onChange={e => set('rango', e.target.value)}
                  placeholder="Ej. 80% – 120%"
                  className="w-full px-3 py-[10px] text-[14px] text-[#1A2B32] border rounded-[9px] bg-white focus:border-[#0F8B81]"
                  style={{ borderColor: req(form.rango) }}
                />
              </div>
            </div>
            <div className="mt-[18px]">
              <label className="block text-[12.5px] font-semibold text-[#44525A] mb-1.5">
                Protocolo de validación <span className="text-[#D9483B]">*</span>
              </label>
              <AttachButton
                val={form.protocolo} err={showErrors && !form.protocolo}
                icon={<PaperClipIcon className="w-[17px] h-[17px]" style={{ color: proto.iconColor }} />}
                label="PDF"
                onClick={() => openFilePicker('protocolo')}
              />
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {step === 2 && (
          <div>
            <div className="text-[16px] font-bold">Métodos analíticos y adjuntos</div>
            <div className="text-[13px] text-[#8A969E] mt-[3px]">Selecciona los grupos de documentos a validar.</div>
            <div className="grid grid-cols-2 gap-2.5 mt-5">
              {METHODS.map(name => {
                const on = !!groups[name]?.selected;
                return (
                  <button
                    key={name}
                    onClick={() => toggleGroup(name)}
                    className="flex items-center gap-2.5 px-[13px] py-[11px] rounded-[10px] cursor-pointer text-left transition-colors border-[1.5px]"
                    style={{ background: on ? '#F2FAF9' : '#fff', borderColor: on ? '#9ED2CB' : '#E4E7EB' }}
                  >
                    <span
                      className="w-[19px] h-[19px] rounded-[6px] flex items-center justify-center flex-none border-[1.5px]"
                      style={{ background: on ? '#0F8B81' : '#fff', borderColor: on ? '#0F8B81' : '#C9D0D5' }}
                    >
                      {on && <CheckIcon className="w-[11px] h-[11px] text-white" strokeWidth={3} />}
                    </span>
                    <span className="text-[13px] font-semibold" style={{ color: on ? '#0C6E66' : '#44525A' }}>{name}</span>
                  </button>
                );
              })}
            </div>
            {selectedGroupNames.length > 0 ? (
              <div className="mt-6 pt-5 border-t border-[#EEF0F2]">
                <div className="text-[13px] font-bold tracking-[.04em] uppercase text-[#8A969E]">Adjuntos requeridos</div>
                <div className="flex flex-col gap-3 mt-3.5">
                  {selectedGroupNames.map(name => {
                    const g = groups[name] || { selected: true, doc: 'Reporte LIMS', file: '' };
                    const z = dz(g.file || '', false);
                    return (
                      <div key={name} className="grid gap-3 items-end p-[14px] border border-[#EEF0F2] rounded-[11px] bg-[#FBFCFC]" style={{ gridTemplateColumns: '1fr 200px' }}>
                        <div className="col-span-2 flex items-center gap-2 text-[13.5px] font-semibold text-[#26343B]">
                          <span className="w-[7px] h-[7px] rounded-full bg-[#0F8B81]" />{name}
                        </div>
                        <div>
                          <label className="block text-[11.5px] font-semibold text-[#8A969E] mb-[5px]">Archivo de soporte</label>
                          <button
                            onClick={() => openFilePicker(name)}
                            className="w-full flex items-center gap-[9px] px-[11px] py-[9px] rounded-[9px] cursor-pointer text-left transition-colors border-[1.5px] border-dashed hover:border-[#0F8B81]"
                            style={{ background: z.bg, borderColor: z.border }}
                          >
                            <PaperClipIcon className="w-[14px] h-[14px] flex-none" style={{ color: z.iconColor }} />
                            <span className="text-[12.5px] font-medium overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: z.textColor }}>
                              {g.file || 'Adjuntar archivo'}
                            </span>
                          </button>
                        </div>
                        <div>
                          <label className="block text-[11.5px] font-semibold text-[#8A969E] mb-[5px]">Documento <span className="text-[#D9483B]">*</span></label>
                          <select
                            value={g.doc || 'Reporte LIMS'}
                            onChange={e => setGroupDoc(name, e.target.value)}
                            className="w-full px-[11px] py-[9px] font-medium text-[13px] text-[#26343B] border border-[#D6DBDF] rounded-[9px] bg-white cursor-pointer"
                          >
                            <option>Reporte LIMS</option>
                            <option>Soportes Cromatográficos</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-[18px] p-[18px] text-center bg-[#FBFCFC] border border-dashed border-[#D6DBDF] rounded-[11px] text-[12.5px] text-[#8A969E]">
                Selecciona al menos un grupo de documentos para continuar.
              </div>
            )}
          </div>
        )}

        {/* PASO 3 */}
        {step === 3 && (
          <div>
            <div className="text-[16px] font-bold">Soportes de preparación</div>
            <div className="text-[13px] text-[#8A969E] mt-[3px]">Adjunta los documentos de preparación que respaldan el proceso.</div>
            <div className="flex flex-col gap-3.5 mt-[22px]">
              <div>
                <label className="block text-[12.5px] font-semibold text-[#44525A] mb-1.5">
                  Hojas de trabajo de preparación <span className="text-[#D9483B]">*</span>
                </label>
                <AttachButton
                  val={form.hojas} err={showErrors && !form.hojas}
                  icon={<DocumentIcon className="w-[17px] h-[17px]" style={{ color: hojasDz.iconColor }} />}
                  label="PDF"
                  onClick={() => openFilePicker('hojas')}
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#44525A] mb-1.5">
                  Bitácoras de preparación <span className="text-[#D9483B]">*</span>
                </label>
                <AttachButton
                  val={form.bitacoras} err={showErrors && !form.bitacoras}
                  icon={<DocumentIcon className="w-[17px] h-[17px]" style={{ color: bitaDz.iconColor }} />}
                  label="PDF"
                  onClick={() => openFilePicker('bitacoras')}
                />
              </div>
            </div>
            <div className="mt-5 flex items-start gap-2.5 px-[15px] py-[13px] bg-[#F8FBFB] border border-[#DDEAE8] rounded-[11px]">
              <InformationCircleIcon className="w-4 h-4 text-[#0F8B81] flex-none mt-px" />
              <div className="text-[12.5px] text-[#3F8F86] leading-relaxed">
                Al guardar, el informe quedará <strong>En cola</strong>. Podrás iniciar la validación desde la vista general.
              </div>
            </div>
          </div>
        )}

        {/* Navegación */}
        <div className="flex items-center justify-between mt-[26px] pt-5 border-t border-[#EEF0F2]">
          <button
            onClick={back}
            className="inline-flex items-center gap-[7px] px-4 py-[10px] bg-white border border-[#D6DBDF] rounded-[9px] font-semibold text-[13.5px] text-[#44525A] cursor-pointer hover:bg-[#F2F4F6] transition-colors"
          >
            {step === 1 ? 'Cancelar' : 'Atrás'}
          </button>
          {step < 3 ? (
            <button
              onClick={next}
              className="inline-flex items-center gap-2 px-5 py-[10px] bg-[#0F8B81] text-white border-none rounded-[9px] font-semibold text-[13.5px] cursor-pointer hover:bg-[#0C6E66] transition-colors"
            >
              Siguiente
              <ArrowRightIcon className="w-[15px] h-[15px]" strokeWidth={2.2} />
            </button>
          ) : (
            <button
              onClick={onSave}
              className="inline-flex items-center gap-2 px-5 py-[10px] bg-[#0F8B81] text-white border-none rounded-[9px] font-semibold text-[13.5px] cursor-pointer hover:bg-[#0C6E66] transition-colors"
            >
              <BookmarkIcon className="w-[15px] h-[15px]" strokeWidth={2.2} />
              Guardar informe
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
