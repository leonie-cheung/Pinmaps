"use client";

import { GoogleMap, MarkerF, InfoWindowF, useLoadScript } from "@react-google-maps/api";
import { useMemo, useState } from "react";
import type { PlaceResultLite } from "@/types/places";

const libraries: ("places")[] = ["places"];

type Props = {
    center: google.maps.LatLngLiteral;
    places: PlaceResultLite[];
    onMapReady: (map: google.maps.Map) => void;
    onCenterChanged?: (center: google.maps.LatLngLiteral) => void;
};

export default function GoogleMapView({ center, places, onMapReady, onCenterChanged }: Props) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    const [selected, setSelected] = useState<PlaceResultLite | null>(null);

    const options = useMemo<google.maps.MapOptions>(
        () => ({
            disableDefaultUI: true,
            zoomControl: true,
            clickableIcons: false,
        }),
        []
    );

    if (!isLoaded) return <div style={{ height: "100%", width: "100%" }}>Loading map…</div>;

    return (
        <GoogleMap
            center={center}
            zoom={12}
            mapContainerStyle={{ height: "100%", width: "100%" }}
            options={options}
            onLoad={(map) => onMapReady(map)}
            onIdle={(map) => {
                const c = map.getCenter();
                if (!c || !onCenterChanged) return;
                onCenterChanged({ lat: c.lat(), lng: c.lng() });
            }}
        >
            {places.map((p) => (
                <MarkerF
                    key={p.placeId}
                    position={{ lat: p.lat, lng: p.lng }}
                    onClick={() => setSelected(p)}
                />
            ))}

            {selected && (
                <InfoWindowF
                    position={{ lat: selected.lat, lng: selected.lng }}
                    onCloseClick={() => setSelected(null)}
                >
                    <div style={{ maxWidth: 220 }}>
                        <div style={{ fontWeight: 700 }}>{selected.name}</div>
                        {selected.rating != null && (
                            <div style={{ marginTop: 4 }}>
                                ⭐ {selected.rating} {selected.userRatingsTotal ? `(${selected.userRatingsTotal})` : ""}
                            </div>
                        )}
                        {selected.address && <div style={{ marginTop: 6, color: "#444" }}>{selected.address}</div>}
                    </div>
                </InfoWindowF>
            )}
        </GoogleMap>
    );
}
