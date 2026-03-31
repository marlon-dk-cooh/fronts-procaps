import type { ChangeEvent, KeyboardEvent } from 'react'
import type { ThemeTokens } from '../interface/Theme'

interface InputBarProps {
  value: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  onSend: () => void
  loading: boolean
  t: ThemeTokens
}

export default function InputBar({ value, onChange, onKeyDown, onSend, loading, t }: InputBarProps) {
  const canSend = value.trim() !== '' && !loading

  return (
    <div
      style={{ padding: '16px 28px', borderTop: `1px solid ${t.border}`, background: t.surface }}
    >
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'flex-end',
          background: t.surface2,
          borderRadius: 14,
          padding: '6px 6px 6px 18px',
          border: `1px solid ${t.border}`,
        }}
      >
        <textarea
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Pregunta algo sobre tus documentos..."
          rows={1}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            background: 'transparent',
            color: t.text,
            fontSize: 14,
            fontFamily: 'inherit',
            lineHeight: 1.6,
            padding: '8px 0',
            maxHeight: 120,
          }}
        />
        <button
          onClick={onSend}
          disabled={!canSend}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: canSend ? t.accent : t.border,
            color: '#fff',
            border: 'none',
            cursor: canSend ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
