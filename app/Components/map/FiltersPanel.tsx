"use client";

import React from "react";

type Props = {
    radius: number;
    setRadius: (v: number) => void;
    type: string;
    setType: (v: string) => void;
    loading: boolean;
    onRefresh: () => void | Promise<void>;
    error?: string | null;
};

const TYPES: { label: string; value: string }[] = [
    { label: "Restaurants", value: "restaurant" },
    { label: "Cafes", value: "cafe" },
    { label: "Bars", value: "bar" },
    { label: "Museums", value: "museum" },
    { label: "Tourist spots", value: "tourist_attraction" },
    { label: "Parks", value: "park" },
];

export default function FiltersPanel({
                                         radius,
                                         setRadius,
                                         type,
                                         setType,
                                         loading,
                                         onRefresh,
                                         error,
                                     }: Props) {
    return (
        <div className="w-full rounded-3xl border border-zinc-100 bg-white/80 backdrop-blur p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-zinc-900">Search filters</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Pick a type + radius, then refresh.</p>
                </div>

                <button
                    onClick={() => onRefresh()}
                    disabled={loading}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-colors ${
                        loading ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" : "bg-black text-white hover:bg-zinc-800"
                    }`}
                >
                    {loading ? "Loading…" : "Refresh"}
                </button>
            </div>

            {error ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            ) : null}

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                        Type
                    </label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400"
                    >
                        {TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                        Radius (meters)
                    </label>
                    <input
                        type="number"
                        min={100}
                        step={100}
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400"
                    />
                    <p className="mt-2 text-xs text-zinc-400">Try 1000–3000 for walking distance.</p>
                </div>
            </div>
        </div>
    );
}
