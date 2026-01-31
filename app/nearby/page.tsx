"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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

  const sortedCategories = useMemo(() => {
    return Object.keys(postsByCategory).sort(
      (a, b) => (postsByCategory[b]?.length ?? 0) - (postsByCategory[a]?.length ?? 0)
    );
  }, [postsByCategory]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-pink-100">
      <main className="px-6 py-8">
        {loading && <p className="text-sm text-zinc-500 mb-6">Loading posts…</p>}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Error loading posts:</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

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
                <div className="h-8 flex items-center px-1">
                  <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                    {category}
                  </span>
                </div>

                {posts.slice(0, 2).map((post) => (
                  <PostCard key={post.id} post={post} colourClass={colour} />
                ))}

                {posts.length === 1 ? <PlaceholderCard colourClass={colour} /> : null}
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

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

      {(post.caption || post.rating != null) && (
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
