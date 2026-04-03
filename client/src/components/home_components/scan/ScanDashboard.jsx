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

// Get module by ID
const getModuleById = (moduleId) => {
  return ALL_MODULES.find(m => m.id === moduleId) || ALL_MODULES[0];
};

// Flag to prevent multiple simultaneous fetch requests
let isFetching = false;

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
  
  const [runningScans, setRunningScans] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showAddAssets, setShowAddAssets] = useState(false);
  const [showEditAssets, setShowEditAssets] = useState(false);
  const [editingScan, setEditingScan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterModule, setFilterModule] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);
  
  // Track if initial fetch has been done
  const initialFetchDone = useRef(false);
  // Track if save is in progress to prevent double submission
  const isSavingRef = useRef(false);

  // Fetch scans from ALL modules
  const fetchAllScans = useCallback(async () => {
    if (isFetching) {
      console.log('Fetch already in progress, skipping...');
      return;
    }
    
    isFetching = true;
    setLoading(true);
    
    try {
      const modulesToFetch = filterModule === 'all' 
        ? ALL_MODULES 
        : ALL_MODULES.filter(m => m.id === filterModule);
      
      const allScansPromises = modulesToFetch.map(async (module) => {
        try {
          const response = await fetch(module.api);
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
      
      // Remove duplicates
      const uniqueScansMap = new Map();
      allScans.forEach(scan => {
        const key = `${scan.moduleId}_${scan.originalId}`;
        if (!uniqueScansMap.has(key)) {
          uniqueScansMap.set(key, scan);
        }
      });
      
      const uniqueScans = Array.from(uniqueScansMap.values());
      uniqueScans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      const running = uniqueScans.filter(s => 
        ['queued', 'running', 'paused'].includes(s.status)
      );
      const history = uniqueScans.filter(s => 
        ['completed', 'stopped', 'failed', 'cancelled'].includes(s.status)
      );
      
      setRunningScans(running);
      setScanHistory(history);
    } catch (error) {
      console.error('Error fetching all scans:', error);
    } finally {
      setLoading(false);
      isFetching = false;
    }
  }, [filterModule]);

  const getTargetDisplay = (scan, moduleId) => {
    if (!scan.assets) return 'Scan';
    
    switch(moduleId) {
      case 'job-recruitment':
        return scan.assets?.job_title ? 
          `${scan.assets.job_title} at ${scan.assets.company_name}` : 
          'Job Scan';
      case 'linkedin':
        return scan.assets?.profile_name || 'LinkedIn Profile';
      case 'social-media':
        return scan.assets?.display_name || 'Social Profile';
      case 'scam-website':
        return scan.assets?.website_name || 'Suspicious Website';
      case 'email-leak':
        return scan.assets?.email_address || 'Email Check';
      case 'scam-email':
        return scan.assets?.subject || 'Scam Email';
      case 'phone-number':
        return scan.assets?.phone_number || 'Phone Number';
      case 'crypto-wallet':
        return scan.assets?.wallet_address || 'Crypto Wallet';
      default:
        return 'Scan';
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchAllScans();
    }
  }, [fetchAllScans]);

  useEffect(() => {
    if (initialFetchDone.current) {
      fetchAllScans();
    }
  }, [filterModule, fetchAllScans]);

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
    if (isSavingRef.current) {
      console.log('Save already in progress, skipping duplicate...');
      return;
    }
    
    isSavingRef.current = true;
    setLoading(true);
    
    const module = getModuleById(assetData.moduleType);
    const apiBase = module?.api || '/api/modules/job-recruitment';
    
    try {
      const response = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assetData.assets,
          project_id: selectedProjectForScan?.id
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchAllScans();
        setShowAddAssets(false);
        setSelectedModule(null);
      } else {
        console.error('Save failed:', data.error);
        alert(data.error || 'Failed to save scan');
      }
    } catch (error) {
      console.error('Error saving scan:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
      isSavingRef.current = false;
    }
  };

  const handleRemoveScan = async (scanId, moduleId) => {
    if (!window.confirm('Are you sure you want to permanently delete this scan?')) return;
    
    setLoading(true);
    const module = getModuleById(moduleId);
    const apiBase = module?.api || '/api/modules/job-recruitment';
    
    try {
      // Delete the scan - this should cascade to child tables if ON DELETE CASCADE is set
      const response = await fetch(`${apiBase}?id=${scanId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchAllScans();
        alert('Scan deleted successfully');
      } else {
        console.error('Delete failed:', data.error);
        alert(data.error || 'Failed to delete scan');
      }
    } catch (error) {
      console.error('Error removing scan:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditScan = (scan) => {
    // Create a properly formatted scan object for editing
    const editScanData = {
      id: scan.originalId,
      toolId: scan.moduleId,
      tool: scan.moduleName,
      assets: scan.assets,
      status: scan.status
    };
    setEditingScan(editScanData);
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
        await fetchAllScans();
        setShowEditAssets(false);
        setEditingScan(null);
        alert('Assets updated successfully');
      } else {
        alert(data.error || 'Failed to update assets');
      }
    } catch (error) {
      console.error('Error updating assets:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalScans = scanHistory.length + runningScans.length;
  const currentFilterModule = getModuleById(filterModule);
  const filterDisplayName = filterModule === 'all' ? 'All Modules' : currentFilterModule.name;

  return (
    <div className="p-6 space-y-8">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3 rounded-2xl">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
            </svg>
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">Scan Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Showing: <span className="text-purple-400">{filterDisplayName}</span></p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filter</span>
              <svg className={`w-4 h-4 transition-transform duration-300 ${showFilterDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-gradient-to-b from-gray-900 to-black rounded-xl border border-white/10 shadow-2xl z-[10000] overflow-hidden animate-fadeIn">
                <div className="p-2 border-b border-white/10">
                  <h3 className="text-white font-semibold text-sm px-2">Filter by Module</h3>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setFilterModule('all');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      filterModule === 'all'
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="flex-1 text-left">All Modules</span>
                    {filterModule === 'all' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  
                  {ALL_MODULES.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => {
                        setFilterModule(module.id);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        filterModule === module.id
                          ? `bg-gradient-to-r ${module.color} text-white`
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {getIcon(module.icon, "w-4 h-4")}
                      <span className="flex-1 text-left">{module.name}</span>
                      {filterModule === module.id && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 px-4 py-2">
            <div className="text-xs text-white/40">Total Scans</div>
            <div className="text-xl font-bold text-white">{totalScans}</div>
          </div>
        </div>
      </div>

      <ScanTabs activeScanTab={activeScanTab} setActiveScanTab={setActiveScanTab} />

      {/* Running Scans */}
      {runningScans.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full animate-pulse" />
            <h3 className="text-white font-semibold">Active Scans ({runningScans.length})</h3>
          </div>
          
          <div className="grid gap-4">
            {runningScans.map(scan => {
              const module = getModuleById(scan.moduleId);
              return (
                <div key={scan.id} className="group bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${module.color} bg-opacity-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        {getIcon(module.icon, "w-5 h-5")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-semibold">{scan.moduleName}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-white/10 ${module.textColor}`}>
                            {scan.moduleName}
                          </span>
                        </div>
                        <p className={`${module.textColor} text-sm font-medium mt-1`}>
                          Target: {scan.target}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditScan(scan)}
                        className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all duration-300 group/btn"
                        title="Edit Assets"
                      >
                        <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemoveScan(scan.originalId, scan.moduleId)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 group/btn"
                        title="Delete Scan"
                      >
                        <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                      
                      <span className={`flex items-center gap-1 text-sm ml-2 ${
                        scan.status === 'running' ? 'text-green-400' :
                        scan.status === 'paused' ? 'text-yellow-400' :
                        'text-white/40'
                      }`}>
                        {scan.status === 'running' && (
                          <>
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Running
                          </>
                        )}
                        {scan.status === 'paused' && (
                          <>
                            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                            Paused
                          </>
                        )}
                        {scan.status === 'pending' && 'Pending'}
                      </span>
                    </div>
                  </div>

                  {scan.status === 'running' && (
                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Progress</span>
                        <span className="text-white font-medium">{Math.round(scan.progress)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 relative"
                          style={{ width: `${scan.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {scan.assets && Object.keys(scan.assets).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span>Assets: {Object.keys(scan.assets).length} items</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && runningScans.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">No Active Scans</h3>
          <p className="text-white/40 text-sm">Click on any module above to start an investigation</p>
        </div>
      )}

      {activeScanTab === 'module' && (
        <InvestigationModules 
          onStartScan={handleStartScan} 
          selectedTarget={selectedProjectForScan?.name || searchInput}
        />
      )}
      
      {activeScanTab === 'custom' && (
        <CustomScanConfig
          scanOptions={scanOptions}
          toggleOption={toggleOption}
          selectedProjectForScan={selectedProjectForScan}
          searchInput={searchInput}
          onStartCustomScan={handleStartCustomScan}
          isLoading={loading}
        />
      )}
      
      {activeScanTab === 'scheduled' && (
        <ScheduledScans scanHistory={scanHistory} runningScans={runningScans} />
      )}
      
      <ScanHistory 
        scanHistory={scanHistory} 
        onRemoveScan={handleRemoveScan}
      />

      <AddAssetsModal
        isOpen={showAddAssets}
        onClose={() => setShowAddAssets(false)}
        moduleType={selectedModule?.id}
        moduleName={selectedModule?.name}
        onSave={handleSaveAssets}
        projectId={selectedProjectForScan?.id}
      />

      <EditAssetsModal
        isOpen={showEditAssets}
        onClose={() => setShowEditAssets(false)}
        scan={editingScan}
        onUpdate={handleUpdateAssets}
      />

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ScanDashboard;