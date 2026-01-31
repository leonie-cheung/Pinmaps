"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

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
    // "/" needs exact match; other routes can be prefix match
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
}

export default function Header() {
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                event.target instanceof Node &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-50 bg-white px-10 py-8 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-white border border-zinc-100 shadow-md shadow-zinc-100 flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/favicon.ico"
                            alt="Logo"
                            className="w-9 h-9 object-contain"
                        />
                    </div>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-14">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(pathname, item.href);

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`text-2xl font-semibold transition-all relative py-2 ${
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

                {/* Search + profile */}
                <div className="flex items-center gap-6">
                    <button className="w-14 h-14 border-2 border-dashed border-zinc-300 rounded-2xl flex items-center justify-center hover:border-zinc-400 transition-colors">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-zinc-500"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    </button>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen((v) => !v)}
                            className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all p-0.5 active:scale-95 ${
                                isDropdownOpen ? "border-pink-200" : "border-zinc-100"
                            }`}
                        >
                            <div className="w-full h-full bg-yellow-100 rounded-full flex items-center justify-center text-sm font-bold text-yellow-700">
                                U
                            </div>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-4 w-56 bg-white border border-zinc-100 rounded-3xl shadow-2xl py-3 z-[60] animate-in fade-in zoom-in duration-200 origin-top-right">
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

                                <div className="my-2 border-t border-zinc-50" />

                                <button
                                    onClick={() => setIsDropdownOpen(false)}
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
            <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-10 py-5 rounded-full flex items-center gap-10 shadow-2xl">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(pathname, item.href);

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`text-base font-bold transition-colors ${
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
