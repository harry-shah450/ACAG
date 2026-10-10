import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDashboardData } from '../../context/DashboardDataContext';
import {
  LayoutDashboard,
  Home,
  ClipboardCheck,
  HardHat,
  Users,
  ShieldAlert,
  CloudSun,
  CreditCard,
  MapPin,
  Cpu,
  BarChart3,
  UserCog,
  Bell,
  Settings,
  ChevronRight,
  LogOut,
  ChevronLeft,
  X,
} from 'lucide-react';

export const Sidebar = ({ mobileMenuOpen = false, setMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const { notifications, safetyIssues, aiHazards, houses } = useDashboardData();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile drawer whenever route changes
  useEffect(() => {
    if (mobileMenuOpen && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      navigate('/login');
    }
  };

  const unreadNotifsCount = notifications?.filter((n) => n.unread)?.length || 0;
  const criticalSafetyCount = safetyIssues?.filter((s) => s.severity === 'Critical' && s.status === 'Open')?.length || 0;
  const pendingAiCount = aiHazards?.filter((a) => a.status === 'Pending Review')?.length || 0;

  const navItems = [
    { label: t('navDashboard'), path: '/', icon: LayoutDashboard, exact: true },
    { label: t('navHouses'), path: '/houses', icon: Home, badge: houses?.length ? `${houses.length}` : null, badgeColor: 'bg-emerald-100 text-emerald-800' },
    { label: t('navEngineerVisits'), path: '/engineer-visits', icon: ClipboardCheck },
    { label: t('navEngineers'), path: '/engineers', icon: HardHat },
    { label: t('navLabourManagement'), path: '/labour', icon: Users },
    { label: t('navSafetyManagement'), path: '/safety', icon: ShieldAlert, badge: criticalSafetyCount > 0 ? `${criticalSafetyCount}` : null, badgeColor: 'bg-rose-100 text-rose-700' },
    { label: t('navEnvironmentalMonitoring'), path: '/environmental', icon: CloudSun },
    { label: t('navAiHazards'), path: '/ai-hazards', icon: Cpu, badge: pendingAiCount > 0 ? `${pendingAiCount}` : null, badgeColor: 'bg-amber-100 text-amber-800' },
    { label: t('navLoanManagement'), path: '/loans', icon: CreditCard },
    { label: t('navGisMap'), path: '/gis-map', icon: MapPin },
    { label: t('navReportsAnalytics'), path: '/reports', icon: BarChart3 },
    { label: t('navUsers'), path: '/users', icon: UserCog },
    { label: t('navNotifications'), path: '/notifications', icon: Bell, badge: unreadNotifsCount > 0 ? `${unreadNotifsCount}` : null, badgeColor: 'bg-rose-600 text-white' },
    { label: t('navSettings'), path: '/settings', icon: Settings },
  ];

  const renderNavList = (isMobileDrawer = false) => (
    <nav className="space-y-1">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={idx}
            to={item.path}
            end={item.exact}
            title={(!isMobileDrawer && collapsed) ? item.label : undefined}
            onClick={() => {
              if (isMobileDrawer && setMobileMenuOpen) {
                setMobileMenuOpen(false);
              }
            }}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                isActive
                  ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-md shadow-orange-500/25 font-extrabold'
                  : 'text-slate-600 hover:bg-orange-50/70 hover:text-orange-950'
              }`
            }
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
              {(!collapsed || isMobileDrawer) && (
                <span className="truncate">{item.label}</span>
              )}
            </div>

            {(!collapsed || isMobileDrawer) && (
              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge && (
                  <span
                    className={`h-4.5 min-w-[18px] px-1.5 rounded-full text-[10px] font-black flex items-center justify-center ${
                      item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`h-3 w-3 opacity-40 group-hover:opacity-100 ${isRTL ? 'rotate-180' : ''}`} />
              </div>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* =========================================================================
          1. DESKTOP SIDEBAR (Visible on md and above)
         ========================================================================= */}
      <aside
        className={`hidden md:flex ${
          collapsed ? 'w-20' : 'w-64'
        } shrink-0 border-r border-slate-200/80 bg-white h-full flex flex-col justify-between p-3.5 transition-all duration-300 select-none shadow-xs z-30`}
      >
        {/* Top Header & Navigation Links */}
        <div className="space-y-3 overflow-y-auto overflow-x-hidden pr-0.5 custom-scrollbar min-h-0 flex-1">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1 pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-600 to-orange-700 text-white flex items-center justify-center shadow-md shadow-orange-950/20 shrink-0">
                <Home className="h-5 w-5" />
              </div>
              {!collapsed && (
                <div className="overflow-hidden leading-snug">
                  <div className="text-xs sm:text-sm font-black tracking-tight text-orange-950 truncate">
                    {t('brandTitle')}
                  </div>
                  <div className="text-[10px] font-extrabold text-orange-600 truncate">
                    {t('brandSubtitle')}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition hidden md:block cursor-pointer shrink-0"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? (
                <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              ) : (
                <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              )}
            </button>
          </div>

          {/* Navigation List */}
          {renderNavList(false)}
        </div>

        {/* Bottom User Profile & Logout */}
        <div className="pt-3 border-t border-slate-100 bg-white shrink-0">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-orange-300 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      alt="Admin Avatar"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://ui-avatars.com/api/?name=Muhammad+Admin&background=ED6C00&color=fff';
                      }}
                    />
                  </div>
                  <div className={`overflow-hidden leading-tight ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="text-[11px] font-extrabold text-slate-900 truncate">
                      {isRTL ? 'محمد ایڈمن' : 'Muhammad Admin'}
                    </div>
                    <div className="text-[9px] text-orange-700 font-bold truncate">
                      {t('superAdmin')}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title={t('logout')}
                >
                  <LogOut className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-orange-300" title="Muhammad Admin">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Admin Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                title={t('logout')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* =========================================================================
          2. MOBILE OFF-CANVAS DRAWER (Visible on mobile/tablet when open)
         ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen?.(false)}
          />

          {/* Sliding Drawer Container */}
          <div
            className={`relative flex flex-col justify-between w-72 max-w-[85vw] bg-white h-full p-4 shadow-2xl z-50 animate-in ${
              isRTL ? 'slide-in-from-right mr-auto' : 'slide-in-from-left ml-auto'
            }`}
          >
            <div className="space-y-3 overflow-y-auto overflow-x-hidden custom-scrollbar pr-0.5">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-600 to-orange-700 text-white flex items-center justify-center shadow-md shrink-0">
                    <Home className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden leading-tight">
                    <div className="text-sm font-black text-orange-950 truncate">
                      {t('brandTitle')}
                    </div>
                    <div className="text-[9px] font-bold text-orange-600 truncate">
                      {t('brandSubtitle')}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen?.(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="Close Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              {renderNavList(true)}
            </div>

            {/* Bottom Profile & Logout */}
            <div className="pt-3 border-t border-slate-100 bg-white">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-orange-300 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      alt="Admin Avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className={`overflow-hidden leading-tight ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="text-xs font-black text-slate-900 truncate">
                      {isRTL ? 'محمد ایڈمن' : 'Muhammad Admin'}
                    </div>
                    <div className="text-[10px] text-orange-700 font-bold truncate">
                      {t('superAdmin')}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title={t('logout')}
                >
                  <LogOut className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
