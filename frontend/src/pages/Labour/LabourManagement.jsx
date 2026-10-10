import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useDashboardData } from '../../context/DashboardDataContext';
import { generateDomainPdf } from '../../utils/pdfGenerator';
import {
  Users,
  HardHat,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Check,
  X,
  FileCheck,
  Hammer,
  Sparkles,
  Camera,
  LayoutGrid,
  List,
  MapPin,
  Phone,
  GraduationCap,
  Download
} from 'lucide-react';

export const LabourManagement = () => {
  const { t, isRTL } = useLanguage();
  const {
    workers,
    trainingTopics,
    houses,
    engineers,
    recordTrainingSession,
    addTrainingTopic,
  } = useDashboardData();

  const [activeTab, setActiveTab] = useState('WORKERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'TABLE'

  // Modals
  const [isRecordSessionModalOpen, setIsRecordSessionModalOpen] = useState(false);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [selectedWorkerHistory, setSelectedWorkerHistory] = useState(null);

  // Training Session Form State
  const [sessionForm, setSessionForm] = useState({
    houseId: houses[0]?.id || '',
    engineerId: engineers[0]?.id || '',
    topic: trainingTopics[0]?.name || 'PPE Safety',
    date: new Date().toISOString().split('T')[0],
    duration: 45,
    selectedWorkers: [workers[0]?.name || 'Muhammad Khan'],
    evidenceUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
    remarks: 'Workers instructed on mandatory hard hat and harness attachment.',
  });

  // Add Topic Form State
  const [topicForm, setTopicForm] = useState({
    name: '',
    duration: '30 mins',
    required: true,
    description: '',
  });

  const totalWorkers = workers.length;
  const trainedWorkers = workers.filter((w) => w.trainingStatus === 'Trained').length;
  const pendingTrainingWorkers = totalWorkers - trainedWorkers;
  const totalTrainingSessions = engineers.reduce((acc, e) => acc + (e.trainingSessionsConducted || 0), 0);

  const skillsList = ['Mason', 'Electrician', 'Plumber', 'Carpenter', 'Welder', 'Painter'];

  const filteredWorkers = workers.filter((w) => {
    if (skillFilter !== 'ALL' && w.skill !== skillFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        w.id.toLowerCase().includes(q) ||
        w.name.toLowerCase().includes(q) ||
        w.skill.toLowerCase().includes(q) ||
        w.assignedHouseId.toLowerCase().includes(q) ||
        w.assignedHouseOwner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRecordSessionSubmit = (e) => {
    e.preventDefault();
    const targetEng = engineers.find((eng) => eng.id === Number(sessionForm.engineerId)) || engineers[0];

    recordTrainingSession({
      houseId: sessionForm.houseId,
      engineerId: targetEng.id,
      engineerName: targetEng.name,
      topic: sessionForm.topic,
      date: sessionForm.date,
      duration: sessionForm.duration,
      workersPresent: sessionForm.selectedWorkers,
      evidenceUrl: sessionForm.evidenceUrl,
      remarks: sessionForm.remarks,
    });

    setIsRecordSessionModalOpen(false);
  };

  const handleAddTopicSubmit = (e) => {
    e.preventDefault();
    addTrainingTopic({
      name: topicForm.name,
      duration: topicForm.duration,
      required: topicForm.required,
      description: topicForm.description,
    });
    setIsAddTopicModalOpen(false);
    setTopicForm({ name: '', duration: '30 mins', required: true, description: '' });
  };

  const getSkillColor = (skill) => {
    switch (skill) {
      case 'Mason': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Electrician': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Plumber': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Carpenter': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Welder': return 'bg-purple-50 text-purple-800 border-purple-200';
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {isRTL ? 'لیبر اور ورکرز سیفٹی ٹریننگ' : 'Labour & Workforce Safety Training'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-orange-100 text-orange-800">
              {isRTL ? 'سائٹ کاریگر رجسٹری' : 'Site Artisan Registry'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRTL
              ? 'کاریگروں کے کوائف، حفاظتی اشیاء کی تصدیق اور انجینئرز کے دوروں کے دوران ٹریننگ کا ریکارڈ'
              : 'Track site artisans, mandatory PPE skill certifications, and field training conducted during engineer visits'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              generateDomainPdf({
                domain: 'LABOUR',
                workers: filteredWorkers,
                districtFilter: skillFilter === 'ALL' ? 'All Skills' : `${skillFilter} Artisans`,
                dateRange: 'All Enrolled'
              });
            }}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4 text-orange-600" />
            <span>{isRTL ? 'لیبر روسٹر پی ڈی ایف' : 'Export Labour Roster (PDF)'}</span>
          </button>

          <button
            onClick={() => setIsRecordSessionModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-extrabold shadow-md shadow-orange-500/25 flex items-center gap-2 transition cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            <span>{isRTL ? 'ٹریننگ ریکارڈ درج کریں' : 'Record Field Training'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 min-w-0">
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <Users className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
              {isRTL ? 'کل کاریگر و مزدور' : 'Total Artisans'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block truncate">
              <span className="font-mono ltr-isolate">{totalWorkers}</span> {isRTL ? 'افراد' : 'Workers'}
            </span>
            <span className="text-[10px] text-blue-700 font-bold block truncate">
              {isRTL ? '6 شعبوں کے ماہرین' : '6 Skill Trades Active'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
              {isRTL ? 'سیفٹی تصدیق شدہ' : 'Safety Certified'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-800 block truncate">
              <span className="font-mono ltr-isolate">{trainedWorkers}</span> {isRTL ? 'تربیت یافتہ' : 'Trained'}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold block truncate">
              {isRTL ? '100% حفاظتی کٹ اہل' : '100% PPE Qualified'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <Clock className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
              {isRTL ? 'ٹریننگ مطلوب' : 'Training Due'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-700 block truncate">
              <span className="font-mono ltr-isolate">{pendingTrainingWorkers}</span> {isRTL ? 'زیر التواء' : 'Pending'}
            </span>
            <span className="text-[10px] text-amber-700 font-bold block truncate">
              {isRTL ? 'اگلے دورے پر شیڈول' : 'Scheduled Next Visit'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
              {isRTL ? 'مکمل سیشنز' : 'Sessions Logged'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-purple-900 block truncate">
              <span className="font-mono ltr-isolate">{totalTrainingSessions}</span> {isRTL ? 'سیشنز' : 'Sessions'}
            </span>
            <span className="text-[10px] text-purple-700 font-bold block truncate">
              {isRTL ? 'انجینئر سے تصدیق شدہ' : 'Engineer Verified'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        {[
          { id: 'WORKERS', label: isRTL ? 'اندراج شدہ کاریگر' : 'Registered Artisans', icon: Users },
          { id: 'TOPICS', label: isRTL ? 'سیفٹی نصاب کی فہرست' : 'Safety Curriculum Catalog', icon: BookOpen },
          { id: 'HISTORY', label: isRTL ? 'مہارت و ٹریننگ ریکارڈ' : 'Skill Qualification Matrix', icon: FileCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: WORKERS DIRECTORY
         ========================================================================= */}
      {activeTab === 'WORKERS' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-4">
            {/* Left: Search Input */}
            <div className="relative w-full lg:w-72 xl:w-80 shrink-0">
              <Search className={`h-4 w-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3 pointer-events-none`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'کاریگر کا نام، مہارت یا مکان سے تلاش کریں...' : 'Search worker by name, skill, house...'}
                className={`w-full ${isRTL ? 'pr-10 pl-9' : 'pl-10 pr-9'} py-2 text-xs bg-slate-50/80 border border-slate-200/90 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 text-slate-800 font-medium placeholder:text-slate-400 transition`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition cursor-pointer`}
                  title={isRTL ? 'تلاش ختم کریں' : 'Clear search'}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Right: Filter Chips & View Mode Buttons */}
            <div className="flex items-center justify-between lg:justify-end gap-2.5 overflow-x-auto pb-1 lg:pb-0">
              <div className="flex items-center gap-1.5 shrink-0">
                {['ALL', ...skillsList].map((s) => {
                  const isActive = skillFilter === s;
                  const skillUrduMap = {
                    ALL: 'تمام شعبے',
                    Mason: 'راج مزدور / چنائی',
                    Electrician: 'الیکٹریشن',
                    Plumber: 'پلمبر',
                    Carpenter: 'کارپینٹر / بڑھئی',
                    Welder: 'ویلڈر',
                    Painter: 'پینٹر / رنگ ساز',
                  };
                  return (
                    <button
                      key={s}
                      onClick={() => setSkillFilter(s)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 select-none ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs font-black'
                          : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                      }`}
                    >
                      {isRTL ? skillUrduMap[s] || s : (s === 'ALL' ? 'All Trades' : s)}
                    </button>
                  );
                })}
              </div>

              <div className="h-6 w-[1px] bg-slate-200/80 shrink-0 mx-0.5 hidden sm:block" />

              {/* Grid / Table Toggle */}
              <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 shrink-0">
                <button
                  onClick={() => setViewMode('GRID')}
                  className={`p-1.5 rounded-xl transition cursor-pointer ${
                    viewMode === 'GRID' ? 'bg-white text-orange-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title={isRTL ? 'کارڈز ویو' : 'Card Grid View'}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('TABLE')}
                  className={`p-1.5 rounded-xl transition cursor-pointer ${
                    viewMode === 'TABLE' ? 'bg-white text-orange-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title={isRTL ? 'ٹیبل ویو' : 'Table View'}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* VIEW 1: ARTISAN CARDS */}
          {viewMode === 'GRID' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredWorkers.map((w) => {
                const skillUrdu = {
                  Mason: 'راج مزدور',
                  Electrician: 'الیکٹریشن',
                  Plumber: 'پلمبر',
                  Carpenter: 'کارپینٹر',
                  Welder: 'ویلڈر',
                  Painter: 'پینٹر',
                }[w.skill] || w.skill;

                return (
                  <div
                    key={w.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-orange-200 transition duration-200 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                            {w.name[0]}
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 leading-tight">{w.name}</h3>
                            <span className="text-[11px] text-slate-400 font-mono ltr-isolate">{w.id}</span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border uppercase tracking-wider shrink-0 ${getSkillColor(w.skill)}`}>
                          {isRTL ? skillUrdu : w.skill}
                        </span>
                      </div>

                      {/* House Assignment & Phone */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                          <span className="font-bold text-slate-800 truncate">
                            <span className="font-mono ltr-isolate">{w.assignedHouseId}</span> ({w.assignedHouseOwner})
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span className="font-mono ltr-isolate">{w.phone}</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold ${
                              w.trainingStatus === 'Trained'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {w.trainingStatus === 'Trained' ? <Check className="h-3 w-3 text-emerald-600" /> : <Clock className="h-3 w-3 text-amber-600" />}
                            <span>{isRTL ? (w.trainingStatus === 'Trained' ? 'تربیت یافتہ' : 'غیر تربیت یافتہ') : w.trainingStatus}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedWorkerHistory(w)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{isRTL ? 'ٹریننگ ٹرانسکرپٹ دیکھیں' : 'View Training Transcript'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: COMPACT TABLE */}
          {viewMode === 'TABLE' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto w-full min-w-0">
                <table className="w-full text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase tracking-wider">
                      <th className={`py-4 px-5 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'کاریگر کی شناخت و نام' : 'Artisan ID & Name'}
                      </th>
                      <th className={`py-4 px-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'شعبہ و مہارت' : 'Skill Trade'}
                      </th>
                      <th className={`py-4 px-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'متعلقہ سائٹ' : 'Assigned Site'}
                      </th>
                      <th className={`py-4 px-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'ٹریننگ کی صورتحال' : 'Training Status'}
                      </th>
                      <th className={`py-4 px-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'سیفٹی اسکور' : 'Safety Score'}
                      </th>
                      <th className={`py-4 px-5 whitespace-nowrap ${isRTL ? 'text-left' : 'text-right'}`}>
                        {isRTL ? 'کارروائی' : 'Action'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWorkers.map((w) => {
                      const skillUrdu = {
                        Mason: 'راج مزدور',
                        Electrician: 'الیکٹریشن',
                        Plumber: 'پلمبر',
                        Carpenter: 'کارپینٹر',
                        Welder: 'ویلڈر',
                        Painter: 'پینٹر',
                      }[w.skill] || w.skill;

                      return (
                        <tr key={w.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-5 whitespace-nowrap">
                            <div className="font-black text-slate-900 text-sm">{w.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono ltr-isolate">{w.id} • {w.phone}</div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-xl text-[10px] font-black border ${getSkillColor(w.skill)}`}>
                              {isRTL ? skillUrdu : w.skill}
                            </span>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="font-bold text-orange-700 font-mono ltr-isolate">{w.assignedHouseId}</div>
                            <div className="text-[11px] text-slate-500">{w.assignedHouseOwner}</div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                w.trainingStatus === 'Trained'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {isRTL ? (w.trainingStatus === 'Trained' ? 'تربیت یافتہ' : 'غیر تربیت یافتہ') : w.trainingStatus}
                            </span>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap font-bold text-emerald-700">
                            {w.safetyStatus === 'Safe' ? (isRTL ? '100% محفوظ' : '100% Compliant') : (isRTL ? 'انتباہ' : 'Warning')}
                          </td>

                          <td className={`py-4 px-5 whitespace-nowrap ${isRTL ? 'text-left' : 'text-right'}`}>
                            <button
                              onClick={() => setSelectedWorkerHistory(w)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer"
                            >
                              {isRTL ? 'ٹرانسکرپٹ' : 'Transcript'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: TRAINING TOPICS CATALOG
         ========================================================================= */}
      {activeTab === 'TOPICS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">
                {isRTL ? 'سیفٹی نصاب کے معیاری ماڈیولز' : 'Standard Safety Curriculum Modules'}
              </h2>
              <p className="text-xs text-slate-500">
                {isRTL ? 'محکمہ لیبر و ایچ ایس ای ڈائریکٹوریٹ سے منظور شدہ' : 'Certified by Government HSE Directorate'}
              </p>
            </div>
            <button
              onClick={() => setIsAddTopicModalOpen(true)}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isRTL ? 'نیا ماڈیول شامل کریں' : 'Add Curriculum Topic'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trainingTopics.map((topic) => (
              <div key={topic.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-black text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200 ltr-isolate">
                      {topic.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black ${
                        topic.required ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {topic.required ? (isRTL ? 'لازمی ماڈیول' : 'Mandatory') : (isRTL ? 'اختیاری' : 'Optional')}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 mt-1">{topic.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{topic.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">
                    {isRTL ? 'دورانیہ: ' : 'Duration: '}
                    <strong className="text-slate-800 ltr-isolate">{topic.duration}</strong>
                  </span>
                  <span className="text-purple-700 font-extrabold">
                    <span className="ltr-isolate">{topic.trainedCount}</span> {isRTL ? 'تربیت یافتہ' : 'Trained'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: QUALIFICATION MATRIX
         ========================================================================= */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div>
              <h2 className="text-sm font-black text-slate-900">
                {isRTL ? 'کاریگروں کا سیفٹی کوالیفیکیشن میٹرکس' : 'Worker Safety Qualification Matrix'}
              </h2>
              <p className="text-xs text-slate-500">
                {isRTL ? 'ہر کاریگر کا لازمی سیفٹی ماڈیولز کی تکمیل کا مکمل ٹرانسکرپٹ' : 'Live qualification transcript of each artisan across mandatory safety modules'}
              </p>
            </div>

            <div className="space-y-3">
              {workers.map((worker) => (
                <div key={worker.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                        {worker.name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          {worker.name} (<span className="font-mono ltr-isolate">{worker.id}</span>)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {worker.skill} • {isRTL ? 'متعلقہ مکان:' : 'Assigned to'} <span className="font-mono ltr-isolate">{worker.assignedHouseId}</span> ({worker.assignedHouseOwner})
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-xl text-[10px] font-black shrink-0 ${
                        worker.trainingStatus === 'Trained'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isRTL ? (worker.trainingStatus === 'Trained' ? 'تربیت یافتہ' : 'غیر تربیت یافتہ') : worker.trainingStatus} (<span className="ltr-isolate">{worker.completedTopics.length} / {worker.completedTopics.length + worker.pendingTopics.length}</span> {isRTL ? 'ماڈیولز' : 'Modules'})
                    </span>
                  </div>

                  {/* Modules Progress Badges */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {worker.completedTopics.map((topic, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>{topic} — {isRTL ? 'تصدیق شدہ' : 'Certified'}</span>
                      </span>
                    ))}
                    {worker.pendingTopics.map((topic, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                        <span>{topic} — {isRTL ? 'زیر التواء' : 'Pending'}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: RECORD ON-SITE TRAINING */}
      {isRecordSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Record On-Site Labour Training
                </h3>
                <p className="text-xs text-slate-500">Log session verified by visiting engineer</p>
              </div>
              <button
                onClick={() => setIsRecordSessionModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSessionSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    House Site
                  </label>
                  <select
                    value={sessionForm.houseId}
                    onChange={(e) => setSessionForm({ ...sessionForm, houseId: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                  >
                    {houses.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.id} ({h.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Conducting Officer
                  </label>
                  <select
                    value={sessionForm.engineerId}
                    onChange={(e) => setSessionForm({ ...sessionForm, engineerId: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                  >
                    {engineers.map((eng) => (
                      <option key={eng.id} value={eng.id}>
                        {eng.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Training Topic
                  </label>
                  <select
                    value={sessionForm.topic}
                    onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                  >
                    {trainingTopics.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={sessionForm.duration}
                    onChange={(e) => setSessionForm({ ...sessionForm, duration: Number(e.target.value) })}
                    min={15}
                    max={180}
                    required
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Attendees (Select all present artisans)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {workers.map((w) => {
                    const isChecked = sessionForm.selectedWorkers.includes(w.name);
                    return (
                      <label key={w.id} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSessionForm({ ...sessionForm, selectedWorkers: [...sessionForm.selectedWorkers, w.name] });
                            } else {
                              setSessionForm({
                                ...sessionForm,
                                selectedWorkers: sessionForm.selectedWorkers.filter((n) => n !== w.name),
                              });
                            }
                          }}
                          className="rounded text-orange-600 focus:ring-orange-500"
                        />
                        <span className="font-bold text-slate-800">{w.name} ({w.skill})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Engineer Remarks
                </label>
                <textarea
                  value={sessionForm.remarks}
                  onChange={(e) => setSessionForm({ ...sessionForm, remarks: e.target.value })}
                  placeholder="e.g. Demonstration completed; workers equipped with harnesses."
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordSessionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
                >
                  Save Training Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD TRAINING TOPIC */}
      {isAddTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                Add Safety Curriculum Topic
              </h3>
              <button
                onClick={() => setIsAddTopicModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddTopicSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  placeholder="e.g. Scaffolding & Fall Prevention"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={topicForm.duration}
                    onChange={(e) => setTopicForm({ ...topicForm, duration: e.target.value })}
                    placeholder="30 mins"
                    required
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Requirement Type
                  </label>
                  <select
                    value={topicForm.required ? 'MANDATORY' : 'OPTIONAL'}
                    onChange={(e) => setTopicForm({ ...topicForm, required: e.target.value === 'MANDATORY' })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                  >
                    <option value="MANDATORY">Mandatory</option>
                    <option value="OPTIONAL">Optional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Topic Description
                </label>
                <textarea
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  placeholder="Summary of learning outcomes..."
                  rows={2}
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTopicModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: WORKER TRANSCRIPT */}
      {selectedWorkerHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {selectedWorkerHistory.name} — Safety Transcript
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedWorkerHistory.skill} • {selectedWorkerHistory.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedWorkerHistory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Completed Modules ({selectedWorkerHistory.completedTopics.length}):</span>
              <div className="space-y-1.5">
                {selectedWorkerHistory.completedTopics.map((topic, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-950">{topic}</span>
                    <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Certified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedWorkerHistory.pendingTopics.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Pending Required Modules ({selectedWorkerHistory.pendingTopics.length}):</span>
                <div className="space-y-1.5">
                  {selectedWorkerHistory.pendingTopics.map((topic, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-950">{topic}</span>
                      <span className="font-extrabold text-amber-700">Scheduled on next visit</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedWorkerHistory(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
