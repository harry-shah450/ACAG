import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useDashboardData } from '../../context/DashboardDataContext';
import {
  Bell,
  Check,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  CloudSun,
  Home,
  CreditCard,
  ClipboardCheck,
  Users,
  Search,
  Filter,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const NotificationsCenter = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useDashboardData();

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredNotifications = notifications.filter((item) => {
    if (unreadOnly && !item.unread) return false;
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.houseId && item.houseId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'CRITICAL_HAZARD':
      case 'SAFETY_ISSUE':
        return <ShieldAlert className="h-5 w-5 text-rose-600" />;
      case 'ENVIRONMENTAL_RISK':
        return <CloudSun className="h-5 w-5 text-amber-600" />;
      case 'LOAN_APPROVAL':
        return <CreditCard className="h-5 w-5 text-emerald-600" />;
      case 'NEW_APPLICATION':
        return <Home className="h-5 w-5 text-blue-600" />;
      case 'NEW_VISIT':
      case 'VISIT_REPORT':
        return <ClipboardCheck className="h-5 w-5 text-indigo-600" />;
      case 'LABOUR_TRAINING':
        return <Users className="h-5 w-5 text-purple-600" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-teal-600" />;
    }
  };

  const handleNotificationClick = (item) => {
    markNotificationRead(item.id);

    if (item.category === 'Safety') {
      navigate('/safety');
    } else if (item.category === 'Environmental') {
      navigate('/environmental');
    } else if (item.category === 'Application') {
      navigate('/houses');
    } else if (item.category === 'Visits') {
      navigate('/engineer-visits');
    } else if (item.category === 'Labour') {
      navigate('/labour');
    } else if (item.category === 'Loan') {
      navigate('/loans');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Notifications & System Alerts Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed for housing applications, quality checks, AI hazards, environmental alarms, and disbursements
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-orange-700 text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Mark All Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Categories Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Alerts' },
            { id: 'Safety', label: 'Safety & AI Hazards' },
            { id: 'Environmental', label: 'Weather & Climate' },
            { id: 'Application', label: 'House Applications' },
            { id: 'Visits', label: 'Engineer Visits' },
            { id: 'Labour', label: 'Labour Training' },
            { id: 'Loan', label: 'Bank Disbursements' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            <span>Unread Only</span>
          </label>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5 max-w-4xl">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
            <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold">No notifications match your current filter.</p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 cursor-pointer hover:shadow-md ${
                item.unread
                  ? 'bg-orange-50/50 border-orange-200 shadow-2xs'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                  {getNotificationIcon(item.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-slate-900 leading-tight">
                      {item.title}
                    </h3>
                    {item.unread && (
                      <span className="h-2 w-2 rounded-full bg-rose-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold pt-0.5">
                    <span>{item.time}</span>
                    {item.houseId && <span>• House: {item.houseId}</span>}
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="p-2 rounded-xl text-slate-400 hover:text-orange-700 hover:bg-orange-100 transition shrink-0"
                title="Go to Record"
              >
                <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
