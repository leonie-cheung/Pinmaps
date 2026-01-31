import type { PlaceResultLite, PlaceType } from "@/types/places";

export type PlacesSearchParams = {
    center: google.maps.LatLngLiteral;
    radiusMeters: number; // e.g. 2500
    keyword?: string; // e.g. "#Cafe" or "brunch"
    minRating?: number; // e.g. 4.2
    type?: PlaceType; // "cafe", "restaurant", etc
};

export async function searchNearbyPlaces(
    map: google.maps.Map,
    params: PlacesSearchParams
): Promise<PlaceResultLite[]> {
    const service = new google.maps.places.PlacesService(map);

    const request: google.maps.places.PlaceSearchRequest = {
        location: params.center,
        radius: params.radiusMeters,
        keyword: params.keyword || undefined,
        type: params.type || undefined,
        openNow: false,
    };

    const results = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
        service.nearbySearch(request, (res, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && res) return resolve(res);
            if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) return resolve([]);
            return reject(new Error(`Places nearbySearch failed: ${status}`));
        });
    });

    const mapped: PlaceResultLite[] = results
        .map((p) => ({
            placeId: p.place_id || "",
            name: p.name || "Unknown",
            lat: p.geometry?.location?.lat() ?? 0,
            lng: p.geometry?.location?.lng() ?? 0,
            rating: p.rating ?? undefined,
            userRatingsTotal: p.user_ratings_total ?? undefined,
            address: p.vicinity ?? p.formatted_address ?? undefined,
            types: p.types ?? undefined,
        }))
        .filter((p) => p.placeId && p.lat && p.lng);

    // “Good spots” filter
    const minRating = params.minRating ?? 0;
    return mapped.filter((p) => (p.rating ?? 0) >= minRating);
}
