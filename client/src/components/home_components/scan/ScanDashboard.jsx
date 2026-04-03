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
  
  const initialFetchDone = useRef(false);
  const isSavingRef = useRef(false);

  const fetchAllScans = useCallback(async () => {
    if (isFetching) return;
    
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
      
      const uniqueScansMap = new Map();
      allScans.forEach(scan => {
        const key = `${scan.moduleId}_${scan.originalId}`;
        if (!uniqueScansMap.has(key)) {
          uniqueScansMap.set(key, scan);
        }
      });
      
      const uniqueScans = Array.from(uniqueScansMap.values());
      uniqueScans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setRunningScans(uniqueScans.filter(s => ['queued', 'running', 'paused'].includes(s.status)));
      setScanHistory(uniqueScans.filter(s => ['completed', 'stopped', 'failed', 'cancelled'].includes(s.status)));
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

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchAllScans();
    }
  }, [fetchAllScans]);

  useEffect(() => {
    if (initialFetchDone.current) fetchAllScans();
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
        await fetchAllScans();
        setShowAddAssets(false);
        setSelectedModule(null);
      } else {
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
  console.log('=== DELETE SCAN ===');
  console.log('Scan ID to delete:', scanId);
  console.log('Module ID:', moduleId);
  
  setLoading(true);
  const module = getModuleById(moduleId);
  const apiBase = module?.api || '/api/modules/job-recruitment';
  const url = `${apiBase}?id=${scanId}`;
  console.log('DELETE URL:', url);
  
  try {
    const response = await fetch(url, { method: 'DELETE' });
    const data = await response.json();
    console.log('DELETE Response:', data);
    
    if (data.success) {
      await fetchAllScans();
      alert('Scan deleted successfully');
    } else {
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
            <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              <span>Filter</span>
              <svg className={`w-4 h-4 transition-transform duration-300 ${showFilterDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-gradient-to-b from-gray-900 to-black rounded-xl border border-white/10 shadow-2xl z-[10000] overflow-hidden animate-fadeIn">
                <div className="p-2 border-b border-white/10"><h3 className="text-white font-semibold text-sm px-2">Filter by Module</h3></div>
                <div className="p-2">
                  <button onClick={() => { setFilterModule('all'); setShowFilterDropdown(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${filterModule === 'all' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    <span className="flex-1 text-left">All Modules</span>
                    {filterModule === 'all' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  {ALL_MODULES.map((module) => (
                    <button key={module.id} onClick={() => { setFilterModule(module.id); setShowFilterDropdown(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${filterModule === module.id ? `bg-gradient-to-r ${module.color} text-white` : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                      {getIcon(module.icon, "w-4 h-4")}
                      <span className="flex-1 text-left">{module.name}</span>
                      {filterModule === module.id && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
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

      <RunningScans
        runningScans={runningScans}
        onEditScan={handleEditScan}
        onRemoveScan={handleRemoveScan}
      />

      {!loading && runningScans.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">No Active Scans</h3>
          <p className="text-white/40 text-sm">Click on any module above to start an investigation</p>
        </div>
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
      `}</style>
    </div>
  );
};

export default ScanDashboard;