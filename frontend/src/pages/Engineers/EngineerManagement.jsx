import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useDashboardData } from '../../context/DashboardDataContext';
import {
  HardHat,
  Users,
  Building2,
  Calendar,
  Star,
  ShieldCheck,
  Plus,
  Search,
  Check,
  X,
  Phone,
  Mail,
  UserCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  MapPin,
  ClipboardCheck,
  GraduationCap,
  Eye,
  Hash,
  ExternalLink,
  FileText,
  CheckCircle2
} from 'lucide-react';

export const EngineerManagement = () => {
  const { t, isRTL } = useLanguage();
  const { engineers, houses, addEngineer, toggleEngineerStatus, assignEngineerToHouse } = useDashboardData();

  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'TABLE'
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Sync state if URL search param changes
  useEffect(() => {
    if (urlSearch !== undefined && urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilter]);

  // Modals
  const [selectedEngineerForDetails, setSelectedEngineerForDetails] = useState(null);
  const [selectedEngineerForScorecard, setSelectedEngineerForScorecard] = useState(null);
  const [isAddEngineerModalOpen, setIsAddEngineerModalOpen] = useState(false);
  const [assignHousesModalEngineer, setAssignHousesModalEngineer] = useState(null);
  const [selectedHouseToAssign, setSelectedHouseToAssign] = useState('');

  const DIVISION_DISTRICTS = {
    'Lahore': ['Lahore', 'Kasur', 'Sheikhupura', 'Nankana Sahib'],
    'Rawalpindi': ['Rawalpindi', 'Attock', 'Jhelum', 'Chakwal', 'Murree'],
    'Faisalabad': ['Faisalabad', 'Jhang', 'Toba Tek Singh', 'Chiniot'],
    'Multan': ['Multan', 'Khanewal', 'Lodhran', 'Vehari'],
    'Gujranwala': ['Gujranwala', 'Gujrat', 'Sialkot', 'Narowal', 'Hafizabad', 'Mandi Bahauddin', 'Wazirabad'],
    'Bahawalpur': ['Bahawalpur', 'Bahawalnagar', 'Rahim Yar Khan'],
    'Sargodha': ['Sargodha', 'Bhakkar', 'Khushab', 'Mianwali'],
    'Sahiwal': ['Sahiwal', 'Okara', 'Pakpattan'],
    'D.G. Khan': ['D.G. Khan', 'Layyah', 'Muzaffargarh', 'Rajanpur', 'Kot Addu', 'Taunsa'],
  };

  const getNextSrNo = () => {
    if (engineers.length === 0) return 1;
    return Math.max(...engineers.map((e) => Number(e.srNo || e.id || 0))) + 1;
  };

  const initialEngineerForm = {
    sr_no: '',
    name: '',
    cnic: '',
    email: '',
    phone: '',
    degree_16: 'Civil Engineering',
    degree_18: '',
    division: 'Lahore',
    assigned_district: 'Lahore',
    is_active: true,
  };

  // Add Engineer Form State
  const [newEngineerForm, setNewEngineerForm] = useState(initialEngineerForm);

  const handleOpenAddEngineerModal = () => {
    setNewEngineerForm({
      ...initialEngineerForm,
      sr_no: getNextSrNo(),
    });
    setIsAddEngineerModalOpen(true);
  };

  const handleAddEngineerSubmit = (e) => {
    e.preventDefault();
    addEngineer({
      sr_no: Number(newEngineerForm.sr_no) || getNextSrNo(),
      name: newEngineerForm.name,
      cnic: newEngineerForm.cnic,
      email: newEngineerForm.email,
      phone: newEngineerForm.phone,
      degree_16: newEngineerForm.degree_16,
      degree_18: newEngineerForm.degree_18,
      division: newEngineerForm.division,
      assigned_district: newEngineerForm.assigned_district || newEngineerForm.division,
      is_active: newEngineerForm.is_active !== false,
    });
    setIsAddEngineerModalOpen(false);
    setNewEngineerForm(initialEngineerForm);
  };

  const totalEngineers = engineers.length;
  const activeEngineers = engineers.filter((e) => e.status === 'Active').length;
  const totalAssignedHouses = engineers.reduce((acc, e) => acc + (e.assignedHousesCount || 0), 0);
  const totalCompletedVisits = engineers.reduce((acc, e) => acc + (e.completedVisits || 0), 0);
  const totalWorkersTrained = engineers.reduce((acc, e) => acc + (e.workersTrained || 0), 0);

  const filteredEngineers = engineers.filter((e) => {
    // Filter tab
    if (selectedFilter === 'ACTIVE' && e.status !== 'Active') return false;
    if (selectedFilter === 'TOP_RATED' && (e.rating || 0) < 4.8) return false;
    if (selectedFilter === 'LAHORE' && !(e.assignedDivision || '').toLowerCase().includes('lahore') && !(e.assignedDistrict || '').toLowerCase().includes('lahore')) return false;
    if (selectedFilter === 'RAWALPINDI' && !(e.assignedDivision || '').toLowerCase().includes('rawalpindi') && !(e.assignedDistrict || '').toLowerCase().includes('rawalpindi')) return false;
    if (selectedFilter === 'MULTAN' && !(e.assignedDivision || '').toLowerCase().includes('multan') && !(e.assignedDistrict || '').toLowerCase().includes('multan')) return false;
    if (selectedFilter === 'FAISALABAD' && !(e.assignedDivision || '').toLowerCase().includes('faisalabad') && !(e.assignedDistrict || '').toLowerCase().includes('faisalabad')) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (e.name || '').toLowerCase().includes(q) ||
        (e.pecNo || '').toLowerCase().includes(q) ||
        (e.assignedDivision || '').toLowerCase().includes(q) ||
        (e.assignedDistrict || '').toLowerCase().includes(q) ||
        (e.contact || '').toLowerCase().includes(q) ||
        (e.email || '').toLowerCase().includes(q) ||
        (e.degree16 || '').toLowerCase().includes(q) ||
        (e.degree18 || '').toLowerCase().includes(q) ||
        (e.cnic || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Pagination Calculations (9 per page)
  const totalPages = Math.ceil(filteredEngineers.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEngineers = filteredEngineers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handleAssignHouseSubmit = (e) => {
    e.preventDefault();
    if (assignHousesModalEngineer && selectedHouseToAssign) {
      assignEngineerToHouse(selectedHouseToAssign, assignHousesModalEngineer.id);
      setAssignHousesModalEngineer(null);
      setSelectedHouseToAssign('');
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HEADER & REGISTRATION BUTTON
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Field Engineers & Inspectors
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-orange-100 text-orange-800">
              PEC Certified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor Pakistan Engineering Council (PEC) certified field officers, house allocations, inspections, and training throughput
          </p>
        </div>

        <button
          onClick={handleOpenAddEngineerModal}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-extrabold shadow-md shadow-orange-500/25 flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Engineer</span>
        </button>
      </div>

      {/* =========================================================================
          TOP KPI METRIC STRIP
         ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <HardHat className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Field Staff</span>
            <span className="text-2xl font-black text-slate-900 block font-mono">{totalEngineers} Officers</span>
            <span className="text-[10px] text-emerald-600 font-bold">{activeEngineers} Currently Active</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Assigned Houses</span>
            <span className="text-2xl font-black text-blue-950 block font-mono">{totalAssignedHouses} Sites</span>
            <span className="text-[10px] text-slate-400 font-medium">Under active supervision</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Completed Visits</span>
            <span className="text-2xl font-black text-emerald-800 block font-mono">{totalCompletedVisits} Visits</span>
            <span className="text-[10px] text-emerald-700 font-bold">100% Geo-tagged & Verified</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-700 border border-orange-100 flex items-center justify-center font-black shrink-0 shadow-xs">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Labour Trained</span>
            <span className="text-2xl font-black text-orange-950 block font-mono">{totalWorkersTrained} Workers</span>
            <span className="text-[10px] text-orange-700 font-bold">On-site technical modules</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SEARCH & FILTER TOOLBAR WITH VIEW TOGGLE
         ========================================================================= */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-4">
        {/* Left: Search Input */}
        <div className="relative w-full lg:w-72 xl:w-80 shrink-0">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, PEC, division, CNIC..."
            className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50/80 border border-slate-200/90 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 text-slate-800 font-medium placeholder:text-slate-400 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right: Filter Chips & View Mode Buttons */}
        <div className="flex items-center justify-between lg:justify-end gap-2.5 overflow-x-auto pb-1 lg:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'TOP_RATED', label: '★ 4.8+ Rated' },
              { id: 'LAHORE', label: 'Lahore' },
              { id: 'RAWALPINDI', label: 'Rawalpindi' },
              { id: 'MULTAN', label: 'Multan' },
              { id: 'FAISALABAD', label: 'Faisalabad' },
            ].map((f) => {
              const isActive = selectedFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 select-none ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-black'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="h-6 w-[1px] bg-slate-200/80 shrink-0 mx-0.5 hidden sm:block" />

          {/* Grid / Table View Mode Toggle */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 shrink-0">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-white text-orange-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white text-orange-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: ELEGANT CARD GRID VIEW (DEFAULT)
         ========================================================================= */}
      {viewMode === 'GRID' && filteredEngineers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {paginatedEngineers.map((eng) => (
            <div
              key={eng.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-orange-200 transition duration-200 flex flex-col justify-between space-y-4"
            >
              {/* Card Header: Avatar, Name, PEC & Rating */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={eng.avatar}
                        alt={eng.name}
                        className="h-12 w-12 rounded-2xl object-cover ring-2 ring-orange-200 shadow-xs"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          eng.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                        title={eng.status}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight">{eng.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="inline-block text-[10.5px] font-mono font-extrabold text-orange-700 bg-orange-50 px-2 py-0.2 rounded-md border border-orange-200/60">
                          {eng.pecNo}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          #{eng.srNo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedEngineerForDetails(eng)}
                      className="p-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/80 transition cursor-pointer"
                      title="View Complete Engineer Profile & Credentials"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200/60 text-amber-800 font-black text-xs">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{eng.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Division & Contact Information */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <MapPin className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                    <span>{eng.assignedDivision}{eng.assignedDistrict && eng.assignedDistrict !== eng.assignedDivision ? ` • ${eng.assignedDistrict}` : ''}</span>
                  </span>
                  <span className="font-mono text-slate-500">{eng.contact}</span>
                </div>
                {eng.degree16 && (
                  <div className="mt-1 flex items-center gap-1 text-[10.5px] text-slate-500">
                    <GraduationCap className="h-3 w-3 text-orange-500 shrink-0" />
                    <span className="truncate">{eng.degree16}{eng.degree18 ? ` (${eng.degree18})` : ''}</span>
                  </div>
                )}
              </div>

              {/* 3 Core Metric Blocks */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">Assigned</span>
                  <span className="font-mono font-black text-slate-900 text-sm">{eng.assignedHousesCount} Houses</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                  <span className="text-[10px] text-emerald-800 font-bold block">Inspections</span>
                  <span className="font-mono font-black text-emerald-900 text-sm">{eng.completedVisits} Done</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-purple-50/50 border border-purple-100">
                  <span className="text-[10px] text-purple-800 font-bold block">Trained</span>
                  <span className="font-mono font-black text-purple-900 text-sm">{eng.workersTrained} Workers</span>
                </div>
              </div>

              {/* Assigned House Badges */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Active Site Allocations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {eng.assignedHouses?.length > 0 ? (
                    eng.assignedHouses.map((houseId) => (
                      <span
                        key={houseId}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200"
                      >
                        {houseId}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No houses currently assigned</span>
                  )}
                </div>
              </div>

              {/* Safety Compliance Metric Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Safety Audit Score</span>
                  <span className="text-emerald-700 font-black">{eng.safetyComplianceScore}% Compliant</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${eng.safetyComplianceScore}%` }}
                  />
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedEngineerForDetails(eng)}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-orange-500/25"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => setSelectedEngineerForScorecard(eng)}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                  title="Performance Scorecard"
                >
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  <span>Scorecard</span>
                </button>

                <button
                  onClick={() => {
                    setAssignHousesModalEngineer(eng);
                    setSelectedHouseToAssign(houses[0]?.id || '');
                  }}
                  className="py-2 px-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-extrabold border border-orange-200 transition cursor-pointer"
                  title="Assign additional house"
                >
                  + House
                </button>

                <button
                  onClick={() => toggleEngineerStatus(eng.id)}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    eng.status === 'Active'
                      ? 'border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                  title={eng.status === 'Active' ? 'Deactivate Engineer' : 'Activate Engineer'}
                >
                  {eng.status === 'Active' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: CLEAN, SPACIOUS TABLE VIEW (ALTERNATIVE)
         ========================================================================= */}
      {viewMode === 'TABLE' && filteredEngineers.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-xs min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-4 whitespace-nowrap text-center">Sr #</th>
                  <th className={`py-4 px-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>Engineer Details & Photo</th>
                  <th className={`py-4 px-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>PEC & Qualifications</th>
                  <th className={`py-4 px-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>Division & Region</th>
                  <th className={`py-4 px-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>Assigned Houses</th>
                  <th className={`py-4 px-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>Completed Visits</th>
                  <th className={`py-4 px-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>Labour Trained</th>
                  <th className={`py-4 px-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>Rating & Audit</th>
                  <th className={`py-4 px-5 whitespace-nowrap ${isRTL ? 'text-left' : 'text-right'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedEngineers.map((eng) => (
                  <tr key={eng.id} className="hover:bg-slate-50/80 transition">
                    {/* Serial Number */}
                    <td className="py-4 px-4 whitespace-nowrap text-center font-mono font-bold text-slate-400">
                      #{eng.srNo}
                    </td>

                    {/* Name & Avatar with Eye Button */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedEngineerForDetails(eng)}
                          className="p-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/80 transition cursor-pointer shrink-0"
                          title="View Complete Engineer Profile & Credentials"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <img src={eng.avatar} alt={eng.name} className="h-10 w-10 rounded-2xl object-cover ring-1 ring-orange-200 shrink-0" />
                        <div>
                          <div
                            onClick={() => setSelectedEngineerForDetails(eng)}
                            className="font-black text-slate-900 text-sm hover:text-orange-600 transition cursor-pointer"
                          >
                            {eng.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{eng.contact}</div>
                        </div>
                      </div>
                    </td>

                    {/* PEC & Degree */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-mono font-extrabold text-orange-800 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/70 block w-fit">
                        {eng.pecNo}
                      </span>
                      <span className="text-[10.5px] text-slate-500 block mt-1 truncate max-w-xs">
                        {eng.degree16}
                      </span>
                    </td>

                    {/* Division */}
                    <td className="py-4 px-4 whitespace-nowrap font-bold text-slate-800">
                      {eng.assignedDivision}{eng.assignedDistrict && eng.assignedDistrict !== eng.assignedDivision ? ` • ${eng.assignedDistrict}` : ''}
                    </td>

                    {/* Assigned Houses */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-mono font-black text-slate-900">{eng.assignedHousesCount} Houses</span>
                      <div className="text-[10px] text-slate-400">{eng.assignedHouses?.join(', ') || 'None'}</div>
                    </td>

                    {/* Completed Visits */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-mono font-black text-emerald-700 text-sm">{eng.completedVisits}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Verified Visits</span>
                    </td>

                    {/* Labour Trained */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-mono font-black text-purple-900 text-sm">{eng.workersTrained}</span>
                      <span className="text-[10px] text-purple-700 block font-medium">{eng.trainingSessionsConducted} Sessions</span>
                    </td>

                    {/* Rating & Score */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mb-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{eng.rating}</span>
                        <span className="text-slate-400 text-[10px] font-normal">({eng.safetyComplianceScore}% score)</span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          eng.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {eng.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedEngineerForDetails(eng)}
                          className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1 cursor-pointer"
                          title="View Complete Engineer Profile"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={() => setSelectedEngineerForScorecard(eng)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer"
                        >
                          Scorecard
                        </button>
                        <button
                          onClick={() => {
                            setAssignHousesModalEngineer(eng);
                            setSelectedHouseToAssign(houses[0]?.id || '');
                          }}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          + House
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGINATION BAR (9 ITEMS PER PAGE) OR EMPTY STATE
         ========================================================================= */}
      {filteredEngineers.length > 0 ? (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-black text-slate-900">{startIndex + 1}</span> to{' '}
            <span className="font-black text-slate-900">{Math.min(startIndex + ITEMS_PER_PAGE, filteredEngineers.length)}</span> of{' '}
            <span className="font-black text-slate-900">{filteredEngineers.length}</span> engineers
            {selectedFilter !== 'ALL' && <span className="text-orange-600 font-bold ml-1">({selectedFilter})</span>}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safeCurrentPage === 1}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                safeCurrentPage === 1
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-xs font-bold">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-8 h-8 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
                      safeCurrentPage === page
                        ? 'bg-orange-600 text-white shadow-xs shadow-orange-500/25'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                safeCurrentPage === totalPages
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <HardHat className="h-8 w-8" />
          </div>
          <h3 className="text-base font-black text-slate-900">No Engineers Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No junior engineers matched your search criteria "{searchQuery}". Try searching with a different name, district, or CNIC.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFilter('ALL');
            }}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* =========================================================================
          MODAL 0: COMPLETE ENGINEER PROFILE & CREDENTIALS (EYE ICON DETAILS MODAL)
         ========================================================================= */}
      {selectedEngineerForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 p-5 md:p-6 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={selectedEngineerForDetails.avatar}
                    alt={selectedEngineerForDetails.name}
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover ring-4 ring-orange-100 shadow-md"
                  />
                  <span
                    className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                      selectedEngineerForDetails.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                    title={selectedEngineerForDetails.status}
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                      {selectedEngineerForDetails.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        selectedEngineerForDetails.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {selectedEngineerForDetails.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                    <span className="font-mono font-extrabold text-orange-800 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200/70">
                      {selectedEngineerForDetails.pecNo}
                    </span>
                    <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                      Sr No: #{selectedEngineerForDetails.srNo}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Database ID: {selectedEngineerForDetails.id}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedEngineerForDetails(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                title="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Grid of Details Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Academic Credentials Card */}
                <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-orange-950 uppercase tracking-wider">
                    <GraduationCap className="h-4 w-4 text-orange-600 shrink-0" />
                    <span>Academic Qualifications</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        16-Year Degree (Graduation / BS)
                      </span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {selectedEngineerForDetails.degree16 || 'Civil Engineering'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-orange-100/60">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        18-Year Degree (Postgraduate / MS / M.Sc)
                      </span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {selectedEngineerForDetails.degree18 ? (
                          selectedEngineerForDetails.degree18
                        ) : (
                          <span className="text-slate-400 italic font-normal">None / Not Specified</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Administrative Jurisdiction Card */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-blue-950 uppercase tracking-wider">
                    <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Administrative Allocation</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Assigned Division
                      </span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {selectedEngineerForDetails.assignedDivision || 'Lahore'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-blue-100/60">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Assigned District
                      </span>
                      <span className="font-bold text-slate-900 block mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        {selectedEngineerForDetails.assignedDistrict || selectedEngineerForDetails.assignedDivision || 'Lahore'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact & CNIC Identity Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4 text-slate-700 shrink-0" />
                    <span>Identity & Contact</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        National CNIC Number
                      </span>
                      <span className="font-mono font-black text-slate-900 block mt-0.5">
                        {selectedEngineerForDetails.cnic || '3520261379223'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Official Email
                        </span>
                        <a
                          href={`mailto:${selectedEngineerForDetails.email}`}
                          className="font-medium text-orange-600 hover:text-orange-700 hover:underline block truncate mt-0.5"
                          title={selectedEngineerForDetails.email}
                        >
                          {selectedEngineerForDetails.email}
                        </a>
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Contact Phone
                        </span>
                        <a
                          href={`tel:${selectedEngineerForDetails.contact}`}
                          className="font-mono font-bold text-slate-800 hover:text-orange-600 block mt-0.5"
                        >
                          {selectedEngineerForDetails.contact}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operational Performance Summary Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-950 uppercase tracking-wider">
                    <ClipboardCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span>Field Operations & Performance</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-xl border border-emerald-100 shadow-2xs text-center">
                      <span className="text-[9.5px] font-bold text-slate-400 block">Assigned Sites</span>
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {selectedEngineerForDetails.assignedHousesCount} Houses
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-emerald-100 shadow-2xs text-center">
                      <span className="text-[9.5px] font-bold text-slate-400 block">Inspections</span>
                      <span className="font-mono font-black text-emerald-700 text-sm">
                        {selectedEngineerForDetails.completedVisits} Done
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-emerald-100 shadow-2xs text-center">
                      <span className="text-[9.5px] font-bold text-slate-400 block">Labour Trained</span>
                      <span className="font-mono font-black text-purple-900 text-sm">
                        {selectedEngineerForDetails.workersTrained} Workers
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-emerald-100 shadow-2xs text-center">
                      <span className="text-[9.5px] font-bold text-slate-400 block">Safety Score</span>
                      <span className="font-mono font-black text-emerald-800 text-sm">
                        {selectedEngineerForDetails.safetyComplianceScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Houses List Strip */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider block">
                    Supervised Houses ({selectedEngineerForDetails.assignedHousesCount})
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedEngineerForDetails.assignedHouses?.length > 0 ? (
                      selectedEngineerForDetails.assignedHouses.map((hId) => (
                        <span
                          key={hId}
                          className="px-2 py-0.5 rounded-lg text-[10.5px] font-mono font-bold bg-white text-slate-800 border border-slate-200"
                        >
                          {hId}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-xs">No active housing units assigned yet</span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 shrink-0">
                  <span className="font-bold text-slate-700">Registered:</span>{' '}
                  {selectedEngineerForDetails.createdAt
                    ? new Date(selectedEngineerForDetails.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Sep 7, 2026'}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 md:p-5 border-t border-slate-100 shrink-0 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleEngineerStatus(selectedEngineerForDetails.id);
                    setSelectedEngineerForDetails((prev) => ({
                      ...prev,
                      status: prev.status === 'Active' ? 'Inactive' : 'Active',
                    }));
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    selectedEngineerForDetails.status === 'Active'
                      ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {selectedEngineerForDetails.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const eng = selectedEngineerForDetails;
                    setSelectedEngineerForDetails(null);
                    setSelectedEngineerForScorecard(eng);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  <span>Scorecard</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const eng = selectedEngineerForDetails;
                    setSelectedEngineerForDetails(null);
                    setAssignHousesModalEngineer(eng);
                    setSelectedHouseToAssign(houses[0]?.id || '');
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold transition cursor-pointer"
                >
                  + Assign House
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEngineerForDetails(null)}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-extrabold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: REGISTER NEW JUNIOR ENGINEER (ALL ATTRIBUTES)
         ========================================================================= */}
      {isAddEngineerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="relative bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 md:p-6 border-b border-slate-100 shrink-0 bg-white">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Register Field Junior Engineer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter engineer profile credentials & regional allocation (ID & Timestamp auto-assigned)
                </p>
              </div>
              <button
                onClick={() => setIsAddEngineerModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddEngineerSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
                {/* Row 1: Sr No & Full Name */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Serial No (sr_no)
                    </label>
                    <input
                      type="number"
                      value={newEngineerForm.sr_no}
                      onChange={(e) => setNewEngineerForm({ ...newEngineerForm, sr_no: e.target.value })}
                      placeholder="84"
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Full Name (name)
                    </label>
                    <input
                      type="text"
                      value={newEngineerForm.name}
                      onChange={(e) => setNewEngineerForm({ ...newEngineerForm, name: e.target.value })}
                      placeholder="e.g. Aon Muhammad"
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                    />
                  </div>
                </div>

                {/* Row 2: CNIC, Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      CNIC (cnic)
                    </label>
                    <input
                      type="text"
                      value={newEngineerForm.cnic}
                      onChange={(e) => setNewEngineerForm({ ...newEngineerForm, cnic: e.target.value })}
                      placeholder="3520261379223"
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Phone (phone)
                    </label>
                    <input
                      type="text"
                      value={newEngineerForm.phone}
                      onChange={(e) => setNewEngineerForm({ ...newEngineerForm, phone: e.target.value })}
                      placeholder="3234597659"
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Email (email)
                    </label>
                    <input
                      type="email"
                      value={newEngineerForm.email}
                      onChange={(e) => setNewEngineerForm({ ...newEngineerForm, email: e.target.value })}
                      placeholder="aon.muhammad@hotmail.com"
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                    />
                  </div>
                </div>

                {/* Row 3: Degrees (16-year & 18-year) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      16-Year Degree (degree_16)
                    </label>
                    <input
                      type="text"
                      value={newEngineerForm.degree_16}
                      onChange={(e) => setNewEngineerForm({ ...newEngineerForm, degree_16: e.target.value })}
                      placeholder="Civil Engineering"
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      18-Year Degree (degree_18)
                    </label>
                    <input
                      type="text"
                      value={newEngineerForm.degree_18}
                      onChange={(e) => setNewEngineerForm({ ...newEngineerForm, degree_18: e.target.value })}
                      placeholder="M.Sc Water Resource Engineering"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                    />
                  </div>
                </div>

                {/* Row 4: Division & Assigned District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Administrative Division (division)
                    </label>
                    <select
                      value={newEngineerForm.division}
                      onChange={(e) => {
                        const div = e.target.value;
                        const defaultDist = DIVISION_DISTRICTS[div]?.[0] || div;
                        setNewEngineerForm({
                          ...newEngineerForm,
                          division: div,
                          assigned_district: defaultDist,
                        });
                      }}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                    >
                      {Object.keys(DIVISION_DISTRICTS).map((div) => (
                        <option key={div} value={div}>
                          {div}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Assigned District (assigned_district)
                    </label>
                    <select
                      value={newEngineerForm.assigned_district}
                      onChange={(e) => setNewEngineerForm({ ...newEngineerForm, assigned_district: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                    >
                      {(DIVISION_DISTRICTS[newEngineerForm.division] || [newEngineerForm.division]).map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 5: Active Status & Auto Assignment Notice */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newEngineerForm.is_active}
                      onChange={(e) => setNewEngineerForm({ ...newEngineerForm, is_active: e.target.checked })}
                      className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                    />
                    <span>Active Status (is_active: true)</span>
                  </label>

                  <span className="text-[11px] text-slate-400 italic">
                    ID & Created At will be auto-generated.
                  </span>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-4 md:p-5 border-t border-slate-100 shrink-0 bg-slate-50/70 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEngineerModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold shadow-md shadow-orange-500/25 transition cursor-pointer"
                >
                  Register Junior Engineer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: PERFORMANCE SCORECARD (ELEGANT)
         ========================================================================= */}
      {selectedEngineerForScorecard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <img
                  src={selectedEngineerForScorecard.avatar}
                  alt="Engineer"
                  className="h-12 w-12 rounded-2xl object-cover ring-2 ring-orange-200 shadow-xs"
                />
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedEngineerForScorecard.name}</h3>
                  <div className="text-xs text-orange-700 font-mono font-bold">{selectedEngineerForScorecard.pecNo}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEngineerForScorecard(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Scorecard Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase">Inspection Compliance</span>
                  <div className="text-2xl font-black text-emerald-950 mt-0.5">{selectedEngineerForScorecard.safetyComplianceScore}%</div>
                  <span className="text-[10px] text-emerald-700 font-medium">Top Tier Field Officer</span>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100">
                  <span className="text-[10px] font-extrabold text-amber-800 uppercase">Quality Rating</span>
                  <div className="text-2xl font-black text-amber-950 mt-0.5 flex items-center gap-1">
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                    <span>{selectedEngineerForScorecard.rating} / 5.0</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-medium">Based on 40+ inspections</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Visits Completed</span>
                  <div className="text-xl font-black text-slate-900 mt-0.5 font-mono">{selectedEngineerForScorecard.completedVisits} Visits</div>
                </div>

                <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100">
                  <span className="text-[10px] font-extrabold text-purple-800 uppercase">Workers Trained</span>
                  <div className="text-xl font-black text-purple-900 mt-0.5 font-mono">{selectedEngineerForScorecard.workersTrained} Trained</div>
                </div>
              </div>

              {/* Active House Allocations List */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <span className="font-extrabold text-slate-900 block">
                  Assigned Housing Units ({selectedEngineerForScorecard.assignedHousesCount}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEngineerForScorecard.assignedHouses?.map((hId) => (
                    <span key={hId} className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs">
                      {hId}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-4 md:p-5 border-t border-slate-100 shrink-0 bg-slate-50/70 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEngineerForScorecard(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 transition cursor-pointer"
              >
                Close Scorecard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ASSIGN HOUSES TO ENGINEER
         ========================================================================= */}
      {assignHousesModalEngineer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="relative bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 shrink-0 bg-white">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Assign House to {assignHousesModalEngineer.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">{assignHousesModalEngineer.pecNo}</p>
              </div>
              <button
                onClick={() => setAssignHousesModalEngineer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAssignHouseSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Select House from Directory
                  </label>
                  <select
                    value={selectedHouseToAssign}
                    onChange={(e) => setSelectedHouseToAssign(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800"
                  >
                    {houses.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.id} — {h.ownerName} ({h.district} • Current: {h.engineerName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-4 md:p-5 border-t border-slate-100 shrink-0 bg-slate-50/70 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignHousesModalEngineer(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
                >
                  Assign to Engineer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
