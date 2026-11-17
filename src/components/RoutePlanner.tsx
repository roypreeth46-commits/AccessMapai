import React, { useState } from 'react';
import { Route, Navigation, MapPin, CheckCircle2, ArrowRight, Locate, Loader2, Mic } from 'lucide-react';
import { RouteOption } from '../types';

export const RoutePlanner: React.FC = () => {
  const [startLoc, setStartLoc] = useState('Mangaluru Central Railway Station, Hampankatta');
  const [endLoc, setEndLoc] = useState('KMC Hospital, Attavar, Mangaluru');
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [isListeningField, setIsListeningField] = useState<'start' | 'end' | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);

  const mockRoutes: RouteOption[] = [
    {
      id: 'route-1',
      title: 'Safest Accessible Route',
      type: 'safest',
      distance: '1.8 km',
      duration: '16 mins',
      obstacleCount: 0,
      confidenceScore: 0.96,
      difficulty: 'Easy',
      limitations: ['Step-free footpaths along Light House Hill Rd', 'Verified curb ramps at 4 crossings'],
      color: '#10B981',
      path: [],
    },
    {
      id: 'route-2',
      title: 'Shortest Accessible Route',
      type: 'shortest',
      distance: '1.3 km',
      duration: '12 mins',
      obstacleCount: 1,
      confidenceScore: 0.84,
      difficulty: 'Moderate',
      limitations: ['1 reported pothole near Hampankatta signal (bypassable)', 'Moderate 4% incline near Attavar'],
      color: '#3B82F6',
      path: [],
    },
    {
      id: 'route-3',
      title: 'Alternative Falnir Route',
      type: 'alternative',
      distance: '2.1 km',
      duration: '20 mins',
      obstacleCount: 1,
      confidenceScore: 0.89,
      difficulty: 'Easy',
      limitations: ['Wide paved shoulder along Falnir Road', 'Slightly longer travel distance'],
      color: '#F59E0B',
      path: [],
    },
  ];

  const handleUseLiveLocation = () => {
    setIsLocating(true);
    setLocationMessage('');

    if (!('geolocation' in navigator)) {
      setIsLocating(false);
      setStartCoords({ lat: 12.9141, lng: 74.8560 });
      setStartLoc('Live Fallback: Mangaluru City Center (12.9141, 74.8560)');
      setLocationMessage('Geolocation unavailable in this browser. Used Mangaluru fallback.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        setStartCoords({ lat, lng });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17`,
            { headers: { Accept: 'application/json' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.display_name) {
              const shortName = data.display_name.split(',').slice(0, 3).join(',');
              setStartLoc(`${shortName} (${lat}, ${lng})`);
              setLocationMessage(`Live GPS locked (±${Math.round(position.coords.accuracy)}m)`);
              setIsLocating(false);
              return;
            }
          }
        } catch {
          // Reverse geocode fallback to coordinates
        }

        setStartLoc(`Current Live Location (${lat}, ${lng})`);
        setLocationMessage(`Live GPS locked (±${Math.round(position.coords.accuracy)}m)`);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setStartCoords({ lat: 12.9141, lng: 74.8560 });
        setStartLoc('Hampankatta Junction, Mangaluru (12.8718, 74.8431)');
        setLocationMessage(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Set to Hampankatta, Mangaluru.'
            : 'GPS signal unavailable. Set to Hampankatta, Mangaluru.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleVoiceInput = (field: 'start' | 'end') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListeningField(field);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (field === 'start') setStartLoc(transcript);
      else setEndLoc(transcript);
      setIsListeningField(null);
    };
    recognition.onerror = () => setIsListeningField(null);
    recognition.onend = () => setIsListeningField(null);
    recognition.start();
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculated(true);
    setSelectedRoute(mockRoutes[0]);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(
        `Calculated three accessible routes from ${startLoc} to ${endLoc}. Safest route selected with zero reported obstacles.`
      );
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
            <p className="text-sm text-slate-300">Find obstacle-free paths across Mangaluru tailored for wheelchair users and mobility needs</p>
          </div>
        </div>

        {/* Route Input Form */}
        <form onSubmit={handleCalculate} className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Starting Location</label>
              <button
                type="button"
                onClick={handleUseLiveLocation}
                disabled={isLocating}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                title="Use my current live GPS location"
              >
                {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Locate className="w-3 h-3" />}
                <span>{isLocating ? 'Locating...' : 'Live Location'}</span>
              </button>
            </div>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 w-4 h-4 text-emerald-400 pointer-events-none" />
              <input
                type="text"
                value={startLoc}
                onChange={(e) => setStartLoc(e.target.value)}
                placeholder="Enter starting point or tap Live Location"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-11 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => handleVoiceInput('start')}
                className={`absolute right-2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isListeningField === 'start' ? 'bg-red-600 text-white animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Speak starting location"
                aria-label="Speak starting location"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
            {locationMessage && (
              <p className="text-[11px] text-emerald-300 mt-1.5">
                {locationMessage}
                {startCoords ? ` (${startCoords.lat}, ${startCoords.lng})` : ''}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Destination</label>
              <span className="text-[11px] text-slate-500">Mangaluru, Karnataka</span>
            </div>
            <div className="relative flex items-center">
              <Navigation className="absolute left-3 w-4 h-4 text-blue-400 pointer-events-none" />
              <input
                type="text"
                value={endLoc}
                onChange={(e) => setEndLoc(e.target.value)}
                placeholder="Enter destination"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-11 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => handleVoiceInput('end')}
                className={`absolute right-2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isListeningField === 'end' ? 'bg-red-600 text-white animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Speak destination"
                aria-label="Speak destination"
              >
                <Mic className="w-4 h-4" />
              </button>
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-white">Recommended Route Options</h2>
            <span className="text-xs text-blue-400 font-medium px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              Evaluated against active Mangaluru obstacle reports
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
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        window.speechSynthesis.speak(
                          new SpeechSynthesisUtterance(`Starting navigation on ${route.title}. Distance ${route.distance}, estimated time ${route.duration}.`)
                        );
                      }
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
