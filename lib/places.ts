export type NearbyArgs = {
    lat: number;
    lng: number;
    radius: number;
    type: string;
};

export function buildNearbySearchUrl(args: NearbyArgs) {
    const key = process.env.GOOGLE_PLACES_API_KEY; // server-side only
    if (!key) {
        throw new Error("Missing GOOGLE_PLACES_API_KEY (server env var)");
    }

    const sp = new URLSearchParams();
    sp.set("location", `${args.lat},${args.lng}`);
    sp.set("radius", String(args.radius));
    sp.set("type", args.type);
    sp.set("key", key);

    // Nearby Search (Places API)
    return `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${sp.toString()}`;
}
