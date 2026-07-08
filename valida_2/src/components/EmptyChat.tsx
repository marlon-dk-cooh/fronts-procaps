import type { ThemeTokens } from '../interface/Theme'

interface EmptyChatProps {
  onSuggestedQuestion: (q: string) => void
  t: ThemeTokens
}

const SUGGESTED_QUESTIONS = [
  '¿Cuál es el resumen ejecutivo?',
  '¿Qué métricas clave se mencionan?',
  '¿Hay riesgos identificados?',
]

export default function EmptyChat({ onSuggestedQuestion, t }: EmptyChatProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        opacity: 0.85,
      }}
    >
      <div style={{ fontSize: 48 }}>💬</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Documentos listos</div>
        <div style={{ color: t.textMuted, fontSize: 14, lineHeight: 1.6, maxWidth: 380 }}>
          Haz cualquier pregunta sobre tus documentos. Las respuestas incluirán citas exactas con
          página y sección.
        </div>
      </div>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 500 }}
      >
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSuggestedQuestion(q)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 13,
              background: t.accentSoft,
              color: t.accent,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
