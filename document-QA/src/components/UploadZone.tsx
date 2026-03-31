import type { ChangeEvent } from 'react'
import type { ThemeTokens } from '../interface/Theme'
import { FileText } from 'lucide-react'

interface UploadZoneProps {
  onUpload: (files: FileList | null) => void
  onLoadDemo: () => void
  dragOver: boolean
  onDragOver: () => void
  onDragLeave: () => void
  t: ThemeTokens
}

export default function UploadZone({
  onUpload,
  onLoadDemo,
  dragOver,
  onDragOver,
  onDragLeave,
  t,
}: UploadZoneProps) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver()
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault()
        onDragLeave()
        onUpload(e.dataTransfer.files)
      }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        border: `2px dashed ${dragOver ? t.accent : t.border}`,
        borderRadius: 16,
        margin: '20px auto',
        maxWidth: 520,
        width: '100%',
        padding: 48,
        transition: 'all 0.3s',
        background: dragOver ? t.accentSoft : 'transparent',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: t.accentSoft,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
        }}
      >
        <FileText size={36} color={t.accent} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>Sube tus documentos</div>
        <div style={{ color: t.textMuted, fontSize: 14, lineHeight: 1.6 }}>
          Arrastra PDFs, Word, o archivos de texto aquí
          <br />o haz clic para seleccionar
        </div>
      </div>

      <input
        type="file"
        multiple
        accept=".pdf,.docx,.doc,.txt,.md"
        onChange={(e: ChangeEvent<HTMLInputElement>) => onUpload(e.target.files)}
        style={{ display: 'none' }}
        id="file-upload"
      />

      <div style={{ display: 'flex', gap: 10 }}>
        <label
          htmlFor="file-upload"
          style={{
            padding: '10px 22px',
            borderRadius: 10,
            background: t.accent,
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Seleccionar archivos
        </label>
        <button
          onClick={onLoadDemo}
          style={{
            padding: '10px 22px',
            borderRadius: 10,
            background: t.surface2,
            color: t.text,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            border: `1px solid ${t.border}`,
          }}
        >
          Cargar demo
        </button>
      </div>
    </div>
  )
}
