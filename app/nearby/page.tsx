"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { X, Star } from "lucide-react";

type PostRow = {
  id: string;
  category: string;
  image_url: string | null;
  caption: string | null;
  rating: number | null;
  hashtags: string[] | null;
  created_at: string;
  user_id: string;
};

export default function ExplorePage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null);

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
        setPosts(data as PostRow[] ?? []);
      }
      setLoading(false);
    }
    loadPosts();
  }, []);

  return (
      <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-pink-100">
        <main className="px-6 md:px-10 py-8">

          {loading && (
              <p className="text-sm text-zinc-500 mb-6 animate-pulse uppercase tracking-widest font-black">Loading feed…</p>
          )}

          {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-medium">Error loading posts:</p>
                <p className="mt-1">{error}</p>
              </div>
          )}

          {/* Clean Grid Layout - No Trending Bar */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {posts.length === 0 && !loading && !error ? (
                <div className="col-span-full text-center py-20 text-sm text-zinc-400 font-bold uppercase tracking-widest">
                  No posts found.
                </div>
            ) : (
                posts.map((post) => (
                    <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                ))
            )}
          </div>

          {/* --- LIGHTBOX MODAL --- */}
          {selectedPost && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-xl p-4 md:p-10 animate-in fade-in duration-300">
                <button
                    onClick={() => setSelectedPost(null)}
                    className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors z-50"
                >
                  <X size={24} />
                </button>

                <div className="max-w-5xl w-full h-full flex flex-col md:flex-row gap-8 items-center justify-center">
                  {/* Image Side */}
                  <div className="flex-1 h-full max-h-[80vh] relative">
                    <img
                        src={selectedPost.image_url || ""}
                        className="w-full h-full object-contain rounded-3xl shadow-2xl"
                        alt=""
                    />
                  </div>

                  {/* Info Side */}
                  <div className="w-full md:w-80 flex flex-col gap-4">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                      {selectedPost.category}
                    </span>
                    <h2 className="text-3xl font-black leading-tight">
                      {selectedPost.caption}
                    </h2>
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

function PostCard({ post, onClick }: { post: PostRow; onClick: () => void }) {
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

        {/* Hover Overlay: Only show text on hover */}
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 block mb-2">
            {post.category || "General"}
          </span>
          {post.caption && <p className="text-base font-bold line-clamp-2 mb-2 leading-tight">{post.caption}</p>}
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