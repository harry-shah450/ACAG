import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useLanguage } from '../../context/LanguageContext';

export const Layout = () => {
  const { t, isRTL } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const mainScrollerRef = useRef(null);

  // Smoothly reset main content scroll position to top whenever switching routes/tabs
  useEffect(() => {
    if (mainScrollerRef.current) {
      mainScrollerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="h-screen bg-slate-100/60 flex flex-col w-full max-w-[100vw] overflow-hidden">
      {/* Top Fixed Navbar */}
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* Middle App Shell: Fixed Sidebar + Scrollable Main Content */}
      <div className="flex flex-1 items-stretch w-full min-w-0 overflow-hidden relative">
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        
        <div
          ref={mainScrollerRef}
          id="main-content-scroller"
          className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden custom-scrollbar"
        >
          <main className="flex-1 p-3 sm:p-5 lg:p-7 max-w-7xl mx-auto w-full min-w-0">
            <Outlet />
          </main>

          {/* Dark Footer Banner */}
          <footer className="bg-slate-950 text-slate-300 py-3.5 px-4 sm:px-6 text-xs border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner w-full shrink-0">
            <div className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
              <span className="text-amber-400 font-bold">{t('copyright')}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono shrink-0">
              ACAG CMIS v1.0 &bull; Govt of Punjab
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

