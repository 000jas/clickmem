import { useState } from "react";
import { useMemory } from "@/data/memoryStore";
import { MemoryType } from "@/types/memory";

export default function QuickAdd() {
  const { add } = useMemory();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<MemoryType>("article");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function onAdd() {
    if (!title) return;
    setLoading(true);
    try {
      await add({
        title,
        url: url || undefined,
        type,
        content,
        timestamp: Date.now(),
      });
      setTitle("");
      setUrl("");
      setContent("");
      setType("article");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold">Quick add</div>
      <div className="grid gap-2 md:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--brand-start))]"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MemoryType)}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="article">Article</option>
          <option value="video">Video</option>
          <option value="image">Image</option>
          <option value="note">Note</option>
        </select>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL (optional)"
          className="h-10 rounded-md border border-border bg-background px-3 text-sm md:col-span-2"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content or notes (optional)"
          rows={3}
          className="w-full resize-none rounded-md border border-border bg-background p-3 text-sm md:col-span-2"
        />
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={onAdd}
          className="rounded-md bg-gradient-to-br from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Adding…" : "Add"}
        </button>
      </div>
    </div>
  );
}
