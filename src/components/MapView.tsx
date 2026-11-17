import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, AlertTriangle, X, Locate, Navigation, Clock, ChevronDown, ChevronUp, Square } from 'lucide-react';
import { Report, RouteOption } from '../types';
import { getImageDeadlineInfo } from '../utils/imageDeadline';

interface MapViewProps {
  reports: Report[];
  activeRoute?: RouteOption | null;
  onClearRoute?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({ reports, activeRoute, onClearRoute }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 12.9141, lng: 74.8560 });
  const [gpsStatus, setGpsStatus] = useState<string>('Mangaluru City Center (OSM)');
  const [showSteps, setShowSteps] = useState<boolean>(false);

  const filteredReports = reports.filter((r) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'VERIFIED') return r.verificationStatus === 'VERIFIED';
    return r.issueType === filterType;
  });

  const getMarkerColor = (type: string, status: string, isExpired: boolean) => {
    if (isExpired) return '#64748B'; // Muted slate for expired evidence
    if (status === 'VERIFIED') return '#10B981'; // Green
    switch (type) {
      case 'pothole': return '#EF4444'; // Red
      case 'damaged_footpath': return '#F59E0B'; // Orange
      case 'blocked_ramp': return '#EAB308'; // Yellow
      case 'construction': return '#8B5CF6'; // Purple
      default: return '#3B82F6'; // Blue
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      routeLayerRef.current = L.layerGroup().addTo(map);
      markersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = null;
        routeLayerRef.current = null;
      }
    };
  }, []);

  // Update obstacle markers when filteredReports changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = markersRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    filteredReports.forEach((report) => {
      const deadline = getImageDeadlineInfo(report.imageExpiryDate);
      const color = getMarkerColor(report.issueType, report.verificationStatus, deadline.isExpired);
      const borderStyle = deadline.isExpired ? '2px dashed #F87171' : '2px solid white';
      const symbol = deadline.isExpired ? '⌛' : '⚠️';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); border: ${borderStyle}; color: white; font-size: 14px;">${symbol}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: customIcon });
      marker.on('click', () => {
        setSelectedReport(report);
      });
      layerGroup.addLayer(marker);
    });
  }, [filteredReports]);

  // Recenter map only when user clicks My Location and no active route overrides viewport
  const recenterToCoords = (pos: { lat: number; lng: number }) => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([pos.lat, pos.lng], 15, { animate: true });
    }
  };

  // Plot activeRoute polyline + start/end pins whenever activeRoute changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayerRef.current;
    if (!map || !routeGroup) return;

    routeGroup.clearLayers();

    if (!activeRoute || !activeRoute.path || activeRoute.path.length < 2) return;

    const latLngs: [number, number][] = activeRoute.path.map((p) => [p.lat, p.lng]);

    // Outer glow polyline
    const glowLine = L.polyline(latLngs, {
      color: activeRoute.color || '#3B82F6',
      weight: 11,
      opacity: 0.28,
      lineCap: 'round',
      lineJoin: 'round',
    });

    // Main route polyline
    const mainLine = L.polyline(latLngs, {
      color: activeRoute.color || '#3B82F6',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    });

    routeGroup.addLayer(glowLine);
    routeGroup.addLayer(mainLine);

    const startPt = latLngs[0];
    const endPt = latLngs[latLngs.length - 1];

    const startIcon = L.divIcon({
      className: 'route-pin-start',
      html: `<div style="background:#10B981;color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;border:2.5px solid #fff;box-shadow:0 6px 14px rgba(0,0,0,0.45);">A</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const endIcon = L.divIcon({
      className: 'route-pin-end',
      html: `<div style="background:#3B82F6;color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;border:2.5px solid #fff;box-shadow:0 6px 14px rgba(0,0,0,0.45);">B</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const startMarker = L.marker(startPt, { icon: startIcon }).bindPopup(
      `<strong>Start</strong><br/>${activeRoute.startName || 'Origin'}`
    );
    const endMarker = L.marker(endPt, { icon: endIcon }).bindPopup(
      `<strong>Destination</strong><br/>${activeRoute.endName || 'Target'}`
    );

    routeGroup.addLayer(startMarker);
    routeGroup.addLayer(endMarker);

    map.fitBounds(mainLine.getBounds(), { padding: [70, 70], maxZoom: 16 });
  }, [activeRoute]);

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCenter(pos);
          setGpsStatus('GPS Location Acquired');
          recenterToCoords(pos);
        },
        () => {
          const fallback = { lat: 12.9141, lng: 74.8560 };
          setCenter(fallback);
          setGpsStatus('Mangaluru City Center (Default)');
          recenterToCoords(fallback);
          alert('GPS location unavailable. Centered on Mangaluru, Karnataka.');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      const fallback = { lat: 12.9141, lng: 74.8560 };
      setCenter(fallback);
      recenterToCoords(fallback);
    }
  };

  const selectedDeadline = selectedReport ? getImageDeadlineInfo(selectedReport.imageExpiryDate) : null;

  return (
    <div className="relative w-full h-[calc(100vh-80px)] flex flex-col">
      {/* Top Floating Map Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        {/* Filters */}
        <div className="glass-panel p-2 rounded-2xl flex items-center gap-1.5 pointer-events-auto shadow-xl border border-slate-700 overflow-x-auto max-w-full">
          <Filter className="w-4 h-4 text-blue-400 ml-2 mr-1 shrink-0" />
          {['ALL', 'pothole', 'blocked_ramp', 'damaged_footpath', 'VERIFIED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterType === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {tab.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* View Mode & GPS Locate Toggle */}
        <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 pointer-events-auto shadow-xl border border-slate-700">
          <button
            onClick={handleLocateMe}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 transition-all cursor-pointer"
            title="Recenter GPS / Mangalore Location"
          >
            <Locate className="w-3.5 h-3.5" />
            <span>My Location</span>
          </button>
        </div>
      </div>

      {/* Active Navigation HUD Banner */}
      {activeRoute && (
        <div className="absolute top-20 left-4 z-20 w-[calc(100%-2rem)] max-w-sm glass-panel rounded-2xl p-4 shadow-2xl border border-blue-500/40 text-white space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: activeRoute.color }}
              >
                <Navigation className="w-3 h-3" />
                <span>{activeRoute.title}</span>
              </span>
              <p className="text-xs text-slate-300 mt-1.5 line-clamp-1">
                <strong className="text-emerald-400">A:</strong> {activeRoute.startName || 'Start'}
              </p>
              <p className="text-xs text-slate-300 line-clamp-1">
                <strong className="text-blue-400">B:</strong> {activeRoute.endName || 'Destination'}
              </p>
            </div>
            {onClearRoute && (
              <button
                onClick={onClearRoute}
                className="px-2.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                title="End Navigation"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>End</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs tabular-nums">
            <div className="bg-slate-900/70 rounded-xl p-2">
              <span className="text-slate-400 block text-[10px]">Distance</span>
              <strong className="text-white">{activeRoute.distance}</strong>
            </div>
            <div className="bg-slate-900/70 rounded-xl p-2">
              <span className="text-slate-400 block text-[10px]">Duration</span>
              <strong className="text-cyan-300">{activeRoute.duration}</strong>
            </div>
            <div className="bg-slate-900/70 rounded-xl p-2">
              <span className="text-slate-400 block text-[10px]">Obstacles</span>
              <strong className={activeRoute.obstacleCount === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                {activeRoute.obstacleCount}
              </strong>
            </div>
          </div>

          {activeRoute.steps && activeRoute.steps.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowSteps((s) => !s)}
                className="w-full flex items-center justify-between text-xs text-blue-300 hover:text-blue-200 font-semibold py-1 cursor-pointer"
              >
                <span>Turn-by-Turn Directions ({activeRoute.steps.length})</span>
                {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showSteps && (
                <ol className="mt-1.5 max-h-36 overflow-y-auto space-y-1.5 text-[11px] text-slate-300 pl-4 list-decimal">
                  {activeRoute.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      )}

      {/* OpenStreetMap Container */}
      <div className="flex-1 w-full relative z-10">
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Selected Obstacle Information Card */}
      {selectedReport && selectedDeadline && (
        <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-30 glass-panel rounded-3xl p-6 shadow-2xl border border-blue-500/40 text-white animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {selectedReport.issueType.replace('_', ' ')}
              </span>
              <h3 className="text-lg font-bold mt-2 text-white">{selectedReport.title}</h3>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="relative h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
              <img
                src={selectedReport.imageUrl}
                alt={selectedReport.title}
                className={`w-full h-full object-cover ${selectedDeadline.isExpired ? 'opacity-60 grayscale-[45%]' : ''}`}
              />
              <div className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border flex items-center gap-1 tabular-nums ${selectedDeadline.badgeClass}`}>
                {selectedDeadline.isExpired ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                <span>{selectedDeadline.shortLabel}</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2">{selectedReport.description}</p>

            <div className="grid grid-cols-3 gap-2 pt-2 text-xs border-t border-slate-800">
              <div>
                <span className="text-slate-400 block">Status</span>
                <span className="font-semibold text-emerald-400">{selectedReport.verificationStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Photo Deadline</span>
                <span className={`font-semibold ${selectedDeadline.isExpired ? 'text-red-400' : selectedDeadline.isExpiringSoon ? 'text-amber-300' : 'text-cyan-300'}`}>
                  {selectedDeadline.expiryFormatted}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Votes</span>
                <span className="font-semibold text-white">{selectedReport.stillPresentVotes} Active</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() =>
                  alert(
                    `Report ID: ${selectedReport.id}\nLocation: ${selectedReport.address}\nPhoto Deadline: ${selectedDeadline.label} (${selectedDeadline.expiryFormatted})\nAI Confidence: ${Math.round(selectedReport.aiConfidence * 100)}%`
                  )
                }
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                View Full Details & Deadline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend Footer */}
      <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-4 glass-panel px-4 py-2.5 rounded-2xl border border-slate-700 text-xs text-slate-300 shadow-xl">
        <span className="font-semibold text-white">OpenStreetMap ({gpsStatus}):</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Pothole</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Damaged Footpath</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400" /> Blocked Ramp</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Verified</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-500 border border-dashed border-red-400" /> Expired Photo</span>
      </div>
    </div>
  );
};
