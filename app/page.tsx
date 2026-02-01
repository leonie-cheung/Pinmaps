"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Sparkles, RefreshCw, X, Star } from "lucide-react";

type PostRow = {
  id: string;
  category: string;
  image_url: string | null;
  caption: string | null;
  rating: number | null;
  hashtags: string[] | null;
  created_at: string;
};

export default function Page() {
  const [allPosts, setAllPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null);

  // Trending terms
  const TRENDING_KEYWORDS = ["Cafe", "Bar", "Aesthetic", "Vintage", "Brunch", "Hidden Gem", "Date Night", "Interior", "Exhibition", "Cocktails", "Coffee", "Bakery", "Rooftop", "Cozy", "Modern", "Minimalist", "Neon", "Speakeasy"];

  const shuffleSuggestions = () => {
    setSuggestions([...TRENDING_KEYWORDS].sort(() => 0.5 - Math.random()).slice(0, 15));
  };

  useEffect(() => {
    shuffleSuggestions();
    const updateSearch = () => {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get("q") || "");
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
      const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (data) setAllPosts(data as PostRow[]);
      setLoading(false);
    }
    load();
  }, []);

  const handleSuggestionClick = (term: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("q", term);
    window.history.replaceState(null, "", `?${params.toString()}`);
    window.dispatchEvent(new Event("searchChange"));
  };

  const filteredPosts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return allPosts.filter(post =>
        !query || post.caption?.toLowerCase().includes(query) || post.category?.toLowerCase().includes(query)
    );
  }, [allPosts, searchQuery]);

  return (
      <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-pink-100">
        <main className="px-6 md:px-10 py-8">

          {/* Trending Bar */}
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-zinc-400">
                <Sparkles size={18} />
                <h3 className="text-sm font-black uppercase tracking-[0.3em]">Trending</h3>
              </div>
              <button onClick={shuffleSuggestions} className="text-zinc-300 hover:text-zinc-900 transition-colors">
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {suggestions.map((term) => (
                  <button
                      key={term}
                      onClick={() => handleSuggestionClick(term)}
                      className={`px-5 py-2 rounded-full text-sm font-bold border transition-all ${
                          searchQuery.toLowerCase() === term.toLowerCase() ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 border-zinc-100 hover:border-zinc-300'
                      }`}
                  >
                    {term}
                  </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
            ))}
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
                  <div className="flex-1 h-full max-h-[80vh] relative group">
                    <img
                        src={selectedPost.image_url || ""}
                        className="w-full h-full object-contain rounded-3xl shadow-2xl"
                        alt=""
                    />
                  </div>
                  <div className="w-full md:w-80 flex flex-col gap-4">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">{selectedPost.category}</span>
                    <h2 className="text-3xl font-black leading-tight">{selectedPost.caption}</h2>
                    {selectedPost.rating && (
                        <div className="flex items-center gap-2 text-xl font-bold">
                          <Star size={20} fill="currentColor" className="text-amber-400" />
                          {selectedPost.rating}/5
                        </div>
                    )}
                    <p className="text-zinc-500 text-sm mt-4 italic">Posted on {new Date(selectedPost.created_at).toLocaleDateString()}</p>
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
          className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden bg-zinc-50 border border-zinc-100 group cursor-zoom-in transition-all duration-500 hover:shadow-2xl"
      >
        {post.image_url ? (
            <img src={post.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs">No Image</div>
        )}

        {/* Hover Overlay: Slides up from bottom */}
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 block mb-2">{post.category}</span>
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