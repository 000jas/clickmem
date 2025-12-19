import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MemoryItem, Preferences, ContentDocument } from "@/types/memory";
import { supabase } from "@/lib/supabaseClient";

const PREFS_KEY = "clickmem.prefs.v1";

interface MemoryContextValue {
  items: MemoryItem[];
  loading: boolean;
  add: (
    item: Omit<
      MemoryItem,
      "id" | "summary" | "keywords" | "emotion" | "embedding"
    >,
  ) => Promise<void>;
  update: (id: string, patch: Partial<MemoryItem>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  preferences: Preferences;
  setPreferences: (p: Preferences) => void;
  seed: () => void;
  refresh: () => Promise<void>;
}

const MemoryContext = createContext<MemoryContextValue | null>(null);

// Convert Supabase ContentDocument to MemoryItem
function convertToMemoryItem(doc: ContentDocument): MemoryItem {
  return {
    id: doc.id,
    title: doc.title || "Untitled",
    summary: doc.summary || undefined,
    keywords: doc.keywords || undefined,
    emotions: doc.emotions || undefined,
    emotion: doc.emotions?.[0] || "neutral",
    timestamp: doc.captured_at || doc.created_at,
    captured_at: doc.captured_at || undefined,
    url: doc.source_url || undefined,
    source_url: doc.source_url || undefined,
    type: "article",
    favorite: false,
    sentiment_score: doc.sentiment_score || undefined,
    nlp_processed: doc.nlp_processed,
    raw_content: doc.raw_content || undefined,
    media_urls: doc.media_urls || undefined,
  };
}

export function MemoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw
      ? (JSON.parse(raw) as Preferences)
      : { localOnly: false, excludedKeywords: [] };
  });

  // Fetch data from Supabase
  const fetchMemories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("content_documents")
        .select("*")
        .order("captured_at", { ascending: false });

      if (error) {
        console.error("Error fetching memories:", error);
        return;
      }

      if (data) {
        const memoryItems = data.map(convertToMemoryItem);
        setItems(memoryItems);
      }
    } catch (error) {
      console.error("Failed to fetch memories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const add: MemoryContextValue["add"] = useCallback(async (item) => {
    // Add to Supabase
    try {
      const { data, error } = await supabase
        .from("content_documents")
        .insert([
          {
            title: item.title,
            summary: item.summary,
            source_url: item.url,
            raw_content: item.content,
            captured_at: new Date().toISOString(),
            nlp_processed: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        const newItem = convertToMemoryItem(data);
        setItems((prev) => [newItem, ...prev]);
      }
    } catch (error) {
      console.error("Failed to add memory:", error);
    }
  }, []);

  const update: MemoryContextValue["update"] = useCallback(async (id, patch) => {
    try {
      const { error } = await supabase
        .from("content_documents")
        .update(patch)
        .eq("id", id);

      if (error) throw error;
      
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    } catch (error) {
      console.error("Failed to update memory:", error);
    }
  }, []);

  const remove: MemoryContextValue["remove"] = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from("content_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setItems((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Failed to remove memory:", error);
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    // Favorite is local-only for now
    setItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, favorite: !m.favorite } : m)),
    );
  }, []);

  const seed = useCallback(() => {
    // Removed dummy data - all data comes from Supabase now
    console.log("No seeding needed - using real data from database");
  }, []);

  const refresh = useCallback(async () => {
    await fetchMemories();
  }, [fetchMemories]);

  const value = useMemo<MemoryContextValue>(
    () => ({
      items,
      loading,
      add,
      update,
      remove,
      toggleFavorite,
      preferences,
      setPreferences,
      seed,
      refresh,
    }),
    [items, loading, add, update, remove, toggleFavorite, preferences, refresh],
  );

  return (
    <MemoryContext.Provider value={value}>{children}</MemoryContext.Provider>
  );
}

export function useMemory() {
  const ctx = useContext(MemoryContext);
  if (!ctx) throw new Error("useMemory must be used within MemoryProvider");
  return ctx;
}

