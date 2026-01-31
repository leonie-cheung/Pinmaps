"use client";

import React, { useMemo, useRef } from "react";
import { GoogleMap, MarkerF, CircleF } from "@react-google-maps/api";

type LatLng = { lat: number; lng: number };

export type PlaceResult = {
    place_id: string;
    name: string;
    vicinity?: string;
    geometry?: {
        location: { lat: number; lng: number };
    };
};

type Props = {
    center: LatLng;
    radius: number;
    places: PlaceResult[];
    onCenterChange?: (c: LatLng) => void;
};

const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
};

export default function GoogleMapView({
                                          center,
                                          radius,
                                          places,
                                          onCenterChange,
                                      }: Props) {
    const mapRef = useRef<google.maps.Map | null>(null);

    const pins = useMemo(() => {
        return (places ?? [])
            .map((p) => ({
                id: p.place_id,
                name: p.name ?? "Untitled",
                loc: p.geometry?.location,
            }))
            .filter((x) => !!x.loc) as { id: string; name: string; loc: LatLng }[];
    }, [places]);

    const handleLoad = (map: google.maps.Map) => {
        mapRef.current = map;
    };

    const handleIdle = (map: google.maps.Map) => {
        if (!onCenterChange) return;
        const c = map.getCenter();
        if (!c) return;
        onCenterChange({ lat: c.lat(), lng: c.lng() });
    };

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
            options={{
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                clickableIcons: false,
            }}
            // ✅ cast fixes TS2769 on your setup
            onLoad={handleLoad as unknown as () => void}
            onIdle={handleIdle as unknown as () => void}
        >
            <CircleF
                center={center}
                radius={radius}
                options={{
                    strokeColor: "#111827",
                    strokeOpacity: 0.25,
                    strokeWeight: 2,
                    fillColor: "#111827",
                    fillOpacity: 0.08,
                }}
            />

            <MarkerF position={center} />

            {pins.map((pin) => (
                <MarkerF key={pin.id} position={pin.loc} title={pin.name} />
            ))}
        </GoogleMap>
    );
}
