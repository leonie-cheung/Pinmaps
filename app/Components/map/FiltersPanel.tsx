"use client";

import React, { useEffect, useRef } from "react";
import { MapPin, RefreshCcw, ChevronDown } from "lucide-react";

type Props = {
    isLoaded: boolean;
    radius: number;
    setRadius: (v: number) => void;
    type: string;
    setType: (v: string) => void;

    // include optional name so you can display city name nicely
    setLocation: (lat: number, lng: number, name?: string) => void;
    locationName: string;

    loading: boolean;
    onRefresh: () => void | Promise<void>;
    error?: string | null;
};

const TYPES = [
    { label: "Restaurants", value: "restaurant" },
    { label: "Cafes", value: "cafe" },
    { label: "Bars", value: "bar" },
    { label: "Museums", value: "museum" },
    { label: "Tourist spots", value: "tourist_attraction" },
    { label: "Parks", value: "park" },
];

export default function FiltersPanel({
                                         isLoaded,
                                         radius,
                                         setRadius,
                                         type,
                                         setType,
                                         setLocation,
                                         locationName,
                                         loading,
                                         onRefresh,
                                         error,
                                     }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        // IMPORTANT: only init after Maps is loaded
        if (!isLoaded) return;
        if (!inputRef.current) return;
        if (autoCompleteRef.current) return;

        autoCompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: "GB" }, // UK only
            types: ["(cities)"],
            fields: ["geometry", "name"],
        });

        autoCompleteRef.current.addListener("place_changed", () => {
            const place = autoCompleteRef.current?.getPlace();
            const loc = place?.geometry?.location;
            if (!loc) return;
            setLocation(loc.lat(), loc.lng(), place?.name ?? "Selected city");
        });
    }, [isLoaded, setLocation]);

    return (
        <div className="w-full rounded-[2.5rem] border border-zinc-100 bg-white p-8 shadow-xl shadow-zinc-200/50">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Search Filters</h2>
                    <p className="text-xs text-zinc-400 font-medium">Find the perfect spot</p>
                </div>

                <button
                    onClick={() => onRefresh()}
                    disabled={loading}
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                        loading
                            ? "bg-zinc-100 text-zinc-400 animate-spin"
                            : "bg-zinc-900 text-white hover:scale-105 active:scale-95"
                    }`}
                    aria-label="Refresh"
                >
                    <RefreshCcw size={20} />
                </button>
            </div>

            {error && (
                <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-xs font-semibold text-amber-700 border border-amber-100 italic">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2 ml-1 tracking-widest">
                        Location
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 pl-12 pr-4 py-4 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-zinc-100/50 transition-all"
                            placeholder="Type a UK city..."
                            defaultValue={locationName === "Current Location" ? "" : locationName}
                        />
                    </div>
                </div>

                <div className="relative">
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2 ml-1 tracking-widest">
                        Spot Type
                    </label>
                    <div className="relative">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4 text-sm font-medium outline-none focus:bg-white transition-all appearance-none cursor-pointer"
                        >
                            {TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                            size={16}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black uppercase text-zinc-400 ml-1 tracking-widest">
                            Radius
                        </label>
                        <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-md">
              {radius}m
            </span>
                    </div>

                    <input
                        type="range"
                        min={500}
                        max={5000}
                        step={500}
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                    />
                </div>
            </div>
        </div>
    );
}
