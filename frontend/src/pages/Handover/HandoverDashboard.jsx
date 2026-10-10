import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { handoverApi, projectsApi } from '../../api/endpoints';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import {
  KeyRound,
  Download,
  CheckCircle2,
  Clock,
  Zap,
  Flame,
  Droplet,
  Waves,
  FileCheck,
  Building,
  UserCheck,
  HardHat
} from 'lucide-react';

export const HandoverDashboard = () => {
  const { user, isAdmin, isEngineer, isOwner } = useAuth();
  const { t, isRTL } = useLanguage();

  const [summary, setSummary] = useState(null);
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sign & Update Modal
  const [selectedHandover, setSelectedHandover] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checklist, setChecklist] = useState({
    electricity_connected: false,
    gas_connected: false,
    water_connected: false,
    drainage_connected: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, hRes] = await Promise.all([
        handoverApi.getSummary(),
        handoverApi.getHandovers(),
      ]);
      setSummary(sRes?.data || null);
      setHandovers(hRes?.data?.results || hRes?.data || []);
    } catch (e) {
      console.error('Failed to load handovers', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenManage = (h) => {
    setSelectedHandover(h);
    setChecklist({
      electricity_connected: h.electricity_connected || false,
      gas_connected: h.gas_connected || false,
      water_connected: h.water_connected || false,
      drainage_connected: h.drainage_connected || false,
    });
    setModalOpen(true);
  };

  const handleSaveChecklist = async () => {
    setSaving(true);
    try {
      await handoverApi.updateUtilities(selectedHandover.id, checklist);
      setModalOpen(false);
      fetchData();
    } catch (e) {
      alert('Failed to update utilities');
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async (type) => {
    setSaving(true);
    try {
      if (type === 'BENEFICIARY') {
        await handoverApi.signBeneficiary(selectedHandover.id, {
          signature_hash: `sig_ben_${Date.now()}`,
          sign_date: new Date().toISOString(),
        });
      } else {
        await handoverApi.signEngineer(selectedHandover.id, {
          signature_hash: `sig_eng_${Date.now()}`,
          sign_date: new Date().toISOString(),
        });
      }
      setModalOpen(false);
      fetchData();
    } catch (e) {
      alert('Signing failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with ACAG Forest Green theme */}
      <div className="rounded-2xl bg-[#0D5C3A] p-6 text-white shadow-lg border border-emerald-600/30 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
          <KeyRound className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold">{t('handoverTitle')}</h1>
          <p className="text-xs text-emerald-100 mt-0.5">{t('handoverDesc')}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-700 text-white shadow-sm border border-emerald-600/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-emerald-200 block">{t('totalHandedOver')}</span>
            <span className="text-3xl font-black mt-1 block">{summary?.total_handed_over || 4}</span>
          </div>
          <CheckCircle2 className="h-8 w-8 text-white/30" />
        </div>

        <div className="p-5 rounded-2xl bg-amber-500 text-slate-950 shadow-sm border border-amber-400/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-amber-950 block">{t('pendingHandover')}</span>
            <span className="text-3xl font-black mt-1 block">{summary?.pending_handover || 6}</span>
          </div>
          <Clock className="h-8 w-8 text-slate-950/30" />
        </div>

        <div className="p-5 rounded-2xl bg-blue-800 text-white shadow-sm border border-blue-700/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-blue-200 block">{t('underConstructionCount')}</span>
            <span className="text-3xl font-black mt-1 block">{summary?.total_under_construction || 10}</span>
          </div>
          <Building className="h-8 w-8 text-white/30" />
        </div>
      </div>

      {/* Handovers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <Spinner message="Loading handover status..." className="h-64" />
        ) : (
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-extrabold uppercase">
                  <th className={`py-3.5 px-6 ${isRTL ? 'text-right' : 'text-left'}`}>{t('caseId')}</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('applicantName')}</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('utilitiesChecklist')}</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('dualSignatures')}</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('status')}</th>
                  <th className={`py-3.5 px-6 ${isRTL ? 'text-left' : 'text-right'}`}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {handovers.map((h) => {
                  const utilitiesDone = h.electricity_connected && h.gas_connected && h.water_connected && h.drainage_connected;
                  const signaturesDone = h.beneficiary_signature && h.field_engineer_signature;
                  return (
                    <tr key={h.id} className="hover:bg-emerald-50/30 transition">
                      <td className="py-4 px-6 font-mono font-black text-emerald-950">
                        {h.project?.case_id}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">
                        {h.project?.owner_name}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <span title="Electricity" className={`p-1 rounded-md ${h.electricity_connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            <Zap className="h-3.5 w-3.5" />
                          </span>
                          <span title="Gas" className={`p-1 rounded-md ${h.gas_connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            <Flame className="h-3.5 w-3.5" />
                          </span>
                          <span title="Water" className={`p-1 rounded-md ${h.water_connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            <Droplet className="h-3.5 w-3.5" />
                          </span>
                          <span title="Drainage" className={`p-1 rounded-md ${h.drainage_connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            <Waves className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[11px] font-bold">
                        <div className="space-y-0.5">
                          <div className={h.beneficiary_signature ? 'text-emerald-700' : 'text-slate-400'}>
                            &bull; Owner: {h.beneficiary_signature ? 'Signed' : 'Pending'}
                          </div>
                          <div className={h.field_engineer_signature ? 'text-emerald-700' : 'text-slate-400'}>
                            &bull; Engineer: {h.field_engineer_signature ? 'Signed' : 'Pending'}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={h.handover_completed ? 'success' : 'warning'} size="sm">
                          {h.handover_completed ? 'Handed Over' : 'In Progress'}
                        </Badge>
                      </td>
                      <td className={`py-4 px-6 ${isRTL ? 'text-left' : 'text-right'} space-x-2`}>
                        <button
                          onClick={() => handleOpenManage(h)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer"
                        >
                          {t('manageHandover')}
                        </button>
                        {h.handover_completed && (
                          <a
                            href={projectsApi.getCertificateUrl(h.project?.id || h.project_id)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-1 transition"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>PDF</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MANAGE MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${t('manageHandover')} - ${selectedHandover?.project?.case_id}`}
      >
        <div className="space-y-5 text-xs">
          <div>
            <h3 className="font-bold text-slate-800 mb-2">{t('utilitiesChecklist')}</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'electricity_connected', label: t('electricity') },
                { id: 'gas_connected', label: t('gas') },
                { id: 'water_connected', label: t('water') },
                { id: 'drainage_connected', label: t('drainage') },
              ].map((u) => (
                <label key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="font-semibold text-slate-700">{u.label}</span>
                  <input
                    type="checkbox"
                    checked={checklist[u.id]}
                    onChange={(e) => setChecklist({ ...checklist, [u.id]: e.target.checked })}
                    className="h-4 w-4 rounded text-emerald-700"
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={handleSaveChecklist}
              disabled={saving}
              className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl"
            >
              {t('save')}
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2">{t('dualSignatures')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSign('BENEFICIARY')}
                disabled={saving || !!selectedHandover?.beneficiary_signature}
                className={`p-3 rounded-xl border text-center font-bold transition ${
                  selectedHandover?.beneficiary_signature
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 cursor-default'
                    : 'bg-white border-blue-200 text-blue-900 hover:bg-blue-50 cursor-pointer'
                }`}
              >
                {selectedHandover?.beneficiary_signature ? '✓ Beneficiary Signed' : t('signBeneficiary')}
              </button>

              <button
                type="button"
                onClick={() => handleSign('ENGINEER')}
                disabled={saving || !!selectedHandover?.field_engineer_signature}
                className={`p-3 rounded-xl border text-center font-bold transition ${
                  selectedHandover?.field_engineer_signature
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 cursor-default'
                    : 'bg-white border-teal-200 text-teal-900 hover:bg-teal-50 cursor-pointer'
                }`}
              >
                {selectedHandover?.field_engineer_signature ? '✓ Engineer Signed' : t('signEngineer')}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
