import { MemoryItem } from "@/types/memory";
import { cn } from "@/lib/utils";

function TypeBadge({ type }: { type: MemoryItem["type"] }) {
  const label = type[0].toUpperCase() + type.slice(1);
  const colors = {
    article: "bg-blue-100 text-blue-700",
    video: "bg-purple-100 text-purple-700",
    note: "bg-amber-100 text-amber-700",
    image: "bg-pink-100 text-pink-700",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", colors[type] || colors.article)}>
      {label}
    </span>
  );
}

function EmotionBadge({ emotion }: { emotion?: string }) {
  if (!emotion) return null;
  return (
    <span className="rounded-full bg-gradient-to-r from-pink-200 to-purple-200 px-2.5 py-0.5 text-xs font-medium text-purple-800 border border-purple-300">
      {emotion}
    </span>
  );
}

export default function MemoryCard({
  item,
  onToggleFav,
}: {
  item: MemoryItem;
  onToggleFav?: (id: string) => void;
}) {
  const hasImage = item.type === "image" && item.imageDataUrl;
  const gradients = {
    article: "from-blue-100 via-cyan-100 to-teal-100",
    video: "from-purple-100 via-pink-100 to-rose-100",
    note: "from-amber-100 via-yellow-100 to-orange-100",
    image: "from-pink-100 via-fuchsia-100 to-purple-100",
  };
  return (
    <article className="group relative overflow-hidden rounded-lg border border-purple-200 bg-white shadow-sm transition hover:shadow-lg hover:border-purple-300 hover:scale-105">
      {hasImage ? (
        <img
          src={item.imageDataUrl}
          alt={item.title}
          className="h-32 w-full object-cover"
        />
      ) : (
        <div className={`h-32 w-full bg-gradient-to-br ${gradients[item.type] || gradients.article}`} />
      )}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          <TypeBadge type={item.type} />
          <EmotionBadge emotion={item.emotion} />
          {item.favorite && (
            <span className="text-xs text-amber-600 font-medium">
              ★ Favorite
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">
          {item.title}
        </h3>
        {item.summary && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">
            {item.summary}
          </p>
        )}
        {item.keywords && item.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.keywords.slice(0, 4).map((k) => (
              <span
                key={k}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
              >
                {k}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between text-xs">
          <time className="text-slate-500">
            {new Date(item.timestamp).toLocaleDateString()}
          </time>
          <div className="inline-flex items-center gap-2">
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Open ↗
              </a>
            )}
            <button
              onClick={() => onToggleFav?.(item.id)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition",
                item.favorite 
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              {item.favorite ? "★ Unfavorite" : "☆ Favorite"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
