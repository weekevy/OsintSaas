import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getIcon } from '../utils/icons';
import { getModuleAddModal, getModuleEditModal } from '../modules';
import api from '../../../../services/api';
import { ScanCardSkeleton, ScanHistorySkeleton } from '../utils/Skeleton';
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
    }, 200); // Match refined animation duration
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
        <div className="w-6 h-6 rounded-full border border-[#2DD4BF]/40 flex items-center justify-center bg-[#2DD4BF]/10 transition-all duration-500">
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
      <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center bg-white/5 transition-all duration-500">
        <span className="text-white/40 text-[10px]">○</span>
      </div>
    );
  };

  const modalContent = (
    <div 
      className={`fixed inset-0 z-[10000000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl transition-all duration-300 ease-in-out transform-gpu ${isClosing ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100 animate-in fade-in'}`} 
      onClick={handleClose}
    >
      <div 
        className={`relative w-full max-w-[95vw] lg:max-w-[90vw] h-[90vh] lg:h-[85vh] border border-white/10 rounded-3xl bg-[#0A0A0A] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform-gpu ${isClosing ? 'scale-95 translate-y-8 opacity-0' : 'scale-100 translate-y-0 opacity-100 animate-in slide-in-from-bottom-8'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent animate-shimmer" />
        
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-white/[0.07] flex items-center justify-between bg-[#111111]/80 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center shadow-2xl shadow-[#00E5FF]/5 transition-transform duration-500 hover:rotate-3">
              <svg className="w-7 h-7 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-xl font-black tracking-tight flex items-center gap-3">
                Investigation Terminal
                <span className="text-[10px] text-[#00E5FF] font-mono px-2 py-0.5 rounded border border-[#00E5FF]/20 bg-[#00E5FF]/5 animate-pulse">LIVE_FEED</span>
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-white/20 text-[11px] uppercase tracking-widest font-bold">OSINT_NODE_PRIMARY</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-white/40 text-[11px] uppercase tracking-wider font-mono">Target: {scan?.target}</span>
              </div>
            </div>
          </div>
          <button onClick={handleClose} className="group p-2.5 text-white/20 hover:text-white transition-all rounded-2xl hover:bg-white/5 active:scale-90">
            <svg className="w-7 h-7 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar: Progress & Info */}
          <div className="w-80 border-r border-white/[0.05] bg-[#0E0E0E] p-8 flex flex-col gap-10 shadow-inner overflow-y-auto scrollbar-hide">
            <div>
              <h3 className="text-white/30 text-[9px] font-black uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                Investigation Pipeline
              </h3>
              <div className="space-y-6">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-4 group cursor-default">
                    <div className="transition-all duration-500 group-hover:scale-110 group-hover:brightness-125">
                      {getStepIcon(step.status)}
                    </div>
                    <span className={`text-[11px] font-bold tracking-widest uppercase transition-all duration-500 ${
                      step.status === 'running' ? 'text-[#00E5FF] translate-x-1' :
                      step.status === 'completed' ? 'text-white/90' : 'text-white/10'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white/30 text-[9px] font-black uppercase tracking-[0.25em] mb-5 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF] shadow-[0_0_8px_#2DD4BF]" />
                Progress Vector
              </h3>
              <div className="relative pt-2">
                <div className="flex mb-3 items-center justify-between">
                  <span className="text-[10px] font-black inline-block py-1.5 px-3 uppercase rounded-lg text-[#00E5FF] bg-[#00E5FF]/5 border border-[#00E5FF]/20 shadow-lg shadow-black/50">
                    {progress}% Synchronized
                  </span>
                </div>
                <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-white/[0.02] border border-white/[0.05] shadow-inner">
                  <div 
                    style={{ width: `${progress}%` }}
                    className="shadow-[0_0_20px_rgba(0,229,255,0.4)] flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#00E5FF] via-[#2DD4BF] to-[#00E5FF] bg-[length:200%_auto] animate-gradient transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-white/30 text-[9px] font-black uppercase tracking-[0.25em] flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-white/10" />
                Node Intelligence
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Uptime', val: elapsedTime, color: 'text-[#00E5FF]' },
                  { label: 'Latency', val: '42ms', color: 'text-[#2DD4BF]' },
                  { label: 'Integrity', val: '100%', color: 'text-[#a3e635]' },
                  { label: 'Protocol', val: 'TLS 1.3', color: 'text-white/70' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300 group">
                    <div className="text-white/20 text-[8px] font-black uppercase tracking-widest mb-1.5 group-hover:text-white/30 transition-colors">{item.label}</div>
                    <div className={`${item.color} text-[11px] font-mono font-bold group-hover:scale-105 transition-transform`}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/[0.05]">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-white/5 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E5FF]/5 rounded-full blur-3xl -mr-12 -mt-12 transition-all duration-1000 group-hover:scale-150 group-hover:bg-[#00E5FF]/10" />
                <div className="text-white/20 text-[8px] font-black uppercase tracking-widest mb-1.5">Active Module</div>
                <div className="text-white text-base font-black tracking-tight group-hover:text-[#00E5FF] transition-colors">{scan?.moduleName}</div>
                <div className="mt-4 text-white/20 text-[8px] font-black uppercase tracking-widest mb-1.5">Security Context</div>
                <div className="text-[#00E5FF]/60 text-[10px] font-mono tracking-widest bg-[#00E5FF]/5 px-2 py-1 rounded border border-[#00E5FF]/10 inline-block">SEC_ENCLAVE_ALPHA</div>
              </div>
            </div>
          </div>

          {/* Main Content: Terminal Logs */}
          <div className="flex-1 flex flex-col bg-[#050505] shadow-2xl relative">
            {/* Atmospheric light effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00E5FF]/[0.02] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#2DD4BF]/[0.01] rounded-full blur-[120px] pointer-events-none" />
            
            <div className="px-8 py-4 border-b border-white/[0.05] flex items-center justify-between bg-[#080808]/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/5" />
                  <span className="w-2 h-2 rounded-full bg-white/5" />
                  <span className="w-2 h-2 rounded-full bg-white/5" />
                </div>
                <span className="text-[10px] text-white/30 font-mono tracking-[0.3em] uppercase font-black">Intelligence Stream // CORE_KERNEL_STATION</span>
              </div>
              <div className="text-[9px] text-white/40 font-mono bg-white/[0.02] px-4 py-1.5 rounded-full border border-white/[0.05] flex items-center gap-3 shadow-inner">
                <span className="w-1.5 h-1.5 bg-[#2DD4BF] rounded-full animate-pulse shadow-[0_0_8px_#2DD4BF]" />
                <span className="tracking-widest">{logs.length} PACKETS CAPTURED</span>
              </div>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-0 font-mono text-[13px] custom-scrollbar bg-[#050505] selection:bg-[#00E5FF]/20"
            >
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <div className="w-20 h-20 border-2 border-[#00E5FF]/10 border-t-[#00E5FF] rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(0,229,255,0.1)]" />
                  <p className="text-[10px] tracking-[0.5em] font-black text-[#00E5FF] animate-pulse">ESTABLISHING UPLINK</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.02] animate-in fade-in duration-1000">
                  {logs.map((log, i) => (
                    <div 
                      key={log.id} 
                      className={`flex gap-6 px-10 py-4 group items-start transition-all duration-300 transform-gpu hover:bg-white/[0.02] hover:translate-x-1 ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.005]'}`}
                      style={{ willChange: 'transform, background' }}
                    >
                      <span className="text-white/10 flex-shrink-0 w-24 pt-1.5 text-[10px] font-mono group-hover:text-white/30 transition-colors">
                        [{log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}]
                      </span>
                      <span className={`flex-shrink-0 w-24 font-black text-[8px] tracking-[0.2em] pt-2 px-2 py-1 rounded border border-current bg-current/5 inline-block text-center transition-all duration-500 group-hover:scale-110 ${
                        log.level === 'ERROR' ? 'text-red-500/80' :
                        log.level === 'WARNING' ? 'text-yellow-500/80' :
                        log.level === 'SUCCESS' ? 'text-[#2DD4BF]/80' : 'text-[#00E5FF]/60'
                      }`}>
                        {log.level === 'SUCCESS' ? 'PASSED' : log.level === 'ERROR' ? 'FAILED' : log.level === 'WARNING' ? 'ALERT' : 'TASK'}
                      </span>
                      <span className="text-white/60 group-hover:text-white transition-colors leading-relaxed pt-1.5 font-sans tracking-wide">
                        {log.message}
                      </span>
                    </div>
                  ))}
                  {/* Invisible element to help scrolling */}
                  <div className="h-12" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-white/[0.07] bg-[#080808]/95 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_10px_#00E5FF]" />
              <span className="text-[10px] text-white/40 font-black tracking-[0.25em] uppercase">Status: <span className="text-white/80">SECURE_ACTIVE</span></span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[10px] text-white/20 font-mono tracking-widest">AES_GCM_256_STATION_SIG</span>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="group relative px-10 py-3 bg-[#00E5FF]/5 hover:bg-[#00E5FF]/10 border border-[#00E5FF]/20 hover:border-[#00E5FF]/50 rounded-2xl text-[#00E5FF] text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 transform-gpu active:scale-95 shadow-2xl hover:shadow-[#00E5FF]/10"
          >
            <span className="relative z-10">Acknowledge Terminal</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00E5FF]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
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
    }, 200);
  };

  if (!isOpen) return null;

  const accentColor = danger ? '#f87171' : '#fbbf24';
  const accentClass = danger
    ? 'border-[#f87171]/40 text-[#f87171] hover:bg-[#f87171]/10'
    : 'border-[#fbbf24]/40 text-[#fbbf24] hover:bg-[#fbbf24]/10';

  const modalContent = (
    <div 
      className={`fixed inset-0 z-[10000000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl transition-all duration-300 transform-gpu ${isClosing ? 'opacity-0' : 'opacity-100 animate-in fade-in'}`} 
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-sm sm:max-w-md border border-white/10 rounded-3xl bg-[#0A0A0A] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] transition-all duration-400 cubic-bezier(0.16, 1, 0.3, 1) transform-gpu ${isClosing ? 'scale-90 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0 animate-in zoom-in-95 slide-in-from-bottom-4'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}55, transparent)` }} />

        <div className="relative p-7 sm:p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="w-16 h-16 border-2 rounded-2xl flex items-center justify-center mb-5 shadow-2xl transition-transform duration-500 hover:rotate-6"
              style={{ borderColor: `${accentColor}33`, backgroundColor: `${accentColor}08` }}
            >
              {danger ? (
                <svg className="w-8 h-8" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
            </div>
            <h2 className="text-white text-xl font-black tracking-tight mb-2 uppercase">{title}</h2>
            <p className="text-white/40 text-[13px] leading-relaxed font-medium">{message}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-white/10 rounded-2xl text-white/50 hover:text-white hover:border-white/30 transition-all duration-300 text-[11px] font-black uppercase tracking-widest active:scale-95 bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(); handleClose(); }}
              className={`flex-[1.5] px-6 py-3 border rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-2xl ${accentClass}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Execute
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
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
    }, 200);
  };

  if (!isOpen || !scan) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-[10000000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl overflow-y-auto transition-all duration-300 transform-gpu ${isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-in fade-in'}`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-2xl lg:max-w-3xl border border-white/10 rounded-3xl bg-[#0A0A0A] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform-gpu ${isClosing ? 'scale-90 opacity-0 translate-y-8' : 'scale-100 opacity-100 translate-y-0 animate-in slide-in-from-bottom-8'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.03] via-transparent to-[#2DD4BF]/[0.02] pointer-events-none" />
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent" />

        <div className="relative px-6 py-6 border-b border-white/[0.07] bg-[#111111]/80 backdrop-blur-md">
          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-5 min-w-0 flex-1">
              <div className="w-14 h-14 border border-[#00E5FF]/30 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#00E5FF]/5 shadow-2xl shadow-[#00E5FF]/5 transition-transform duration-500 hover:rotate-3">
                <svg className="w-7 h-7 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-white text-xl font-black truncate tracking-tight uppercase">
                  Scan Overview
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#00E5FF] text-[10px] font-black tracking-widest bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20 uppercase">{scan.tool}</span>
                  <span className="text-white/30 text-[11px] font-medium truncate tracking-wide">
                    TARGET_ID: {scan.target}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={handleClose} className="p-2.5 text-white/20 hover:text-white transition-all rounded-2xl hover:bg-white/5 active:scale-90">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative p-8 overflow-y-auto max-h-[calc(85vh-150px)] bg-[#0C0C0C]/50 custom-scrollbar">
          <div className="mb-8">
            <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
              Collected Intelligence
            </h3>
            <div className="bg-[#141414] border border-white/[0.05] rounded-3xl p-6 shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              {scan.assets && Object.keys(scan.assets).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                  {Object.entries(scan.assets).map(([key, value]) =>
                    value && value !== '' ? (
                      <div key={key} className="bg-white/[0.02] p-4 border border-white/[0.05] rounded-2xl group hover:border-[#00E5FF]/30 transition-all duration-300 hover:translate-x-1">
                        <h4 className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1.5">
                          {key.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-white text-[13px] font-medium break-words leading-relaxed">{value}</p>
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                <div className="text-center py-10 opacity-30">
                  <svg className="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                  <p className="text-[12px] font-bold uppercase tracking-widest">No Intelligence Vectors Found</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#2DD4BF] shadow-[0_0_8px_#2DD4BF]" />
              Technical Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Investigation Module', value: scan.moduleName, color: 'text-white' },
                {
                  label: 'Current Status',
                  value: scan.status?.toUpperCase() || 'UNKNOWN',
                  color: scan.status === 'running' ? 'text-[#2DD4BF]' : scan.status === 'pending' ? 'text-[#fbbf24]' : 'text-white',
                },
                { label: 'Session Initiation', value: scan.startTime || 'STATION_OFFLINE', color: 'text-white/60 font-mono' },
                { label: 'Anomalies Detected', value: scan.findings || 0, color: scan.findings > 0 ? 'text-red-400' : 'text-[#2DD4BF]' },
              ].map(({ label, value, color = 'text-white' }) => (
                <div key={label} className="bg-[#141414] p-5 border border-white/[0.05] rounded-2xl shadow-inner transition-all duration-300 hover:bg-white/[0.02] hover:border-white/10 group">
                  <div className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-2 group-hover:text-white/30 transition-colors">{label}</div>
                  <div className={`text-[14px] font-black truncate tracking-tight ${color} group-hover:translate-x-1 transition-transform`}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative px-8 py-6 border-t border-white/[0.07] bg-[#111111]/95 flex justify-end gap-4">
          <button
            onClick={handleClose}
            className="px-8 py-3 border border-white/10 rounded-2xl text-white/50 hover:text-white hover:border-white/30 transition-all duration-300 text-[11px] font-black uppercase tracking-widest bg-white/5 active:scale-95"
          >
            Close Portal
          </button>
          {onGenerateReport && (
            <button
              onClick={onGenerateReport}
              className="px-8 py-3 bg-[#00E5FF]/5 border border-[#00E5FF]/30 rounded-2xl text-[#00E5FF] hover:bg-[#00E5FF]/15 transition-all duration-300 text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-[#00E5FF]/5 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Finalize Intelligence Report
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
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
export const RunningScans = ({ runningScans, onEditScan, onRemoveScan, onRefresh, isLoading }) => {
  const { socket, isConnected } = useSocket();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, scan: null });
  const [progressModal, setProgressModal] = useState({ isOpen: false, scan: null });
  const [investigationModal, setInvestigationModal] = useState({ isOpen: false, scan: null });

  const [scanStatuses, setScanStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem(SCAN_STATES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    try { localStorage.setItem(SCAN_STATES_KEY, JSON.stringify(scanStatuses)); } catch {}
  }, [scanStatuses]);

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1].map(i => <ScanCardSkeleton key={i} index={i} />)}
      </div>
    );
  }

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
      <span className="flex items-center gap-1.5 px-2.5 py-1 border border-red-500/40 rounded-lg text-red-400 text-[9px] sm:text-[11px] font-black uppercase tracking-widest bg-red-500/10 whitespace-nowrap shadow-[0_0_10px_rgba(239,68,68,0.1)]">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_#ef4444]" />FAILED
      </span>
    );
    if (s.isPaused || status === 'paused') return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 border border-[#fbbf24]/40 rounded-lg text-[#fbbf24] text-[9px] sm:text-[11px] font-black uppercase tracking-widest bg-[#fbbf24]/10 whitespace-nowrap shadow-[0_0_10px_rgba(251,191,36,0.1)]">
        <span className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full shadow-[0_0_5px_#fbbf24]" />PAUSED
      </span>
    );
    if (status === 'completed') return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 border border-[#22d3ee]/40 rounded-lg text-[#22d3ee] text-[9px] sm:text-[11px] font-black uppercase tracking-widest bg-[#22d3ee]/10 whitespace-nowrap shadow-[0_0_10px_rgba(34,211,238,0.1)]">
        <span className="w-1.5 h-1.5 bg-[#22d3ee] rounded-full shadow-[0_0_5px_#22d3ee]" />COMPLETED
      </span>
    );
    if (status === 'running') return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 border border-[#2DD4BF]/40 rounded-lg text-[#2DD4BF] text-[9px] sm:text-[11px] font-black uppercase tracking-widest bg-[#2DD4BF]/10 whitespace-nowrap shadow-[0_0_10px_rgba(45,212,191,0.1)]">
        <span className="w-1.5 h-1.5 bg-[#2DD4BF] rounded-full animate-pulse shadow-[0_0_5px_#2DD4BF]" />ACTIVE
      </span>
    );
    return (
      <span className="px-2.5 py-1 border border-white/10 rounded-lg text-white/30 text-[9px] sm:text-[11px] font-black uppercase tracking-widest bg-white/5 whitespace-nowrap">
        PENDING
      </span>
    );
  };

  return (
    <>
      <div className="space-y-4">
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

          return (
            <div
              key={scan.id}
              className={`relative border border-white/10 hover:border-[#00E5FF]/30 rounded-xl sm:rounded-2xl transition-all duration-300 bg-black overflow-hidden transform-gpu ${scan._isNew ? 'animate-new-scan' : 'animate-card-entry'} will-change-transform`}
              style={{ 
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'both'
              }}
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

                {scan.assets && Object.keys(scan.assets).length > 0 && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/[0.05] flex items-center gap-2.5 text-[9px] sm:text-[11px] text-white/30 font-bold uppercase tracking-widest">
                    <svg className="w-4 h-4 text-[#00E5FF]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span className="text-[#00E5FF]/60">{Object.keys(scan.assets).length}</span> INTELLIGENCE_VECTORS_CACHED
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <style>{`
        @keyframes card-entry {
          0% { opacity: 0; transform: translate3d(0, 16px, 0) scale(0.97); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes new-scan {
          0% { opacity: 0; transform: translate3d(0, -24px, 0); background: rgba(0, 229, 255, 0.15); }
          50% { background: rgba(0, 229, 255, 0.05); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); background: black; }
        }
        .animate-card-entry {
          animation: card-entry 0.45s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        .animate-new-scan {
          animation: new-scan 0.7s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
      `}</style>


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
export const ScanHistory = ({ scanHistory, onRemoveScan, isLoading }) => {
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, scan: null });
  const [progressModal, setProgressModal] = useState({ isOpen: false, scan: null });
  const [editModal, setEditModal] = useState({ isOpen: false, scan: null });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map(i => <ScanHistorySkeleton key={i} index={i} />)}
      </div>
    );
  }

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
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-1 h-5 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full shadow-[0_0_10px_#00E5FF]" />
          <h3 className="text-white text-[13px] font-black uppercase tracking-[0.2em]">Intel Archives</h3>
        </div>

        <div className="grid gap-3">
          {scanHistory.slice(0, 10).map((scan, index) => {
            return (
              <div
                key={scan.id}
                className="relative border border-white/10 hover:border-[#00E5FF]/30 rounded-xl sm:rounded-2xl transition-all duration-300 bg-black overflow-hidden transform-gpu animate-card-entry will-change-transform"
                style={{ 
                  animationDelay: `${index * 40}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.02] via-transparent to-[#2DD4BF]/[0.01] pointer-events-none" />
                <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-[#00E5FF]/40 to-[#2DD4BF]/40 rounded-full blur-[1px]" />

                <div className="relative pl-6 pr-4 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="relative w-11 h-11 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/[0.03] shadow-inner transition-transform duration-500 hover:rotate-3">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent" />
                        <span className="relative opacity-60 group-hover:opacity-100 transition-opacity">{getIcon(scan.toolIcon, "w-5 h-5 text-white")}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-white text-[13px] font-black uppercase tracking-wider truncate">{scan.tool}</h4>
                        <p className="text-white/20 text-[10px] font-mono uppercase truncate mt-1">PTR: {scan.target}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => setProgressModal({ isOpen: true, scan })} className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-xl text-white/30 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-all duration-300 text-[9px] font-black uppercase tracking-widest active:scale-90">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Review
                      </button>
                      <button onClick={() => setEditModal({ isOpen: true, scan })} className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-xl text-white/30 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-all duration-300 text-[9px] font-black uppercase tracking-widest active:scale-90">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Modify
                      </button>
                      <button onClick={() => setConfirmModal({ isOpen: true, scan })} className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-xl text-white/30 hover:border-red-500/40 hover:text-red-400 transition-all duration-300 text-[9px] font-black uppercase tracking-widest active:scale-90">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Purge
                      </button>

                      <div className="flex gap-2 ml-2">
                        {scan.findings > 0 && (
                          <span className="px-2.5 py-1 border border-red-500/30 rounded-lg text-red-400 text-[9px] font-black uppercase tracking-widest bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                            {scan.findings} ALERTS
                          </span>
                        )}
                        <span className="px-2.5 py-1 border border-[#2DD4BF]/30 rounded-lg text-[#2DD4BF] text-[9px] font-black uppercase tracking-widest bg-[#2DD4BF]/5 shadow-[0_0_10px_rgba(45,212,191,0.1)]">
                          ARCHIVED
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-forwards">
      <div className="lg:col-span-2">
        <div className="relative border border-white/5 rounded-3xl p-8 sm:p-12 text-center bg-[#050505] overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.03] via-transparent to-[#2DD4BF]/[0.02] pointer-events-none group-hover:opacity-100 transition-opacity duration-700" />
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: 'linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 border border-[#00E5FF]/20 rounded-3xl flex items-center justify-center bg-[#00E5FF]/5 shadow-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white text-xl sm:text-2xl font-black uppercase tracking-[0.1em] mb-3">No Active Schedules</h3>
            <p className="text-white/20 text-[13px] leading-relaxed mb-8 max-w-sm mx-auto font-medium">
              Configure automated recurring intelligence cycles to continuously monitor high-value targets.
            </p>
            <button className="inline-flex items-center gap-3 px-8 py-3.5 border border-[#00E5FF]/30 rounded-2xl text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all duration-300 text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 shadow-2xl shadow-[#00E5FF]/5 hover:border-[#00E5FF]/50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Initialize Schedule
            </button>
          </div>
        </div>
      </div>

      <div className="relative border border-white/5 rounded-3xl p-6 sm:p-8 bg-[#050505] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.03] via-transparent to-transparent pointer-events-none group-hover:opacity-100 transition-opacity duration-700" />
        <div
          className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: 'radial-gradient(circle, #00E5FF 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <h3 className="relative text-white/30 text-[10px] font-black uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-white/10" />
          Terminal Stats
        </h3>
        <div className="relative space-y-6">
          {statItems.map(({ label, value, color }) => (
            <div key={label} className="flex items-end justify-between border-b border-white/[0.04] pb-5 last:border-0 last:pb-0 group/stat">
              <div className="text-white/20 text-[10px] font-black uppercase tracking-widest group-hover/stat:text-white/40 transition-colors">{label}</div>
              <div className={`text-3xl sm:text-4xl font-black leading-none tracking-tight ${color}`}>{value}</div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};
