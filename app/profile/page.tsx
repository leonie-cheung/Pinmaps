"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { MapPin, Settings, Grid, Bookmark, UserPlus } from "lucide-react"; // Install lucide-react for icons

export default function ProfilePage() {
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data for the "Instagram" feel - replace with real auth data
    const user = {
        username: "aesthetic_explorer",
        full_name: "Alex River",
        bio: "Searching for the best matcha & hidden art galleries 🍵✨",
        followers: 1240,
        following: 850,
        profile_pic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    };

    useEffect(() => {
        async function fetchUserPosts() {
            // Assuming you have a 'user_id' column to filter by
            const { data, error } = await supabase
                .from("posts")
                .select("*")
                .order("created_at", { ascending: false });
            // .eq('user_id', currentUserId) // Add this when auth is ready

            if (!error) setUserPosts(data || []);
            setLoading(false);
        }
        fetchUserPosts();
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-20 text-zinc-900">
            {/* --- Profile Header --- */}
            <header className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
                <div className="relative w-24 h-24 md:w-40 md:h-40">
                    <img
                        src={user.profile_pic}
                        className="rounded-full w-full h-full object-cover border-4 border-zinc-50 shadow-sm"
                        alt="Profile"
                    />
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <h1 className="text-xl font-semibold tracking-tight">{user.username}</h1>
                        <div className="flex gap-2 justify-center">
                            <button className="bg-zinc-100 hover:bg-zinc-200 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                Edit Profile
                            </button>
                            <button className="bg-zinc-100 hover:bg-zinc-200 p-2 rounded-lg transition-colors">
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center md:justify-start gap-8 text-sm">
                        <span><strong>{userPosts.length}</strong> posts</span>
                        <span><strong>{user.followers}</strong> followers</span>
                        <span><strong>{user.following}</strong> following</span>
                    </div>

                    <div className="max-w-xs mx-auto md:mx-0">
                        <p className="font-semibold text-sm">{user.full_name}</p>
                        <p className="text-sm text-zinc-600 leading-relaxed">{user.bio}</p>
                    </div>
                </div>
            </header>

            {/* --- Tabs Selection --- */}
            <div className="border-t border-zinc-100 flex justify-center gap-12 mb-6">
                <button className="flex items-center gap-2 pt-4 border-t border-black -mt-[1px] text-xs font-bold uppercase tracking-widest">
                    <Grid size={14} /> Posts
                </button>
                <button className="flex items-center gap-2 pt-4 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-zinc-600">
                    <Bookmark size={14} /> Saved
                </button>
            </div>

            {/* --- Collage Grid --- */}
            {loading ? (
                <div className="text-center py-20 text-zinc-400">Loading your memories...</div>
            ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                    {userPosts.map((post) => (
                        <div
                            key={post.id}
                            className="group relative aspect-square bg-zinc-100 overflow-hidden rounded-sm md:rounded-xl cursor-pointer"
                        >
                            {post.image_url ? (
                                <img
                                    src={post.image_url}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt={post.caption}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300 italic text-xs">
                                    No Image
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                                <span className="flex items-center gap-1">⭐ {post.rating}</span>
                                <span className="flex items-center gap-1 text-[10px] bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                  {post.category}
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {userPosts.length === 0 && !loading && (
                <div className="text-center py-20 border-2 border-dashed border-zinc-100 rounded-3xl">
                    <p className="text-zinc-400">No posts yet. Start exploring!</p>
                </div>
            )}
        </div>
    );
}