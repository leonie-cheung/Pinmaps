"use client";

import React, { useState } from "react";

type View = "main" | "Profile" | "Notifications" | "Privacy & Security" | "Appearance";

export default function SettingsPage() {
  const [currentView, setCurrentView] = useState<View>("main");

  // Mock State for functionality
  const [profile, setProfile] = useState({
    name: "Alex River",
    email: "alex@example.com",
    bio: "Passionate about travel, coffee, and finding the best hidden gems in the city."
  });

  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    mentions: true
  });

  const [appearance, setAppearance] = useState({
    theme: "Light",
    fontSize: "Medium",
    reduceMotion: false
  });

  const sections = [
    {
      title: "Profile" as View,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      ),
      description: "Manage your public profile, bio, and personal information.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Notifications" as View,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
      ),
      description: "Configure how you receive alerts and push updates.",
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "Privacy & Security" as View,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      ),
      description: "Control your data, visibility, and account security.",
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Appearance" as View,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.707-.484 2.179-1.208l.382-.586a1.5 1.5 0 0 0-.107-1.802 6.002 6.002 0 0 1-1.428-4.485l.026-.592a4 4 0 0 1 3.99-3.827h1.56a2 2 0 0 0 1.343-.526L21.43 7.42A10 10 0 0 0 12 2z"/></svg>
      ),
      description: "Customize themes, dark mode, and interface layout.",
      color: "bg-purple-50 text-purple-600"
    }
  ];

  const renderSubPage = () => {
    switch (currentView) {
      case "Profile":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-10 mb-12">
                <div className="w-32 h-32 rounded-full bg-zinc-100 border-4 border-white shadow-md flex items-center justify-center text-zinc-400 overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                    <button className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">Change photo</button>
                    <p className="text-base text-zinc-400 mt-2 font-medium">JPG, GIF or PNG. Max size 2MB</p>
                </div>
            </div>

            <div className="grid gap-10">
              <div className="space-y-4">
                <label className="text-lg font-bold text-zinc-700 ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full px-8 py-6 text-xl rounded-[2rem] border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                />
              </div>
              <div className="space-y-4">
                <label className="text-lg font-bold text-zinc-700 ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full px-8 py-6 text-xl rounded-[2rem] border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                />
              </div>
              <div className="space-y-4">
                <label className="text-lg font-bold text-zinc-700 ml-1">Bio</label>
                <textarea 
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="w-full px-8 py-6 text-xl rounded-[2rem] border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none font-medium leading-relaxed"
                />
              </div>
            </div>
            <button className="w-full py-6 rounded-[2rem] bg-zinc-900 text-white text-xl font-bold hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg">
              Save Changes
            </button>
          </div>
        );
      
      case "Notifications":
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-10 rounded-[3rem] border border-zinc-100 bg-zinc-50/30 space-y-8">
              {[
                { label: "Push Notifications", key: "push" },
                { label: "Email Summaries", key: "email" },
                { label: "New Mentions", key: "mentions" }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-6 rounded-[2rem] bg-white border border-zinc-100 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-zinc-900">{item.label}</span>
                    <span className="text-base text-zinc-400 font-medium mt-1">Receive alerts when this happens</span>
                  </div>
                  <button 
                    onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key as keyof typeof notifications]})}
                    className={`w-20 h-10 rounded-full transition-colors relative flex items-center px-1.5 ${notifications[item.key as keyof typeof notifications] ? 'bg-blue-500' : 'bg-zinc-200'}`}
                  >
                    <div className={`w-7 h-7 bg-white rounded-full shadow-md transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-10' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-10 rounded-[3rem] border border-zinc-100 bg-zinc-50/30">
              <h4 className="text-2xl font-bold text-zinc-800 mb-4">Quiet Hours</h4>
              <p className="text-lg text-zinc-500 mb-8 font-medium">Mute all notifications during a specific time range.</p>
              <div className="flex gap-6">
                 <input type="time" className="flex-1 p-6 text-xl rounded-2xl border border-zinc-100 bg-white font-bold" defaultValue="22:00" />
                 <input type="time" className="flex-1 p-6 text-xl rounded-2xl border border-zinc-100 bg-white font-bold" defaultValue="08:00" />
              </div>
            </div>
          </div>
        );

      case "Appearance":
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-8">
              {["Light", "Dark", "System", "Glass"].map((theme) => (
                <button 
                  key={theme}
                  onClick={() => setAppearance({...appearance, theme})}
                  className={`p-10 rounded-[2.5rem] border-2 transition-all text-left ${appearance.theme === theme ? 'border-zinc-900 bg-zinc-50 shadow-md' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                >
                  <div className={`w-12 h-12 rounded-full mb-6 ${theme === 'Dark' ? 'bg-zinc-800' : theme === 'Light' ? 'bg-zinc-100 border border-zinc-200' : theme === 'Glass' ? 'bg-gradient-to-tr from-blue-100 to-purple-100' : 'bg-zinc-400'}`} />
                  <span className="text-2xl font-black block">{theme}</span>
                  <span className="text-base text-zinc-400 font-medium">Apply {theme.toLowerCase()} interface</span>
                </button>
              ))}
            </div>
            
            <div className="p-10 rounded-[3rem] border border-zinc-100 bg-zinc-50/30">
              <h4 className="text-2xl font-bold text-zinc-800 mb-6">Accessibility</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold text-zinc-600">Reduce Motion</span>
                  <button 
                    onClick={() => setAppearance({...appearance, reduceMotion: !appearance.reduceMotion})}
                    className={`w-16 h-8 rounded-full transition-colors relative flex items-center px-1 ${appearance.reduceMotion ? 'bg-zinc-900' : 'bg-zinc-200'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${appearance.reduceMotion ? 'translate-x-8' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "Privacy & Security":
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-10 rounded-[3rem] border border-zinc-100 bg-zinc-50/30">
              <h4 className="text-2xl font-bold text-zinc-800 mb-6">Password</h4>
              <div className="space-y-6">
                <button className="w-full p-6 rounded-[2rem] bg-white border border-zinc-100 font-bold text-xl text-zinc-700 hover:border-zinc-300 transition-all text-left flex justify-between items-center shadow-sm">
                  <span>Change Password</span>
                  <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-300"><path d="M6.1584 3.13597L9.79366 7.47833L6.1584 11.1136" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className="w-full p-6 rounded-[2rem] bg-white border border-zinc-100 font-bold text-xl text-zinc-700 hover:border-zinc-300 transition-all text-left flex justify-between items-center shadow-sm">
                  <span>Two-Factor Authentication</span>
                  <span className="text-sm bg-emerald-100 text-emerald-600 px-4 py-2 rounded-xl">Enabled</span>
                </button>
              </div>
            </div>
            <div className="p-10 rounded-[3rem] border border-zinc-100 bg-rose-50/50">
              <h4 className="text-2xl font-bold text-rose-800 mb-4">Danger Zone</h4>
              <p className="text-lg text-rose-600/70 mb-8 font-medium leading-relaxed">Once you delete your account, there is no going back. Please be certain about this action.</p>
              <button className="w-full py-6 rounded-[2rem] bg-rose-500 text-white text-xl font-bold hover:bg-rose-600 transition-all shadow-lg active:scale-[0.98]">
                Delete Account
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-pink-100">
      <main className="max-w-4xl mx-auto px-8 py-16">
        {currentView === "main" ? (
          <>
            <div className="mb-12">
              <button 
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-8 text-lg font-bold group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                Back to feed
              </button>
              <h1 className="text-6xl font-black tracking-tighter text-zinc-900 mb-6">Settings</h1>
              <p className="text-2xl text-zinc-500 max-w-2xl font-medium leading-tight">Manage your account preferences and application settings to tailor your experience.</p>
            </div>

            <div className="grid gap-8">
              {sections.map((section) => (
                <div 
                  key={section.title}
                  onClick={() => setCurrentView(section.title)}
                  className="group flex items-center gap-8 p-10 rounded-[3rem] border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className={`p-6 rounded-[2rem] ${section.color} transition-transform group-hover:scale-110 shadow-sm`}>
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-black text-zinc-900 leading-none">{section.title}</h3>
                    <p className="text-xl text-zinc-500 mt-2 font-medium">{section.description}</p>
                  </div>
                  <div className="self-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-zinc-300 group-hover:text-zinc-900 group-hover:bg-white group-hover:shadow-md transition-all">
                      <svg width="28" height="28" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.1584 3.13597C5.96314 3.33123 5.96314 3.64781 6.1584 3.84307L9.79366 7.47833L6.1584 11.1136C5.96314 11.3089 5.96314 11.6254 6.1584 11.8207C6.35366 12.016 6.67024 12.016 6.8655 11.8207L10.8543 7.83189C11.0496 7.63663 11.0496 7.32005 10.8543 7.12479L6.8655 3.13597C6.67024 2.94071 6.35366 2.94071 6.1584 3.13597Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            <button 
              onClick={() => setCurrentView("main")}
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-10 text-xl font-bold group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Back to settings
            </button>
            
            <h2 className="text-6xl font-black text-zinc-900 mb-4 tracking-tighter">{currentView}</h2>
            <p className="text-zinc-500 text-2xl mb-14 font-medium">Manage your {currentView.toLowerCase()} preferences.</p>

            {renderSubPage()}
          </div>
        )}
      </main>
    </div>
  );
}