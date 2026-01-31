export type NearbyArgs = {
    lat: number;
    lng: number;
    radius: number;
    type: string;
};

export function buildNearbySearchUrl({ lat, lng, radius, type }: NearbyArgs) {
    const key = process.env.GOOGLE_PLACES_API_KEY; // server-only key
    if (!key) throw new Error("Missing GOOGLE_PLACES_API_KEY");

    const sp = new URLSearchParams({
        location: `${lat},${lng}`,
        radius: String(radius),
        type,
        key,
    });

    return `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${sp.toString()}`;
}
