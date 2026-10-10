import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useDashboardData } from '../../context/DashboardDataContext';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Layers,
  BookOpen,
  ShieldAlert,
  CloudSun,
  Bell,
  Lock,
  FileSpreadsheet,
  Check,
  Save,
  Plus,
  Trash2,
  Key,
  Smartphone,
  Eye
} from 'lucide-react';

export const SettingsDashboard = () => {
  const { t, language, changeLanguage, isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'audit' ? 'audit' : 'profile';

  const {
    settings,
    updateProfile,
    updateSafetyRules,
    updateEnvironmentalRules,
    updateSecuritySettings,
    trainingTopics,
    addTrainingTopic,
    auditLogs
  } = useDashboardData();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState(settings.profile);
  const [safetyForm, setSafetyForm] = useState(settings.safetyRules);
  const [envForm, setEnvForm] = useState(settings.environmentalRules);
  const [securityForm, setSecurityForm] = useState(settings.security);
  const [notifForm, setNotifForm] = useState(settings.notificationToggles);

  // Construction Stages Configuration State (ACAG 2-Tranche Model: 7.5L + 7.5L = 1.5M)
  const [stagesConfig, setStagesConfig] = useState([
    { id: 1, name: 'Foundation', durationDays: 14, reqInsp: true, trancheRelease: '1st Tranche: PKR 7.5 Lakh (50%)' },
    { id: 2, name: 'Structure', durationDays: 20, reqInsp: true, trancheRelease: 'Milestone Inspection' },
    { id: 3, name: 'Roof', durationDays: 18, reqInsp: true, trancheRelease: '2nd Tranche: PKR 7.5 Lakh (50%)' },
    { id: 4, name: 'Electrical', durationDays: 12, reqInsp: false, trancheRelease: 'Quality Audit' },
    { id: 5, name: 'Plumbing', durationDays: 12, reqInsp: false, trancheRelease: 'Quality Audit' },
    { id: 6, name: 'Finishing', durationDays: 15, reqInsp: true, trancheRelease: 'Final Milestone' },
    { id: 7, name: 'Final Inspection & Handover', durationDays: 5, reqInsp: true, trancheRelease: 'Completion Certificate' },
  ]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
    triggerSaveFeedback();
  };

  const handleSaveSafety = (e) => {
    e.preventDefault();
    updateSafetyRules(safetyForm);
    triggerSaveFeedback();
  };

  const handleSaveEnv = (e) => {
    e.preventDefault();
    updateEnvironmentalRules(envForm);
    triggerSaveFeedback();
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    updateSecuritySettings(securityForm);
    triggerSaveFeedback();
  };

  const triggerSaveFeedback = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const settingsTabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'stages', label: 'Construction Stages', icon: Layers },
    { id: 'labour', label: 'Labour Training Rules', icon: BookOpen },
    { id: 'safety', label: 'Safety Rules & PPE', icon: ShieldAlert },
    { id: 'environmental', label: 'Environmental Rules', icon: CloudSun },
    { id: 'notifications', label: 'Notification Triggers', icon: Bell },
    { id: 'security', label: 'Security & 2FA', icon: Lock },
    { id: 'audit', label: 'Audit Logs', icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            System Settings & Program Rules
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure administrative profile, construction stage milestones, HSE rules, weather thresholds, and security policies
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1.5 animate-in fade-in">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>Configuration Updated!</span>
          </span>
        )}
      </div>

      {/* Settings Tabbed Layout (Left Vertical Menu + Right Content Panel) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Tabs */}
        <div className="md:col-span-3 bg-white rounded-3xl p-2.5 border border-slate-200 shadow-2xs space-y-1">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${isRTL ? 'text-right' : 'text-left'} cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-md shadow-orange-500/20 font-extrabold'
                    : 'text-slate-600 hover:bg-orange-50/70 hover:text-orange-950'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'} shrink-0`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tab Content */}
        <div className="md:col-span-9 space-y-6">
          {/* =========================================================================
              TAB 1: MY PROFILE
             ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-black text-slate-900">Administrator Profile Details</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">
                  Super Administrator
                </span>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4 pb-2">
                  <div className="h-16 w-16 rounded-full overflow-hidden ring-2 ring-orange-300 shrink-0">
                    <img src={profileForm.avatar} alt="Admin" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">{profileForm.name}</h3>
                    <p className="text-[11px] text-slate-500">{profileForm.designation}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB 2: ROLES & PERMISSIONS
             ========================================================================= */}
          {activeTab === 'roles' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h2 className="text-sm font-black text-slate-900">Role-Based Access Control Matrix (RBAC)</h2>
                <p className="text-xs text-slate-500">Configure administrative permission privileges per system persona</p>
              </div>

              <div className="overflow-x-auto w-full min-w-0">
                <table className="w-full text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-extrabold uppercase">
                      <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>System Module</th>
                      <th className="py-3 px-3 text-center">Super Admin</th>
                      <th className="py-3 px-3 text-center">Review Engineer</th>
                      <th className="py-3 px-3 text-center">Field Engineer</th>
                      <th className="py-3 px-3 text-center">House Owner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { module: 'House Application Approval', admin: true, reviewer: true, field: false, owner: false },
                      { module: 'Loan Tranche Authorization', admin: true, reviewer: false, field: false, owner: false },
                      { module: 'Engineer Visit Scheduling', admin: true, reviewer: true, field: true, owner: false },
                      { module: 'Labour Training Logging', admin: true, reviewer: true, field: true, owner: false },
                      { module: 'Safety Violation Mitigation', admin: true, reviewer: true, field: true, owner: false },
                      { module: 'AI Hazard Review', admin: true, reviewer: true, field: false, owner: false },
                      { module: 'System Settings Configuration', admin: true, reviewer: false, field: false, owner: false },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-slate-900">{row.module}</td>
                        <td className="py-3 px-3 text-center">{row.admin ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}</td>
                        <td className="py-3 px-3 text-center">{row.reviewer ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}</td>
                        <td className="py-3 px-3 text-center">{row.field ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}</td>
                        <td className="py-3 px-3 text-center">{row.owner ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: CONSTRUCTION STAGES CONFIGURATION
             ========================================================================= */}
          {activeTab === 'stages' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h2 className="text-sm font-black text-slate-900">Standard ACAG Construction Stages Configuration</h2>
                <p className="text-xs text-slate-500">Define milestone phases, mandatory inspection prerequisites, and loan tranche tie-ins</p>
              </div>

              <div className="space-y-2">
                {stagesConfig.map((stage, i) => (
                  <div key={stage.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="h-7 w-7 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black">
                        {stage.id}
                      </span>
                      <div>
                        <div className="font-black text-slate-900">{stage.name}</div>
                        <div className="text-[10px] text-slate-500">Duration: {stage.durationDays} Days • Tranche Release: {stage.trancheRelease}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {stage.reqInsp ? 'Mandatory Field Inspection' : 'Photo Verification'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: LABOUR TRAINING RULES
             ========================================================================= */}
          {activeTab === 'labour' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h2 className="text-sm font-black text-slate-900">Labour Training Compliance Policies</h2>
                <p className="text-xs text-slate-500">Configure on-site worker safety module requirements and minimum training duration</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trainingTopics.map((topic) => (
                  <div key={topic.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-black text-slate-900">{topic.name}</div>
                      <div className="text-[10px] text-slate-500">Standard Duration: {topic.duration}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${topic.required ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-200 text-slate-700'}`}>
                      {topic.required ? 'Mandatory' : 'Optional'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: SAFETY RULES & PPE
             ========================================================================= */}
          {activeTab === 'safety' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div>
                <h2 className="text-sm font-black text-slate-900">Safety & PPE Compliance Thresholds</h2>
                <p className="text-xs text-slate-500">Configure HSE safety rules and automated violation escalation triggers</p>
              </div>

              <form onSubmit={handleSaveSafety} className="space-y-4 text-xs">
                <div className="space-y-3 divide-y divide-slate-100">
                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-black text-slate-900">Mandatory Hard Hat Protocol</div>
                      <div className="text-slate-500">Issue instant warning if hard hat violation is confirmed by AI Vision</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={safetyForm.mandatoryHelmet}
                      onChange={(e) => setSafetyForm({ ...safetyForm, mandatoryHelmet: e.target.checked })}
                      className="h-4 w-4 rounded accent-orange-600"
                    />
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-black text-slate-900">Safety Harness Height Trigger (Meters)</div>
                      <div className="text-slate-500">Elevation requiring compulsory harness tie-off</div>
                    </div>
                    <input
                      type="number"
                      value={safetyForm.mandatoryHarnessHeightMeters}
                      onChange={(e) => setSafetyForm({ ...safetyForm, mandatoryHarnessHeightMeters: Number(e.target.value) })}
                      step={0.5}
                      min={1}
                      max={5}
                      className="w-20 px-2 py-1 bg-slate-50 border rounded-lg font-bold"
                    />
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-black text-slate-900">Scaffolding Inspection Interval (Days)</div>
                      <div className="text-slate-500">Maximum days between recurring scaffold load verifications</div>
                    </div>
                    <input
                      type="number"
                      value={safetyForm.scaffoldingInspectionIntervalDays}
                      onChange={(e) => setSafetyForm({ ...safetyForm, scaffoldingInspectionIntervalDays: Number(e.target.value) })}
                      min={1}
                      max={30}
                      className="w-20 px-2 py-1 bg-slate-50 border rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold shadow-md transition"
                  >
                    Save Safety Rules
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB 6: ENVIRONMENTAL RULES
             ========================================================================= */}
          {activeTab === 'environmental' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div>
                <h2 className="text-sm font-black text-slate-900">Environmental Risk & Weather Stoppage Rules</h2>
                <p className="text-xs text-slate-500">Set automatic weather risk alert triggers and construction stoppage limits</p>
              </div>

              <form onSubmit={handleSaveEnv} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-800 block">Max Working Temperature (°C)</label>
                    <input
                      type="number"
                      value={envForm.maxWorkingTemperatureC}
                      onChange={(e) => setEnvForm({ ...envForm, maxWorkingTemperatureC: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border rounded-xl font-bold"
                    />
                    <span className="text-[10px] text-slate-500">Triggers compulsory heatwave rest intervals</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-800 block">Precipitation Stoppage Limit (mm/hr)</label>
                    <input
                      type="number"
                      value={envForm.stoppageRainfallMm}
                      onChange={(e) => setEnvForm({ ...envForm, stoppageRainfallMm: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border rounded-xl font-bold"
                    />
                    <span className="text-[10px] text-slate-500">Restricts open concrete casting works</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold shadow-md transition"
                  >
                    Save Environmental Rules
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB 7: NOTIFICATIONS PREFERENCES
             ========================================================================= */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h2 className="text-sm font-black text-slate-900">Notification & Alert Channels</h2>
                <p className="text-xs text-slate-500">Configure email, SMS, and in-app automated dispatches</p>
              </div>

              <div className="space-y-3 divide-y divide-slate-100 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-black text-slate-900">Email on Critical AI Safety Hazard</div>
                    <div className="text-slate-500">Notify directorate immediately upon critical site hazard identification</div>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-orange-600" />
                </div>
                <div className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-black text-slate-900">SMS / WhatsApp to Beneficiary</div>
                    <div className="text-slate-500">Send disbursement verification code and stage clearance SMS</div>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-orange-600" />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 8: SECURITY & 2FA
             ========================================================================= */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div>
                <h2 className="text-sm font-black text-slate-900">Security & Authentication Policy</h2>
                <p className="text-xs text-slate-500">Configure two-factor authentication, session limits, and password hygiene</p>
              </div>

              <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-800 block">Session Inactivity Timeout (Minutes)</label>
                    <input
                      type="number"
                      value={securityForm.sessionTimeoutMinutes}
                      onChange={(e) => setSecurityForm({ ...securityForm, sessionTimeoutMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border rounded-xl font-bold"
                    />
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-800 block">Max Failed Login Attempts</label>
                    <input
                      type="number"
                      value={securityForm.maxFailedAttempts}
                      onChange={(e) => setSecurityForm({ ...securityForm, maxFailedAttempts: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold shadow-md transition"
                  >
                    Save Security Policy
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB 9: AUDIT LOGS
             ========================================================================= */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h2 className="text-sm font-black text-slate-900">Administrative Audit Trail Logs</h2>
                <p className="text-xs text-slate-500">Immutable ledger of all actions, approvals, disbursements, and rule changes</p>
              </div>

              <div className="overflow-x-auto w-full min-w-0">
                <table className="w-full text-xs min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-extrabold uppercase">
                      <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>User</th>
                      <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Action</th>
                      <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Module</th>
                      <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Target ID</th>
                      <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>Timestamp</th>
                      <th className={`py-3 px-4 ${isRTL ? 'text-left' : 'text-right'}`}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-black text-slate-900">{log.user}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{log.action}</td>
                        <td className="py-3 px-4 text-slate-600">{log.module}</td>
                        <td className="py-3 px-4 font-mono text-orange-700">{log.houseId}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{log.timestamp}</td>
                        <td className={`py-3 px-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {log.status}
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
      </div>
    </div>
  );
};
