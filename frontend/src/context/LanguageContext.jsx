import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const translations = {
  en: {
    // Brand & Header
    brandTitle: 'ACAG ADMIN',
    brandSubtitle: 'APNI CHHAT APNA GHAR',
    subHeader: 'Government of Punjab Housing Program & Quality Monitoring Portal',
    dashboardOverview: 'Executive Dashboard Overview',
    dashboardDesc: 'Real-time monitoring and control for ACAG housing, loans, engineers, labour training & safety across Punjab',
    searchPlaceholder: 'Search house ID, owner, CNIC, district, engineer...',
    reportBtn: 'Export DPR',
    newProjectBtn: 'Schedule Visit',
    viewAll: 'View All',
    fullMap: 'Full GIS Map',
    layers: 'Layers',
    switchRole: 'Role:',
    logout: 'Sign Out',
    copyright: 'Government of Punjab — Housing, Urban Development & Public Health Engineering Department. All Rights Reserved',
    systemTitle: 'Government of Punjab - ACAG Construction Monitoring System',

    // Sidebar Navigation (Exact Specification)
    navDashboard: 'Dashboard',
    navHouses: 'Houses',
    navEngineerVisits: 'Engineer Visits',
    navEngineers: 'Engineers',
    navLabourManagement: 'Labour Management',
    navSafetyManagement: 'Safety Management',
    navEnvironmentalMonitoring: 'Environmental Monitoring',
    navAiHazards: 'AI Hazard Detection',
    navLoanManagement: 'Loan Management',
    navGisMap: 'GIS Map',
    navReportsAnalytics: 'Reports & Analytics',
    navUsers: 'Users',
    navNotifications: 'Notifications',
    navSettings: 'Settings',

    // Top Stats & KPIs
    totalHouses: 'Total Houses',
    pendingApplications: 'Pending Applications',
    underConstruction: 'Under Construction',
    completedHouses: 'Completed Houses',
    pendingInspections: 'Pending Inspections',
    totalEngineers: 'Total Engineers',
    totalWorkers: 'Total Workers',
    openSafetyIssues: 'Open Safety Issues',

    // Stages
    stageFoundation: 'Foundation',
    stageStructure: 'Structure',
    stageRoof: 'Roof',
    stageElectrical: 'Electrical',
    stagePlumbing: 'Plumbing',
    stageFinishing: 'Finishing',
    stageCompleted: 'Completed',

    // Statuses
    statusPending: 'Pending',
    statusApproved: 'Approved',
    statusUnderConstruction: 'Under Construction',
    statusCompleted: 'Completed',
    statusReVisit: 'Re-Visit Required',
    statusRejected: 'Rejected',
    statusScheduled: 'Scheduled',
    statusActive: 'Active',
    statusInactive: 'Inactive',
    statusOpen: 'Open',
    statusInProgress: 'In Progress',
    statusResolved: 'Resolved',

    // Financial & Loans
    housingLoanScheme: 'Housing Loan Scheme',
    bankOfPunjab: 'Bank of Punjab (BOP)',
    totalPerHouse: 'Total Per House',
    pkrOnePointFiveMillion: 'PKR 1.5 Million',
    firstTranche: '1st Tranche (50%)',
    secondTranche: '2nd Tranche (50%)',
    foundationAndStructure: 'Foundation & Structure',
    roofSlabAndFinishing: 'Roof Slab & Finishing',
    onApproval: 'On Approval',
    onInspection: 'On Inspection',
    totalApproved: 'Total Approved',
    totalDisbursed: 'Total Disbursed',
    remainingTranches: 'Remaining Tranches',
    disburseTrancheBtn: 'Disburse Tranche',
    exportBopStatement: 'Export BOP Statement (PDF)',

    // Labour & Training
    siteArtisanRegistry: 'Site Artisan Registry',
    totalArtisans: 'Total Artisans',
    safetyCertified: 'Safety Certified',
    trainingDue: 'Training Due',
    sessionsLogged: 'Sessions Logged',
    recordFieldTraining: 'Record Field Training',
    exportLabourRoster: 'Export Labour Roster (PDF)',
    registeredArtisans: 'Registered Artisans',
    curriculumCatalog: 'Safety Curriculum Catalog',
    skillMatrix: 'Skill Qualification Matrix',

    // Safety & AI Hazards
    safetyIncidents: 'Safety Incidents',
    environmentalAdvisories: 'Environmental Advisories',
    criticalDetections: 'Critical Detections',
    photosAudited: 'Photos Audited',
    yoloEngineActive: 'YOLOv8 Engine Active',
    aiConfidence: 'AI Confidence',
    detectedAnomaly: 'Detected Anomaly',

    // General Action Labels
    actions: 'Actions',
    status: 'Status',
    stage: 'Stage',
    owner: 'Owner',
    location: 'Location',
    engineer: 'Field Engineer',
    progress: 'Progress',
    loanStatus: 'Loan Status',
    safety: 'Safety',
    date: 'Date',
    details: 'Details',
    approve: 'Approve',
    reject: 'Reject',
    schedule: 'Schedule',
    disburse: 'Disburse Tranche',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    superAdmin: 'Super Administrator',
    filter: 'Filter',
    search: 'Search',
    all: 'All',
    close: 'Close',
    viewDetails: 'View Details',
    exportPdf: 'Export PDF',
    download: 'Download',
    submit: 'Submit',
    username: 'Username',
    password: 'Password',
    signIn: 'Sign In to Portal',
    loginError: 'Please enter valid credentials',
  },

  ur: {
    // Brand & Header
    brandTitle: 'اے سی اے جی ایڈمن',
    brandSubtitle: 'اپنی چھت اپنا گھر',
    subHeader: 'حکومت پنجاب ہاؤسنگ پروگرام و کوالٹی مانیٹرنگ پورٹل',
    dashboardOverview: 'ڈیش بورڈ جائزہ',
    dashboardDesc: 'پنجاب بھر میں اے سی اے جی مکانات، قرضہ جات، انجینئرز، لیبر ٹریننگ اور سیفٹی کا مکمل مانیٹرنگ سسٹم',
    searchPlaceholder: 'مکان نمبر، شناختی کارڈ، ضلع یا انجینئر تلاش کریں...',
    reportBtn: 'ڈی پی آر رپورٹ',
    newProjectBtn: 'معائنہ شیڈول کریں',
    viewAll: 'تمام دیکھیں',
    fullMap: 'مکمل جی آئی ایس نقشہ',
    layers: 'تہیں (Layers)',
    switchRole: 'کردار:',
    logout: 'لاگ آؤٹ',
    copyright: 'حکومت پنجاب — محکمہ ہاؤسنگ، اربن ڈویلپمنٹ و پبلک ہیلتھ انجینئرنگ۔ جملہ حقوق محفوظ ہیں',
    systemTitle: 'حکومت پنجاب - اپنی چھت اپنا گھر تعمیراتی مانیٹرنگ سسٹم',

    // Sidebar Navigation (Pure Urdu without English brackets)
    navDashboard: 'ڈیش بورڈ',
    navHouses: 'مکانات کا انتظام',
    navEngineerVisits: 'معائناتی دورے',
    navEngineers: 'فیلڈ انجینئرز',
    navLabourManagement: 'لیبر و ہنر مند افراد',
    navSafetyManagement: 'سیفٹی و تحفظ کنٹرول',
    navEnvironmentalMonitoring: 'ماحولیاتی مانیٹرنگ',
    navAiHazards: 'اے آئی خطرات کا سراغ',
    navLoanManagement: 'قرضہ جات کا انتظام',
    navGisMap: 'جی آئی ایس نقشہ',
    navReportsAnalytics: 'رپورٹس و اینالیٹکس',
    navUsers: 'صارفین و رسائی',
    navNotifications: 'اطلاعات و الرٹس',
    navSettings: 'سسٹم ترتیبات',

    // Top Stats & KPIs
    totalHouses: 'کل مکانات',
    pendingApplications: 'زیر التواء درخواستیں',
    underConstruction: 'زیر تعمیر مکانات',
    completedHouses: 'مکمل شدہ مکانات',
    pendingInspections: 'زیر التواء معائنہ جات',
    totalEngineers: 'کل انجینئرز',
    totalWorkers: 'کل کاریگر و مزدور',
    openSafetyIssues: 'سیفٹی مسائل',

    // Stages
    stageFoundation: 'بنیاد',
    stageStructure: 'ڈھانچہ',
    stageRoof: 'چھت',
    stageElectrical: 'برقی وائرنگ',
    stagePlumbing: 'پلمبنگ و سینیٹری',
    stageFinishing: 'فنشنگ و روغن',
    stageCompleted: 'مکمل شدہ',

    // Statuses
    statusPending: 'زیر التواء',
    statusApproved: 'منظور شدہ',
    statusUnderConstruction: 'زیر تعمیر',
    statusCompleted: 'مکمل شدہ',
    statusReVisit: 'دوبارہ معائنہ مطلوب',
    statusRejected: 'مسترد شدہ',
    statusScheduled: 'شیڈول شدہ',
    statusActive: 'فعال',
    statusInactive: 'غیر فعال',
    statusOpen: 'کھلا ہے',
    statusInProgress: 'زیر کارروائی',
    statusResolved: 'حل شدہ',

    // Financial & Loans
    housingLoanScheme: 'ہاؤسنگ لون اسکیم',
    bankOfPunjab: 'بینک آف پنجاب',
    totalPerHouse: 'کل رقم فی مکان',
    pkrOnePointFiveMillion: '15 لاکھ روپے',
    firstTranche: 'پہلی قسط (50%)',
    secondTranche: 'دوسری قسط (50%)',
    foundationAndStructure: 'بنیاد اور ڈھانچے کی تکمیل پر',
    roofSlabAndFinishing: 'چھت اور فنشنگ کے معائنے پر',
    onApproval: 'منظوری پر',
    onInspection: 'معائنہ پر',
    totalApproved: 'کل منظور شدہ فنڈز',
    totalDisbursed: 'کل جاری شدہ اقساط',
    remainingTranches: 'باقی ماندہ اقساط',
    disburseTrancheBtn: 'قسط جاری کریں',
    exportBopStatement: 'بینک اسٹیٹمنٹ ڈاؤن لوڈ کریں',

    // Labour & Training
    siteArtisanRegistry: 'سائٹ ورکرز و کاریگر رجسٹری',
    totalArtisans: 'کل کاریگر و ورکرز',
    safetyCertified: 'سیفٹی سرٹیفائیڈ ورکرز',
    trainingDue: 'زیر التواء ٹریننگ',
    sessionsLogged: 'مکمل شدہ ٹریننگ سیشنز',
    recordFieldTraining: 'فیلڈ ٹریننگ لاگ کریں',
    exportLabourRoster: 'لیبر روسٹر برآمد کریں',
    registeredArtisans: 'رجسٹرڈ کاریگر',
    curriculumCatalog: 'سیفٹی تربیتی نصاب',
    skillMatrix: 'مہارت و اہلیت میٹرکس',

    // Safety & AI Hazards
    safetyIncidents: 'سیفٹی واقعات و خلاف ورزیاں',
    environmentalAdvisories: 'ماحولیاتی و موسمی انتباہات',
    criticalDetections: 'شدید خطرات کی نشاندہی',
    photosAudited: 'تصاویر کا اے آئی آڈٹ',
    yoloEngineActive: 'اے آئی وژن ماڈل فعال',
    aiConfidence: 'اے آئی اعتماد کی شرح',
    detectedAnomaly: 'نشاندہی شدہ خامی / خطرہ',

    // General Action Labels
    actions: 'اقدامات',
    status: 'حیثیت',
    stage: 'مرحلہ',
    owner: 'مالک مکان',
    location: 'مقام و ضلع',
    engineer: 'نگران فیلڈ انجینئر',
    progress: 'پیش رفت',
    loanStatus: 'قرض کی کیفیت',
    safety: 'حفاظتی کیفیت',
    date: 'تاریخ',
    details: 'تفصیلات',
    approve: 'منظور کریں',
    reject: 'مسترد کریں',
    schedule: 'شیڈول کریں',
    disburse: 'قسط جاری کریں',
    saveChanges: 'تبدیلیاں محفوظ کریں',
    cancel: 'منسوخ کریں',
    superAdmin: 'سپر ایڈمنسٹریٹر',
    filter: 'فلٹر',
    search: 'تلاش کریں',
    all: 'تمام',
    close: 'بند کریں',
    viewDetails: 'تفصیلات دیکھیں',
    exportPdf: 'پی ڈی ایف برآمد کریں',
    download: 'ڈاؤن لوڈ',
    submit: 'ارسال کریں',
    username: 'صارف کا نام',
    password: 'پاس ورڈ',
    signIn: 'پورٹل میں لاگ ان کریں',
    loginError: 'براہ کرم درست یوزر نیم اور پاس ورڈ درج کریں',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const isRTL = language === 'ur';

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, changeLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
