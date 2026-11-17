import React from 'react';
import { FileText, MapPin, ShieldCheck, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Report } from '../types';

interface MyReportsProps {
  reports: Report[];
  setActiveTab: (tab: string) => void;
}

export const MyReports: React.FC<MyReportsProps> = ({ reports, setActiveTab }) => {
  const userReports = reports.filter((r) => r.userId === 'user-current' || r.userName === 'Elena Rostova');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-[#0B1220] to-cyan-950/30">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">My Submitted Reports</h1>
            <p className="text-sm text-slate-300">Track the verification and municipal complaint status of your accessibility reports</p>
          </div>
        </div>
      </div>

      {userReports.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Reports Submitted Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't submitted any obstacle reports yet. Help the community by reporting a pothole or blocked ramp.
          </p>
          <button
            onClick={() => setActiveTab('report')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            Report an Issue Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userReports.map((report) => (
            <div key={report.id} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {report.id}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">{report.title}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  report.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {report.verificationStatus}
                </span>
              </div>

              <div className="flex gap-4 items-center">
                <img src={report.imageUrl} alt={report.title} className="w-24 h-24 rounded-2xl object-cover bg-slate-900 border border-slate-700 shrink-0" />
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{report.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Submitted: {new Date(report.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p className="text-slate-400 line-clamp-2">{report.description}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Complaint Status:</span>
                  <span className="font-semibold text-cyan-400 ml-1">{report.complaintStatus}</span>
                </div>
                {report.complaintReferenceNumber && (
                  <span className="text-slate-400 font-mono">Ref: {report.complaintReferenceNumber}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
