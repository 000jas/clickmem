'use client';

import { useMemo, useState } from "react";
import { useMemory } from "@/data/memoryStore";
import SearchBar from "@/components/memory/SearchBar";
import MemoryCard from "@/components/memory/MemoryCard";
import Analytics from "@/components/memory/Analytics";

export default function Index() {
    const { items, loading, toggleFavorite } = useMemory();
    const [filteredIds, setFilteredIds] = useState<string[] | null>(null);

    const filteredItems = useMemo(() => {
        if (filteredIds === null) {
            return items;
        }
        const searchIdSet = new Set(filteredIds);
        return items.filter((item) => searchIdSet.has(item.id));
    }, [items, filteredIds]);

    const recent = useMemo(
        () => [...items]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 12),
        [items],
    );

    const favorites = useMemo(
        () => items.filter((m) => m.favorite),
        [items],
    );
    
    const handleSearchResults = (ids: string[] | null) => setFilteredIds(ids);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading your memories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Hero Section */}
            <section className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-8 shadow-lg">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Your Digital Memory
                    </h1>
                    <p className="mt-3 text-lg text-purple-900">
                        Capture, organize, and search your web content with AI-powered insights
                    </p>
                </div>
                <div className="mx-auto mt-6 max-w-2xl">
                    <SearchBar onResults={handleSearchResults} />
                </div>
            </section>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-sm">
                    <div className="text-sm font-medium text-blue-700">Total Memories</div>
                    <div className="mt-1 text-2xl font-bold text-blue-900">{items.length}</div>
                </div>
                <div className="rounded-lg border border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100 p-4 shadow-sm">
                    <div className="text-sm font-medium text-pink-700">Favorites</div>
                    <div className="mt-1 text-2xl font-bold text-pink-900">{favorites.length}</div>
                </div>
                <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4 shadow-sm">
                    <div className="text-sm font-medium text-green-700">This Week</div>
                    <div className="mt-1 text-2xl font-bold text-green-900">
                        {items.filter(m => Date.now() - m.timestamp < 7 * 24 * 60 * 60 * 1000).length}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {filteredIds !== null ? "Search Results" : "Recent Captures"}
                    </h2>
                    {filteredIds === null && (
                        <span className="text-sm text-slate-500">
                            Showing {recent.length} of {items.length}
                        </span>
                    )}
                </div>
                
                {(filteredIds !== null ? filteredItems : recent).length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                        <p className="text-slate-600">
                            {filteredIds !== null ? "No results found" : "No memories yet. Start capturing with the extension!"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {(filteredIds !== null ? filteredItems : recent).map((m) => (
                            <MemoryCard key={m.id} item={m} onToggleFav={toggleFavorite} />
                        ))}
                    </div>
                )}
            </section>

            {/* Favorites Section */}
            {favorites.length > 0 && (
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Favorites</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {favorites.slice(0, 6).map((m) => (
                            <MemoryCard key={m.id} item={m} onToggleFav={toggleFavorite} />
                        ))}
                    </div>
                </section>
            )}

            {/* Analytics */}
            {items.length > 0 && <Analytics items={items} />}
        </div>
    );
}