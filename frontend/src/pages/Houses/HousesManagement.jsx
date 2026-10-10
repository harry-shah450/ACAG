import React, { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useDashboardData } from '../../context/DashboardDataContext';
import { housesApi } from '../../api/endpoints';
import { generateDomainPdf } from '../../utils/pdfGenerator';
import {
  Building2,
  Home,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Eye,
  Check,
  X,
  UserCheck,
  Calendar,
  CreditCard,
  HardHat,
  Users,
  ShieldAlert,
  CloudSun,
  Camera,
  FileCheck,
  ChevronRight,
  Plus,
  Download,
  RotateCcw,
  Sparkles,
  MapPin,
  Layers,
  Compass,
  ShieldCheck,
  Percent,
  CheckCircle,
  FileSpreadsheet,
  UploadCloud,
  Upload,
  AlertCircle,
  Trash2,
  RefreshCw,
  FileDown,
  Info,
} from 'lucide-react';

export const PUNJAB_DISTRICT_COORDS = {
  'Lahore': { lat: 31.5204, lng: 74.3587, division: 'Lahore' },
  'Rawalpindi': { lat: 33.5984, lng: 73.0441, division: 'Rawalpindi' },
  'Faisalabad': { lat: 31.4504, lng: 73.1350, division: 'Faisalabad' },
  'Multan': { lat: 30.1575, lng: 71.5249, division: 'Multan' },
  'Gujranwala': { lat: 32.1877, lng: 74.1945, division: 'Gujranwala' },
  'Sargodha': { lat: 32.0836, lng: 72.6711, division: 'Sargodha' },
  'Sahiwal': { lat: 30.6682, lng: 73.1114, division: 'Sahiwal' },
  'Bahawalpur': { lat: 29.3544, lng: 71.6911, division: 'Bahawalpur' },
  'Sialkot': { lat: 32.4945, lng: 74.5229, division: 'Gujranwala' },
  'Kasur': { lat: 31.1179, lng: 74.4479, division: 'Lahore' },
  'Okara': { lat: 30.8081, lng: 73.4458, division: 'Sahiwal' },
  'Rahim Yar Khan': { lat: 28.4212, lng: 70.2989, division: 'Bahawalpur' },
  'D.G. Khan': { lat: 30.0561, lng: 70.6403, division: 'D.G. Khan' },
  'Gujrat': { lat: 32.5742, lng: 74.0754, division: 'Gujrat' },
  'Attock': { lat: 33.7660, lng: 72.3609, division: 'Rawalpindi' },
  'Chakwal': { lat: 32.9328, lng: 72.8553, division: 'Rawalpindi' },
  'Jhelum': { lat: 32.9344, lng: 73.7269, division: 'Rawalpindi' },
  'Murree': { lat: 33.9070, lng: 73.3943, division: 'Rawalpindi' },
  'Khushab': { lat: 32.2967, lng: 72.3525, division: 'Sargodha' },
  'Mianwali': { lat: 32.5853, lng: 71.5436, division: 'Sargodha' },
  'Bhakkar': { lat: 31.6253, lng: 71.0657, division: 'Sargodha' },
  'Hafizabad': { lat: 32.0719, lng: 73.6874, division: 'Gujranwala' },
  'Mandi Bahauddin': { lat: 32.5870, lng: 73.4912, division: 'Gujrat' },
  'Narowal': { lat: 32.0995, lng: 74.8756, division: 'Gujranwala' },
  'Jhang': { lat: 31.2781, lng: 72.3317, division: 'Faisalabad' },
  'Toba Tek Singh': { lat: 30.9743, lng: 72.4827, division: 'Faisalabad' },
  'Chiniot': { lat: 31.7200, lng: 72.9789, division: 'Faisalabad' },
  'Nankana Sahib': { lat: 31.4502, lng: 73.7067, division: 'Lahore' },
  'Sheikhupura': { lat: 31.7167, lng: 73.9850, division: 'Lahore' },
  'Pakpattan': { lat: 30.3410, lng: 73.3866, division: 'Sahiwal' },
  'Khanewal': { lat: 30.3017, lng: 71.9321, division: 'Multan' },
  'Lodhran': { lat: 29.5405, lng: 71.6336, division: 'Multan' },
  'Vehari': { lat: 30.0419, lng: 72.3528, division: 'Multan' },
  'Layyah': { lat: 30.9613, lng: 70.9398, division: 'D.G. Khan' },
  'Muzaffargarh': { lat: 30.0726, lng: 71.1938, division: 'D.G. Khan' },
  'Rajanpur': { lat: 29.1035, lng: 70.3250, division: 'D.G. Khan' },
};

export const DIVISIONS = [
  'Lahore',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Gujranwala',
  'Gujrat',
  'Sargodha',
  'Sahiwal',
  'Bahawalpur',
  'D.G. Khan',
];

export const ACAG_CONSTRUCTION_STAGES = [
  'Site Preparation / Layout Marking',
  'Excavation Completed',
  'Foundation Completed',
  'Foundation Backfilling Completed',
  'Damp Proof Course (DPC) Completed',
  'Plinth Filling & Compaction Completed',
  'Wall Masonry up to Lintel Level Completed',
  'Lintel Completed',
  'Roof Slab (RCC) Cast Completed',
  'Plastering Completed',
  'Flooring Completed',
  'Doors & Windows Installed',
  'Electrical & Plumbing Completed',
  'Paint & Finishing Completed',
  'House Construction Completed',
];

export const HOUSE_STATUSES = [
  'Pending',
  'Approved',
  'Under Construction',
  'Inspection Required',
  'Re-Visit',
  'Completed',
  'On Hold',
  'Rejected',
];

export const LOAN_STATUSES = [
  'Pending',
  'Approved',
  'Partially Disbursed',
  'Fully Disbursed',
  'Rejected',
  'Completed',
];

export const SAFETY_STATUSES = [
  'Safe',
  'Warning',
  'Critical',
  'Inspection Required',
];

export const HousesManagement = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const initialTab = searchParams.get('tab') || 'ALL';

  const {
    houses,
    engineers,
    visits,
    workers,
    safetyIssues,
    loans,
    addHouse,
    bulkImportHouses,
    approveHouse,
    rejectHouse,
    assignEngineerToHouse,
    updateHouseStatus,
    scheduleVisit,
    scheduleHouseReVisit
  } = useDashboardData();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState(highlightId || '');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Modal States
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [assignEngineerModalHouse, setAssignEngineerModalHouse] = useState(null);
  const [selectedEngineerId, setSelectedEngineerId] = useState('');
  const [rejectModalHouse, setRejectModalHouse] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [scheduleModalHouse, setScheduleModalHouse] = useState(null);
  const [visitScheduleForm, setVisitScheduleForm] = useState({
    engineerId: '',
    visitDate: '',
    visitTime: '10:00 AM',
    visitType: 'Construction Inspection',
    purpose: '',
    notes: '',
  });

  // Re-Visit Modal State
  const [reVisitModalHouse, setReVisitModalHouse] = useState(null);
  const [reVisitForm, setReVisitForm] = useState({
    engineerId: '',
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: '11:00 AM',
    reason: 'Site defect rectification inspection following previous rejection/violation',
  });

  // Add House Modal State
  const [isAddHouseModalOpen, setIsAddHouseModalOpen] = useState(false);
  const [addHouseTab, setAddHouseTab] = useState('BASIC'); // 'BASIC' | 'LOCATION' | 'FINANCE' | 'SAFETY'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Excel / CSV Bulk Upload State
  const fileInputRef = useRef(null);
  const [isUploadExcelModalOpen, setIsUploadExcelModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parsedRows, setParsedRows] = useState([]);
  const [uploadFilterTab, setUploadFilterTab] = useState('ALL'); // 'ALL' | 'VALID' | 'DUPLICATES' | 'ERRORS'
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  const handleDownloadTemplate = async () => {
    try {
      const response = await housesApi.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ACAG_House_Import_Template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const csvContent = `Owner Name,CNIC,Contact Number,Email,Address,District,Tehsil,Union Council,Plot Size (Marla),Covered Area (sqft),Floors,Latitude,Longitude,Assigned Engineer,Current Stage,Progress (%),Loan Approved,Loan Disbursed,Loan Status,Safety Status,House Status,Remarks\n` +
        `Muhammad Tariq,35202-7654321-3,0300-1234567,tariq.acag@example.com,"House 12, Street 4, Gulshan Ravi",Lahore,Lahore City,UC-45,5,1100,1,31.5204,74.3587,Engr. Bilal Raza,Foundation,20,1500000,500000,Approved,Safe,Under Construction,"Foundation excavation completed, lean concrete in progress."\n` +
        `Fatima Bibi,38403-1234567-8,0321-9876543,fatima.bibi@example.com,"Chak 42-SB, Sargodha Road",Sargodha,Sargodha,UC-12,3,750,1,32.0836,72.6711,Engr. Ayesha Malik,Brick Masonry,45,1500000,750000,Partially Disbursed,Safe,Under Construction,"Brick masonry up to lintel level in progress."\n` +
        `Abdul Rehman,34101-9988776-5,0333-5544332,rehman.abdul@example.com,"Main Bazar, Kamoke",Gujranwala,Kamoke,UC-04,5,1200,1,32.0336,74.2230,Engr. Usman Ali,Plaster,60,1500000,1000000,Partially Disbursed,Safe,Under Construction,"Internal plaster completed, external started."\n`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'ACAG_House_Import_Template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const parseCsvText = (text) => {
    const lines = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c !== '')) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c !== '')) {
        lines.push(currentRow);
      }
    }
    return lines;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const processSelectedFile = (file) => {
    setSelectedFile(file);
    setIsParsingFile(true);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rawGrid = parseCsvText(text);

        if (rawGrid.length < 2) {
          setParsedRows([]);
          setIsParsingFile(false);
          return;
        }

        const headers = rawGrid[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const existingCnics = new Set(houses.map((h) => (h.ownerCnic || '').replace(/[^0-9]/g, '')).filter(Boolean));
        const seenInFileCnics = new Set();

        const validatedRows = [];

        for (let r = 1; r < rawGrid.length; r++) {
          const rowValues = rawGrid[r];
          const rowObj = {};
          headers.forEach((h, idx) => {
            rowObj[h] = rowValues[idx] || '';
          });

          const getVal = (...keys) => {
            for (const k of keys) {
              const norm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (rowObj[norm]) return rowObj[norm];
            }
            return '';
          };

          const ownerName = getVal('ownername', 'owner', 'name');
          const rawCnic = getVal('cnic', 'ownercnic', 'nic');
          const cleanCnicDigits = rawCnic.replace(/[^0-9]/g, '');
          const phone = getVal('contactnumber', 'phone', 'contact', 'mobile', 'ownerphone');
          const email = getVal('email', 'owneremail');
          const address = getVal('address', 'siteaddress', 'location');
          const district = getVal('district', 'districtname') || 'Lahore';
          const tehsil = getVal('tehsil', 'tehsilname') || district;
          const stage = getVal('currentstage', 'stage') || 'Site Preparation';
          const progress = parseFloat(getVal('progress', 'progresspct', 'overallprogresspct') || '0');
          const plotSize = parseFloat(getVal('plotsizemap', 'plotsize', 'plotsizemarka') || '5');
          const coveredArea = parseFloat(getVal('coveredarea', 'coveredareasqft') || '1100');
          const engineer = getVal('assignedengineer', 'engineer', 'engineername') || 'Engr. Bilal Raza';
          const loanStatus = getVal('loanstatus') || 'Pending';
          const safetyStatus = getVal('safetystatus') || 'Safe';
          const houseStatus = getVal('status', 'housestatus') || 'Under Construction';
          const lat = parseFloat(getVal('latitude', 'lat') || (PUNJAB_DISTRICT_COORDS[district]?.lat || 31.5204));
          const lng = parseFloat(getVal('longitude', 'lng') || (PUNJAB_DISTRICT_COORDS[district]?.lng || 74.3587));

          const errors = [];
          if (!ownerName) errors.push('Owner Name is required');
          if (cleanCnicDigits && cleanCnicDigits.length !== 13) errors.push('CNIC must have 13 digits');
          if (isNaN(lat) || lat < -90 || lat > 90) errors.push('Invalid Latitude (-90 to 90)');
          if (isNaN(lng) || lng < -180 || lng > 180) errors.push('Invalid Longitude (-180 to 180)');
          if (isNaN(progress) || progress < 0 || progress > 100) errors.push('Progress must be 0-100%');

          const formattedCnic = cleanCnicDigits.length === 13
            ? `${cleanCnicDigits.slice(0, 5)}-${cleanCnicDigits.slice(5, 12)}-${cleanCnicDigits.slice(12)}`
            : rawCnic;

          let isDuplicate = false;
          let duplicateReason = '';
          if (cleanCnicDigits && (existingCnics.has(cleanCnicDigits) || seenInFileCnics.has(cleanCnicDigits))) {
            isDuplicate = true;
            duplicateReason = 'CNIC already registered in system or repeated in file';
          }
          if (cleanCnicDigits) seenInFileCnics.add(cleanCnicDigits);

          const isValid = errors.length === 0 && !isDuplicate;

          validatedRows.push({
            rowIndex: r,
            ownerName,
            cnic: formattedCnic,
            phone,
            email,
            address,
            district,
            tehsil,
            stage,
            progress: isNaN(progress) ? 0 : progress,
            plotSize: isNaN(plotSize) ? 5 : plotSize,
            coveredArea: isNaN(coveredArea) ? 1100 : coveredArea,
            engineer,
            loanStatus,
            safetyStatus,
            houseStatus,
            lat,
            lng,
            isValid,
            isDuplicate,
            duplicateReason,
            errors,
          });
        }

        setParsedRows(validatedRows);
      } catch (err) {
        console.error('Error parsing file:', err);
      } finally {
        setIsParsingFile(false);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!selectedFile && parsedRows.length === 0) return;
    setIsImporting(true);

    try {
      const summary = await bulkImportHouses(selectedFile);
      setImportSummary(summary);
    } catch (err) {
      console.error('Bulk import execution error:', err);
    } finally {
      setIsImporting(false);
    }
  };

  const initialAddHouseState = {
    ownerName: '',
    ownerCnic: '',
    ownerPhone: '',
    ownerEmail: '',
    division: 'Lahore',
    district: 'Lahore',
    tehsil: '',
    unionCouncil: '',
    address: '',
    lat: 31.5204,
    lng: 74.3587,
    plotSizeMarla: 5,
    coveredAreaSqft: 1100,
    floors: 1,
    projectType: 'UNDER_CONSTRUCTION',
    stage: 'Site Preparation / Layout Marking',
    progressPct: 0,
    status: 'Pending',
    startDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: '',
    stageStartDate: new Date().toISOString().split('T')[0],
    lastInspectionDate: '',
    nextInspectionDate: '',
    loanApproved: 1500000,
    loanDisbursed: 0,
    loanStatus: 'Pending',
    loanApplicationDate: new Date().toISOString().split('T')[0],
    engineerId: '',
    safetyStatus: 'Safe',
    openSafetyIssues: 0,
    lastSafetyInspection: '',
    safetyRemarks: '',
    remarks: '',
  };

  const [addHouseForm, setAddHouseForm] = useState(initialAddHouseState);

  const resetAddHouseForm = () => {
    setAddHouseForm({
      ...initialAddHouseState,
      engineerId: engineers[0]?.id || '',
    });
    setFormErrors({});
    setAddHouseTab('BASIC');
  };

  // Filter houses by Tab
  const filteredHouses = houses.filter((h) => {
    // Tab filter
    if (activeTab === 'APPLICATIONS' && h.status !== 'Pending') return false;
    if (activeTab === 'APPROVED' && h.status !== 'Approved') return false;
    if (activeTab === 'UNDER_CONSTRUCTION' && h.status !== 'Under Construction') return false;
    if (activeTab === 'REVISIT' && h.status !== 'Re-Visit' && !h.reInspectionRequired) return false;
    if (activeTab === 'COMPLETED' && h.status !== 'Completed') return false;
    if (activeTab === 'REJECTED' && h.status !== 'Rejected') return false;

    // District filter
    if (districtFilter !== 'ALL' && h.district !== districtFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        h.id.toLowerCase().includes(q) ||
        h.ownerName.toLowerCase().includes(q) ||
        h.ownerCnic.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q) ||
        h.division.toLowerCase().includes(q) ||
        h.engineerName.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const districtsList = Array.from(new Set(houses.map((h) => h.district)));

  // Tab counts
  const tabCounts = {
    ALL: houses.length,
    APPLICATIONS: houses.filter((h) => h.status === 'Pending').length,
    APPROVED: houses.filter((h) => h.status === 'Approved').length,
    UNDER_CONSTRUCTION: houses.filter((h) => h.status === 'Under Construction').length,
    REVISIT: houses.filter((h) => h.status === 'Re-Visit' || h.reInspectionRequired).length,
    COMPLETED: houses.filter((h) => h.status === 'Completed').length,
    REJECTED: houses.filter((h) => h.status === 'Rejected').length,
  };

  const handleAssignEngineerSubmit = (e) => {
    e.preventDefault();
    if (assignEngineerModalHouse && selectedEngineerId) {
      assignEngineerToHouse(assignEngineerModalHouse.id, selectedEngineerId);
      setAssignEngineerModalHouse(null);
      setSelectedEngineerId('');
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (rejectModalHouse) {
      rejectHouse(rejectModalHouse.id, rejectReason);
      setRejectModalHouse(null);
      setRejectReason('');
    }
  };

  const handleReVisitSubmit = (e) => {
    e.preventDefault();
    if (reVisitModalHouse) {
      scheduleHouseReVisit(
        reVisitModalHouse.id,
        reVisitForm.engineerId || engineers[0]?.id,
        reVisitForm.visitDate,
        reVisitForm.visitTime,
        reVisitForm.reason
      );
      setReVisitModalHouse(null);
    }
  };

  const handleCnicChange = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    let formatted = digits;
    if (digits.length > 5 && digits.length <= 12) {
      formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
    } else if (digits.length > 12) {
      formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
    }
    setAddHouseForm((prev) => ({ ...prev, ownerCnic: formatted }));
    if (formErrors.ownerCnic) {
      setFormErrors((prev) => ({ ...prev, ownerCnic: '' }));
    }
  };

  const handleDistrictChange = (selectedDist) => {
    const meta = PUNJAB_DISTRICT_COORDS[selectedDist];
    setAddHouseForm((prev) => ({
      ...prev,
      district: selectedDist,
      division: meta?.division || prev.division,
      lat: meta?.lat !== undefined ? meta.lat : prev.lat,
      lng: meta?.lng !== undefined ? meta.lng : prev.lng,
    }));
    if (formErrors.district) {
      setFormErrors((prev) => ({ ...prev, district: '' }));
    }
  };

  const handleDetectGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setAddHouseForm((prev) => ({
            ...prev,
            lat: parseFloat(pos.coords.latitude.toFixed(6)),
            lng: parseFloat(pos.coords.longitude.toFixed(6)),
          }));
        },
        (err) => {
          alert('GPS permission not available or timed out. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleAddHouseSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!addHouseForm.ownerName?.trim()) errors.ownerName = 'Owner / Beneficiary name is required.';
    if (!addHouseForm.ownerCnic?.trim()) {
      errors.ownerCnic = 'CNIC number is required.';
    } else {
      const rawCnic = addHouseForm.ownerCnic.replace(/\D/g, '');
      if (rawCnic.length !== 13) {
        errors.ownerCnic = 'CNIC must be 13 digits (e.g. 35202-1234567-1).';
      }
    }
    if (!addHouseForm.ownerPhone?.trim()) errors.ownerPhone = 'Owner contact number is required.';
    if (!addHouseForm.district) errors.district = 'District is required.';
    if (addHouseForm.lat === '' || isNaN(Number(addHouseForm.lat)) || Number(addHouseForm.lat) < -90 || Number(addHouseForm.lat) > 90) {
      errors.lat = 'Latitude must be between -90 and 90.';
    }
    if (addHouseForm.lng === '' || isNaN(Number(addHouseForm.lng)) || Number(addHouseForm.lng) < -180 || Number(addHouseForm.lng) > 180) {
      errors.lng = 'Longitude must be between -180 and 180.';
    }
    if (addHouseForm.progressPct < 0 || addHouseForm.progressPct > 100) {
      errors.progressPct = 'Progress percentage must be between 0% and 100%.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (errors.ownerName || errors.ownerCnic || errors.ownerPhone || errors.district) {
        setAddHouseTab('BASIC');
      } else if (errors.lat || errors.lng) {
        setAddHouseTab('LOCATION');
      } else if (errors.progressPct) {
        setAddHouseTab('CONSTRUCTION');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addHouse({
        ...addHouseForm,
        lat: Number(addHouseForm.lat),
        lng: Number(addHouseForm.lng),
        plotSizeMarla: Number(addHouseForm.plotSizeMarla),
        coveredAreaSqft: Number(addHouseForm.coveredAreaSqft),
        floors: Number(addHouseForm.floors),
        loanApproved: Number(addHouseForm.loanApproved),
        loanDisbursed: Number(addHouseForm.loanDisbursed),
        progressPct: Number(addHouseForm.progressPct),
        engineerId: addHouseForm.engineerId ? Number(addHouseForm.engineerId) : null,
        engineerName: engineers.find((eng) => eng.id === Number(addHouseForm.engineerId))?.name || 'Unassigned',
      });

      if (created) {
        setIsAddHouseModalOpen(false);
        resetAddHouseForm();
      }
    } catch (err) {
      console.error('Error adding house:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (scheduleModalHouse) {
      const selectedEng = engineers.find((eng) => eng.id === Number(visitScheduleForm.engineerId)) || engineers[0];
      scheduleVisit({
        houseId: scheduleModalHouse.id,
        houseAddress: scheduleModalHouse.address,
        engineerId: selectedEng.id,
        engineerName: selectedEng.name,
        visitType: visitScheduleForm.visitType,
        visitDate: visitScheduleForm.visitDate || new Date().toISOString().split('T')[0],
        visitTime: visitScheduleForm.visitTime,
        purpose: visitScheduleForm.purpose || 'Site quality inspection',
        progressPctReported: scheduleModalHouse.progressPct,
        workersPresent: scheduleModalHouse.workersCount || 4,
        trainingProvided: null,
        safetyChecklist: null,
        environmentalConditions: null,
        issuesFound: [],
        engineerRemarks: visitScheduleForm.notes || '',
        photos: [],
        aiHazardResult: null,
      });
      setScheduleModalHouse(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {isRTL ? 'مکانات کا انتظامی ماڈیول' : 'House Management Module'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRTL
              ? 'مستحقین، تعمیراتی مراحل، قرضہ جات کے کھاتے، انجینئرز اور کوالٹی معائنہ کا مکمل نظام'
              : 'Monitor beneficiaries, construction stages, loan accounts, engineers, and quality inspection workflows'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Add House Button */}
          <button
            type="button"
            onClick={() => {
              resetAddHouseForm();
              setIsAddHouseModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer transition transform active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{isRTL ? 'نیا مکان شامل کریں' : 'Add House'}</span>
          </button>

          {/* Upload Excel Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setParsedRows([]);
              setImportSummary(null);
              setIsUploadExcelModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer transition transform active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4 stroke-[2.5]" />
            <span>{isRTL ? 'ایکسل فائل اپ لوڈ' : 'Upload Excel'}</span>
          </button>

          {/* Download Template Button */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold shadow-2xs hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
            title={isRTL ? 'ایکسل ٹیمپلیٹ ڈاؤن لوڈ کریں' : 'Download blank Excel / CSV template with standard fields'}
          >
            <FileDown className="h-4 w-4 text-indigo-600" />
            <span>{isRTL ? 'ٹیمپلیٹ' : 'Template'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              generateDomainPdf({
                domain: 'CONSTRUCTION',
                houses: filteredHouses,
                districtFilter: districtFilter === 'ALL' ? 'All Punjab Districts' : districtFilter,
                dateRange: 'All Stages'
              });
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4 text-orange-600" />
            <span>{isRTL ? 'پی ڈی ایف ایکسپورٹ' : 'Export PDF'}</span>
          </button>

          <button
            onClick={() => {
              if (filteredHouses.length > 0) {
                setScheduleModalHouse(filteredHouses[0]);
                setVisitScheduleForm({
                  ...visitScheduleForm,
                  engineerId: filteredHouses[0].engineerId || engineers[0]?.id,
                });
              }
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white text-xs font-extrabold shadow-md shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="h-4 w-4" />
            <span>{isRTL ? 'معائناتی دورہ شیڈول کریں' : 'Schedule Field Visit'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'ALL', label: isRTL ? 'تمام مکانات' : 'All Houses' },
          { id: 'APPLICATIONS', label: isRTL ? 'درخواستیں' : 'Applications' },
          { id: 'APPROVED', label: isRTL ? 'منظور شدہ' : 'Approved' },
          { id: 'UNDER_CONSTRUCTION', label: isRTL ? 'زیر تعمیر' : 'Under Construction' },
          { id: 'REVISIT', label: isRTL ? 'دوبارہ معائنہ مطلوب' : 'Re-Visit Required' },
          { id: 'COMPLETED', label: isRTL ? 'مکمل شدہ' : 'Completed' },
          { id: 'REJECTED', label: isRTL ? 'مسترد شدہ' : 'Rejected' },
        ].map((tab) => {
          const count = tabCounts[tab.id];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ltr-isolate ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className={`h-4 w-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3 pointer-events-none`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'مکان شناختی نمبر، مالک، شناختی کارڈ، انجینئر سے تلاش کریں...' : 'Search by ID, owner, CNIC, engineer...'}
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

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Filter className="h-3.5 w-3.5 text-orange-600" />
            <span>{isRTL ? 'ضلع:' : 'District:'}</span>
          </div>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3.5 py-2 text-xs bg-slate-50/80 border border-slate-200/90 rounded-2xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 cursor-pointer transition shadow-2xs"
          >
            <option value="ALL">{isRTL ? 'تمام اضلاع' : 'All Districts'}</option>
            {districtsList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Houses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-xs min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase tracking-wider">
                <th className={`py-3.5 px-5 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'مکان نمبر' : 'House ID'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'مالک کی تفصیل' : 'Owner Info'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'مقام و پتہ' : 'Location'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'متعلقہ انجینئر' : 'Assigned Engineer'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'مرحلہ و پیش رفت' : 'Stage & Progress'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'قرضہ کی صورتحال' : 'Loan Status'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'سیفٹی' : 'Safety'}</th>
                <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'حیثیت' : 'Status'}</th>
                <th className={`py-3.5 px-5 ${isRTL ? 'text-left' : 'text-right'}`}>{isRTL ? 'کارروائیاں' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHouses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    {isRTL ? 'کوئی مکان تلاش کے معیار پر پورا نہیں اترا۔' : 'No houses match the selected filters.'}
                  </td>
                </tr>
              ) : (
                filteredHouses.map((h) => {
                  const stageLabelUrdu = {
                    Foundation: 'بنیاد',
                    Structure: 'ڈھانچہ و چنائی',
                    Roof: 'چھت و سلیب',
                    Electrical: 'برقی وائرنگ',
                    Plumbing: 'پلمبنگ و سینیٹری',
                    Finishing: 'فنشنگ و روغن',
                    Completed: 'مکمل شدہ',
                  }[h.stage] || h.stage;

                  const statusLabelUrdu = {
                    'Pending': 'زیر جائزہ',
                    'Approved': 'منظور شدہ',
                    'Under Construction': 'زیر تعمیر',
                    'Inspection Required': 'معائنہ مطلوب',
                    'Re-Visit': 'دوبارہ معائنہ',
                    'Completed': 'مکمل شدہ',
                    'On Hold': 'روکا گیا',
                    'Rejected': 'مسترد شدہ',
                  }[h.status] || (h.reInspectionRequired ? 'دوبارہ معائنہ' : h.status);

                  const loanStatusUrdu = {
                    'Pending': 'زیر التواء',
                    'Approved': 'منظور شدہ',
                    'Partially Disbursed': 'جزوی ادا شدہ',
                    'Fully Disbursed': 'مکمل ادا شدہ',
                    'Rejected': 'مسترد',
                    'Completed': 'مکمل',
                  }[h.loanStatus] || h.loanStatus;

                  return (
                    <tr
                      key={h.id}
                      className={`hover:bg-slate-50/80 transition ${
                        highlightId === h.id ? 'bg-orange-50/60 ring-2 ring-orange-300' : ''
                      }`}
                    >
                      {/* House ID */}
                      <td className="py-4 px-5">
                        <div className="font-mono font-black text-orange-700 ltr-isolate">{h.id}</div>
                        <div className="text-[10px] text-slate-400">
                          <span className="ltr-isolate">{h.plotSizeMarla}</span> {isRTL ? 'مرلہ' : 'Marla'} • <span className="ltr-isolate">{h.coveredAreaSqft}</span> {isRTL ? 'مربع فٹ' : 'sqft'}
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-900">{h.ownerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono ltr-isolate">{h.ownerCnic}</div>
                        <div className="text-[10px] text-slate-400 ltr-isolate">{h.ownerPhone}</div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800">{h.district}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{h.tehsil}</div>
                      </td>

                      {/* Engineer */}
                      <td className="py-4 px-4">
                        {h.engineerName !== 'Unassigned' ? (
                          <div className="flex items-center gap-1.5">
                            <HardHat className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                            <span className="font-bold text-slate-800">{h.engineerName}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAssignEngineerModalHouse(h);
                              setSelectedEngineerId(engineers[0]?.id || '');
                            }}
                            className="px-2 py-0.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-black hover:bg-orange-100 transition cursor-pointer"
                          >
                            {isRTL ? '+ انجینئر مقرر کریں' : '+ Assign Engineer'}
                          </button>
                        )}
                      </td>

                      {/* Progress & Stage */}
                      <td className="py-4 px-4 min-w-[130px]">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700 mb-1">
                          <span>{isRTL ? stageLabelUrdu : h.stage}</span>
                          <span className="font-mono ltr-isolate">{h.progressPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${h.progressPct}%` }}
                            className={`h-full rounded-full ${
                              h.progressPct === 100
                                ? 'bg-emerald-600'
                                : h.progressPct > 50
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                          />
                        </div>
                      </td>

                      {/* Loan Status */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800 text-[11px]">
                          {isRTL ? `${(h.loanDisbursed / 1000).toLocaleString()} ہزار روپے` : `PKR ${(h.loanDisbursed / 1000).toLocaleString()}k`}
                        </div>
                        <div className="text-[10px] text-slate-500">{isRTL ? loanStatusUrdu : h.loanStatus}</div>
                      </td>

                      {/* Safety Status */}
                      <td className="py-4 px-4">
                        {h.safetyStatus === 'Critical Issue' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="h-3 w-3" /> {isRTL ? `زیادہ خطرہ (${h.safetyIssuesCount})` : `Critical (${h.safetyIssuesCount})`}
                          </span>
                        ) : h.safetyStatus === 'Minor Issue' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="h-3 w-3" /> {isRTL ? 'انتباہ' : 'Warning'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> {isRTL ? 'محفوظ' : 'Safe'}
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            h.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : h.status === 'Under Construction'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : h.status === 'Re-Visit' || h.reInspectionRequired
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : h.status === 'Approved'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : h.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isRTL ? statusLabelUrdu : (h.status === 'Re-Visit' ? 'Re-Visit Req.' : h.status)}
                        </span>
                      </td>

                      {/* Admin Actions */}
                      <td className={`py-4 px-5 ${isRTL ? 'text-left' : 'text-right'}`}>
                        <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-1.5`}>
                          <button
                            onClick={() => setSelectedHouse(h)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-orange-700 hover:bg-orange-50 transition shadow-2xs cursor-pointer"
                            title={isRTL ? 'مکمل تفصیلات دیکھیں' : 'View 360° House Details'}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {(h.status === 'Rejected' || h.status === 'Re-Visit' || h.reInspectionRequired) && (
                            <button
                              onClick={() => {
                                setReVisitModalHouse(h);
                                setReVisitForm({
                                  engineerId: h.engineerId || engineers[0]?.id || '',
                                  visitDate: new Date().toISOString().split('T')[0],
                                  visitTime: '11:00 AM',
                                  reason: h.revisitReason || 'Ghar ka re-inspection defect rectification audit',
                                });
                              }}
                              className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 text-[10px] font-black transition flex items-center gap-1 cursor-pointer shadow-2xs"
                              title={isRTL ? 'دوبارہ معائنہ شیڈول کریں' : 'Schedule Re-Visit for this house'}
                            >
                              <RotateCcw className="h-3 w-3 text-purple-700" />
                              <span>{isRTL ? 'دوبارہ معائنہ' : 'Re-Visit'}</span>
                            </button>
                          )}

                          {h.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => approveHouse(h.id)}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                                title={isRTL ? 'درخواست منظور کریں' : 'Approve Application'}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setRejectModalHouse(h)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition shadow-2xs cursor-pointer"
                                title={isRTL ? 'درخواست مسترد کریں' : 'Reject Application'}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => {
                              setAssignEngineerModalHouse(h);
                              setSelectedEngineerId(h.engineerId || engineers[0]?.id || '');
                            }}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 transition shadow-2xs cursor-pointer"
                            title={isRTL ? 'انجینئر مقرر کریں' : 'Assign Engineer'}
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setScheduleModalHouse(h);
                              setVisitScheduleForm({
                                ...visitScheduleForm,
                                engineerId: h.engineerId || engineers[0]?.id,
                              });
                            }}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-orange-700 hover:bg-orange-50 transition shadow-2xs cursor-pointer"
                            title={isRTL ? 'معائنہ شیڈول کریں' : 'Schedule Visit'}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: 360° HOUSE DETAILS VIEWER (Rich multi-section modal)
         ========================================================================= */}
      {selectedHouse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-6 animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center font-black">
                  <Home className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">{selectedHouse.id}</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        selectedHouse.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedHouse.status === 'Under Construction'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedHouse.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedHouse.address}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedHouse(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick KPI Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-black uppercase">Owner</span>
                <div className="text-xs font-black text-slate-900 mt-0.5">{selectedHouse.ownerName}</div>
                <div className="text-[10px] text-slate-500 font-mono">{selectedHouse.ownerCnic}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-black uppercase">Stage & Progress</span>
                <div className="text-xs font-black text-slate-900 mt-0.5">{selectedHouse.stage}</div>
                <div className="text-[10px] text-emerald-600 font-bold">{selectedHouse.progressPct}% Completed</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-black uppercase">Loan Disbursed</span>
                <div className="text-xs font-black text-slate-900 mt-0.5">
                  PKR {(selectedHouse.loanDisbursed / 1000).toLocaleString()}k
                </div>
                <div className="text-[10px] text-slate-500">of {(selectedHouse.loanApproved / 1000).toLocaleString()}k Total</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-black uppercase">Assigned Engineer</span>
                <div className="text-xs font-black text-slate-900 mt-0.5 truncate">{selectedHouse.engineerName}</div>
                <div className="text-[10px] text-orange-700 font-bold">Field Incharge</div>
              </div>
            </div>

            {/* Photo & GIS View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 relative group">
                <img
                  src={selectedHouse.photoUrl}
                  alt="Construction Site Photo"
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                  Latest On-Site Photo (GPS Accuracy: 2.1m)
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 mb-2">Location & Coordinates</h3>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Division / District:</span>
                      <span className="font-bold">{selectedHouse.division} / {selectedHouse.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tehsil:</span>
                      <span className="font-bold">{selectedHouse.tehsil}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">GPS Coordinates:</span>
                      <span className="font-mono font-bold text-orange-800">{selectedHouse.lat}, {selectedHouse.lng}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Weather & Env Risk:</span>
                      <span className="font-bold text-amber-800">{selectedHouse.weather} ({selectedHouse.temperature}°C) • Risk: {selectedHouse.environmentalRisk}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedHouse(null);
                      navigate(`/gis-map?houseId=${selectedHouse.id}`);
                    }}
                    className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl transition"
                  >
                    View on Full GIS Map
                  </button>
                </div>
              </div>
            </div>

            {/* Workers & Labour Training Section */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black text-slate-900">Assigned Labour & Safety Training</h3>
                <span className="text-[11px] font-bold text-purple-700">
                  {selectedHouse.trainedWorkersCount} of {selectedHouse.workersCount} Workers Trained
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                During engineer inspections, on-site safety training modules (PPE, Working at Height, Scaffolding) are conducted and recorded for this house.
              </p>
            </div>

            {/* Admin Action Buttons inside modal */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedHouse(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = selectedHouse;
                  setSelectedHouse(null);
                  setScheduleModalHouse(target);
                  setVisitScheduleForm({
                    ...visitScheduleForm,
                    engineerId: target.engineerId || engineers[0]?.id,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold hover:bg-orange-100 transition cursor-pointer"
              >
                Schedule Visit
              </button>

              {selectedHouse.status === 'Pending' && (
                <button
                  type="button"
                  onClick={() => {
                    approveHouse(selectedHouse.id);
                    setSelectedHouse(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
                >
                  Approve Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ASSIGN ENGINEER
         ========================================================================= */}
      {assignEngineerModalHouse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">
                Assign Field Engineer to {assignEngineerModalHouse.id}
              </h3>
              <button
                onClick={() => setAssignEngineerModalHouse(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAssignEngineerSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Select Field Engineer (PEC Registered)
                </label>
                <select
                  value={selectedEngineerId}
                  onChange={(e) => setSelectedEngineerId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-slate-800 font-bold"
                >
                  <option value="">Select Engineer</option>
                  {engineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name} ({eng.assignedDivision} • {eng.assignedHousesCount} Houses)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 text-[11px] text-orange-950 space-y-1">
                <div className="font-bold">House Details:</div>
                <div>Owner: {assignEngineerModalHouse.ownerName}</div>
                <div>Location: {assignEngineerModalHouse.address}</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignEngineerModalHouse(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold shadow-md transition"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: REJECT HOUSE APPLICATION
         ========================================================================= */}
      {rejectModalHouse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-rose-700">
                Reject Application: {rejectModalHouse.id}
              </h3>
              <button
                onClick={() => setRejectModalHouse(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Rejection Reason / Remarks
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Specify grounds for rejection (e.g. Land registry dispute, non-qualifying income criteria)..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalHouse(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: SCHEDULE VISIT
         ========================================================================= */}
      {scheduleModalHouse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Schedule Engineer Inspection
                </h3>
                <p className="text-[11px] text-slate-500">House: {scheduleModalHouse.id} ({scheduleModalHouse.ownerName})</p>
              </div>
              <button
                onClick={() => setScheduleModalHouse(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Select Engineer
                  </label>
                  <select
                    value={visitScheduleForm.engineerId}
                    onChange={(e) => setVisitScheduleForm({ ...visitScheduleForm, engineerId: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
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
                    Visit Type
                  </label>
                  <select
                    value={visitScheduleForm.visitType}
                    onChange={(e) => setVisitScheduleForm({ ...visitScheduleForm, visitType: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                  >
                    <option value="Construction Inspection">Construction Inspection</option>
                    <option value="Progress Verification">Progress Verification</option>
                    <option value="Safety Inspection">Safety Inspection</option>
                    <option value="Labour Training">Labour Training</option>
                    <option value="Final Inspection">Final Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    value={visitScheduleForm.visitDate}
                    onChange={(e) => setVisitScheduleForm({ ...visitScheduleForm, visitDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Visit Time
                  </label>
                  <input
                    type="text"
                    value={visitScheduleForm.visitTime}
                    onChange={(e) => setVisitScheduleForm({ ...visitScheduleForm, visitTime: e.target.value })}
                    placeholder="10:30 AM"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Purpose / Focus Area
                </label>
                <input
                  type="text"
                  value={visitScheduleForm.purpose}
                  onChange={(e) => setVisitScheduleForm({ ...visitScheduleForm, purpose: e.target.value })}
                  placeholder="e.g. Verify steel reinforcement before roof concrete pouring"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Special Notes for Engineer
                </label>
                <textarea
                  value={visitScheduleForm.notes}
                  onChange={(e) => setVisitScheduleForm({ ...visitScheduleForm, notes: e.target.value })}
                  placeholder="e.g. Conduct worker safety briefing on PPE and check water supply..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalHouse(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold shadow-md transition"
                >
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: SCHEDULE SITE RE-VISIT / RE-INSPECTION MODAL
         ========================================================================= */}
      {reVisitModalHouse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-purple-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-black">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Schedule Ghar Re-Visit & Audit
                  </h2>
                  <p className="text-xs text-purple-700 font-bold">
                    House: {reVisitModalHouse.id} ({reVisitModalHouse.ownerName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReVisitModalHouse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-2xl text-xs text-purple-900 space-y-1">
              <span className="font-black block">Re-Visit Inspection Purpose:</span>
              <p className="text-purple-800 text-[11px]">
                Yeh modal rejected ya defected houses ke liye engineer ko dobara site visit assign karta hai taake rectification check ki ja sakay aur house status update ho sake.
              </p>
            </div>

            <form onSubmit={handleReVisitSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Assign Field Engineer
                </label>
                <select
                  value={reVisitForm.engineerId}
                  onChange={(e) => setReVisitForm({ ...reVisitForm, engineerId: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                >
                  {engineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name} ({eng.pecNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Re-Visit Date
                  </label>
                  <input
                    type="date"
                    value={reVisitForm.visitDate}
                    onChange={(e) => setReVisitForm({ ...reVisitForm, visitDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Re-Visit Time
                  </label>
                  <input
                    type="text"
                    value={reVisitForm.visitTime}
                    onChange={(e) => setReVisitForm({ ...reVisitForm, visitTime: e.target.value })}
                    placeholder="11:00 AM"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Defect Rectification Checklist / Reason
                </label>
                <textarea
                  value={reVisitForm.reason}
                  onChange={(e) => setReVisitForm({ ...reVisitForm, reason: e.target.value })}
                  placeholder="e.g. Verify corrected column alignment and steel bonding before passing..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReVisitModalHouse(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md transition flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Confirm Re-Visit Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: ADD NEW HOUSE / BENEFICIARY MODAL (ACAG SYSTEM)
         ========================================================================= */}
      {isAddHouseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in fade-in">
            {/* Modal Top Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-start justify-between shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 shrink-0">
                  <Home className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                      Add New House Record
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-400" />
                      ID: Auto-Generated (e.g. ACAG-000012)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Apni Chhat Apna Ghar (ACAG) Program • Beneficiary, Location, GIS & Engineering Registration
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddHouseModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step / Section Navigation Tabs */}
            <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0 text-xs font-bold">
              {[
                { id: 'BASIC', label: '1. Owner Info', icon: Users },
                { id: 'SPECS', label: '2. Physical Specs', icon: Building2 },
                { id: 'LOCATION', label: '3. Location & GIS', icon: MapPin },
                { id: 'CONSTRUCTION', label: '4. Stage & Engineer', icon: HardHat },
                { id: 'FINANCE', label: '5. Loan & Safety', icon: CreditCard },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = addHouseTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAddHouseTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Body (Scrollable) */}
            <form onSubmit={handleAddHouseSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Validation Summary if any error */}
              {Object.keys(formErrors).length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-black">Please resolve the following before saving:</span>
                    <ul className="list-disc list-inside text-[11px] text-rose-700 font-semibold">
                      {Object.values(formErrors).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 1: OWNER / BENEFICIARY INFORMATION */}
              {addHouseTab === 'BASIC' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-emerald-600" />
                        <span>Beneficiary / Owner Information</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Enter applicant's national identification and local address details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    {/* Owner Name */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Owner / Beneficiary Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addHouseForm.ownerName}
                        onChange={(e) => {
                          setAddHouseForm({ ...addHouseForm, ownerName: e.target.value });
                          if (formErrors.ownerName) setFormErrors({ ...formErrors, ownerName: '' });
                        }}
                        placeholder="e.g. Muhammad Arshad"
                        required
                        className={`w-full px-3 py-2 text-xs bg-slate-50 border ${
                          formErrors.ownerName ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200'
                        } rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600`}
                      />
                    </div>

                    {/* Owner CNIC */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Owner CNIC Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addHouseForm.ownerCnic}
                        onChange={(e) => handleCnicChange(e.target.value)}
                        placeholder="35202-1234567-1"
                        maxLength={15}
                        required
                        className={`w-full px-3 py-2 text-xs bg-slate-50 border ${
                          formErrors.ownerCnic ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200'
                        } rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600`}
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Contact / Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addHouseForm.ownerPhone}
                        onChange={(e) => {
                          setAddHouseForm({ ...addHouseForm, ownerPhone: e.target.value });
                          if (formErrors.ownerPhone) setFormErrors({ ...formErrors, ownerPhone: '' });
                        }}
                        placeholder="+92 300 1234567"
                        required
                        className={`w-full px-3 py-2 text-xs bg-slate-50 border ${
                          formErrors.ownerPhone ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200'
                        } rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600`}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={addHouseForm.ownerEmail}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, ownerEmail: e.target.value })}
                        placeholder="beneficiary@gmail.com"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>

                    {/* Division */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Administrative Division <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={addHouseForm.division}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, division: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      >
                        {DIVISIONS.map((div) => (
                          <option key={div} value={div}>{div}</option>
                        ))}
                      </select>
                    </div>

                    {/* District */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        District (Punjab) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={addHouseForm.district}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      >
                        {Object.keys(PUNJAB_DISTRICT_COORDS).map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Tehsil */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Tehsil
                      </label>
                      <input
                        type="text"
                        value={addHouseForm.tehsil}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, tehsil: e.target.value })}
                        placeholder="e.g. Shalimar / Model Town / Taxila"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>

                    {/* Union Council */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Union Council (UC)
                      </label>
                      <input
                        type="text"
                        value={addHouseForm.unionCouncil}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, unionCouncil: e.target.value })}
                        placeholder="e.g. UC-42 Jallo"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Complete Address */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Complete Property / Street Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={addHouseForm.address}
                      onChange={(e) => setAddHouseForm({ ...addHouseForm, address: e.target.value })}
                      placeholder="e.g. Plot 42, Block B, Jallo Park Housing Scheme, Near Main Gate, Lahore"
                      rows={2}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PHYSICAL & STRUCTURAL SPECIFICATIONS */}
              {addHouseTab === 'SPECS' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-emerald-600" />
                        <span>Physical & Structural Specifications</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Define plot size, covered area, floors, and construction timeline</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                    {/* Plot Size (Marla) */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Plot Size (Marla) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="20"
                        value={addHouseForm.plotSizeMarla}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, plotSizeMarla: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                      <div className="flex gap-1.5 mt-1">
                        {[3, 3.5, 5, 7, 10].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setAddHouseForm({ ...addHouseForm, plotSizeMarla: size })}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              Number(addHouseForm.plotSizeMarla) === size ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {size} M
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Covered Area (Sq Ft) */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Covered Area (Sq Ft) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="10"
                        min="100"
                        value={addHouseForm.coveredAreaSqft}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, coveredAreaSqft: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Standard ACAG 5 Marla model: 1,100 sqft</span>
                    </div>

                    {/* Floors */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Number of Floors
                      </label>
                      <select
                        value={addHouseForm.floors}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, floors: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      >
                        <option value={1}>Single Storey (Ground Floor)</option>
                        <option value={2}>Double Storey (G + 1)</option>
                        <option value={3}>Triple Storey (G + 2)</option>
                      </select>
                    </div>

                    {/* Project / Property Type */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Site Initial Status
                      </label>
                      <select
                        value={addHouseForm.projectType}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, projectType: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      >
                        <option value="UNDER_CONSTRUCTION">Under Construction</option>
                        <option value="VACANT_PLOT">Vacant Plot (New Construction)</option>
                        <option value="COMPLETED_HOME">Completed Home</option>
                      </select>
                    </div>

                    {/* Construction Start Date */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Construction Start Date
                      </label>
                      <input
                        type="date"
                        value={addHouseForm.startDate}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, startDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>

                    {/* Expected Completion Date */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Expected Completion Date
                      </label>
                      <input
                        type="date"
                        value={addHouseForm.expectedCompletionDate}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, expectedCompletionDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LOCATION & GIS INFORMATION */}
              {addHouseTab === 'LOCATION' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <span>Geographic & GIS Coordinates</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Provide accurate latitude & longitude coordinates for interactive GIS monitoring</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleDetectGps}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Compass className="h-3.5 w-3.5" />
                        <span>Detect Live GPS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDistrictChange(addHouseForm.district)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Set District Center</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    {/* Latitude */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Latitude Coordinate (-90 to +90) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        min="-90"
                        max="90"
                        value={addHouseForm.lat}
                        onChange={(e) => {
                          setAddHouseForm({ ...addHouseForm, lat: e.target.value });
                          if (formErrors.lat) setFormErrors({ ...formErrors, lat: '' });
                        }}
                        placeholder="31.5204"
                        required
                        className={`w-full px-3 py-2 text-xs bg-slate-50 border ${
                          formErrors.lat ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200'
                        } rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600`}
                      />
                    </div>

                    {/* Longitude */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Longitude Coordinate (-180 to +180) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        min="-180"
                        max="180"
                        value={addHouseForm.lng}
                        onChange={(e) => {
                          setAddHouseForm({ ...addHouseForm, lng: e.target.value });
                          if (formErrors.lng) setFormErrors({ ...formErrors, lng: '' });
                        }}
                        placeholder="74.3587"
                        required
                        className={`w-full px-3 py-2 text-xs bg-slate-50 border ${
                          formErrors.lng ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200'
                        } rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600`}
                      />
                    </div>
                  </div>

                  {/* GIS Preview Badge Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700 shadow-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black">
                        <MapPin className="h-5 w-5 animate-bounce" />
                      </div>
                      <div>
                        <span className="text-xs font-black block text-emerald-300">GIS Satellite Telemetry Ready</span>
                        <p className="text-[11px] text-slate-300">
                          Target: {addHouseForm.district}, {addHouseForm.division} ({addHouseForm.lat}, {addHouseForm.lng})
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-white/10 text-white font-mono text-xs font-bold">
                      Zoom Scale 1:5000
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: STAGE & ASSIGNED ENGINEER */}
              {addHouseTab === 'CONSTRUCTION' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <HardHat className="h-4 w-4 text-emerald-600" />
                        <span>Engineering Assignment & Stage Tracking</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Assign a field engineer from directory and record current ACAG milestone progress</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    {/* Assigned Engineer */}
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Assigned Field Engineer <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={addHouseForm.engineerId}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, engineerId: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      >
                        <option value="">Unassigned (Assign Later)</option>
                        {engineers.map((eng) => (
                          <option key={eng.id} value={eng.id}>
                            {eng.name} — {eng.pecNo || `PEC-${eng.id}`} ({eng.assignedDivision || eng.assignedDistrict || 'Punjab'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Current Construction Stage */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Current Construction Stage (ACAG 15 Milestones) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={addHouseForm.stage}
                        onChange={(e) => {
                          const newStage = e.target.value;
                          const stageIdx = ACAG_CONSTRUCTION_STAGES.indexOf(newStage);
                          const autoProgress = stageIdx >= 0 ? Math.round(((stageIdx + 1) / 15) * 100) : addHouseForm.progressPct;
                          setAddHouseForm({
                            ...addHouseForm,
                            stage: newStage,
                            progressPct: autoProgress,
                            status: autoProgress >= 100 ? 'Completed' : autoProgress > 0 ? 'Under Construction' : 'Pending',
                          });
                        }}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      >
                        {ACAG_CONSTRUCTION_STAGES.map((stg, i) => (
                          <option key={stg} value={stg}>
                            {i + 1}. {stg}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Overall House Status */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Overall House Status <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={addHouseForm.status}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, status: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      >
                        {HOUSE_STATUSES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    {/* Progress Slider */}
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>Construction Completion Progress:</span>
                        <span className="font-mono text-sm font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                          {addHouseForm.progressPct}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={addHouseForm.progressPct}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, progressPct: Number(e.target.value) })}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-extrabold text-slate-400">
                        <span>0% (Layout / Site Prep)</span>
                        <span>50% (Lintel / Structure)</span>
                        <span>100% (Handover Ready)</span>
                      </div>
                    </div>

                    {/* Stage Start Date */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Stage Start Date
                      </label>
                      <input
                        type="date"
                        value={addHouseForm.stageStartDate}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, stageStartDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>

                    {/* Next Inspection Date */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Next Scheduled Inspection Date
                      </label>
                      <input
                        type="date"
                        value={addHouseForm.nextInspectionDate}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, nextInspectionDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: LOAN & SAFETY INFORMATION */}
              {addHouseTab === 'FINANCE' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-emerald-600" />
                        <span>Bank of Punjab (BOP) Loan & Site Safety</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Record loan approval, tranches disbursed, and initial safety compliance status</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                    {/* Loan Status */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Loan Status
                      </label>
                      <select
                        value={addHouseForm.loanStatus}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, loanStatus: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      >
                        {LOAN_STATUSES.map((ls) => (
                          <option key={ls} value={ls}>{ls}</option>
                        ))}
                      </select>
                    </div>

                    {/* Approved Loan Amount (PKR) */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Approved Loan Amount (PKR)
                      </label>
                      <input
                        type="number"
                        step="50000"
                        min="0"
                        value={addHouseForm.loanApproved}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, loanApproved: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>

                    {/* Disbursed Amount (PKR) */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Disbursed Loan Amount (PKR)
                      </label>
                      <input
                        type="number"
                        step="50000"
                        min="0"
                        value={addHouseForm.loanDisbursed}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, loanDisbursed: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>

                    {/* Remaining Loan Balance (Calculated) */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Remaining Loan Balance (PKR)
                      </label>
                      <div className="px-3 py-2 text-xs bg-emerald-50 border border-emerald-200 rounded-xl font-mono font-black text-emerald-800">
                        PKR {Math.max(0, Number(addHouseForm.loanApproved || 0) - Number(addHouseForm.loanDisbursed || 0)).toLocaleString()}
                      </div>
                    </div>

                    {/* Loan Application Date */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Loan Application Date
                      </label>
                      <input
                        type="date"
                        value={addHouseForm.loanApplicationDate}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, loanApplicationDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>

                    {/* Safety Status */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Site Safety Condition
                      </label>
                      <select
                        value={addHouseForm.safetyStatus}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, safetyStatus: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      >
                        {SAFETY_STATUSES.map((ss) => (
                          <option key={ss} value={ss}>{ss}</option>
                        ))}
                      </select>
                    </div>

                    {/* Open Safety Issues */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Open Safety Issues Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={addHouseForm.openSafetyIssues}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, openSafetyIssues: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>

                    {/* Last Safety Inspection Date */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Last Safety Inspection Date
                      </label>
                      <input
                        type="date"
                        value={addHouseForm.lastSafetyInspection}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, lastSafetyInspection: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Safety & General Remarks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Safety Remarks / HSE Checklist Notes
                      </label>
                      <textarea
                        value={addHouseForm.safetyRemarks}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, safetyRemarks: e.target.value })}
                        placeholder="e.g. Scaffolding securely clamped; workers provided hard hats."
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        General Inspection / Admin Remarks
                      </label>
                      <textarea
                        value={addHouseForm.remarks}
                        onChange={(e) => setAddHouseForm({ ...addHouseForm, remarks: e.target.value })}
                        placeholder="e.g. Beneficiary verified with local revenue department."
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 shrink-0">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {addHouseTab !== 'BASIC' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (addHouseTab === 'SPECS') setAddHouseTab('BASIC');
                        if (addHouseTab === 'LOCATION') setAddHouseTab('SPECS');
                        if (addHouseTab === 'CONSTRUCTION') setAddHouseTab('LOCATION');
                        if (addHouseTab === 'FINANCE') setAddHouseTab('CONSTRUCTION');
                      }}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                    >
                      ← Back
                    </button>
                  )}

                  {addHouseTab !== 'FINANCE' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (addHouseTab === 'BASIC') setAddHouseTab('SPECS');
                        if (addHouseTab === 'SPECS') setAddHouseTab('LOCATION');
                        if (addHouseTab === 'LOCATION') setAddHouseTab('CONSTRUCTION');
                        if (addHouseTab === 'CONSTRUCTION') setAddHouseTab('FINANCE');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                    >
                      Next Step →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddHouseModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md shadow-emerald-500/25 flex items-center gap-2 transition cursor-pointer ${
                      isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving House to Database...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Save House to Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXCEL / CSV BULK IMPORT MODAL                                             */}
      {/* ========================================================================= */}
      {isUploadExcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20">
                  <FileSpreadsheet className="h-6 w-6 text-blue-200" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                    <span>Bulk House Upload (Excel / CSV)</span>
                    <span className="text-[10px] uppercase font-extrabold bg-blue-500/40 text-blue-100 px-2 py-0.5 rounded-full border border-blue-400/30">
                      Auto-ID Generation
                    </span>
                  </h2>
                  <p className="text-xs text-blue-100 font-medium">
                    Upload ACAG housing datasets, validate records, detect duplicates, and import with automatic sequential House IDs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Download CSV / Excel template"
                >
                  <FileDown className="h-4 w-4 text-blue-200" />
                  <span className="hidden sm:inline">Download Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsUploadExcelModalOpen(false)}
                  className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
              {/* VIEW 1: IMPORT SUMMARY RESULT */}
              {importSummary ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Success Banner */}
                  <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-200 p-5 rounded-3xl flex items-center gap-4">
                    <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-600/30">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-black text-emerald-950">
                        Bulk Import Operation Completed!
                      </h3>
                      <p className="text-xs text-emerald-800 font-medium mt-0.5">
                        {importSummary.successful_count} house records have been created in the database with sequential House IDs and milestone tracking.
                      </p>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">Total Rows</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">{importSummary.total_rows || 0}</p>
                    </div>

                    <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
                      <p className="text-[11px] font-bold text-emerald-700 uppercase">Successfully Imported</p>
                      <p className="text-2xl font-black text-emerald-700 mt-1">{importSummary.successful_count || 0}</p>
                    </div>

                    <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 shadow-2xs">
                      <p className="text-[11px] font-bold text-amber-700 uppercase">Duplicate Records</p>
                      <p className="text-2xl font-black text-amber-700 mt-1">{importSummary.duplicate_count || 0}</p>
                    </div>

                    <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200 shadow-2xs">
                      <p className="text-[11px] font-bold text-rose-700 uppercase">Failed / Invalid</p>
                      <p className="text-2xl font-black text-rose-700 mt-1">{importSummary.failed_count || 0}</p>
                    </div>
                  </div>

                  {/* Duplicate Records Breakdown */}
                  {importSummary.duplicate_records && importSummary.duplicate_records.length > 0 && (
                    <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-4.5 space-y-2">
                      <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span>Duplicate Records Detected ({importSummary.duplicate_records.length})</span>
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        The following records were skipped because their CNIC or Case ID already exists in the system:
                      </p>
                      <div className="max-h-48 overflow-y-auto rounded-2xl border border-amber-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-amber-100/50 text-[10px] font-black uppercase text-amber-900 sticky top-0">
                            <tr>
                              <th className="p-2.5">Row</th>
                              <th className="p-2.5">Owner Name</th>
                              <th className="p-2.5">CNIC</th>
                              <th className="p-2.5">Existing House ID</th>
                              <th className="p-2.5">Reason</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-100 text-slate-800">
                            {importSummary.duplicate_records.map((dup, idx) => (
                              <tr key={idx} className="hover:bg-amber-50/50">
                                <td className="p-2.5 font-bold">#{dup.row_index}</td>
                                <td className="p-2.5 font-medium">{dup.owner_name}</td>
                                <td className="p-2.5 font-mono text-slate-600">{dup.cnic}</td>
                                <td className="p-2.5 font-bold text-amber-700">{dup.existing_house_id || 'System Match'}</td>
                                <td className="p-2.5 text-[11px] text-slate-600">{dup.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Failed Rows Breakdown */}
                  {importSummary.failed_records && importSummary.failed_records.length > 0 && (
                    <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-4.5 space-y-2">
                      <h4 className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                        <XCircle className="h-4 w-4 text-rose-600" />
                        <span>Failed / Invalid Rows ({importSummary.failed_records.length})</span>
                      </h4>
                      <div className="max-h-48 overflow-y-auto rounded-2xl border border-rose-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-rose-100/50 text-[10px] font-black uppercase text-rose-900 sticky top-0">
                            <tr>
                              <th className="p-2.5">Row</th>
                              <th className="p-2.5">Owner Name</th>
                              <th className="p-2.5">CNIC</th>
                              <th className="p-2.5">Failure Reason</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-rose-100 text-slate-800">
                            {importSummary.failed_records.map((fail, idx) => (
                              <tr key={idx} className="hover:bg-rose-50/50">
                                <td className="p-2.5 font-bold">#{fail.row_index}</td>
                                <td className="p-2.5 font-medium">{fail.owner_name}</td>
                                <td className="p-2.5 font-mono text-slate-600">{fail.cnic}</td>
                                <td className="p-2.5 text-[11px] text-rose-700 font-bold">{fail.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Newly Imported Records Table */}
                  {importSummary.imported_houses && importSummary.imported_houses.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        <span>Newly Registered Houses ({importSummary.imported_houses.length})</span>
                      </h4>
                      <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100/80 text-[10px] font-black uppercase text-slate-700 sticky top-0">
                            <tr>
                              <th className="p-2.5">Auto House ID</th>
                              <th className="p-2.5">Owner Name</th>
                              <th className="p-2.5">District / Tehsil</th>
                              <th className="p-2.5">Stage & Progress</th>
                              <th className="p-2.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-800">
                            {importSummary.imported_houses.map((h, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2.5 font-mono font-black text-emerald-700">{h.case_id || h.id}</td>
                                <td className="p-2.5 font-bold text-slate-900">{h.owner_name}</td>
                                <td className="p-2.5 text-slate-600">{h.district} {h.tehsil ? `• ${h.tehsil}` : ''}</td>
                                <td className="p-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-700">{h.current_stage || 'Site Prep'}</span>
                                    <span className="text-[10px] font-bold text-slate-500">({h.overall_progress_pct || 0}%)</span>
                                  </div>
                                </td>
                                <td className="p-2.5">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                                    {h.status || 'Under Construction'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* VIEW 2: UPLOAD & PREVIEW */
                <div className="space-y-5">
                  {/* File Upload Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
                      selectedFile
                        ? 'border-blue-500 bg-blue-50/40 hover:bg-blue-50/60'
                        : 'border-slate-300 bg-white hover:border-blue-500 hover:bg-slate-50/80'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-3xl shadow-lg shadow-blue-500/25">
                      <UploadCloud className="h-8 w-8" />
                    </div>

                    {selectedFile ? (
                      <div className="space-y-1">
                        <p className="text-sm font-black text-blue-950 flex items-center justify-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                          <span>{selectedFile.name}</span>
                          <span className="text-xs font-medium text-slate-500">
                            ({(selectedFile.size / 1024).toFixed(1)} KB)
                          </span>
                        </p>
                        <p className="text-xs text-blue-700 font-semibold">
                          Click to select a different Excel or CSV file
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-800">
                          Click to browse or drag and drop your Excel / CSV file here
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Supports Microsoft Excel (<code className="text-blue-600">.xlsx</code>, <code className="text-blue-600">.xls</code>) and CSV (<code className="text-blue-600">.csv</code>) formats
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Requirements & Instructions Card */}
                  {!selectedFile && (
                    <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Info className="h-4 w-4 text-blue-600" />
                          <span>Import Guidelines & Specifications</span>
                        </h4>
                        <button
                          type="button"
                          onClick={handleDownloadTemplate}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download ACAG Excel Template</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-black text-[10px]">
                            1
                          </div>
                          <div>
                            <p className="font-black text-slate-800">Auto-Generated House IDs</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">
                              You do <span className="font-bold text-slate-700">NOT</span> need to provide House IDs. The system will sequentially assign unique IDs (e.g. <code className="text-emerald-700 font-bold">ACAG-000001</code>).
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-black text-[10px]">
                            2
                          </div>
                          <div>
                            <p className="font-black text-slate-800">Required Columns</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">
                              <span className="font-bold text-slate-700">Owner Name</span> and <span className="font-bold text-slate-700">District</span> are required. CNIC should be 13 digits.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="h-5 w-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-black text-[10px]">
                            3
                          </div>
                          <div>
                            <p className="font-black text-slate-800">Duplicate Detection</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">
                              Existing CNICs or House IDs are flagged as duplicates and skipped to preserve data integrity.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="h-5 w-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-black text-[10px]">
                            4
                          </div>
                          <div>
                            <p className="font-black text-slate-800">GIS & Location Ready</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">
                              Latitude/Longitude coordinates are validated and immediately plotted on the GIS monitoring map.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pre-Validation Table & Counts */}
                  {selectedFile && (
                    <div className="space-y-4">
                      {/* Status Badges Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2">
                          {[
                            { id: 'ALL', label: 'All Rows', count: parsedRows.length, color: 'text-slate-700 bg-slate-100' },
                            { id: 'VALID', label: 'Valid to Import', count: parsedRows.filter((r) => r.isValid).length, color: 'text-emerald-700 bg-emerald-100' },
                            { id: 'DUPLICATES', label: 'Duplicates', count: parsedRows.filter((r) => r.isDuplicate).length, color: 'text-amber-700 bg-amber-100' },
                            { id: 'ERRORS', label: 'Errors / Invalid', count: parsedRows.filter((r) => !r.isValid && !r.isDuplicate).length, color: 'text-rose-700 bg-rose-100' },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setUploadFilterTab(tab.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                                uploadFilterTab === tab.id
                                  ? 'bg-slate-900 text-white shadow-xs'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span>{tab.label}</span>
                              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${tab.color}`}>
                                {tab.count}
                              </span>
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setParsedRows([]);
                          }}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Clear File</span>
                        </button>
                      </div>

                      {/* Scrollable Preview Table */}
                      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
                        <div className="max-h-72 overflow-y-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100/90 text-[10px] font-black uppercase text-slate-700 sticky top-0 z-10 border-b border-slate-200">
                              <tr>
                                <th className="p-3">#</th>
                                <th className="p-3">Validation Status</th>
                                <th className="p-3">Owner Name</th>
                                <th className="p-3">CNIC</th>
                                <th className="p-3">District / Tehsil</th>
                                <th className="p-3">Stage & Progress</th>
                                <th className="p-3">Coordinates (GIS)</th>
                                <th className="p-3">Assigned Engineer</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                              {parsedRows
                                .filter((r) => {
                                  if (uploadFilterTab === 'VALID') return r.isValid;
                                  if (uploadFilterTab === 'DUPLICATES') return r.isDuplicate;
                                  if (uploadFilterTab === 'ERRORS') return !r.isValid && !r.isDuplicate;
                                  return true;
                                })
                                .map((row) => (
                                  <tr
                                    key={row.rowIndex}
                                    className={`hover:bg-slate-50/80 transition ${
                                      row.isDuplicate
                                        ? 'bg-amber-50/30'
                                        : !row.isValid
                                        ? 'bg-rose-50/30'
                                        : ''
                                    }`}
                                  >
                                    <td className="p-3 font-bold text-slate-400">#{row.rowIndex}</td>
                                    <td className="p-3">
                                      {row.isValid ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                          <span>Ready to Import</span>
                                        </span>
                                      ) : row.isDuplicate ? (
                                        <div className="space-y-0.5">
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                                            <AlertTriangle className="h-3 w-3 text-amber-600" />
                                            <span>Duplicate Record</span>
                                          </span>
                                          <p className="text-[10px] text-amber-700 font-medium">{row.duplicateReason}</p>
                                        </div>
                                      ) : (
                                        <div className="space-y-0.5">
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                            <XCircle className="h-3 w-3 text-rose-600" />
                                            <span>Invalid</span>
                                          </span>
                                          <p className="text-[10px] text-rose-700 font-medium">
                                            {row.errors.join(', ')}
                                          </p>
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3 font-bold text-slate-900">{row.ownerName || '(Missing)'}</td>
                                    <td className="p-3 font-mono text-slate-600">{row.cnic || '—'}</td>
                                    <td className="p-3 text-slate-700">
                                      {row.district} <span className="text-slate-400">({row.tehsil})</span>
                                    </td>
                                    <td className="p-3">
                                      <span className="font-semibold text-slate-800">{row.stage}</span>
                                      <span className="text-[10px] font-bold text-slate-500 ml-1.5">
                                        ({row.progress}%)
                                      </span>
                                    </td>
                                    <td className="p-3 font-mono text-[11px] text-slate-600">
                                      {row.lat.toFixed(4)}, {row.lng.toFixed(4)}
                                    </td>
                                    <td className="p-3 font-medium text-slate-700">{row.engineer}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              {importSummary ? (
                <div className="flex items-center justify-between w-full">
                  <p className="text-xs text-slate-500 font-medium">
                    Import completed. Records are now active in the dashboard.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadExcelModalOpen(false);
                      setImportSummary(null);
                      setSelectedFile(null);
                      setParsedRows([]);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>View Houses in Dashboard Table</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUploadExcelModalOpen(false);
                        setSelectedFile(null);
                        setParsedRows([]);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      disabled={!selectedFile || isImporting || parsedRows.filter((r) => r.isValid).length === 0}
                      onClick={handleExecuteImport}
                      className={`px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/25 flex items-center gap-2 transition cursor-pointer ${
                        !selectedFile || isImporting || parsedRows.filter((r) => r.isValid).length === 0
                          ? 'opacity-50 cursor-not-allowed'
                          : 'active:scale-95'
                      }`}
                    >
                      {isImporting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Importing Records to Database...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>
                            Start Bulk Import ({parsedRows.filter((r) => r.isValid).length} Valid Records)
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

