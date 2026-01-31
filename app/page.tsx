"use client";

import React, { useState, useRef, useEffect } from 'react';

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
 */
const CollageCard = ({ color }) => {
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navItems = ['Friends', 'Explore', 'Nearby', 'Map'];
  const dropdownOptions = ['Profile', 'Save', 'Post', 'Setting'];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-pink-100">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-10 py-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-14 h-14 bg-pink-500 rounded-[1.25rem] flex items-center justify-center text-white shadow-md shadow-pink-200">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-14">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`text-2xl font-semibold transition-all relative py-2 ${
                activeTab === item ? 'text-black' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {item}
              {activeTab === item && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-black rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Search & User Profile */}
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
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all p-0.5 active:scale-95 ${
                isDropdownOpen ? 'border-pink-200' : 'border-zinc-100'
              }`}
            >
              <div className="w-full h-full bg-yellow-100 rounded-full flex items-center justify-center text-sm font-bold text-yellow-700">
                U
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-4 w-56 bg-white border border-zinc-100 rounded-3xl shadow-2xl py-3 z-[60] animate-in fade-in zoom-in duration-200 origin-top-right">
                {dropdownOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full text-left px-5 py-3 text-base font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-black transition-colors"
                  >
                    {option}
                  </button>
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

      {/* Main Content Area */}
      <main className="px-10 py-9">
        {/* UNLINKED CATEGORY BAR: Added justify-center to center the labels */}
        <div className="flex items-center justify-center gap-12 mb-12 border-b border-zinc-100 pb-6 px-2 overflow-x-auto no-scrollbar">
          {COLLAGE_DATA.map((item) => (
            <button 
              key={`label-${item.id}`}
              className="flex-shrink-0 text-xs font-black uppercase tracking-[0.3em] text-zinc-300 hover:text-pink-500 transition-colors whitespace-nowrap"
            >
              {item.category}
            </button>
          ))}
        </div>

        {/* Collage Cards Grid/Scroll */}
        <div className="flex overflow-x-auto gap-10 pb-12 no-scrollbar">
          {COLLAGE_DATA.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-72 md:w-80 flex flex-col gap-6">
              {/* Cards are now pure visual elements, "unlinked" from the structural titles */}
              <CollageCard color={item.color} />
              <div className="mt-2">
                <CollageCard color={item.color} />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-10 py-5 rounded-full flex items-center gap-10 shadow-2xl">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setActiveTab(item)}
            className={`text-base font-bold transition-colors ${
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