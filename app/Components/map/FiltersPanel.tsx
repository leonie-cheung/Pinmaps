"use client";

import React from "react";

export default function FiltersPanel({
                                         query,
                                         setQuery,
                                         radius,
                                         setRadius,
                                         openNow,
                                         setOpenNow,
                                         loading,
                                         onRefresh,
                                     }: {
    query: string;
    setQuery: (v: string) => void;
    radius: number;
    setRadius: (v: number) => void;
    openNow: boolean;
    setOpenNow: (v: boolean) => void;
    loading: boolean;
    onRefresh: () => void;
}) {
    return (
        <div className="rounded-2xl border border-zinc-100 p-4">
            <p className="text-sm font-semibold text-zinc-900">Find good spots</p>
            <p className="text-xs text-zinc-500 mt-1">
                Search places near the map center.
            </p>

            <div className="mt-4 space-y-3">
                <div>
                    <label className="text-xs font-semibold text-zinc-600">Search</label>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="cafe, sushi, museum…"
                        className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-200"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-zinc-600">
                        Radius (meters)
                    </label>
                    <input
                        type="number"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value || 0))}
                        min={100}
                        max={50000}
                        className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-200"
                    />
                </div>

                <label className="flex items-center gap-2 text-sm text-zinc-700 select-none">
                    <input
                        type="checkbox"
                        checked={openNow}
                        onChange={(e) => setOpenNow(e.target.checked)}
                        className="accent-pink-500"
                    />
                    Open now
                </label>

                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="w-full rounded-xl bg-black text-white py-2 text-sm font-semibold disabled:opacity-60"
                >
                    {loading ? "Searching…" : "Refresh"}
                </button>
            </div>
        </div>
    );
}
