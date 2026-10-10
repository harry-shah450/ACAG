import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useDashboardData } from '../../context/DashboardDataContext';
import { generateDomainPdf } from '../../utils/pdfGenerator';
import {
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Eye,
  Check,
  X,
  ArrowUpRight,
  Download,
  Calendar,
  Layers,
  Banknote,
  Receipt
} from 'lucide-react';

export const LoanManagement = () => {
  const { t, isRTL } = useLanguage();
  const { loans, houses, disburseTranche, approveLoan, rejectLoan } = useDashboardData();

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedLoanDetail, setSelectedLoanDetail] = useState(null);
  const [disburseModalLoan, setDisburseModalLoan] = useState(null);
  const [selectedTrancheToDisburse, setSelectedTrancheToDisburse] = useState(null);

  const totalApproved = loans.reduce((acc, l) => acc + (l.approvedAmount || 0), 0);
  const totalDisbursed = loans.reduce((acc, l) => acc + (l.disbursedAmount || 0), 0);
  const totalRemaining = Math.max(0, totalApproved - totalDisbursed);
  const completedLoansCount = loans.filter((l) => l.status === 'Completed').length;

  const tabCounts = {
    ALL: loans.length,
    APPLICATIONS: loans.filter((l) => l.status === 'Pending Application').length,
    APPROVED: loans.filter((l) => l.status === 'Approved').length,
    DISBURSEMENTS: loans.filter((l) => l.status === 'Active').length,
    COMPLETED: loans.filter((l) => l.status === 'Completed').length,
  };

  const filteredLoans = loans.filter((l) => {
    if (activeTab === 'APPLICATIONS' && l.status !== 'Pending Application') return false;
    if (activeTab === 'APPROVED' && l.status !== 'Approved') return false;
    if (activeTab === 'DISBURSEMENTS' && l.status !== 'Active') return false;
    if (activeTab === 'COMPLETED' && l.status !== 'Completed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const applicant = (l.applicant || l.ownerName || '').toLowerCase();
      const cnic = (l.cnic || l.ownerCnic || '').toLowerCase();
      const id = (l.id || '').toLowerCase();
      const houseId = (l.houseId || '').toLowerCase();
      const division = (l.division || l.district || '').toLowerCase();
      return (
        id.includes(q) ||
        applicant.includes(q) ||
        cnic.includes(q) ||
        houseId.includes(q) ||
        division.includes(q)
      );
    }
    return true;
  });

  const handleDisburseConfirm = () => {
    if (disburseModalLoan && selectedTrancheToDisburse) {
      disburseTranche(
        disburseModalLoan.id,
        selectedTrancheToDisburse.trancheNo,
        selectedTrancheToDisburse.amount
      );
      setDisburseModalLoan(null);
      setSelectedTrancheToDisburse(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {isRTL ? 'ہاؤسنگ لون اور اقساط کی ادائیگی کا انتظام' : 'Housing Loan & Disbursement Management'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRTL
              ? 'بینک آف پنجاب (BOP) سبسیڈائزڈ ہاؤسنگ فنانسنگ، اقساط کی تصدیق اور ترسیل'
              : 'Administer Bank of Punjab (BOP) subsidized housing financing, installment milestone verifications, and tranche disbursements'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-orange-600 shrink-0" />
            <span>{isRTL ? 'بینک آف پنجاب (BOP) ڈسبرسمنٹ چینل فعال ہے' : 'Bank of Punjab (BOP) Disbursement Channel Active'}</span>
          </span>
        </div>
      </div>

      {/* Top Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 min-w-0">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-black shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              {isRTL ? 'کل منظور شدہ رقم' : 'Total Approved'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block truncate font-mono">
              {isRTL ? `${(totalApproved / 100000).toLocaleString()} لاکھ روپے` : `PKR ${(totalApproved / 1000000).toFixed(2)}M`}
            </span>
            <span className="text-[9.5px] text-slate-400 block truncate">
              {isRTL ? 'مجموعی پراجیکٹ فنانسنگ' : 'Total Program Financing'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black shrink-0">
            <Banknote className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              {isRTL ? 'کل ادا شدہ رقم' : 'Total Disbursed'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 block truncate font-mono">
              {isRTL ? `${(totalDisbursed / 100000).toLocaleString()} لاکھ روپے` : `PKR ${(totalDisbursed / 1000000).toFixed(2)}M`}
            </span>
            <span className="text-[9.5px] text-emerald-600 font-bold block truncate">
              {isRTL
                ? `${Math.round((totalDisbursed / (totalApproved || 1)) * 100)}% رقم جاری ہو چکی ہے`
                : `${Math.round((totalDisbursed / (totalApproved || 1)) * 100)}% Disbursed`}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              {isRTL ? 'باقی ماندہ اقساط' : 'Remaining Tranches'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-700 block truncate font-mono">
              {isRTL ? `${(totalRemaining / 100000).toLocaleString()} لاکھ روپے` : `PKR ${(totalRemaining / 1000000).toFixed(2)}M`}
            </span>
            <span className="text-[9.5px] text-amber-700 font-bold block truncate">
              {isRTL ? 'مراحل کی تصدیق پر موقوف' : 'Pending Milestone Clearances'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-black shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              {isRTL ? 'مکمل شدہ کھاتے' : 'Completed Loans'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-purple-900 block truncate font-mono">
              <span className="ltr-isolate">{completedLoansCount}</span> {isRTL ? 'کھاتے' : 'Loans'}
            </span>
            <span className="text-[9.5px] text-purple-700 font-bold block truncate">
              {isRTL ? '100% ادائیگی مکمل' : '100% Disbursed'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'ALL', label: isRTL ? 'تمام کھاتے' : 'All Accounts' },
          { id: 'APPLICATIONS', label: isRTL ? 'قرضہ درخواستیں' : 'Loan Applications' },
          { id: 'APPROVED', label: isRTL ? 'منظور شدہ قرضے' : 'Approved Loans' },
          { id: 'DISBURSEMENTS', label: isRTL ? 'جاری ادائیگیاں' : 'Active Disbursements' },
          { id: 'COMPLETED', label: isRTL ? 'مکمل شدہ قرضے' : 'Completed Loans' },
        ].map((tab) => {
          const count = tabCounts[tab.id];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ltr-isolate ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Export Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className={`h-4 w-4 text-slate-400 absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 pointer-events-none`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'لون نمبر، درخواست گزار، شناختی کارڈ یا مکان سے تلاش کریں...' : 'Search by loan ID, applicant, CNIC, house...'}
            className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800 transition`}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            generateDomainPdf({
              domain: 'LOANS',
              loans: filteredLoans,
              districtFilter: 'All Divisions',
              dateRange: 'BOP Subsidized Housing Financing'
            });
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer self-end sm:self-auto shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>{isRTL ? 'بی او پی اسٹیٹمنٹ پی ڈی ایف' : 'Export BOP Statement (PDF)'}</span>
        </button>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-xs min-w-[780px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase tracking-wider">
                <th className={`py-3.5 px-5 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'لون نمبر' : 'Loan ID'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'درخواست گزار / شناختی کارڈ' : 'Applicant / CNIC'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'مکان نمبر' : 'House ID'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'منظور شدہ رقم' : 'Approved Amount'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'ادا شدہ رقم' : 'Disbursed (PKR)'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'باقی رقم' : 'Remaining (PKR)'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'حیثیت' : 'Status'}</th>
                <th className={`py-3.5 px-5 ${isRTL ? 'text-left' : 'text-right'}`}>{isRTL ? 'کارروائی' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-slate-50/80 transition">
                  {/* Loan ID */}
                  <td className="py-4 px-5">
                    <div className="font-mono font-black text-slate-900 ltr-isolate">{loan.id}</div>
                    <div className="text-[10px] text-slate-400 ltr-isolate">{loan.appliedDate}</div>
                  </td>

                  {/* Applicant & CNIC */}
                  <td className="py-4 px-4">
                    <div className="font-black text-slate-900">
                      {loan.applicant || loan.ownerName || 'Beneficiary'}
                    </div>
                    <div className="text-[11px] font-bold text-slate-600 font-mono tracking-wide ltr-isolate">
                      {loan.cnic || loan.ownerCnic || (loan.applicant === 'Farhan' || loan.ownerName === 'Farhan' ? '34321-2112121-1' : '35201-1111111-1')}
                    </div>
                  </td>

                  {/* House ID & Location */}
                  <td className="py-4 px-4">
                    <div className="font-mono font-black text-orange-700 ltr-isolate">{loan.houseId}</div>
                    <div className="text-[10px] text-slate-500">{loan.division || loan.district || 'Lahore'}</div>
                  </td>

                  {/* Approved Amount */}
                  <td className="py-4 px-4 font-mono font-extrabold text-slate-900">
                    {isRTL ? `${(loan.approvedAmount / 1000).toLocaleString()} ہزار روپے` : `PKR ${(loan.approvedAmount / 1000).toLocaleString()}k`}
                  </td>

                  {/* Disbursed Amount */}
                  <td className="py-4 px-4">
                    <div className="font-mono font-black text-emerald-700">
                      {isRTL ? `${(loan.disbursedAmount / 1000).toLocaleString()} ہزار روپے` : `PKR ${(loan.disbursedAmount / 1000).toLocaleString()}k`}
                    </div>
                    <div className="text-[9.5px] text-slate-400">
                      <span className="ltr-isolate">{Math.round((loan.disbursedAmount / (loan.approvedAmount || 1)) * 100)}%</span> {isRTL ? 'جاری شدہ' : 'released'}
                    </div>
                  </td>

                  {/* Remaining */}
                  <td className="py-4 px-4 font-mono font-extrabold text-slate-600">
                    {isRTL ? `${(loan.remainingAmount / 1000).toLocaleString()} ہزار روپے` : `PKR ${(loan.remainingAmount / 1000).toLocaleString()}k`}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        loan.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : loan.status === 'Active'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : loan.status === 'Approved'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isRTL
                        ? (loan.status === 'Completed' ? 'مکمل' : loan.status === 'Active' ? 'جاری' : loan.status === 'Approved' ? 'منظور شدہ' : loan.status)
                        : loan.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className={`py-4 px-5 ${isRTL ? 'text-left' : 'text-right'}`}>
                    <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-1.5`}>
                      <button
                        onClick={() => setSelectedLoanDetail(loan)}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:border-orange-300 text-slate-800 hover:text-orange-700 text-[11px] font-bold rounded-lg shadow-2xs transition cursor-pointer"
                        title={isRTL ? 'تفصیلات دیکھیں' : 'View Details'}
                      >
                        {isRTL ? 'تفصیلات' : 'Details'}
                      </button>

                      {loan.status === 'Pending Application' && (
                        <>
                          <button
                            onClick={() => approveLoan(loan.id)}
                            className="p-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                            title={isRTL ? 'قرضہ منظور کریں' : 'Approve Loan'}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => rejectLoan(loan.id, 'Income/plot criteria unfulfilled')}
                            className="p-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition shadow-2xs cursor-pointer"
                            title={isRTL ? 'قرضہ مسترد کریں' : 'Reject Loan'}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}

                      {loan.remainingAmount > 0 && loan.status !== 'Pending Application' && (
                        <button
                          onClick={() => {
                            setDisburseModalLoan(loan);
                            const nextTranche = loan.tranches.find((t) => t.status !== 'Disbursed') || loan.tranches[0];
                            setSelectedTrancheToDisburse(nextTranche);
                          }}
                          className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition cursor-pointer"
                        >
                          {isRTL ? 'قسط جاری کریں' : 'Disburse'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: LOAN DETAILS & 2-TRANCHE BREAKDOWN
         ========================================================================= */}
      {selectedLoanDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    Loan Account: {selectedLoanDetail.id}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800">
                    2-Tranche Model (50% + 50%)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applicant: <strong className="text-slate-800">{selectedLoanDetail.applicant || selectedLoanDetail.ownerName || 'Beneficiary'}</strong> ({selectedLoanDetail.cnic || selectedLoanDetail.ownerCnic || '34321-2112121-1'})
                </p>
              </div>
              <button
                onClick={() => setSelectedLoanDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Bank Information Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Disbursing Bank</span>
                <span className="font-bold text-slate-900">{selectedLoanDetail.bank || selectedLoanDetail.bankBranch || 'Bank of Punjab (BOP)'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Account / IBAN</span>
                <span className="font-mono font-bold text-slate-900">{selectedLoanDetail.accountNo}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">House Case ID</span>
                <span className="font-mono font-bold text-orange-700">{selectedLoanDetail.houseId}</span>
              </div>
            </div>

            {/* Total Loan Progress Bar */}
            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/70 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Total Approved Facility:</span>
                <span className="font-black text-slate-900 font-mono text-sm">PKR {(selectedLoanDetail.approvedAmount / 1000000).toFixed(2)} Million (15 Lakh)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.round((selectedLoanDetail.disbursedAmount / (selectedLoanDetail.approvedAmount || 1)) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>Disbursed: <strong className="text-emerald-700">PKR {selectedLoanDetail.disbursedAmount.toLocaleString()}</strong></span>
                <span>Remaining: <strong className="text-slate-700">PKR {selectedLoanDetail.remainingAmount.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* 2-Tranche Schedule */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Bank of Punjab 2-Tranche Schedule</span>
                <span className="text-[10px] text-slate-500 font-normal">1st Tranche Initial • 2nd Tranche at 50% Completion</span>
              </h4>
              <div className="space-y-2.5">
                {selectedLoanDetail.tranches?.map((tranche) => (
                  <div
                    key={tranche.trancheNo}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between text-xs ${
                      tranche.status === 'Disbursed'
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          tranche.status === 'Disbursed'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-orange-500 text-white shadow-xs'
                        }`}
                      >
                        {tranche.trancheNo === 1 ? '50%' : '50%'}
                      </div>
                      <div>
                        <div className="font-black text-slate-900">
                          Tranche {tranche.trancheNo}: {tranche.stage}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Amount: <strong className="text-slate-900 font-mono">PKR {tranche.amount.toLocaleString()} (7.5 Lakh)</strong>
                          {tranche.date && ` • Disbursed: ${tranche.date}`}
                          {tranche.voucherRef && ` • Voucher: ${tranche.voucherRef}`}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black shrink-0 ${
                        tranche.status === 'Disbursed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {tranche.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLoanDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: DISBURSE INSTALLMENT TRANCHE
         ========================================================================= */}
      {disburseModalLoan && selectedTrancheToDisburse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                Confirm Bank Disbursement
              </h3>
              <button
                onClick={() => setDisburseModalLoan(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 space-y-2 text-xs text-orange-950">
              <div className="font-black text-sm">
                Tranche {selectedTrancheToDisburse.trancheNo} — {selectedTrancheToDisburse.stage}
              </div>
              <div>Applicant: <strong>{disburseModalLoan.applicant}</strong> ({disburseModalLoan.cnic})</div>
              <div>Disbursal Amount: <strong className="font-mono text-base text-orange-900">PKR {selectedTrancheToDisburse.amount.toLocaleString()} (7.5 Lakh / 50%)</strong></div>
              <div>Account: <span className="font-mono font-bold">{disburseModalLoan.accountNo}</span></div>
            </div>

            <p className="text-[11px] text-slate-500">
              Authorizing this release generates a real-time Bank of Punjab treasury voucher and credits the 50% installment (PKR 7.5 Lakh) to the beneficiary's account.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDisburseModalLoan(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisburseConfirm}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition"
              >
                Authorize & Disburse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
