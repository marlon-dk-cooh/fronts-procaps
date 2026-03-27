"use client"

import { useState, useEffect, useRef } from "react"
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from "@/components/ui/chat-input"
import { ChatMessage } from "@/components/chat-message"
import { SuggestionPills } from "@/components/suggestion-pills"
import { Sparkles, Sun, Moon } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: string
}

const initialSuggestions = [
  "I want to be a Software Engineer building next-gen apps",
  "Help me plan for medical school",
  "I'm interested in finance and investing",
  "Show me career paths in AI and machine learning",
]

const followUpSuggestions = [
  "What skills should I focus on?",
  "Tell me about college requirements",
  "How can I gain relevant experience?",
  "What are the salary expectations?",
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasStartedChat, setHasStartedChat] = useState(false)
  const [showCompactMode, setShowCompactMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [messages])

  const handleSubmit = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    if (!hasStartedChat) {
      setHasStartedChat(true)
      setTimeout(() => {
        setShowCompactMode(true)
      }, 500)
    }

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputValue),
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const getAIResponse = (userInput: string): string => {
    if (userInput.toLowerCase().includes("software engineer")) {
      return "Love that goal! 🚀 Software Engineers are truly shaping the future. What kind of apps would you love to build someday? Anything specific that excites you right now?"
    }
    if (userInput.toLowerCase().includes("medical")) {
      return "That's an amazing aspiration! 🏥 Medicine is such a rewarding field. Are you thinking about a specific specialty, or are you still exploring different areas of medicine?"
    }
    if (userInput.toLowerCase().includes("finance")) {
      return "Excellent choice! 💰 Finance offers so many exciting opportunities. Are you interested in areas like personal finance, investing, or maybe helping people build better financial habits?"
    }
    return "That's a fantastic goal! I'm here to help you create a personalized plan to achieve it. Tell me more about what specifically interests you about this path?"
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const currentSuggestions = messages.length > 0 ? followUpSuggestions : initialSuggestions

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Image src="/favicon.ico" alt="Ultra logo" width={24} height={24} className="w-6 h-6" />
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ultra%20White%20Logo-AQ6p5ofuVJqbE1HkyGEU1YtyUhZYDK.png"
              alt="Ultra"
              width={60}
              height={20}
              className="h-5"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme((theme ?? "dark") === "dark" ? "light" : "dark")}
            className="rounded-full"
            aria-label={(theme ?? "dark") === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          >
            {(theme ?? "dark") === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {!hasStartedChat ? (
          /* Initial Full Screen Chat */
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Plan Your Future</h1>
                <p className="text-xl text-muted-foreground">
                  Let's create a personalized roadmap for your academic and career goals
                </p>
              </div>

              <div className="space-y-6">
                <SuggestionPills suggestions={currentSuggestions} onSuggestionClick={handleSuggestionClick} />

                <ChatInput
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onSubmit={handleSubmit}
                  loading={isLoading}
                  className="max-w-2xl mx-auto"
                >
                  <ChatInputTextArea placeholder="Tell me about your goals and aspirations..." className="text-base" />
                  <ChatInputSubmit />
                </ChatInput>
              </div>
            </div>
          </div>
        ) : (
          /* Compact Mode Layout */
          <div className="flex">
            {/* Main Content Area */}
            <div className="flex-1 max-w-4xl mx-auto">
              {/* Chat Messages */}
              <div className="px-6 py-8 pb-40">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message.text}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-3 mb-6">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Chat Input (Compact Mode) */}
        {showCompactMode && (
          <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-6 fade-in`}>
            <div className="space-y-6 mt-8">
              <SuggestionPills suggestions={currentSuggestions} onSuggestionClick={handleSuggestionClick} />

              <ChatInput
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onSubmit={handleSubmit}
                loading={isLoading}
                className="bg-card shadow-lg border-border"
              >
                <ChatInputTextArea placeholder="Message Ultra..." className="bg-transparent" />
                <ChatInputSubmit />
              </ChatInput>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
