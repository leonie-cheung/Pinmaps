"use client";

import React, { useEffect, useMemo, useRef } from "react";
import type { PlaceResult } from "../../types/places";

type LatLngLiteral = { lat: number; lng: number };

declare global {
    interface Window {
        google?: any;
    }
}

function loadGoogleMaps(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.google?.maps) return resolve();

        const existing = document.querySelector<HTMLScriptElement>(
            'script[data-google-maps="true"]'
        );
        if (existing) {
            existing.addEventListener("load", () => resolve());
            existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")));
            return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.dataset.googleMaps = "true";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Maps"));
        document.head.appendChild(script);
    });
}

export default function GoogleMapView({
                                          center,
                                          places,
                                          onCenterChange,
                                      }: {
    center: LatLngLiteral;
    places: PlaceResult[];
    onCenterChange: (c: LatLngLiteral) => void;
}) {
    const mapDivRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!apiKey) return;

        let cancelled = false;

        async function init() {
            await loadGoogleMaps(apiKey);
            if (cancelled) return;
            if (!mapDivRef.current) return;

            if (!mapRef.current) {
                mapRef.current = new window.google.maps.Map(mapDivRef.current, {
                    center,
                    zoom: 14,
                    disableDefaultUI: true,
                    zoomControl: true,
                });

                mapRef.current.addListener("idle", () => {
                    const c = mapRef.current.getCenter();
                    if (!c) return;
                    onCenterChange({ lat: c.lat(), lng: c.lng() });
                });
            } else {
                mapRef.current.setCenter(center);
            }
        }

        init().catch(() => {
            // ignore; parent will show errors for fetch, but map load failures are separate
        });

        return () => {
            cancelled = true;
        };
    }, [apiKey, center.lat, center.lng, onCenterChange]);

    const pins = useMemo(
        () =>
            places
                .map((p) => ({
                    id: p.place_id,
                    name: p.name,
                    loc: p.geometry?.location,
                }))
                .filter((x) => x.loc && typeof x.loc.lat === "number" && typeof x.loc.lng === "number"),
        [places]
    );

    useEffect(() => {
        if (!window.google?.maps) return;
        if (!mapRef.current) return;

        // clear old markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        pins.forEach((pin) => {
            const marker = new window.google.maps.Marker({
                map: mapRef.current,
                position: { lat: pin.loc.lat, lng: pin.loc.lng },
                title: pin.name,
            });
            markersRef.current.push(marker);
        });
    }, [pins]);

    if (!apiKey) {
        return (
            <div className="w-full h-[72vh] rounded-3xl border border-zinc-100 flex items-center justify-center text-sm text-zinc-600">
                Missing <span className="font-semibold mx-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span> in
                .env.local
            </div>
        );
    }

    return (
        <div className="w-full h-[72vh] rounded-3xl overflow-hidden border border-zinc-100">
            <div ref={mapDivRef} className="w-full h-full" />
        </div>
    );
}
