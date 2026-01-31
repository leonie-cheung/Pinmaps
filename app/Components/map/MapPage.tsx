"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import FiltersPanel from "./FiltersPanel";
import GoogleMapView from "./GoogleMapView";

type PlaceResult = {
  place_id: string;
  name?: string;
  geometry?: { location?: { lat: number; lng: number } };
  vicinity?: string;
  [key: string]: any;
};

type PlacesNearbyResponse = {
  results?: PlaceResult[];
  error?: string;
};

const LONDON = { lat: 51.5074, lng: -0.1278 };
const DEFAULT_RADIUS = 2000;
const DEFAULT_TYPE = "restaurant";

export default function MapPage() {
  const [center, setCenter] = useState(LONDON);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [type, setType] = useState(DEFAULT_TYPE);

  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Option 1: Use browser location, otherwise fallback to London
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setCenter(LONDON);
      return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setCenter(LONDON);
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
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/places?${queryString}`);
      const data = (await res.json()) as PlacesNearbyResponse;

      if (!res.ok) {
        setPlaces([]);
        setError((data as any)?.error ?? "Failed to load places");
        return;
      }

      setPlaces(data.results ?? []);
    } catch (e: any) {
      setPlaces([]);
      setError(e?.message ?? "Request failed");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return (
      <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-pink-100">
        <main className="px-6 py-6 md:px-10 md:py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-[360px]">
              <FiltersPanel
                  radius={radius}
                  setRadius={setRadius}
                  type={type}
                  setType={setType}
                  loading={loading}
                  onRefresh={fetchPlaces}
                  error={error}
              />
            </div>

            <div className="flex-1">
              <GoogleMapView
                  center={center}
                  places={places} // always an array
                  onCenterChange={setCenter} // safe + fixes "not a function"
              />
            </div>
          </div>
        </main>
      </div>
  );
}
