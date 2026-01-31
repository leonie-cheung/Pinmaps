"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSearchParams } from "next/navigation";

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
  const [allPosts, setAllPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync with global search query via URL and custom events
  useEffect(() => {
    const updateSearch = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        setSearchQuery(params.get("q") || "");
      }
    };

    updateSearch();
    window.addEventListener("searchChange", updateSearch);
    window.addEventListener("popstate", updateSearch);
    
    return () => {
      window.removeEventListener("searchChange", updateSearch);
      window.removeEventListener("popstate", updateSearch);
    };
  }, []);

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

      setAllPosts((data as PostRow[]) ?? []);
      setLoading(false);
    }

    load();
  }, []);

  const postsByCategory = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = allPosts.filter(post => {
      if (!query) return true;
      const inCaption = post.caption?.toLowerCase().includes(query);
      const inCategory = post.category?.toLowerCase().includes(query);
      const inHashtags = post.hashtags?.some(tag => tag.toLowerCase().includes(query));
      return inCaption || inCategory || inHashtags;
    });

    const grouped: PostsByCategory = {};
    for (const post of filtered) {
      const cat = post.category ?? "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(post);
    }
    return grouped;
  }, [allPosts, searchQuery]);

  const sortedCategories = useMemo(() => {
    return Object.keys(postsByCategory).sort(
      (a, b) => (postsByCategory[b]?.length ?? 0) - (postsByCategory[a]?.length ?? 0)
    );
  }, [postsByCategory]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-pink-100">
      <main className="px-10 py-8">
        {loading && <p className="text-sm text-zinc-500 mb-6">Loading posts…</p>}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Error loading posts:</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {searchQuery && !loading && (
          <div className="mb-10 animate-in fade-in slide-in-from-left-4">
            <h2 className="text-3xl font-black tracking-tight text-zinc-900">
              Results for <span className="text-zinc-400">"{searchQuery}"</span>
            </h2>
            <p className="text-zinc-500 font-medium mt-1">Found matching posts in {sortedCategories.length} categories.</p>
          </div>
        )}

        <div className="flex overflow-x-auto gap-10 pb-12 no-scrollbar">
          {sortedCategories.length === 0 && !loading && !error ? (
            <div className="text-2xl text-zinc-300 font-bold py-20 px-2">
              {searchQuery ? "No matches found." : "No posts yet."}
            </div>
          ) : null}

          {sortedCategories.map((category) => {
            const colour = CATEGORY_COLOURS[category] ?? "bg-zinc-50";
            const posts = postsByCategory[category] ?? [];

            return (
              <div key={category} className="flex-shrink-0 w-72 md:w-80 flex flex-col gap-6">
                <div className="h-8 flex items-center px-1">
                  <span className="text-lg font-bold text-zinc-400 uppercase tracking-widest">
                    {category}
                  </span>
                </div>

                {posts.map((post) => (
                  <PostCard key={post.id} post={post} colourClass={colour} />
                ))}
              </div>
            );
          })}
        </div>
      </main>

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

function PostCard({ post, colourClass }: { post: PostRow; colourClass: string }) {
  return (
    <div
      className={`relative w-full aspect-[2/3] rounded-[2rem] overflow-hidden border border-zinc-100 shadow-sm group hover:shadow-2xl transition-all duration-300 cursor-pointer ${colourClass}`}
    >
      {post.image_url ? (
        <img src={post.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-200 flex items-center justify-center">
            <span className="text-zinc-400 font-light text-2xl">+</span>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

      {(post.caption || post.rating != null) && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-6 border-t border-zinc-50/50">
          {post.caption && <p className="text-base font-bold text-zinc-900 line-clamp-2 leading-tight">{post.caption}</p>}
          {post.rating != null && <p className="text-xs font-black text-zinc-400 mt-2 tracking-widest uppercase">{post.rating}/5 RATING</p>}
        </div>
      )}
    </div>
  );
}