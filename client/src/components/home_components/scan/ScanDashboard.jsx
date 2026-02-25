import { useState, useEffect } from 'react';
import Header from './Header';
import ProjectSelector from './ProjectSelector';
import ScanTabs from './ScanTabs';
import InvestigationModules from './InvestigationModules';
import CustomScanConfig from './CustomScanConfig';
import ScheduledScans from './ScheduledScans';
import RunningScans from './RunningScans';
import ScanHistory from './ScanHistory';
import AddAssetsModal from './AddAssetsModal';
import EditAssetsModal from './EditAssetsModal';
import { getIconName } from './utils/icons';

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

  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProjectForScan, setSelectedProjectForScan] = useState(selectedProject);
  
  // Scan operations state
  const [runningScans, setRunningScans] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showAddAssets, setShowAddAssets] = useState(false);
  const [showEditAssets, setShowEditAssets] = useState(false);
  const [editingScan, setEditingScan] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setAvailableProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const toggleOption = (option) => {
    setScanOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  // Scan operations
  const handleStartScan = (module, target) => {
    setSelectedModule(module);
    setShowAddAssets(true);
  };

  const handleStartCustomScan = () => {
    // Custom scan logic here
    console.log('Starting custom scan with options:', scanOptions);
  };

  const handleSaveAssets = (assetData) => {
    const newScan = {
      id: Date.now(),
      tool: assetData.moduleName,
      toolId: assetData.moduleType,
      toolIcon: getIconName(assetData.moduleType),
      target: assetData.assets.job_url || assetData.assets.profile_url || assetData.assets.website_url || 'Assets added',
      status: 'pending',
      progress: 0,
      startTime: new Date().toLocaleTimeString(),
      assets: assetData.assets,
      findings: []
    };
    
    setRunningScans([...runningScans, newScan]);
    setShowAddAssets(false);
    setSelectedModule(null);
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
              endTime: new Date().toLocaleTimeString(),
              findings: Math.floor(Math.random() * 20) + 5
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

  const handleUpdateAssets = (scanId, updatedAssets) => {
    setRunningScans(prev => prev.map(scan => 
      scan.id === scanId ? { ...scan, assets: updatedAssets } : scan
    ));
    setScanHistory(prev => prev.map(scan => 
      scan.id === scanId ? { ...scan, assets: updatedAssets } : scan
    ));
  };

  const totalScans = scanHistory.length + runningScans.length;

  return (
    <div className="p-6 space-y-8">
      <Header totalScans={totalScans} />
      {/*
      <ProjectSelector
        searchInput={searchInput}
        onSearchChange={onSearchChange}
        onAnalyze={onAnalyze}
        isAnalyzing={isAnalyzing}
        availableProjects={availableProjects}
        selectedProjectForScan={selectedProjectForScan}
        setSelectedProjectForScan={setSelectedProjectForScan}
      />
      */} 
      <ScanTabs activeScanTab={activeScanTab} setActiveScanTab={setActiveScanTab} />

      {/* ===== ACTIVE SCANS SECTION MOVED TO TOP ===== */}
      <RunningScans
        runningScans={runningScans}
        onStartScanExecution={handleStartScanExecution}
        onPauseScan={handlePauseScan}
        onStopScan={handleStopScan}
        onResumeScan={handleResumeScan}
        onEditScan={handleEditScan}
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
        />
      )}
      
      {activeScanTab === 'scheduled' && (
        <ScheduledScans scanHistory={scanHistory} runningScans={runningScans} />
      )}
      
      <ScanHistory scanHistory={scanHistory} />

      <AddAssetsModal
        isOpen={showAddAssets}
        onClose={() => setShowAddAssets(false)}
        moduleType={selectedModule?.id}
        moduleName={selectedModule?.name}
        onSave={handleSaveAssets}
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
