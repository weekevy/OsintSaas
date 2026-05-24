import React, { useState, useEffect } from 'react';
import { getIcon } from '../utils/icons';
import { getModuleAddModal, getModuleEditModal } from '../modules';
import api from '../../../../services/api';
import { useSocket } from '../../../../context/SocketContext';

const SCAN_STATES_KEY = 'osint_scan_states';

// ──────────────────────────────────────────────────────────────
// InvestigationPopup
// ──────────────────────────────────────────────────────────────
const InvestigationPopup = ({ isOpen, onClose, scan }) => {
  const [logs, setLogs] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [isClosing, setIsClosing] = useState(false);
  const { socket, isConnected } = useSocket();
  const scrollRef = React.useRef(null);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 100);
  };

  // Helper to make technical logs understandable for non-technical users
  const humanizeLog = (message) => {
    if (message.includes('INVOKING')) {
      const module = message.split('INVOKING: ')[1];
      return `Launching deeper analysis: ${module}...`;
    }
    if (message.includes('EXECUTING')) {
      return `Processing and verifying data points...`;
    }
    if (message.includes('COMPLETED')) {
      const module = message.split('COMPLETED: ')[1];
      return `Finished checking ${module}. Insights gathered.`;
    }
    if (message.includes('STARTING PIPELINE')) {
      return `Target identified. Initializing multi-layer OSINT pipeline...`;
    }
    if (message.includes('ANALYZING COLLECTED DATA')) {
      return `Aggregating intelligence. Running risk assessment algorithms...`;
    }
    if (message.includes('DB FINALIZED')) {
      return `Intelligence report finalized. Security clearance granted.`;
    }
    if (message.includes('SKIPPING')) {
      return `Resource check: Skipping unnecessary module to optimize speed.`;
    }
    if (message.includes('Live Threat')) {
      return `Alert: Potential vulnerability or red flag detected in real-time.`;
    }
    if (message.includes('Dispatching target to')) {
      return `Connecting to specialized intelligence node...`;
    }
    if (message.includes('Worker picked up job')) {
      return `System resources allocated. Initializing scan engine.`;
    }
    return message.replace(/\[SYSTEM\]|\[SCAN-\d+\]|\[.*?\]/g, '').trim();
  };

  useEffect(() => {
    if (isOpen && scan) {
      setLogs([{
        id: 'init',
        message: `Initializing investigation for target: ${scan.target}`,
        level: 'INFO',
        timestamp: new Date().toISOString()
      }]);
      setProgress(scan.progress || 0);
      setCurrentStep(scan.progress >= 100 ? 4 : (scan.progress > 0 ? 2 : 1));
    } else {
      setLogs([]);
    }
  }, [isOpen, scan]);

  useEffect(() => {
    let interval;
    if (isOpen && progress < 100) {
      interval = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        setElapsedTime(`${mins}:${secs}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, progress, startTime]);

  useEffect(() => {
    if (!socket || !isConnected || !isOpen || !scan) return;

    const scanId = scan.originalId || scan.id?.split('_').pop();

    const handleLog = (data) => {
      if (String(data.scan_id) === String(scanId)) {
        setLogs(prev => [...prev.slice(-100), {
          id: Date.now() + Math.random(),
          ...data,
          message: humanizeLog(data.message)
        }]);
      }
    };

    const handleProgress = (data) => {
      if (String(data.scan_id) === String(scanId)) {
        setProgress(data.progress);
        if (data.progress >= 100) setCurrentStep(4);
        else if (data.progress > 70) setCurrentStep(3);
        else if (data.progress > 5) setCurrentStep(2);
      }
    };

    socket.on('scan_log', handleLog);
    socket.on('scan_progress', handleProgress);

    return () => {
      socket.off('scan_log', handleLog);
      socket.off('scan_progress', handleProgress);
    };
  }, [socket, isConnected, isOpen, scan]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  const steps = [
    { id: 1, name: 'Preparation', status: currentStep > 1 ? 'completed' : 'running' },
    { id: 2, name: 'Active Intelligence', status: currentStep > 2 ? 'completed' : (currentStep === 2 ? 'running' : 'pending') },
    { id: 3, name: 'Risk Assessment', status: currentStep > 3 ? 'completed' : (currentStep === 3 ? 'running' : 'pending') },
    { id: 4, name: 'Final Report', status: currentStep === 4 && progress >= 100 ? 'completed' : (currentStep === 4 ? 'running' : 'pending') },
  ];

  const getStepIcon = (stepStatus) => {
    if (stepStatus === 'completed') {
      return (
        <div className="w-6 h-6 rounded-full border border-[#2DD4BF]/40 flex items-center justify-center bg-[#2DD4BF]/10">
          <svg className="w-3.5 h-3.5 text-[#2DD4BF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (stepStatus === 'running') {
      return (
        <div className="w-6 h-6 rounded-full border border-[#00E5FF]/40 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
        <span className="text-white/40 text-[10px]">○</span>
      </div>
    );
  };

  return (
    <div 
      className={`fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-100 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fadeIn'}`} 
      onClick={handleClose}
    >
      <div 
        className={`relative w-full max-w-[90vw] h-[85vh] border border-white/10 rounded-2xl bg-[#0A0A0A] overflow-hidden shadow-2xl flex flex-col transition-all duration-100 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-scaleIn'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent" />
        
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-white/[0.07] flex items-center justify-between bg-[#111111]/80">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.1)]">
              <svg className="w-6 h-6 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg font-bold tracking-tight">Investigation Terminal</h2>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[#00E5FF]/70 text-[10px] uppercase font-bold tracking-widest bg-[#00E5FF]/5 px-2 py-0.5 rounded border border-[#00E5FF]/10">OSINT ENGINE V2.0</span>
                <span className="text-white/30 text-[11px] uppercase tracking-wider">Target: {scan?.target}</span>
              </div>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-white/30 hover:text-[#00E5FF] transition-all rounded-lg hover:bg-white/5 active:scale-95">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar: Progress & Info */}
          <div className="w-72 border-r border-white/[0.07] bg-[#0E0E0E] p-6 flex flex-col gap-8 shadow-inner">
            <div>
              <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]/40" />
                Investigation Phase
              </h3>
              <div className="space-y-5">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-3 group">
                    <div className="transition-transform duration-300 group-hover:scale-110">
                      {getStepIcon(step.status)}
                    </div>
                    <span className={`text-xs font-semibold tracking-wide transition-colors duration-300 ${
                      step.status === 'running' ? 'text-[#00E5FF]' :
                      step.status === 'completed' ? 'text-white' : 'text-white/20'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]/40" />
                Execution Progress
              </h3>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <span className="text-[10px] font-bold inline-block py-1 px-2 uppercase rounded-lg text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/10">
                    {progress}% Complete
                  </span>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-white/[0.03] border border-white/[0.05]">
                  <div 
                    style={{ width: `${progress}%` }}
                    className="shadow-[0_0_15px_rgba(0,229,255,0.4)] flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] transition-all duration-700 ease-out"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                Session Intelligence
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors">
                  <div className="text-white/30 text-[8px] uppercase tracking-widest mb-1">Duration</div>
                  <div className="text-[#00E5FF] text-xs font-mono font-bold">{elapsedTime}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors">
                  <div className="text-white/30 text-[8px] uppercase tracking-widest mb-1">Cost</div>
                  <div className="text-[#2DD4BF] text-xs font-mono font-bold">-1 Token</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors">
                  <div className="text-white/30 text-[8px] uppercase tracking-widest mb-1">Health</div>
                  <div className="text-[#a3e635] text-[10px] font-bold">OPTIMAL</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors">
                  <div className="text-white/30 text-[8px] uppercase tracking-widest mb-1">Encryption</div>
                  <div className="text-white/80 text-[9px] font-mono flex items-center gap-1">
                    <span className="w-1 h-1 bg-[#00E5FF] rounded-full animate-pulse" />
                    AES-256
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#00E5FF]/5 rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:bg-[#00E5FF]/10" />
                <div className="text-white/30 text-[8px] uppercase tracking-widest mb-1">Active Module</div>
                <div className="text-white text-sm font-bold tracking-tight">{scan?.moduleName}</div>
                <div className="mt-3 text-white/30 text-[8px] uppercase tracking-widest mb-1">Registry ID</div>
                <div className="text-[#00E5FF]/60 text-xs font-mono">#{scan?.originalId || scan?.id}</div>
              </div>
            </div>
          </div>

          {/* Main Content: Terminal Logs */}
          <div className="flex-1 flex flex-col bg-[#0C0C0C] shadow-2xl relative">
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF]/[0.01] to-transparent pointer-events-none" />
            
            <div className="px-6 py-3 border-b border-white/[0.05] flex items-center justify-between bg-[#141414]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                </div>
                <span className="text-[10px] text-white/40 font-mono tracking-[0.2em] uppercase">Intelligence Stream // CORE_V2</span>
              </div>
              <div className="text-[9px] text-white/30 font-mono bg-white/[0.03] px-3 py-1 rounded-lg border border-white/[0.05] flex items-center gap-2">
                <span className="w-1 h-1 bg-[#2DD4BF] rounded-full animate-pulse" />
                {logs.length} PACKETS
              </div>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-0 font-mono text-[13px] custom-scrollbar"
            >
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 bg-[#0C0C0C]">
                  <div className="w-16 h-16 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin mb-6" />
                  <p className="text-[11px] tracking-[0.3em] font-bold text-[#00E5FF]">INITIALIZING DATA STREAM</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.03]">
                  {logs.map((log, i) => (
                    <div key={log.id} className={`flex gap-5 px-8 py-3.5 group items-start transition-colors duration-100 ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}`}>
                      <span className="text-white/20 flex-shrink-0 w-20 pt-1 text-[11px] font-medium group-hover:text-white/40 transition-colors">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                      </span>
                      <span className={`flex-shrink-0 w-20 font-black text-[9px] tracking-widest pt-1.5 px-2 py-0.5 rounded border border-current bg-current/5 inline-block text-center ${
                        log.level === 'ERROR' ? 'text-red-500/80' :
                        log.level === 'WARNING' ? 'text-yellow-500/80' :
                        log.level === 'SUCCESS' ? 'text-[#2DD4BF]/80' : 'text-[#00E5FF]/60'
                      }`}>
                        {log.level === 'SUCCESS' ? 'SUCCESS' : log.level === 'ERROR' ? 'ERROR' : log.level === 'WARNING' ? 'ALERT' : 'PROCESS'}
                      </span>
                      <span className="text-white/70 group-hover:text-white transition-colors leading-relaxed pt-1">
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="h-8" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.07] bg-[#111111]/90 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span className="text-[10px] text-white/30 font-bold tracking-widest">ENCRYPTED NODE: <span className="text-white/60">ALPHA-9</span></span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-[10px] text-white/20 font-mono">STATION_OSINT_LOCAL</span>
          </div>
          <button 
            onClick={handleClose}
            className="px-8 py-2 bg-[#00E5FF]/5 hover:bg-[#00E5FF]/10 border border-[#00E5FF]/20 hover:border-[#00E5FF]/40 rounded-xl text-[#00E5FF] text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.05)]"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// ConfirmModal
// ──────────────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, danger = false }) => {
  const [isClosing, setIsClosing] = useState(false);

  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 100);
  };

  if (!isOpen) return null;

  const accentColor = danger ? '#f87171' : '#fbbf24';
  const accentClass = danger
    ? 'border-[#f87171]/40 text-[#f87171] hover:bg-[#f87171]/10'
    : 'border-[#fbbf24]/40 text-[#fbbf24] hover:bg-[#fbbf24]/10';

  return (
    <div 
      className={`fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-100 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fadeIn'}`} 
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-sm sm:max-w-md border border-white/10 rounded-2xl bg-[#0A0A0A] overflow-hidden shadow-2xl transition-all duration-100 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-scaleIn'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}55, transparent)` }} />

        <div className="relative p-5 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 border-2 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ borderColor: `${accentColor}55` }}
            >
              {danger ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-white text-base sm:text-lg font-bold">{title}</h2>
              <p className="text-white/40 text-[11px] sm:text-[12px] mt-0.5 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 sm:gap-3 mt-5 sm:mt-6">
            <button
              onClick={handleClose}
              className="px-4 sm:px-5 py-1.5 sm:py-2 border border-white/10 rounded-xl text-white/55 hover:text-white hover:border-white/20 transition-colors text-[10px] sm:text-[11px] uppercase tracking-[0.08em]"
            >
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(); handleClose(); }}
              className={`px-5 sm:px-6 py-1.5 sm:py-2 border rounded-xl text-[10px] sm:text-[11px] uppercase tracking-[0.08em] transition-colors flex items-center gap-1.5 sm:gap-2 ${accentClass}`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// ScanProgressModal
// ──────────────────────────────────────────────────────────────
export const ScanProgressModal = ({ isOpen, onClose, scan, onGenerateReport }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 100);
  };

  if (!isOpen || !scan) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto transition-opacity duration-100 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fadeIn'}`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-2xl sm:max-w-4xl max-h-[92vh] border border-white/10 rounded-2xl bg-[#0A0A0A] overflow-hidden my-4 sm:my-8 shadow-2xl transition-all duration-100 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-scaleIn'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.03] via-transparent to-[#2DD4BF]/[0.02] pointer-events-none" />
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent" />

        <div className="relative px-4 sm:px-6 py-4 sm:py-5 border-b border-white/[0.07] bg-[#111111]/80">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-11 sm:h-11 border border-[#00E5FF]/35 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 bg-[#00E5FF]/5 shadow-[0_0_10px_rgba(0,229,255,0.1)]">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-white text-sm sm:text-lg font-bold truncate tracking-tight">
                  Scan Overview — {scan.tool}
                </h2>
                <p className="text-white/35 text-[10px] sm:text-[11px] truncate mt-0.5">
                  Target: {scan.target}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 sm:p-2 text-white/35 hover:text-[#00E5FF] transition-all rounded-lg hover:bg-white/5 active:scale-95">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative p-4 sm:p-6 overflow-y-auto max-h-[calc(92vh-120px)] bg-[#0C0C0C]/50">
          <div className="mb-5 sm:mb-6">
            <h3 className="text-white text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.14em] mb-2.5 sm:mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]/40" />
              Investigation Assets
            </h3>
            <div className="bg-[#141414] border border-white/[0.05] rounded-xl p-3 sm:p-4 shadow-inner">
              {scan.assets && Object.keys(scan.assets).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {Object.entries(scan.assets).map(([key, value]) =>
                    value && value !== '' ? (
                      <div key={key} className="bg-white/[0.02] p-2.5 sm:p-3 border border-white/[0.05] rounded-lg group hover:border-white/10 transition-colors">
                        <h4 className="text-white/45 text-[9px] uppercase tracking-[0.14em] mb-1">
                          {key.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-white text-[12px] sm:text-[13px] break-words leading-snug">{value}</p>
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                <p className="text-white/30 text-[11px] sm:text-[12px] text-center py-5 sm:py-6">No assets available</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-white text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.14em] mb-2.5 sm:mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]/40" />
              Scan Details
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { label: 'Module', value: scan.moduleName },
                {
                  label: 'Status',
                  value: scan.status?.toUpperCase() || 'UNKNOWN',
                  color: scan.status === 'running' ? 'text-[#2DD4BF]' : scan.status === 'pending' ? 'text-[#fbbf24]' : 'text-white',
                },
                { label: 'Start Time', value: scan.startTime || 'Not started' },
                { label: 'Findings', value: scan.findings || 0 },
              ].map(({ label, value, color = 'text-white' }) => (
                <div key={label} className="bg-[#141414] p-2.5 sm:p-3 border border-white/[0.05] rounded-lg shadow-inner">
                  <div className="text-white/40 text-[8px] sm:text-[9px] uppercase tracking-[0.14em] mb-1">{label}</div>
                  <div className={`text-[12px] sm:text-[13px] font-semibold truncate ${color}`}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative px-4 sm:px-6 py-3 sm:py-4 border-t border-white/[0.07] bg-[#111111]/90 flex justify-end gap-2 sm:gap-3">
          <button
            onClick={handleClose}
            className="px-4 sm:px-5 py-1.5 sm:py-2 border border-white/10 rounded-xl text-white/55 hover:text-white hover:border-white/20 transition-colors text-[10px] sm:text-[11px] uppercase tracking-[0.08em]"
          >
            Close
          </button>
          {onGenerateReport && (
            <button
              onClick={onGenerateReport}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-[#00E5FF]/5 border border-[#00E5FF]/35 rounded-xl text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors text-[10px] sm:text-[11px] uppercase tracking-[0.08em] flex items-center gap-1.5 sm:gap-2 shadow-[0_0_15px_rgba(0,229,255,0.05)]"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// ──────────────────────────────────────────────────────────────
// Helper
// ──────────────────────────────────────────────────────────────
const extractScanId = (compositeId) => {
  const parts = compositeId.split('_');
  return parts[parts.length - 1];
};

// ──────────────────────────────────────────────────────────────
// RunningScans
// ──────────────────────────────────────────────────────────────
export const RunningScans = ({ runningScans, onEditScan, onRemoveScan, onRefresh }) => {
  const { socket, isConnected } = useSocket();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, scan: null });
  const [progressModal, setProgressModal] = useState({ isOpen: false, scan: null });
  const [investigationModal, setInvestigationModal] = useState({ isOpen: false, scan: null });
  // Controls per-card enter animation
  const [visibleCards, setVisibleCards] = useState(new Set());

  const [scanStatuses, setScanStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem(SCAN_STATES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    try { localStorage.setItem(SCAN_STATES_KEY, JSON.stringify(scanStatuses)); } catch {}
  }, [scanStatuses]);

  // Stagger each card's fade-in for a premium feel
  useEffect(() => {
    if (!runningScans || runningScans.length === 0) {
      setVisibleCards(new Set());
      return;
    }
    
    runningScans.forEach((scan, i) => {
      if (!visibleCards.has(scan.id)) {
        const t = setTimeout(() => {
          setVisibleCards(prev => new Set([...prev, scan.id]));
        }, i * 40); // Snappy but smooth stagger
        return () => clearTimeout(t);
      }
    });
  }, [runningScans]);

  // WebSocket listeners for real-time progress
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleProgress = (data) => {
      // Find which scan in runningScans matches this progress update
      const matchingScan = runningScans.find(s => s.originalId === data.scan_id);
      if (matchingScan) {
        updateScanState(matchingScan.id, {
          progress: data.progress,
          status: data.status || 'running'
        });
      }
    };

    const handleCompleted = (data) => {
      const matchingScan = runningScans.find(s => s.originalId === data.scan_id);
      if (matchingScan) {
        updateScanState(matchingScan.id, {
          progress: 100,
          status: 'completed'
        });
        if (onRefresh) onRefresh();
      }
    };

    socket.on('scan_progress', handleProgress);
    socket.on('scan_completed', handleCompleted);

    return () => {
      socket.off('scan_progress', handleProgress);
      socket.off('scan_completed', handleCompleted);
    };
  }, [socket, isConnected, runningScans, onRefresh]);

  // Scans appear instantly for a more professional, less 'laggy' feel when switching tabs
  if (!runningScans || runningScans.length === 0) return null;

  const getScanState = (scanId) => scanStatuses[scanId] || { status: 'pending', isPaused: false, progress: 0 };

  const updateScanState = (scanId, updates) => {
    setScanStatuses(prev => ({ ...prev, [scanId]: { ...getScanState(scanId), ...updates } }));
  };

  const getRealScanId = (scan) => scan.originalId || extractScanId(scan.id);

  const sendEvent = async (scan, eventType, data = {}) => {
    const realScanId = getRealScanId(scan);
    const eventApi = `${scan.api || '/api/modules/company-jobscam'}/event`;
    try {
      const response = await api.post(eventApi, {
        event_type: eventType,
        scan_id: realScanId,
        scan_name: scan.moduleName,
        target: scan.rawTarget || scan.target,
        previous_state: getScanState(scan.id).status,
        data
      });
      return response.data.success;
    } catch (err) {
      console.error(`Event ${eventType} error:`, err.response?.data?.error || err.message);
      return false;
    }
  };

  const patchScan = async (scan, body, onSuccess, onRevert) => {
    const realScanId = getRealScanId(scan);
    const apiBase = scan.api || '/api/modules/company-jobscam';
    try {
      const res = await fetch(`${apiBase}?id=${realScanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!result.success) { console.error('PATCH failed:', result.error); onRevert?.(); }
      else onSuccess?.();
    } catch (err) {
      console.error('PATCH error:', err);
      onRevert?.();
    }
  };

  const handleStartScan = async (scan, e) => {
    e.stopPropagation();
    const prevState = getScanState(scan.id);
    updateScanState(scan.id, { status: 'running', isPaused: false, progress: 0 });
    
    const eventSuccess = await sendEvent(scan, 'start');
    if (eventSuccess) {
      setTimeout(() => onRefresh?.(), 500);
    } else {
      updateScanState(scan.id, prevState);
    }
  };

  const handlePauseClick = async (scan, e) => {
    e.stopPropagation();
    const prevState = getScanState(scan.id);
    updateScanState(scan.id, { isPaused: true });
    
    const eventSuccess = await sendEvent(scan, 'pause');
    if (eventSuccess) {
      setTimeout(() => onRefresh?.(), 500);
    } else {
      updateScanState(scan.id, prevState);
    }
  };

  const handleResumeClick = async (scan, e) => {
    e.stopPropagation();
    const prevState = getScanState(scan.id);
    updateScanState(scan.id, { isPaused: false, status: 'running' });
    
    const eventSuccess = await sendEvent(scan, 'resume');
    if (eventSuccess) {
      setTimeout(() => onRefresh?.(), 500);
    } else {
      updateScanState(scan.id, prevState);
    }
  };

  const handleRemoveClick = (scan, e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, scan }); };
  const handleOverviewClick = (scan, e) => { e.stopPropagation(); setProgressModal({ isOpen: true, scan }); };
  const handleInvestigationClick = (scan, e) => { e.stopPropagation(); setInvestigationModal({ isOpen: false, scan: null }); setTimeout(() => setInvestigationModal({ isOpen: true, scan }), 10); };
  const handleEditClick = (scan, e) => { e?.stopPropagation(); onEditScan(scan); };

  const handleConfirmRemove = async () => {
    if (confirmModal.scan) {
      const scan = confirmModal.scan;
      await sendEvent(scan, 'delete');
      
      setScanStatuses(prev => { const n = { ...prev }; delete n[scan.id]; return n; });
      onRemoveScan?.(scan.originalId, scan.moduleId);
    }
    setConfirmModal({ isOpen: false, scan: null });
  };

  const getStatusBadge = (scanId, originalStatus) => {
    const s = getScanState(scanId);
    const status = originalStatus || s.status;

    if (status === 'failed') return (
      <span className="flex items-center gap-1 px-2 py-0.5 border border-red-500/40 rounded-lg text-red-400 text-[8px] sm:text-[10px] uppercase tracking-[0.08em] bg-red-500/10 whitespace-nowrap">
        <span className="w-1 h-1 bg-red-500 rounded-full" />Failed
      </span>
    );
    if (s.isPaused || status === 'paused') return (
      <span className="flex items-center gap-1 px-2 py-0.5 border border-[#fbbf24]/40 rounded-lg text-[#fbbf24] text-[8px] sm:text-[10px] uppercase tracking-[0.08em] bg-[#fbbf24]/10 whitespace-nowrap">
        <span className="w-1 h-1 bg-[#fbbf24] rounded-full" />Paused
      </span>
    );
    if (status === 'completed') return (
      <span className="flex items-center gap-1 px-2 py-0.5 border border-[#22d3ee]/40 rounded-lg text-[#22d3ee] text-[8px] sm:text-[10px] uppercase tracking-[0.08em] bg-[#22d3ee]/10 whitespace-nowrap">
        <span className="w-1 h-1 bg-[#22d3ee] rounded-full" />Completed
      </span>
    );
    if (status === 'running') return (
      <span className="flex items-center gap-1 px-2 py-0.5 border border-[#2DD4BF]/40 rounded-lg text-[#2DD4BF] text-[8px] sm:text-[10px] uppercase tracking-[0.08em] bg-[#2DD4BF]/10 whitespace-nowrap">
        <span className="w-1 h-1 bg-[#2DD4BF] rounded-full animate-pulse" />Running
      </span>
    );
    return (
      <span className="px-2 py-0.5 border border-white/15 rounded-lg text-white/40 text-[8px] sm:text-[10px] uppercase tracking-[0.08em] whitespace-nowrap">
        Pending
      </span>
    );
  };

  return (
    <>
      <div className="space-y-2 sm:space-y-3">
        {runningScans.map((scan, index) => {
          const module = { color: scan.moduleColor, icon: scan.moduleIcon, textColor: scan.moduleTextColor };
          const s = getScanState(scan.id);
          
          let currentStatus = scan.status;
          if ((currentStatus === 'pending' || currentStatus === 'queued') && s.status === 'running') {
            currentStatus = 'running';
          } else if (currentStatus === 'running' && s.isPaused) {
            currentStatus = 'paused';
          }
          
          const isPending = currentStatus === 'pending' || currentStatus === 'queued';
          const isRunning = currentStatus === 'running' && !s.isPaused;
          const isPaused = currentStatus === 'paused' || s.isPaused;
          const isCompleted = currentStatus === 'completed';
          const isFailed = currentStatus === 'failed';
          
          const progress = isCompleted ? 100 : (scan.progress !== undefined ? scan.progress : (s.progress || 0));
          const isVisible = visibleCards.has(scan.id);

          return (
            <div
              key={scan.id}
              className={`relative border border-white/10 hover:border-[#00E5FF]/30 rounded-xl sm:rounded-2xl transition-all duration-500 bg-black overflow-hidden ${
                isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-[0.99]'
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {/* Atmospheric inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.04] via-transparent to-[#2DD4BF]/[0.02] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#00E5FF]/[0.04] rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent" />

              <div className="relative p-3 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
                  <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0">
                    <div className="relative w-9 h-9 sm:w-12 sm:h-12 border border-[#00E5FF]/40 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 bg-[#00E5FF]/10 shadow-inner shadow-[#00E5FF]/5">
                      <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#00E5FF]/10 to-transparent" />
                      <span className="relative">{getIcon(module.icon, "w-4 h-4 sm:w-6 sm:h-6 text-[#00E5FF]")}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <h4 className="text-white text-[11px] sm:text-[13px] font-bold uppercase tracking-[0.06em] truncate">
                          {scan.moduleName}
                        </h4>
                        {getStatusBadge(scan.id, currentStatus)}
                      </div>
                      <p className={`text-[9px] sm:text-[11px] truncate ${module.textColor || 'text-[#00E5FF]/60'}`}>
                        Target: {scan.target}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                    {isPending && (
                      <button
                        onClick={(e) => handleStartScan(scan, e)}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-[#00E5FF]/40 rounded-lg text-[#00E5FF] hover:bg-[#00E5FF]/15 transition-all duration-100 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] bg-[#00E5FF]/5"
                      >
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                        Start
                      </button>
                    )}

                    {isFailed && (
                      <button
                        onClick={(e) => handleStartScan(scan, e)}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-red-500/40 rounded-lg text-red-400 hover:bg-red-500/15 transition-all duration-100 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] bg-red-500/5"
                      >
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Retry
                      </button>
                    )}

                    {!isPending && !isFailed && (
                      <button
                        onClick={(e) => handleInvestigationClick(scan, e)}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-[#00E5FF]/40 rounded-lg text-[#00E5FF] hover:bg-[#00E5FF]/15 transition-all duration-100 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] bg-[#00E5FF]/5"
                      >
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Details
                      </button>
                    )}

                    {isRunning && (
                      <button
                        onClick={(e) => handlePauseClick(scan, e)}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-[#fbbf24]/40 rounded-lg text-[#fbbf24] hover:bg-[#fbbf24]/15 transition-all duration-100 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] bg-[#fbbf24]/5"
                      >
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pause
                      </button>
                    )}

                    {isPaused && !isFailed && (
                      <button
                        onClick={(e) => handleResumeClick(scan, e)}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-[#2DD4BF]/40 rounded-lg text-[#2DD4BF] hover:bg-[#2DD4BF]/15 transition-all duration-100 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] bg-[#2DD4BF]/5"
                      >
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Resume
                      </button>
                    )}

                    <button
                      onClick={(e) => handleEditClick(scan, e)}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-white/15 rounded-lg text-white/60 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all duration-100 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em]"
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                      Edit
                    </button>

                    <button
                      onClick={(e) => handleRemoveClick(scan, e)}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-[#f87171]/30 rounded-lg text-[#f87171] hover:bg-[#f87171]/15 transition-all duration-100 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] bg-[#f87171]/[0.04]"
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      <span className="hidden sm:inline">Delete</span>
                      <span className="sm:hidden">Del</span>
                    </button>
                  </div>
                </div>

                {(isRunning || isPaused || isFailed || isCompleted) && (
                  <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-white/[0.07]">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {isRunning && !isPaused ? (
                          <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 border border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${isFailed ? 'bg-red-500' : isCompleted ? 'bg-[#22d3ee]' : isPaused ? 'bg-[#fbbf24]' : 'bg-[#00E5FF]'}`} />
                        )}
                        <span className="text-[8px] sm:text-[9px] text-white/40 uppercase tracking-[0.1em]">
                          {isFailed ? 'Scan Failed' : isCompleted ? 'Scan Completed' : isPaused ? 'Scan Paused' : isRunning ? 'Scanning in progress' : 'Ready to Start'}
                        </span>
                      </div>
                      <span className={`text-[9px] sm:text-[10px] font-semibold ${isFailed ? 'text-red-400' : isCompleted ? 'text-[#22d3ee]' : isPaused ? 'text-[#fbbf24]' : 'text-white'}`}>
                        {Math.min(progress, 100)}%
                      </span>
                    </div>
                    <div className="h-1 sm:h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out shadow-sm shadow-[#00E5FF]/30"
                        style={{ 
                          width: `${Math.min(progress, 100)}%`, 
                          background: isFailed ? '#ef4444' : isCompleted ? '#22d3ee' : isPaused ? '#fbbf24' : 'linear-gradient(90deg, #00E5FF, #2DD4BF)' 
                        }}
                      />
                    </div>
                  </div>
                )}

                {isPaused && (
                  <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-white/[0.07]">
                    <div className="flex items-center justify-center gap-1.5 text-[8px] sm:text-[9px] text-white/30 uppercase tracking-[0.08em]">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#fbbf24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      Scan paused — click Resume to continue
                    </div>
                  </div>
                )}

                {scan.assets && Object.keys(scan.assets).length > 0 && (
                  <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-white/[0.07] flex items-center gap-1.5 text-[8px] sm:text-[9px] text-white/30 uppercase tracking-[0.08em]">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    {Object.keys(scan.assets).length} assets collected
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, scan: null })}
        onConfirm={handleConfirmRemove}
        title="Stop Scan"
        message="Are you sure you want to stop this scan? This action cannot be undone."
        danger
      />
      <ScanProgressModal
        isOpen={progressModal.isOpen}
        onClose={() => setProgressModal({ isOpen: false, scan: null })}
        scan={progressModal.scan}
        onGenerateReport={() => { alert('Report generation coming soon!'); setProgressModal({ isOpen: false, scan: null }); }}
      />
      <InvestigationPopup
        isOpen={investigationModal.isOpen}
        onClose={() => setInvestigationModal({ isOpen: false, scan: null })}
        scan={investigationModal.scan}
      />
    </>
  );
};

// ──────────────────────────────────────────────────────────────
// ScanHistory
// ──────────────────────────────────────────────────────────────
export const ScanHistory = ({ scanHistory, onRemoveScan }) => {
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, scan: null });
  const [progressModal, setProgressModal] = useState({ isOpen: false, scan: null });
  const [editModal, setEditModal] = useState({ isOpen: false, scan: null });
  const [visibleCards, setVisibleCards] = useState(new Set());

  // Stagger history cards in on mount
  useEffect(() => {
    if (!scanHistory || scanHistory.length === 0) {
      setVisibleCards(new Set());
      return;
    }
    
    scanHistory.slice(0, 5).forEach((scan, i) => {
      if (!visibleCards.has(scan.id)) {
        const t = setTimeout(() => {
          setVisibleCards(prev => new Set([...prev, scan.id]));
        }, i * 30); // Very snappy stagger
        return () => clearTimeout(t);
      }
    });
  }, [scanHistory]);

  if (!scanHistory || scanHistory.length === 0) return null;

  const handleConfirmRemove = () => {
    if (confirmModal.scan && onRemoveScan) onRemoveScan(confirmModal.scan.originalId, confirmModal.scan.moduleId);
    setConfirmModal({ isOpen: false, scan: null });
  };

  const handleUpdateAssets = async (scanId, updatedAssets) => {
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
        onClose={() => setEditModal({ isOpen: false, scan: null })}
        scan={{ id: editModal.scan.originalId, toolId: moduleType, tool: editModal.scan.tool, assets: editModal.scan.assets, status: editModal.scan.status }}
        onUpdate={handleUpdateAssets}
      />
    );
  };

  return (
    <div className="font-sans">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-0.5 h-4 sm:h-5 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
          <h3 className="text-white text-[11px] sm:text-[13px] font-bold uppercase tracking-[0.14em]">Recent Scans</h3>
        </div>

        <div className="grid gap-2 sm:gap-3">
          {scanHistory.slice(0, 3).map((scan, index) => {
            const isVisible = visibleCards.has(scan.id);
            return (
              <div
                key={scan.id}
                className={`relative border border-white/10 hover:border-[#00E5FF]/30 rounded-xl transition-all duration-500 bg-black overflow-hidden ${
                  isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-[0.99]'
                }`}
                style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.03] via-transparent to-[#2DD4BF]/[0.02] pointer-events-none" />
                <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#00E5FF]/40 to-[#2DD4BF]/40 rounded-full" />

                <div className="relative pl-4 sm:pl-5 pr-3 sm:pr-4 py-3 sm:py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div className="relative w-9 h-9 sm:w-10 sm:h-10 border border-[#00E5FF]/30 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#00E5FF]/[0.07]">
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#00E5FF]/10 to-transparent" />
                        <span className="relative">{getIcon(scan.toolIcon, "w-4 h-4 sm:w-5 sm:h-5 text-[#00E5FF]")}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-white text-[11px] sm:text-[13px] font-bold uppercase tracking-[0.06em] truncate">{scan.tool}</h4>
                        <p className="text-white/35 text-[9px] sm:text-[10px] uppercase tracking-[0.06em] truncate mt-0.5">{scan.target}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                      <button onClick={() => setProgressModal({ isOpen: true, scan })} className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-white/10 rounded-lg text-white/50 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-colors text-[8px] sm:text-[10px] uppercase tracking-[0.08em]">
                        <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Details
                      </button>
                      <button onClick={() => setEditModal({ isOpen: true, scan })} className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-white/10 rounded-lg text-white/50 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-colors text-[8px] sm:text-[10px] uppercase tracking-[0.08em]">
                        <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                        Edit
                      </button>
                      <button onClick={() => setConfirmModal({ isOpen: true, scan })} className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-white/10 rounded-lg text-white/50 hover:border-[#f87171]/40 hover:text-[#f87171] transition-colors text-[8px] sm:text-[10px] uppercase tracking-[0.08em]">
                        <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        <span className="hidden sm:inline">Delete</span>
                      </button>

                      <div className="flex gap-1 ml-1">
                        {scan.findings > 0 && (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 border border-[#f87171]/30 rounded-lg text-[#f87171] text-[8px] sm:text-[9px] uppercase tracking-[0.08em] bg-[#f87171]/5">
                            {scan.findings} findings
                          </span>
                        )}
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 border border-[#2DD4BF]/30 rounded-lg text-[#2DD4BF] text-[8px] sm:text-[9px] uppercase tracking-[0.08em] bg-[#2DD4BF]/5">
                          Done
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, scan: null })}
        onConfirm={handleConfirmRemove}
        title="Delete Scan"
        message="Are you sure you want to permanently delete this scan from history? This action cannot be undone."
        danger
      />
      <ScanProgressModal
        isOpen={progressModal.isOpen}
        onClose={() => setProgressModal({ isOpen: false, scan: null })}
        scan={progressModal.scan}
      />
      {renderEditModal()}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// ScheduledScans
// ──────────────────────────────────────────────────────────────
export const ScheduledScans = ({ scanHistory, runningScans }) => {
  const totalFindings = scanHistory?.reduce((acc, scan) => acc + (scan.findings || 0), 0) || 0;

  const statItems = [
    { label: 'Completed Scans', value: scanHistory?.length || 0, color: 'text-white' },
    { label: 'Active Scans', value: runningScans?.length || 0, color: 'text-[#2DD4BF]' },
    { label: 'Findings Detected', value: totalFindings, color: 'text-[#00E5FF]' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 font-sans">
      <div className="lg:col-span-2">
        <div className="relative border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center bg-black overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.03] via-transparent to-[#2DD4BF]/[0.02] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 border border-[#00E5FF]/30 rounded-xl sm:rounded-2xl flex items-center justify-center bg-[#00E5FF]/5">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white text-base sm:text-xl font-bold uppercase tracking-[0.06em] mb-2">No Scheduled Scans</h3>
            <p className="text-white/35 text-[11px] sm:text-[12px] leading-relaxed mb-5 sm:mb-6 max-w-sm mx-auto">
              Set up automated recurring scans to continuously monitor your targets
            </p>
            <button className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 border border-[#00E5FF]/35 rounded-xl text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors text-[10px] sm:text-[11px] uppercase tracking-[0.1em]">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Schedule
            </button>
          </div>
        </div>
      </div>

      <div className="relative border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.03] via-transparent to-transparent pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle, #00E5FF 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        <h3 className="relative text-white text-[11px] sm:text-[12px] sm:text-sm font-bold uppercase tracking-[0.14em] mb-4 sm:mb-5">Quick Stats</h3>
        <div className="relative space-y-3 sm:space-y-5">
          {statItems.map(({ label, value, color }) => (
            <div key={label} className="flex items-end justify-between border-b border-white/[0.06] pb-3 sm:pb-4 last:border-0 last:pb-0">
              <div className="text-white/35 text-[10px] sm:text-[11px] uppercase tracking-[0.1em]">{label}</div>
              <div className={`text-2xl sm:text-3xl font-bold leading-none ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
