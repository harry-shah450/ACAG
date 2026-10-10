import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useDashboardData } from '../../context/DashboardDataContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Printer,
  Save,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  FileText,
  Search,
  Check,
  RefreshCw,
  Sparkles,
  Info,
  HardHat,
  Eye,
  CheckSquare,
  Send,
  Bell,
  Phone,
  Share2,
  MessageSquare,
  X
} from 'lucide-react';

// The 23 Official Environmental & Social Safeguards Checklist Items (BOP ACAG Standard)
export const ESS_CHECKLIST_ITEMS = [
  { id: 1, text: 'Workers wear PPEs (Helmet, Shoes, gloves, reflective jackets)', category: 'Worker Safety & PPE', correctiveAction: 'Immediately issue mandatory helmets, steel-toe boots and gloves to all workers.' },
  { id: 2, text: 'Dust masks/respirators are used during dusty activities.', category: 'Health & Hygiene', correctiveAction: 'Provide N95 dust masks during cement mixing and dry cutting.' },
  { id: 3, text: 'Loose, flowing or unsafe clothing is not worn while carrying out construction activities.', category: 'Worker Safety & PPE', correctiveAction: 'Ensure fitted work clothes are worn to avoid machinery snagging.' },
  { id: 4, text: 'Where complete PPE is unavailable, workers are at least wearing appropriate protective clothing and sturdy footwear.', category: 'Worker Safety & PPE', correctiveAction: 'Enforce minimum sturdy footwear and protective apparel.' },
  { id: 5, text: 'Warning signs and safety barriers are provided around construction area.', category: 'Site Safety', correctiveAction: 'Install red perimeter caution tape and high-visibility warning signs.' },
  { id: 6, text: 'Excavations are protected and clearly marked.', category: 'Site Safety', correctiveAction: 'Barricade open trenches with timber planks and reflective markers.' },
  { id: 7, text: 'Scaffolding and ladders are stable and safely secured.', category: 'Working at Heights', correctiveAction: 'Restructure scaffolding base on solid ground and tie top ladders securely.' },
  { id: 8, text: 'Temporary electrical wiring is safe with no exposure.', category: 'Electrical Safety', correctiveAction: 'Isolate exposed electric cables and install ground-fault circuit breakers.' },
  { id: 9, text: 'Construction materials are safely stacked and stored.', category: 'Material Management', correctiveAction: 'Stack bricks and cement bags neatly away from main walkway corridors.' },
  { id: 10, text: 'Work area is clean and free from debris, nails and trip hazards.', category: 'Housekeeping', correctiveAction: 'Perform daily end-of-day site cleanup and remove protruding nails.' },
  { id: 11, text: 'Water arrangement is available to deal with fire Hazard.', category: 'Emergency Preparedness', correctiveAction: 'Station dedicated water drums and sand buckets for emergency fire response.' },
  { id: 12, text: 'Accidents, incidents or near misses have been recorded.', category: 'HSE Governance', correctiveAction: 'Maintain on-site daily incident and near-miss log book.' },
  { id: 13, text: 'Construction activities are undertaken only during working hours.', category: 'Community & Labour', correctiveAction: 'Strictly restrict heavy concrete pouring and noisy operations to 08:00 AM - 06:00 PM.' },
  { id: 14, text: 'Workers are provided with adequate drinking water.', category: 'Labour Welfare', correctiveAction: 'Provide clean, covered drinking water cooler and hydration breaks.' },
  { id: 15, text: 'A shaded/rest area is available for workers during breaks (where feasible).', category: 'Labour Welfare', correctiveAction: 'Setup temporary canvas shaded resting shed on site.' },
  { id: 16, text: 'No child labour is employed.', category: 'Social Safeguards', correctiveAction: 'Zero tolerance: Immediately remove underage individuals from the premises.' },
  { id: 17, text: 'Workers are treated respectfully without discrimination or harassment.', category: 'Social Safeguards', correctiveAction: 'Enforce strict dignity and non-discrimination code of conduct.' },
  { id: 18, text: 'Home construction site is clean and well organized.', category: 'Housekeeping', correctiveAction: 'Organize toolboxes and clear walkway perimeter.' },
  { id: 19, text: 'Construction waste is segregated and disposed of properly.', category: 'Waste Management', correctiveAction: 'Designate waste disposal corner and segregate recyclable debris.' },
  { id: 20, text: 'Dust is controlled through water sprinkling or other suitable measures.', category: 'Environmental Protection', correctiveAction: 'Sprinkle water twice daily on dry soil and fine sand mounds.' },
  { id: 21, text: 'Cement, fuel and chemicals are safely stored to prevent spills.', category: 'Chemical & Material Safety', correctiveAction: 'Store cement on elevated wooden pallets under waterproof tarpaulin.' },
  { id: 22, text: 'Construction activities do not create undue nuisance to nearby residents.', category: 'Community Safeguards', correctiveAction: 'Ensure road access is not blocked by gravel/sand deliveries.' },
  { id: 23, text: 'Any damage to neighbouring property has been documented and addressed.', category: 'Community Safeguards', correctiveAction: 'Inspect adjoining boundary walls and repair any accidental chipping/cracks.' },
];

const STAGE_OPTIONS = [
  'Site Preparation',
  'Excavation',
  'Foundation',
  'Masonry',
  'Roofing',
  'Finishing'
];

export const EnvironmentalMonitoring = () => {
  const { t, isRTL } = useLanguage();
  const { houses, engineers, showToast } = useDashboardData();

  // Active View Tab: 'INSPECT' | 'HISTORY'
  const [activeTab, setActiveTab] = useState('INSPECT');

  // Selected House / Form State
  const [selectedHouseId, setSelectedHouseId] = useState(houses[0]?.id || '');
  const [contractorMason, setContractorMason] = useState('');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [selectedStage, setSelectedStage] = useState('Site Preparation');
  const [generalRemarks, setGeneralRemarks] = useState('');

  // Outcome Modal State
  const [dispatchedNoticeModal, setDispatchedNoticeModal] = useState(null);

  // Checklist Answers state: { [itemId]: 'YES' | 'NO' | 'NA' }
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    ESS_CHECKLIST_ITEMS.forEach((item) => {
      initial[item.id] = 'YES';
    });
    return initial;
  });

  // Checklist Item Remarks / Evidence: { [itemId]: string }
  const [itemRemarks, setItemRemarks] = useState({});

  // Inspection Records Log State
  const [inspectionHistory, setInspectionHistory] = useState([
    {
      id: 'INS-2026-001',
      houseId: 'ACAG-000012',
      caseId: 'ACAG-000012',
      ownerName: 'Farhan',
      ownerPhone: '+92 300 1234567',
      district: 'Lahore',
      tehsil: 'Muslim Town',
      contractorMason: 'Ustad Aslam & Team',
      date: '2026-10-04',
      engineer: 'Engr. Shoaib Akhtar',
      stage: 'Site Preparation',
      yesCount: 23,
      noCount: 0,
      naCount: 0,
      score: 100,
      status: 'Fully Compliant',
      rejectedItems: [],
      answers: { ...answers },
    }
  ]);

  // Selected House Object
  const selectedHouse = useMemo(() => {
    return houses.find((h) => h.id === selectedHouseId || h.caseId === selectedHouseId) || houses[0] || null;
  }, [houses, selectedHouseId]);

  // Sync Form when selected house changes
  useEffect(() => {
    if (selectedHouse) {
      if (selectedHouse.stage) {
        const matchedStage = STAGE_OPTIONS.find((s) => selectedHouse.stage.toLowerCase().includes(s.toLowerCase()));
        if (matchedStage) setSelectedStage(matchedStage);
      }
      if (selectedHouse.engineerName) {
        setSelectedEngineer(selectedHouse.engineerName);
      } else if (engineers.length > 0) {
        setSelectedEngineer(engineers[0].name);
      }
    }
  }, [selectedHouse, engineers]);

  // Update a single answer
  const handleAnswerChange = (itemId, val) => {
    setAnswers((prev) => ({ ...prev, [itemId]: val }));
  };

  // Quick Action: Mark All as YES or NO
  const handleMarkAll = (val) => {
    const updated = {};
    ESS_CHECKLIST_ITEMS.forEach((item) => {
      updated[item.id] = val;
    });
    setAnswers(updated);
    showToast(`All items marked as ${val}`);
  };

  // Compute Live Score Metrics & Rejected Items List
  const { metrics, rejectedItemsList, passedItemsList } = useMemo(() => {
    let yes = 0;
    let no = 0;
    let na = 0;
    const rejected = [];
    const passed = [];

    ESS_CHECKLIST_ITEMS.forEach((item) => {
      const ans = answers[item.id];
      if (ans === 'YES') {
        yes++;
        passed.push(item);
      } else if (ans === 'NO') {
        no++;
        rejected.push(item);
      } else if (ans === 'NA') {
        na++;
      }
    });

    const applicable = yes + no;
    const score = applicable > 0 ? Math.round((yes / applicable) * 100) : 100;
    return {
      metrics: { yes, no, na, applicable, score },
      rejectedItemsList: rejected,
      passedItemsList: passed
    };
  }, [answers]);

  // Submit & Dispatch Inspection Notice to Owner
  const handleSubmitAndSendToOwner = (e) => {
    e.preventDefault();
    if (!selectedHouse) {
      showToast('Please select a house first', 'warning');
      return;
    }

    const isPassed = rejectedItemsList.length === 0;
    const noticeStatus = isPassed ? 'Cleared & Approved' : 'Action Required / Rectification Notice Issued';

    const newRecord = {
      id: `INS-2026-${String(inspectionHistory.length + 1).padStart(3, '0')}`,
      houseId: selectedHouse.id || selectedHouse.caseId,
      caseId: selectedHouse.caseId || selectedHouse.id,
      ownerName: selectedHouse.ownerName,
      ownerPhone: selectedHouse.ownerPhone || '+92 300 0000000',
      district: selectedHouse.district,
      tehsil: selectedHouse.tehsil || selectedHouse.address,
      contractorMason: contractorMason || 'Direct Beneficiary Mason',
      date: inspectionDate,
      engineer: selectedEngineer || 'Field Quality Engineer',
      stage: selectedStage,
      yesCount: metrics.yes,
      noCount: metrics.no,
      naCount: metrics.na,
      score: metrics.score,
      status: isPassed ? 'Fully Compliant' : 'Non-Compliant / Rejected Items',
      rejectedItems: rejectedItemsList,
      passedItems: passedItemsList,
      remarks: generalRemarks,
      answers: { ...answers },
      itemRemarks: { ...itemRemarks }
    };

    setInspectionHistory((prev) => [newRecord, ...prev]);

    // Open the official dispatched notice modal
    setDispatchedNoticeModal({
      ...newRecord,
      noticeStatus,
      isPassed
    });

    if (isPassed) {
      showToast(`Site cleared! Inspection clearance notice sent to owner ${selectedHouse.ownerName} (${selectedHouse.caseId})`);
    } else {
      showToast(`Defect notice with ${rejectedItemsList.length} rejected items dispatched to owner ${selectedHouse.ownerName}!`, 'warning');
    }
  };

  // Generate Official BOP ACAG PDF
  const handleExportPDF = () => {
    if (!selectedHouse) return;

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Title & Header Box
      doc.setFillColor(30, 58, 138); // Navy Blue
      doc.rect(14, 10, 182, 18, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('BOP - APNI CHAT APNA GHAR (ACAG) PROGRAM', 105, 17, { align: 'center' });
      doc.setFontSize(9);
      doc.text('Health, Safety & Labour (HSL/HSE) Site Inspection Checklist', 105, 23, { align: 'center' });

      // Meta Table
      doc.setTextColor(15, 23, 42);
      const metaRows = [
        [
          { content: 'Project:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          'BOP - Apni Chat Apna Ghar (ACAG) Program',
          { content: 'Date of Inspection:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          inspectionDate || '2026-10-04'
        ],
        [
          { content: 'District / Tehsil:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          `${selectedHouse.district || 'Lahore'} / ${selectedHouse.tehsil || 'Muslim Town'}`,
          { content: 'Case ID / House ID:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          selectedHouse.caseId || selectedHouse.id
        ],
        [
          { content: 'Beneficiary Name:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          `${selectedHouse.ownerName} (${selectedHouse.ownerPhone || ''})`,
          { content: 'Junior Engineer (JE):', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          selectedEngineer || 'Engr. Designated'
        ],
        [
          { content: 'Contractor / Mason:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          contractorMason || 'Direct Mason / Beneficiary',
          { content: 'Site Stage:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          selectedStage
        ]
      ];

      autoTable(doc, {
        startY: 32,
        body: metaRows,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, textColor: [15, 23, 42] },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 56 },
          2: { cellWidth: 35 },
          3: { cellWidth: 56 }
        }
      });

      // 23 Checklist Items Table
      const checklistData = ESS_CHECKLIST_ITEMS.map((item) => {
        const ans = answers[item.id] || 'YES';
        return [
          item.id.toString(),
          item.text,
          ans === 'YES' ? '[ X ]' : '[   ]',
          ans === 'NO' ? '[ X ]' : '[   ]',
          ans === 'NA' ? '[ X ]' : '[   ]'
        ];
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 4,
        head: [
          [
            { content: 'Environmental & Social Safeguards (ESS) Checkpoints', colSpan: 5, styles: { halign: 'center', fillColor: [219, 234, 254], textColor: [30, 58, 138], fontStyle: 'bold' } }
          ],
          ['Sr.', 'Inspection Item Description', 'Yes', 'No', 'N/A']
        ],
        body: checklistData,
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 7.5, cellPadding: 1.6, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 132 },
          2: { cellWidth: 13, halign: 'center', fontStyle: 'bold' },
          3: { cellWidth: 13, halign: 'center', fontStyle: 'bold' },
          4: { cellWidth: 14, halign: 'center', fontStyle: 'bold' }
        }
      });

      // Score Summary & Signatures
      const finalY = doc.lastAutoTable.finalY + 6;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`Compliance Summary: Yes: ${metrics.yes} | No: ${metrics.no} | N/A: ${metrics.na} | Score: ${metrics.score}%`, 14, finalY);

      doc.setFont('helvetica', 'normal');
      doc.text('Junior Engineer Signature: _______________________', 14, finalY + 12);
      doc.text('Beneficiary / Mason Signature: _______________________', 110, finalY + 12);

      doc.save(`ACAG_HSE_Checklist_${selectedHouse.caseId}_${inspectionDate}.pdf`);
      showToast('Official BOP ACAG PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF error:', err);
      showToast('Failed to export PDF: ' + (err?.message || err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/30 text-blue-200 border border-blue-400/30 backdrop-blur-md flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />
                BOP – APNI CHAT APNA GHAR (ACAG) PROGRAM
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Health, Safety & Labour (HSL/HSE) Site Inspection Checklist
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Official 23-point inspection protocol. Submit checklist to instantly dispatch rectification and defect notices directly to the house owner.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-black hover:bg-slate-100 flex items-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Download className="h-4 w-4 text-blue-600" />
              <span>Export Official PDF</span>
            </button>
            <button
              onClick={handleSubmitAndSendToOwner}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
            >
              <Send className="h-4 w-4" />
              <span>Submit & Send Notice to Owner</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveTab('INSPECT')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'INSPECT'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <ClipboardCheck className="h-4 w-4" />
            <span>Active Checklist Inspection Form</span>
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'HISTORY'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Inspection History & Records ({inspectionHistory.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'INSPECT' ? (
        <>
          {/* Section 1: Official Header Form */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span>Project & Site Identification Header</span>
                </h2>
                <p className="text-xs text-slate-500">Auto-populated beneficiary details and site inspection metadata</p>
              </div>

              {/* House Selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-black text-slate-600 whitespace-nowrap">Target House / Owner:</span>
                <select
                  value={selectedHouseId}
                  onChange={(e) => setSelectedHouseId(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-black text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.caseId || h.id} - {h.ownerName} ({h.district})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Project Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Project</label>
                <input
                  type="text"
                  readOnly
                  value="BOP – Apni Chat Apna Ghar (ACAG) Program"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/80 text-xs font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              {/* District / Tehsil */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">District / Tehsil</label>
                <input
                  type="text"
                  readOnly
                  value={`${selectedHouse?.district || 'Lahore'}, ${selectedHouse?.tehsil || selectedHouse?.address || 'Muslim Town'}`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/80 text-xs font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              {/* Beneficiary Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Beneficiary (Owner)</label>
                <input
                  type="text"
                  readOnly
                  value={`${selectedHouse?.ownerName || 'Beneficiary'} (${selectedHouse?.ownerPhone || 'No Phone'})`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/80 text-xs font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              {/* Contractor / Mason */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Contractor / Mason</label>
                <input
                  type="text"
                  placeholder="e.g. Ustad Aslam & Team"
                  value={contractorMason}
                  onChange={(e) => setContractorMason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Date of Inspection */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Date of Inspection</label>
                <input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Junior Engineer (JE) */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Junior Engineer (JE)</label>
                <select
                  value={selectedEngineer}
                  onChange={(e) => setSelectedEngineer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={selectedHouse?.engineerName || 'Engr. Shoaib Akhtar'}>
                    {selectedHouse?.engineerName || 'Engr. Shoaib Akhtar'}
                  </option>
                  {engineers.map((eng) => (
                    <option key={eng.id} value={eng.name}>
                      {eng.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Site Stage Selector */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Construction Site Stage</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {STAGE_OPTIONS.map((stage) => {
                    const isSelected = selectedStage === stage;
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setSelectedStage(stage)}
                        className={`px-2.5 py-2 rounded-xl text-[11px] font-black border transition-all text-center ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {stage}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Live Compliance Score Widget */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Compliance Score</p>
                <h3 className={`text-2xl font-black mt-0.5 ${metrics.score >= 90 ? 'text-emerald-600' : metrics.score >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {metrics.score}%
                </h3>
              </div>
              <div className={`p-3 rounded-2xl ${metrics.score >= 90 ? 'bg-emerald-50 text-emerald-600' : metrics.score >= 75 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Passed Checkpoints</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{metrics.yes} / 23</h3>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Rejected Items (Defects)</p>
                <h3 className={`text-2xl font-black mt-0.5 ${metrics.no > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {metrics.no} Items Rejected
                </h3>
              </div>
              <div className={`p-3 rounded-2xl ${metrics.no > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                <XCircle className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Not Applicable (N/A)</p>
                <h3 className="text-2xl font-black text-slate-600 mt-0.5">{metrics.na}</h3>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 text-slate-600">
                <Info className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Section 3: The 23 Checkpoints Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Table Control Bar */}
            <div className="p-5 md:p-6 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                  <span>Environmental & Social Safeguards (ESS) — 23 Checkpoints</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Mark items. Any item marked 'No' will be sent to the owner in the Defect Notice.</p>
              </div>

              {/* Quick Fill Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll('YES')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-1.5 transition-all"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Mark All Yes</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('NO')}
                  className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-black flex items-center gap-1.5 transition-all"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Mark All No</span>
                </button>
              </div>
            </div>

            {/* Checklist Table */}
            <div className="overflow-x-auto w-full min-w-0">
              <table className="w-full border-collapse text-xs min-w-[650px]">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-black text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">Sr.</th>
                    <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Inspection Item</th>
                    <th className="py-3.5 px-4 w-24 text-center text-emerald-700">Yes (Pass)</th>
                    <th className="py-3.5 px-4 w-24 text-center text-rose-700">No (Reject)</th>
                    <th className="py-3.5 px-4 w-24 text-center text-slate-600">N/A</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {ESS_CHECKLIST_ITEMS.map((item) => {
                    const currentAns = answers[item.id] || 'YES';
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors hover:bg-slate-50/80 ${
                          currentAns === 'NO' ? 'bg-rose-50/60' : ''
                        }`}
                      >
                        {/* Sr No */}
                        <td className="py-3.5 px-4 text-center font-black text-slate-500">
                          {item.id}
                        </td>

                        {/* Item Description */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className={`font-bold leading-snug ${currentAns === 'NO' ? 'text-rose-900' : 'text-slate-800'}`}>
                              {item.text}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                {item.category}
                              </span>
                              {currentAns === 'NO' && (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.2 rounded-md">
                                  ⚠️ Will be sent to owner as defect
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* YES Radio */}
                        <td className="py-3.5 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="radio"
                              name={`check_${item.id}`}
                              checked={currentAns === 'YES'}
                              onChange={() => handleAnswerChange(item.id, 'YES')}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                            />
                          </label>
                        </td>

                        {/* NO Radio */}
                        <td className="py-3.5 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="radio"
                              name={`check_${item.id}`}
                              checked={currentAns === 'NO'}
                              onChange={() => handleAnswerChange(item.id, 'NO')}
                              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-slate-300 rounded cursor-pointer"
                            />
                          </label>
                        </td>

                        {/* NA Radio */}
                        <td className="py-3.5 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="radio"
                              name={`check_${item.id}`}
                              checked={currentAns === 'NA'}
                              onChange={() => handleAnswerChange(item.id, 'NA')}
                              className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded cursor-pointer"
                            />
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* General Remarks / Notes */}
            <div className="p-6 bg-slate-50/80 border-t border-slate-200/80 space-y-3">
              <label className="text-xs font-black text-slate-700">General Inspection Remarks / Instructions for Owner & Mason:</label>
              <textarea
                rows={2}
                placeholder="Enter field observations, reasons for rejected items, or required timeline for rectification..."
                value={generalRemarks}
                onChange={(e) => setGeneralRemarks(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Bottom Submit Action Bar */}
            <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/20">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Dispatch Inspection Decision to Owner</h4>
                  <p className="text-xs text-slate-400">
                    Recipient: <strong className="text-white">{selectedHouse?.ownerName}</strong> ({selectedHouse?.caseId}) • {rejectedItemsList.length > 0 ? `${rejectedItemsList.length} Items will be flagged as REJECTED` : 'All 23 Items CLEARED'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmitAndSendToOwner}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Submit Checklist & Send Notice to Owner</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Section 4: Inspection Records History Log */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900">Official Inspection Records History</h3>
              <p className="text-xs text-slate-500">List of signed ESS & HSE inspection checklists dispatched to house owners</p>
            </div>
            <button
              onClick={() => setActiveTab('INSPECT')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-2 shadow-sm"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>New Inspection</span>
            </button>
          </div>

          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full border-collapse text-xs min-w-[850px]">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-black text-slate-600 uppercase tracking-wider">
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Inspection ID</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Case ID / House</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Beneficiary (Owner)</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Location</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Stage</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Junior Engineer</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Date</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                  <th className={`py-3.5 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Status & Notice</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {inspectionHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-black text-blue-600">{rec.id}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">{rec.caseId}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{rec.ownerName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{rec.district} ({rec.tehsil})</td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{rec.stage}</td>
                    <td className="py-3.5 px-4 text-slate-700">{rec.engineer}</td>
                    <td className="py-3.5 px-4 text-slate-500">{rec.date}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        rec.score >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {rec.score}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                        rec.noCount === 0
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {rec.noCount === 0 ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-rose-600" />}
                        <span>{rec.noCount === 0 ? 'Cleared & Approved' : `${rec.noCount} Rejected Items Notice`}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={handleExportPDF}
                        title="Download PDF"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 transition-all"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: OFFICIAL NOTICE DISPATCHED TO HOUSE OWNER */}
      {dispatchedNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${dispatchedNoticeModal.isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {dispatchedNoticeModal.isPassed ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Official Notice Dispatched to House Owner
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    {dispatchedNoticeModal.isPassed ? 'Site Inspection Clearance Certificate' : 'Notice of Rejected Items & Safety Rectification'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setDispatchedNoticeModal(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Recipient Details Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Beneficiary Name</span>
                <span className="font-black text-slate-900">{dispatchedNoticeModal.ownerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Case ID</span>
                <span className="font-black text-blue-600">{dispatchedNoticeModal.caseId}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Contact Phone</span>
                <span className="font-black text-slate-800">{dispatchedNoticeModal.ownerPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Inspection Score</span>
                <span className={`font-black ${dispatchedNoticeModal.score >= 90 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {dispatchedNoticeModal.score}%
                </span>
              </div>
            </div>

            {/* Notice Body: Rejected Items List */}
            {dispatchedNoticeModal.rejectedItems && dispatchedNoticeModal.rejectedItems.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" />
                    <span>Rejected Items Sent to Owner for Rectification ({dispatchedNoticeModal.rejectedItems.length}):</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">Must fix before next visit</span>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {dispatchedNoticeModal.rejectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-1.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-black text-rose-950">
                          #{item.id}. {item.text}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-200 text-rose-800 uppercase shrink-0">
                          REJECTED
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-700 font-medium">
                        <strong>Required Action:</strong> {item.correctiveAction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-black text-sm text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  All 23 ESS Checkpoints Passed Successfully!
                </p>
                <p className="text-emerald-700">
                  House construction site meets all Bank of Punjab & Government of Punjab Environmental, Health, Safety, and Labour compliance standards. Next tranche disbursement cleared!
                </p>
              </div>
            )}

            {/* Notification / SMS Delivery Simulation Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-indigo-900 font-bold">
                <Bell className="h-4 w-4 text-indigo-600" />
                <span>Notice successfully pushed to Owner's Portal & SMS gateway!</span>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-[10px] font-black">
                Delivered
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleExportPDF}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-2"
              >
                <Download className="h-4 w-4 text-blue-600" />
                <span>Download Official Notice PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setDispatchedNoticeModal(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition"
              >
                Close & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
