export interface SearchResult {
  id: number;
  title: string;
  snippet: string;
  source: string;
  category: string;
  date: string;
  relevance: number;
  highlights: string[];
  chunks: number;
}
