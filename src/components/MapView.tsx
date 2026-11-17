import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Layers, Navigation, Filter, AlertTriangle, ShieldCheck, CheckCircle2, X, Locate } from 'lucide-react';
import { Report } from '../types';

interface MapViewProps {
  reports: Report[];
}

export const MapView: React.FC<MapViewProps> = ({ reports }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [is3D, setIs3D] = useState<boolean>(true);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 12.9141, lng: 74.8560 });
  const [gpsStatus, setGpsStatus] = useState<string>('Mangaluru City Center (OSM)');

  const filteredReports = reports.filter((r) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'VERIFIED') return r.verificationStatus === 'VERIFIED';
    return r.issueType === filterType;
  });

  const getMarkerColor = (type: string, status: string) => {
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

      // Add OpenStreetMap Tile Layer with dark/carto styling or standard OSM
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when filteredReports or center changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = markersRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    filteredReports.forEach((report) => {
      const color = getMarkerColor(report.issueType, report.verificationStatus);
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); border: 2px solid white; color: white;">⚠️</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: customIcon });
      marker.on('click', () => {
        setSelectedReport(report);
      });
      layerGroup.addLayer(marker);
    });

    map.setView([center.lat, center.lng], map.getZoom());
  }, [filteredReports, center]);

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCenter(pos);
          setGpsStatus('GPS Location Acquired');
        },
        () => {
          setCenter({ lat: 12.9141, lng: 74.8560 });
          setGpsStatus('Mangaluru City Center (Default)');
          alert('GPS location unavailable. Centered on Mangaluru, Karnataka.');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setCenter({ lat: 12.9141, lng: 74.8560 });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-80px)] flex flex-col">
      {/* Top Floating Map Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        {/* Filters */}
        <div className="glass-panel p-2 rounded-2xl flex items-center gap-1.5 pointer-events-auto shadow-xl border border-slate-700">
          <Filter className="w-4 h-4 text-blue-400 ml-2 mr-1" />
          {['ALL', 'pothole', 'blocked_ramp', 'damaged_footpath', 'VERIFIED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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

      {/* OpenStreetMap Container */}
      <div className="flex-1 w-full relative z-10">
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Selected Obstacle Information Card */}
      {selectedReport && (
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
              <img src={selectedReport.imageUrl} alt={selectedReport.title} className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-slate-300 line-clamp-2">{selectedReport.description}</p>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-800">
              <div>
                <span className="text-slate-400 block">Status</span>
                <span className="font-semibold text-emerald-400">{selectedReport.verificationStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Community Votes</span>
                <span className="font-semibold text-white">{selectedReport.stillPresentVotes} Still Present</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => alert(`Report ID: ${selectedReport.id}\nLocation: ${selectedReport.address}\nAI Confidence: ${Math.round(selectedReport.aiConfidence * 100)}%`)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                View Full Details & Voting
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
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500" /> Construction</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Verified Safe</span>
      </div>
    </div>
  );
};
