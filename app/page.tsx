"use client";

import React, { useState } from 'react';

const COLLAGE_DATA = [
  { id: 1, category: "Cafe", color: "bg-amber-100/50" },
  { id: 2, category: "Restaurant", color: "bg-blue-100/50" },
  { id: 3, category: "Bar", color: "bg-zinc-200/50" },
  { id: 4, category: "Exhibition", color: "bg-emerald-100/50" },
  { id: 5, category: "Weekend trip", color: "bg-rose-100/50" },
  { id: 6, category: "Bakery", color: "bg-orange-50/50" },
  { id: 7, category: "Museum", color: "bg-indigo-50/50" },
  { id: 8, category: "Brunch", color: "bg-yellow-50/50" },
];

/**
 * A helper component to render a blank collage card placeholder.
 * The images have been removed as requested.
 */
const CollageCard = ({ color }: { color: string }) => {
  return (
    <div className={`relative w-full aspect-[2/3.5] rounded-3xl overflow-hidden border border-zinc-100/50 shadow-sm group hover:shadow-md transition-shadow cursor-pointer ${color}`}>
      {/* Blank placeholder interior */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center group-hover:border-zinc-400 transition-colors">
          <span className="text-zinc-400 font-light text-xl">+</span>
        </div>
      </div>
      
      {/* Subtle overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Explore');

  const navItems = ['Friends', 'Explore', 'Nearby', 'Map'];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-pink-100">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-sm shadow-pink-200">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`text-xl font-medium transition-all relative py-1 ${
                activeTab === item ? 'text-black' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {item}
              {activeTab === item && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Search & User Profile */}
        <div className="flex items-center gap-4">
          <button className="w-12 h-12 border-2 border-dashed border-zinc-300 rounded-xl flex items-center justify-center hover:border-zinc-400 transition-colors">
            {/* Replaced Lucide Search with Inline SVG */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-zinc-500"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-100 p-0.5">
            <div className="w-full h-full bg-yellow-100 rounded-full flex items-center justify-center text-xs font-bold text-yellow-700">
              U
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-6 py-8">
        <div className="flex overflow-x-auto gap-8 pb-12 no-scrollbar">
          {COLLAGE_DATA.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-64 md:w-72 flex flex-col gap-4">
              {/* Category Title */}
              <div className="h-8 flex items-center px-1">
                <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
              
              {/* The Collage Card Placeholder */}
              <CollageCard color={item.color} />

              {/* Second row of cards */}
              <div className="mt-4">
                <CollageCard color={item.color} />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-full flex items-center gap-8 shadow-2xl">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setActiveTab(item)}
            className={`text-sm font-medium transition-colors ${
              activeTab === item ? 'text-white' : 'text-zinc-500'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}