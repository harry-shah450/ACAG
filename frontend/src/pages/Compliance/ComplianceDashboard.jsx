import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { complianceApi, projectsApi } from '../../api/endpoints';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck2,
  ChevronRight,
  Send,
  Building
} from 'lucide-react';

export const ComplianceDashboard = () => {
  const { user, isAdmin, isEngineer } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [riskSites, setRiskSites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Project for Inspection
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  // HSE Form State
  const [hseSubmitting, setHseSubmitting] = useState(false);
  const [hseSuccess, setHseSuccess] = useState('');
  const [hseChecks, setHseChecks] = useState({
    ppe_compliance: true,
    first_aid_available: true,
    safe_scaffolding: true,
    hazardous_material_stored: true,
    emergency_contacts_posted: true,
    site_cleanliness: true,
    notes: 'All mandatory personal protective equipment & first aid boxes verified on site.',
  });

  // ESS Form State
  const [essSubmitting, setEssSubmitting] = useState(false);
  const [essSuccess, setEssSuccess] = useState('');
  const [essChecks, setEssChecks] = useState({
    no_child_labor: true,
    water_drainage_adequate: true,
    waste_disposal_compliant: true,
    no_community_disturbance: true,
    notes: 'No environmental or social violations observed during audit.',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([
        complianceApi.getSiteRiskRegister(),
        projectsApi.getProjects({ page_size: 50 }),
      ]);
      setRiskSites(rRes?.data || []);
      const pList = pRes?.data?.results || pRes?.data || [];
      setProjects(pList);
      if (pList.length > 0) {
        setSelectedProjectId(pList[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleHseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setHseSubmitting(true);
    setHseSuccess('');
    try {
      await complianceApi.submitHseChecklist(selectedProjectId, hseChecks);
      setHseSuccess('HSE Checklist recorded successfully!');
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Submission failed');
    } finally {
      setHseSubmitting(false);
    }
  };

  const handleEssSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setEssSubmitting(true);
    setEssSuccess('');
    try {
      await complianceApi.submitEssChecklist(selectedProjectId, essChecks);
      setEssSuccess('ESS Checklist recorded successfully!');
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Submission failed');
    } finally {
      setEssSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with ACAG Forest Green Theme */}
      <div className="rounded-2xl bg-[#0D5C3A] p-6 text-white shadow-lg border border-emerald-600/30 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold">{t('complianceTitle')}</h1>
          <p className="text-xs text-emerald-100 mt-0.5">{t('complianceDesc')}</p>
        </div>
      </div>

      {/* Flagged Sites (Risk Register) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">{t('flaggedSitesTitle')}</h2>
        </div>

        {riskSites.length === 0 ? (
          <div className="p-6 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Zero critical safety or environmental hazard flags active across Punjab projects.</span>
          </div>
        ) : (
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('caseId')}</th>
                  <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('applicantName')}</th>
                  <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('location')}</th>
                  <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('failedCriteria')}</th>
                  <th className={`py-3 px-4 ${isRTL ? 'text-left' : 'text-right'}`}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riskSites.map((site, i) => (
                  <tr key={i} className="hover:bg-rose-50/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-900">{site.case_id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{site.owner_name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{site.district}, {site.division}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {site.failed_checks?.map((c, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={`py-3.5 px-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                      <button
                        onClick={() => navigate(`/projects/${site.id}`)}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold"
                      >
                        {t('view360')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Target Project Selector for Inspections */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-blue-800" />
          <span className="text-xs font-bold text-slate-800">{t('inspectSite')}:</span>
        </div>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full sm:w-96 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-blue-900"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.case_id} - {p.owner_name} ({p.district})
            </option>
          ))}
        </select>
      </div>

      {/* 2-Column Inspection Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. HSE Check Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-2">{t('hseInspectionTitle')}</h3>
          {hseSuccess && <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs">{hseSuccess}</div>}
          <form onSubmit={handleHseSubmit} className="space-y-3 text-xs">
            {[
              { id: 'ppe_compliance', label: '1. Personal Protective Equipment (PPE: Helmets, Boots, Vests)' },
              { id: 'first_aid_available', label: '2. Fully stocked First Aid Kit readily accessible' },
              { id: 'safe_scaffolding', label: '3. Secure, inspected scaffolding & guardrails' },
              { id: 'hazardous_material_stored', label: '4. Hazardous chemical/fuel containment compliant' },
              { id: 'emergency_contacts_posted', label: '5. Emergency response contacts visibly displayed' },
              { id: 'site_cleanliness', label: '6. Debris cleared & safe passage maintained' },
            ].map((chk) => (
              <label key={chk.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span className="font-semibold text-slate-700">{chk.label}</span>
                <input
                  type="checkbox"
                  checked={hseChecks[chk.id]}
                  onChange={(e) => setHseChecks({ ...hseChecks, [chk.id]: e.target.checked })}
                  className="h-4 w-4 rounded text-blue-700"
                />
              </label>
            ))}

            <div>
              <textarea
                rows="2"
                value={hseChecks.notes}
                onChange={(e) => setHseChecks({ ...hseChecks, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                placeholder="HSE Inspector observations..."
              />
            </div>

            <button
              type="submit"
              disabled={hseSubmitting}
              className="w-full py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
            >
              {hseSubmitting ? <Spinner size="sm" /> : t('submitHse')}
            </button>
          </form>
        </div>

        {/* 2. ESS Safeguards Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-2">{t('essSafeguardsTitle')}</h3>
          {essSuccess && <div className="mb-3 p-2.5 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs">{essSuccess}</div>}
          <form onSubmit={handleEssSubmit} className="space-y-3 text-xs">
            {[
              { id: 'no_child_labor', label: '1. Strict zero child labor verification' },
              { id: 'water_drainage_adequate', label: '2. Environmental run-off & drainage safeguard' },
              { id: 'waste_disposal_compliant', label: '3. Construction waste disposal protocol' },
              { id: 'no_community_disturbance', label: '4. Community safety & noise prevention compliance' },
            ].map((chk) => (
              <label key={chk.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span className="font-semibold text-slate-700">{chk.label}</span>
                <input
                  type="checkbox"
                  checked={essChecks[chk.id]}
                  onChange={(e) => setEssChecks({ ...essChecks, [chk.id]: e.target.checked })}
                  className="h-4 w-4 rounded text-teal-700"
                />
              </label>
            ))}

            <div>
              <textarea
                rows="2"
                value={essChecks.notes}
                onChange={(e) => setEssChecks({ ...essChecks, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                placeholder="ESS Environmental Auditor notes..."
              />
            </div>

            <button
              type="submit"
              disabled={essSubmitting}
              className="w-full py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold shadow-xs cursor-pointer"
            >
              {essSubmitting ? <Spinner size="sm" /> : t('submitEss')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
