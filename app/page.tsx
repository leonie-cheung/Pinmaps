"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Optional: keep your colour vibes by category
const CATEGORY_COLOURS: Record<string, string> = {
  Cafe: "bg-amber-100/50",
  Restaurant: "bg-blue-100/50",
  Bar: "bg-zinc-200/50",
  Exhibition: "bg-emerald-100/50",
  "Weekend trip": "bg-rose-100/50",
  Bakery: "bg-orange-50/50",
  Museum: "bg-indigo-50/50",
  Brunch: "bg-yellow-50/50",
};

type PostRow = {
  id: string;
  category: string;
  image_url: string | null;
  caption: string | null;
  rating: number | null;
  hashtags: string[] | null;
  created_at: string;
};

type PostsByCategory = Record<string, PostRow[]>;

export default function Page() {
  const [activeTab, setActiveTab] = useState("Explore");
  const navItems = ["Friends", "Explore", "Nearby", "Map"];

  const [postsByCategory, setPostsByCategory] = useState<PostsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("posts")
        .select("id,category,image_url,caption,rating,hashtags,created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const grouped: PostsByCategory = {};
      for (const post of (data as PostRow[]) ?? []) {
        const cat = post.category ?? "Other";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(post);
      }

      setPostsByCategory(grouped);
      setLoading(false);
    }

    load();
  }, []);

  // Sort categories by number of posts (so it looks populated)
  const sortedCategories = useMemo(() => {
    return Object.keys(postsByCategory).sort(
      (a, b) => (postsByCategory[b]?.length ?? 0) - (postsByCategory[a]?.length ?? 0)
    );
  }, [postsByCategory]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-pink-100">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-sm shadow-pink-200">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`text-xl font-medium transition-all relative py-1 ${
                activeTab === item ? "text-black" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {item}
              {activeTab === item && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Search & User Profile (UI only for now) */}
        <div className="flex items-center gap-4">
          <button className="w-12 h-12 border-2 border-dashed border-zinc-300 rounded-xl flex items-center justify-center hover:border-zinc-400 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-500"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-100 p-0.5">
            <div className="w-full h-full bg-yellow-100 rounded-full flex items-center justify-center text-xs font-bold text-yellow-700">
              U
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-6 py-8">
        {/* Status messages */}
        {loading && <p className="text-sm text-zinc-500 mb-6">Loading posts…</p>}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Error loading posts:</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-red-600">
              Common causes: RLS still ON, wrong Supabase keys, or you didn’t restart the dev server
              after editing .env.local.
            </p>
          </div>
        )}

        {/* Horizontal categories */}
        <div className="flex overflow-x-auto gap-8 pb-12 no-scrollbar">
          {sortedCategories.length === 0 && !loading && !error ? (
            <div className="text-sm text-zinc-500">
              No posts yet. Seed some rows in Supabase or create a post.
            </div>
          ) : null}

          {sortedCategories.map((category) => {
            const colour = CATEGORY_COLOURS[category] ?? "bg-zinc-50";
            const posts = postsByCategory[category] ?? [];

            return (
              <div key={category} className="flex-shrink-0 w-64 md:w-72 flex flex-col gap-4">
                {/* Category Title */}
                <div className="h-8 flex items-center px-1">
                  <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                    {category}
                  </span>
                </div>

                {/* Show up to 2 posts per category (like your layout) */}
                {posts.slice(0, 2).map((post) => (
                  <PostCard key={post.id} post={post} colourClass={colour} />
                ))}

                {/* If a category has only 1 post, show a placeholder to keep the layout balanced */}
                {posts.length === 1 ? <PlaceholderCard colourClass={colour} /> : null}
              </div>
            );
          })}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-full flex items-center gap-8 shadow-2xl">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setActiveTab(item)}
            className={`text-sm font-medium transition-colors ${
              activeTab === item ? "text-white" : "text-zinc-500"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}

function PostCard({
  post,
  colourClass,
}: {
  post: PostRow;
  colourClass: string;
}) {
  return (
    <div
      className={`relative w-full aspect-[2/3.5] rounded-3xl overflow-hidden border border-zinc-100/50 shadow-sm group hover:shadow-md transition-shadow cursor-pointer ${colourClass}`}
      title={post.caption ?? ""}
    >
      {post.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image_url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center">
            <span className="text-zinc-400 font-light text-xl">+</span>
          </div>
        </div>
      )}

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

      {/* Caption strip */}
      {(post.caption || post.rating) && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur p-3">
          {post.caption && <p className="text-sm font-medium text-zinc-900">{post.caption}</p>}
          {post.rating != null && <p className="text-xs text-zinc-600 mt-1">{post.rating}/5</p>}
        </div>
      )}
    </div>
  );
}

function PlaceholderCard({ colourClass }: { colourClass: string }) {
  return (
    <div
      className={`relative w-full aspect-[2/3.5] rounded-3xl overflow-hidden border border-zinc-100/50 shadow-sm ${colourClass}`}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center">
          <span className="text-zinc-400 font-light text-xl">+</span>
        </div>
      </div>
    </div>
  );
}
