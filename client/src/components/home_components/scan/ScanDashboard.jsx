import React, { useState, useEffect } from 'react';
import ScanTabs from './ScanTabs';
import { InvestigationModules, CustomScanConfig } from './core/Modules';
import { RunningScans, ScanHistory, ScheduledScans } from './core/ScansManager';
import { AddAssetsModal, EditAssetsModal } from './core/Modals';
import { getIconName } from './utils/icons';

const API_BASE = '/api/modules/job-recruitment';

// Helper function to get token from cookies
const getToken = () => {
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(row => row.startsWith('token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

// Helper function to create headers with auth
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
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
  
  // Scan operations state
  const [runningScans, setRunningScans] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showAddAssets, setShowAddAssets] = useState(false);
  const [showEditAssets, setShowEditAssets] = useState(false);
  const [editingScan, setEditingScan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Fetch scans on mount
  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      setAuthError(false);
      const response = await fetch(API_BASE, {
        headers: getAuthHeaders()
      });
      
      if (response.status === 401) {
        setAuthError(true);
        console.error('Authentication failed');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform API data to component format
        const allScans = data.scans.map(scan => ({
          id: scan.id,
          tool: 'Job Recruitment',
          toolId: 'job-recruitment',
          toolIcon: 'job',
          target: scan.assets?.job_title ? 
            `${scan.assets.job_title} at ${scan.assets.company_name}` : 
            'Job Scan',
          status: scan.status,
          progress: scan.progress || 0,
          assets: scan.assets,
          findings: scan.findings_count || Math.floor(Math.random() * 20) + 5
        }));
        
        // Split into running and history
        const running = allScans.filter(s => 
          ['queued', 'running', 'paused'].includes(s.status)
        );
        const history = allScans.filter(s => 
          ['completed', 'stopped', 'failed', 'cancelled'].includes(s.status)
        );
        
        setRunningScans(running);
        setScanHistory(history);
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    }
  };

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
    setLoading(true);
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(assetData.assets)
      });
      
      if (response.status === 401) {
        setAuthError(true);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh scans after saving
        await fetchScans();
        setShowAddAssets(false);
        setSelectedModule(null);
      }
    } catch (error) {
      console.error('Error saving scan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveScan = async (scanId) => {
    if (!window.confirm('Are you sure you want to remove this scan?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}?id=${scanId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.status === 401) {
        setAuthError(true);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh scans after deletion
        await fetchScans();
      }
    } catch (error) {
      console.error('Error removing scan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartScanExecution = (scanId) => {
    setRunningScans(prev => prev.map(scan => 
      scan.id === scanId ? { ...scan, status: 'running' } : scan
    ));

    const interval = setInterval(() => {
      setRunningScans(prev => prev.map(scan => {
        if (scan.id === scanId && scan.status === 'running') {
          const newProgress = scan.progress + Math.random() * 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            setScanHistory(prev => [...prev, { 
              ...scan, 
              progress: 100, 
              status: 'completed', 
              endTime: new Date().toLocaleTimeString()
            }]);
            return null;
          }
          return { ...scan, progress: newProgress };
        }
        return scan;
      }).filter(Boolean));
    }, 1000);
  };

  const handlePauseScan = (scanId) => {
    setRunningScans(prev => prev.map(scan => 
      scan.id === scanId ? { ...scan, status: 'paused' } : scan
    ));
  };

  const handleStopScan = (scanId) => {
    setRunningScans(prev => prev.map(scan => 
      scan.id === scanId ? { ...scan, status: 'stopped' } : scan
    ));
  };

  const handleResumeScan = (scanId) => {
    setRunningScans(prev => prev.map(scan => 
      scan.id === scanId ? { ...scan, status: 'running' } : scan
    ));
    handleStartScanExecution(scanId);
  };

  const handleEditScan = (scan) => {
    setEditingScan(scan);
    setShowEditAssets(true);
  };

  const handleUpdateAssets = async (scanId, updatedAssets) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}?id=${scanId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedAssets)
      });
      
      if (response.status === 401) {
        setAuthError(true);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh scans after update
        await fetchScans();
      }
    } catch (error) {
      console.error('Error updating assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalScans = scanHistory.length + runningScans.length;

  // Show auth error message if needed
  if (authError) {
    return (
      <div className="p-6 space-y-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">Authentication Required</h3>
          <p className="text-white/60 mb-4">Please log in to view your scans.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Simple header with total scans */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3 rounded-2xl">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
            </svg>
          </span>
          <h1 className="text-2xl font-bold text-white">Scan Dashboard</h1>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 px-4 py-2">
          <div className="text-xs text-white/40">Total Scans</div>
          <div className="text-xl font-bold text-white">{totalScans}</div>
        </div>
      </div>

      <ScanTabs activeScanTab={activeScanTab} setActiveScanTab={setActiveScanTab} />

      {/* Active Scans with remove functionality */}
      <RunningScans
        runningScans={runningScans}
        onStartScanExecution={handleStartScanExecution}
        onPauseScan={handlePauseScan}
        onStopScan={handleStopScan}
        onResumeScan={handleResumeScan}
        onEditScan={handleEditScan}
        onRemoveScan={handleRemoveScan}
      />

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
        apiBase={API_BASE}
      />

      <EditAssetsModal
        isOpen={showEditAssets}
        onClose={() => setShowEditAssets(false)}
        scan={editingScan}
        onUpdate={handleUpdateAssets}
        apiBase={API_BASE}
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
