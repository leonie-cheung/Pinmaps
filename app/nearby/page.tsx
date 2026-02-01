"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { X, Star } from "lucide-react";

// ✅ Default centre (so the page always shows something)
const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 };
const DEFAULT_CENTER_NAME = "London";

/** 1) Add location fields so Nearby can use them */
type PostRow = {
  id: string;
  category: string;
  image_url: string | null;
  caption: string | null;
  rating: number | null;
  hashtags: string[] | null;
  created_at: string;
  user_id: string;

  // NEW (from Part A + Part B)
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
};

/** 2) Helper for distance in km (Haversine) */
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 3) Extend PostRow at runtime with distance */
type PostWithDistance = PostRow & { distance_km?: number };

export default function ExplorePage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** 4) Nearby state (centre starts as London) */
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [centerName, setCenterName] = useState(DEFAULT_CENTER_NAME);
  const [radiusKm, setRadiusKm] = useState(3);

  const [selectedPost, setSelectedPost] = useState<PostWithDistance | null>(null);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setPosts((data as PostRow[]) ?? []);
      }

      setLoading(false);
    }

    loadPosts();
  }, []);

  /** 5) Button handler: switch centre to user location (or fallback to London) */
  function getMyLocation() {
    setError(null);

    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCenterName("Current location");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission denied. Showing London instead.");
        } else {
          setError("Could not get your location. Showing London instead.");
        }
        setCenter(DEFAULT_CENTER);
        setCenterName(DEFAULT_CENTER_NAME);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  /** 6) Compute nearby posts based on current centre (London by default) */
  const nearbyPosts = useMemo<PostWithDistance[]>(() => {
    return posts
      .filter((p) => p.location_lat != null && p.location_lng != null)
      .map((p) => {
        const km = distanceKm(center, { lat: p.location_lat!, lng: p.location_lng! });
        return { ...p, distance_km: km };
      })
      .filter((p) => (p.distance_km ?? Infinity) <= radiusKm)
      .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
  }, [posts, center, radiusKm]);

  /** 7) Always show nearby posts (centred on London or current location) */
  const listToShow: PostWithDistance[] = nearbyPosts;

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-pink-100">
      <main className="px-6 md:px-10 py-8">
        {/* 8) Nearby controls (put above the grid) */}
        <div className="mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={getMyLocation}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
            >
              Use my location
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600">Radius</span>
              <input
                type="number"
                min={1}
                max={50}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-20 rounded-xl border px-3 py-2 text-sm"
              />
              <span className="text-sm text-zinc-600">km</span>
            </div>
          </div>

          <div className="text-sm text-zinc-600">
            Currently:{" "}
            <span className="font-semibold text-zinc-900">{centerName}</span> • within{" "}
            {radiusKm} km
          </div>
        </div>

        {loading && (
          <p className="text-sm text-zinc-500 mb-6 animate-pulse uppercase tracking-widest font-black">
            Loading feed…
          </p>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Error:</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* 9) Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {listToShow.length === 0 && !loading && !error ? (
            <div className="col-span-full text-center py-20 text-sm text-zinc-400 font-bold uppercase tracking-widest">
              No posts found within this radius.
            </div>
          ) : (
            listToShow.map((post) => (
              <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
            ))
          )}
        </div>

        {/* 10) Modal */}
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-xl p-4 md:p-10 animate-in fade-in duration-300">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors z-50"
            >
              <X size={24} />
            </button>

            <div className="max-w-5xl w-full h-full flex flex-col md:flex-row gap-8 items-center justify-center">
              <div className="flex-1 h-full max-h-[80vh] relative">
                <img
                  src={selectedPost.image_url || ""}
                  className="w-full h-full object-contain rounded-3xl shadow-2xl"
                  alt=""
                />
              </div>

              <div className="w-full md:w-80 flex flex-col gap-4">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  {selectedPost.category}
                </span>

                <h2 className="text-3xl font-black leading-tight">{selectedPost.caption}</h2>

                {selectedPost.location_name && (
                  <p className="text-sm text-zinc-600">{selectedPost.location_name}</p>
                )}

                {selectedPost.distance_km != null && (
                  <p className="text-sm font-bold text-zinc-900">
                    {selectedPost.distance_km.toFixed(2)} km away
                  </p>
                )}

                {selectedPost.rating && (
                  <div className="flex items-center gap-2 text-xl font-bold">
                    <Star size={20} fill="currentColor" className="text-amber-400" />
                    {selectedPost.rating}/5
                  </div>
                )}

                <p className="text-zinc-400 text-sm mt-4 italic">
                  Posted on {new Date(selectedPost.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function PostCard({ post, onClick }: { post: PostWithDistance; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative aspect-[2/3] rounded-[2.5rem] overflow-hidden bg-zinc-50 border border-zinc-100 transition-all duration-500 hover:shadow-2xl cursor-zoom-in"
    >
      {post.image_url ? (
        <img
          src={post.image_url}
          alt=""
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs font-bold uppercase tracking-widest">
          No Image
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 block mb-2">
          {post.category || "General"}
        </span>

        {post.caption && (
          <p className="text-base font-bold line-clamp-2 mb-2 leading-tight">{post.caption}</p>
        )}

        {post.distance_km != null && (
          <p className="text-xs font-bold opacity-80 mb-2">{post.distance_km.toFixed(2)} km away</p>
        )}

        {post.rating && (
          <div className="flex items-center gap-1">
            <Star size={12} fill="currentColor" className="text-amber-400" />
            <span className="text-xs font-bold">{post.rating}/5</span>
          </div>
        )}
      </div>
    </div>
  );
}
