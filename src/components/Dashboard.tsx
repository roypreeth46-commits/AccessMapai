import React from 'react';
import { AlertTriangle, Route, FileCheck, CheckCircle2, ArrowRight, ShieldCheck, MapPin, Navigation, Sparkles } from 'lucide-react';
import { Report } from '../types';

interface DashboardProps {
  reports: Report[];
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ reports, setActiveTab }) => {
  const verifiedCount = reports.filter((r) => r.verificationStatus === 'VERIFIED').length;
  const pendingCount = reports.filter((r) => r.verificationStatus === 'PENDING_AI' || r.verificationStatus === 'MANUAL_REVIEW').length;
  const resolvedCount = reports.filter((r) => r.complaintStatus === 'RESOLVED').length;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-10 border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-[#0B1220] to-cyan-950/30">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Accessibility Platform</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Welcome to AccessMap AI
          </h1>
          <p className="text-slate-300 text-base md:text-lg">
            Find safer paths and explore accessible places around you with real-time AI obstacle detection and community verification.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab('routes')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-cyan-400 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Find Accessible Route</span>
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className="px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Report an Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => setActiveTab('map')}
          className="glass-card rounded-2xl p-6 cursor-pointer hover:border-blue-500/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Live</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{reports.length}</h3>
          <p className="text-sm text-slate-400">Nearby Obstacles</p>
        </div>

        <div
          onClick={() => setActiveTab('routes')}
          className="glass-card rounded-2xl p-6 cursor-pointer hover:border-blue-500/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Route className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">14</h3>
          <p className="text-sm text-slate-400">Accessible Routes</p>
        </div>

        <div
          onClick={() => setActiveTab('my-reports')}
          className="glass-card rounded-2xl p-6 cursor-pointer hover:border-blue-500/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-transform">
              <FileCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">Verified</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{verifiedCount}</h3>
          <p className="text-sm text-slate-400">Issues Verified</p>
        </div>

        <div
          onClick={() => setActiveTab('community')}
          className="glass-card rounded-2xl p-6 cursor-pointer hover:border-blue-500/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Fixed</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">8</h3>
          <p className="text-sm text-slate-400">Resolved Issues</p>
        </div>
      </div>

      {/* Interactive Map Preview Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Interactive 3D Map Preview</h2>
            <p className="text-sm text-slate-400">Explore real-time obstacles and accessible pathways</p>
          </div>
          <button
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            <span>Open Full Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div
          onClick={() => setActiveTab('map')}
          className="relative h-72 md:h-96 rounded-2xl overflow-hidden cursor-pointer group border border-slate-700/60 bg-slate-900"
        >
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          {/* Simulated Map Visual elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6 glass-panel rounded-2xl border border-blue-500/30 shadow-2xl group-hover:scale-105 transition-transform">
              <MapPin className="w-10 h-10 text-blue-400 mx-auto mb-2 animate-bounce" />
              <h3 className="text-lg font-bold text-white">Click to Open 3D Map Explorer</h3>
              <p className="text-xs text-slate-300 mt-1">View potholes, blocked ramps, and verified safe routes</p>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-slate-950/80 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-red-400"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Pothole</span>
              <span className="flex items-center gap-1.5 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Blocked Ramp</span>
              <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Accessible Path</span>
            </div>
            <span className="text-blue-400 font-medium">3D Terrain Active</span>
          </div>
        </div>
      </div>

      {/* Recently Reported Issues Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent Accessibility Issues</h2>
          <button
            onClick={() => setActiveTab('community')}
            className="text-sm font-semibold text-blue-400 hover:underline cursor-pointer"
          >
            View All ({reports.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reports.slice(0, 3).map((report) => (
            <div
              key={report.id}
              onClick={() => setActiveTab('community')}
              className="glass-card rounded-2xl overflow-hidden cursor-pointer hover:border-blue-500/40 transition-all flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img
                  src={report.imageUrl}
                  alt={report.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/70 backdrop-blur-md text-white border border-white/10 uppercase tracking-wider">
                  {report.issueType.replace('_', ' ')}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-white text-base line-clamp-1">{report.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{report.address}</span>
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Votes: <strong className="text-white">{report.stillPresentVotes}</strong></span>
                  <span className="text-emerald-400 font-medium">{report.verificationStatus}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
