import type { RefObject } from 'react'
import type { Message } from '../interface/Message'
import type { ThemeTokens } from '../interface/Theme'
import FileIcon from './FileIcon'
import { relevanceColor } from '../utils/relevance'

interface MessageListProps {
  messages: Message[]
  loading: boolean
  activeSource: string | null
  onSourceClick: (key: string | null) => void
  chatEndRef: RefObject<HTMLDivElement | null>
  t: ThemeTokens
}

export default function MessageList({
  messages,
  loading,
  activeSource,
  onSourceClick,
  chatEndRef,
  t,
}: MessageListProps) {
  return (
    <>
      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 14,
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              flexShrink: 0,
              background:
                msg.role === 'user'
                  ? 'linear-gradient(135deg, #8B5CF6, #6366F1)'
                  : `linear-gradient(135deg, ${t.accent}, #06B6D4)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {msg.role === 'user' ? 'U' : 'A'}
          </div>

          <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 14,
                background: msg.role === 'user' ? t.accent : t.cardBg,
                color: msg.role === 'user' ? '#fff' : t.text,
                fontSize: 14,
                lineHeight: 1.7,
                border: msg.role === 'assistant' ? `1px solid ${t.border}` : 'none',
                boxShadow:
                  msg.role === 'assistant' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {msg.text}
            </div>

            {msg.sources && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: t.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    paddingLeft: 4,
                  }}
                >
                  {msg.sources.length} fuente{msg.sources.length > 1 ? 's' : ''}
                </div>

                {msg.sources.map((src, j) => {
                  const key = `${i}-${j}`
                  const isActive = activeSource === key
                  const rColor = relevanceColor(src.relevance, t.success, t.accent, t.warn)
                  return (
                    <button
                      key={j}
                      onClick={() => onSourceClick(isActive ? null : key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: isActive ? t.accentSoft : t.surface2,
                        border: `1px solid ${isActive ? t.accent : t.border}`,
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ color: t.accent, flexShrink: 0 }}>
                        <FileIcon type={src.doc.split('.').pop() ?? ''} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: t.text,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {src.doc}
                        </div>
                        <div style={{ fontSize: 11, color: t.textMuted }}>
                          p.{src.page} · {src.section}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: rColor,
                          background: `${rColor}18`,
                          padding: '3px 8px',
                          borderRadius: 6,
                        }}
                      >
                        {(src.relevance * 100).toFixed(0)}%
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ))}

      {loading && (
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              flexShrink: 0,
              background: `linear-gradient(135deg, ${t.accent}, #06B6D4)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            A
          </div>
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 14,
              background: t.cardBg,
              border: `1px solid ${t.border}`,
              display: 'flex',
              gap: 6,
              alignItems: 'center',
            }}
          >
            {[0, 1, 2].map((d) => (
              <div
                key={d}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: t.accent,
                  opacity: 0.5,
                  animation: `pulse 1.2s ease-in-out ${d * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </>
  )
}
