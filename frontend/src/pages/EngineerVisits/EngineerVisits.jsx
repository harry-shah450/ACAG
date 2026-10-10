import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useDashboardData } from '../../context/DashboardDataContext';
import { generateDomainPdf, generateEngineerVisitCertificatePdf } from '../../utils/pdfGenerator';
import {
  ClipboardCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Check,
  X,
  HardHat,
  Users,
  ShieldAlert,
  CloudSun,
  Camera,
  Cpu,
  RotateCcw,
  Sparkles,
  Download
} from 'lucide-react';

export const EngineerVisits = () => {
  const { t, isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const highlightVisitId = searchParams.get('visitId');
  const initialFilter = searchParams.get('filter') || 'ALL';

  const {
    visits,
    houses,
    engineers,
    scheduleVisit,
    approveVisitReport,
    requestReInspection,
  } = useDashboardData();

  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState(highlightVisitId || '');

  React.useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setActiveFilter(filterParam);
    }
  }, [searchParams]);

  const [selectedVisitReport, setSelectedVisitReport] = useState(
    highlightVisitId ? visits.find((v) => v.id === highlightVisitId) || null : null
  );

  // Modal States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    houseId: houses[0]?.id || '',
    engineerId: engineers[0]?.id || '',
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: '10:00 AM',
    visitType: 'Construction Inspection',
    purpose: '',
    notes: '',
  });

  const [reInspectionModalVisit, setReInspectionModalVisit] = useState(null);
  const [reInspectionReason, setReInspectionReason] = useState('');

  // Filtered visits
  const filteredVisits = visits.filter((v) => {
    if (activeFilter === 'SCHEDULED' && v.status !== 'Scheduled') return false;
    if (activeFilter === 'COMPLETED' && v.status !== 'Completed') return false;
    if (activeFilter === 'PENDING_APPROVAL' && (v.status !== 'Completed' || v.adminApproved)) return false;
    if (activeFilter === 'RE_INSPECTION' && !v.reInspectionRequired) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.id.toLowerCase().includes(q) ||
        v.houseId.toLowerCase().includes(q) ||
        v.engineerName.toLowerCase().includes(q) ||
        v.visitType.toLowerCase().includes(q) ||
        v.houseAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    const targetHouse = houses.find((h) => h.id === scheduleForm.houseId) || houses[0];
    const targetEngineer = engineers.find((eng) => eng.id === Number(scheduleForm.engineerId)) || engineers[0];

    scheduleVisit({
      houseId: targetHouse.id,
      houseAddress: targetHouse.address,
      engineerId: targetEngineer.id,
      engineerName: targetEngineer.name,
      visitType: scheduleForm.visitType,
      visitDate: scheduleForm.visitDate,
      visitTime: scheduleForm.visitTime,
      purpose: scheduleForm.purpose || 'Site quality inspection',
      progressPctReported: targetHouse.progressPct,
      workersPresent: targetHouse.workersCount || 4,
      trainingProvided: null,
      safetyChecklist: null,
      environmentalConditions: null,
      issuesFound: [],
      engineerRemarks: scheduleForm.notes || '',
      photos: [],
      aiHazardResult: null,
    });

    setIsScheduleModalOpen(false);
  };

  const handleReInspectionSubmit = (e) => {
    e.preventDefault();
    if (reInspectionModalVisit) {
      requestReInspection(reInspectionModalVisit.id, reInspectionReason);
      setReInspectionModalVisit(null);
      setReInspectionReason('');
      if (selectedVisitReport?.id === reInspectionModalVisit.id) {
        setSelectedVisitReport(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {isRTL ? 'فیلڈ معائنہ اور انجینئر دورے' : 'Engineer Visits & Field Inspections'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRTL
              ? 'انجینئرز کے دورے شیڈول کریں، مراحل کی تصدیق، سیفٹی آڈٹ اور اے آئی خطرات کا جائزہ لیں'
              : 'Schedule engineer visits, verify stage completion, inspect worker safety, and review AI hazard audits'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              generateDomainPdf({
                domain: 'ENGINEERS',
                engineers,
                visits: filteredVisits,
                dateRange: 'All Visits',
                districtFilter: 'All Divisions'
              });
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4 text-orange-600" />
            <span>{isRTL ? 'پی ڈی ایف ایکسپورٹ' : 'Export Visits Log (PDF)'}</span>
          </button>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-extrabold shadow-md shadow-orange-500/25 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{isRTL ? 'نیا دورہ شیڈول کریں' : 'Schedule New Visit'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'ALL', label: isRTL ? 'تمام دورے' : 'All Visits', count: visits.length },
          { id: 'SCHEDULED', label: isRTL ? 'شیڈول شدہ دورے' : 'Upcoming Scheduled', count: visits.filter((v) => v.status === 'Scheduled').length },
          { id: 'COMPLETED', label: isRTL ? 'مکمل شدہ دورے' : 'Completed Visits', count: visits.filter((v) => v.status === 'Completed').length },
          { id: 'PENDING_APPROVAL', label: isRTL ? 'زیر جائزہ دورے' : 'Pending Admin Approval', count: visits.filter((v) => v.status === 'Completed' && !v.adminApproved).length },
          { id: 'RE_INSPECTION', label: isRTL ? 'دوبارہ معائنہ مطلوب' : 'Re-Inspection Required', count: visits.filter((v) => v.reInspectionRequired).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeFilter === tab.id
                ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ltr-isolate ${
                activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className={`h-4 w-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3 pointer-events-none`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'دورہ نمبر، مکان، انجینئر یا نوعیت سے تلاش کریں...' : 'Search by visit ID, house, engineer, type...'}
            className={`w-full ${isRTL ? 'pr-10 pl-9' : 'pl-10 pr-9'} py-2 text-xs bg-slate-50/80 border border-slate-200/90 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 text-slate-800 font-medium placeholder:text-slate-400 transition`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition cursor-pointer`}
              title={isRTL ? 'تلاش ختم کریں' : 'Clear search'}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-xs min-w-[780px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase tracking-wider">
                <th className={`py-3.5 px-5 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'دورہ نمبر' : 'Visit ID'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'مکان و پتہ' : 'House & Address'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'انجینئر' : 'Engineer'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'دورے کی نوعیت' : 'Visit Type'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'تاریخ و وقت' : 'Date & Time'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'حیثیت و جائزہ' : 'Status & Quality'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'اے آئی خطرات کی جانچ' : 'AI Vision Hazard'}</th>
                <th className={`py-3.5 px-5 ${isRTL ? 'text-left' : 'text-right'}`}>{isRTL ? 'کارروائیاں' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {isRTL ? 'کوئی معائناتی دورہ تلاش کے معیار پر پورا نہیں اترا۔' : 'No engineer visits match the selected filter.'}
                  </td>
                </tr>
              ) : (
                filteredVisits.map((v) => {
                  const visitTypeUrdu = {
                    'Safety Inspection': 'سیفٹی معائنہ',
                    'Labour Training': 'لیبر ٹریننگ',
                    'Final Inspection': 'حتمی معائنہ',
                    'Construction Inspection': 'تعمیراتی معائنہ',
                    'Progress Verification': 'پیش رفت کی تصدیق',
                  }[v.visitType] || v.visitType;

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition">
                      {/* Visit ID */}
                      <td className="py-4 px-5">
                        <div className="font-mono font-black text-slate-900 ltr-isolate">{v.id}</div>
                        <div className="text-[10px] text-slate-400">{v.purpose}</div>
                      </td>

                      {/* House */}
                      <td className="py-4 px-4">
                        <div className="font-mono font-black text-orange-700 ltr-isolate">{v.houseId}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[170px]">{v.houseAddress}</div>
                      </td>

                      {/* Engineer */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <HardHat className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                          <span className="font-bold text-slate-800">{v.engineerName}</span>
                        </div>
                      </td>

                      {/* Visit Type */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            v.visitType === 'Safety Inspection'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : v.visitType === 'Labour Training'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : v.visitType === 'Final Inspection'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isRTL ? visitTypeUrdu : v.visitType}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-700 font-medium">
                        <div className="font-bold ltr-isolate">{v.visitDate}</div>
                        <div className="text-[10px] text-slate-400 ltr-isolate">{v.visitTime}</div>
                      </td>

                      {/* Status & Quality */}
                      <td className="py-4 px-4">
                        {v.status === 'Completed' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Check className="h-3 w-3" /> {isRTL ? 'مکمل شدہ' : 'Completed'}
                            </span>
                            {v.adminApproved ? (
                              <div className="text-[9.5px] font-bold text-emerald-600 mt-0.5">
                                {isRTL ? 'ایڈمن سے منظور شدہ' : 'Admin Approved'}
                              </div>
                            ) : (
                              <div className="text-[9.5px] font-bold text-amber-600 mt-0.5">
                                {isRTL ? 'زیر جائزہ' : 'Pending Review'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="h-3 w-3" /> {isRTL ? 'شیڈول شدہ' : 'Scheduled'}
                          </span>
                        )}
                      </td>

                      {/* AI Hazard Result */}
                      <td className="py-4 px-4">
                        {v.aiHazardResult ? (
                          v.aiHazardResult.hasHazard ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-700 border border-rose-300">
                              <Sparkles className="h-2.5 w-2.5 shrink-0" />
                              <span>{isRTL ? 'خطرہ موجود' : 'Hazard Detected'} (<span className="ltr-isolate">{v.aiHazardResult.confidence}%</span>)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Sparkles className="h-2.5 w-2.5 shrink-0" />
                              <span>{isRTL ? 'محفوظ قرار' : 'AI Cleared'}</span>
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            {isRTL ? 'دورے کا انتظار' : 'Awaiting Visit'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className={`py-4 px-5 ${isRTL ? 'text-left' : 'text-right'}`}>
                        <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-1.5`}>
                          <button
                            onClick={() => setSelectedVisitReport(v)}
                            className="px-3 py-1 bg-white border border-slate-200 hover:border-orange-300 text-slate-800 hover:text-orange-700 text-[11px] font-extrabold rounded-xl shadow-2xs transition cursor-pointer"
                          >
                            {isRTL ? 'رپورٹ دیکھیں' : 'View Report'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: SCHEDULE VISIT
         ========================================================================= */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                Schedule Field Engineer Visit
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Select House
                  </label>
                  <select
                    value={scheduleForm.houseId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, houseId: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                  >
                    {houses.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.id} — {h.ownerName} ({h.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Select Field Engineer
                  </label>
                  <select
                    value={scheduleForm.engineerId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, engineerId: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                  >
                    {engineers.map((eng) => (
                      <option key={eng.id} value={eng.id}>
                        {eng.name} ({eng.assignedDivision})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.visitDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, visitDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Visit Time
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.visitTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, visitTime: e.target.value })}
                    placeholder="10:30 AM"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Visit Type
                </label>
                <select
                  value={scheduleForm.visitType}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, visitType: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                >
                  <option value="Construction Inspection">Construction Inspection</option>
                  <option value="Progress Verification">Progress Verification</option>
                  <option value="Safety Inspection">Safety Inspection</option>
                  <option value="Labour Training">Labour Training</option>
                  <option value="Final Inspection">Final Inspection</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Purpose / Focus
                </label>
                <input
                  type="text"
                  value={scheduleForm.purpose}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, purpose: e.target.value })}
                  placeholder="e.g. Roof shuttering and electrical conduit verification"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Engineer Field Notes
                </label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  placeholder="Additional directives for field officer..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold shadow-md transition"
                >
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: COMPREHENSIVE VISIT REPORT VIEWER
         ========================================================================= */}
      {selectedVisitReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-6 animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center font-black">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">Visit Report: {selectedVisitReport.id}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                      {selectedVisitReport.visitType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    House: <strong className="text-slate-800">{selectedVisitReport.houseId}</strong> ({selectedVisitReport.houseAddress})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedVisitReport(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Visit Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Field Engineer</span>
                <div className="font-extrabold text-slate-900 mt-0.5">{selectedVisitReport.engineerName}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Date & Time</span>
                <div className="font-extrabold text-slate-900 mt-0.5">{selectedVisitReport.visitDate} ({selectedVisitReport.visitTime})</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Reported Progress</span>
                <div className="font-black text-emerald-600 mt-0.5">{selectedVisitReport.progressPctReported}%</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Workers Present</span>
                <div className="font-black text-purple-700 mt-0.5">{selectedVisitReport.workersPresent} Workers</div>
              </div>
            </div>

            {/* Labour Training Conducted Section */}
            {selectedVisitReport.trainingProvided && (
              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-700" />
                    <h3 className="text-xs font-black text-purple-950">On-Site Labour Training Conducted</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-200 text-purple-900">
                    Duration: {selectedVisitReport.trainingProvided.durationMinutes} mins
                  </span>
                </div>
                <div className="text-xs text-purple-950 font-bold">
                  Topic: {selectedVisitReport.trainingProvided.topic}
                </div>
                <div className="text-[11px] text-purple-800">
                  Attendees: {selectedVisitReport.trainingProvided.attendees.join(', ')}
                </div>
              </div>
            )}

            {/* Safety & Environmental Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Safety Checklist */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-slate-700" />
                  <h3 className="text-xs font-black text-slate-900">Safety Compliance Checklist</h3>
                </div>
                {selectedVisitReport.safetyChecklist ? (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span>Helmets & Boots Worn:</span>
                      {selectedVisitReport.safetyChecklist.helmetsWorn ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-0.5"><Check className="h-3.5 w-3.5" /> Pass</span>
                      ) : (
                        <span className="text-rose-700 font-bold flex items-center gap-0.5"><X className="h-3.5 w-3.5" /> Fail</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Safety Harness at Height:</span>
                      {selectedVisitReport.safetyChecklist.safetyHarness ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-0.5"><Check className="h-3.5 w-3.5" /> Pass</span>
                      ) : (
                        <span className="text-rose-700 font-bold flex items-center gap-0.5"><X className="h-3.5 w-3.5" /> Fail</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Scaffolding Stability:</span>
                      {selectedVisitReport.safetyChecklist.properScaffolding ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-0.5"><Check className="h-3.5 w-3.5" /> Pass</span>
                      ) : (
                        <span className="text-rose-700 font-bold flex items-center gap-0.5"><X className="h-3.5 w-3.5" /> Fail</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">Checklist not recorded yet.</div>
                )}
              </div>

              {/* Environmental Checklist */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2">
                  <CloudSun className="h-4 w-4 text-slate-700" />
                  <h3 className="text-xs font-black text-slate-900">Site Environmental Conditions</h3>
                </div>
                {selectedVisitReport.environmentalConditions ? (
                  <div className="space-y-1 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Temperature:</span>
                      <span className="font-bold">{selectedVisitReport.environmentalConditions.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Humidity / Wind:</span>
                      <span className="font-bold">{selectedVisitReport.environmentalConditions.humidity} • {selectedVisitReport.environmentalConditions.windSpeed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rainfall Risk:</span>
                      <span className="font-bold text-amber-800">{selectedVisitReport.environmentalConditions.rainRisk}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">Environmental readings not recorded.</div>
                )}
              </div>
            </div>

            {/* AI Computer Vision Hazard Detection Overlay */}
            {selectedVisitReport.aiHazardResult && selectedVisitReport.aiHazardResult.hasHazard && (
              <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-rose-700" />
                    <h3 className="text-xs font-black text-rose-950">AI Computer Vision Automated Hazard Detection</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-200 text-rose-900">
                    Confidence: {selectedVisitReport.aiHazardResult.confidence}%
                  </span>
                </div>
                <div className="text-xs text-rose-950 font-bold">
                  Detected Anomaly: {selectedVisitReport.aiHazardResult.hazardType}
                </div>
              </div>
            )}

            {/* Photos & Engineer Remarks */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900">Field Evidence Photos & Remarks</h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedVisitReport.photos?.map((photo, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-slate-200 h-40">
                    <img src={photo} alt="Inspection Photo" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800">
                <strong className="text-slate-900 block mb-1">Engineer Remarks:</strong>
                {selectedVisitReport.engineerRemarks || 'No additional remarks entered.'}
              </div>
            </div>

            {/* Admin Action Buttons on Report */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVisitReport(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => generateEngineerVisitCertificatePdf(selectedVisitReport)}
                  className="px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 hover:bg-orange-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Download verified official site inspection certificate PDF with stamps"
                >
                  <Download className="h-3.5 w-3.5 text-orange-600" />
                  <span>Download Certificate (PDF)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReInspectionModalVisit(selectedVisitReport)}
                  className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Request Re-Inspection</span>
                </button>

                {!selectedVisitReport.adminApproved && (
                  <button
                    type="button"
                    onClick={() => {
                      approveVisitReport(selectedVisitReport.id);
                      setSelectedVisitReport({ ...selectedVisitReport, adminApproved: true });
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Approve Inspection Report</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: REQUEST RE-INSPECTION
         ========================================================================= */}
      {reInspectionModalVisit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-rose-700">
                Request Re-Inspection: {reInspectionModalVisit.id}
              </h3>
              <button
                onClick={() => setReInspectionModalVisit(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleReInspectionSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Reason for Re-Inspection / Non-Compliance
                </label>
                <textarea
                  value={reInspectionReason}
                  onChange={(e) => setReInspectionReason(e.target.value)}
                  placeholder="Specify deficiencies to rectify (e.g. Scaffolding harness violations or rebar alignment error)..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReInspectionModalVisit(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md transition"
                >
                  Send Re-Inspection Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
