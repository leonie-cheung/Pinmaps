"use client";

import React, { useEffect, useMemo, useRef } from "react";

type LatLng = { lat: number; lng: number };

type Place = {
    place_id: string;
    name?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
};

type Props = {
    center: LatLng;
    places?: Place[]; // make optional so undefined won’t crash
    onCenterChange?: (c: LatLng) => void; // optional
};

export default function GoogleMapView({ center, places = [], onCenterChange }: Props) {
    const mapRef = useRef<google.maps.Map | null>(null);
    const elRef = useRef<HTMLDivElement | null>(null);

    // pins: never crash if places is undefined
    const pins = useMemo(() => {
        return (places ?? [])
            .map((p) => ({
                id: p.place_id,
                name: p.name ?? "Unnamed",
                lat: p.geometry?.location?.lat,
                lng: p.geometry?.location?.lng,
            }))
            .filter((p) => typeof p.lat === "number" && typeof p.lng === "number");
    }, [places]);

    useEffect(() => {
        if (!elRef.current) return;

        // init map once
        if (!mapRef.current) {
            mapRef.current = new google.maps.Map(elRef.current, {
                center,
                zoom: 13,
                disableDefaultUI: true,
            });

            // only attach listener if callback exists
            if (typeof onCenterChange === "function") {
                mapRef.current.addListener("idle", () => {
                    const c = mapRef.current?.getCenter();
                    if (!c) return;
                    onCenterChange({ lat: c.lat(), lng: c.lng() });
                });
            }
            return;
        }

        // update center if it changes
        mapRef.current.setCenter(center);
    }, [center, onCenterChange]);

    useEffect(() => {
        if (!mapRef.current) return;

        // simple marker render (wipe/re-add)
        // NOTE: if you already manage markers elsewhere, keep your version.
        (mapRef.current as any).__markers?.forEach((m: google.maps.Marker) => m.setMap(null));
        (mapRef.current as any).__markers = pins.map(
            (p) =>
                new google.maps.Marker({
                    map: mapRef.current!,
                    position: { lat: p.lat!, lng: p.lng! },
                    title: p.name,
                })
        );
    }, [pins]);

    return <div ref={elRef} className="w-full h-full rounded-3xl overflow-hidden" />;
}
