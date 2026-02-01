"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type TabKey = "Friends" | "Explore" | "Nearby" | "Map";
type MenuKey = "Profile" | "Save" | "Post" | "Settings";

const NAV_ITEMS: { label: TabKey; href: string }[] = [
    { label: "Friends", href: "/friends" },
    { label: "Explore", href: "/" },
    { label: "Nearby", href: "/nearby" },
    { label: "Map", href: "/map" },
];

const DROPDOWN_ITEMS: { label: MenuKey; href: string }[] = [
    { label: "Profile", href: "/profile" },
    { label: "Save", href: "/save" },
    { label: "Post", href: "/post" },
    { label: "Settings", href: "/settings" },
];

function isActive(pathname: string, href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
}

export default function Header() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    // keep searchValue synced to URL
    useEffect(() => {
        const query = searchParams.get("q") || "";
        setSearchValue(query);
        if (query && !isSearchOpen) setIsSearchOpen(true);
    }, [searchParams, isSearchOpen]);

    // focus search input
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) searchInputRef.current.focus();
    }, [isSearchOpen]);

    // close dropdown/search on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                setIsDropdownOpen(false);
            }
            if (
                isSearchOpen &&
                searchInputRef.current &&
                !searchInputRef.current.contains(target) &&
                !searchValue
            ) {
                setIsSearchOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSearchOpen, searchValue]);

    // fetch avatar + refresh when profileUpdated fires
    useEffect(() => {
        async function loadAvatar() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            const userId = session?.user?.id;
            if (!userId) {
                setAvatarUrl(null);
                return;
            }

            const { data } = await supabase
                .from("profiles")
                .select("avatar_url")
                .eq("id", userId)
                .maybeSingle();

            setAvatarUrl(data?.avatar_url ?? null);
        }

        loadAvatar();

        const handler = () => loadAvatar();
        window.addEventListener("profileUpdated", handler);
        return () => window.removeEventListener("profileUpdated", handler);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchValue(val);

        const params = new URLSearchParams(window.location.search);
        if (val) params.set("q", val);
        else params.delete("q");

        const newRelativePathQuery = window.location.pathname + "?" + params.toString();
        window.history.replaceState(null, "", newRelativePathQuery);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-white px-6 md:px-10 py-6 flex items-center justify-between transition-all border-b border-zinc-100">
                {/* Logo */}
                <Link
                    href={searchValue ? `/?q=${encodeURIComponent(searchValue)}` : "/"}
                    className={`flex items-center gap-2 transition-opacity ${
                        isSearchOpen ? "max-md:hidden" : "opacity-100"
                    }`}
                >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1.25rem] bg-white border border-zinc-100 shadow-lg shadow-zinc-200 flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/favicon.ico"
                            alt="Logo"
                            className="w-7 h-7 md:w-8 md:h-8 object-contain"
                        />
                    </div>
                </Link>

                {/* Desktop nav */}
                {!isSearchOpen && (
                    <nav className="hidden md:flex items-center gap-10 lg:gap-14 animate-in fade-in duration-300">
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(pathname, item.href);
                            const hrefWithQuery = searchValue
                                ? `${item.href}${item.href.includes("?") ? "&" : "?"}q=${encodeURIComponent(
                                    searchValue
                                )}`
                                : item.href;

                            return (
                                <Link
                                    key={item.label}
                                    href={hrefWithQuery}
                                    className={`text-xl font-semibold transition-all relative py-2 ${
                                        active ? "text-black" : "text-zinc-400 hover:text-zinc-600"
                                    }`}
                                >
                                    {item.label}
                                    {active && (
                                        <span className="absolute bottom-0 left-0 w-full h-1 bg-black rounded-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                )}

                {/* Search + Profile */}
                <div
                    className={`flex items-center gap-4 md:gap-6 transition-all ${
                        isSearchOpen ? "flex-1 justify-end ml-4 md:ml-10" : ""
                    }`}
                >
                    {/* Search bar */}
                    <div
                        className={`relative flex items-center transition-all duration-300 ease-out ${
                            isSearchOpen ? "w-full max-w-xl" : "w-12 md:w-14"
                        }`}
                    >
                        {isSearchOpen ? (
                            <div className="relative w-full group">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search keywords..."
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    className="w-full h-12 md:h-14 pl-12 md:pl-14 pr-10 bg-zinc-50 border border-zinc-200 rounded-2xl text-base md:text-lg font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all"
                                />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                                >
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                                <button
                                    onClick={() => {
                                        setIsSearchOpen(false);
                                        setSearchValue("");
                                        const params = new URLSearchParams(window.location.search);
                                        params.delete("q");
                                        window.history.replaceState(
                                            null,
                                            "",
                                            window.location.pathname + "?" + params.toString()
                                        );
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-2"
                                    aria-label="Close search"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M18 6 6 18" />
                                        <path d="m6 6 12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="w-12 h-12 md:w-14 md:h-14 border border-zinc-200 rounded-2xl flex items-center justify-center hover:bg-zinc-50 transition-colors group"
                                aria-label="Open search"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-zinc-500 group-hover:text-zinc-800"
                                >
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Profile dropdown */}
                    <div className="relative flex-shrink-0" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen((v) => !v)}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 transition-all p-0.5 active:scale-95 ${
                                isDropdownOpen ? "border-pink-500" : "border-zinc-100"
                            }`}
                            aria-label="Profile menu"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={
                                    avatarUrl ||
                                    "https://ui-avatars.com/api/?name=U&background=f4f4f5&color=a1a1aa"
                                }
                                alt="avatar"
                                className="w-full h-full object-cover rounded-full"
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-4 w-56 bg-white border border-zinc-100 rounded-2xl shadow-2xl py-2 z-[60] animate-in fade-in zoom-in duration-200 origin-top-right">
                                {DROPDOWN_ITEMS.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="block w-full text-left px-5 py-3 text-base font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-black transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ))}

                                <div className="my-1 border-t border-zinc-100" />

                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-5 py-3 text-base font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile nav */}
            <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-10 py-5 rounded-full flex items-center gap-10 shadow-2xl z-50">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(pathname, item.href);
                    const hrefWithQuery = searchValue
                        ? `${item.href}${item.href.includes("?") ? "&" : "?"}q=${encodeURIComponent(
                            searchValue
                        )}`
                        : item.href;

                    return (
                        <Link
                            key={item.label}
                            href={hrefWithQuery}
                            className={`text-sm font-bold transition-colors ${
                                active ? "text-white" : "text-zinc-500"
                            }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
