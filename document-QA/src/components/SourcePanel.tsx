import type { Source } from '../interface/Source'
import type { ThemeTokens } from '../interface/Theme'
import FileIcon from './FileIcon'
import { relevanceColor } from '../utils/relevance'

interface SourcePanelProps {
  source: Source
  onClose: () => void
  t: ThemeTokens
}

export default function SourcePanel({ source: src, onClose, t }: SourcePanelProps) {
  const rColor = relevanceColor(src.relevance, t.success, t.accent, t.warn)

  return (
    <div
      style={{
        width: 380,
        borderLeft: `1px solid ${t.border}`,
        background: t.surface,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${t.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 14 }}>Fuente</div>
        <button
          onClick={onClose}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            background: t.surface2,
            color: t.textMuted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
            padding: '14px 16px',
            borderRadius: 12,
            background: t.surface2,
            border: `1px solid ${t.border}`,
          }}
        >
          <div style={{ color: t.accent }}>
            <FileIcon type={src.doc.split('.').pop() ?? ''} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{src.doc}</div>
            <div style={{ fontSize: 12, color: t.textMuted }}>
              Página {src.page} · {src.section}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: t.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 8,
            }}
          >
            Relevancia
          </div>
          <div
            style={{ height: 6, borderRadius: 3, background: t.surface2, overflow: 'hidden' }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 3,
                width: `${src.relevance * 100}%`,
                background: rColor,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: rColor,
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: 6,
            }}
          >
            {(src.relevance * 100).toFixed(1)}% match
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: t.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 10,
            }}
          >
            Fragmento extraído
          </div>
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 12,
              background: t.sourceHighlight,
              borderLeft: `3px solid ${t.accent}`,
              fontSize: 13,
              lineHeight: 1.8,
              color: t.text,
            }}
          >
            {src.text}
          </div>
        </div>
      </div>
    </div>
  )
}
