"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

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
        image_url: urls[0], // compatibility for your current Explore UI
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
            <input
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="e.g. Dishoom Shoreditch"
            />
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
