import { useMemo } from "react";
import { MemoryItem } from "@/types/memory";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts";

export default function Analytics({ items }: { items: MemoryItem[] }) {
  // Group memories by week for better visualization
  const byWeek = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of items) {
      const date = new Date(m.timestamp);
      // Get week start (Monday)
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1);
      const k = weekStart.toISOString().slice(0, 10);
      map.set(k, (map.get(k) || 0) + 1);
    }
    return [...map.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ 
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        count 
      }));
  }, [items]);

  const emotionStats = useMemo(() => {
    const freq = new Map<string, number>();
    for (const m of items) {
      if (m.emotion) {
        freq.set(m.emotion, (freq.get(m.emotion) || 0) + 1);
      }
    }
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([emotion, count]) => ({ emotion, count }));
  }, [items]);

  const topTags = useMemo(() => {
    const freq = new Map<string, number>();
    for (const m of items)
      for (const t of m.keywords || []) freq.set(t, (freq.get(t) || 0) + 1);
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [items]);

  return (
    <div className="space-y-4">
      {/* Activity Over Time */}
      <div className="rounded-xl border border-purple-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          📊 Activity Over Time
        </h3>
        <div className="h-64">
          {byWeek.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              No activity data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={byWeek} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  stroke="#cbd5e1"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  stroke="#cbd5e1"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorActivity)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Emotions Breakdown */}
        {emotionStats.length > 0 && (
          <div className="rounded-xl border border-pink-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              😊 Emotions
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emotionStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                  <XAxis 
                    dataKey="emotion" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    stroke="#fbcfe8"
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    stroke="#fbcfe8"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #fce7f3',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#colorEmotion)" 
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorEmotion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Trending Keywords */}
        <div className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            🔥 Trending Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {topTags.length === 0 ? (
              <span className="text-sm text-slate-500">No keywords yet</span>
            ) : (
              topTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700"
                >
                  {tag} <span className="text-blue-500">×{count}</span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
