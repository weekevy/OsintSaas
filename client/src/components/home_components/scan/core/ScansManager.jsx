import React, { useState } from 'react';
import { getIcon } from '../utils/icons';
import { getModuleAddModal, getModuleEditModal } from '../modules';

// ConfirmModal Component - Tactical
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, danger = false }) => {
  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300" onClick={onClose}>
      <div className="relative w-full max-w-md glass-card rounded-2xl shadow-2xl shadow-[#00E5FF]/10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#00E5FF]/40 rounded-tl-xl" />
        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#00E5FF]/40 rounded-tr-xl" />
        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#00E5FF]/40 rounded-bl-xl" />
        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#00E5FF]/40 rounded-br-xl" />
        
        <div className="relative p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-10 h-10 border-2 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'border-[#f87171]/40' : 'border-[#fbbf24]/40'}`}>
              {danger ? (
                <svg className="w-5 h-5 text-[#f87171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[#fbbf24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="font-sans text-xl font-bold text-white">{title}</h2>
              <p className="text-white/40 text-[10px] font-sans uppercase tracking-[0.08em] mt-1">{message}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-white/20 transition-all duration-200 text-[10px] font-sans uppercase tracking-[0.08em] backdrop-blur-xl">CANCEL</button>
            <button onClick={onConfirm} className={`px-5 py-2 border rounded-xl text-[10px] font-sans uppercase tracking-[0.08em] transition-all duration-200 flex items-center gap-2 backdrop-blur-xl ${danger ? 'border-[#f87171]/40 text-[#f87171] hover:bg-[#f87171]/10' : 'border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF]/10'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              CONFIRM DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ScanProgressModal Component - Tactical
const ScanProgressModal = ({ isOpen, onClose, scan, onGenerateReport }) => {
  const [scanStage, setScanStage] = useState(1);
  const [isScanning, setIsScanning] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { 
      document.body.style.overflow = 'unset'; 
    };
  }, [isOpen]);

  if (!isOpen || !scan) return null;

  const stages = [
    { id: 1, name: 'INITIALIZE SCAN', description: 'Setting up investigation parameters' },
    { id: 2, name: 'ANALYZE ASSETS', description: 'Processing all collected assets' },
    { id: 3, name: 'RISK ASSESSMENT', description: 'Evaluating findings and threats' },
    { id: 4, name: 'GENERATE FINDINGS', description: 'Compiling investigation results' }
  ];

  const handleStartScan = () => {
    setIsScanning(true);
    setScanStage(1);
    
    let currentStage = 1;
    const interval = setInterval(() => {
      if (currentStage < 4) {
        currentStage++;
        setScanStage(currentStage);
      } else {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 3000);
  };

  const getStageStatus = (stageId) => {
    if (stageId < scanStage) return 'completed';
    if (stageId === scanStage && isScanning) return 'running';
    return 'pending';
  };

  const getStageIcon = (stageId, status) => {
    if (status === 'completed') {
      return (
        <div className="w-7 h-7 border border-[#2DD4BF]/40 rounded-lg flex items-center justify-center backdrop-blur-xl">
          <svg className="w-4 h-4 text-[#2DD4BF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (status === 'running') {
      return (
        <div className="w-7 h-7 border border-[#00E5FF]/40 rounded-lg flex items-center justify-center backdrop-blur-xl">
          <div className="w-4 h-4 border-2 border-[#00E5FF]/30 border-t-[#00E5FF] rounded-full" />
        </div>
      );
    }
    return (
      <div className="w-7 h-7 border border-white/[0.08] rounded-lg flex items-center justify-center backdrop-blur-xl">
        <span className="text-white/40 text-xs font-sans">{stageId}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="relative w-full max-w-4xl max-h-[88vh] glass-card rounded-2xl shadow-2xl shadow-[#00E5FF]/10 overflow-hidden my-8 mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#00E5FF]/40 rounded-tl-xl" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#00E5FF]/40 rounded-tr-xl" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#00E5FF]/40 rounded-bl-xl" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#00E5FF]/40 rounded-br-xl" />
        
        <div className="relative px-6 py-4 border-b border-white/[0.08] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 border border-[#00E5FF]/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-sans text-xl font-bold text-white truncate">SCAN OVERVIEW - {scan.tool}</h2>
                <p className="text-white/40 text-[10px] font-sans uppercase tracking-[0.08em] truncate">TARGET: {scan.target}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-[#00E5FF] transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(88vh-120px)] font-sans">
          {/* Assets Section */}
          <div className="mb-6">
            <h3 className="text-white font-sans text-[10px] font-bold uppercase tracking-[0.12em] mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              INVESTIGATION ASSETS
            </h3>
            <div className="bg-white/5 border border-white/[0.08] rounded-xl p-4 backdrop-blur-xl">
              {scan.assets && Object.keys(scan.assets).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(scan.assets).map(([key, value]) => (
                    value && value !== '' && (
                      <div key={key} className="bg-white/5 p-3 border border-white/[0.08] rounded-lg backdrop-blur-xl">
                        <h4 className="text-white/50 text-[8px] font-sans uppercase tracking-[0.12em] mb-1">{key.replace(/_/g, ' ')}</h4>
                        <p className="text-white text-[11px] font-sans break-words">{value}</p>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-[10px] font-sans text-center py-6">NO ASSETS AVAILABLE</p>
              )}
            </div>
          </div>

          {/* Scan Stages */}
          <div className="mb-6">
            <h3 className="text-white font-sans text-[10px] font-bold uppercase tracking-[0.12em] mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              SCAN PROGRESS
            </h3>
            <div className="space-y-3">
              {stages.map((stage) => {
                const status = getStageStatus(stage.id);
                return (
                  <div key={stage.id} className={`bg-white/5 border p-4 rounded-xl transition-all duration-200 backdrop-blur-xl ${status === 'running' ? 'border-[#00E5FF]/50' : 'border-white/[0.08]'}`}>
                    <div className="flex items-center gap-3">
                      {getStageIcon(stage.id, status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h4 className={`font-sans text-[11px] font-bold uppercase tracking-[0.08em] ${status === 'running' ? 'text-[#00E5FF]' : 'text-white'}`}>
                            {stage.name}
                          </h4>
                          {status === 'completed' && <span className="text-[#2DD4BF] text-[8px] font-sans uppercase">COMPLETED</span>}
                          {status === 'running' && <span className="text-[#00E5FF] text-[8px] font-sans uppercase">IN PROGRESS</span>}
                        </div>
                        <p className="text-white/40 text-[9px] font-sans">{stage.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scan Details */}
          <div className="mb-6">
            <h3 className="text-white font-sans text-[10px] font-bold uppercase tracking-[0.12em] mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              SCAN DETAILS
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 border border-white/[0.08] rounded-lg backdrop-blur-xl">
                <div className="text-white/40 text-[8px] font-sans uppercase tracking-[0.12em] mb-1">MODULE</div>
                <div className="text-white text-[10px] font-sans truncate">{scan.moduleName}</div>
              </div>
              <div className="bg-white/5 p-3 border border-white/[0.08] rounded-lg backdrop-blur-xl">
                <div className="text-white/40 text-[8px] font-sans uppercase tracking-[0.12em] mb-1">STATUS</div>
                <div className={`text-[10px] font-sans font-bold ${
                  scan.status === 'running' ? 'text-[#2DD4BF]' : 
                  scan.status === 'pending' ? 'text-[#fbbf24]' : 'text-white'
                }`}>
                  {scan.status?.toUpperCase() || 'UNKNOWN'}
                </div>
              </div>
              <div className="bg-white/5 p-3 border border-white/[0.08] rounded-lg backdrop-blur-xl">
                <div className="text-white/40 text-[8px] font-sans uppercase tracking-[0.12em] mb-1">START TIME</div>
                <div className="text-white text-[10px] font-sans truncate">{scan.startTime || 'NOT STARTED'}</div>
              </div>
              <div className="bg-white/5 p-3 border border-white/[0.08] rounded-lg backdrop-blur-xl">
                <div className="text-white/40 text-[8px] font-sans uppercase tracking-[0.12em] mb-1">FINDINGS</div>
                <div className="text-white text-[10px] font-sans">{scan.findings || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/[0.08] bg-black/20 backdrop-blur-xl flex justify-end gap-3 font-sans">
          <button onClick={onClose} className="px-4 py-2 border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-white/20 transition-all duration-200 text-[10px] font-sans uppercase tracking-[0.08em] backdrop-blur-xl">CLOSE</button>
          {!isScanning && scanStage === 1 && (
            <button onClick={handleStartScan} className="px-5 py-2 border border-[#2DD4BF]/40 rounded-xl text-[#2DD4BF] hover:bg-[#2DD4BF]/10 transition-all duration-200 text-[10px] font-sans uppercase tracking-[0.08em] flex items-center gap-2 backdrop-blur-xl">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              START SCAN
            </button>
          )}
          {scanStage === 4 && !isScanning && (
            <button onClick={onGenerateReport} className="px-5 py-2 border border-[#00E5FF]/40 rounded-xl text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all duration-200 text-[10px] font-sans uppercase tracking-[0.08em] flex items-center gap-2 backdrop-blur-xl">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              GENERATE REPORT
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// RunningScans Component - Tactical
export const RunningScans = ({ runningScans, onEditScan, onRemoveScan }) => {
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, scan: null });
  const [progressModal, setProgressModal] = useState({ isOpen: false, scan: null });

  if (!runningScans || runningScans.length === 0) return null;

  const handleRemoveClick = (scan, e) => {
    e.stopPropagation();
    setConfirmModal({ isOpen: true, scan });
  };

  const handleOverviewClick = (scan, e) => {
    e.stopPropagation();
    setProgressModal({ isOpen: true, scan });
  };

  const handleConfirmRemove = () => {
    if (confirmModal.scan && onRemoveScan) {
      onRemoveScan(confirmModal.scan.originalId, confirmModal.scan.moduleId);
    }
    setConfirmModal({ isOpen: false, scan: null });
  };

  const handleCloseModal = () => setConfirmModal({ isOpen: false, scan: null });
  const handleCloseProgress = () => setProgressModal({ isOpen: false, scan: null });
  const handleGenerateReport = () => {
    alert('Report generation will be available soon!');
    handleCloseProgress();
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'running':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 border border-[#2DD4BF]/40 rounded-lg text-[#2DD4BF] text-[9px] font-sans uppercase tracking-[0.08em] backdrop-blur-xl"><span className="w-1.5 h-1.5 bg-[#2DD4BF] rounded-full" />RUNNING</span>;
      case 'paused':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 border border-[#fbbf24]/40 rounded-lg text-[#fbbf24] text-[9px] font-sans uppercase tracking-[0.08em] backdrop-blur-xl"><span className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full" />PAUSED</span>;
      case 'pending':
        return <span className="px-2 py-0.5 border border-white/20 rounded-lg text-white/40 text-[9px] font-sans uppercase tracking-[0.08em] backdrop-blur-xl">PENDING</span>;
      default:
        return <span className="px-2 py-0.5 border border-white/20 rounded-lg text-white/40 text-[9px] font-sans uppercase tracking-[0.08em] backdrop-blur-xl">{status?.toUpperCase()}</span>;
    }
  };

  return (
    <div className="font-sans">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-[#2DD4BF] to-[#00E5FF] rounded-full" />
          <h3 className="text-white font-sans text-xs font-bold uppercase tracking-[0.12em]">ACTIVE SCANS ({runningScans.length})</h3>
        </div>
        <div className="grid gap-4">
          {runningScans.map(scan => {
            const module = { color: scan.moduleColor, icon: scan.moduleIcon, textColor: scan.moduleTextColor };
            return (
              <div key={scan.id} className="group glass-card hover:border-[#00E5FF]/40 rounded-2xl transition-all duration-200 p-4 relative overflow-hidden">
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#00E5FF]/40 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#00E5FF]/40 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 border border-[#00E5FF]/40 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:border-[#00E5FF] backdrop-blur-xl`}>
                      {getIcon(module.icon, "w-5 h-5 text-[#00E5FF]")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-white font-sans text-xs font-bold uppercase tracking-[0.08em] truncate">{scan.moduleName}</h4>
                        {getStatusBadge(scan.status)}
                      </div>
                      <p className={`text-[10px] font-sans truncate ${module.textColor}`}>TARGET: {scan.target}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={(e) => handleOverviewClick(scan, e)} className="p-1.5 border border-white/10 rounded-lg text-white/60 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-all duration-200 backdrop-blur-xl" title="Overview">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button onClick={() => onEditScan(scan)} className="p-1.5 border border-white/10 rounded-lg text-white/60 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-all duration-200 backdrop-blur-xl" title="Edit Assets">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                    <button onClick={(e) => handleRemoveClick(scan, e)} className="p-1.5 border border-white/10 rounded-lg text-white/60 hover:border-[#f87171]/40 hover:text-[#f87171] transition-all duration-200 backdrop-blur-xl" title="Delete Scan">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {scan.status === 'running' && (
                  <div className="mt-3 pt-3 border-t border-white/[0.08]">
                    <div className="flex justify-between text-[9px] font-sans mb-1">
                      <span className="text-white/40 uppercase tracking-[0.08em]">PROGRESS</span>
                      <span className="text-white font-sans">{Math.round(scan.progress)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] transition-all duration-500 rounded-full" style={{ width: `${scan.progress}%` }} />
                    </div>
                  </div>
                )}
                
                {scan.assets && Object.keys(scan.assets).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/[0.08]">
                    <div className="flex items-center gap-2 text-[9px] font-sans text-white/40 uppercase tracking-[0.08em]">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                      <span>{Object.keys(scan.assets).length} ASSETS COLLECTED</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <ConfirmModal isOpen={confirmModal.isOpen} onClose={handleCloseModal} onConfirm={handleConfirmRemove} title="DELETE SCAN" message="Are you sure you want to permanently delete this scan? This action cannot be undone." danger={true} />
      <ScanProgressModal isOpen={progressModal.isOpen} onClose={handleCloseProgress} scan={progressModal.scan} onGenerateReport={handleGenerateReport} />
    </div>
  );
};

// ScanHistory Component - Tactical
export const ScanHistory = ({ scanHistory, onRemoveScan }) => {
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, scan: null });
  const [progressModal, setProgressModal] = useState({ isOpen: false, scan: null });
  const [editModal, setEditModal] = useState({ isOpen: false, scan: null });

  if (!scanHistory || scanHistory.length === 0) return null;

  const handleRemoveClick = (scan, e) => {
    e.stopPropagation();
    setConfirmModal({ isOpen: true, scan });
  };

  const handleOverviewClick = (scan, e) => {
    e.stopPropagation();
    setProgressModal({ isOpen: true, scan });
  };

  const handleEditClick = (scan, e) => {
    e.stopPropagation();
    setEditModal({ isOpen: true, scan });
  };

  const handleConfirmRemove = () => {
    if (confirmModal.scan && onRemoveScan) {
      onRemoveScan(confirmModal.scan.originalId, confirmModal.scan.moduleId);
    }
    setConfirmModal({ isOpen: false, scan: null });
  };

  const handleCloseModal = () => setConfirmModal({ isOpen: false, scan: null });
  const handleCloseProgress = () => setProgressModal({ isOpen: false, scan: null });
  const handleCloseEdit = () => setEditModal({ isOpen: false, scan: null });

  const handleUpdateAssets = async (scanId, updatedAssets) => {
    console.log('Assets updated:', scanId, updatedAssets);
    setEditModal({ isOpen: false, scan: null });
  };

  const renderEditModal = () => {
    if (!editModal.scan) return null;
    const moduleType = editModal.scan.toolId;
    const EditModalComponent = getModuleEditModal(moduleType);
    if (!EditModalComponent) return null;
    
    return (
      <EditModalComponent
        isOpen={editModal.isOpen}
        onClose={handleCloseEdit}
        scan={{
          id: editModal.scan.originalId,
          toolId: moduleType,
          tool: editModal.scan.tool,
          assets: editModal.scan.assets,
          status: editModal.scan.status
        }}
        onUpdate={handleUpdateAssets}
      />
    );
  };

  return (
    <div className="font-sans">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
          <h3 className="text-white font-sans text-xs font-bold uppercase tracking-[0.12em]">RECENT SCANS</h3>
        </div>
        <div className="grid gap-3">
          {scanHistory.slice(0, 3).map(scan => (
            <div key={scan.id} className="group glass-card hover:border-[#00E5FF]/40 rounded-xl transition-all duration-200 p-4 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 border border-[#00E5FF]/40 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-xl">
                    {getIcon(scan.toolIcon, "w-4 h-4 text-[#00E5FF]")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white font-sans text-[11px] font-bold uppercase tracking-[0.08em] truncate">{scan.tool}</h4>
                    <p className="text-white/40 text-[9px] font-sans uppercase tracking-[0.08em] truncate">{scan.target}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={(e) => handleOverviewClick(scan, e)} className="p-1.5 border border-white/10 rounded-lg text-white/60 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-all duration-200 backdrop-blur-xl" title="Overview">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </button>
                  <button onClick={(e) => handleEditClick(scan, e)} className="p-1.5 border border-white/10 rounded-lg text-white/60 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-xl" title="Edit Scan">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                  </button>
                  <button onClick={(e) => handleRemoveClick(scan, e)} className="p-1.5 border border-white/10 rounded-lg text-white/60 hover:border-[#f87171]/40 hover:text-[#f87171] transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-xl" title="Delete scan">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <div className="flex gap-1 ml-1">
                    {scan.findings > 0 && <span className="px-1.5 py-0.5 border border-[#f87171]/40 rounded-lg text-[#f87171] text-[8px] font-sans uppercase tracking-[0.08em] backdrop-blur-xl">{scan.findings} FINDINGS</span>}
                    <span className="px-1.5 py-0.5 border border-[#2DD4BF]/40 rounded-lg text-[#2DD4BF] text-[8px] font-sans uppercase tracking-[0.08em] backdrop-blur-xl">COMPLETE</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ConfirmModal isOpen={confirmModal.isOpen} onClose={handleCloseModal} onConfirm={handleConfirmRemove} title="DELETE SCAN" message="Are you sure you want to permanently delete this scan from history? This action cannot be undone." danger={true} />
      <ScanProgressModal isOpen={progressModal.isOpen} onClose={handleCloseProgress} scan={progressModal.scan} />
      {renderEditModal()}
    </div>
  );
};

// ScheduledScans Component - Tactical
export const ScheduledScans = ({ scanHistory, runningScans }) => {
  const totalFindings = scanHistory?.reduce((acc, scan) => acc + (scan.findings || 0), 0) || 0;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      <div className="lg:col-span-2">
        <div className="glass-card rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#00E5FF]/40 rounded-tl-xl" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#00E5FF]/40 rounded-tr-xl" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#00E5FF]/40 rounded-bl-xl" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#00E5FF]/40 rounded-br-xl" />
          
          <div className="w-20 h-20 mx-auto mb-4 border border-[#00E5FF]/40 rounded-xl flex items-center justify-center backdrop-blur-xl">
            <svg className="w-10 h-10 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-sans text-2xl font-bold text-white mb-2">NO SCHEDULED SCANS</h3>
          <p className="text-white/40 text-[10px] font-sans uppercase tracking-[0.08em] mb-6 max-w-md mx-auto">SET UP AUTOMATED RECURRING SCANS TO CONTINUOUSLY MONITOR YOUR TARGETS</p>
          <button className="px-6 py-3 border border-[#00E5FF]/40 rounded-xl text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all duration-200 text-[10px] font-sans uppercase tracking-[0.08em] inline-flex items-center gap-2 backdrop-blur-xl">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            CREATE SCHEDULE
          </button>
        </div>
      </div>
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-white font-sans text-xs font-bold uppercase tracking-[0.12em] mb-4">QUICK STATS</h3>
        <div className="space-y-4">
          <div>
            <div className="text-2xl font-bold text-white font-sans">{scanHistory?.length || 0}</div>
            <div className="text-white/40 text-[9px] font-sans uppercase tracking-[0.08em] mt-1">COMPLETED SCANS</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-sans">{runningScans?.length || 0}</div>
            <div className="text-white/40 text-[9px] font-sans uppercase tracking-[0.08em] mt-1">ACTIVE SCANS</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-sans">{totalFindings}</div>
            <div className="text-white/40 text-[9px] font-sans uppercase tracking-[0.08em] mt-1">FINDINGS DETECTED</div>
          </div>
        </div>
      </div>
    </div>
  );
};