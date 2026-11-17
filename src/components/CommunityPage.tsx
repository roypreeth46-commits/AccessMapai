import React, { useState } from 'react';
import { Users, ThumbsUp, ThumbsDown, MapPin, Clock, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Report } from '../types';
import { getImageDeadlineInfo } from '../utils/imageDeadline';

interface CommunityPageProps {
  reports: Report[];
  onVote: (reportId: string, voteType: 'STILL_PRESENT' | 'NO_LONGER_PRESENT') => void;
  onRevalidateImage?: (reportId: string, newImageUrl?: string, validityDays?: number) => Promise<{ ok: boolean; message?: string }> | void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ reports, onVote, onRevalidateImage }) => {
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [revalidatedId, setRevalidatedId] = useState<string | null>(null);
  const [revalidationError, setRevalidationError] = useState<{ id: string; message: string } | null>(null);
  const [commentsMap, setCommentsMap] = useState<{ [key: string]: string[] }>({
    'REP-MNG-01': ['Still very dangerous during evening rush!', 'Crews inspected yesterday.'],
    'REP-MNG-02': ['Two-wheelers still blocking the ramp near college gate.'],
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

  const handlePhotoReupload = (reportId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onRevalidateImage) return;
    setRevalidationError(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = await onRevalidateImage(reportId, reader.result as string, 7);
      if (result && !result.ok) {
        setRevalidationError({
          id: reportId,
          message: result.message || 'AI Rejected: Only genuine pothole photos are approved.',
        });
        return;
      }
      setRevalidatedId(reportId);
      setTimeout(() => setRevalidatedId(null), 3000);
    };
    reader.readAsDataURL(file);
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
            <p className="text-sm text-slate-300">Verify obstacle reports, track photo deadlines, and refresh expired hazard evidence</p>
          </div>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const totalVotes = report.stillPresentVotes + report.noLongerPresentVotes;
          const stillPresentPct = totalVotes > 0 ? Math.round((report.stillPresentVotes / totalVotes) * 100) : 100;
          const reportComments = commentsMap[report.id] || [];
          const deadline = getImageDeadlineInfo(report.imageExpiryDate);

          return (
            <div key={report.id} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-5 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {report.issueType.replace('_', ' ')}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">{report.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{report.address}</span>
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                  {report.verificationStatus}
                </span>
              </div>

              <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700">
                <img
                  src={report.imageUrl}
                  alt={report.title}
                  className={`w-full h-full object-cover ${deadline.isExpired ? 'opacity-60 grayscale-[45%]' : ''}`}
                />
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border flex items-center gap-1.5 tabular-nums ${deadline.badgeClass}`}>
                  {deadline.isExpired ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  <span>{deadline.label}</span>
                </div>
                <div className="absolute bottom-2.5 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[11px] text-slate-200 border border-white/10">
                  Deadline: {deadline.expiryFormatted}
                </div>
              </div>

              {(deadline.isExpired || deadline.isExpiringSoon) && onRevalidateImage && (
                <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                  deadline.isExpired
                    ? 'bg-red-500/10 border-red-500/30 text-red-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      {deadline.isExpired
                        ? 'Image deadline expired. Upload a fresh photo to keep this report active.'
                        : `Image expires soon (${deadline.expiryFormatted}). Refresh photo to extend deadline.`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Upload Fresh Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoReupload(report.id, e)}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        onRevalidateImage(report.id, undefined, 7);
                        setRevalidatedId(report.id);
                        setTimeout(() => setRevalidatedId(null), 3000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
                    >
                      Confirm Still Active (+7d)
                    </button>
                  </div>
                </div>
              )}

              {revalidatedId === report.id && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Photo verified as pothole and deadline renewed for 7 days.</span>
                </div>
              )}

              {revalidationError?.id === report.id && (
                <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{revalidationError.message}</span>
                </div>
              )}

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
