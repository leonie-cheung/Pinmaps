"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Grid, Bookmark, ChevronLeft, Camera, LogOut, MapPin, Star } from "lucide-react";

export default function ProfilePage() {
    const [session, setSession] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchProfileAndPosts(session.user.id);
            else setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchProfileAndPosts(session.user.id);
            else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchProfileAndPosts(userId: string) {
        setLoading(true);

        // 1. Fetch Profile Info
        const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

        // 2. Fetch ONLY posts belonging to the logged-in user
        const { data: postsData } = await supabase
            .from("posts")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        setProfile(profileData);
        setUserPosts(postsData || []);
        setLoading(false);
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-zinc-400 font-black uppercase tracking-widest animate-pulse">
                Loading your vibe...
            </div>
        );
    }

    if (!session) return <AuthUI />;

    if (isEditing) {
        return (
            <EditProfileView
                profile={profile}
                onBack={() => setIsEditing(false)}
                onUpdate={() => {
                    fetchProfileAndPosts(session.user.id);
                    window.dispatchEvent(new Event("profileUpdated"));
                }}
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 pt-12 pb-24 text-zinc-900 animate-in fade-in duration-500">
            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 relative">
                <button
                    onClick={handleLogout}
                    className="absolute top-0 right-0 p-3 bg-zinc-50 hover:bg-rose-50 text-zinc-300 hover:text-rose-500 rounded-2xl transition-all border border-zinc-100"
                >
                    <LogOut size={20} />
                </button>

                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-zinc-50 shadow-sm bg-zinc-100">
                    <img
                        src={
                            profile?.avatar_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                profile?.username || "U"
                            )}&background=f4f4f5&color=a1a1aa`
                        }
                        className="w-full h-full object-cover"
                        alt="avatar"
                    />
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <h1 className="text-3xl font-black tracking-tighter">{profile?.username || "Viber"}</h1>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-zinc-900 text-white hover:bg-zinc-800 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Edit Profile
                        </button>
                    </div>

                    <div className="flex justify-center md:justify-start gap-8 text-sm">
                        <span className="text-zinc-400 font-medium">
                          <strong className="text-zinc-900 font-black">{userPosts.length}</strong> posts
                        </span>
                        <span className="text-zinc-400 font-medium">
                          <strong className="text-zinc-900 font-black">128</strong> friends
                        </span>
                    </div>

                    <div className="max-w-xs mx-auto md:mx-0">
                        <p className="font-bold text-sm text-zinc-800">{profile?.full_name}</p>
                        <p className="text-sm text-zinc-500 leading-relaxed italic">
                            {profile?.bio || "No bio yet ✨"}
                        </p>
                    </div>
                </div>
            </header>

            {/* --- TABS --- */}
            <div className="border-t border-zinc-100 flex justify-center gap-12 mb-10">
                <button className="flex items-center gap-2 pt-4 border-t-2 border-zinc-900 -mt-[2px] text-[10px] font-black uppercase tracking-[0.2em]">
                    <Grid size={14} /> My Posts
                </button>
                <button className="flex items-center gap-2 pt-4 text-zinc-300 text-[10px] font-black uppercase tracking-[0.2em] hover:text-zinc-900 transition-colors">
                    <Bookmark size={14} /> Saved
                </button>
            </div>

            {/* --- POST GRID --- */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {userPosts.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-100 rounded-[3rem]">
                        <p className="text-zinc-300 font-black uppercase tracking-widest text-[10px]">Your feed is empty</p>
                    </div>
                ) : (
                    userPosts.map((post: any) => (
                        <div
                            key={post.id}
                            className="group relative aspect-[3/4] bg-zinc-50 overflow-hidden rounded-[2.5rem] border border-zinc-100 shadow-sm transition-all duration-500 hover:shadow-2xl cursor-pointer"
                        >
                            <img
                                src={post.image_url}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000"
                                alt="post"
                            />
                            {/* Hover info overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                                    <Star size={14} fill="currentColor" className="text-amber-400" />
                                    <span className="font-black text-sm">{post.rating}/5</span>
                                </div>
                                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-white/80">{post.category}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

/* ---------------- AUTHENTICATION VIEW ---------------- */

function AuthUI() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username, full_name: username } },
            });
            if (error) alert(error.message);
            else alert("Check your email for confirmation!");
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) alert(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
            <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-sm border border-zinc-100">
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-zinc-900 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                        <MapPin className="text-white" size={32} />
                    </div>
                    <h2 className="text-4xl font-black text-zinc-900 tracking-tighter">
                        {isSignUp ? "Join Us" : "Welcome"}
                    </h2>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {isSignUp && (
                        <input
                            placeholder="Username"
                            className="w-full p-4 bg-zinc-50 rounded-2xl border border-transparent focus:bg-white focus:border-zinc-200 outline-none transition-all"
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-4 bg-zinc-50 rounded-2xl border border-transparent focus:bg-white focus:border-zinc-200 outline-none transition-all"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-4 bg-zinc-50 rounded-2xl border border-transparent focus:bg-white focus:border-zinc-200 outline-none transition-all"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:shadow-xl transition-all active:scale-95">
                        {isSignUp ? "Sign Up" : "Sign In"}
                    </button>
                </form>

                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full mt-6 text-xs text-zinc-400 font-black uppercase tracking-widest hover:text-zinc-900 transition-colors"
                >
                    {isSignUp ? "Already have an account? Log in" : "New here? Create account"}
                </button>
            </div>
        </div>
    );
}

/* ---------------- EDIT PROFILE VIEW ---------------- */

function EditProfileView({ profile, onBack, onUpdate }: any) {
    const [formData, setFormData] = useState(profile);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const save = async () => {
        setSaving(true);
        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: formData.full_name,
                bio: formData.bio,
                avatar_url: formData.avatar_url,
            })
            .eq("id", profile.id);

        if (error) alert(error.message);
        else {
            onUpdate();
            onBack();
        }
        setSaving(false);
    };

    return (
        <div className="max-w-2xl mx-auto px-6 py-12 bg-white min-h-screen animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center justify-between mb-12">
                <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-sm font-black uppercase tracking-widest">Edit Profile</h1>
                <button onClick={save} disabled={saving || uploading} className="text-zinc-900 font-black text-xs uppercase tracking-widest">
                    {saving ? "..." : "Done"}
                </button>
            </div>

            <div className="space-y-8">
                <div className="flex flex-col items-center gap-6">
                    <img
                        src={formData?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData?.username || "U")}`}
                        className="w-32 h-32 rounded-full object-cover border-4 border-zinc-50 shadow-sm bg-zinc-100"
                        alt="edit-avatar"
                    />
                    <label className="cursor-pointer bg-zinc-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Change Photo
                        <input type="file" className="hidden" accept="image/*" disabled={uploading} />
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-2">Display Name</label>
                    <input
                        className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 outline-none font-bold"
                        value={formData?.full_name || ""}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-2">Bio</label>
                    <textarea
                        className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 outline-none resize-none font-medium h-32"
                        value={formData?.bio || ""}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                </div>

                <button
                    onClick={save}
                    disabled={saving}
                    className="w-full bg-zinc-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}