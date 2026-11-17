import React, { useState } from 'react';
import { Search, MapPin, Bell, Eye, User, Menu, ShieldAlert, Mic } from 'lucide-react';

interface NavbarProps {
  onOpenAccessibility: () => void;
  onOpenAdmin: () => void;
  onSearchLocation: (query: string) => void;
  onGpsDetect: () => void;
  isAdmin: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAccessibility, onOpenAdmin, onSearchLocation, onGpsDetect, isAdmin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchLocation(searchQuery);
    }
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        onSearchLocation(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      alert('Voice search is not supported in this browser.');
    }
  };

  return (
    <header className="h-20 bg-[#070B14]/80 backdrop-blur-xl border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar Zone with Voice Search */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Mangaluru location (e.g. Hampankatta, Pumpwell)..."
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-11 pr-32 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`absolute right-16 p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isListening ? 'bg-red-600 text-white animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Voice Search (Microphone)"
            aria-label="Voice Search"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onGpsDetect}
            className="absolute right-2 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg text-xs font-medium flex items-center gap-1 border border-blue-500/30 transition-all cursor-pointer"
            title="Detect Current Location (Mangalore GPS Fallback)"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GPS</span>
          </button>
        </div>
      </form>

      {/* Action Icons */}
      <div className="flex items-center gap-3 ml-4">
        {/* Accessibility Toolbar Shortcut */}
        <button
          onClick={onOpenAccessibility}
          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 text-blue-400 hover:bg-blue-600/10 transition-all cursor-pointer relative group"
          title="Accessibility Toolbar"
          aria-label="Accessibility Settings"
        >
          <Eye className="w-5 h-5" />
          <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-150 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
            Accessibility
          </span>
        </button>

        {/* Admin Portal Shortcut - ONLY IF ADMIN */}
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 hover:bg-cyan-600/10 transition-all cursor-pointer relative group"
            title="Admin Portal"
            aria-label="Admin Portal"
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-150 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
              Admin Portal
            </span>
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl p-4 shadow-2xl border border-slate-700 z-50 text-white animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-3">
                <span className="font-bold text-sm">Notifications</span>
                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">2 New</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="font-medium text-blue-300">Report Verified</p>
                  <p className="text-slate-400 mt-0.5">Your reported pothole near Hampankatta was verified by MCC authorities.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="font-medium text-cyan-300">Reward Points Awarded</p>
                  <p className="text-slate-400 mt-0.5">+50 XP earned for community accessibility contribution.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
