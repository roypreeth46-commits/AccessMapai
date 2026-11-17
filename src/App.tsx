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
import { Report, GovernmentDepartment, AccessibilitySettings } from './types';
import { AlertOctagon, Award, Command } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: 'user' | 'admin' } | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [departments, setDepartments] = useState<GovernmentDepartment[]>([]);
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

  // Fetch reports and departments on load
  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReports(data);
      })
      .catch((err) => console.error('Failed to fetch reports:', err));

    fetch('/api/departments')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDepartments(data);
      })
      .catch((err) => console.error('Failed to fetch departments:', err));
  }, []);

  // Global Keyboard Shortcut Manager
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

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
      }
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  const handleVerifyReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: 'admin@gmail.com' }),
      });
      const data = await res.json();
      if (data.success) {
        setReports((prev) => prev.map((r) => (r.id === reportId ? data.report : r)));
      }
    } catch (err) {
      console.error('Verify error:', err);
    }
  };

  const handleRejectReport = async (reportId: string, reason: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: 'admin@gmail.com', reason }),
      });
      const data = await res.json();
      if (data.success) {
        setReports((prev) => prev.map((r) => (r.id === reportId ? data.report : r)));
      }
    } catch (err) {
      console.error('Reject error:', err);
    }
  };

  const handlePublishComplaint = async (reportId: string, departmentId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: 'admin@gmail.com', departmentId }),
      });
      const data = await res.json();
      if (data.success) {
        setReports((prev) => prev.map((r) => (r.id === reportId ? data.report : r)));
      }
    } catch (err) {
      console.error('Publish error:', err);
    }
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
      className={`min-h-screen bg-[#070B14] text-white flex overflow-x-hidden ${settings.highContrast ? 'contrast-125' : ''}`}
      style={{ fontSize: `${settings.textSizeMultiplier * 100}%` }}
    >
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
          onSearchLocation={(query) => setActiveTab('map')}
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
          {activeTab === 'dashboard' && <Dashboard reports={reports} setActiveTab={setActiveTab} />}
          {activeTab === 'map' && <MapView reports={reports} />}
          {activeTab === 'routes' && <RoutePlanner />}
          {activeTab === 'report' && <ReportIssue onReportSubmitted={handleReportSubmitted} setActiveTab={setActiveTab} />}
          {activeTab === 'my-reports' && <MyReports reports={reports} setActiveTab={setActiveTab} />}
          {activeTab === 'community' && <CommunityPage reports={reports} onVote={handleVote} />}
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
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}
