import { Moon, Sun, RefreshCw } from 'lucide-react'
import type { ThemeTokens } from '../interface/Theme'

interface HeaderProps {
  dark: boolean
  onToggleTheme: () => void
  docCount: number
  onReset: () => void
  t: ThemeTokens
}

export default function Header({ dark, onToggleTheme, docCount, onReset, t }: HeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 28px',
        borderBottom: `1px solid ${t.border}`,
        background: t.surface,
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${t.accent}, #8B5CF6)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          Q
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em' }}>
            Document Q&A
          </div>
          <div style={{ fontSize: 12, color: t.textMuted }}>RAG-powered document intelligence</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {docCount > 0 && (
          <>
            <div
              style={{
                fontSize: 12,
                color: t.textMuted,
                background: t.surface2,
                padding: '5px 12px',
                borderRadius: 20,
                border: `1px solid ${t.border}`,
              }}
            >
              {docCount} doc{docCount > 1 ? 's' : ''} cargado{docCount > 1 ? 's' : ''}
            </div>
            <button
              onClick={onReset}
              title="Cambiar documentos"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.surface2,
                color: t.textMuted,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={14} />
              Cambiar docs
            </button>
          </>
        )}
        <button
          onClick={onToggleTheme}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: `1px solid ${t.border}`,
            background: t.surface2,
            color: t.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            transition: 'all 0.2s',
          }}
        >
          {dark ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>
    </header>
  )
}
