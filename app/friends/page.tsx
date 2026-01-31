"use client";

import React from "react";
import Header from "../Components/Header";

const FRIENDS_DATA = [
    { id: 1, category: "Sofia", color: "bg-pink-100/60" },
    { id: 2, category: "Amira", color: "bg-amber-100/60" },
    { id: 3, category: "Leo", color: "bg-indigo-100/60" },
    { id: 4, category: "Mina", color: "bg-emerald-100/60" },
    { id: 5, category: "Jay", color: "bg-blue-100/60" },
];

const CollageCard = ({ color }: { color: string }) => {
    return (
        <div
            className={`relative w-full aspect-[2/3.5] rounded-3xl overflow-hidden border border-zinc-100/50 shadow-sm group hover:shadow-md transition-shadow cursor-pointer ${color}`}
        >
            <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center group-hover:border-zinc-400 transition-colors">
                    <span className="text-zinc-400 font-light text-xl">+</span>
                </div>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        </div>
    );
};

export default function FriendsPage() {
    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-pink-100">
            <Header />

            <main className="px-10 py-9">
                {/* Friends “filter” bar */}
                <div className="flex items-center justify-center gap-12 mb-12 border-b border-zinc-100 pb-6 px-2 overflow-x-auto no-scrollbar">
                    {FRIENDS_DATA.map((item) => (
                        <button
                            key={item.id}
                            className="flex-shrink-0 text-xs font-black uppercase tracking-[0.3em] text-zinc-300 hover:text-pink-500 transition-colors whitespace-nowrap"
                        >
                            {item.category}
                        </button>
                    ))}
                </div>

                {/* Friends Collages */}
                <div className="flex overflow-x-auto gap-10 pb-12 no-scrollbar">
                    {FRIENDS_DATA.map((item) => (
                        <div
                            key={item.id}
                            className="flex-shrink-0 w-72 md:w-80 flex flex-col gap-6"
                        >
                            <CollageCard color={item.color} />
                            <div className="mt-2">
                                <CollageCard color={item.color} />
                            </div>
                        </div>
                    ))}
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
