import React, { useState, useEffect, useCallback, useRef } from 'react';
import ScanTabs from './ScanTabs';
import { InvestigationModules, CustomScanConfig } from './core/Modules';
import { RunningScans, ScanHistory, ScheduledScans } from './core/ScansManager';
import { AddAssetsModal, EditAssetsModal } from './core/Modals';
import { getIconName, getIcon } from './utils/icons';

// All module configurations
const ALL_MODULES = [
  { id: 'job-recruitment', name: 'Job Recruitment', api: '/api/modules/job-recruitment', icon: 'job', color: 'from-purple-500 to-pink-500', textColor: 'text-purple-400' },
  { id: 'linkedin', name: 'LinkedIn Investigation', api: '/api/modules/linkedin-investigation', icon: 'linkedin', color: 'from-blue-500 to-cyan-500', textColor: 'text-blue-400' },
  { id: 'social-media', name: 'Social Media OSINT', api: '/api/modules/social-media', icon: 'social', color: 'from-green-500 to-emerald-500', textColor: 'text-green-400' },
  { id: 'scam-website', name: 'Scam Website Analysis', api: '/api/modules/scam-website', icon: 'website', color: 'from-orange-500 to-red-500', textColor: 'text-orange-400' },
  { id: 'email-leak', name: 'Email Leak Check', api: '/api/modules/email-leak', icon: 'email', color: 'from-yellow-500 to-amber-500', textColor: 'text-yellow-400' },
  { id: 'scam-email', name: 'Scam Email Analysis', api: '/api/modules/scam-email', icon: 'email-scam', color: 'from-red-500 to-pink-500', textColor: 'text-red-400' },
  { id: 'phone-number', name: 'Phone Number OSINT', api: '/api/modules/phone-number', icon: 'phone', color: 'from-teal-500 to-cyan-500', textColor: 'text-teal-400' },
  { id: 'crypto-wallet', name: 'Crypto Wallet Tracker', api: '/api/modules/crypto-wallet', icon: 'crypto', color: 'from-indigo-500 to-purple-500', textColor: 'text-indigo-400' }
];

const getModuleById = (moduleId) => {
  return ALL_MODULES.find(m => m.id === moduleId) || ALL_MODULES[0];
};

// --- GLOBAL CACHE (persists across component unmounts/remounts) ---
let globalRunningScans = [];
let globalScanHistory = [];
let globalInitialLoadDone = false;
let isFetchingGlobal = false;

const getTargetDisplay = (scan, moduleId) => {
  if (!scan.assets) return 'Scan';
  switch(moduleId) {
    case 'job-recruitment': return scan.assets?.job_title ? `${scan.assets.job_title} at ${scan.assets.company_name}` : 'Job Scan';
    case 'linkedin': return scan.assets?.profile_name || 'LinkedIn Profile';
    case 'social-media': return scan.assets?.display_name || 'Social Profile';
    case 'scam-website': return scan.assets?.website_name || 'Suspicious Website';
    case 'email-leak': return scan.assets?.email_address || 'Email Check';
    case 'scam-email': return scan.assets?.subject || 'Scam Email';
    case 'phone-number': return scan.assets?.phone_number || 'Phone Number';
    case 'crypto-wallet': return scan.assets?.wallet_address || 'Crypto Wallet';
    default: return 'Scan';
  }
};

const ScanDashboard = ({ 
  searchInput, 
  onSearchChange, 
  onAnalyze, 
  isAnalyzing,
  selectedProject 
}) => {
  const [activeScanTab, setActiveScanTab] = useState('module');
  const [scanOptions, setScanOptions] = useState({
    deepScan: false,
    passiveMode: true,
    activeMode: false,
    stealthMode: false,
    followRedirects: true,
  });

  const [selectedProjectForScan, setSelectedProjectForScan] = useState(selectedProject);
  
  // Initialize state from GLOBAL cache (immediate, no loading flash)
  const [runningScans, setRunningScans] = useState(globalRunningScans);
  const [scanHistory, setScanHistory] = useState(globalScanHistory);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showAddAssets, setShowAddAssets] = useState(false);
  const [showEditAssets, setShowEditAssets] = useState(false);
  const [editingScan, setEditingScan] = useState(null);
  const [loading, setLoading] = useState(!globalInitialLoadDone);
  const [filterModule, setFilterModule] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);
  
  const isSavingRef = useRef(false);
  const isRefreshingRef = useRef(false);

  // Fetch scans - updates both local state AND global cache
  const fetchAllScans = useCallback(async (forceRefresh = false) => {
    // Prevent multiple simultaneous fetches
    if (isFetchingGlobal && !forceRefresh) return;
    
    isFetchingGlobal = true;
    setLoading(true);
    
    try {
      const modulesToFetch = filterModule === 'all' 
        ? ALL_MODULES 
        : ALL_MODULES.filter(m => m.id === filterModule);
      
      const allScansPromises = modulesToFetch.map(async (module) => {
        try {
          const cacheBuster = forceRefresh ? `?_=${Date.now()}` : '';
          const response = await fetch(`${module.api}${cacheBuster}`);
          const data = await response.json();
          
          if (data.success && data.scans && data.scans.length > 0) {
            return data.scans.map(scan => ({
              id: `${module.id}_${scan.id}`,
              originalId: scan.id,
              moduleId: module.id,
              moduleName: module.name,
              moduleIcon: module.icon,
              moduleColor: module.color,
              moduleTextColor: module.textColor,
              toolIcon: module.icon,
              target: getTargetDisplay(scan, module.id),
              status: scan.status,
              progress: scan.progress || 0,
              assets: scan.assets,
              findings: scan.findings_count || 0,
              createdAt: scan.created_at
            }));
          }
          return [];
        } catch (error) {
          console.error(`Error fetching ${module.name} scans:`, error);
          return [];
        }
      });
      
      const allScansArrays = await Promise.all(allScansPromises);
      const allScans = allScansArrays.flat();
      
      const uniqueScansMap = new Map();
      allScans.forEach(scan => {
        const key = `${scan.moduleId}_${scan.originalId}`;
        if (!uniqueScansMap.has(key)) {
          uniqueScansMap.set(key, scan);
        }
      });
      
      const uniqueScans = Array.from(uniqueScansMap.values());
      uniqueScans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      const running = uniqueScans.filter(s => ['queued', 'running', 'paused'].includes(s.status));
      const history = uniqueScans.filter(s => ['completed', 'stopped', 'failed', 'cancelled'].includes(s.status));
      
      // Update GLOBAL cache
      globalRunningScans = running;
      globalScanHistory = history;
      globalInitialLoadDone = true;
      
      // Update local state
      setRunningScans(running);
      setScanHistory(history);
      
    } catch (error) {
      console.error('Error fetching all scans:', error);
    } finally {
      setLoading(false);
      isFetchingGlobal = false;
    }
  }, [filterModule]);

  const forceRefreshScans = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    await fetchAllScans(true);
    isRefreshingRef.current = false;
  }, [fetchAllScans]);

  // ONLY fetch on mount if global cache is empty
  useEffect(() => {
    if (!globalInitialLoadDone) {
      fetchAllScans(true);
    }
  }, []); // Empty dependency = runs once on mount ONLY

  // When filter changes, fetch fresh data
  useEffect(() => {
    if (globalInitialLoadDone) {
      fetchAllScans(true);
    }
  }, [filterModule]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    setScanOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const handleStartScan = (module, target) => {
    setSelectedModule(module);
    setShowAddAssets(true);
  };

  const handleStartCustomScan = () => {
    console.log('Starting custom scan with options:', scanOptions);
  };

  const handleSaveAssets = async (assetData) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setLoading(true);
    
    const module = getModuleById(assetData.moduleType);
    const apiBase = module?.api || '/api/modules/job-recruitment';
    
    try {
      const response = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...assetData.assets, project_id: selectedProjectForScan?.id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchAllScans(true);
        setShowAddAssets(false);
        setSelectedModule(null);
      } 
    } catch (error) {
      console.error('Error saving scan:', error);
    } finally {
      setLoading(false);
      isSavingRef.current = false;
    }
  };

  const handleRemoveScan = async (scanId, moduleId) => {
    setLoading(true);
    const module = getModuleById(moduleId);
    const apiBase = module?.api || '/api/modules/job-recruitment';
    const url = `${apiBase}?id=${scanId}`;
    
    try {
      const response = await fetch(url, { method: 'DELETE' });
      const data = await response.json();
      
      if (data.success) {
        await forceRefreshScans();
      }
    } catch (error) {
      console.error('Error removing scan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditScan = (scan) => {
    setEditingScan({ id: scan.originalId, toolId: scan.moduleId, tool: scan.moduleName, assets: scan.assets, status: scan.status });
    setShowEditAssets(true);
  };

  const handleUpdateAssets = async (scanId, updatedAssets) => {
    if (!editingScan) return;
    setLoading(true);
    const module = getModuleById(editingScan.toolId);
    const apiBase = module?.api || '/api/modules/job-recruitment';
    
    try {
      const response = await fetch(`${apiBase}?id=${scanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAssets)
      });
      const data = await response.json();
      
      if (data.success) {
        await forceRefreshScans();
        setShowEditAssets(false);
        setEditingScan(null);
      } else {
      }
    } catch (error) {
      console.error('Error updating assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalScans = scanHistory.length + runningScans.length;
  const currentFilterModule = getModuleById(filterModule);
  const filterDisplayName = filterModule === 'all' ? 'All Modules' : currentFilterModule.name;

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-3 sm:space-y-4 animate-pulse">
      <div className="bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10"></div>
            <div>
              <div className="h-4 sm:h-5 w-24 sm:w-32 bg-white/10 rounded mb-1 sm:mb-2"></div>
              <div className="h-3 sm:h-4 w-36 sm:w-48 bg-white/10 rounded"></div>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10"></div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10"></div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10"></div>
          </div>
        </div>
      </div>
      <div className="bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10"></div>
            <div>
              <div className="h-4 sm:h-5 w-28 sm:w-40 bg-white/10 rounded mb-1 sm:mb-2"></div>
              <div className="h-3 sm:h-4 w-40 sm:w-52 bg-white/10 rounded"></div>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10"></div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10"></div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header Section - Fully Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
            </svg>
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Scan Dashboard</h1>
            <p className="text-white/40 text-xs sm:text-sm mt-0.5 sm:mt-1">Showing: <span className="text-purple-400">{filterDisplayName}</span></p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Refresh Button */}
          <button
            onClick={forceRefreshScans}
            disabled={loading}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white disabled:opacity-50 text-sm sm:text-base"
            title="Refresh Scans"
          >
            <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden xs:inline text-xs sm:text-sm">Refresh</span>
          </button>
          
          {/* Filter Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white text-sm sm:text-base">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              <span className="hidden xs:inline">Filter</span>
              <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${showFilterDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-gradient-to-b from-gray-900 to-black rounded-xl border border-white/10 shadow-2xl z-[10000] overflow-hidden animate-fadeIn">
                <div className="p-2 border-b border-white/10"><h3 className="text-white font-semibold text-xs sm:text-sm px-2">Filter by Module</h3></div>
                <div className="p-2 max-h-80 overflow-y-auto">
                  <button onClick={() => { setFilterModule('all'); setShowFilterDropdown(false); }} className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm ${filterModule === 'all' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    <span className="flex-1 text-left">All Modules</span>
                    {filterModule === 'all' && <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  {ALL_MODULES.map((module) => (
                    <button key={module.id} onClick={() => { setFilterModule(module.id); setShowFilterDropdown(false); }} className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm ${filterModule === module.id ? `bg-gradient-to-r ${module.color} text-white` : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                      {getIcon(module.icon, "w-3.5 h-3.5 sm:w-4 sm:h-4")}
                      <span className="flex-1 text-left">{module.name}</span>
                      {filterModule === module.id && <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Total Scans Box */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2">
            <div className="text-[10px] sm:text-xs text-white/40 whitespace-nowrap">Total Scans</div>
            <div className="text-lg sm:text-xl font-bold text-white">{totalScans}</div>
          </div>
        </div>
      </div>

      <ScanTabs activeScanTab={activeScanTab} setActiveScanTab={setActiveScanTab} />

      {/* Show loading skeleton ONLY on first-ever load with no cached data */}
      {loading && !globalInitialLoadDone ? (
        <LoadingSkeleton />
      ) : (
        <>
          <RunningScans
            runningScans={runningScans}
            onEditScan={handleEditScan}
            onRemoveScan={handleRemoveScan}
          />

          {/* Only show "No Active Scans" when not loading and no running scans */}
          {!loading && runningScans.length === 0 && globalInitialLoadDone && (
            <div className="text-center py-8 sm:py-12 animate-fadeIn">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-white font-semibold text-base sm:text-lg mb-1 sm:mb-2">No Active Scans</h3>
              <p className="text-white/40 text-xs sm:text-sm">Click on any module above to start an investigation</p>
            </div>
          )}
        </>
      )}

      {activeScanTab === 'module' && <InvestigationModules onStartScan={handleStartScan} selectedTarget={selectedProjectForScan?.name || searchInput} />}
      {activeScanTab === 'custom' && <CustomScanConfig scanOptions={scanOptions} toggleOption={toggleOption} selectedProjectForScan={selectedProjectForScan} searchInput={searchInput} onStartCustomScan={handleStartCustomScan} isLoading={loading} />}
      {activeScanTab === 'scheduled' && <ScheduledScans scanHistory={scanHistory} runningScans={runningScans} />}
      
      <ScanHistory scanHistory={scanHistory} onRemoveScan={handleRemoveScan} />

      <AddAssetsModal isOpen={showAddAssets} onClose={() => setShowAddAssets(false)} moduleType={selectedModule?.id} moduleName={selectedModule?.name} onSave={handleSaveAssets} projectId={selectedProjectForScan?.id} />
      <EditAssetsModal isOpen={showEditAssets} onClose={() => setShowEditAssets(false)} scan={editingScan} onUpdate={handleUpdateAssets} />

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 2s infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @media (min-width: 480px) {
          .xs\\:inline { display: inline; }
        }
      `}</style>
    </div>
  );
};

export default ScanDashboard;