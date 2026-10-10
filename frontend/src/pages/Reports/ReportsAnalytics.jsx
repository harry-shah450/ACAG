import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useDashboardData } from '../../context/DashboardDataContext';
import { generateDprPdf, generateDomainPdf } from '../../utils/pdfGenerator';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Printer,
  Building2,
  CreditCard,
  Users,
  ShieldAlert,
  HardHat,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Search,
  FileText,
  Sparkles,
  ClipboardCheck
} from 'lucide-react';

export const ReportsAnalytics = () => {
  const { t, isRTL } = useLanguage();
  const { houses, loans, workers, safetyIssues, engineers, visits } = useDashboardData();

  const [reportDomain, setReportDomain] = useState('CONSTRUCTION'); // CONSTRUCTION | LOANS | LABOUR | SAFETY | ENGINEERS
  const [dateRange, setDateRange] = useState('YTD'); // 7DAYS | 30DAYS | YTD | ALL
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDprModalOpen, setIsDprModalOpen] = useState(false);

  const districtsList = Array.from(new Set(houses.map((h) => h.district)));

  // Generate Official PDF Report for Active Domain (Replaces .CSV)
  const handleExportDomainPdf = () => {
    generateDomainPdf({
      domain: reportDomain,
      houses: filteredHouses,
      loans: filteredLoans,
      workers: filteredWorkers,
      safetyIssues: filteredSafety,
      engineers: filteredEngineers,
      visits,
      dateRange: dateRange === '7DAYS' ? 'Last 7 Days' : dateRange === '30DAYS' ? 'Last 30 Days' : dateRange === 'YTD' ? 'Year-to-Date' : 'All Time',
      districtFilter: districtFilter === 'ALL' ? 'All Punjab Districts' : districtFilter,
    });
  };

  // Generate Full ACAG Daily Progress Report (DPR) PDF
  const handleDownloadDprPdf = () => {
    generateDprPdf({
      houses,
      engineers,
      visits,
      workers,
      safetyIssues,
      loans,
      date: new Date().toISOString().split('T')[0],
      scope: districtFilter === 'ALL' ? 'Punjab Province (All Divisions)' : `${districtFilter} Division`,
      generatedBy: 'Muhammad Admin (Super Admin)'
    });
  };

  // Filter items by active domain, district and search query
  const filteredHouses = houses.filter((h) => {
    const matchDist = districtFilter === 'ALL' || h.district === districtFilter;
    const matchSearch = !searchQuery.trim() ||
      h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.ownerCnic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.stage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDist && matchSearch;
  });

  const filteredLoans = loans.filter((l) => {
    const matchSearch = !searchQuery.trim() ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.cnic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.houseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.status.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const filteredWorkers = workers.filter((w) => {
    const matchSearch = !searchQuery.trim() ||
      w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.assignedHouseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.trainingStatus && w.trainingStatus.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSearch;
  });

  const filteredSafety = safetyIssues.filter((s) => {
    const matchSearch = !searchQuery.trim() ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.houseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.issueType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.assignedEngineer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.severity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const filteredEngineers = engineers.filter((e) => {
    const matchSearch = !searchQuery.trim() ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.pecNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.assignedDivision.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.phone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800 uppercase tracking-wider">
              ACAG Official Analytics & Compliance
            </span>
            <span className="text-xs text-slate-400">• PDF Reports Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Reports & Analytics Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate executive compliance reports, daily progress logs (DPR), artisan safety training audits, and export to official PDF
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDprModalOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-4 w-4 text-orange-600" />
            <span>Generate Daily DPR (PDF)</span>
          </button>

          <button
            onClick={handleExportDomainPdf}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-orange-500/25 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download {reportDomain} Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        {[
          { id: 'CONSTRUCTION', label: 'Construction Progress', icon: Building2 },
          { id: 'LOANS', label: 'Loan Disbursements', icon: CreditCard },
          { id: 'LABOUR', label: 'Labour Training & Artisans', icon: Users },
          { id: 'SAFETY', label: 'Safety & Compliance', icon: ShieldAlert },
          { id: 'ENGINEERS', label: 'Engineer Scorecards', icon: HardHat },
        ].map((domain) => {
          const Icon = domain.icon;
          const isActive = reportDomain === domain.id;
          return (
            <button
              key={domain.id}
              onClick={() => {
                setReportDomain(domain.id);
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{domain.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search in ${reportDomain.toLowerCase()}...`}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Timeframe & District Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-500">Period:</span>
            {['7DAYS', '30DAYS', 'YTD', 'ALL'].map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  dateRange === r ? 'bg-slate-900 text-white font-black' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {r === '7DAYS' ? '7D' : r === '30DAYS' ? '30D' : r === 'YTD' ? 'YTD' : 'All'}
              </button>
            ))}
          </div>

          {reportDomain === 'CONSTRUCTION' && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer p-0"
              >
                <option value="ALL">All Districts</option>
                {districtsList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          DOMAIN 1: CONSTRUCTION REPORT
         ========================================================================= */}
      {reportDomain === 'CONSTRUCTION' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Units Mapped</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{houses.length} Houses</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Completion Rate</span>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                {Math.round((houses.filter((h) => h.status === 'Completed').length / (houses.length || 1)) * 100)}%
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Under Construction</span>
              <div className="text-2xl font-black text-blue-900 mt-0.5">
                {houses.filter((h) => h.status === 'Under Construction').length} Units
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Delayed / High Risk</span>
              <div className="text-2xl font-black text-rose-700 mt-0.5">
                {houses.filter((h) => h.safetyIssuesCount > 0).length} Units
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto w-full min-w-0">
              <table className="w-full text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase">
                    <th className={`py-3 px-5 ${isRTL ? 'text-right' : 'text-left'}`}>House ID</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Owner Name</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>District</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Current Stage</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Progress %</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Status</th>
                    <th className={`py-3 px-5 ${isRTL ? 'text-left' : 'text-right'}`}>Loan Disbursed</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHouses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                      No houses matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredHouses.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-5 font-mono font-black text-orange-700">{h.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{h.ownerName}</td>
                      <td className="py-3.5 px-4 text-slate-700">{h.district}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{h.stage}</td>
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-700">{h.progressPct}%</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 border">
                          {h.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900">
                        PKR {(h.loanDisbursed / 1000).toLocaleString()}k
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DOMAIN 2: LOANS REPORT
         ========================================================================= */}
      {reportDomain === 'LOANS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Loan Accounts</span>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {loans.length} Beneficiaries
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-emerald-800 font-bold uppercase">Total Disbursed (50% Tranches)</span>
              <div className="text-xl font-black text-emerald-700 mt-0.5">
                PKR {(loans.reduce((acc, l) => acc + (l.disbursedAmount || 750000), 0) / 1000000).toFixed(2)}M
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-amber-800 font-bold uppercase">Pending Milestones</span>
              <div className="text-xl font-black text-amber-700 mt-0.5">
                {loans.reduce((acc, l) => acc + l.tranches.filter(t => t.status !== 'Disbursed').length, 0)} Tranches
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto w-full min-w-0">
              <table className="w-full text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase">
                    <th className={`py-3 px-5 ${isRTL ? 'text-right' : 'text-left'}`}>Loan ID</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Applicant</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>House ID</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Approved (PKR)</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Disbursed (PKR)</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Remaining (PKR)</th>
                    <th className={`py-3 px-5 ${isRTL ? 'text-left' : 'text-right'}`}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                        No loans matching your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredLoans.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-5 font-mono font-black text-slate-900">{l.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{l.applicant}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-orange-700">{l.houseId}</td>
                        <td className="py-3.5 px-4 font-mono">PKR {(l.approvedAmount / 1000).toLocaleString()}k</td>
                        <td className="py-3.5 px-4 font-mono font-black text-emerald-700">PKR {((l.disbursedAmount || 750000) / 1000).toLocaleString()}k</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">PKR {((l.remainingAmount || 750000) / 1000).toLocaleString()}k</td>
                        <td className="py-3.5 px-5 text-right font-bold text-slate-800">{l.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DOMAIN 3: LABOUR TRAINING & ARTISANS REPORT
         ========================================================================= */}
      {reportDomain === 'LABOUR' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Site Workers</span>
              <div className="text-xl font-black text-slate-900 mt-0.5">{workers.length} Artisans</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Certified Trained</span>
              <div className="text-xl font-black text-emerald-700 mt-0.5">
                {workers.filter((w) => w.trainingStatus === 'Trained').length}
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Required Topics</span>
              <div className="text-xl font-black text-amber-700 mt-0.5">
                {workers.filter((w) => w.trainingStatus !== 'Trained').length}
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Field Sessions Logged</span>
              <div className="text-xl font-black text-purple-900 mt-0.5">
                {engineers.reduce((acc, e) => acc + e.trainingSessionsConducted, 0)} Sessions
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto w-full min-w-0">
              <table className="w-full text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase">
                    <th className={`py-3 px-5 ${isRTL ? 'text-right' : 'text-left'}`}>Worker ID</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Artisan Name</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Trade Skill</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Assigned House</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Safety Modules</th>
                    <th className={`py-3 px-5 ${isRTL ? 'text-left' : 'text-right'}`}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                        No workers found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredWorkers.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-5 font-mono font-black text-slate-900">{w.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{w.name}</td>
                        <td className="py-3.5 px-4 text-blue-700 font-bold">{w.skill}</td>
                        <td className="py-3.5 px-4 font-mono text-orange-700">{w.assignedHouseId}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {w.completedTopics ? w.completedTopics.join(', ') : 'Scaffolding & PPE'}
                        </td>
                        <td className="py-3.5 px-5 text-right font-bold text-emerald-700">{w.trainingStatus}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DOMAIN 4: SAFETY & COMPLIANCE REPORT
         ========================================================================= */}
      {reportDomain === 'SAFETY' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Logged Incidents</span>
              <div className="text-xl font-black text-slate-900 mt-0.5">{safetyIssues.length}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Critical Stop-Work Orders</span>
              <div className="text-xl font-black text-rose-700 mt-0.5">
                {safetyIssues.filter((s) => s.severity === 'Critical').length}
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Rectified & Closed</span>
              <div className="text-xl font-black text-emerald-700 mt-0.5">
                {safetyIssues.filter((s) => s.status === 'Resolved').length}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto w-full min-w-0">
              <table className="w-full text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase">
                    <th className={`py-3 px-5 ${isRTL ? 'text-right' : 'text-left'}`}>Incident ID</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>House ID</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Defect Description</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Severity</th>
                    <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Assigned Engineer</th>
                    <th className={`py-3 px-5 ${isRTL ? 'text-left' : 'text-right'}`}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSafety.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                        No safety issues matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredSafety.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-5 font-mono font-black text-slate-900">{s.id}</td>
                        <td className="py-3.5 px-4 font-mono text-orange-700">{s.houseId}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{s.issueType}</td>
                        <td className="py-3.5 px-4 font-bold text-rose-700">{s.severity}</td>
                        <td className="py-3.5 px-4 text-slate-700">{s.assignedEngineer}</td>
                        <td className={`py-3.5 px-5 ${isRTL ? 'text-left' : 'text-right'} font-bold text-slate-800`}>{s.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DOMAIN 5: ENGINEER SCORECARDS REPORT
         ========================================================================= */}
      {reportDomain === 'ENGINEERS' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-xs min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase">
                  <th className={`py-3 px-5 ${isRTL ? 'text-right' : 'text-left'}`}>Engineer Name</th>
                  <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>PEC Reg No</th>
                  <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Assigned Division</th>
                  <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Assigned Houses</th>
                  <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Completed Inspections</th>
                  <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Labour Sessions</th>
                  <th className={`py-3 px-5 ${isRTL ? 'text-left' : 'text-right'}`}>Safety Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEngineers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                      No engineers found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredEngineers.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-5 font-black text-slate-900">{e.name}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{e.pecNo}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{e.assignedDivision}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-orange-700">{e.assignedHousesCount}</td>
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-700">{e.completedVisits}</td>
                      <td className="py-3.5 px-4 font-mono text-purple-900">{e.trainingSessionsConducted}</td>
                      <td className={`py-3.5 px-5 ${isRTL ? 'text-left' : 'text-right'} font-black text-emerald-700`}>{e.safetyComplianceScore || 98}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DAILY PROGRESS REPORT (DPR) WITH DETAILED VISITS & WORKERS
         ========================================================================= */}
      {isDprModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in">
            {/* Modal Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-600 text-white flex items-center justify-center shadow-md">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    ACAG Daily Progress Report (DPR) Preview & PDF Export
                  </h3>
                  <p className="text-xs text-slate-500">
                    Government of Punjab • HUD&PHED • Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDprModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Mapped Houses</span>
                <span className="text-base font-black text-slate-900">{houses.length} Units</span>
              </div>
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200">
                <span className="text-[10px] text-blue-700 font-bold uppercase block">Under Construction</span>
                <span className="text-base font-black text-blue-900">{houses.filter((h) => h.status === 'Under Construction').length} Units</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">Completed Handover</span>
                <span className="text-base font-black text-emerald-800">{houses.filter((h) => h.status === 'Completed').length} Units</span>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200">
                <span className="text-[10px] text-amber-700 font-bold uppercase block">Active Artisans</span>
                <span className="text-base font-black text-amber-900">{workers.length} Workers</span>
              </div>
            </div>

            {/* 1. Engineer Field Visits Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ClipboardCheck className="h-4 w-4 text-emerald-600" />
                  <span>Engineer Field Visits & Inspections ({visits.length})</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-bold">Live GPS & PEC Verified</span>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 max-h-40 overflow-y-auto space-y-2 text-xs">
                {visits.slice(0, 4).map((v) => (
                  <div key={v.id} className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900 flex items-center gap-2">
                        <span>{v.engineerName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-mono font-black">{v.houseId}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({v.stage})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{v.notes || 'Foundation structural inspection completed as per ACAG guidelines.'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-100 text-emerald-800 shrink-0">
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Labour & Safety Training Record */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span>On-Site Labour & Safety Training Roster ({workers.length})</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-bold">PPE & Module Certified</span>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 max-h-40 overflow-y-auto space-y-2 text-xs">
                {workers.slice(0, 4).map((w) => (
                  <div key={w.id} className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-black text-slate-900">{w.id}</span>
                      <div>
                        <div className="font-bold text-slate-900">
                          {w.name} • <span className="text-blue-700 font-black">{w.skill}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Assigned: <strong className="text-orange-700">{w.assignedHouseId}</strong> • Training: {w.trainingStatus || 'Trained'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-teal-100 text-teal-800 shrink-0">
                      {w.safetyStatus || 'PPE Cleared'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">
                Generates a multi-page official Government PDF with complete logs and signature stamps.
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDprModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDownloadDprPdf}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-black shadow-md shadow-orange-500/25 transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Official DPR (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
