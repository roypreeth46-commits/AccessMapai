import React, { useState, useEffect } from 'react';
import { IntroAnimation } from './components/IntroAnimation';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { MapView } from './components/MapView';
import { RoutePlanner } from './components/RoutePlanner';
import { ReportIssue } from './components/ReportIssue';
import { MyReports } from './components/MyReports';
import { CommunityPage } from './components/CommunityPage';
import { AdminPortal } from './components/AdminPortal';
import { LoginModal } from './components/LoginModal';
import { SosModal } from './components/SosModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { Report, GovernmentDepartment, AccessibilitySettings, RouteOption } from './types';
import { SEED_REPORTS, SEED_DEPARTMENTS } from './data/seedData';
import { computeExpiryDate } from './utils/imageDeadline';
import { AlertOctagon, Award, Command } from 'lucide-react';

const REPORTS_STORAGE_KEY = 'accessmap_reports_v2';

function loadInitialReports(): Report[] {
  try {
    const saved = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore storage read errors
  }
  return SEED_REPORTS;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: 'user' | 'admin' } | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>(loadInitialReports);
  const [departments, setDepartments] = useState<GovernmentDepartment[]>(SEED_DEPARTMENTS);
  const [activeRoute, setActiveRoute] = useState<RouteOption | null>(null);
  const [userProfile, setUserProfile] = useState({ points: 350, badge: 'Gold Mobility Guardian', reportsCount: 4, votesCount: 12 });

  const [settings, setSettings] = useState<AccessibilitySettings>({
    textSizeMultiplier: 1.0,
    highContrast: false,
    reduceMotion: false,
    screenReaderMode: false,
    textToSpeechEnabled: false,
    language: 'en',
    voiceAssistanceActive: false,
  });

  // Sync reports to localStorage so GitHub Pages static deployment persists changes
  useEffect(() => {
    try {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    } catch {
      // Ignore storage quota errors
    }
  }, [reports]);

  // Fetch reports and departments from backend if server is running
  useEffect(() => {
    fetch('/api/reports')
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) return null;
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setReports(data);
      })
      .catch(() => {
        // Static hosting (GitHub Pages) fallback already loaded via SEED_REPORTS
      });

    fetch('/api/departments')
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) return null;
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setDepartments(data);
      })
      .catch(() => {
        // Static hosting fallback already loaded via SEED_DEPARTMENTS
      });
  }, []);

  // Global Keyboard Shortcut Manager
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const key = e.key.toUpperCase();
      if (key === 'D') setActiveTab('dashboard');
      if (key === 'M') setActiveTab('map');
      if (key === 'T') setActiveTab('routes');
      if (key === 'R') setActiveTab('report');
      if (key === 'C') setActiveTab('community');
      if (key === 'S') setIsSosOpen(true);
      if (key === 'A') setIsAccessibilityOpen(true);
      if (key === '?') setIsShortcutsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleReportSubmitted = (newReport: Report) => {
    setReports((prev) => [newReport, ...prev]);
    setUserProfile((prev) => ({
      ...prev,
      points: prev.points + 50,
      reportsCount: prev.reportsCount + 1,
    }));
  };

  const handleVote = async (reportId: string, voteType: 'STILL_PRESENT' | 'NO_LONGER_PRESENT') => {
    try {
      const res = await fetch(`/api/reports/${reportId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.email || 'user-current', userEmail: currentUser?.email, voteType }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setReports((prev) =>
            prev.map((r) => (r.id === reportId ? { ...r, stillPresentVotes: data.stillPresentVotes, noLongerPresentVotes: data.noLongerPresentVotes } : r))
          );
          setUserProfile((prev) => ({
            ...prev,
            points: prev.points + 10,
            votesCount: prev.votesCount + 1,
          }));
          return;
        }
      }
    } catch {
      // Static hosting fallback below
    }

    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              stillPresentVotes: voteType === 'STILL_PRESENT' ? r.stillPresentVotes + 1 : r.stillPresentVotes,
              noLongerPresentVotes: voteType === 'NO_LONGER_PRESENT' ? r.noLongerPresentVotes + 1 : r.noLongerPresentVotes,
            }
          : r
      )
    );
    setUserProfile((prev) => ({
      ...prev,
      points: prev.points + 10,
      votesCount: prev.votesCount + 1,
    }));
  };

  const handleVerifyReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: 'admin@gmail.com' }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setReports((prev) => prev.map((r) => (r.id === reportId ? data.report : r)));
          return;
        }
      }
    } catch {
      // Static fallback below
    }

    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              verificationStatus: 'VERIFIED',
              adminVerifiedBy: 'admin@gmail.com',
              adminVerificationTimestamp: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const handleRejectReport = async (reportId: string, reason: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: 'admin@gmail.com', reason }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setReports((prev) => prev.map((r) => (r.id === reportId ? data.report : r)));
          return;
        }
      }
    } catch {
      // Static fallback below
    }

    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              verificationStatus: 'REJECTED',
              complaintStatus: 'REJECTED',
            }
          : r
      )
    );
  };

  const handlePublishComplaint = async (reportId: string, departmentId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: 'admin@gmail.com', departmentId }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setReports((prev) => prev.map((r) => (r.id === reportId ? data.report : r)));
          return;
        }
      }
    } catch {
      // Static fallback below
    }

    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              complaintStatus: 'PUBLISHED',
              publishedDepartmentId: departmentId,
              publishedAt: new Date().toISOString(),
              complaintReferenceNumber: `MNC-GOV-${Math.floor(10000 + Math.random() * 90000)}`,
            }
          : r
      )
    );
  };

  const handleRevalidateImage = async (
    reportId: string,
    newImageUrl?: string,
    validityDays: number = 7
  ): Promise<{ ok: boolean; message?: string }> => {
    if (newImageUrl) {
      try {
        const aiRes = await fetch('/api/gemini/verify-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: newImageUrl,
            issueType: 'pothole',
            description: 'Revalidation photo upload',
          }),
        });
        const contentType = aiRes.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          return { ok: false, message: 'AI pothole verification server is unavailable.' };
        }
        const aiData = await aiRes.json();
        if (!aiRes.ok || !aiData.isValid || aiData.verificationStatus !== 'AI_APPROVED') {
          return {
            ok: false,
            message: aiData?.explanation || aiData?.error || 'AI Rejected: Only genuine pothole images are approved.',
          };
        }
      } catch {
        return { ok: false, message: 'Unable to verify image with AI pothole inspection.' };
      }
    }

    try {
      const res = await fetch(`/api/reports/${reportId}/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: newImageUrl,
          validityDays,
          actorEmail: currentUser?.email || 'user@accessmap.ai',
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.report) {
          setReports((prev) => prev.map((r) => (r.id === reportId ? data.report : r)));
          return { ok: true };
        }
      }
    } catch {
      // Static hosting fallback below
    }

    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              imageUrl: newImageUrl || r.imageUrl,
              imageExpiryDate: computeExpiryDate(validityDays),
              imageValidityStatus: validityDays <= 2 ? 'EXPIRING_SOON' : 'ACTIVE',
            }
          : r
      )
    );
    return { ok: true };
  };

  // If user is not logged in, show login portal modal on website load
  if (!currentUser) {
    return (
      <LoginModal
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setShowIntro(true);
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#070B14] text-white flex overflow-x-hidden relative ${
        settings.highContrast ? 'contrast-125' : ''
      } ${settings.reduceMotion ? 'reduce-motion' : ''}`}
      style={{ fontSize: `${settings.textSizeMultiplier * 100}%` }}
    >
      {/* Subtle Ambient Aurora Glows */}
      <div className="aurora-glow fixed top-[-10%] right-[12%] w-[420px] h-[420px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none z-0" />
      <div className="aurora-glow fixed bottom-[-12%] left-[18%] w-[380px] h-[380px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none z-0" />
      {/* Starting Animation / Intro Screen */}
      {showIntro && (
        <IntroAnimation onComplete={() => setShowIntro(false)} reduceMotion={settings.reduceMotion} />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onOpenAdmin={() => {
          if (currentUser.role === 'admin') {
            setIsAdminOpen(true);
          } else {
            alert('Access Denied: Administrator portal can only be accessed using admin@gmail.com credentials.');
          }
        }}
        isAdmin={currentUser.role === 'admin'}
      />

      {/* Main App Content View */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Navbar
          onOpenAccessibility={() => setIsAccessibilityOpen(true)}
          onOpenAdmin={() => {
            if (currentUser.role === 'admin') {
              setIsAdminOpen(true);
            } else {
              alert('Access Denied: Administrator portal can only be accessed using admin@gmail.com credentials.');
            }
          }}
          onSearchLocation={() => setActiveTab('map')}
          onGpsDetect={() => setActiveTab('map')}
          isAdmin={currentUser.role === 'admin'}
        />

        {/* Reward Points & Keyboard Help Floating Bar */}
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <Award className="w-4 h-4" />
              <span>{userProfile.points} XP • {userProfile.badge}</span>
            </span>
            <span className="hidden sm:inline text-slate-400">Reports: {userProfile.reportsCount} | Votes: {userProfile.votesCount}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              <Command className="w-3.5 h-3.5" />
              <span>Shortcuts (?)</span>
            </button>
            <button
              onClick={() => setCurrentUser(null)}
              className="text-red-400 hover:underline font-medium cursor-pointer"
            >
              Logout ({currentUser.name})
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard reports={reports} setActiveTab={setActiveTab} reduceMotion={settings.reduceMotion} />
          )}
          {activeTab === 'map' && (
            <MapView
              reports={reports}
              activeRoute={activeRoute}
              onClearRoute={() => setActiveRoute(null)}
            />
          )}
          {activeTab === 'routes' && (
            <RoutePlanner
              reports={reports}
              onNavigateRoute={(route) => {
                setActiveRoute(route);
                setActiveTab('map');
              }}
            />
          )}
          {activeTab === 'report' && <ReportIssue onReportSubmitted={handleReportSubmitted} setActiveTab={setActiveTab} />}
          {activeTab === 'my-reports' && (
            <MyReports reports={reports} setActiveTab={setActiveTab} onRevalidateImage={handleRevalidateImage} />
          )}
          {activeTab === 'community' && (
            <CommunityPage reports={reports} onVote={handleVote} onRevalidateImage={handleRevalidateImage} />
          )}
        </main>

        {/* Floating SOS Emergency Button */}
        <button
          onClick={() => setIsSosOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-2xl shadow-red-600/50 border-2 border-red-400 flex items-center gap-2.5 cursor-pointer animate-pulse focus:outline-none focus:ring-4 focus:ring-red-500"
          title="Emergency SOS (Shortcut: S)"
          aria-label="Emergency SOS"
        >
          <AlertOctagon className="w-5 h-5" />
          <span>SOS EMERGENCY</span>
        </button>
      </div>

      {/* Accessibility Toolbar Modal */}
      <AccessibilityToolbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
      />

      {/* SOS Modal */}
      <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} currentUser={currentUser} />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      {/* Admin Portal Modal */}
      {isAdminOpen && currentUser.role === 'admin' && (
        <AdminPortal
          reports={reports}
          departments={departments}
          onVerifyReport={handleVerifyReport}
          onRejectReport={handleRejectReport}
          onPublishComplaint={handlePublishComplaint}
          onRevalidateImage={handleRevalidateImage}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}
