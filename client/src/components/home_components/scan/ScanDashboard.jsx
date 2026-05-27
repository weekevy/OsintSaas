import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { InvestigationModules } from './core/Modules';
import { RunningScans, ScanHistory } from './core/ScansManager';
import { getModuleAddModal, getModuleEditModal } from './modules';
import api from '../../../services/api';
import { useSocket } from '../../../context/SocketContext';
import { ScanCardSkeleton, ScanHistorySkeleton } from './utils/Skeleton';

// Cache for modules data to prevent re-fetching
let cachedModules = null;
let lastFetchTime = null;
const CACHE_DURATION = 30000; // 30 seconds cache

// ─── Module Definitions ───────────────────────────────────────────────────────
const ALL_MODULES = [
  {
    id: 'job-recruitment',
    name: 'Company & Job Scam',
    api: '/api/modules/company-jobscam',
    icon: 'job',
    color: 'from-[#00E5FF] to-[#2DD4BF]',
    textColor: 'text-[#00E5FF]',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Investigation',
    api: '/api/modules/linkedin-investigation',
    icon: 'linkedin',
    color: 'from-[#2DD4BF] to-[#00E5FF]',
    textColor: 'text-[#2DD4BF]',
  },
  {
    id: 'social-media',
    name: 'Social Media OSINT',
    api: '/api/modules/social-media',
    icon: 'social',
    color: 'from-[#FF0088] to-[#FF00CC]',
    textColor: 'text-[#FF0088]',
  },
  {
    id: 'scam-website',
    name: 'Scam Website Analysis',
    api: '/api/modules/scam-website',
    icon: 'globe',
    color: 'from-[#FF8800] to-[#FFBB00]',
    textColor: 'text-[#FF8800]',
  },
  {
    id: 'crypto-wallet',
    name: 'Crypto Wallet Scanner',
    api: '/api/modules/crypto-wallet',
    icon: 'wallet',
    color: 'from-[#8800FF] to-[#CC00FF]',
    textColor: 'text-[#8800FF]',
  },
];

const getModuleById = (moduleId) =>
  ALL_MODULES.find((m) => m.id === moduleId) || ALL_MODULES[0];

const getTargetDisplay = (scan, moduleId) => {
  if (!scan.assets) return 'SCAN';
  switch (moduleId) {
    case 'job-recruitment':
      if (scan.assets?.company_name && scan.assets?.job_title)
        return `${scan.assets.job_title} at ${scan.assets.company_name}`;
      if (scan.assets?.company_name) return scan.assets.company_name;
      if (scan.assets?.recruiter_name) return `Recruiter: ${scan.assets.recruiter_name}`;
      return 'JOB SCAM CHECK';
    case 'linkedin':
      return scan.assets?.profile_name || 'LINKEDIN PROFILE';
    case 'social-media':
      return scan.assets?.display_name || scan.assets?.twitter_url || scan.assets?.facebook_url || 'SOCIAL PROFILE';
    default:
      return 'SCAN';
  }
};

// ─── Main Header ──────────────────────────────────────────────────────────────
const DashboardHeader = ({ onRefresh, isLoading, isRefreshing }) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 lg:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-forwards">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-6 lg:h-8 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
          <h1 className="text-2xl md:text-[32px] font-bold text-white tracking-tight">Scan Terminal</h1>
        </div>
        <p className="text-white/40 text-[10px] lg:text-sm font-medium tracking-wide">Execute OSINT modules and monitor live investigation streams.</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
        <button
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-white/10 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/30 text-white/50 hover:text-[#00E5FF] transition-all duration-300 text-[10px] sm:text-[11px] uppercase tracking-widest font-bold disabled:opacity-35 active:scale-95 transform-gpu"
        >
          <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Terminal
        </button>
      </div>
    </header>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ScanDashboard = ({ searchInput, selectedProject }) => {
  const { socket, isConnected, joinProject } = useSocket();

  const [runningScans, setRunningScans] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [status, setStatus] = useState('idle');
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const fetchingRef = useRef(false);
  const [newScanIds, setNewScanIds] = useState(new Set());
  const prevScanIdsRef = useRef(new Set());

  const [selectedModule, setSelectedModule] = useState(null);
  const [showAddAssets, setShowAddAssets] = useState(false);
  const [showEditAssets, setShowEditAssets] = useState(false);
  const [editingScan, setEditingScan] = useState(null);

  const fetchAbortRef = useRef(null);
  const isSavingRef = useRef(false);
  const isEditOpenRef = useRef(false);
  const isAddOpenRef = useRef(false);
  const refreshTimeoutRef = useRef(null);

  const processScans = useCallback((all) => {
    const allNextIds = new Set(all.map((s) => s.id));
    const brandNew = new Set([...allNextIds].filter((id) => !prevScanIdsRef.current.has(id)));
    if (brandNew.size > 0 && prevScanIdsRef.current.size > 0) {
      setNewScanIds(brandNew);
      setTimeout(() => setNewScanIds(new Set()), 700);
    }
    prevScanIdsRef.current = allNextIds;

    setRunningScans(all.filter((s) => ['queued', 'pending', 'running', 'paused', 'failed', 'completed'].includes(s.status)));
    setScanHistory(all.filter((s) => ['completed', 'stopped', 'failed', 'cancelled'].includes(s.status)));
    
    // Ensure skeleton is visible for a minimum duration for smoothness
    const elapsed = Date.now() - (lastFetchTime || 0);
    const minLoadTime = 450; 
    const remaining = Math.max(0, minLoadTime - (elapsed % 1000)); // Rough estimate if we just started

    setTimeout(() => {
      setInitialLoadDone(true);
      setStatus('idle');
    }, silentRef.current ? 0 : 400); 
  }, []);

  const silentRef = useRef(false);

  const socketTimeoutRef = useRef(null);

  const runHttpFallback = useCallback(async ({ silent = false } = {}) => {
    if (fetchingRef.current && !silent) return;
    fetchingRef.current = true;
    console.log('Running HTTP fallback for scans fetch...');
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    try {
      const results = await Promise.allSettled(
        ALL_MODULES.map(async (module) => {
          let url = `${module.api}?_=${Date.now()}`;
          if (selectedProject?.id) {
            url += `&projectId=${selectedProject.id}`;
          }
          const response = await api.get(url, { signal: controller.signal });
          const data = response.data;
          if (!data.success || !data.scans?.length) return [];
          return data.scans.map((scan) => ({
            id: `${module.id}_${scan.id}`,
            originalId: scan.id,
            moduleId: module.id,
            moduleName: module.name,
            moduleIcon: module.icon,
            moduleColor: module.color,
            moduleTextColor: module.textColor,
            target: getTargetDisplay(scan, module.id),
            api: module.api,
            status: scan.status,
            progress: scan.progress || 0,
            assets: scan.assets,
            findings: scan.findings_count || 0,
            createdAt: scan.created_at,
          }));
        })
      );

      if (controller.signal.aborted) return;

      const seen = new Set();
      const all = results
        .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
        .filter((scan) => {
          const key = `${scan.moduleId}_${scan.originalId}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      cachedModules = all;
      lastFetchTime = Date.now();
      processScans(all);
    } catch (err) {
      if (err.name === 'CanceledError') return;
      console.error('Fetch all failed:', err);
      if (!silent) setStatus('error');
    } finally {
      fetchingRef.current = false;
    }
  }, [selectedProject?.id, processScans]);

  const socketRef = useRef(socket);
  const isConnectedRef = useRef(isConnected);

  useEffect(() => { socketRef.current = socket; }, [socket]);
  useEffect(() => { isConnectedRef.current = isConnected; }, [isConnected]);

  const fetchAllScans = useCallback(
    async ({ silent = false, useCache = true } = {}) => {
      if (fetchingRef.current && !silent) return;
      
      silentRef.current = silent;

      // Always show loading state for non-silent fetches to ensure the "effect"
      if (!silent) {
        setStatus('loading');
        setInitialLoadDone(false);
      }

      if (useCache && cachedModules && lastFetchTime && (Date.now() - lastFetchTime) < CACHE_DURATION) {
        setTimeout(() => processScans(cachedModules), silent ? 0 : 100);
        return;
      }

      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      if (socketTimeoutRef.current) clearTimeout(socketTimeoutRef.current);
      if (fetchAbortRef.current) fetchAbortRef.current.abort();
      
      // ── Strategic Update: Socket-First Fetching with HTTP Fallback ──
      const currentSocket = socketRef.current;
      const currentConnected = isConnectedRef.current;

      if (currentSocket && currentConnected) {
        fetchingRef.current = true;
        currentSocket.emit('request_scans', { projectId: selectedProject?.id });
        
        // Set a timeout to fallback to HTTP if socket is slow or fails
        socketTimeoutRef.current = setTimeout(() => {
          if (fetchingRef.current) {
            runHttpFallback({ silent: silentRef.current });
          }
        }, 3000);
        return;
      }

      // Initial HTTP call if no socket
      await runHttpFallback({ silent });
    },
    [selectedProject?.id, processScans, runHttpFallback]
  );

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('scans_list', (data) => {
      console.log('Socket scans_list received:', data.success ? 'Success' : 'Failed');
      fetchingRef.current = false;
      if (data.success) {
        if (socketTimeoutRef.current) clearTimeout(socketTimeoutRef.current);
        // Hydrate with UI-specific module info that might be missing from server response
        const hydratedScans = data.scans.map(s => {
          const mod = getModuleById(s.moduleId);
          return {
            ...s,
            moduleIcon: mod.icon,
            moduleColor: mod.color,
            moduleTextColor: mod.textColor,
            api: mod.api
          };
        });
        cachedModules = hydratedScans;
        lastFetchTime = Date.now();
        processScans(hydratedScans);
      } else {
        console.error('Socket scans_list error:', data.error);
        // If socket failed, immediately try HTTP fallback instead of waiting for timeout
        if (socketTimeoutRef.current) {
          clearTimeout(socketTimeoutRef.current);
          runHttpFallback();
        }
      }
    });

    socket.on('scan_progress', (data) => {
      setRunningScans(prev => prev.map(scan => {
        if (scan.originalId === data.scan_id) {
          return { ...scan, progress: data.progress, status: data.status || 'running' };
        }
        return scan;
      }));
    });

    socket.on('scan_completed', () => {
      fetchAllScans({ silent: true, useCache: false });
    });

    return () => {
      socket.off('scans_list');
      socket.off('scan_progress');
      socket.off('scan_completed');
    };
  }, [socket, isConnected, fetchAllScans, processScans]);

  useEffect(() => {
    if (selectedProject?.id) {
      joinProject(selectedProject.id);
    }
  }, [selectedProject?.id, joinProject]);

  // Initial load
  useEffect(() => {
    fetchAllScans({ useCache: false });
    
    return () => {
      if (fetchAbortRef.current) fetchAbortRef.current.abort();
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [fetchAllScans, selectedProject?.id]);

  const handleStartScan = useCallback((module) => {
    if (isAddOpenRef.current) return;
    isAddOpenRef.current = true;
    setSelectedModule(module);
    setShowAddAssets(true);
  }, []);

  const handleCloseAdd = useCallback(() => {
    setShowAddAssets(false);
    setSelectedModule(null);
    setTimeout(() => { isAddOpenRef.current = false; }, 100);
  }, []);

  const handleSaveAssets = useCallback(
    async (assetData) => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;
      const module = getModuleById(assetData.moduleType);
      const apiBase = module?.api || '/api/modules/company-jobscam';
      try {
        let success = false;
        if (assetData.files?.length) {
          const fd = new FormData();
          fd.append('project_id', selectedProject?.id || '');
          Object.entries(assetData.assets).forEach(([k, v]) => v && fd.append(k, v));
          assetData.files.forEach((file, i) => fd.append(`evidence_${i}`, file));
          const res = await fetch(apiBase, { method: 'POST', body: fd });
          const data = await res.json();
          success = data.success;
        } else {
          const res = await fetch(apiBase, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...assetData.assets, project_id: selectedProject?.id }),
          });
          const data = await res.json();
          success = data.success;
        }
        if (success) { 
          handleCloseAdd(); 
          setTimeout(() => fetchAllScans({ silent: true, useCache: false }), 300);
        }
      } catch (err) {
        console.error('Save error:', err);
      } finally {
        isSavingRef.current = false;
      }
    },
    [selectedProject, handleCloseAdd, fetchAllScans]
  );

  const handleRemoveScan = useCallback(
    async (scanId, moduleId) => {
      const module = getModuleById(moduleId);
      const apiBase = module?.api || '/api/modules/company-jobscam';
      setRunningScans((p) => p.filter((s) => s.originalId !== scanId));
      setScanHistory((p) => p.filter((s) => s.originalId !== scanId));
      try {
        const res = await fetch(`${apiBase}?id=${scanId}`, { method: 'DELETE' });
        await res.json();
      } catch (err) {
        console.error('Remove error:', err);
      }
    },
    []
  );

  const handleEditScan = useCallback((scan) => {
    if (isEditOpenRef.current) return;
    isEditOpenRef.current = true;
    setEditingScan({ id: scan.originalId, toolId: scan.moduleId, tool: scan.moduleName, assets: scan.assets, status: scan.status });
    setShowEditAssets(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setShowEditAssets(false);
    setEditingScan(null);
    setTimeout(() => { isEditOpenRef.current = false; }, 100);
  }, []);

  const handleUpdateAssets = useCallback(
    async (scanId, updatedAssets) => {
      if (!editingScan) return;
      const module = getModuleById(editingScan.toolId);
      const apiBase = module?.api || '/api/modules/job-recruitment';
      try {
        const res = await fetch(`${apiBase}?id=${scanId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedAssets),
        });
        const data = await res.json();
        if (data.success) { handleCloseEdit(); fetchAllScans({ silent: true, useCache: false }); }
      } catch (err) {
        console.error('Update error:', err);
      }
    },
    [editingScan, fetchAllScans, handleCloseEdit]
  );

  const renderAddModal = () => {
    if (!showAddAssets || !selectedModule) return null;
    const Modal = getModuleAddModal(selectedModule.id);
    if (!Modal) return null;
    return (
      <Modal
        isOpen={showAddAssets}
        onClose={handleCloseAdd}
        moduleType={selectedModule.id}
        moduleName={selectedModule.name}
        onSave={handleSaveAssets}
        projectId={selectedProject?.id}
      />
    );
  };

  const renderEditModal = () => {
    if (!showEditAssets || !editingScan) return null;
    const Modal = getModuleEditModal(editingScan.toolId);
    if (!Modal) return null;
    return (
      <Modal
        isOpen={showEditAssets}
        onClose={handleCloseEdit}
        scan={editingScan}
        onUpdate={handleUpdateAssets}
      />
    );
  };

  const isLoading = status === 'loading';
  const isRefreshing = status === 'refreshing';
  const annotatedRunningScans = useMemo(
    () => runningScans.map((s) => ({ ...s, _isNew: newScanIds.has(s.id) })),
    [runningScans, newScanIds]
  );

  return (
    <div className="dashboard-ambient min-h-screen font-sans text-white transform-gpu">
      <div className="relative max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-10 py-5 sm:py-8 md:py-10 pb-16">

        {/* ── HEADER ── */}
        <DashboardHeader
          onRefresh={() => fetchAllScans({ silent: true, useCache: false })}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
        />

        {/* ── MAIN TERMINAL PIPELINE ── */}
        <div className="space-y-12">
          
          {/* ── MONITOR LAYER ── */}
          <section className="duration-500 ease-out fill-mode-forwards">
            {/* ── Terminal Container (Minimal & Dynamic) ── */}
            <div className="relative bg-black transition-all duration-500 transform-gpu">
              {/* Dynamic Content Area */}
              <div className="z-10 py-4 sm:py-6 relative">
                {/* ── SKELETON LAYER ── */}
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isLoading ? 'opacity-100 visible' : 'opacity-0 invisible absolute inset-x-0 top-4 pointer-events-none'
                  }`}
                >
                  <div className="space-y-4">
                    {[0, 1].map(i => <ScanCardSkeleton key={i} index={i} />)}
                  </div>
                </div>

                {/* ── CONTENT LAYER ── */}
                <div 
                  className={`transition-all duration-300 delay-50 ease-out ${
                    !isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute inset-x-0 top-4 pointer-events-none'
                  }`}
                >
                  {annotatedRunningScans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-16">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-[#00E5FF]/5 blur-3xl rounded-full" />
                        <svg className="w-12 h-12 text-white/10 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-[11px] sm:text-[13px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">No Active Intelligence</p>
                      <p className="text-[9px] text-white/10 uppercase tracking-widest">Awaiting Module Initiation...</p>
                    </div>
                  ) : (
                    <div>
                      <RunningScans
                        runningScans={annotatedRunningScans}
                        onEditScan={handleEditScan}
                        onRemoveScan={handleRemoveScan}
                        onRefresh={() => fetchAllScans({ silent: true, useCache: false })}
                        onUpdateScanStatus={(scanId, newStatus) =>
                          setRunningScans((prev) =>
                            prev.map((s) => s.originalId === scanId ? { ...s, status: newStatus } : s)
                          )
                        }
                        isLoading={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ──  action layer: modules ── */}
          <section className="duration-500 delay-100 ease-out fill-mode-forwards">
            <div className="flex items-center gap-3 mb-6 px-2">
              <h3 className="text-[10px] lg:text-[11px] font-bold text-white/40 tracking-widest uppercase font-sans">2. Initiate Module</h3>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            
            <InvestigationModules
              onStartScan={handleStartScan}
              selectedTarget={selectedProject?.name || searchInput}
              isLoading={isLoading}
            />
          </section>

          {/* ── archive layer: history ── */}
          <section className="duration-500 delay-200 ease-out fill-mode-forwards">
            <div className="flex items-center gap-3 mb-6 px-2">
              <h3 className="text-[10px] lg:text-[11px] font-bold text-white/20 tracking-widest uppercase font-sans">3. Intelligence Archives</h3>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            
            <div className="relative min-h-[100px]">
               {/* ── SKELETON LAYER ── */}
               <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isLoading ? 'opacity-100 visible' : 'opacity-0 invisible absolute inset-0 pointer-events-none'
                  }`}
                >
                  <div className="space-y-4">
                    {[0, 1, 2].map(i => <ScanHistorySkeleton key={i} index={i} />)}
                  </div>
                </div>

                {/* ── CONTENT LAYER ── */}
                <div 
                  className={`transition-all duration-300 delay-50 ease-out ${
                    !isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
                  }`}
                >
                  <ScanHistory scanHistory={scanHistory} onRemoveScan={handleRemoveScan} isLoading={false} />
                </div>
            </div>
          </section>

        </div>
      </div>

      {renderAddModal()}
      {renderEditModal()}
    </div>
  );
};

export default ScanDashboard;
