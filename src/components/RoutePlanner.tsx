import React, { useState } from 'react';
import { Route, Navigation, MapPin, ShieldCheck, AlertTriangle, CheckCircle2, Volume2, ArrowRight } from 'lucide-react';
import { RouteOption } from '../types';

export const RoutePlanner: React.FC = () => {
  const [startLoc, setStartLoc] = useState('Central Station, Platform 2');
  const [endLoc, setEndLoc] = useState('St. Mary Medical Center, Main Entrance');
  const [mobilityPref, setMobilityPref] = useState('wheelchair');
  const [isCalculated, setIsCalculated] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);

  const mockRoutes: RouteOption[] = [
    {
      id: 'route-1',
      title: 'Safest Accessible Route',
      type: 'safest',
      distance: '1.4 miles',
      duration: '18 mins',
      obstacleCount: 0,
      confidenceScore: 0.98,
      difficulty: 'Easy',
      limitations: ['Fully verified smooth paving', 'Curb ramps at all 4 intersections'],
      color: '#10B981',
      path: [],
    },
    {
      id: 'route-2',
      title: 'Shortest Accessible Route',
      type: 'shortest',
      distance: '1.1 miles',
      duration: '14 mins',
      obstacleCount: 2,
      confidenceScore: 0.82,
      difficulty: 'Moderate',
      limitations: ['1 reported cracked footpath near 4th St (bypassable)', 'Steeper 5% slope on Market St incline'],
      color: '#3B82F6',
      path: [],
    },
    {
      id: 'route-3',
      title: 'Alternative Parkside Route',
      type: 'alternative',
      distance: '1.7 miles',
      duration: '22 mins',
      obstacleCount: 1,
      confidenceScore: 0.89,
      difficulty: 'Easy',
      limitations: ['Scenic park pathway with gentle slopes', 'Slightly longer distance'],
      color: '#F59E0B',
      path: [],
    },
  ];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculated(true);
    setSelectedRoute(mockRoutes[0]);
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('Calculated three accessible routes. Safest route selected with zero obstacles.');
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-[#0B1220] to-cyan-950/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
            <Route className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Accessible Route Planner</h1>
            <p className="text-sm text-slate-300">Find obstacle-free paths tailored for wheelchair users and mobility needs</p>
          </div>
        </div>

        {/* Route Input Form */}
        <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Starting Location</label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                value={startLoc}
                onChange={(e) => setStartLoc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination</label>
            <div className="relative flex items-center">
              <Navigation className="absolute left-3 w-4 h-4 text-blue-400" />
              <input
                type="text"
                value={endLoc}
                onChange={(e) => setEndLoc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-cyan-400 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Find Accessible Route</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Routes Display Results */}
      {isCalculated && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recommended Route Options</h2>
            <span className="text-xs text-blue-400 font-medium px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              Analyzed against 42 obstacles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockRoutes.map((route) => {
              const isSelected = selectedRoute?.id === route.id;
              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRoute(route)}
                  className={`glass-card rounded-3xl p-6 cursor-pointer transition-all border ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-950/20' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: route.color }}
                    >
                      {route.title}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{route.distance}</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Estimated Time:</span>
                      <span className="font-semibold text-white">{route.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Reported Obstacles:</span>
                      <span className={`font-semibold ${route.obstacleCount === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {route.obstacleCount} obstacles
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Accessibility Confidence:</span>
                      <span className="font-semibold text-blue-400">{Math.round(route.confidenceScore * 100)}%</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-4 border-t border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Route Highlights:</span>
                    {route.limitations.map((limit, idx) => (
                      <p key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{limit}</span>
                      </p>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRoute(route);
                      alert(`Turn-by-turn navigation started for ${route.title}.\nEstimated Duration: ${route.duration}`);
                    }}
                    className={`w-full mt-6 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? 'Navigation Active' : 'Select & Start Navigation'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
