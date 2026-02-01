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
    setFiles(selected.slice(0, 4));
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

      // 1) Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("You must be logged in to post.");
      }

      const userId = session.user.id;

      // 2) Upload images
      const urls: string[] = [];
      for (const f of files) {
        const url = await uploadOne(f);
        urls.push(url);
      }

      // 3) Insert post row with USER_ID
      const { error: insertError } = await supabase.from("posts").insert({
        user_id: userId, // <--- This tag allows you to filter by user on the profile page
        category,
        caption: `${placeName.trim()} — ${caption.trim()}`.trim(),
        rating,
        hashtags,
        image_urls: urls,
        image_url: urls[0],
        location_name: locationName.trim(),
        location_lat: locationLat,
        location_lng: locationLng,
      });

      if (insertError) throw insertError;

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
          <h1 className="text-4xl font-black tracking-tighter mb-8">Create Post</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Place name</label>
              {loadError ? (
                  <div className="text-sm text-rose-600">Maps error.</div>
              ) : !isLoaded ? (
                  <div className="text-sm text-zinc-500">Loading search…</div>
              ) : (
                  <Autocomplete
                      onLoad={(a) => setAc(a)}
                      onPlaceChanged={() => {
                        if (!ac) return;
                        const place = ac.getPlace();
                        const loc = place.geometry?.location;
                        const name = place.name || place.formatted_address || placeName;
                        setPlaceName(name);
                        setLocationName(name);
                        if (loc) {
                          setLocationLat(loc.lat());
                          setLocationLng(loc.lng());
                        }
                      }}
                  >
                    <input
                        value={placeName}
                        onChange={(e) => {
                          setPlaceName(e.target.value);
                          setLocationName(e.target.value);
                          setLocationLat(null);
                          setLocationLng(null);
                        }}
                        className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all"
                        placeholder="e.g. Dishoom Shoreditch"
                    />
                  </Autocomplete>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 appearance-none focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all"
                >
                  {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Rating ({rating}/5)</label>
                <input
                    type="range"
                    min={1}
                    max={5}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="mt-4 w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Vibe Caption</label>
              <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 min-h-[120px] focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all"
                  placeholder="What made it special?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Hashtags</label>
              <input
                  value={hashtagsText}
                  onChange={(e) => setHashtagsText(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all"
                  placeholder="#cozy #matcha #studyspot"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Photos</label>
              <div className="relative group border-2 border-dashed border-zinc-200 rounded-3xl p-8 text-center hover:border-zinc-400 transition-colors">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFilesChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <p className="text-sm font-bold text-zinc-400">
                  {files.length > 0 ? `${files.length} photos selected` : "Drag or Click to upload (1-4 images)"}
                </p>
              </div>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600 font-bold">
                  {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-black text-white py-4 font-black uppercase tracking-widest hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {loading ? "Posting..." : "Share Vibe"}
            </button>
          </form>
        </div>
      </main>
  );
}