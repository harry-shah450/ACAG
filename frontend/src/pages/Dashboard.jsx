import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDashboardData } from '../context/DashboardDataContext';
import { generateDprPdf } from '../utils/pdfGenerator';
import {
  Building2,
  Activity,
  HardHat,
  Users,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Plus,
  MapPin,
  Layers,
  Maximize2,
  ChevronRight,
  TrendingUp,
  CloudSun,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Eye,
  CreditCard,
  ThermometerSun,
  Droplets,
  Wind,
  Check,
  ClipboardCheck,
  Hammer,
  Download,
  Printer,
  X
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const {
    houses,
    engineers,
    visits,
    workers,
    safetyIssues,
    loans,
    auditLogs,
    scheduleVisit,
    approveVisitReport
  } = useDashboardData();

  const [selectedMapHouse, setSelectedMapHouse] = useState(null);
  const [selectedVisitForModal, setSelectedVisitForModal] = useState(null);

  // Compute live statistics
  const totalHousesCount = houses.length;
  const pendingApplicationsCount = houses.filter((h) => h.status === 'Pending').length;
  const underConstructionCount = houses.filter((h) => h.status === 'Under Construction').length;
  const completedHousesCount = houses.filter((h) => h.status === 'Completed').length;
  const pendingInspectionsCount = visits.filter((v) => v.status === 'Scheduled').length;
  const totalEngineersCount = engineers.length;
  const totalWorkersCount = workers.length;
  const openSafetyIssuesCount = safetyIssues.filter((s) => s.status === 'Open').length;

  // Loan aggregates
  const totalLoanApproved = loans.reduce((acc, l) => acc + (l.approvedAmount || 0), 0);
  const totalLoanDisbursed = loans.reduce((acc, l) => acc + (l.disbursedAmount || 0), 0);
  const totalLoanRemaining = Math.max(0, totalLoanApproved - totalLoanDisbursed);
  const pendingInstallmentsCount = loans.reduce(
    (acc, l) => acc + l.tranches.filter((t) => t.status.includes('Pending') || t.status.includes('Approved')).length,
    0
  );

  // Construction Stage counts
  const stageStats = [
    { stage: 'Foundation', count: houses.filter((h) => h.stage === 'Foundation').length, pct: 20, color: 'bg-emerald-400' },
    { stage: 'Structure', count: houses.filter((h) => h.stage === 'Structure').length, pct: 40, color: 'bg-blue-500' },
    { stage: 'Roof', count: houses.filter((h) => h.stage === 'Roof').length, pct: 60, color: 'bg-amber-500' },
    { stage: 'Electrical', count: houses.filter((h) => h.stage === 'Electrical').length, pct: 75, color: 'bg-indigo-500' },
    { stage: 'Plumbing', count: houses.filter((h) => h.stage === 'Plumbing').length, pct: 80, color: 'bg-cyan-500' },
    { stage: 'Finishing', count: houses.filter((h) => h.stage === 'Finishing').length, pct: 90, color: 'bg-purple-500' },
    { stage: 'Completed', count: houses.filter((h) => h.stage === 'Completed').length, pct: 100, color: 'bg-emerald-600' },
  ];

  // Overall program construction percentage
  const avgProgramProgress = Math.round(
    houses.reduce((acc, h) => acc + (h.progressPct || 0), 0) / (houses.length || 1)
  );

  // Status donut distribution
  const statusCounts = {
    pending: houses.filter((h) => h.status === 'Pending').length,
    approved: houses.filter((h) => h.status === 'Approved').length,
    construction: houses.filter((h) => h.status === 'Under Construction').length,
    completed: houses.filter((h) => h.status === 'Completed').length,
    revisit: houses.filter((h) => h.status === 'Re-Visit' || h.reInspectionRequired).length,
    rejected: houses.filter((h) => h.status === 'Rejected' && !h.reInspectionRequired).length,
  };

  // Helper for map pin colors
  const getMarkerColor = (house) => {
    if (house.safetyIssuesCount > 0 || house.environmentalRisk === 'Critical') return 'bg-rose-600 ring-rose-300';
    if (house.status === 'Completed') return 'bg-emerald-600 ring-emerald-300';
    if (house.status === 'Under Construction') return 'bg-blue-600 ring-blue-300';
    return 'bg-amber-500 ring-amber-200';
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HEADER: Program Title + Primary Action Buttons
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800 uppercase tracking-wider">
              ACAG Government Administrative MIS
            </span>
            <span className="text-xs text-slate-400">• Punjab Region</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {t('dashboardOverview')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('dashboardDesc')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              generateDprPdf({
                houses,
                engineers,
                visits,
                workers,
                safetyIssues,
                loans,
                date: new Date().toISOString().split('T')[0],
                scope: 'Punjab Province (All Divisions)',
                generatedBy: 'Muhammad Admin (Super Admin)'
              });
            }}
            className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-[11px] sm:text-xs font-bold shadow-2xs hover:bg-slate-50 transition flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center"
            title="Download full multi-page Daily Progress Report (PDF) with engineer visits and labour training roster"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 shrink-0" />
            <span className="truncate">Download DPR</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/engineer-visits')}
            className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white text-[11px] sm:text-xs font-extrabold shadow-md shadow-orange-500/25 flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer text-center"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">{t('newProjectBtn')}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TOP STATISTICS CARDS (8 High-Density KPI Cards)
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2 sm:gap-3 min-w-0">
        {/* 1. Total Houses */}
        <div
          onClick={() => navigate('/houses')}
          className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-blue-300 hover:ring-2 hover:ring-blue-100 transition duration-200 cursor-pointer group min-w-0"
          title="Click to view all houses directory"
        >
          <div className="flex items-center justify-between gap-1">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition flex items-center justify-center shrink-0">
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-emerald-600 flex items-center shrink-0 ltr-isolate">
              +14% <ArrowUpRight className="h-2.5 w-2.5" />
            </span>
          </div>
          <div className="mt-2 sm:mt-3 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              {t('totalHouses')}
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 block group-hover:text-blue-600 transition ltr-isolate">
              {totalHousesCount}
            </span>
          </div>
        </div>

        {/* 2. Pending Applications */}
        <div
          onClick={() => navigate('/houses?tab=APPLICATIONS')}
          className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-amber-300 hover:ring-2 hover:ring-amber-100 transition duration-200 cursor-pointer group min-w-0"
          title="Click to review pending housing applications"
        >
          <div className="flex items-center justify-between gap-1">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-500 group-hover:text-white transition flex items-center justify-center shrink-0">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-amber-700 bg-amber-50 px-1 sm:px-1.5 py-0.5 rounded shrink-0 truncate max-w-[65px] xs:max-w-none">
              {isRTL ? 'جائزہ درکار' : 'Review'}
            </span>
          </div>
          <div className="mt-2 sm:mt-3 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              {t('pendingApplications')}
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-700 mt-0.5 block group-hover:scale-105 transition origin-left ltr-isolate">
              {pendingApplicationsCount}
            </span>
          </div>
        </div>

        {/* 3. Houses Under Construction */}
        <div
          onClick={() => navigate('/houses?tab=UNDER_CONSTRUCTION')}
          className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100 transition duration-200 cursor-pointer group min-w-0"
          title="Click to view houses currently under construction"
        >
          <div className="flex items-center justify-between gap-1">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition flex items-center justify-center shrink-0">
              <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-indigo-600 shrink-0">
              {isRTL ? 'فعال' : 'Active'}
            </span>
          </div>
          <div className="mt-2 sm:mt-3 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              {isRTL ? 'زیر تعمیر' : 'Under Const.'}
            </span>
            <span className="text-lg sm:text-xl font-black text-indigo-900 mt-0.5 block group-hover:text-indigo-600 transition ltr-isolate">
              {underConstructionCount}
            </span>
          </div>
        </div>

        {/* 4. Completed Houses */}
        <div
          onClick={() => navigate('/houses?tab=COMPLETED')}
          className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-emerald-300 hover:ring-2 hover:ring-emerald-100 transition duration-200 cursor-pointer group min-w-0"
          title="Click to view completed houses"
        >
          <div className="flex items-center justify-between gap-1">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-emerald-700 bg-emerald-50 px-1 sm:px-1.5 py-0.5 rounded shrink-0">
              {isRTL ? 'تیار' : 'Ready'}
            </span>
          </div>
          <div className="mt-2 sm:mt-3 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              {isRTL ? 'مکمل شدہ' : 'Completed'}
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-700 mt-0.5 block group-hover:scale-105 transition origin-left ltr-isolate">
              {completedHousesCount}
            </span>
          </div>
        </div>

        {/* 5. Pending Inspections */}
        <div
          onClick={() => navigate('/engineer-visits?filter=SCHEDULED')}
          className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-orange-300 hover:ring-2 hover:ring-orange-100 transition duration-200 cursor-pointer group min-w-0"
          title="Click to view pending engineer inspections"
        >
          <div className="flex items-center justify-between gap-1">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-orange-50 text-orange-700 group-hover:bg-orange-600 group-hover:text-white transition flex items-center justify-center shrink-0">
              <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-orange-600 shrink-0">
              {isRTL ? 'قطار میں' : 'Queue'}
            </span>
          </div>
          <div className="mt-2 sm:mt-3 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              {isRTL ? 'زیر التواء معائنے' : 'Pending Insp.'}
            </span>
            <span className="text-lg sm:text-xl font-black text-orange-700 mt-0.5 block group-hover:scale-105 transition origin-left ltr-isolate">
              {pendingInspectionsCount}
            </span>
          </div>
        </div>

        {/* 6. Total Engineers */}
        <div
          onClick={() => navigate('/engineers')}
          className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-purple-300 hover:ring-2 hover:ring-purple-100 transition duration-200 cursor-pointer group min-w-0"
          title="Click to manage field engineers"
        >
          <div className="flex items-center justify-between gap-1">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition flex items-center justify-center shrink-0">
              <HardHat className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-slate-500 shrink-0">
              {isRTL ? 'پی ای سی رجسٹرڈ' : 'PEC Reg.'}
            </span>
          </div>
          <div className="mt-2 sm:mt-3 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              {t('totalEngineers')}
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 block group-hover:text-purple-700 transition ltr-isolate">
              {totalEngineersCount}
            </span>
          </div>
        </div>

        {/* 7. Total Workers */}
        <div
          onClick={() => navigate('/labour')}
          className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-teal-300 hover:ring-2 hover:ring-teal-100 transition duration-200 cursor-pointer group min-w-0"
          title="Click to manage labour & safety training"
        >
          <div className="flex items-center justify-between gap-1">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition flex items-center justify-center shrink-0">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-teal-700 bg-teal-50 px-1 sm:px-1.5 py-0.5 rounded shrink-0">
              {isRTL ? 'اندراج شدہ' : 'Enrolled'}
            </span>
          </div>
          <div className="mt-2 sm:mt-3 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              {t('totalWorkers')}
            </span>
            <span className="text-lg sm:text-xl font-black text-teal-900 mt-0.5 block group-hover:text-teal-600 transition ltr-isolate">
              {totalWorkersCount}
            </span>
          </div>
        </div>

        {/* 8. Open Safety Issues */}
        <div
          onClick={() => navigate('/safety')}
          className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-rose-300 hover:ring-2 hover:ring-rose-100 transition duration-200 cursor-pointer group min-w-0"
          title="Click to view open safety incidents & hazards"
        >
          <div className="flex items-center justify-between gap-1">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition flex items-center justify-center shrink-0">
              <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-rose-600 bg-rose-50 px-1 sm:px-1.5 py-0.5 rounded shrink-0">
              {isRTL ? 'زیادہ خطرہ' : 'High Risk'}
            </span>
          </div>
          <div className="mt-2 sm:mt-3 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              {isRTL ? 'سیفٹی مسائل' : 'Safety Issues'}
            </span>
            <span className="text-lg sm:text-xl font-black text-rose-700 mt-0.5 block group-hover:scale-105 transition origin-left ltr-isolate">
              {openSafetyIssuesCount}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: CONSTRUCTION OVERVIEW (Stage Progress) + HOUSE STATUS DONUT + LOAN SUMMARY
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 1. Large Interactive Construction Overview Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="min-w-0">
              <h2 className="text-sm font-black text-slate-900 truncate">
                {isRTL ? 'تعمیراتی مراحل کا جائزہ' : 'Construction Stage Overview'}
              </h2>
              <p className="text-[11px] text-slate-500 truncate">
                {isRTL ? 'پروگرام کی مجموعی تکمیل:' : 'Program Completion Index:'}{' '}
                <strong className="text-orange-700 ltr-isolate">{avgProgramProgress}%</strong>
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              <span className="ltr-isolate">{avgProgramProgress}%</span> {isRTL ? 'اوسط پیش رفت' : 'Avg Progress'}
            </span>
          </div>

          {/* Construction Stage Bars */}
          <div className="space-y-2.5 py-1">
            {stageStats.map((item, idx) => {
              const stageLabelUrdu = {
                Foundation: 'بنیاد',
                Structure: 'ڈھانچہ و چنائی',
                Roof: 'چھت و سلیب',
                Electrical: 'برقی وائرنگ',
                Plumbing: 'پلمبنگ و سینیٹری',
                Finishing: 'فنشنگ و روغن',
                Completed: 'مکمل شدہ',
              }[item.stage] || item.stage;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${item.color} shrink-0`} />
                      <span>{isRTL ? stageLabelUrdu : item.stage}</span>
                    </div>
                    <span className="text-slate-900 font-extrabold flex items-center gap-1">
                      <span className="font-mono ltr-isolate">{item.count}</span>
                      <span className="text-[11px] text-slate-500 font-normal">{isRTL ? 'مکانات' : 'Houses'}</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(item.count / (houses.length || 1)) * 100}%` }}
                      className={`h-full rounded-full ${item.color} transition-all duration-500 min-w-[6px]`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>{isRTL ? 'معیاری اے سی اے جی 7 مراحل کی پیش رفت' : 'Standard ACAG 7-Stage Milestone Progression'}</span>
            <button
              onClick={() => navigate('/houses')}
              className="text-orange-700 hover:text-orange-900 font-extrabold flex items-center gap-0.5 cursor-pointer"
            >
              <span>{isRTL ? 'تمام مکانات دیکھیں' : 'View Houses'}</span>
              <ChevronRight className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. House Status Donut Chart (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1 gap-2">
            <div className="min-w-0">
              <h2 className="text-sm font-black text-slate-900 tracking-tight truncate">
                {isRTL ? 'مکانات کی صورتحال' : 'House Status'}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {isRTL ? 'مراحل کی مجموعی تقسیم' : 'Lifecycle Distribution'}
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
              <span className="ltr-isolate">{totalHousesCount}</span> {isRTL ? 'کل' : 'Total'}
            </span>
          </div>

          {/* Donut Chart Visual */}
          <div className="py-2 flex flex-col items-center justify-center">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4.2" />
                {/* 1. Completed (Green) */}
                {statusCounts.completed > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4.2"
                    strokeDasharray={`${(statusCounts.completed / (totalHousesCount || 1)) * 100} 100`}
                    strokeDashoffset="0"
                  />
                )}
                {/* 2. Under Construction (Blue) */}
                {statusCounts.construction > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4.2"
                    strokeDasharray={`${(statusCounts.construction / (totalHousesCount || 1)) * 100} 100`}
                    strokeDashoffset={`-${(statusCounts.completed / (totalHousesCount || 1)) * 100}`}
                  />
                )}
                {/* 3. Re-Visit Required (Purple) */}
                {statusCounts.revisit > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="4.2"
                    strokeDasharray={`${(statusCounts.revisit / (totalHousesCount || 1)) * 100} 100`}
                    strokeDashoffset={`-${((statusCounts.completed + statusCounts.construction) / (totalHousesCount || 1)) * 100}`}
                  />
                )}
                {/* 4. Approved (Amber) */}
                {statusCounts.approved > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="4.2"
                    strokeDasharray={`${(statusCounts.approved / (totalHousesCount || 1)) * 100} 100`}
                    strokeDashoffset={`-${((statusCounts.completed + statusCounts.construction + statusCounts.revisit) / (totalHousesCount || 1)) * 100}`}
                  />
                )}
                {/* 5. Rejected (Rose) */}
                {statusCounts.rejected > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="4.2"
                    strokeDasharray={`${(statusCounts.rejected / (totalHousesCount || 1)) * 100} 100`}
                    strokeDashoffset={`-${((statusCounts.completed + statusCounts.construction + statusCounts.revisit + statusCounts.approved) / (totalHousesCount || 1)) * 100}`}
                  />
                )}
              </svg>
              <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 leading-none ltr-isolate">{totalHousesCount}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {isRTL ? 'کل' : 'Total'}
                </span>
              </div>
            </div>

            {/* Status Legend List */}
            <div className="w-full mt-2 space-y-0.5 text-xs">
              {[
                { key: 'completed', label: isRTL ? 'مکمل شدہ' : 'Completed', count: statusCounts.completed, color: 'bg-emerald-500', tab: 'COMPLETED' },
                { key: 'construction', label: isRTL ? 'زیر تعمیر' : 'Under Const.', count: statusCounts.construction, color: 'bg-blue-500', tab: 'UNDER_CONSTRUCTION' },
                { key: 'revisit', label: isRTL ? 'دوبارہ معائنہ مطلوب' : 'Re-Visit Req.', count: statusCounts.revisit, color: 'bg-purple-500', tab: 'REVISIT' },
                { key: 'approved', label: isRTL ? 'منظور شدہ' : 'Approved', count: statusCounts.approved, color: 'bg-amber-500', tab: 'APPROVED' },
                { key: 'rejected', label: isRTL ? 'مسترد شدہ' : 'Rejected', count: statusCounts.rejected, color: 'bg-rose-500', tab: 'REJECTED' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(`/houses?tab=${item.tab}`)}
                  className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-slate-50 transition duration-150 cursor-pointer group"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-600 group-hover:text-slate-900">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span>{item.label}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-xs text-slate-900 group-hover:text-orange-700 transition ltr-isolate">
                      {item.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Loan & Tranche Model (4 cols) - Clean & Elegant */}
        <div
          onClick={() => navigate('/loans')}
          className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-orange-300 transition duration-200 cursor-pointer group"
          title={isRTL ? 'قرضہ جات کے انتظام پر جائیں' : 'Click to view Loan Management'}
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800 mb-1">
                {isRTL ? 'بینک آف پنجاب' : 'Bank of Punjab'}
              </span>
              <h2 className="text-sm font-black text-slate-900 group-hover:text-orange-700 transition">
                {isRTL ? 'ہاؤسنگ لون اسکیم' : 'Housing Loan Scheme'}
              </h2>
            </div>
            <div className={isRTL ? 'text-left' : 'text-right'}>
              <span className="text-[10px] text-slate-400 font-bold block">
                {isRTL ? 'فی مکان کل رقم' : 'Total Per House'}
              </span>
              <span className="text-sm font-black text-slate-900">
                {isRTL ? '15 لاکھ روپے' : 'PKR 1.5 Million'}
              </span>
            </div>
          </div>

          {/* Elegant 2-Tranche Visual Flow */}
          <div className="space-y-2.5 my-3">
            {/* 1st Tranche Card */}
            <div className="p-3 bg-slate-50 hover:bg-orange-50/50 rounded-xl border border-slate-100 transition flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                  {isRTL ? '1' : '1st'}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {isRTL ? 'پہلی قسط (50%)' : '1st Tranche (50%)'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isRTL ? 'بنیاد اور ڈھانچہ' : 'Foundation & Structure'}
                  </div>
                </div>
              </div>
              <div className={isRTL ? 'text-left' : 'text-right'}>
                <div className="text-xs font-black text-orange-700">
                  {isRTL ? '7.5 لاکھ روپے' : 'PKR 7.5 Lakh'}
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {isRTL ? 'منظوری پر' : 'On Approval'}
                </span>
              </div>
            </div>

            {/* 2nd Tranche Card */}
            <div className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-100 transition flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                  {isRTL ? '2' : '2nd'}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {isRTL ? 'دوسری قسط (50%)' : '2nd Tranche (50%)'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isRTL ? 'چھت اور فنشنگ' : 'Roof Slab & Finishing'}
                  </div>
                </div>
              </div>
              <div className={isRTL ? 'text-left' : 'text-right'}>
                <div className="text-xs font-black text-emerald-700">
                  {isRTL ? '7.5 لاکھ روپے' : 'PKR 7.5 Lakh'}
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {isRTL ? 'معائنے کے بعد' : 'On Inspection'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom subtle note & action */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">
              {isRTL ? 'انجینئرز سے تصدیق شدہ مراحل' : 'Milestone Verified by Engineers'}
            </span>
            <span className="text-orange-700 font-bold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
              <span>{isRTL ? 'قرضہ جات دیکھیں' : 'View Loans'}</span>
              <ChevronRight className={`h-3.5 w-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: GIS OVERVIEW MAP & UNIFIED LIVE ALERTS HUB (ALIGNED & ELEGANT)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* GIS Overview Map (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-black shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-slate-900 truncate">
                  {isRTL ? 'پنجاب جی آئی ایس جیو اسپیتیل گرڈ' : 'Punjab GIS Geospatial Grid'}
                </h2>
                <p className="text-[11px] text-slate-500 truncate">
                  {isRTL ? 'پنجاب بھر کے پراجیکٹس کی لائیو لوکیشن اور صورتحال' : 'Live Punjab Project Geo-pins with real-time status'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/gis-map')}
              className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>{isRTL ? 'مکمل نقشہ' : 'Full GIS Map'}</span>
            </button>
          </div>

          {/* Map Canvas */}
          <div className="relative bg-slate-950 rounded-2xl p-4 min-h-[290px] border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* High-tech Geo Grid Overlay */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />

            {/* Live Geo Pins */}
            <div className="relative w-full max-w-lg h-60">
              {houses.slice(0, 7).map((h, i) => {
                const posStyles = [
                  { top: '16%', left: '42%' }, // Rawalpindi
                  { top: '34%', left: '65%' }, // Gujranwala
                  { top: '46%', left: '76%' }, // Lahore
                  { top: '48%', left: '46%' }, // Faisalabad
                  { top: '72%', left: '32%' }, // Multan
                  { top: '82%', left: '44%' }, // Bahawalpur
                  { top: '26%', left: '26%' }, // Sargodha
                ][i] || { top: '50%', left: '50%' };

                const isSelected = selectedMapHouse?.id === h.id;

                return (
                  <div
                    key={h.id}
                    style={posStyles}
                    onClick={() => setSelectedMapHouse(isSelected ? null : h)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                    title={`${h.district} (${h.id})`}
                  >
                    {/* Pulsing ring for active sites */}
                    <span className="absolute -inset-1 rounded-full bg-orange-500/30 animate-ping opacity-75" />
                    
                    <div
                      className={`relative h-7 w-7 rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-white transition-all duration-200 group-hover:scale-125 ${getMarkerColor(
                        h
                      )} ${isSelected ? 'scale-125 ring-4 ring-orange-400' : ''}`}
                    >
                      <span className="ltr-isolate">{h.progressPct}%</span>
                    </div>
                    <span className="text-[9px] font-black bg-slate-900/90 text-white px-1.5 py-0.5 rounded-md border border-slate-700 mt-1 block whitespace-nowrap text-center shadow-md">
                      {h.district}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Clicked House Docked Mini-Inspector (Clean & Unobtrusive) */}
            {selectedMapHouse && (
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-700/80 shadow-2xl z-30 animate-in fade-in flex items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center font-black shrink-0">
                    <Home className="h-5 w-5" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-orange-400 ltr-isolate">{selectedMapHouse.id}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-white/10 text-slate-300">
                        {selectedMapHouse.stage}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">{selectedMapHouse.ownerName} • {selectedMapHouse.district}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/houses?highlight=${selectedMapHouse.id}`)}
                    className="px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-[11px] font-extrabold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    {isRTL ? 'تفصیلات دیکھیں ←' : 'View Details →'}
                  </button>
                  <button
                    onClick={() => setSelectedMapHouse(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                    title={isRTL ? 'بند کریں' : 'Close'}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Map Color Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> {isRTL ? 'مکمل شدہ' : 'Completed'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> {isRTL ? 'زیر تعمیر' : 'Under Construction'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> {isRTL ? 'زیر التواء منظوری' : 'Pending Approval'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> {isRTL ? 'زیادہ سیفٹی خطرہ' : 'High Safety Risk'}
            </span>
          </div>
        </div>

        {/* Unified Live Alerts & Site Hazards Center (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black shrink-0">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-slate-900 truncate">
                  {isRTL ? 'لائیو الرٹس و خطرات کا مرکز' : 'Live Alerts & Hazards Hub'}
                </h3>
                <p className="text-[11px] text-slate-500 truncate">
                  {isRTL ? 'ریئل ٹائم سیفٹی خلاف ورزیاں اور ماحولیاتی انتباہات' : 'Real-time safety violations & climate alerts'}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 shrink-0">
              <span className="ltr-isolate">{openSafetyIssuesCount}</span> {isRTL ? 'فعال' : 'Active'}
            </span>
          </div>

          {/* Section 1: Safety Violations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-slate-700 uppercase tracking-wider">
                {isRTL ? 'سیفٹی واقعات و مسائل' : 'Safety Incidents'}
              </span>
              <button
                onClick={() => navigate('/safety')}
                className="font-bold text-orange-700 hover:text-orange-900 transition flex items-center gap-0.5 cursor-pointer"
              >
                <span>{isRTL ? 'تمام دیکھیں' : 'Manage'}</span>
                <ChevronRight className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="space-y-2">
              {safetyIssues.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate('/safety')}
                  className="p-2.5 rounded-2xl bg-rose-50/50 hover:bg-rose-50 border border-rose-200/60 transition cursor-pointer flex items-start gap-2.5"
                >
                  <div className="h-7 w-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">{item.issueType}</span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-rose-200/70 text-rose-900 shrink-0">
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{item.description}</p>
                    <div className="text-[9.5px] text-slate-400 font-mono mt-1 ltr-isolate">
                      {item.houseId} • {item.assignedEngineer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Environmental Advisories */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-slate-700 uppercase tracking-wider">
                {isRTL ? 'ماحولیاتی و موسمی انتباہات' : 'Environmental Advisories'}
              </span>
              <button
                onClick={() => navigate('/environmental')}
                className="font-bold text-amber-700 hover:text-amber-900 transition flex items-center gap-0.5 cursor-pointer"
              >
                <span>{isRTL ? 'مانیٹر کریں' : 'Monitor'}</span>
                <ChevronRight className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div
                onClick={() => navigate('/environmental')}
                className="p-2.5 rounded-2xl bg-amber-50/60 hover:bg-amber-50 border border-amber-200/70 transition cursor-pointer flex items-start gap-2.5"
              >
                <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <ThermometerSun className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {isRTL ? 'شدید گرمی اور ہیٹ ویو الرٹ' : 'High Temperature & Heatwave'}
                    </span>
                    <span className="text-[9.5px] font-black px-1.5 py-0.2 rounded-md bg-amber-200 text-amber-900 ltr-isolate">42°C</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                    {isRTL
                      ? 'بہاولپور اور رحیم یار خان: ہر 45 منٹ بعد پانی پینے کا وقفہ لازمی۔'
                      : 'Bahawalpur & RYK: Mandatory hydration breaks every 45 mins.'}
                  </p>
                </div>
              </div>

              <div
                onClick={() => navigate('/environmental')}
                className="p-2.5 rounded-2xl bg-sky-50/60 hover:bg-sky-50 border border-sky-200/70 transition cursor-pointer flex items-start gap-2.5"
              >
                <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Droplets className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {isRTL ? 'مون سون بارشوں کی پیشگوئی' : 'Monsoon Rain Forecast'}
                    </span>
                    <span className="text-[9.5px] font-black px-1.5 py-0.2 rounded-md bg-sky-200 text-sky-900">
                      {isRTL ? 'سیالکوٹ' : 'Sialkot'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                    {isRTL
                      ? 'سیالکوٹ: کنکریٹ سلیب کا کام 24 گھنٹے کے لیے موخر۔'
                      : 'ACAG-S-9911: Concrete slab pouring paused for 24 hours.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 4: RECENT ENGINEER VISITS TABLE WITH REPORT ACTIONS
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-900">
              {isRTL ? 'فیلڈ انجینئرز کے حالیہ معائناتی دورے' : 'Recent Field Engineer Visits & Inspections'}
            </h2>
            <p className="text-xs text-slate-500">
              {isRTL
                ? 'کوالٹی چیک پوائنٹس، سیفٹی آڈٹس اور ورکرز کی ٹریننگ'
                : 'Quality checkpoints, safety audits, and labour training sessions'}
            </p>
          </div>
          <button
            onClick={() => navigate('/engineer-visits')}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer shrink-0"
          >
            {isRTL ? 'تمام دورے دیکھیں' : 'Manage All Visits'}
          </button>
        </div>

        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-xs min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase tracking-wider">
                <th className={`py-3 px-5 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'مکان' : 'House'}</th>
                <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'انجینئر' : 'Engineer'}</th>
                <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'دورے کی نوعیت' : 'Visit Type'}</th>
                <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'تاریخ و وقت' : 'Date & Time'}</th>
                <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'حیثیت' : 'Status'}</th>
                <th className={`py-3 px-5 ${isRTL ? 'text-left' : 'text-right'}`}>{isRTL ? 'کارروائی' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visits.slice(0, 5).map((v) => {
                const visitTypeUrdu = {
                  'Safety Inspection': 'سیفٹی معائنہ',
                  'Labour Training': 'لیبر ٹریننگ',
                  'Final Inspection': 'حتمی معائنہ',
                  'Construction Inspection': 'تعمیراتی معائنہ',
                  'Progress Verification': 'پیش رفت کی تصدیق',
                }[v.visitType] || v.visitType;

                return (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-mono font-black text-orange-700 ltr-isolate">{v.houseId}</div>
                      <div className="text-[11px] text-slate-500">{v.houseAddress}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {v.engineerName}
                    </td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div className="ltr-isolate">{v.visitDate}</div>
                      <div className="text-[10px] text-slate-400 ltr-isolate">{v.visitTime}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {v.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Check className="h-3 w-3" /> {isRTL ? 'مکمل' : 'Completed'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="h-3 w-3" /> {isRTL ? 'شیڈول شدہ' : 'Scheduled'}
                        </span>
                      )}
                    </td>
                    <td className={`py-3.5 px-5 ${isRTL ? 'text-left' : 'text-right'}`}>
                      <button
                        onClick={() => navigate(`/engineer-visits?visitId=${v.id}`)}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:border-orange-300 text-slate-700 text-[11px] font-bold rounded-lg transition shadow-2xs cursor-pointer"
                      >
                        {isRTL ? 'رپورٹ دیکھیں' : 'Inspect Report'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          ROW 5: RECENT ACTIVITY FEED (Admin & System Stream)
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-sm font-black text-slate-900">
              {isRTL ? 'حالیہ انتظامی و سسٹم سرگرمیاں' : 'Recent Admin & System Activity'}
            </h2>
            <p className="text-xs text-slate-500">
              {isRTL ? 'تمام انتظامی اور فیلڈ کارروائیوں کا تاریخی ریکارڈ' : 'Chronological administrative and field audit trail'}
            </p>
          </div>
          <button
            onClick={() => navigate('/settings?tab=audit')}
            className="self-start sm:self-auto text-xs font-bold text-orange-700 hover:text-orange-900 cursor-pointer"
          >
            {isRTL ? 'مکمل آڈٹ لاگز دیکھیں ←' : 'Full Audit Logs →'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {auditLogs.slice(0, 6).map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <div className="h-2 w-2 rounded-full bg-orange-600 mt-1.5 shrink-0" />
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-black text-slate-900 truncate">{log.action}</div>
                <div className="text-[11px] text-slate-600 font-medium truncate">{log.module} • {log.houseId}</div>
                <div className="text-[9.5px] text-slate-400 mt-1 font-mono ltr-isolate">{log.timestamp} • by {log.user}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
