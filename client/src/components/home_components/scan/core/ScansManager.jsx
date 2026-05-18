import React, { useState, useEffect } from 'react';
import { getIcon } from '../utils/icons';
import { getModuleAddModal, getModuleEditModal } from '../modules';
import api from '../../../../services/api';

const SCAN_STATES_KEY = 'osint_scan_states';

// ──────────────────────────────────────────────────────────────
// InvestigationPopup
// ──────────────────────────────────────────────────────────────
const InvestigationPopup = ({ isOpen, onClose, scan }) => {
  const [investigationData, setInvestigationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    if (isOpen && scan) {
      setIsLoading(false);
      setInvestigationData({
        target: scan.target,
        module: scan.moduleName,
        status: 'investigating',
        findings: [],
        steps: [
          { id: 1, name: 'Initializing', status: 'completed', timestamp: new Date().toISOString() },
          { id: 2, name: 'Scanning Target', status: 'running', timestamp: new Date().toISOString() },
          { id: 3, name: 'Analyzing Results', status: 'pending', timestamp: null },
          { id: 4, name: 'Generating Report', status: 'pending', timestamp: null },
        ]
      });
    }
  }, [isOpen, scan]);

  if (!isOpen) return null;

  const getStepIcon = (stepStatus) => {
    if (stepStatus === 'completed') {
      return (
        <div className="w-7 h-7 rounded-full border border-[#2DD4BF]/40 flex items-center justify-center bg-[#2DD4BF]/10">
          <svg className="w-4 h-4 text-[#2DD4BF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (stepStatus === 'running') {
      return (
        <div className="w-7 h-7 rounded-full border border-[#00E5FF]/40 flex items-center justify-center">
          <div className="w-3.5 h-3.5 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center">
        <span className="text-white/40 text-[11px]">○</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/80" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] border border-white/10 rounded-2xl bg-[#0a0a0a] overflow-hidden shadow-2xl shadow-black/60" onClick={(e) => e.stopPropagation()}>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.03] via-transparent to-[#2DD4BF]/[0.02] pointer-events-none" />

        <div className="relative px-4 sm:px-6 py-4 sm:py-5 border-b border-white/[0.07]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-base sm:text-lg font-bold">Investigation Details</h2>
              <p className="text-white/35 text-[10px] sm:text-[11px] mt-0.5">Live investigation progress</p>
            </div>
            <button onClick={onClose} className="p-1.5 sm:p-2 text-white/35 hover:text-[#00E5FF] transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 sm:py-12">
              <div className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-[#00E5FF]/30 border-t-[#00E5FF] rounded-full animate-spin mb-4 sm:mb-5" />
              <p className="text-white/50 text-xs sm:text-sm">Loading investigation data...</p>
            </div>
          ) : (
            <>
              <div className="mb-5 sm:mb-6 p-4 sm:p-5 rounded-xl border border-white/10 bg-white/[0.03]">
                <div className="flex items-center gap-3 sm:gap-4 mb-2">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white/40 text-[10px] sm:text-[11px] uppercase tracking-[0.1em]">Target</div>
                    <div className="text-white text-sm sm:text-base font-semibold">{scan?.target}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[10px] sm:text-[11px]">
                  <span className="text-white/40">Module:</span>
                  <span className="text-white/70">{scan?.moduleName}</span>
                  <span className="text-white/40">Status:</span>
                  <span className="text-[#00E5FF] animate-pulse">● ACTIVE</span>
                </div>
              </div>

              <div className="mb-5 sm:mb-6">
                <h3 className="text-white text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.14em] mb-2.5 sm:mb-3 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Investigation Progress
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {investigationData?.steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl border border-white/10 bg-white/[0.03]">
                      {getStepIcon(step.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[11px] sm:text-[12px] font-semibold truncate ${
                            step.status === 'running' ? 'text-[#00E5FF]' :
                            step.status === 'completed' ? 'text-white' : 'text-white/40'
                          }`}>
                            {step.name}
                          </span>
                          {step.status === 'completed' && step.timestamp && (
                            <span className="text-white/30 text-[9px] flex-shrink-0">
                              {new Date(step.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        <p className="text-white/40 text-[9px] sm:text-[10px] mt-0.5">
                          {step.status === 'running' ? 'Processing...' :
                           step.status === 'completed' ? 'Complete' : 'Waiting'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.14em] mb-2.5 sm:mb-3 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Live Data Stream
                </h3>
                <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-black/30">
                  <div className="space-y-1.5 font-mono text-[10px] sm:text-[11px]">
                    <div className="flex items-center gap-2 text-white/40">
                      <span className="text-[#00E5FF]">●</span>
                      <span>Fetching target information...</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/30 animate-pulse">
                      <span className="text-[#00E5FF]">●</span>
                      <span>Analyzing digital footprint...</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/30">
                      <span className="text-[#00E5FF]">○</span>
                      <span>Cross-referencing databases...</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative px-4 sm:px-6 py-3 sm:py-4 border-t border-white/[0.07] bg-black/20 flex justify-end">
          <button onClick={onClose} className="px-4 sm:px-5 py-1.5 sm:py-2 border border-white/10 rounded-xl text-white/55 hover:text-white hover:border-white/20 transition-colors text-[10px] sm:text-[11px] uppercase tracking-[0.08em]">
            Close
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
  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const accentColor = danger ? '#f87171' : '#fbbf24';
  const accentClass = danger
    ? 'border-[#f87171]/40 text-[#f87171] hover:bg-[#f87171]/10'
    : 'border-[#fbbf24]/40 text-[#fbbf24] hover:bg-[#fbbf24]/10';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80" onClick={onClose}>
      <div
        className="relative w-full max-w-sm sm:max-w-md border border-white/10 rounded-2xl bg-[#0a0a0a] overflow-hidden shadow-2xl shadow-black/60"
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
              onClick={onClose}
              className="px-4 sm:px-5 py-1.5 sm:py-2 border border-white/10 rounded-xl text-white/55 hover:text-white hover:border-white/20 transition-colors text-[10px] sm:text-[11px] uppercase tracking-[0.08em]"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
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
  if (!isOpen || !scan) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/80 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl sm:max-w-4xl max-h-[92vh] border border-white/10 rounded-2xl bg-[#0a0a0a] overflow-hidden my-4 sm:my-8 shadow-2xl shadow-black/60"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.03] via-transparent to-[#2DD4BF]/[0.02] pointer-events-none" />
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent" />

        <div className="relative px-4 sm:px-6 py-4 sm:py-5 border-b border-white/[0.07]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-11 sm:h-11 border border-[#00E5FF]/35 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 bg-[#00E5FF]/5">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-white text-sm sm:text-lg font-bold truncate">
                  Scan Overview — {scan.tool}
                </h2>
                <p className="text-white/35 text-[10px] sm:text-[11px] truncate mt-0.5">
                  Target: {scan.target}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 sm:p-2 text-white/35 hover:text-[#00E5FF] transition-colors flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative p-4 sm:p-6 overflow-y-auto max-h-[calc(92vh-120px)]">
          <div className="mb-5 sm:mb-6">
            <h3 className="text-white text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.14em] mb-2.5 sm:mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Investigation Assets
            </h3>
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-3 sm:p-4">
              {scan.assets && Object.keys(scan.assets).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {Object.entries(scan.assets).map(([key, value]) =>
                    value && value !== '' ? (
                      <div key={key} className="bg-white/[0.04] p-2.5 sm:p-3 border border-white/[0.07] rounded-lg">
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
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
                <div key={label} className="bg-white/[0.03] p-2.5 sm:p-3 border border-white/[0.07] rounded-lg">
                  <div className="text-white/40 text-[8px] sm:text-[9px] uppercase tracking-[0.14em] mb-1">{label}</div>
                  <div className={`text-[12px] sm:text-[13px] font-semibold truncate ${color}`}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative px-4 sm:px-6 py-3 sm:py-4 border-t border-white/[0.07] bg-black/20 flex justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-1.5 sm:py-2 border border-white/10 rounded-xl text-white/55 hover:text-white hover:border-white/20 transition-colors text-[10px] sm:text-[11px] uppercase tracking-[0.08em]"
          >
            Close
          </button>
          {onGenerateReport && (
            <button
              onClick={onGenerateReport}
              className="px-4 sm:px-6 py-1.5 sm:py-2 border border-[#00E5FF]/35 rounded-xl text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors text-[10px] sm:text-[11px] uppercase tracking-[0.08em] flex items-center gap-1.5 sm:gap-2"
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

  // Stagger each card's fade-in when the list first appears
  useEffect(() => {
    if (!runningScans || runningScans.length === 0) return;
    runningScans.forEach((scan, i) => {
      const t = setTimeout(() => {
        setVisibleCards(prev => new Set([...prev, scan.id]));
      }, i * 70);
      return () => clearTimeout(t);
    });
  }, []);   // intentionally run only once on mount

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
  const handleInvestigationClick = (scan, e) => { e.stopPropagation(); setInvestigationModal({ isOpen: true, scan }); };
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
          
          // ── FIX: Status Priority Logic ──
          // If the prop says 'pending'/'queued' but local state says 'running', 
          // we prefer 'running' (optimistic update).
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
          
          // Use live progress from scan object if available
          const progress = isCompleted ? 100 : (scan.progress !== undefined ? scan.progress : (s.progress || 0));
          const isVisible = visibleCards.has(scan.id);

          return (
            <div
              key={scan.id}
              className="relative border border-white/10 hover:border-[#00E5FF]/30 rounded-xl sm:rounded-2xl transition-colors duration-200 bg-[#0a0a0a] overflow-hidden"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 320ms ease, transform 320ms ease',
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
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-[#00E5FF]/40 rounded-lg text-[#00E5FF] hover:bg-[#00E5FF]/15 transition-all duration-150 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] bg-[#00E5FF]/5"
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
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-red-500/40 rounded-lg text-red-400 hover:bg-red-500/15 transition-all duration-150 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] bg-red-500/5"
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
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-[#00E5FF]/40 rounded-lg text-[#00E5FF] hover:bg-[#00E5FF]/15 transition-all duration-150 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] bg-[#00E5FF]/5"
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
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-[#fbbf24]/40 rounded-lg text-[#fbbf24] hover:bg-[#fbbf24]/15 transition-all duration-150 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] bg-[#fbbf24]/5"
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
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-[#2DD4BF]/40 rounded-lg text-[#2DD4BF] hover:bg-[#2DD4BF]/15 transition-all duration-150 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] bg-[#2DD4BF]/5"
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
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-white/15 rounded-lg text-white/60 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all duration-150 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em]"
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                      Edit
                    </button>

                    <button
                      onClick={(e) => handleRemoveClick(scan, e)}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-[#f87171]/30 rounded-lg text-[#f87171] hover:bg-[#f87171]/15 transition-all duration-150 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] bg-[#f87171]/[0.04]"
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
    if (!scanHistory || scanHistory.length === 0) return;
    scanHistory.slice(0, 3).forEach((scan, i) => {
      const t = setTimeout(() => {
        setVisibleCards(prev => new Set([...prev, scan.id]));
      }, i * 80);
      return () => clearTimeout(t);
    });
  }, []);

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
                className="relative border border-white/10 hover:border-[#00E5FF]/30 rounded-xl transition-colors duration-200 bg-[#0a0a0a] overflow-hidden"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 320ms ease, transform 320ms ease',
                }}
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
        <div className="relative border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center bg-[#0a0a0a] overflow-hidden">
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

      <div className="relative border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0a0a0a] overflow-hidden">
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