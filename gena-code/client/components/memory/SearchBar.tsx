'use client';

import { useState, useEffect } from "react";
import { useMemory } from "@/data/memoryStore";

export default function SearchBar({
  onResults,
}: {
  onResults: (ids: string[] | null) => void;
}) {
  const { items } = useMemory();
  const [mode, setMode] = useState<"text" | "emotion" | "image">("text");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const emotions = ["joy", "excitement", "calm", "curiosity", "surprise", "neutral"];

  // Text search with debounce
  useEffect(() => {
    if (mode !== 'text') return;
    
    const searchTimeout = setTimeout(() => {
      if (query.trim() === "") {
        onResults(null);
        return;
      }
      
      setLoading(true);
      try {
        const q = query.toLowerCase();
        const qWords = q.split(/\s+/).filter(w => w.length > 0);
        
        const results = items
          .map((item) => {
            const searchText = [
              item.title,
              item.summary,
              item.content,
              ...(item.keywords || []),
              ...(item.tags || [])
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            
            let score = 0;
            for (const word of qWords) {
              if (searchText.includes(word)) {
                score += 1;
              }
            }
            
            return { item, score };
          })
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((x) => x.item.id);
        
        onResults(results.length > 0 ? results : []);
      } finally {
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(searchTimeout);
  }, [query, mode, items, onResults]);

  // Emotion search
  function handleEmotion(emotion: string) {
    setLoading(true);
    try {
      const emotionLower = emotion.toLowerCase();
      const results = items
        .filter((item) => {
          const itemEmotion = item.emotion?.toLowerCase();
          const itemTags = (item.tags || []).map(t => t.toLowerCase());
          return itemEmotion === emotionLower || itemTags.includes(emotionLower);
        })
        .map((item) => item.id);
      
      onResults(results.length > 0 ? results : []);
    } finally {
      setLoading(false);
    }
  }

  // Image search (reverse image search by keywords)
  async function handleImage(file?: File | null) {
    if (!file) return;
    
    setLoading(true);
    onResults(null);
    
    try {
      // Send image to server to extract keywords
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('http://localhost:3001/analyze_image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      const keywords = result.keywords || [];
      
      console.log('Image keywords:', keywords);
      
      if (keywords.length === 0) {
        alert('No keywords extracted from image');
        onResults([]);
        return;
      }
      
      // Search items by keywords
      const keywordsLower = keywords.map((k: string) => k.toLowerCase());
      const results = items
        .map((item) => {
          const itemKeywords = (item.keywords || []).map(k => k.toLowerCase());
          const itemTags = (item.tags || []).map(t => t.toLowerCase());
          const itemTitle = item.title?.toLowerCase() || '';
          const itemSummary = item.summary?.toLowerCase() || '';
          
          let score = 0;
          for (const keyword of keywordsLower) {
            // Check keywords and tags
            if (itemKeywords.some(w => w.includes(keyword))) {
              score += 2;
            }
            if (itemTags.some(w => w.includes(keyword))) {
              score += 2;
            }
            // Check title and summary
            if (itemTitle.includes(keyword)) {
              score += 1;
            }
            if (itemSummary.includes(keyword)) {
              score += 0.5;
            }
          }
          
          return { item, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.item.id);
      
      console.log('Found results:', results.length);
      
      if (results.length === 0) {
        alert(`No items found matching keywords: ${keywords.join(', ')}`);
      }
      
      onResults(results.length > 0 ? results : []);
    } catch (error) {
      console.error("Image search error:", error);
      alert('Image search failed. Make sure the server is running.');
      onResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-xl border border-purple-200 bg-white p-3 shadow-sm md:p-4">
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-purple-200 p-1 bg-purple-50">
          {[
            { k: "text", label: "Text" },
            { k: "emotion", label: "Emotion" },
            { k: "image", label: "Image" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => {
                setMode(t.k as any);
                setQuery("");
                onResults(null);
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                mode === t.k 
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-purple-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {mode === "text" && (
          <div className="relative flex w-full items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, keywords, tags..."
              className="h-10 w-full rounded-md border border-purple-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            />
            {loading && (
              <span className="absolute right-3 text-sm text-purple-600">
                Searching...
              </span>
            )}
          </div>
        )}
        
        {mode === "image" && (
          <div className="flex w-full items-center gap-3">
            <label className="flex-shrink-0 cursor-pointer rounded-md bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition shadow-sm">
              <span>📤 Upload Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImage(e.target.files?.[0])}
              />
            </label>
            {loading && (
              <span className="text-sm text-purple-600 font-medium">
                Analyzing image...
              </span>
            )}
          </div>
        )}
      </div>
      
      {mode === "emotion" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {emotions.map((e) => (
            <button
              key={e}
              onClick={() => handleEmotion(e)}
              className="rounded-full bg-gradient-to-r from-pink-100 to-purple-100 border border-purple-200 px-4 py-2 text-sm font-medium text-purple-700 capitalize hover:from-pink-200 hover:to-purple-200 transition"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}