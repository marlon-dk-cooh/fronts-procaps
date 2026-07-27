import type { Source } from './Source'

export interface Message {
  role: 'user' | 'assistant'
  text: string
  sources?: Source[]
}
