import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useDashboardData } from '../../context/DashboardDataContext';
import {
  Cpu,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  X,
  Camera,
  RotateCcw,
  UserCheck,
  Search,
  Filter,
  AlertTriangle,
  MapPin,
  Maximize2
} from 'lucide-react';

export const AIHazardDetection = () => {
  const { t, isRTL } = useLanguage();
  const { aiHazards, engineers, resolveAiHazard } = useDashboardData();

  const [selectedHazard, setSelectedHazard] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const totalImagesAnalyzed = 1420;
  const totalHazardsDetected = aiHazards.length + 32;
  const criticalHazards = aiHazards.filter((h) => h.severity === 'Critical').length + 8;
  const resolvedHazards = aiHazards.filter((h) => h.status === 'Resolved').length + 24;
  const pendingHazards = aiHazards.filter((h) => h.status === 'Pending Review').length;

  const filteredHazards = aiHazards.filter((h) => {
    if (activeFilter === 'PENDING' && h.status !== 'Pending Review') return false;
    if (activeFilter === 'RESOLVED' && h.status !== 'Resolved') return false;
    if (activeFilter === 'CRITICAL' && h.severity !== 'Critical') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        h.id.toLowerCase().includes(q) ||
        h.houseId.toLowerCase().includes(q) ||
        h.hazardName.toLowerCase().includes(q) ||
        h.engineerAssigned.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              AI Vision & Hazard Detection
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-purple-700" /> YOLOv8 Engine Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Deep learning neural networks auditing site photos for PPE non-compliance, scaffolding safety, and structural flaws
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Vision Model 98.4% Accuracy</span>
          </span>
        </div>
      </div>

      {/* Top 4 AI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 min-w-0">
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Photos Audited</span>
            <span className="text-2xl font-black text-slate-900 block font-mono">{totalImagesAnalyzed}</span>
            <span className="text-[10px] text-purple-700 font-bold">100% Geo-tagged & Validated</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Critical Detections</span>
            <span className="text-2xl font-black text-rose-700 block font-mono">{criticalHazards}</span>
            <span className="text-[10px] text-rose-600 font-bold">No-Helmet & Scaffolding Risks</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pending Review</span>
            <span className="text-2xl font-black text-amber-700 block font-mono">{pendingHazards} Sites</span>
            <span className="text-[10px] text-amber-700 font-bold">Awaiting Engineer Clearance</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Resolved & Cleared</span>
            <span className="text-2xl font-black text-emerald-800 block font-mono">{resolvedHazards}</span>
            <span className="text-[10px] text-emerald-700 font-bold">Rectification Proof Verified</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hazard name, house ID, engineer..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800 font-medium transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Hazards' },
            { id: 'PENDING', label: 'Pending Review' },
            { id: 'CRITICAL', label: 'Critical Only' },
            { id: 'RESOLVED', label: 'Resolved' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Hazards Visual Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredHazards.map((hazard) => (
          <div
            key={hazard.id}
            className={`bg-white rounded-3xl p-5 border shadow-2xs space-y-4 hover:shadow-md transition duration-200 flex flex-col justify-between ${
              hazard.status === 'Pending Review' ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200/80'
            }`}
          >
            <div>
              {/* Visual Image with Computer Vision Bounding Box Overlay */}
              <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-2xs">
                <img
                  src={hazard.imageUrl}
                  alt={hazard.hazardName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Bounding Box Visual Overlay */}
                {hazard.boundingBox && (
                  <div
                    style={{
                      top: hazard.boundingBox.y,
                      left: hazard.boundingBox.x,
                      width: hazard.boundingBox.width,
                      height: hazard.boundingBox.height,
                    }}
                    className="absolute border-2 border-rose-500 bg-rose-500/20 animate-pulse pointer-events-none rounded-lg"
                  >
                    <span className="absolute -top-6 left-0 bg-rose-600 text-white text-[9.5px] font-black px-2 py-0.5 rounded-md shadow-md">
                      {hazard.hazardName} ({hazard.confidence}%)
                    </span>
                  </div>
                )}

                {/* Top Status Tags on Image */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="font-mono text-[10.5px] font-black bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl">
                    {hazard.id} • {hazard.houseId}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black backdrop-blur-md ${
                      hazard.severity === 'Critical'
                        ? 'bg-rose-600/90 text-white'
                        : 'bg-amber-600/90 text-white'
                    }`}
                  >
                    {hazard.severity} Severity
                  </span>
                </div>

                {/* Bottom Confidence Bar */}
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl text-white flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Neural Model Confidence:</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-black">{hazard.confidence}%</span>
                </div>
              </div>

              {/* Hazard Metadata */}
              <div className="space-y-2.5 mt-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{hazard.hazardName}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-orange-600" />
                      <span>{hazard.houseAddress}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      hazard.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {hazard.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">Assigned Officer</span>
                    <span className="font-bold text-slate-800 truncate block">{hazard.engineerAssigned}</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">Detection Timestamp</span>
                    <span className="font-bold text-slate-800 block">{hazard.detectedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedHazard(hazard)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Inspect HD</span>
              </button>

              {hazard.status === 'Pending Review' ? (
                <button
                  onClick={() => resolveAiHazard(hazard.id)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Verify & Mark Resolved</span>
                </button>
              ) : (
                <div className="flex-1 py-2 bg-emerald-50 text-emerald-800 text-center text-xs font-bold rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Cleared in Audit</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: FULL HD EVIDENCE INSPECTOR */}
      {selectedHazard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedHazard.hazardName}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedHazard.id} • Site: {selectedHazard.houseId}</p>
              </div>
              <button
                onClick={() => setSelectedHazard(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-900">
              <img src={selectedHazard.imageUrl} alt="Hazard Full Evidence" className="w-full h-80 object-cover" />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">AI Classification Tag:</span>
                <span className="font-black text-slate-900">{selectedHazard.hazardName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Model Certainty Score:</span>
                <span className="font-mono font-black text-emerald-700">{selectedHazard.confidence}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">House Location:</span>
                <span className="font-bold text-slate-900">{selectedHazard.houseAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Field Engineer:</span>
                <span className="font-bold text-orange-700">{selectedHazard.engineerAssigned}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedHazard(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
