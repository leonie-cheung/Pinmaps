import { NextResponse } from "next/server";
import { buildNearbySearchUrl } from "../../lib/places";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius") ?? "2000";
    const type = searchParams.get("type") ?? "restaurant";

    if (!lat || !lng) {
        return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
    }

    const url = buildNearbySearchUrl({
        lat: Number(lat),
        lng: Number(lng),
        radius: Number(radius),
        type,
    });

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const data = await res.json();

    return NextResponse.json(data);
}
