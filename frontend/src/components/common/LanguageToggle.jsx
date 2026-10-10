import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageToggle = ({ className = '', size = 'md' }) => {
  const { language, setLanguage, isRTL } = useLanguage();

  return (
    <div className={`inline-flex items-center rounded-xl bg-orange-50/90 p-0.5 border border-orange-200/90 shadow-2xs shrink-0 select-none ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-xs font-black'
            : 'text-orange-950/70 hover:text-orange-950 hover:bg-orange-100/50 font-bold'
        }`}
        title="Switch to English"
      >
        <span className="hidden xs:inline">English</span>
        <span className="xs:hidden">EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('ur')}
        className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
          language === 'ur'
            ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-xs font-black'
            : 'text-orange-950/70 hover:text-orange-950 hover:bg-orange-100/50 font-bold'
        }`}
        title="اردو میں تبدیل کریں"
      >
        <span className="font-bold">اردو</span>
      </button>
    </div>
  );
};
