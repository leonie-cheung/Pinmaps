"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import FiltersPanel from "./FiltersPanel";
import GoogleMapView from "./GoogleMapView";

type LatLng = { lat: number; lng: number };

export type PlaceResult = {
  place_id: string;
  name: string;
  vicinity?: string;
  geometry?: { location: { lat: number; lng: number } };
};

type PlacesNearbyResponse = {
  results?: PlaceResult[];
  status?: string; // "OK" | "ZERO_RESULTS" | etc
  error_message?: string;
  error?: string;
};

const LONDON: LatLng = { lat: 51.5074, lng: -0.1278 };

// Keep libraries stable to prevent reload loops
const LIBRARIES: ("places")[] = ["places"];

export default function MapPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script-main",
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const [center, setCenter] = useState<LatLng>(LONDON);
  const [locationName, setLocationName] = useState<string>("London");
  const [radius, setRadius] = useState<number>(2000);
  const [type, setType] = useState<string>("restaurant");

  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Option 1: Use browser location, fallback to London
  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationName("Current Location");
        },
        () => {
          setCenter(LONDON);
          setLocationName("London");
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("lat", String(center.lat));
    sp.set("lng", String(center.lng));
    sp.set("radius", String(radius));
    sp.set("type", type);
    return sp.toString();
  }, [center.lat, center.lng, radius, type]);

  const fetchPlaces = useCallback(async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/places?${queryString}`);
      const data = (await res.json()) as PlacesNearbyResponse;

      if (!res.ok) {
        setPlaces([]);
        throw new Error(data?.error || data?.error_message || "Failed to load places");
      }

      if (data.status === "ZERO_RESULTS") {
        setPlaces([]);
        setError("No spots found in this area. Try a larger radius or a different type.");
        return;
      }

      if (data.status && data.status !== "OK") {
        setPlaces([]);
        setError(data.error_message || `Google returned: ${data.status}`);
        return;
      }

      setPlaces(data.results ?? []);
    } catch (e: any) {
      setPlaces([]);
      setError(e?.message ?? "Request failed");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, queryString]);

  // Auto fetch when filters/center change
  useEffect(() => {
    if (isLoaded) fetchPlaces();
  }, [isLoaded, fetchPlaces]);

  if (!apiKey) {
    return (
        <div className="p-10 text-rose-500 font-bold">
          Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
        </div>
    );
  }

  if (loadError) {
    return (
        <div className="p-10 text-rose-500 font-bold">
          Error loading Google Maps. Check key + enabled APIs + restrictions.
        </div>
    );
  }

  if (!isLoaded) {
    return <div className="p-10 animate-pulse text-zinc-400">Booting Map…</div>;
  }

  return (
      <div className="min-h-screen bg-zinc-50/30">
        <main className="px-6 py-8 md:px-10 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:w-[400px] space-y-6">
              <FiltersPanel
                  isLoaded={isLoaded}
                  radius={radius}
                  setRadius={setRadius}
                  type={type}
                  setType={setType}
                  setLocation={(lat, lng, name) => {
                    setCenter({ lat, lng });
                    if (name) setLocationName(name);
                  }}
                  locationName={locationName}
                  loading={loading}
                  onRefresh={fetchPlaces}
                  error={error}
              />

              {/* RESULTS UNDER FILTERS */}
              <div className="rounded-[2.5rem] border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-200/50">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Results
                  </p>
                  <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-md">
                  {places.length}
                </span>
                </div>

                {loading ? (
                    <div className="text-sm text-zinc-400 animate-pulse">Loading…</div>
                ) : places.length === 0 ? (
                    <div className="text-sm text-zinc-500">No results yet.</div>
                ) : (
                    <div className="space-y-3 max-h-[52vh] overflow-auto pr-1">
                      {places.map((p) => {
                        const loc = p.geometry?.location;
                        return (
                            <button
                                key={p.place_id}
                                onClick={() => {
                                  if (!loc) return;
                                  setCenter({ lat: loc.lat, lng: loc.lng });
                                }}
                                className="w-full text-left rounded-2xl border border-zinc-100 bg-zinc-50/60 hover:bg-white hover:border-zinc-200 transition-all p-4"
                            >
                              <p className="text-sm font-bold text-zinc-900">{p.name}</p>
                              {p.vicinity ? (
                                  <p className="text-xs text-zinc-500 mt-1">{p.vicinity}</p>
                              ) : null}
                            </button>
                        );
                      })}
                    </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN (MAP) */}
            <div className="flex-1 min-h-[750px] h-[82vh] rounded-[3rem] overflow-hidden border border-zinc-100 shadow-2xl bg-white">
            <GoogleMapView
                  center={center}
                  radius={radius}
                  places={places}
                  onCenterChange={setCenter}
              />
            </div>
          </div>
        </main>
      </div>
  );
}
