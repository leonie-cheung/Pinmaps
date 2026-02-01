"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Grid, Bookmark, ChevronLeft, Camera, LogOut, MapPin } from "lucide-react";

export default function ProfilePage() {
    const [session, setSession] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchProfileAndPosts(session.user.id);
            else setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
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

        // safer than .single() if row might not exist
        const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

        const { data: postsData } = await supabase
            .from("posts")
            .select("*")
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
            <div className="h-screen flex items-center justify-center text-zinc-400 font-medium">
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
            <header className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 relative">
                <button
                    onClick={handleLogout}
                    className="absolute top-0 right-0 p-3 bg-zinc-50 hover:bg-rose-50 text-zinc-400 hover:text-rose-500 rounded-2xl transition-all border border-zinc-100"
                >
                    <LogOut size={20} />
                </button>

                <div className="w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-zinc-50 shadow-sm bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                        <h1 className="text-2xl font-bold tracking-tight">{profile?.username}</h1>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-zinc-100 hover:bg-zinc-200 px-6 py-2 rounded-xl text-sm font-semibold transition-all"
                        >
                            Edit Profile
                        </button>
                    </div>

                    <div className="flex justify-center md:justify-start gap-8 text-sm text-zinc-600">
            <span>
              <strong>{userPosts.length}</strong> posts
            </span>
                        <span>
              <strong>128</strong> friends
            </span>
                    </div>

                    <div className="max-w-xs mx-auto md:mx-0">
                        <p className="font-bold text-sm">{profile?.full_name}</p>
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            {profile?.bio || "No bio yet ✨"}
                        </p>
                    </div>
                </div>
            </header>

            <div className="border-t border-zinc-100 flex justify-center gap-12 mb-8">
                <button className="flex items-center gap-2 pt-4 border-t-2 border-zinc-900 -mt-[2px] text-xs font-bold uppercase tracking-widest">
                    <Grid size={14} /> My Collages
                </button>
                <button className="flex items-center gap-2 pt-4 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    <Bookmark size={14} /> Saved
                </button>
            </div>

            <div className="grid grid-cols-3 gap-1 md:gap-4">
                {userPosts.map((post: any) => (
                    <div
                        key={post.id}
                        className="relative aspect-square bg-zinc-100 overflow-hidden rounded-md md:rounded-2xl group cursor-pointer"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={post.image_url}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                            alt="post"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-bold">
                            ⭐ {post.rating}/5
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------------- Auth UI ---------------- */

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
            <div className="w-full max-w-md bg-white p-10 rounded-[48px] shadow-sm border border-zinc-100">
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-pink-100 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                        <MapPin className="text-pink-500" size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight">
                        {isSignUp ? "Join Us" : "Welcome Back"}
                    </h2>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {isSignUp && (
                        <input
                            placeholder="Username"
                            className="w-full p-4 bg-zinc-50 rounded-2xl border border-transparent focus:bg-white focus:border-pink-200 outline-none transition-all"
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-4 bg-zinc-50 rounded-2xl border border-transparent focus:bg-white focus:border-pink-200 outline-none transition-all"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-4 bg-zinc-50 rounded-2xl border border-transparent focus:bg-white focus:border-pink-200 outline-none transition-all"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95">
                        {isSignUp ? "Create Account" : "Sign In"}
                    </button>
                </form>

                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full mt-6 text-sm text-zinc-400 font-medium hover:text-zinc-600"
                >
                    {isSignUp ? "Already have an account? Log in" : "New here? Create an account"}
                </button>
            </div>
        </div>
    );
}

/* ---------------- Edit Profile (with upload) ---------------- */

function EditProfileView({ profile, onBack, onUpdate }: any) {
    const [formData, setFormData] = useState(profile);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    async function uploadAvatar(file: File) {
        setUploading(true);
        try {
            const ext = file.name.split(".").pop() || "jpg";
            const fileName = `${profile.id}-${Date.now()}.${ext}`;
            const filePath = `${profile.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: true,
                    contentType: file.type,
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            setFormData((prev: any) => ({ ...prev, avatar_url: publicUrl }));
            return publicUrl;
        } finally {
            setUploading(false);
        }
    }

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
        <div className="max-w-2xl mx-auto px-6 py-12 bg-white min-h-screen animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-12">
                <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>

                <h1 className="text-lg font-bold">Edit Profile</h1>

                <button onClick={save} disabled={saving || uploading} className="text-pink-500 font-bold text-sm">
                    {saving ? "..." : "Done"}
                </button>
            </div>

            <div className="space-y-8">
                {/* Avatar uploader */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={
                                formData?.avatar_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(formData?.username || "U")}`
                            }
                            className="w-28 h-28 rounded-full object-cover border-4 border-zinc-50 bg-zinc-100"
                            alt="edit-avatar"
                        />

                        <label className="absolute -bottom-2 left-1/2 -translate-x-1/2 cursor-pointer">
                            <div className="px-4 py-2 rounded-2xl bg-zinc-900 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
                                <Camera size={16} />
                                {uploading ? "Uploading…" : "Change photo"}
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploading}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    if (file.size > 5 * 1024 * 1024) {
                                        alert("Please pick an image under 5MB.");
                                        return;
                                    }

                                    try {
                                        await uploadAvatar(file);
                                    } catch (err: any) {
                                        alert(err?.message ?? "Upload failed");
                                    }
                                }}
                            />
                        </label>
                    </div>

                    <p className="text-xs text-zinc-400 font-medium">JPG/PNG, up to ~5MB</p>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">
                        Display Name
                    </label>
                    <input
                        className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 focus:bg-white outline-none"
                        value={formData?.full_name || ""}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">
                        Bio
                    </label>
                    <textarea
                        className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 focus:bg-white outline-none resize-none"
                        rows={4}
                        value={formData?.bio || ""}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                </div>

                <button
                    onClick={save}
                    disabled={saving || uploading}
                    className="w-full bg-zinc-900 text-white py-5 rounded-3xl font-black shadow-xl shadow-zinc-200 disabled:opacity-50"
                >
                    {saving ? "Saving…" : uploading ? "Uploading…" : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
