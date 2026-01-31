"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

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
    places?: PlaceResult[]; // allow undefined safely
    onCenterChange?: (c: LatLng) => void; // optional (prevents “not a function”)
};

export default function GoogleMapView({ center, places = [], onCenterChange }: Props) {
    const elRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const listenerRef = useRef<google.maps.MapsEventListener | null>(null);

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

    // Init map (loads Google Maps JS if needed)
    useEffect(() => {
        let cancelled = false;

        async function init() {
            if (!elRef.current) return;
            if (!apiKey) {
                console.error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
                return;
            }

            const loader = new Loader({
                apiKey,
                version: "weekly",
                libraries: ["places"],
            });

            await loader.load();
            if (cancelled) return;

            if (!mapRef.current) {
                mapRef.current = new google.maps.Map(elRef.current, {
                    center,
                    zoom: 14,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                });

                // Only wire this if the parent passed it
                if (onCenterChange) {
                    listenerRef.current = mapRef.current.addListener("idle", () => {
                        const c = mapRef.current?.getCenter();
                        if (!c) return;
                        onCenterChange({ lat: c.lat(), lng: c.lng() });
                    });
                }
            } else {
                mapRef.current.setCenter(center);
            }
        }

        init();

        return () => {
            cancelled = true;
            if (listenerRef.current) {
                listenerRef.current.remove();
                listenerRef.current = null;
            }
        };
    }, [apiKey, center.lat, center.lng, onCenterChange]);

    // Render markers when pins change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // clear old markers
        for (const m of markersRef.current) m.setMap(null);
        markersRef.current = [];

        // add new markers
        markersRef.current = pins.map((pin) => {
            const marker = new google.maps.Marker({
                position: pin.loc,
                map,
                title: pin.name,
            });
            return marker;
        });
    }, [pins]);

    return (
        <div className="w-full h-[70vh] lg:h-[80vh] rounded-3xl overflow-hidden border border-zinc-100 shadow-sm">
            <div ref={elRef} className="w-full h-full" />
        </div>
    );
}
