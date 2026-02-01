"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";


const CATEGORIES = ["Cafe", "Restaurant", "Bar", "Exhibition", "Weekend trip", "Bakery", "Museum", "Brunch"];

export default function PostPage() {
  const router = useRouter();

  const [placeName, setPlaceName] = useState("");
  const [category, setCategory] = useState("Cafe");
  const [rating, setRating] = useState(5);
  const [caption, setCaption] = useState("");
  const [hashtagsText, setHashtagsText] = useState("#cozy #studyspot");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState("");
    const [locationLat, setLocationLat] = useState<number | null>(null);
    const [locationLng, setLocationLng] = useState<number | null>(null);

    const [ac, setAc] = useState<google.maps.places.Autocomplete | null>(null);


  const hashtags = useMemo(() => {
    // "#cozy #StudySpot matcha" -> ["cozy","studyspot","matcha"]
    return hashtagsText
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith("#") ? t.slice(1) : t))
      .map((t) => t.toLowerCase())
      .filter((t) => t.length > 0);
  }, [hashtagsText]);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    const { isLoaded, loadError } = useJsApiLoader({
    id: "google-places-post",
    googleMapsApiKey: apiKey,
    libraries: ["places"],
    });


  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setFiles(selected.slice(0, 4)); // limit 4
  }

  async function uploadOne(file: File) {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `posts/${fileName}`;

    const { error } = await supabase.storage.from("post-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) throw error;

    const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!placeName.trim()) return setError("Please enter a place name.");
    if (locationLat == null || locationLng == null) {
    return setError("Please select a place from the dropdown suggestions.");
    }
    if (files.length === 0) return setError("Please upload at least 1 photo.");

    try {
      setLoading(true);

      // 1) upload images
      const urls: string[] = [];
      for (const f of files) {
        const url = await uploadOne(f);
        urls.push(url);
      }

      // 2) insert post row
    const { error: insertError } = await supabase.from("posts").insert({
        category,
        caption: `${placeName.trim()} — ${caption.trim()}`.trim(),
        rating,
        hashtags,
        image_urls: urls,
        image_url: urls[0],

        // NEW:
        location_name: locationName.trim(),
        location_lat: locationLat,
        location_lng: locationLng,
    });


      if (insertError) throw insertError;

      // 3) go back to Explore
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900 px-6 py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Create Post</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="text-sm text-zinc-600">Place name</label>

            {loadError ? (
                <div className="mt-1 text-sm text-rose-600">
                Google Maps failed to load (check API key / Places API enabled).
                </div>
            ) : !isLoaded ? (
                <div className="mt-1 text-sm text-zinc-500">Loading place search…</div>
            ) : (
                <Autocomplete
                onLoad={(a) => setAc(a)}
                onPlaceChanged={() => {
                    if (!ac) return;

                    const place = ac.getPlace();
                    const loc = place.geometry?.location;

                    // This is what shows in your input
                    const name = place.name || place.formatted_address || placeName;

                    setPlaceName(name);
                    setLocationName(name);

                    if (loc) {
                    setLocationLat(loc.lat());
                    setLocationLng(loc.lng());
                    } else {
                    setLocationLat(null);
                    setLocationLng(null);
                    }
                }}
                >
                <input
                    value={placeName}
                    onChange={(e) => {
                    // user is typing, not selecting yet
                    setPlaceName(e.target.value);
                    setLocationName(e.target.value);

                    // important: typing alone does NOT guarantee a real place,
                    // so lat/lng must be cleared until they pick a suggestion
                    setLocationLat(null);
                    setLocationLng(null);
                    }}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    placeholder="e.g. Dishoom Shoreditch"
                />
                </Autocomplete>
            )}

            {/* Optional: show feedback */}
            {locationLat && locationLng ? (
                <p className="text-xs text-zinc-500 mt-1">Location saved ✓</p>
            ) : (
                <p className="text-xs text-zinc-500 mt-1">
                Pick a suggestion so we can save coordinates.
                </p>
            )}
            </div>



          <div>
            <label className="text-sm text-zinc-600">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-zinc-600">Rating</label>
            <input
              type="range"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="mt-2 w-full"
            />
            <p className="text-sm text-zinc-700 mt-1">{rating}/5</p>
          </div>

          <div>
            <label className="text-sm text-zinc-600">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[90px]"
              placeholder="What was the vibe like?"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-600">Hashtags</label>
            <input
              value={hashtagsText}
              onChange={(e) => setHashtagsText(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="#cozy #matcha #studyspot"
            />
            <p className="text-xs text-zinc-500 mt-1">Space-separated. Saved without the #.</p>
          </div>

          <div>
            <label className="text-sm text-zinc-600">Upload photos (1–4)</label>
            <input type="file" accept="image/*" multiple onChange={onFilesChange} className="mt-1 w-full" />
            {files.length > 0 && <p className="text-xs text-zinc-500 mt-1">{files.length} file(s) selected</p>}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black text-white py-3 font-medium disabled:opacity-60"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </main>
  );
}
