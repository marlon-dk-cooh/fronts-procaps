import type { SearchResult } from "./ResultSearch";

export interface SearchState {
  error: string | null;
  results: SearchResult[] | null;
  query: string;
  filters: SearchFilters
}

export interface SearchFilters {
    category: string;
    file: string;
    minRelevance: number;
    rangeDate: string;
}