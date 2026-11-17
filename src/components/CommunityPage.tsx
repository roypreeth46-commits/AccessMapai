import React, { useState } from 'react';
import { Users, ThumbsUp, ThumbsDown, MessageSquare, MapPin, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Report } from '../types';

interface CommunityPageProps {
  reports: Report[];
  onVote: (reportId: string, voteType: 'STILL_PRESENT' | 'NO_LONGER_PRESENT') => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ reports, onVote }) => {
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [commentsMap, setCommentsMap] = useState<{ [key: string]: string[] }>({
    'REP-1001': ['Still very dangerous at night!', 'Crews inspected yesterday.'],
    'REP-1002': ['Barriers are still blocking the path.'],
  });

  const handleAddComment = (reportId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[reportId];
    if (text?.trim()) {
      setCommentsMap((prev) => ({
        ...prev,
        [reportId]: [...(prev[reportId] || []), text.trim()],
      }));
      setCommentInputs((prev) => ({ ...prev, [reportId]: '' }));
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-[#0B1220] to-cyan-950/30">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Community Accessibility Feed</h1>
            <p className="text-sm text-slate-300">Verify obstacle reports, vote on real-time presence, and collaborate with local mobility advocates</p>
          </div>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const totalVotes = report.stillPresentVotes + report.noLongerPresentVotes;
          const stillPresentPct = totalVotes > 0 ? Math.round((report.stillPresentVotes / totalVotes) * 100) : 100;
          const reportComments = commentsMap[report.id] || [];

          return (
            <div key={report.id} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {report.issueType.replace('_', ' ')}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">{report.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{report.address}</span>
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {report.verificationStatus}
                </span>
              </div>

              <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700">
                <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
              </div>

              <p className="text-xs text-slate-300">{report.description}</p>

              {/* Voting Progress Bar */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Community Status Check</span>
                  <span className="text-blue-400 font-semibold">{stillPresentPct}% Still Present ({totalVotes} votes)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-red-500 h-full transition-all" style={{ width: `${stillPresentPct}%` }} />
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${100 - stillPresentPct}%` }} />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => onVote(report.id, 'STILL_PRESENT')}
                    className="flex-1 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Still Present ({report.stillPresentVotes})</span>
                  </button>
                  <button
                    onClick={() => onVote(report.id, 'NO_LONGER_PRESENT')}
                    className="flex-1 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>No Longer Present ({report.noLongerPresentVotes})</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {reportComments.map((com, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900/50 text-xs text-slate-300 border border-slate-800">
                      <span className="font-semibold text-blue-400 mr-2">Member:</span>
                      {com}
                    </div>
                  ))}
                </div>

                <form onSubmit={(e) => handleAddComment(report.id, e)} className="flex gap-2">
                  <input
                    type="text"
                    value={commentInputs[report.id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [report.id]: e.target.value })}
                    placeholder="Add community comment..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
