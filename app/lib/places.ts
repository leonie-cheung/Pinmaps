type NearbyArgs = {
    apiKey: string;
    lat: number;
    lng: number;
    radius: number;
    keyword: string;
    openNow: boolean;
};

export function buildNearbySearchUrl({
                                         apiKey,
                                         lat,
                                         lng,
                                         radius,
                                         keyword,
                                         openNow,
                                     }: NearbyArgs) {
    const params = new URLSearchParams({
        key: apiKey,
        location: `${lat},${lng}`,
        radius: String(radius),
        keyword,
    });

    if (openNow) params.set("opennow", "true");

    // Nearby Search
    return `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
}
