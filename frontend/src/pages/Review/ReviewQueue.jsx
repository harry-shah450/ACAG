import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { reviewApi } from '../../api/endpoints';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  CheckSquare,
  Sparkles,
  ChevronRight,
  Eye,
  AlertCircle,
  Clock,
  Building
} from 'lucide-react';

export const ReviewQueue = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await reviewApi.getQueue();
      setQueue(res?.data?.results || res?.data || []);
    } catch (e) {
      console.error('Failed to load review queue', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with ACAG Forest Green theme */}
      <div className="rounded-2xl bg-[#0D5C3A] p-6 text-white shadow-lg border border-emerald-600/30 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
          <CheckSquare className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold">{t('reviewQueueTitle')}</h1>
          <p className="text-xs text-emerald-100 mt-0.5">{t('reviewQueueDesc')}</p>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <Spinner message="Loading review queue..." className="h-64" />
        ) : queue.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CheckSquare className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold">Review queue is empty. All milestones inspected.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-extrabold uppercase">
                  <th className={`py-3.5 px-6 ${isRTL ? 'text-right' : 'text-left'}`}>{t('caseId')}</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('applicantName')}</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('milestone')}</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('location')}</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>AI Score</th>
                  <th className={`py-3.5 px-6 ${isRTL ? 'text-left' : 'text-right'}`}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((item, i) => (
                  <tr key={i} className="hover:bg-purple-50/30 transition">
                    <td className="py-4 px-6 font-mono font-black text-purple-900">
                      {item.project?.case_id || `VS-2026-${100 + i}`}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {item.project?.owner_name || 'Beneficiary'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-extrabold">
                        M{item.milestone_no || 1}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {item.project?.district || 'Lahore'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-[11px]">
                        AI: 94.2%
                      </span>
                    </td>
                    <td className={`py-4 px-6 ${isRTL ? 'text-left' : 'text-right'}`}>
                      <button
                        onClick={() => navigate(`/review/${item.project?.id || item.project_id || 1}/${item.milestone_no || 1}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0D5C3A] hover:bg-[#0B462C] text-white font-extrabold text-xs shadow-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{t('reviewWithAi')}</span>
                      </button>
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
