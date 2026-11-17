import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, Users, FileText, CheckCircle2, XCircle, Send, Building, MapPin, ArrowLeft, LogOut, Check, Sparkles, Clock } from 'lucide-react';
import { Report, GovernmentDepartment } from '../types';

interface AdminPortalProps {
  reports: Report[];
  departments: GovernmentDepartment[];
  onVerifyReport: (reportId: string) => void;
  onRejectReport: (reportId: string, reason: string) => void;
  onPublishComplaint: (reportId: string, departmentId: string) => void;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  reports,
  departments,
  onVerifyReport,
  onRejectReport,
  onPublishComplaint,
  onClose,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [selectedReportForAction, setSelectedReportForAction] = useState<Report | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || '');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@gmail.com' && password === 'admin123456789') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Use admin@gmail.com / admin123456789');
    }
  };

  const totalReports = reports.length;
  const pendingCount = reports.filter((r) => r.verificationStatus === 'PENDING_AI' || r.verificationStatus === 'MANUAL_REVIEW').length;
  const verifiedCount = reports.filter((r) => r.verificationStatus === 'VERIFIED').length;
  const publishedCount = reports.filter((r) => r.complaintStatus === 'PUBLISHED').length;

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070B14]/90 backdrop-blur-xl">
        <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-blue-500/40 text-white animate-fadeIn">
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
              ✕
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Admin Portal Login</h1>
            <p className="text-xs text-slate-400 mt-1">AccessMap AI Secure Administrator Dashboard</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-cyan-400 transition-all cursor-pointer mt-2"
            >
              Secure Admin Login
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Admin Credentials: <strong className="text-cyan-400">admin@gmail.com</strong> / <strong className="text-cyan-400">admin123456789</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-[#070B14] text-white overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#0B1220] border-r border-slate-800 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/30 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Admin Portal</h2>
              <span className="text-[10px] text-emerald-400 font-medium">● Secure Session</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto text-sm">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: FileText },
            { id: 'reports', label: 'All Reports', icon: Users },
            { id: 'pending', label: 'Pending Verification', icon: Clock },
            { id: 'published', label: 'Published Complaints', icon: Send },
            { id: 'departments', label: 'Government Depts', icon: Building },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${
                  isActive ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Main App</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-8 space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Administrator Dashboard</h1>
            <p className="text-xs text-slate-400">Manage accessibility obstacle reports and transmit official government complaints</p>
          </div>
          <div className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            Logged in as: <strong className="text-cyan-400">admin@gmail.com</strong>
          </div>
        </div>

        {/* Dashboard Stats */}
        {adminTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="glass-card rounded-2xl p-6 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Total Reports</span>
                <h3 className="text-3xl font-extrabold text-white">{totalReports}</h3>
              </div>
              <div className="glass-card rounded-2xl p-6 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Pending Verification</span>
                <h3 className="text-3xl font-extrabold text-amber-400">{pendingCount}</h3>
              </div>
              <div className="glass-card rounded-2xl p-6 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Verified Reports</span>
                <h3 className="text-3xl font-extrabold text-emerald-400">{verifiedCount}</h3>
              </div>
              <div className="glass-card rounded-2xl p-6 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Published Complaints</span>
                <h3 className="text-3xl font-extrabold text-cyan-400">{publishedCount}</h3>
              </div>
            </div>

            {/* Recent Reports Table */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold">Recent Reports Requiring Attention</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase">
                      <th className="pb-3 px-3">ID</th>
                      <th className="pb-3 px-3">Issue Type</th>
                      <th className="pb-3 px-3">Location</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-3 font-mono text-cyan-400">{report.id}</td>
                        <td className="py-3 px-3 font-semibold uppercase">{report.issueType}</td>
                        <td className="py-3 px-3 text-slate-300">{report.address}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-full font-medium ${
                            report.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {report.verificationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 flex items-center gap-2">
                          {report.verificationStatus !== 'VERIFIED' && (
                            <button
                              onClick={() => onVerifyReport(report.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                            >
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedReportForAction(report);
                              setShowPublishModal(true);
                            }}
                            disabled={report.verificationStatus !== 'VERIFIED'}
                            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 ${
                              report.verificationStatus === 'VERIFIED'
                                ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Send className="w-3 h-3" />
                            <span>Publish Complaint</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* All Reports & Verification Tab */}
        {(adminTab === 'reports' || adminTab === 'pending') && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">All User Accessibility Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">{report.id}</span>
                      <h3 className="font-bold text-base mt-1">{report.title}</h3>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400">{report.verificationStatus}</span>
                  </div>

                  <img src={report.imageUrl} alt={report.title} className="w-full h-40 object-cover rounded-2xl bg-slate-900 border border-slate-700" />
                  <p className="text-xs text-slate-300">{report.description}</p>

                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    {report.verificationStatus !== 'VERIFIED' && (
                      <button
                        onClick={() => onVerifyReport(report.id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Verify Report
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedReportForAction(report);
                        setShowPublishModal(true);
                      }}
                      disabled={report.verificationStatus !== 'VERIFIED'}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 ${
                        report.verificationStatus === 'VERIFIED'
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish Complaint</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Government Departments Management Tab */}
        {adminTab === 'departments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Authorized Government Departments</h2>
              <button
                onClick={() => alert('Add department modal')}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
              >
                + Add Department
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {departments.map((dept) => (
                <div key={dept.id} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-3">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">{dept.type}</span>
                  <h3 className="font-bold text-white text-base">{dept.name}</h3>
                  <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <p>Officer: <strong className="text-white">{dept.officerName}</strong></p>
                    <p>Email: <strong className="text-cyan-400">{dept.email}</strong></p>
                    <p>Phone: {dept.phone}</p>
                    <p>Jurisdiction: {dept.jurisdiction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Publish Complaint Modal */}
      {showPublishModal && selectedReportForAction && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-cyan-500/40 text-white space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold">Publish Official Government Complaint</h3>
                <p className="text-xs text-slate-400">Report ID: {selectedReportForAction.id}</p>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Recipient Department</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-cyan-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Formal Letter Preview */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
                <p className="font-bold text-white">Subject: Complaint Regarding Accessibility Infrastructure – {selectedReportForAction.issueType}</p>
                <p>To, The Concerned Government Authority.</p>
                <p>We bring to your attention an accessibility issue reported via AccessMap AI.</p>
                <p>Location: {selectedReportForAction.address}</p>
                <p>Description: {selectedReportForAction.description}</p>
                <p>Report ID: {selectedReportForAction.id}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onPublishComplaint(selectedReportForAction.id, selectedDeptId);
                  setShowPublishModal(false);
                  alert(`Official complaint published successfully for ${selectedReportForAction.id}!`);
                }}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 hover:from-cyan-500 hover:to-blue-500 transition-all cursor-pointer flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Confirm & Publish Complaint</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
