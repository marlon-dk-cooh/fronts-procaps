import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from 'react'
import type { Document } from './interface/Document'
import type { Message } from './interface/Message'
import type { ThemeTokens } from './interface/Theme'
import { MOCK_DOCUMENTS, MOCK_RESPONSES } from './mock/data'
import Header from './components/Header'
import UploadZone from './components/UploadZone'
import EmptyChat from './components/EmptyChat'
import MessageList from './components/MessageList'
import SourcePanel from './components/SourcePanel'
import InputBar from './components/InputBar'

export default function DocumentQA() {
  const [dark, setDark] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeSource, setActiveSource] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const mockIdx = useRef(0)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const t: ThemeTokens = dark
    ? {
        bg: '#0D0F11',
        surface: '#161A1F',
        surface2: '#1E2329',
        border: '#2A2F36',
        text: '#E4E7EB',
        textMuted: '#8B929A',
        accent: '#3B82F6',
        accentSoft: 'rgba(59,130,246,0.12)',
        accentGlow: 'rgba(59,130,246,0.25)',
        success: '#34D399',
        warn: '#FBBF24',
        cardBg: '#1A1F25',
        hover: '#222830',
        sourceHighlight: 'rgba(59,130,246,0.08)',
      }
    : {
        bg: '#F6F7F9',
        surface: '#FFFFFF',
        surface2: '#F0F1F4',
        border: '#E2E4E8',
        text: '#1A1D23',
        textMuted: '#6B7280',
        accent: '#2563EB',
        accentSoft: 'rgba(37,99,235,0.08)',
        accentGlow: 'rgba(37,99,235,0.15)',
        success: '#059669',
        warn: '#D97706',
        cardBg: '#FFFFFF',
        hover: '#F3F4F6',
        sourceHighlight: 'rgba(37,99,235,0.06)',
      }

  const handleSend = async (): Promise<void> => {
    if (!input.trim() || loading) return

    setMessages((m) => [...m, { role: 'user', text: input.trim() }])
    setInput('')
    setLoading(true)
    setActiveSource(null)

    // ── Replace this block with your real RAG API call ──
    // const res = await fetch('/api/qa', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ query: input, documents }),
    // })
    // const data: { answer: string; sources: Source[] } = await res.json()
    // setMessages((m) => [...m, { role: 'assistant', text: data.answer, sources: data.sources }])
    // ── End replace ──

    await new Promise<void>((r) => setTimeout(r, 1500))
    const mock = MOCK_RESPONSES[mockIdx.current % MOCK_RESPONSES.length]
    mockIdx.current++
    setMessages((m) => [...m, { role: 'assistant', text: mock.answer, sources: mock.sources }])

    setLoading(false)
  }

  const handleUpload = (files: FileList | null): void => {
    if (!files) return
    const newDocs: Document[] = Array.from(files).map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      pages: Math.floor(Math.random() * 100) + 5,
      size: (f.size / 1024 / 1024).toFixed(1) + ' MB',
      type: f.name.split('.').pop() ?? 'unknown',
    }))
    setDocuments((d) => [...d, ...newDocs])
  }

  const hasDocuments = documents.length > 0

  const activeSourceData = (() => {
    if (!activeSource) return null
    const [mi, si] = activeSource.split('-').map(Number)
    return messages[mi]?.sources?.[si] ?? null
  })()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.bg,
        color: t.text,
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
        transition: 'background 0.4s, color 0.4s',
      }}
    >
      <Header
        dark={dark}
        onToggleTheme={() => setDark((d) => !d)}
        docCount={documents.length}
        onReset={() => { setDocuments([]); setMessages([]); setActiveSource(null) }}
        t={t}
      />

      <div style={{ display: 'flex', height: 'calc(100vh - 69px)', overflow: 'hidden' }}>
        {/* ── Chat area ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {!hasDocuments ? (
              <UploadZone
                onUpload={handleUpload}
                onLoadDemo={() => setDocuments(MOCK_DOCUMENTS)}
                dragOver={dragOver}
                onDragOver={() => setDragOver(true)}
                onDragLeave={() => setDragOver(false)}
                t={t}
              />
            ) : messages.length === 0 ? (
              <EmptyChat onSuggestedQuestion={setInput} t={t} />
            ) : (
              <MessageList
                messages={messages}
                loading={loading}
                activeSource={activeSource}
                onSourceClick={setActiveSource}
                chatEndRef={chatEndRef}
                t={t}
              />
            )}
          </div>

          {hasDocuments && (
            <InputBar
              value={input}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void handleSend()
                }
              }}
              onSend={() => void handleSend()}
              loading={loading}
              t={t}
            />
          )}
        </div>

        {/* ── Source panel ── */}
        {activeSourceData && (
          <SourcePanel
            source={activeSourceData}
            onClose={() => setActiveSource(null)}
            t={t}
          />
        )}
      </div>

      <style>{`
        textarea::placeholder { color: ${t.textMuted}; }
        *::-webkit-scrollbar { width: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
      `}</style>
    </div>
  )
}
