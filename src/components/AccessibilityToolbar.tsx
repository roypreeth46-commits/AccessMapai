import React, { useState } from 'react';
import { Eye, Volume2, Type, Globe, Mic, Settings, X, Shield, Sparkles } from 'lucide-react';
import { AccessibilitySettings } from '../types';

interface AccessibilityToolbarProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  settings,
  onUpdateSettings,
  isOpen,
  onClose,
}) => {
  const [speechStatus, setSpeechStatus] = useState<string>('Ready');

  const speakText = (text: string) => {
    if (!settings.textToSpeechEnabled && !settings.screenReaderMode) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
      setSpeechStatus('Speaking...');
      utterance.onend = () => setSpeechStatus('Ready');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 text-white shadow-2xl border border-blue-500/30">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Accessibility Toolbar</h2>
              <p className="text-xs text-slate-400">Customize your viewing and navigation experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            aria-label="Close accessibility settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Text Size Control */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-blue-400" />
              <div>
                <span className="font-medium block">Text Size</span>
                <span className="text-xs text-slate-400">Current: {Math.round(settings.textSizeMultiplier * 100)}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newSize = Math.max(1.0, settings.textSizeMultiplier - 0.15);
                  onUpdateSettings({ textSizeMultiplier: newSize });
                  speakText(`Text size decreased to ${Math.round(newSize * 100)} percent`);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-sm font-semibold transition-colors"
              >
                A-
              </button>
              <button
                onClick={() => {
                  const newSize = Math.min(1.5, settings.textSizeMultiplier + 0.15);
                  onUpdateSettings({ textSizeMultiplier: newSize });
                  speakText(`Text size increased to ${Math.round(newSize * 100)} percent`);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-sm font-semibold transition-colors"
              >
                A+
              </button>
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="font-medium block">High Contrast Mode</span>
                <span className="text-xs text-slate-400">Enhance border and text readability</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => {
                  onUpdateSettings({ highContrast: e.target.checked });
                  speakText(e.target.checked ? 'High contrast enabled' : 'High contrast disabled');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-purple-400" />
              <div>
                <span className="font-medium block">Reduce Motion Mode</span>
                <span className="text-xs text-slate-400">Minimize animations and transitions</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reduceMotion}
                onChange={(e) => {
                  onUpdateSettings({ reduceMotion: e.target.checked });
                  speakText(e.target.checked ? 'Reduce motion enabled' : 'Reduce motion disabled');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Text to Speech & Screen Reader Mode */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="font-medium block">Text-to-Speech & Voice Guidance</span>
                <span className="text-xs text-slate-400">Read alerts and navigation directions aloud ({speechStatus})</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.textToSpeechEnabled}
                onChange={(e) => {
                  const val = e.target.checked;
                  onUpdateSettings({ textToSpeechEnabled: val });
                  if (val) speakText('Text to speech guidance enabled.');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Language Selection */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-amber-400" />
              <div>
                <span className="font-medium block">Language</span>
                <span className="text-xs text-slate-400">Select interface language</span>
              </div>
            </div>
            <select
              value={settings.language}
              onChange={(e) => {
                onUpdateSettings({ language: e.target.value });
                speakText(`Language changed to ${e.target.value}`);
              }}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 transition-all cursor-pointer"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
};
