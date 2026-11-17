import React, { useState } from 'react';
import { Navigation, ShieldAlert, User, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: { name: string; email: string; role: 'user' | 'admin' }) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'admin'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'admin') {
      if (email.trim() === 'admin@gmail.com' && password === 'admin123456789') {
        onLoginSuccess({ name: 'System Administrator', email: 'admin@gmail.com', role: 'admin' });
      } else {
        setError('Invalid admin credentials. Access restricted to admin@gmail.com.');
      }
    } else if (mode === 'signup') {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all fields to sign up.');
        return;
      }
      onLoginSuccess({ name: name.trim(), email: email.trim(), role: 'user' });
    } else {
      // login
      if (!email.trim() || !password.trim()) {
        setError('Please enter your email and password.');
        return;
      }
      if (email.trim() === 'admin@gmail.com' && password === 'admin123456789') {
        onLoginSuccess({ name: 'System Administrator', email: 'admin@gmail.com', role: 'admin' });
      } else {
        const derivedName = email.split('@')[0];
        const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
        onLoginSuccess({ name: formattedName, email: email.trim(), role: 'user' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070B14]/95 backdrop-blur-2xl">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-blue-500/40 text-white animate-fadeIn">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
            <Navigation className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">AccessMap AI</h1>
          <p className="text-xs text-cyan-300 font-medium mt-1">Mangaluru, Karnataka • Accessible Navigation Platform</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-900 rounded-xl p-1 mb-6 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setEmail(''); setPassword(''); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${mode === 'login' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setEmail(''); setPassword(''); setName(''); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${mode === 'signup' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setMode('admin'); setEmail(''); setPassword(''); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${mode === 'admin' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {mode === 'admin' ? 'Admin Email' : 'Email Address'}
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'admin' ? 'admin@gmail.com' : 'name@example.com'}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'admin'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/25'
                : mode === 'signup'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-500/25'
            }`}
          >
            <span>
              {mode === 'admin' ? 'Access Admin Portal' : mode === 'signup' ? 'Create Account & Join' : 'Login to AccessMap AI'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {mode === 'admin' ? (
            <span>Admin Portal restricted strictly to authorized credentials.</span>
          ) : mode === 'signup' ? (
            <span>Already have an account? <button onClick={() => setMode('login')} className="text-blue-400 hover:underline">Login here</button></span>
          ) : (
            <span>New user? <button onClick={() => setMode('signup')} className="text-emerald-400 hover:underline">Sign up for free</button></span>
          )}
        </div>
      </div>
    </div>
  );
};
