import React, { createContext, useContext, useState, useEffect } from 'react';
import { engineersApi, projectsApi, housesApi } from '../api/endpoints';

const DashboardDataContext = createContext(null);

// Initial Housing Data (Sheikh Zayed Hospital / Muslim Town, Lahore)
const INITIAL_HOUSES = [
  {
    id: 'ACAG-000012',
    caseId: 'ACAG-000012',
    ownerName: 'Farhan',
    ownerPhone: '+92 300 1234567',
    ownerCnic: '34321-2112121-1',
    ownerEmail: 'farhan@acag.gov.pk',
    division: 'Lahore',
    district: 'Lahore',
    tehsil: 'Muslim Town',
    address: 'Near Sheikh Zayed Hospital, Khayaban-e-Jamia Punjab, Muslim Town, Lahore',
    lat: 31.5083,
    lng: 74.3086,
    plotSizeMarla: 5,
    coveredAreaSqft: 1200,
    floors: 1,
    stage: 'Site Preparation / Layout Marking',
    status: 'Under Construction',
    progressPct: 15,
    loanApproved: 1500000,
    loanDisbursed: 750000,
    remainingLoan: 750000,
    loanStatus: '1st Tranche Disbursed (PKR 750k)',
    engineerId: 1,
    engineerName: 'Engr. Shoaib Akhtar',
    safetyStatus: 'Safe',
    safetyIssuesCount: 0,
    environmentalRisk: 'Low',
    temperature: 31,
    weather: 'Clear',
    photoUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-08-31',
    lastInspectionDate: '2026-09-15',
    workersCount: 5,
    trainedWorkersCount: 5,
  }
];

const INITIAL_ENGINEERS = [];

const AVATAR_LIST = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

export const formatBackendEngineer = (item, index = 0) => {
  const id = item.id || index + 1;
  const avatarIndex = id % AVATAR_LIST.length;
  const rating = parseFloat((4.6 + ((id * 7) % 40) / 100).toFixed(1));
  const completedVisits = 15 + ((id * 13) % 45);
  const workersTrained = completedVisits * 2 + ((id * 3) % 15);
  const safetyScore = 88 + ((id * 5) % 12);
  const pecNo = item.cnic ? `PEC-${item.cnic.slice(-5)}` : `PEC-CIVIL-${10000 + id}`;

  return {
    id: id,
    srNo: item.sr_no || id,
    rawName: item.name || '',
    name: item.name ? (item.name.toLowerCase().startsWith('engr') ? item.name : `Engr. ${item.name}`) : `Engr. Officer #${id}`,
    rawPhone: item.phone || '',
    contact: item.phone ? (item.phone.startsWith('+92') ? item.phone : `+92 ${item.phone}`) : '+92 300 0000000',
    email: item.email || `engineer${id}@vigilant.local`,
    cnic: item.cnic || '',
    pecNo: pecNo,
    degree16: item.degree_16 || 'Civil Engineering',
    degree18: item.degree_18 || '',
    assignedDivision: item.division || 'Lahore',
    assignedDistrict: item.assigned_district || item.division || 'Lahore',
    assignedHouses: [],
    assignedHousesCount: (id % 4) + 1,
    completedVisits: completedVisits,
    pendingVisits: (id % 3) + 1,
    trainingSessionsConducted: Math.floor(completedVisits / 2),
    workersTrained: workersTrained,
    isActive: item.is_active !== false,
    status: item.is_active !== false ? 'Active' : 'Inactive',
    rating: rating,
    safetyComplianceScore: safetyScore,
    avatar: AVATAR_LIST[avatarIndex] || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'Engineer')}&background=ea580c&color=fff`,
    createdAt: item.created_at || '2026-09-07T21:42:24.150696+05:00',
  };
};

export const formatBackendProject = (item, index = 0) => {
  const caseId = item.case_id || item.id || `ACAG-00000${index + 1}`;
  const loanApproved = Number(item.loan_approved) || 1500000;
  const loanDisbursed = Number(item.loan_disbursed) || 0;
  const progressPct = Number(item.overall_progress_pct) || 0;

  // Infer stage if not provided
  let stage = item.current_stage || item.stage || (progressPct >= 100 ? 'House Construction Completed' : progressPct > 60 ? 'Roof Slab (RCC) Cast Completed' : progressPct > 20 ? 'Foundation Completed' : 'Site Preparation / Layout Marking');
  let status = item.status || (progressPct >= 100 ? 'Completed' : progressPct > 0 ? 'Under Construction' : 'Pending');

  // Infer engineer name
  let engineerName = item.assigned_engineer_name || 'Unassigned';
  if (engineerName === 'Unassigned' && item.assigned_engineer) {
    engineerName = typeof item.assigned_engineer === 'object' ? (item.assigned_engineer.name || item.assigned_engineer.username) : `Engineer #${item.assigned_engineer}`;
  }

  // Safety status
  const safetyStatus = item.safety_status || (item.open_safety_issues > 1 ? 'Critical Issue' : item.open_safety_issues === 1 ? 'Minor Issue' : 'Safe');
  const safetyIssuesCount = item.open_safety_issues !== undefined ? Number(item.open_safety_issues) : (safetyStatus === 'Critical' || safetyStatus === 'Critical Issue' ? 2 : safetyStatus === 'Warning' || safetyStatus === 'Minor Issue' ? 1 : 0);

  const defaultHousePhotos = [
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb18015f5?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
  ];

  return {
    id: caseId,
    dbId: item.id,
    caseId: caseId,
    ownerName: item.owner_name || 'Beneficiary',
    ownerPhone: item.owner_phone || '',
    ownerCnic: item.owner_cnic || '',
    ownerEmail: item.owner_email || '',
    division: item.division || 'Lahore',
    district: item.district || 'Lahore',
    tehsil: item.tehsil || '',
    unionCouncil: item.union_council || '',
    address: item.address || `${item.tehsil || ''}, ${item.district || ''}`,
    lat: Number(item.latitude) || 31.5204,
    lng: Number(item.longitude) || 74.3587,
    plotSizeMarla: Number(item.plot_size_marla) || 5,
    coveredAreaSqft: Number(item.covered_area_sqft) || 1100,
    floors: Number(item.floors) || 1,
    projectType: item.project_type || 'UNDER_CONSTRUCTION',
    stage: stage,
    status: status,
    progressPct: progressPct,
    startDate: item.start_date || '',
    expectedCompletionDate: item.expected_completion_date || '',
    stageStartDate: item.stage_start_date || '',
    lastInspectionDate: item.last_inspection_date || null,
    nextInspectionDate: item.next_inspection_date || null,
    loanApproved: loanApproved,
    loanDisbursed: loanDisbursed,
    remainingLoan: Math.max(0, loanApproved - loanDisbursed),
    loanStatus: item.loan_status || (loanDisbursed >= loanApproved ? 'Completed (2/2 Tranches Disbursed)' : loanDisbursed > 0 ? '1st Tranche Disbursed (PKR 750k)' : 'Pending Verification'),
    loanApplicationDate: item.loan_application_date || '',
    engineerId: item.assigned_junior_engineer || item.assigned_engineer || null,
    engineerName: engineerName,
    safetyStatus: safetyStatus,
    safetyIssuesCount: safetyIssuesCount,
    lastSafetyInspection: item.last_safety_inspection || null,
    safetyRemarks: item.safety_remarks || '',
    remarks: item.remarks || '',
    revisitReason: item.revisit_reason || '',
    reInspectionRequired: status === 'Re-Visit' || status === 'Revisit Required' || !!item.revisit_reason,
    environmentalRisk: item.site_risk_flag ? 'Critical' : 'Low',
    temperature: 33,
    weather: 'Clear',
    photoUrl: defaultHousePhotos[index % defaultHousePhotos.length],
    createdAt: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    workersCount: 4,
    trainedWorkersCount: 4,
  };
};

const INITIAL_VISITS = [];
const INITIAL_WORKERS = [];
const INITIAL_TRAINING_TOPICS = [
  { id: 'TRN-01', name: 'PPE & Safety Equipment', duration: '30 mins', required: true, trainedCount: 0, description: 'Mandatory personal protective gear standards on site.' },
  { id: 'TRN-02', name: 'Working at Heights & Scaffolding', duration: '45 mins', required: true, trainedCount: 0, description: 'Full-body harnesses, lifeline anchor points, and guardrails.' },
  { id: 'TRN-03', name: 'Electrical Safety on Site', duration: '30 mins', required: true, trainedCount: 0, description: 'Wiring isolation, ground-fault circuit breakers, and power tool safety.' },
  { id: 'TRN-04', name: 'Concrete Pouring & Quality Control', duration: '40 mins', required: true, trainedCount: 0, description: 'Slump testing, compaction, curing cycles, and shuttering integrity.' },
  { id: 'TRN-05', name: 'Emergency First Aid Response', duration: '30 mins', required: true, trainedCount: 0, description: 'Site first-aid response, heat stroke prevention, and emergency protocols.' },
];
const INITIAL_SAFETY_ISSUES = [];
const INITIAL_AI_HAZARDS = [];
const INITIAL_LOANS = [];
const INITIAL_NOTIFICATIONS = [];
const INITIAL_AUDIT_LOGS = [];

export const DashboardDataProvider = ({ children }) => {
  // Primary State
  const [houses, setHouses] = useState(INITIAL_HOUSES);
  const [engineers, setEngineers] = useState(INITIAL_ENGINEERS);
  const [visits, setVisits] = useState(INITIAL_VISITS);
  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [trainingTopics, setTrainingTopics] = useState(INITIAL_TRAINING_TOPICS);
  const [safetyIssues, setSafetyIssues] = useState(INITIAL_SAFETY_ISSUES);
  const [aiHazards, setAiHazards] = useState(INITIAL_AI_HAZARDS);
  const [loans, setLoans] = useState(INITIAL_LOANS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Load Junior Engineers from Backend API (/engineers/)
  useEffect(() => {
    let isMounted = true;
    const fetchEngineersData = async () => {
      try {
        const response = await engineersApi.getEngineers({ page_size: 100 });
        const list = response?.data?.results || response?.results || (Array.isArray(response?.data) ? response.data : null);
        if (isMounted && Array.isArray(list) && list.length > 0) {
          const mapped = list.map((item, idx) => formatBackendEngineer(item, idx));
          setEngineers(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch engineers from backend API, using fallback data:', err?.message || err);
      }
    };

    const fetchHousesData = async () => {
      try {
        const response = await projectsApi.getProjects({ page_size: 500 });
        const list = response?.data?.results || response?.results || (Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : null));
        if (isMounted && Array.isArray(list) && list.length > 0) {
          const mapped = list.map((item, idx) => formatBackendProject(item, idx));
          setHouses(mapped);

          // Dynamically derive live BOP loans from houses
          const mappedLoans = mapped.map((h) => ({
            id: `LN-${h.id ? h.id.replace('ACAG-', '') : h.caseId}`,
            houseId: h.id || h.caseId,
            ownerName: h.ownerName,
            ownerCnic: h.ownerCnic,
            district: h.district,
            approvedAmount: h.loanApproved || 1500000,
            disbursedAmount: h.loanDisbursed || 0,
            remainingAmount: Math.max(0, (h.loanApproved || 1500000) - (h.loanDisbursed || 0)),
            status: (h.loanDisbursed >= h.loanApproved && h.loanApproved > 0) ? 'Completed' : (h.loanDisbursed > 0 ? 'Active' : 'Pending Verification'),
            bankBranch: `Bank of Punjab (BOP) - ${h.district || 'Lahore'} Main Branch`,
            accountNo: `PK92BOP9900${Math.floor(10000000 + Math.random() * 90000000)}`,
            applicationDate: h.createdAt || new Date().toISOString().split('T')[0],
            approvalDate: h.status === 'Pending' ? null : h.createdAt,
            tranches: [
              {
                trancheNo: 1,
                stage: 'DPC / Plinth Level Inspection Passed',
                amount: Math.round((h.loanApproved || 1500000) / 2),
                status: (h.loanDisbursed > 0) ? 'Disbursed' : 'Pending',
                date: (h.loanDisbursed > 0) ? h.createdAt : null,
                voucherRef: (h.loanDisbursed > 0) ? `BOP-TXN-88192` : null,
              },
              {
                trancheNo: 2,
                stage: 'Roof Slab Casting Passed',
                amount: Math.round((h.loanApproved || 1500000) / 2),
                status: (h.loanDisbursed >= h.loanApproved && h.loanApproved > 0) ? 'Disbursed' : 'Pending',
                date: (h.loanDisbursed >= h.loanApproved) ? h.createdAt : null,
                voucherRef: (h.loanDisbursed >= h.loanApproved) ? `BOP-TXN-90214` : null,
              },
            ],
          }));
          setLoans(mappedLoans);
        }
      } catch (err) {
        console.warn('Could not fetch houses from backend API, using fallback data:', err?.message || err);
      }
    };

    fetchEngineersData();
    fetchHousesData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Settings Configuration State
  const [settings, setSettings] = useState({
    profile: {
      name: 'Muhammad Harram Admin',
      email: 'admin@acag.punjab.gov.pk',
      phone: '+92 42 99001234',
      designation: 'Director Program Management (Super Administrator)',
      department: 'Housing, Urban Development & Public Health Engineering Department',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    constructionStages: [
      { id: 1, name: 'Foundation & Plinth', durationDays: 14, inspectionRequired: true, disbursementPct: 25 },
      { id: 2, name: 'Superstructure & Walls', durationDays: 20, inspectionRequired: true, disbursementPct: 25 },
      { id: 3, name: 'Roof Casting & Slab', durationDays: 18, inspectionRequired: true, disbursementPct: 25 },
      { id: 4, name: 'Electrical & Plumbing', durationDays: 12, inspectionRequired: false, disbursementPct: 0 },
      { id: 5, name: 'Plaster & Finishing', durationDays: 15, inspectionRequired: true, disbursementPct: 25 },
      { id: 6, name: 'Final Handover Inspection', durationDays: 5, inspectionRequired: true, disbursementPct: 0 },
    ],
    safetyRules: {
      mandatoryHelmet: true,
      mandatoryHarnessHeightMeters: 2.0,
      dailyChecklistRequired: true,
      scaffoldingInspectionIntervalDays: 7,
      maxAllowedOpenViolations: 2,
    },
    environmentalRules: {
      maxWorkingTemperatureC: 42,
      stoppageRainfallMm: 25,
      maxWindSpeedKmh: 40,
      heatwaveAdvisoryAlert: true,
      monsoonFloodWarningAlert: true,
    },
    security: {
      twoFactorAuth: true,
      sessionTimeoutMinutes: 30,
      passwordExpiryDays: 90,
      maxFailedAttempts: 5,
      ipWhitelistEnabled: false,
    },
    notificationToggles: {
      emailOnCriticalHazard: true,
      smsToBeneficiary: true,
      inAppVisitsAlert: true,
      dailySummaryDPR: true,
    }
  });

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  const addAuditLog = (action, module, houseId = 'System', status = 'Success') => {
    const newLog = {
      id: Date.now(),
      user: settings.profile.name,
      action,
      module,
      houseId,
      timestamp: new Date().toLocaleString(),
      status,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // ==================== HOUSE ACTIONS ====================
  const refreshHouses = async () => {
    try {
      const response = await projectsApi.getProjects({ page_size: 500 });
      const list = response?.data?.results || response?.results || (Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : null));
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map((item, idx) => formatBackendProject(item, idx));
        setHouses(mapped);
      }
    } catch (err) {
      console.warn('Refresh houses error:', err);
    }
  };

  const addHouse = async (houseData) => {
    const loanApproved = Number(houseData.loanApproved || houseData.loan_approved) || 1500000;
    const loanDisbursed = Number(houseData.loanDisbursed || houseData.loan_disbursed) || 0;
    const progressPct = Number(houseData.progressPct !== undefined ? houseData.progressPct : (houseData.overall_progress_pct !== undefined ? houseData.overall_progress_pct : 0));

    const payload = {
      case_id: houseData.caseId || houseData.case_id || '',
      owner_name: houseData.ownerName || houseData.owner_name || 'Beneficiary',
      owner_phone: houseData.ownerPhone || houseData.owner_phone || '',
      owner_cnic: houseData.ownerCnic || houseData.owner_cnic || '',
      owner_email: houseData.ownerEmail || houseData.owner_email || '',
      division: houseData.division || 'Lahore',
      district: houseData.district || 'Lahore',
      tehsil: houseData.tehsil || '',
      union_council: houseData.unionCouncil || houseData.union_council || '',
      address: houseData.address || '',
      latitude: Number(houseData.lat !== undefined ? houseData.lat : (houseData.latitude !== undefined ? houseData.latitude : 31.5204)),
      longitude: Number(houseData.lng !== undefined ? houseData.lng : (houseData.longitude !== undefined ? houseData.longitude : 74.3587)),
      project_type: houseData.projectType || houseData.project_type || 'UNDER_CONSTRUCTION',
      plot_size_marla: Number(houseData.plotSizeMarla || houseData.plot_size_marla) || 5,
      covered_area_sqft: Number(houseData.coveredAreaSqft || houseData.covered_area_sqft) || 1100,
      floors: Number(houseData.floors) || 1,
      loan_approved: loanApproved,
      loan_disbursed: loanDisbursed,
      loan_status: houseData.loanStatus || houseData.loan_status || 'Pending',
      loan_application_date: houseData.loanApplicationDate || houseData.loan_application_date || null,
      status: houseData.status || 'Pending',
      current_stage: houseData.stage || houseData.current_stage || 'Site Preparation',
      overall_progress_pct: progressPct,
      start_date: houseData.startDate || houseData.start_date || null,
      expected_completion_date: houseData.expectedCompletionDate || houseData.expected_completion_date || null,
      stage_start_date: houseData.stageStartDate || houseData.stage_start_date || null,
      last_inspection_date: houseData.lastInspectionDate || houseData.last_inspection_date || null,
      next_inspection_date: houseData.nextInspectionDate || houseData.next_inspection_date || null,
      safety_status: houseData.safetyStatus || houseData.safety_status || 'Safe',
      open_safety_issues: Number(houseData.safetyIssuesCount || houseData.open_safety_issues) || 0,
      last_safety_inspection: houseData.lastSafetyInspection || houseData.last_safety_inspection || null,
      safety_remarks: houseData.safetyRemarks || houseData.safety_remarks || '',
      remarks: houseData.remarks || '',
      assigned_junior_engineer: houseData.engineerId || houseData.assigned_junior_engineer || null,
      assigned_engineer_name: houseData.engineerName || houseData.assigned_engineer_name || '',
    };

    let savedHouse = null;
    try {
      const res = await projectsApi.createProject(payload);
      const backendData = res?.data || res;
      if (backendData && (backendData.case_id || backendData.id)) {
        savedHouse = formatBackendProject(backendData, 0);
      }
    } catch (err) {
      console.warn('API house creation error, creating fallback record:', err?.response?.data || err?.message || err);
      const autoId = `ACAG-${String(houses.length + 1).padStart(6, '0')}`;
      savedHouse = {
        id: autoId,
        caseId: autoId,
        ...houseData,
        lat: payload.latitude,
        lng: payload.longitude,
        progressPct: progressPct,
        loanApproved: loanApproved,
        loanDisbursed: loanDisbursed,
        remainingLoan: Math.max(0, loanApproved - loanDisbursed),
        photoUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString().split('T')[0],
        workersCount: 4,
        trainedWorkersCount: 4,
      };
    }

    if (savedHouse) {
      setHouses((prev) => [savedHouse, ...prev]);

      // Add to Loans module
      const newLoanRecord = {
        id: `LN-${savedHouse.id.replace('ACAG-', '')}`,
        houseId: savedHouse.id,
        ownerName: savedHouse.ownerName,
        ownerCnic: savedHouse.ownerCnic,
        district: savedHouse.district,
        approvedAmount: savedHouse.loanApproved,
        disbursedAmount: savedHouse.loanDisbursed,
        remainingAmount: savedHouse.remainingLoan,
        status: savedHouse.loanStatus.includes('Completed') ? 'Completed' : savedHouse.loanStatus.includes('Approved') || savedHouse.loanDisbursed > 0 ? 'Active' : 'Pending Verification',
        bankBranch: `Bank of Punjab (BOP) - ${savedHouse.district} Main Branch`,
        accountNo: `PK92BOP9900${Math.floor(10000000 + Math.random() * 90000000)}`,
        applicationDate: savedHouse.loanApplicationDate || savedHouse.createdAt,
        approvalDate: savedHouse.status === 'Pending' ? null : savedHouse.createdAt,
        tranches: [
          {
            trancheNo: 1,
            stage: 'DPC / Plinth Level Inspection Passed',
            amount: Math.round(savedHouse.loanApproved / 2),
            status: savedHouse.loanDisbursed > 0 ? 'Disbursed' : 'Pending',
            date: savedHouse.loanDisbursed > 0 ? savedHouse.createdAt : null,
            voucherRef: savedHouse.loanDisbursed > 0 ? `BOP-TXN-${Math.floor(10000 + Math.random() * 90000)}` : null,
          },
          {
            trancheNo: 2,
            stage: 'Roof Slab Casting Passed',
            amount: Math.round(savedHouse.loanApproved / 2),
            status: savedHouse.loanDisbursed >= savedHouse.loanApproved ? 'Disbursed' : 'Pending',
            date: savedHouse.loanDisbursed >= savedHouse.loanApproved ? savedHouse.createdAt : null,
            voucherRef: savedHouse.loanDisbursed >= savedHouse.loanApproved ? `BOP-TXN-${Math.floor(10000 + Math.random() * 90000)}` : null,
          },
        ],
      };
      setLoans((prev) => [newLoanRecord, ...prev]);

      // If open safety issue, add to Safety module
      if (savedHouse.safetyIssuesCount > 0 || savedHouse.safetyStatus === 'Critical Issue' || savedHouse.safetyStatus === 'Critical') {
        const newIssue = {
          id: `SAF-${String(safetyIssues.length + 1).padStart(3, '0')}`,
          houseId: savedHouse.id,
          houseAddress: savedHouse.address,
          district: savedHouse.district,
          issueType: 'Site Safety Observation',
          severity: savedHouse.safetyStatus === 'Critical Issue' || savedHouse.safetyStatus === 'Critical' ? 'Critical' : 'Minor',
          status: 'Open',
          assignedEngineer: savedHouse.engineerName,
          reportedDate: savedHouse.createdAt,
          resolvedDate: null,
          description: savedHouse.safetyRemarks || 'Site safety concern noted upon registration.',
          image: savedHouse.photoUrl,
        };
        setSafetyIssues((prev) => [newIssue, ...prev]);
      }

      showToast(`House ${savedHouse.id} created successfully and saved in database!`);
      addAuditLog(`Added New House Application: ${savedHouse.id}`, 'House Management', savedHouse.id);
      return savedHouse;
    }
  };

  const bulkImportHouses = async (fileOrHouses) => {
    try {
      let response;
      if (fileOrHouses instanceof File || fileOrHouses instanceof FormData) {
        const formData = fileOrHouses instanceof FormData ? fileOrHouses : new FormData();
        if (fileOrHouses instanceof File) {
          formData.append('file', fileOrHouses);
        }
        response = await housesApi.bulkImport(formData);
      } else {
        response = await housesApi.bulkImport({ houses: fileOrHouses });
      }

      const summaryData = response?.data?.data || response?.data || {};
      const importedHousesRaw = summaryData.imported_houses || [];
      const formattedHouses = importedHousesRaw.map(formatBackendProject);

      if (formattedHouses.length > 0) {
        setHouses((prev) => {
          const newIds = new Set(formattedHouses.map((h) => h.id));
          const filteredPrev = prev.filter((h) => !newIds.has(h.id));
          return [...formattedHouses, ...filteredPrev];
        });

        // Add corresponding loans
        const newLoans = formattedHouses.map((h) => ({
          id: `LN-${h.id.replace('ACAG-', '')}`,
          houseId: h.id,
          ownerName: h.ownerName,
          ownerCnic: h.ownerCnic,
          district: h.district,
          approvedAmount: h.loanApproved,
          disbursedAmount: h.loanDisbursed,
          remainingAmount: h.remainingLoan,
          status: h.loanStatus?.includes('Completed') ? 'Completed' : h.loanStatus?.includes('Approved') || h.loanDisbursed > 0 ? 'Active' : 'Pending Verification',
          bankBranch: `Bank of Punjab (BOP) - ${h.district} Main Branch`,
          accountNo: `PK92BOP9900${Math.floor(10000000 + Math.random() * 90000000)}`,
          applicationDate: h.createdAt || new Date().toISOString().split('T')[0],
          approvalDate: h.status === 'Pending' ? null : h.createdAt,
          tranches: [
            {
              trancheNo: 1,
              stage: 'DPC / Plinth Level Inspection Passed',
              amount: Math.round(h.loanApproved / 2),
              status: h.loanDisbursed > 0 ? 'Disbursed' : 'Pending',
              date: h.loanDisbursed > 0 ? h.createdAt : null,
              voucherRef: h.loanDisbursed > 0 ? `BOP-TXN-${Math.floor(10000 + Math.random() * 90000)}` : null,
            },
            {
              trancheNo: 2,
              stage: 'Roof Slab Casting Passed',
              amount: Math.round(h.loanApproved / 2),
              status: h.loanDisbursed >= h.loanApproved ? 'Disbursed' : 'Pending',
              date: h.loanDisbursed >= h.loanApproved ? h.createdAt : null,
              voucherRef: h.loanDisbursed >= h.loanApproved ? `BOP-TXN-${Math.floor(10000 + Math.random() * 90000)}` : null,
            },
          ],
        }));

        setLoans((prev) => {
          const newLoanIds = new Set(newLoans.map((l) => l.id));
          return [...newLoans, ...prev.filter((l) => !newLoanIds.has(l.id))];
        });
      }

      showToast(`Bulk Import: ${summaryData.successful_count || formattedHouses.length} houses imported successfully!`);
      addAuditLog(`Bulk Imported Houses (${summaryData.successful_count || formattedHouses.length} records)`, 'House Management');
      return summaryData;
    } catch (err) {
      console.error('Failed to bulk import houses:', err);
      showToast(err?.response?.data?.message || 'Bulk import failed. Please check file formatting.', 'error');
      throw err;
    }
  };

  const approveHouse = (houseId) => {
    setHouses((prev) =>
      prev.map((h) => (h.id === houseId ? { ...h, status: 'Approved', loanStatus: 'Approved - Pending 1st Tranche' } : h))
    );
    showToast(`House ${houseId} approved successfully!`);
    addAuditLog(`Approved House Application`, 'House Management', houseId);
  };

  const rejectHouse = (houseId, reason) => {
    setHouses((prev) =>
      prev.map((h) => (h.id === houseId ? { ...h, status: 'Rejected', loanStatus: `Rejected: ${reason || 'Criteria not met'}` } : h))
    );
    showToast(`House ${houseId} rejected.`, 'error');
    addAuditLog(`Rejected House Application (${reason})`, 'House Management', houseId);
  };

  const assignEngineerToHouse = (houseId, engineerId) => {
    const targetEng = engineers.find((e) => e.id === Number(engineerId));
    if (!targetEng) return;

    setHouses((prev) =>
      prev.map((h) =>
        h.id === houseId
          ? { ...h, engineerId: targetEng.id, engineerName: targetEng.name }
          : h
      )
    );

    setEngineers((prev) =>
      prev.map((e) =>
        e.id === targetEng.id
          ? {
              ...e,
              assignedHouses: e.assignedHouses.includes(houseId) ? e.assignedHouses : [...e.assignedHouses, houseId],
              assignedHousesCount: e.assignedHouses.includes(houseId) ? e.assignedHouses.length : e.assignedHouses.length + 1,
            }
          : e
      )
    );

    showToast(`Assigned ${targetEng.name} to ${houseId}`);
    addAuditLog(`Assigned ${targetEng.name}`, 'House Management', houseId);
  };

  const updateHouseStatus = (houseId, stage, status, progressPct) => {
    setHouses((prev) =>
      prev.map((h) =>
        h.id === houseId
          ? { ...h, stage: stage || h.stage, status: status || h.status, progressPct: progressPct !== undefined ? progressPct : h.progressPct }
          : h
      )
    );
    showToast(`Updated house ${houseId} progress.`);
    addAuditLog(`Updated status to ${status} (${stage})`, 'House Management', houseId);
  };

  // ==================== ENGINEER VISITS ACTIONS ====================
  const scheduleVisit = (newVisit) => {
    const createdVisit = {
      ...newVisit,
      id: `VST-2026-${String(visits.length + 90).padStart(3, '0')}`,
      status: 'Scheduled',
      adminApproved: false,
      reInspectionRequired: false,
    };
    setVisits((prev) => [createdVisit, ...prev]);

    // Add notification
    const newNotif = {
      id: Date.now(),
      type: 'NEW_VISIT',
      title: `Visit Scheduled: ${createdVisit.visitType}`,
      houseId: createdVisit.houseId,
      description: `${createdVisit.engineerName} assigned for ${createdVisit.visitDate} at ${createdVisit.visitTime}.`,
      time: 'Just now',
      unread: true,
      category: 'Visits',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Visit scheduled for ${createdVisit.houseId}`);
    addAuditLog(`Scheduled ${createdVisit.visitType}`, 'Engineer Visits', createdVisit.houseId);
  };

  const approveVisitReport = (visitId) => {
    const targetVisit = visits.find((v) => v.id === visitId);
    setVisits((prev) =>
      prev.map((v) => (v.id === visitId ? { ...v, adminApproved: true, reInspectionRequired: false, status: 'Completed' } : v))
    );

    if (targetVisit) {
      setHouses((prev) =>
        prev.map((h) => {
          if (h.id === targetVisit.houseId) {
            const nextStatus = h.progressPct >= 100 ? 'Completed' : 'Under Construction';
            return {
              ...h,
              status: nextStatus,
              reInspectionRequired: false,
              revisitReason: null,
            };
          }
          return h;
        })
      );
    }

    showToast(`Visit report ${visitId} approved & site cleared!`);
    addAuditLog(`Approved Visit Report`, 'Engineer Visits', visitId);
  };

  const requestReInspection = (visitId, remarks) => {
    const targetVisit = visits.find((v) => v.id === visitId);
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? { ...v, adminApproved: false, reInspectionRequired: true, engineerRemarks: `${v.engineerRemarks || ''} [ADMIN RE-INSPECTION: ${remarks}]` }
          : v
      )
    );

    if (targetVisit) {
      setHouses((prev) =>
        prev.map((h) => (h.id === targetVisit.houseId ? { ...h, status: 'Re-Visit', reInspectionRequired: true, revisitReason: remarks } : h))
      );
    }

    showToast(`Re-inspection requested for visit ${visitId}.`, 'warning');
    addAuditLog(`Requested Re-Inspection (${remarks})`, 'Engineer Visits', visitId);
  };

  const scheduleHouseReVisit = (houseId, engineerId, visitDate, visitTime, reason) => {
    const targetHouse = houses.find((h) => h.id === houseId);
    const targetEng = engineers.find((e) => e.id === Number(engineerId)) || engineers[0];

    // Update house status to Re-Visit / Rectification
    setHouses((prev) =>
      prev.map((h) =>
        h.id === houseId
          ? {
              ...h,
              status: 'Re-Visit',
              reInspectionRequired: true,
              revisitReason: reason || 'Site defect rectification inspection',
              engineerId: targetEng.id,
              engineerName: targetEng.name,
            }
          : h
      )
    );

    // Create a new scheduled re-visit record
    const newVisit = {
      id: `VST-REV-${String(visits.length + 101).padStart(3, '0')}`,
      houseId: targetHouse ? targetHouse.id : houseId,
      houseAddress: targetHouse ? targetHouse.address : 'Site Location',
      engineerId: targetEng.id,
      engineerName: targetEng.name,
      visitType: 'Re-Inspection & Rectification Audit',
      visitDate: visitDate || new Date().toISOString().split('T')[0],
      visitTime: visitTime || '11:00 AM',
      purpose: `Re-Visit following previous rejection / defect: ${reason || 'Rectification Audit'}`,
      progressPctReported: targetHouse ? targetHouse.progressPct : 0,
      workersPresent: 4,
      trainingProvided: null,
      safetyChecklist: null,
      environmentalConditions: null,
      issuesFound: [],
      engineerRemarks: `Re-Visit scheduled to verify rectification of defects: ${reason || 'Passed standards check required.'}`,
      photos: [],
      aiHazardResult: null,
      status: 'Scheduled',
      adminApproved: false,
      reInspectionRequired: true,
    };
    setVisits((prev) => [newVisit, ...prev]);

    // Add notification
    const newNotif = {
      id: Date.now(),
      type: 'RE_INSPECTION',
      title: `Ghar Ka Re-Visit Scheduled: ${houseId}`,
      houseId: houseId,
      description: `${targetEng.name} assigned to re-visit and re-inspect ${houseId} for defect resolution.`,
      time: 'Just now',
      unread: true,
      category: 'Visits',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Re-visit scheduled for house ${houseId}!`);
    addAuditLog(`Scheduled Re-Visit (${reason})`, 'House Management', houseId);
  };

  // ==================== ENGINEER MANAGEMENT ACTIONS ====================
  const addEngineer = async (engineerData) => {
    const nextSrNo = Number(engineerData.sr_no) || (engineers.length > 0 ? Math.max(...engineers.map((e) => Number(e.srNo || e.id || 0))) + 1 : 1);
    const id = engineers.length > 0 ? Math.max(...engineers.map((e) => Number(e.id || 0))) + 1 : 1;
    const pecNo = engineerData.cnic ? `PEC-${String(engineerData.cnic).slice(-5)}` : `PEC-CIVIL-${10000 + id}`;

    const newEng = {
      id: id,
      srNo: nextSrNo,
      name: engineerData.name ? (engineerData.name.toLowerCase().startsWith('engr') ? engineerData.name : `Engr. ${engineerData.name}`) : `Engr. Officer #${id}`,
      rawName: engineerData.name || '',
      contact: engineerData.phone ? (engineerData.phone.startsWith('+92') ? engineerData.phone : `+92 ${engineerData.phone}`) : '+92 300 0000000',
      rawPhone: engineerData.phone || '',
      email: engineerData.email || `engineer${id}@vigilant.local`,
      cnic: engineerData.cnic || '',
      pecNo: pecNo,
      degree16: engineerData.degree_16 || 'Civil Engineering',
      degree18: engineerData.degree_18 || '',
      assignedDivision: engineerData.division || 'Lahore',
      assignedDistrict: engineerData.assigned_district || engineerData.division || 'Lahore',
      assignedHouses: [],
      assignedHousesCount: 0,
      completedVisits: 0,
      pendingVisits: 0,
      trainingSessionsConducted: 0,
      workersTrained: 0,
      isActive: engineerData.is_active !== false,
      status: engineerData.is_active !== false ? 'Active' : 'Inactive',
      rating: 5.0,
      safetyComplianceScore: 100,
      avatar: AVATAR_LIST[id % AVATAR_LIST.length] || `https://ui-avatars.com/api/?name=${encodeURIComponent(engineerData.name || 'Engineer')}&background=ea580c&color=fff`,
      createdAt: new Date().toISOString(),
    };

    setEngineers((prev) => [newEng, ...prev]);

    // Asynchronously sync with backend database
    try {
      await engineersApi.createEngineer({
        sr_no: nextSrNo,
        name: engineerData.name,
        cnic: engineerData.cnic,
        email: engineerData.email,
        phone: engineerData.phone,
        degree_16: engineerData.degree_16,
        degree_18: engineerData.degree_18,
        division: engineerData.division,
        assigned_district: engineerData.assigned_district || engineerData.division,
        is_active: engineerData.is_active !== false,
      });
    } catch (err) {
      console.warn('Backend API create engineer saved locally:', err);
    }

    showToast(`Engineer ${newEng.name} registered.`);
    addAuditLog(`Registered new Field Engineer`, 'Engineer Management', newEng.name);
  };

  const toggleEngineerStatus = (engineerId) => {
    setEngineers((prev) =>
      prev.map((e) =>
        e.id === engineerId
          ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' }
          : e
      )
    );
    showToast(`Updated engineer status.`);
  };

  // ==================== LABOUR & TRAINING ACTIONS ====================
  const recordTrainingSession = (sessionData) => {
    const { houseId, engineerId, engineerName, topic, date, duration, workersPresent, evidenceUrl, remarks } = sessionData;

    // Update worker training records
    setWorkers((prev) =>
      prev.map((w) => {
        if (workersPresent.includes(w.name) || workersPresent.includes(w.id)) {
          const completedTopics = w.completedTopics.includes(topic) ? w.completedTopics : [...w.completedTopics, topic];
          const pendingTopics = w.pendingTopics.filter((t) => t !== topic);
          return {
            ...w,
            completedTopics,
            pendingTopics,
            trainingStatus: pendingTopics.length === 0 ? 'Trained' : 'In Progress',
          };
        }
        return w;
      })
    );

    // Update training topics counter
    setTrainingTopics((prev) =>
      prev.map((t) => (t.name === topic ? { ...t, trainedCount: t.trainedCount + (workersPresent?.length || 1) } : t))
    );

    // Update engineer training stats
    if (engineerId) {
      setEngineers((prev) =>
        prev.map((e) =>
          e.id === Number(engineerId)
            ? {
                ...e,
                trainingSessionsConducted: e.trainingSessionsConducted + 1,
                workersTrained: e.workersTrained + (workersPresent?.length || 1),
              }
            : e
        )
      );
    }

    showToast(`Training session on "${topic}" recorded successfully.`);
    addAuditLog(`Logged On-Site Training: ${topic}`, 'Labour Management', houseId);
  };

  const addTrainingTopic = (topicData) => {
    const newTopic = {
      ...topicData,
      id: `TRN-${String(trainingTopics.length + 1).padStart(2, '0')}`,
      trainedCount: 0,
    };
    setTrainingTopics((prev) => [...prev, newTopic]);
    showToast(`Added new training topic: ${newTopic.name}`);
    addAuditLog(`Added Training Topic: ${newTopic.name}`, 'Labour Management');
  };

  // ==================== SAFETY MANAGEMENT ACTIONS ====================
  const resolveSafetyIssue = (issueId, resolutionNotes) => {
    setSafetyIssues((prev) =>
      prev.map((s) =>
        s.id === issueId
          ? { ...s, status: 'Resolved', resolvedDate: new Date().toISOString().split('T')[0], resolutionNotes: resolutionNotes || 'Resolved by site engineer' }
          : s
      )
    );
    showToast(`Safety issue ${issueId} marked as resolved.`);
    addAuditLog(`Resolved Safety Issue`, 'Safety Management', issueId);
  };

  const assignSafetyIssue = (issueId, engineerName) => {
    setSafetyIssues((prev) =>
      prev.map((s) => (s.id === issueId ? { ...s, assignedEngineer: engineerName } : s))
    );
    showToast(`Assigned ${issueId} to ${engineerName}`);
    addAuditLog(`Assigned Safety Issue to ${engineerName}`, 'Safety Management', issueId);
  };

  const logSafetyViolation = (newIssue) => {
    const issue = {
      ...newIssue,
      id: `SAF-${String(safetyIssues.length + 1).padStart(3, '0')}`,
      status: 'Open',
      reportedDate: new Date().toISOString().split('T')[0],
    };
    setSafetyIssues((prev) => [issue, ...prev]);

    // Notify
    const newNotif = {
      id: Date.now(),
      type: 'SAFETY_ISSUE',
      title: `Safety Incident Logged: ${issue.issueType}`,
      houseId: issue.houseId,
      description: `${issue.severity} severity issue reported at ${issue.houseAddress}.`,
      time: 'Just now',
      unread: true,
      category: 'Safety',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Safety violation logged: ${issue.id}`, 'warning');
    addAuditLog(`Logged Safety Violation (${issue.severity})`, 'Safety Management', issue.houseId);
  };

  // ==================== AI HAZARD ACTIONS ====================
  const resolveAiHazard = (hazardId) => {
    setAiHazards((prev) =>
      prev.map((h) => (h.id === hazardId ? { ...h, status: 'Resolved' } : h))
    );
    showToast(`AI Hazard ${hazardId} marked as mitigated.`);
    addAuditLog(`Mitigated AI Vision Hazard`, 'AI Hazard Detection', hazardId);
  };

  // ==================== LOAN ACTIONS ====================
  const disburseTranche = (loanId, trancheNo, amount) => {
    setLoans((prev) =>
      prev.map((ln) => {
        if (ln.id === loanId) {
          const updatedTranches = ln.tranches.map((t) =>
            t.trancheNo === trancheNo
              ? { ...t, status: 'Disbursed', date: new Date().toISOString().split('T')[0], voucherRef: `BOP-TXN-${Math.floor(10000 + Math.random() * 90000)}` }
              : t
          );
          const newDisbursed = ln.disbursedAmount + amount;
          const newRemaining = Math.max(0, ln.approvedAmount - newDisbursed);
          const isComplete = newRemaining === 0;
          return {
            ...ln,
            disbursedAmount: newDisbursed,
            remainingAmount: newRemaining,
            tranches: updatedTranches,
            status: isComplete ? 'Completed' : 'Active',
          };
        }
        return ln;
      })
    );

    // Sync with house loan balance
    const targetLoan = loans.find((l) => l.id === loanId);
    if (targetLoan) {
      setHouses((prev) =>
        prev.map((h) =>
          h.id === targetLoan.houseId
            ? {
                ...h,
                loanDisbursed: h.loanDisbursed + amount,
                remainingLoan: Math.max(0, h.loanApproved - (h.loanDisbursed + amount)),
                loanStatus: `Tranche ${trancheNo} Disbursed`,
              }
            : h
        )
      );
    }

    showToast(`Tranche ${trancheNo} (PKR ${amount.toLocaleString()}) disbursed via BOP.`);
    addAuditLog(`Disbursed Tranche ${trancheNo} (PKR ${amount.toLocaleString()})`, 'Loan Management', loanId);
  };

  const approveLoan = (loanId) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status: 'Approved' } : l))
    );
    showToast(`Loan application ${loanId} approved.`);
    addAuditLog(`Approved Loan Application`, 'Loan Management', loanId);
  };

  const rejectLoan = (loanId, reason) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status: `Rejected: ${reason || 'Eligibility unmet'}` } : l))
    );
    showToast(`Loan application ${loanId} rejected.`, 'error');
    addAuditLog(`Rejected Loan Application`, 'Loan Management', loanId);
  };

  // ==================== NOTIFICATIONS ACTIONS ====================
  const markNotificationRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast('All notifications marked as read.');
  };

  // ==================== SETTINGS ACTIONS ====================
  const updateProfile = (profileData) => {
    setSettings((prev) => ({ ...prev, profile: { ...prev.profile, ...profileData } }));
    showToast('Profile updated successfully.');
    addAuditLog('Updated Profile Settings', 'System Settings');
  };

  const updateSafetyRules = (rulesData) => {
    setSettings((prev) => ({ ...prev, safetyRules: { ...prev.safetyRules, ...rulesData } }));
    showToast('Safety rules updated.');
    addAuditLog('Updated Safety Compliance Rules', 'System Settings');
  };

  const updateEnvironmentalRules = (envData) => {
    setSettings((prev) => ({ ...prev, environmentalRules: { ...prev.environmentalRules, ...envData } }));
    showToast('Environmental risk thresholds saved.');
    addAuditLog('Updated Environmental Thresholds', 'System Settings');
  };

  const updateSecuritySettings = (secData) => {
    setSettings((prev) => ({ ...prev, security: { ...prev.security, ...secData } }));
    showToast('Security configuration updated.');
    addAuditLog('Updated Security Configuration', 'System Settings');
  };

  const value = {
    // Data
    houses,
    engineers,
    visits,
    workers,
    trainingTopics,
    safetyIssues,
    aiHazards,
    loans,
    notifications,
    auditLogs,
    settings,
    toast,

    // House operations
    addHouse,
    bulkImportHouses,
    refreshHouses,
    approveHouse,
    rejectHouse,
    assignEngineerToHouse,
    updateHouseStatus,

    // Visits operations
    scheduleVisit,
    approveVisitReport,
    requestReInspection,
    scheduleHouseReVisit,

    // Engineer operations
    addEngineer,
    toggleEngineerStatus,

    // Labour & Training operations
    recordTrainingSession,
    addTrainingTopic,

    // Safety operations
    resolveSafetyIssue,
    assignSafetyIssue,
    logSafetyViolation,

    // AI Hazard operations
    resolveAiHazard,

    // Loan operations
    disburseTranche,
    approveLoan,
    rejectLoan,

    // Notification operations
    markNotificationRead,
    markAllNotificationsRead,

    // Settings operations
    updateProfile,
    updateSafetyRules,
    updateEnvironmentalRules,
    updateSecuritySettings,
    showToast,
  };

  return (
    <DashboardDataContext.Provider value={value}>
      {children}

      {/* Global Toast Alert Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-black flex items-center gap-3 backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-900/90 text-rose-50 border-rose-700'
                : toast.type === 'warning'
                ? 'bg-amber-900/90 text-amber-50 border-amber-700'
                : 'bg-emerald-900/90 text-emerald-50 border-emerald-700'
            }`}
          >
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                toast.type === 'error' ? 'bg-rose-400' : toast.type === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
              } animate-ping`}
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </DashboardDataContext.Provider>
  );
};

export const useDashboardData = () => {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  return context;
};
