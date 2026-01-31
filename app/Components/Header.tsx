"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Mocking Supabase and Next.js hooks for the preview environment
 * In your local project, these imports will come from 'next/link', 'next/navigation' etc.
 */
const Link = ({ href, children, className, onClick, ...props }: any) => (
    <a href={href} className={className} onClick={onClick} {...props}>{children}</a>
);

const usePathname = () => {
    const [pathname, setPathname] = useState(typeof window !== "undefined" ? window.location.pathname : "/");
    useEffect(() => {
        const handleLocationChange = () => setPathname(window.location.pathname);
        window.addEventListener("popstate", handleLocationChange);
        return () => window.removeEventListener("popstate", handleLocationChange);
    }, []);
    return pathname;
};

const useSearchParams = () => {
    const [params, setParams] = useState(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''));
    useEffect(() => {
        const updateParams = () => setParams(new URLSearchParams(window.location.search));
        window.addEventListener("popstate", updateParams);
        window.addEventListener("searchChange", updateParams);
        return () => {
            window.removeEventListener("popstate", updateParams);
            window.removeEventListener("searchChange", updateParams);
        };
    }, []);
    return params;
};

const supabase = {
    auth: {
        signOut: async () => ({ error: null })
    }
};

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

    // --- State Management ---
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
    
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    // --- Effects ---

    // Sync state if URL query changes (Sticky Search)
    useEffect(() => {
        const query = searchParams.get("q") || "";
        setSearchValue(query);
        if (query && !isSearchOpen) {
            setIsSearchOpen(true);
        }
    }, [searchParams, isSearchOpen]);

    // Focus input when search bar expands
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Handle clicks outside dropdown or search bar
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                setIsDropdownOpen(false);
            }
            if (isSearchOpen && searchInputRef.current && !searchInputRef.current.contains(target) && !searchValue) {
                setIsSearchOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSearchOpen, searchValue]);

    // --- Handlers ---

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchValue(val);
        
        const params = new URLSearchParams(window.location.search);
        if (val) {
            params.set("q", val);
        } else {
            params.delete("q");
        }
        
        const newRelativePathQuery = window.location.pathname + '?' + params.toString();
        if (typeof window !== "undefined") {
            window.history.replaceState(null, '', newRelativePathQuery);
            window.dispatchEvent(new Event("searchChange"));
        }
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            window.location.href = "/login";
        }
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-white px-6 md:px-10 py-6 flex items-center justify-between transition-all border-b border-zinc-100">
                {/* Logo - Hide on mobile if search is open */}
                <Link 
                    href={searchValue ? `/?q=${encodeURIComponent(searchValue)}` : "/"} 
                    className={`flex items-center gap-2 transition-opacity ${isSearchOpen ? 'max-md:hidden' : 'opacity-100'}`}
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

                {/* Desktop nav - Preserve search query when switching tabs */}
                {!isSearchOpen && (
                    <nav className="hidden md:flex items-center gap-10 lg:gap-14 animate-in fade-in duration-300">
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(pathname, item.href);
                            const hrefWithQuery = searchValue 
                                ? `${item.href}${item.href.includes('?') ? '&' : '?'}q=${encodeURIComponent(searchValue)}`
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

                {/* Search + Profile container */}
                <div className={`flex items-center gap-4 md:gap-6 transition-all ${isSearchOpen ? 'flex-1 justify-end ml-4 md:ml-10' : ''}`}>
                    
                    {/* Search Bar UI */}
                    <div className={`relative flex items-center transition-all duration-300 ease-out ${isSearchOpen ? 'w-full max-w-xl' : 'w-12 md:w-14'}`}>
                        {isSearchOpen ? (
                            <div className="relative w-full group">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search keywords..."
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    className="w-full h-12 md:h-14 pl-12 md:pl-14 pr-6 bg-zinc-50 border border-zinc-200 rounded-2xl text-base md:text-lg font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all"
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
                                    onClick={() => { setIsSearchOpen(false); handleSearchChange({ target: { value: '' } } as any); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsSearchOpen(true)}
                                className="w-12 h-12 md:w-14 md:h-14 border border-zinc-200 rounded-2xl flex items-center justify-center hover:bg-zinc-50 transition-colors group"
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

                    {/* Profile Dropdown */}
                    <div className="relative flex-shrink-0" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen((v) => !v)}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 transition-all p-0.5 active:scale-95 ${
                                isDropdownOpen ? "border-pink-500" : "border-zinc-100"
                            }`}
                        >
                            <div className="w-full h-full bg-yellow-100 rounded-full flex items-center justify-center text-sm font-bold text-yellow-700">
                                U
                            </div>
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
                        ? `${item.href}${item.href.includes('?') ? '&' : '?'}q=${encodeURIComponent(searchValue)}`
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