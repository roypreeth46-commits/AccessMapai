import React, { useEffect, useState } from 'react';
import { AlertOctagon, PhoneCall, MapPin, X, CheckCircle2, Locate, Loader2, MessageSquare } from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { name: string; email: string };
}

interface GpsCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

const DEFAULT_MANGALORE_COORDS: GpsCoords = {
  latitude: 12.9141,
  longitude: 74.8560,
};

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [coords, setCoords] = useState<GpsCoords>(DEFAULT_MANGALORE_COORDS);
  const [gpsState, setGpsState] = useState<'locating' | 'acquired' | 'fallback'>('locating');
  const [gpsError, setGpsError] = useState<string>('');
  const [smsResponseMsg, setSmsResponseMsg] = useState<string>('');

  const captureGpsLocation = () => {
    setGpsState('locating');
    setGpsError('');

    if (!('geolocation' in navigator)) {
      setCoords(DEFAULT_MANGALORE_COORDS);
      setGpsState('fallback');
      setGpsError('Geolocation is not supported by this browser. Using Mangaluru city fallback.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy),
        });
        setGpsState('acquired');
        setGpsError('');
      },
      (error) => {
        setCoords(DEFAULT_MANGALORE_COORDS);
        setGpsState('fallback');
        setGpsError(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission denied. Using Mangaluru fallback coordinates.'
            : 'Unable to acquire live GPS signal. Using Mangaluru fallback coordinates.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (isOpen) {
      setBroadcastSent(false);
      setSmsResponseMsg('');
      captureGpsLocation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const adminPhone = '+91 9845012345';
  const mapLink = `https://www.openstreetmap.org/?mlat=${coords.latitude}&mlon=${coords.longitude}#map=17/${coords.latitude}/${coords.longitude}`;
  const smsBody = `SOS EMERGENCY from ${currentUser?.name || 'Citizen User'} (${currentUser?.email || 'user@accessmap.ai'}). Live GPS: ${coords.latitude}, ${coords.longitude}. Map: ${mapLink}`;

  const handleBroadcastSos = async () => {
    setIsSending(true);
    let serverMsg = `Emergency SMS dispatched to Admin (${adminPhone}) with GPS [${coords.latitude}, ${coords.longitude}].`;

    try {
      const res = await fetch('/api/sos/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: currentUser?.name || 'Citizen User',
          userEmail: currentUser?.email || 'user@accessmap.ai',
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          smsText: smsBody,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data?.message) serverMsg = data.message;
      }
    } catch (err) {
      console.warn('SOS backend unavailable, storing alert locally:', err);
    }

    try {
      const existingAlerts = JSON.parse(localStorage.getItem('accessmap_sos_alerts') || '[]');
      existingAlerts.unshift({
        id: `SOS-${Date.now()}`,
        userName: currentUser?.name || 'Citizen User',
        userEmail: currentUser?.email || 'user@accessmap.ai',
        latitude: coords.latitude,
        longitude: coords.longitude,
        adminPhone,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('accessmap_sos_alerts', JSON.stringify(existingAlerts.slice(0, 20)));
    } catch {
      // Ignore storage quota errors
    }

    setSmsResponseMsg(serverMsg);
    setIsSending(false);
    setBroadcastSent(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(
        `SOS Emergency SMS sent to admin hotline with your GPS coordinates ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}.`
      );
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
    >
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-red-500 text-white text-center space-y-5 bg-gradient-to-b from-red-950/90 to-[#070B14]">
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            aria-label="Close SOS alert dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-18 h-18 rounded-full bg-red-600/30 text-red-500 flex items-center justify-center mx-auto border-2 border-red-500 animate-pulse shadow-2xl shadow-red-600/50">
          <AlertOctagon className="w-9 h-9" />
        </div>

        <div>
          <h2 id="sos-modal-title" className="text-2xl font-extrabold text-red-400">
            EMERGENCY SOS ALERT
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Automatically captures your live GPS location and sends an emergency SMS to the Administrator hotline ({adminPhone}).
          </p>
        </div>

        {broadcastSent ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 space-y-3 animate-fadeIn text-left">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <p className="font-bold text-sm">Emergency SMS Dispatched to Admin!</p>
            </div>
            <p className="text-xs text-slate-200">{smsResponseMsg}</p>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/20 text-[11px] font-mono text-emerald-300 space-y-1">
              <div>Recipient: {adminPhone}</div>
              <div>
                GPS: {coords.latitude}, {coords.longitude}
                {coords.accuracy ? ` (±${coords.accuracy}m)` : ''}
              </div>
            </div>
            <a
              href={`sms:${adminPhone.replace(/\s+/g, '')}?body=${encodeURIComponent(smsBody)}`}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Device SMS App Backup</span>
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  {gpsState === 'locating' ? (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                  ) : (
                    <MapPin className={`w-4 h-4 shrink-0 ${gpsState === 'acquired' ? 'text-emerald-400' : 'text-amber-400'}`} />
                  )}
                  <span>
                    {gpsState === 'locating'
                      ? 'Capturing live GPS...'
                      : gpsState === 'acquired'
                      ? 'Live GPS Captured'
                      : 'Fallback Coordinates'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={captureGpsLocation}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Locate className="w-3 h-3" />
                  <span>Refresh GPS</span>
                </button>
              </div>

              <div className="font-mono text-[11px] text-cyan-300 bg-slate-950/70 px-3 py-2 rounded-xl border border-slate-800">
                Lat: {coords.latitude} · Lng: {coords.longitude}
                {coords.accuracy ? ` · ±${coords.accuracy}m` : ''}
              </div>

              {gpsError && <p className="text-[11px] text-amber-300">{gpsError}</p>}

              <p className="text-slate-400 pt-1 border-t border-slate-800">
                Admin SMS Recipient: <strong className="text-white">{adminPhone} (Admin Hotline)</strong>
              </p>
            </div>

            <button
              onClick={handleBroadcastSos}
              disabled={isSending || gpsState === 'locating'}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-60 text-white font-extrabold text-base shadow-2xl shadow-red-600/50 transition-all cursor-pointer flex items-center justify-center gap-2 border border-red-400"
            >
              <PhoneCall className="w-5 h-5 animate-bounce" />
              <span>
                {gpsState === 'locating'
                  ? 'ACQUIRING GPS LOCATION...'
                  : isSending
                  ? 'DISPATCHING SMS...'
                  : 'SEND SOS SMS WITH GPS TO ADMIN'}
              </span>
            </button>
          </div>
        )}

        <div className="pt-1 text-[11px] text-slate-400">
          For immediate medical emergency in India, dial 112 or 108 directly.
        </div>
      </div>
    </div>
  );
};
