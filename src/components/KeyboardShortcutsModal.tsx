import React from 'react';
import { Command, X, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'D', label: 'Go to Dashboard' },
    { key: 'M', label: 'Explore Interactive Map' },
    { key: 'T', label: 'Accessible Route Planning' },
    { key: 'R', label: 'Report an Accessibility Issue' },
    { key: 'C', label: 'Community Feed & Voting' },
    { key: 'S', label: 'Trigger SOS Emergency' },
    { key: 'A', label: 'Open Accessibility Settings' },
    { key: '?', label: 'Open Keyboard Shortcuts Help' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-blue-500/40 text-white space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
              <p className="text-xs text-slate-400">Power user navigation hotkeys</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-300 font-medium">{sc.label}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-800 text-blue-400 font-mono text-xs font-bold border border-slate-700 shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
