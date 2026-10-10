import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { reportsApi } from '../../api/endpoints';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  History,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const ReportsCenter = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // DPR Options
  const [dprDate, setDprDate] = useState(new Date().toISOString().slice(0, 10));
  const [dprScope, setDprScope] = useState('ALL');
  const [dprScopeValue, setDprScopeValue] = useState('');

  // District Excel Options
  const [excelDivision, setExcelDivision] = useState('');
  const [excelDistrict, setExcelDistrict] = useState('');

  // Handover Report Options
  const [hoDivision, setHoDivision] = useState('');
  const [hoDistrict, setHoDistrict] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await reportsApi.getReportHistory();
      setHistory(res?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDownloadDPR = () => {
    const params = { date: dprDate, scope: dprScope };
    if (dprScopeValue) params.scope_value = dprScopeValue;
    window.open(reportsApi.getDPRUrl(params), '_blank');
    setTimeout(fetchHistory, 1500);
  };

  const handleDownloadExcel = () => {
    const params = {};
    if (excelDivision) params.division = excelDivision;
    if (excelDistrict) params.district = excelDistrict;
    window.open(reportsApi.getDistrictExcelUrl(params), '_blank');
    setTimeout(fetchHistory, 1500);
  };

  const handleDownloadHandoverReport = () => {
    const params = {};
    if (hoDivision) params.division = hoDivision;
    if (hoDistrict) params.district = hoDistrict;
    window.open(reportsApi.getHandoverReportUrl(params), '_blank');
    setTimeout(fetchHistory, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with ACAG Forest Green theme */}
      <div className="rounded-2xl bg-[#0D5C3A] p-6 text-white shadow-lg border border-emerald-600/30 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold">{t('reportsTitle')}</h1>
          <p className="text-xs text-emerald-100 mt-0.5">{t('reportsDesc')}</p>
        </div>
      </div>

      {/* 3 Report Generators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. DPR PDF Report */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <div className="p-1 rounded-lg bg-blue-100 text-blue-800">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">{t('dprTitle')}</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">{t('dprDesc')}</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('date')}</label>
                <input
                  type="date"
                  value={dprDate}
                  onChange={(e) => setDprDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scope</label>
                <select
                  value={dprScope}
                  onChange={(e) => setDprScope(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
                >
                  <option value="ALL">All Regions (Punjab Overall)</option>
                  <option value="DIVISION">By Division</option>
                  <option value="DISTRICT">By District</option>
                </select>
              </div>

              {dprScope !== 'ALL' && (
                <div>
                  <input
                    type="text"
                    placeholder="e.g. Lahore / Rawalpindi"
                    value={dprScopeValue}
                    onChange={(e) => setDprScopeValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleDownloadDPR}
            className="mt-6 w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer text-xs"
          >
            <Download className="h-4 w-4" />
            <span>{t('generateDpr')}</span>
          </button>
        </div>

        {/* 2. District Excel Export */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <div className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">{t('excelTitle')}</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">{t('excelDesc')}</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('division')}</label>
                <select
                  value={excelDivision}
                  onChange={(e) => setExcelDivision(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
                >
                  <option value="">{t('allDivisions')}</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Multan">Multan</option>
                  <option value="Faisalabad">Faisalabad</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('district')}</label>
                <input
                  type="text"
                  placeholder="Optional district filter"
                  value={excelDistrict}
                  onChange={(e) => setExcelDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadExcel}
            className="mt-6 w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer text-xs"
          >
            <Download className="h-4 w-4" />
            <span>{t('exportExcel')}</span>
          </button>
        </div>

        {/* 3. Handover Summary PDF */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <div className="p-1 rounded-lg bg-purple-100 text-purple-800">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">{t('hoReportTitle')}</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">{t('hoReportDesc')}</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('division')}</label>
                <select
                  value={hoDivision}
                  onChange={(e) => setHoDivision(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
                >
                  <option value="">{t('allDivisions')}</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Multan">Multan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('district')}</label>
                <input
                  type="text"
                  placeholder="Optional district filter"
                  value={hoDistrict}
                  onChange={(e) => setHoDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadHandoverReport}
            className="mt-6 w-full py-2.5 px-4 bg-purple-900 hover:bg-purple-800 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer text-xs"
          >
            <Download className="h-4 w-4" />
            <span>{t('generateHandoverReport')}</span>
          </button>
        </div>
      </div>

      {/* Archives Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-500" />
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">{t('reportArchives')}</h3>
          </div>
          <button
            onClick={fetchHistory}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {loadingHistory ? (
          <Spinner message="Loading archives..." className="h-40" />
        ) : history.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            <span>No reports archived yet. Generate a report above to start tracking.</span>
          </div>
        ) : (
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-extrabold uppercase">
                  <th className={`py-3 px-6 ${isRTL ? 'text-right' : 'text-left'}`}>Report Type</th>
                  <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Scope</th>
                  <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Generated By</th>
                  <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Timestamp</th>
                  <th className={`py-3 px-6 ${isRTL ? 'text-left' : 'text-right'}`}>Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-6 font-bold text-slate-800">
                      {r.report_type}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {r.scope} {r.scope_value ? `(${r.scope_value})` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.generated_by}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className={`py-3 px-6 ${isRTL ? 'text-left' : 'text-right'}`}>
                      <a
                        href={r.file_path}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 rounded-lg inline-flex items-center gap-1 text-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
