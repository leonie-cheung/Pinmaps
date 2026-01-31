"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

type LatLng = { lat: number; lng: number };

type PlaceResult = {
    place_id: string;
    name?: string;
    geometry?: { location?: { lat: number; lng: number } };
    vicinity?: string;
    [key: string]: any;
};

type Props = {
    center: LatLng;
    places?: PlaceResult[]; // can be undefined
    onCenterChange?: (c: LatLng) => void; // optional
};

declare global {
    interface Window {
        google?: any;
    }
}

export default function GoogleMapView({ center, places = [], onCenterChange }: Props) {
    const elRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const listenerRef = useRef<any>(null);

    const [mapsReady, setMapsReady] = useState(false);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // Convert places -> pins safely
    const pins = useMemo(() => {
        return (places ?? [])
            .map((p) => ({
                id: p.place_id,
                name: p.name ?? "Untitled",
                loc: p.geometry?.location,
            }))
            .filter((x) => !!x.loc) as { id: string; name: string; loc: LatLng }[];
    }, [places]);

    // Init map once Google Maps is ready
    useEffect(() => {
        if (!mapsReady) return;
        if (!elRef.current) return;
        if (!window.google?.maps) return;

        // create map once
        if (!mapRef.current) {
            mapRef.current = new window.google.maps.Map(elRef.current, {
                center,
                zoom: 14,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });

            // only wire this if parent passed it
            if (onCenterChange) {
                listenerRef.current = mapRef.current.addListener("idle", () => {
                    const c = mapRef.current?.getCenter?.();
                    if (!c) return;
                    onCenterChange({ lat: c.lat(), lng: c.lng() });
                });
            }
        } else {
            mapRef.current.setCenter(center);
        }
    }, [mapsReady, center.lat, center.lng, onCenterChange]);

    // Render markers when pins change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        if (!window.google?.maps) return;

        // clear old markers
        for (const m of markersRef.current) m.setMap(null);
        markersRef.current = [];

        // add new markers
        markersRef.current = pins.map((pin) => {
            const marker = new window.google.maps.Marker({
                position: pin.loc,
                map,
                title: pin.name,
            });
            return marker;
        });
    }, [pins]);

    return (
        <div className="w-full h-[70vh] lg:h-[80vh] rounded-3xl overflow-hidden border border-zinc-100 shadow-sm bg-zinc-50">
            {!apiKey ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-rose-600">
                    Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                </div>
            ) : (
                <>
                    <Script
                        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
                        strategy="afterInteractive"
                        onLoad={() => setMapsReady(true)}
                        onError={() => console.error("Failed to load Google Maps script")}
                    />
                    <div ref={elRef} className="w-full h-full" />
                </>
            )}
        </div>
    );
}
