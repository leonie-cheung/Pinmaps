import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set([
    "restaurant",
    "cafe",
    "bar",
    "museum",
    "tourist_attraction",
    "park",
]);

function num(v: string | null, fallback: number) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const lat = num(searchParams.get("lat"), NaN);
        const lng = num(searchParams.get("lng"), NaN);
        const radius = Math.min(Math.max(num(searchParams.get("radius"), 2000), 100), 50000);
        const typeRaw = (searchParams.get("type") ?? "restaurant").trim();

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return NextResponse.json({ error: "Missing/invalid lat/lng" }, { status: 400 });
        }

        const type = ALLOWED_TYPES.has(typeRaw) ? typeRaw : "restaurant";

        // Prefer server-only key. Fallback so you can test quickly.
        const apiKey =
            process.env.GOOGLE_PLACES_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                {
                    error:
                        "Missing GOOGLE_PLACES_API_KEY (server) and NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (fallback)",
                },
                { status: 500 }
            );
        }

        const sp = new URLSearchParams();
        sp.set("location", `${lat},${lng}`);
        sp.set("radius", String(radius));
        sp.set("type", type);
        sp.set("key", apiKey);

        // Soft UK bias (not a strict filter)
        sp.set("region", "gb");
        sp.set("language", "en");

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${sp.toString()}`;

        const res = await fetch(url, {
            headers: { Accept: "application/json" },
            cache: "no-store",
        });

        const data = await res.json();

        // If Google returns an error status, pass a helpful response
        if (!res.ok || (data?.status && !["OK", "ZERO_RESULTS"].includes(data.status))) {
            return NextResponse.json(
                {
                    error: data?.error_message ?? "Google Places request failed",
                    status: data?.status,
                    details: data,
                },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
    }
}
