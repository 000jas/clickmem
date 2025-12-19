export type MemoryType = "article" | "video" | "image" | "note";

export type Emotion =
  | "funny"
  | "inspiring"
  | "sad"
  | "angry"
  | "calm"
  | "awe"
  | "neutral"
  | "POSITIVE"
  | "NEGATIVE"
  | "NEUTRAL";

export interface MemoryItem {
  id: string;
  title: string;
  summary?: string;
  keywords?: string[];
  emotions?: string[];
  emotion?: string;
  timestamp: string;
  captured_at?: string;
  url?: string;
  source_url?: string;
  type: string;
  favorite: boolean;
  imageDataUrl?: string | null;
  sentiment_score?: number;
  nlp_processed?: boolean;
  raw_content?: string;
  media_urls?: string[];
}

export interface Preferences {
  localOnly: boolean;
  excludedKeywords: string[];
}

// Supabase database type
export interface ContentDocument {
  id: string;
  title: string | null;
  summary: string | null;
  raw_content: string | null;
  keywords: string[] | null;
  emotions: string[] | null;
  media_urls: string[] | null;
  sentiment_score: number | null;
  source_url: string | null;
  captured_at: string | null;
  embedding: number[] | null;
  nlp_processed: boolean;
  created_at: string;
  updated_at: string;
}
