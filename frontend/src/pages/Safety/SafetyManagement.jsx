import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useDashboardData } from '../../context/DashboardDataContext';
import { generateDomainPdf } from '../../utils/pdfGenerator';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Eye,
  Check,
  X,
  HardHat,
  RotateCcw,
  Camera,
  ShieldCheck,
  UserCheck,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Download
} from 'lucide-react';

export const SafetyManagement = () => {
  const { t, isRTL } = useLanguage();
  const {
    safetyIssues,
    houses,
    engineers,
    resolveSafetyIssue,
    assignSafetyIssue,
    logSafetyViolation
  } = useDashboardData();

  const [activeSeverity, setActiveSeverity] = useState('ALL');
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isLogViolationModalOpen, setIsLogViolationModalOpen] = useState(false);
  const [assignEngineerModalIssue, setAssignEngineerModalIssue] = useState(null);
  const [selectedEngineerName, setSelectedEngineerName] = useState(engineers[0]?.name || '');
  const [selectedIssueDetail, setSelectedIssueDetail] = useState(null);
  const [resolveModalIssue, setResolveModalIssue] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Log Violation Form State
  const [violationForm, setViolationForm] = useState({
    houseId: houses[0]?.id || '',
    issueType: 'Worker without helmet',
    severity: 'High',
    assignedEngineer: engineers[0]?.name || '',
    description: '',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18015f5?w=600&auto=format&fit=crop&q=80',
  });

  const totalOpen = safetyIssues.filter((s) => s.status === 'Open').length;
  const criticalCount = safetyIssues.filter((s) => s.severity === 'Critical' && s.status === 'Open').length;
  const resolvedCount = safetyIssues.filter((s) => s.status === 'Resolved').length;
  const totalReports = safetyIssues.length;

  const filteredIssues = safetyIssues.filter((s) => {
    if (activeSeverity !== 'ALL' && s.severity !== activeSeverity) return false;
    if (activeStatus === 'OPEN' && s.status !== 'Open') return false;
    if (activeStatus === 'RESOLVED' && s.status !== 'Resolved') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.houseId.toLowerCase().includes(q) ||
        s.issueType.toLowerCase().includes(q) ||
        s.assignedEngineer.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleLogViolationSubmit = (e) => {
    e.preventDefault();
    const targetHouse = houses.find((h) => h.id === violationForm.houseId) || houses[0];
    logSafetyViolation({
      houseId: targetHouse.id,
      houseAddress: targetHouse.address,
      issueType: violationForm.issueType,
      severity: violationForm.severity,
      assignedEngineer: violationForm.assignedEngineer,
      description: violationForm.description,
      photoUrl: violationForm.photoUrl,
    });
    setIsLogViolationModalOpen(false);
    setViolationForm({
      houseId: houses[0]?.id || '',
      issueType: 'Worker without helmet',
      severity: 'High',
      assignedEngineer: engineers[0]?.name || '',
      description: '',
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18015f5?w=600&auto=format&fit=crop&q=80',
    });
  };

  const handleAssignEngineerSubmit = (e) => {
    e.preventDefault();
    if (assignEngineerModalIssue && selectedEngineerName) {
      assignSafetyIssue(assignEngineerModalIssue.id, selectedEngineerName);
      setAssignEngineerModalIssue(null);
    }
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (resolveModalIssue) {
      resolveSafetyIssue(resolveModalIssue.id, resolutionNotes);
      setResolveModalIssue(null);
      setResolutionNotes('');
      if (selectedIssueDetail?.id === resolveModalIssue.id) {
        setSelectedIssueDetail(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {isRTL ? 'سیفٹی اور ماحولیاتی تحفظ (HSE)' : 'Safety & HSE Management'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800">
              {isRTL ? 'زیرو ٹالرینس پروٹوکول' : 'Zero Tolerance Protocol'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRTL
              ? 'سائٹ پر حفاظتی خطرات، مزدوروں کے حفاظتی سامان کی جانچ اور فوری اصلاحی احکامات'
              : 'Monitor HSE hazards, worker PPE compliance, scaffolding integrity, and dispatch immediate stop-work or rectification orders'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              generateDomainPdf({
                domain: 'SAFETY',
                safetyIssues: filteredIssues,
                districtFilter: activeSeverity === 'ALL' ? 'All Severity Levels' : `${activeSeverity} Severity`,
                dateRange: 'All Open & Closed'
              });
            }}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4 text-rose-600" />
            <span>{isRTL ? 'سیفٹی رپورٹ پی ڈی ایف' : 'Export Safety Dossier (PDF)'}</span>
          </button>

          <button
            onClick={() => setIsLogViolationModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-orange-600 to-rose-700 hover:from-rose-700 hover:to-orange-700 text-white text-xs font-extrabold shadow-md shadow-rose-500/25 flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{isRTL ? 'سیفٹی مسئلہ درج کریں' : 'Log Safety Incident'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 min-w-0">
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
              {isRTL ? 'زیر کارروائی مسائل' : 'Open Incidents'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-700 block truncate">
              <span className="font-mono ltr-isolate">{totalOpen}</span> {isRTL ? 'فعال' : 'Active'}
            </span>
            <span className="text-[10px] text-amber-700 font-bold block truncate">
              {isRTL ? 'فوری کارروائی درکار' : 'Field Action Required'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
              {isRTL ? 'کام روکنے کے احکامات' : 'Stop-Work Orders'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-rose-700 block truncate">
              <span className="font-mono ltr-isolate">{criticalCount}</span> {isRTL ? 'شدید خطرہ' : 'Critical'}
            </span>
            <span className="text-[10px] text-rose-600 font-bold block truncate">
              {isRTL ? 'فوری خطرہ ختم کریں' : 'Immediate Hazard Clearance'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
              {isRTL ? 'حل شدہ مسائل' : 'Rectified & Closed'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-800 block truncate">
              <span className="font-mono ltr-isolate">{resolvedCount}</span> {isRTL ? 'مسائل' : 'Issues'}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold block truncate">
              {isRTL ? 'انجینئرز سے تصدیق شدہ' : 'Audit Verified by Engineers'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
              {isRTL ? 'سیفٹی انڈیکس' : 'HSE Safety Index'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-purple-900 block truncate font-mono ltr-isolate">
              94.8%
            </span>
            <span className="text-[10px] text-purple-700 font-bold block truncate">
              {isRTL ? 'اعلیٰ تعمیل کا درجہ' : 'High Compliance Tier'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className={`h-4 w-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-2.5 pointer-events-none`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'خطرے کی نوعیت، مکان نمبر یا انجینئر سے تلاش کریں...' : 'Search hazard type, house ID, engineer...'}
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800 font-medium transition`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: 'ALL', label: isRTL ? 'تمام درجات' : 'All Severities' },
              { id: 'Critical', label: isRTL ? 'شدید خطرہ' : 'Critical' },
              { id: 'High', label: isRTL ? 'زیادہ خطرہ' : 'High' },
              { id: 'Medium', label: isRTL ? 'درمیانہ' : 'Medium' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSeverity(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  activeSeverity === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveStatus('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeStatus === 'ALL' ? 'bg-orange-50 text-orange-900 border border-orange-200 font-extrabold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isRTL ? 'تمام' : 'All'}
            </button>
            <button
              onClick={() => setActiveStatus('OPEN')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeStatus === 'OPEN' ? 'bg-rose-50 text-rose-900 border border-rose-200 font-extrabold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isRTL ? 'زیر التواء' : 'Open'} (<span className="ltr-isolate">{totalOpen}</span>)
            </button>
            <button
              onClick={() => setActiveStatus('RESOLVED')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeStatus === 'RESOLVED' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-extrabold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isRTL ? 'حل شدہ' : 'Resolved'} (<span className="ltr-isolate">{resolvedCount}</span>)
            </button>
          </div>
        </div>
      </div>

      {/* Safety Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className={`bg-white rounded-3xl p-5 border shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md transition duration-200 ${
              issue.severity === 'Critical' && issue.status === 'Open'
                ? 'border-rose-300 ring-2 ring-rose-100'
                : 'border-slate-200/80'
            }`}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {issue.id}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      issue.severity === 'Critical'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : issue.severity === 'High'
                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {issue.severity}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      issue.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {issue.status}
                  </span>
                </div>
              </div>

              {/* Title & House */}
              <div>
                <h3 className="text-sm font-black text-slate-900 leading-snug">{issue.issueType}</h3>
                <div className="text-xs font-bold text-orange-700 font-mono mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-orange-600" />
                  <span>{issue.houseId} — {issue.houseAddress}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{issue.description}</p>

              {/* Photo Evidence Preview */}
              {issue.photoUrl && (
                <div
                  className="rounded-2xl overflow-hidden h-36 border border-slate-200 relative group cursor-pointer shadow-2xs"
                  onClick={() => setSelectedIssueDetail(issue)}
                >
                  <img src={issue.photoUrl} alt="Safety Evidence" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs gap-1.5 backdrop-blur-2xs">
                    <Eye className="h-4 w-4" /> <span>View Evidence Photo</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions & Assigned Engineer */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Assigned Officer:</span>
                <span className="font-bold text-slate-900 truncate max-w-[170px]">{issue.assignedEngineer}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {issue.status === 'Open' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setResolveModalIssue(issue)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Mark Resolved</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAssignEngineerModalIssue(issue);
                        setSelectedEngineerName(issue.assignedEngineer || engineers[0]?.name);
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                      title="Reassign Engineer"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-full py-2 bg-emerald-50 text-emerald-800 text-center text-xs font-bold rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Rectified & Closed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: LOG SAFETY VIOLATION */}
      {isLogViolationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Log Safety Incident / Defect
                </h3>
                <p className="text-xs text-slate-500">Field HSE Non-Compliance Record</p>
              </div>
              <button
                onClick={() => setIsLogViolationModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleLogViolationSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Select House Site
                  </label>
                  <select
                    value={violationForm.houseId}
                    onChange={(e) => setViolationForm({ ...violationForm, houseId: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                  >
                    {houses.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.id} — {h.ownerName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Severity Level
                  </label>
                  <select
                    value={violationForm.severity}
                    onChange={(e) => setViolationForm({ ...violationForm, severity: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                  >
                    <option value="Critical">Critical (Immediate Stop Work)</option>
                    <option value="High">High Severity</option>
                    <option value="Medium">Medium Severity</option>
                    <option value="Low">Low / Advisory</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Safety Issue Type
                  </label>
                  <select
                    value={violationForm.issueType}
                    onChange={(e) => setViolationForm({ ...violationForm, issueType: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                  >
                    <option value="Worker without helmet">Worker without helmet</option>
                    <option value="Missing PPE">Missing PPE</option>
                    <option value="Unsafe scaffolding">Unsafe scaffolding</option>
                    <option value="Electrical hazard">Electrical hazard</option>
                    <option value="Working at height without harness">Working at height without harness</option>
                    <option value="Unsafe material storage">Unsafe material storage</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Assigned Field Officer
                  </label>
                  <select
                    value={violationForm.assignedEngineer}
                    onChange={(e) => setViolationForm({ ...violationForm, assignedEngineer: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                  >
                    {engineers.map((eng) => (
                      <option key={eng.id} value={eng.name}>{eng.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Incident Description
                </label>
                <textarea
                  value={violationForm.description}
                  onChange={(e) => setViolationForm({ ...violationForm, description: e.target.value })}
                  placeholder="Describe observed hazard on site..."
                  rows={2}
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogViolationModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
                >
                  Log Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESOLVE INCIDENT */}
      {resolveModalIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-emerald-800">
                Mark Issue Resolved: {resolveModalIssue.id}
              </h3>
              <button
                onClick={() => setResolveModalIssue(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Corrective Action Notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Scaffolding planks secured with steel clamps; helmets distributed."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalIssue(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REASSIGN ENGINEER */}
      {assignEngineerModalIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                Reassign Rectification Officer
              </h3>
              <button
                onClick={() => setAssignEngineerModalIssue(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignEngineerSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Select Field Engineer
                </label>
                <select
                  value={selectedEngineerName}
                  onChange={(e) => setSelectedEngineerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                >
                  {engineers.map((eng) => (
                    <option key={eng.id} value={eng.name}>{eng.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignEngineerModalIssue(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
                >
                  Assign Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: FULL EVIDENCE PHOTO VIEWER */}
      {selectedIssueDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedIssueDetail.issueType}</h3>
                <span className="text-xs font-mono text-orange-700 font-bold">{selectedIssueDetail.houseId}</span>
              </div>
              <button
                onClick={() => setSelectedIssueDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden max-h-[350px] border border-slate-200">
              <img src={selectedIssueDetail.photoUrl} alt="Full Evidence" className="w-full h-full object-cover" />
            </div>

            <p className="text-xs text-slate-600">{selectedIssueDetail.description}</p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedIssueDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Close Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
