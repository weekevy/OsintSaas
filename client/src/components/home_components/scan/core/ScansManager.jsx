import React, { useState } from 'react';
import { getIcon } from '../utils/icons';

// ConfirmModal Component - Responsive
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, danger = false }) => {
  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg bg-gradient-to-b from-gray-900 to-black rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden mx-3 sm:mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
          <div className="relative px-4 sm:px-6 py-4 sm:py-5 border-b border-white/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${danger ? 'bg-red-500/20' : 'bg-yellow-500/20'} flex items-center justify-center flex-shrink-0`}>
                {danger ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
                <p className="text-white/40 text-xs sm:text-sm">{message}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <button onClick={onClose} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm">Cancel</button>
            <button onClick={onConfirm} className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 ${danger ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-500/30' : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/30'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ScanProgressModal Component - Responsive
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
    { id: 1, name: 'Initialize Scan', description: 'Setting up investigation parameters', icon: 'rocket', status: 'pending' },
    { id: 2, name: 'Analyze Assets', description: 'Processing all collected assets', icon: 'database', status: 'pending' },
    { id: 3, name: 'Risk Assessment', description: 'Evaluating findings and threats', icon: 'shield', status: 'pending' },
    { id: 4, name: 'Generate Findings', description: 'Compiling investigation results', icon: 'document', status: 'pending' }
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
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (status === 'running') {
      return (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
        </div>
      );
    }
    return (
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center">
        <span className="text-white/40 text-xs sm:text-sm">{stageId}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="relative w-full max-w-4xl sm:max-w-5xl md:max-w-6xl lg:max-w-7xl max-h-[90vh] sm:max-h-[88vh] bg-gradient-to-b from-gray-900 to-black rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden my-4 sm:my-8 mx-3 sm:mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
          <div className="relative px-4 sm:px-6 py-3 sm:py-5 border-b border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">Scan Overview - {scan.tool}</h2>
                  <p className="text-white/40 text-xs sm:text-sm truncate">Target: {scan.target}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 sm:p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Assets Section */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-white font-semibold text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Investigation Assets
            </h3>
            <div className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4">
              {scan.assets && Object.keys(scan.assets).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {Object.entries(scan.assets).map(([key, value]) => (
                    value && value !== '' && (
                      <div key={key} className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white/60 text-[10px] sm:text-xs capitalize mb-0.5">{key.replace(/_/g, ' ')}</h4>
                            <p className="text-white text-xs sm:text-sm break-words">{value}</p>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-xs sm:text-sm text-center py-3 sm:py-4">No assets available</p>
              )}
            </div>
          </div>

          {/* Scan Stages */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-white font-semibold text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Scan Progress
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {stages.map((stage) => {
                const status = getStageStatus(stage.id);
                return (
                  <div key={stage.id} className={`bg-white/5 rounded-xl border p-3 sm:p-4 transition-all ${
                    status === 'running' ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/10'
                  }`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {getStageIcon(stage.id, status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                          <h4 className={`font-medium text-sm sm:text-base truncate ${
                            status === 'running' ? 'text-purple-400' : 'text-white'
                          }`}>
                            {stage.name}
                          </h4>
                          {status === 'completed' && (
                            <span className="text-green-400 text-[10px] sm:text-xs">Completed</span>
                          )}
                          {status === 'running' && (
                            <span className="text-purple-400 text-[10px] sm:text-xs animate-pulse">In Progress...</span>
                          )}
                        </div>
                        <p className="text-white/40 text-xs sm:text-sm">{stage.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scan Details */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-white font-semibold text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Scan Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-white/5 rounded-xl p-2 sm:p-3 border border-white/10">
                <div className="text-white/40 text-[10px] sm:text-xs mb-0.5 sm:mb-1">Module Type</div>
                <div className="text-white font-medium text-sm sm:text-base truncate">{scan.moduleName}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2 sm:p-3 border border-white/10">
                <div className="text-white/40 text-[10px] sm:text-xs mb-0.5 sm:mb-1">Status</div>
                <div className={`font-medium text-sm sm:text-base ${
                  scan.status === 'running' ? 'text-green-400' : 
                  scan.status === 'pending' ? 'text-yellow-400' : 'text-white'
                }`}>
                  {scan.status?.charAt(0).toUpperCase() + scan.status?.slice(1) || 'Unknown'}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-2 sm:p-3 border border-white/10">
                <div className="text-white/40 text-[10px] sm:text-xs mb-0.5 sm:mb-1">Start Time</div>
                <div className="text-white font-medium text-sm sm:text-base truncate">{scan.startTime || 'Not started'}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2 sm:p-3 border border-white/10">
                <div className="text-white/40 text-[10px] sm:text-xs mb-0.5 sm:mb-1">Findings</div>
                <div className="text-white font-medium text-sm sm:text-base">{scan.findings || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-white/10 bg-black/20 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button onClick={onClose} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm">
            Close
          </button>
          {!isScanning && scanStage === 1 && (
            <button onClick={handleStartScan} className="px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all text-sm font-medium flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Scan
            </button>
          )}
          {scanStage === 4 && !isScanning && (
            <button onClick={onGenerateReport} className="px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm font-medium flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// RunningScans Component - Fully Responsive
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

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full animate-pulse" />
          <h3 className="text-white font-semibold text-sm sm:text-base">Active Scans ({runningScans.length})</h3>
        </div>
        <div className="grid gap-3 sm:gap-4">
          {runningScans.map(scan => {
            const module = { color: scan.moduleColor, icon: scan.moduleIcon, textColor: scan.moduleTextColor };
            return (
              <div key={scan.id} className="group bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 p-3 sm:p-5 hover:border-purple-500/50 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${module.color} bg-opacity-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                      {getIcon(module.icon, "w-4 h-4 sm:w-5 sm:h-5")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <h4 className="text-white font-semibold text-sm sm:text-base truncate">{scan.moduleName}</h4>
                        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10 ${module.textColor}`}>{scan.moduleName}</span>
                      </div>
                      <p className={`${module.textColor} text-xs sm:text-sm font-medium mt-0.5 sm:mt-1 truncate`}>Target: {scan.target}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-1 sm:gap-2">
                    {/* Overview Button */}
                    <button onClick={(e) => handleOverviewClick(scan, e)} className="p-1.5 sm:p-2 rounded-lg text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all duration-300 group/btn" title="Overview">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    
                    {/* Edit Button */}
                    <button onClick={() => onEditScan(scan)} className="p-1.5 sm:p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all duration-300 group/btn" title="Edit Assets">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                    
                    {/* Delete Button */}
                    <button onClick={(e) => handleRemoveClick(scan, e)} className="p-1.5 sm:p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 group/btn" title="Delete Scan">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                    
                    {/* Status indicator */}
                    <span className={`flex items-center gap-1 text-xs sm:text-sm ml-1 sm:ml-2 ${scan.status === 'running' ? 'text-green-400' : scan.status === 'paused' ? 'text-yellow-400' : 'text-white/40'}`}>
                      {scan.status === 'running' && <><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Running</>}
                      {scan.status === 'paused' && <><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />Paused</>}
                      {scan.status === 'pending' && 'Pending'}
                    </span>
                  </div>
                </div>
                
                {scan.status === 'running' && (
                  <div className="space-y-1.5 sm:space-y-2 mt-2 sm:mt-3">
                    <div className="flex justify-between text-[10px] sm:text-xs"><span className="text-white/40">Progress</span><span className="text-white font-medium">{Math.round(scan.progress)}%</span></div>
                    <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 relative" style={{ width: `${scan.progress}%` }}><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" /></div></div>
                  </div>
                )}
                
                {scan.assets && Object.keys(scan.assets).length > 0 && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10"><div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-white/40"><svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg><span>Assets: {Object.keys(scan.assets).length} items</span></div></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <ConfirmModal isOpen={confirmModal.isOpen} onClose={handleCloseModal} onConfirm={handleConfirmRemove} title="Delete Scan" message="Are you sure you want to permanently delete this scan? This action cannot be undone." danger={true} />
      <ScanProgressModal isOpen={progressModal.isOpen} onClose={handleCloseProgress} scan={progressModal.scan} onGenerateReport={handleGenerateReport} />
    </>
  );
};

// ScanHistory Component - Responsive
export const ScanHistory = ({ scanHistory, onRemoveScan }) => {
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, scan: null });
  const [progressModal, setProgressModal] = useState({ isOpen: false, scan: null });

  if (!scanHistory || scanHistory.length === 0) return null;

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

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3"><div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" /><h3 className="text-white font-semibold text-sm sm:text-base">Recent Scans</h3></div>
        <div className="grid gap-2 sm:gap-3">
          {scanHistory.slice(0, 3).map(scan => (
            <div key={scan.id} className="group bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-xl border border-white/10 p-3 sm:p-4 hover:border-blue-500/50 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">{getIcon(scan.toolIcon)}</div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white font-medium text-sm sm:text-base truncate">{scan.tool}</h4>
                    <p className="text-white/40 text-[10px] sm:text-xs truncate">{scan.target}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 sm:gap-2">
                  <button onClick={(e) => handleOverviewClick(scan, e)} className="p-1.5 sm:p-2 rounded-lg text-purple-400 hover:bg-purple-500/10 transition-all" title="Overview">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </button>
                  <button onClick={(e) => handleRemoveClick(scan, e)} className="p-1.5 sm:p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100" title="Delete scan">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
                    {scan.findings && <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500/20 text-red-400 text-[9px] sm:text-xs rounded-full">{scan.findings} findings</span>}
                    <span className="text-green-400 text-[9px] sm:text-xs bg-green-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">Completed</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ConfirmModal isOpen={confirmModal.isOpen} onClose={handleCloseModal} onConfirm={handleConfirmRemove} title="Delete Scan" message="Are you sure you want to permanently delete this scan from history? This action cannot be undone." danger={true} />
      <ScanProgressModal isOpen={progressModal.isOpen} onClose={handleCloseProgress} scan={progressModal.scan} />
    </>
  );
};

// ScheduledScans Component - Responsive
export const ScheduledScans = ({ scanHistory, runningScans }) => {
  const totalFindings = scanHistory?.reduce((acc, scan) => acc + (scan.findings || 0), 0) || 0;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2"><div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 p-6 sm:p-8 text-center"><div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center"><svg className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><h3 className="text-xl sm:text-2xl font-bold text-white mb-2">No Scheduled Scans</h3><p className="text-white/40 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto">Set up automated recurring scans to continuously monitor your targets</p><button className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all inline-flex items-center gap-2 text-sm sm:text-base"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Create Schedule</button></div></div>
      <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6"><h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Stats</h3><div className="space-y-3 sm:space-y-4"><div><div className="text-xl sm:text-2xl font-bold text-white">{scanHistory?.length || 0}</div><div className="text-white/40 text-xs sm:text-sm">Completed Scans</div></div><div><div className="text-xl sm:text-2xl font-bold text-white">{runningScans?.length || 0}</div><div className="text-white/40 text-xs sm:text-sm">Active Scans</div></div><div><div className="text-xl sm:text-2xl font-bold text-white">{totalFindings}</div><div className="text-white/40 text-xs sm:text-sm">Findings Detected</div></div></div></div>
    </div>
  );
};