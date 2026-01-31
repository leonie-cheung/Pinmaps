"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FiltersPanel from "@/Components/map/FiltersPanel";
import GoogleMapView from "@/Components/map/GoogleMapView";
import { searchNearbyPlaces } from "@/lib/pla
import type { PlaceResultLite, PlaceType } from "@/types/places";

const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 }; // London

export default function MapPage() {
    const mapRef = useRef<google.maps.Map | null>(null);

    const [center, setCenter] = useState(DEFAULT_CENTER);
    const [places, setPlaces] = useState<PlaceResultLite[]>([]);

    const [locationText, setLocationText] = useState("London");
    const [keyword, setKeyword] = useState("#Cafe");
    const [type, setType] = useState<PlaceType>("cafe");
    const [minRating, setMinRating] = useState(4.0);
    const [radiusKm, setRadiusKm] = useState(3);

    const radiusMeters = useMemo(() => Math.round(radiusKm * 1000), [radiusKm]);

    async function geocodeAndCenter() {
        if (!mapRef.current) return;

        // Use built-in Geocoder (from Maps JS)
        const geocoder = new google.maps.Geocoder();
        const res = await geocoder.geocode({ address: locationText });

        const loc = res.results?.[0]?.geometry?.location;
        if (!loc) return;

        const newCenter = { lat: loc.lat(), lng: loc.lng() };
        setCenter(newCenter);
        mapRef.current.panTo(newCenter);
        mapRef.current.setZoom(12);
    }

    async function runSearch() {
        if (!mapRef.current) return;

        // If user typed a location, move map there first
        if (locationText.trim().length > 0) {
            await geocodeAndCenter();
        }

        const currentCenter = mapRef.current.getCenter();
        if (!currentCenter) return;

        const results = await searchNearbyPlaces(mapRef.current, {
            center: { lat: currentCenter.lat(), lng: currentCenter.lng() },
            radiusMeters,
            keyword: keyword.trim(),
            type,
            minRating,
        });

        setPlaces(results);
    }

    // auto-search once map loads
    useEffect(() => {
        if (mapRef.current) runSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="wrap">
            <div className="panelWrap">
                <FiltersPanel
                    locationText={locationText}
                    onLocationTextChange={setLocationText}
                    keyword={keyword}
                    onKeywordChange={setKeyword}
                    type={type}
                    onTypeChange={setType}
                    minRating={minRating}
                    onMinRatingChange={setMinRating}
                    radiusKm={radiusKm}
                    onRadiusKmChange={setRadiusKm}
                    onSearch={runSearch}
                />
            </div>

            <div className="mapWrap">
                <GoogleMapView
                    center={center}
                    places={places}
                    onMapReady={(m) => (mapRef.current = m)}
                    onCenterChanged={(c) => setCenter(c)}
                />
            </div>

            <style jsx>{`
        .wrap {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 18px;
          padding: 18px;
          height: calc(100vh - 80px);
          background: #f6f6f6;
        }
        .panelWrap { height: 100%; }
        .mapWrap {
          height: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: #eaeaea;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        @media (max-width: 900px) {
          .wrap { grid-template-columns: 1fr; height: auto; }
          .mapWrap { height: 70vh; }
        }
      `}</style>
        </div>
    );
}
