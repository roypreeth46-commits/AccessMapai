import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, ShieldCheck } from 'lucide-react';

interface IntroAnimationProps {
  onComplete: () => void;
  reduceMotion: boolean;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete, reduceMotion }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 600);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete, reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070B14] text-white transition-opacity duration-600 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,139,255,0.15)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative flex flex-col items-center text-center px-4 max-w-xl">
        {/* Animated Icon & Glow */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 border border-blue-400/40">
            <Navigation className="w-12 h-12 text-white animate-bounce" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg border border-emerald-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Brand & Tagline */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-cyan-400 bg-clip-text text-transparent">
            AccessMap AI
          </h1>
          <p className="text-xl md:text-2xl font-medium text-cyan-200/90 tracking-wide">
            “Every Path Deserves Accessibility.”
          </p>
          <p className="text-sm md:text-base text-slate-400 font-light pt-1">
            Navigate freely. Travel safely. Live independently.
          </p>
        </div>

        {/* Skip Button */}
        <button
          onClick={onComplete}
          className="mt-12 px-6 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-sm font-medium border border-slate-700/60 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip Intro
        </button>
      </div>

      {/* Subtle Road Path Animation line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
    </div>
  );
};
