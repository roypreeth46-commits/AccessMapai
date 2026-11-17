import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message || 'Unexpected application error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070B14] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-red-500/40 p-6 space-y-3 text-center">
            <h1 className="text-xl font-bold text-red-400">AccessMap AI Recovery</h1>
            <p className="text-sm text-slate-300">{this.state.errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
