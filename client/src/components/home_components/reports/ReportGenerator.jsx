import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from '../../../services/api';
import { useSocket } from '../../../context/SocketContext';

const ReportGenerator = ({ isOpen, onClose, onReportGenerated }) => {
  const { socket, isConnected } = useSocket();
  const [step, setStep] = useState(1);
  const [scans, setScans] = useState([]);
  const [loadingScans, setLoadingScans] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStatus, setGenStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchTimeoutRef = useRef(null);
  const loadingRef = useRef(false);
  const modalRef = useRef(null);
  
  const [formData, setFormData] = useState({
    scanId: '',
    name: '',
    investigator: '',
    agency: 'OSINT_NETWORK_COMMAND',
    template: 'technical',
    theme: 'noir',
    layout: 'classic',
    classification: 'confidential',
    sections: ['summary', 'findings', 'assets', 'technical_logs', 'risk_score', 'metadata'],
    investigatorNotes: '',
    format: 'pdf',
    pageSize: 'a4',
    lineSpacing: 'relaxed',
    fontStyle: 'modern',
    includeWatermark: true,
    includePageNumbers: true,
    includeSeparators: true,
    compactLayout: false,
    highPriority: false,
    encryption: 'standard'
  });

  const fetchScansFallback = useCallback(async () => {
    setLoadingScans(true);
    loadingRef.current = true;
    try {
      const response = await api.get('/api/modules/company-jobscam');
      if (response.data.success) {
        const formatted = (response.data.scans || [])
          .filter(s => s.status === 'completed')
          .map(s => {
             let desc = 'intelligence unit';
             if (s.target && typeof s.target === 'object') {
               desc = s.target.label || s.target.value || desc;
             } else if (s.target) {
               desc = String(s.target);
             }
             return {
               id: String(s.id),
               name: 'investigation node',
               description: String(desc),
               status: 'completed',
               created_at: s.created_at
             };
          });
        setScans(formatted);
      }
    } catch (err) {
      console.error('Failed to load scans:', err);
    } finally {
      setLoadingScans(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setLoadingScans(true);
      loadingRef.current = true;
      
      if (socket && isConnected) {
        socket.emit('request_completed_scans');
        
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = setTimeout(() => {
          if (loadingRef.current) {
            fetchScansFallback();
          }
        }, 5000);
      } else {
        fetchScansFallback();
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, [isOpen, socket, isConnected, fetchScansFallback]);

  useEffect(() => {
    if (!socket) return;

    const handleScans = (data) => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      if (data.success) {
        setScans(data.scans || []);
      }
      setLoadingScans(false);
      loadingRef.current = false;
    };

    const handleReportProgress = (data) => {
      setGenProgress(data.progress);
      setGenStatus(data.status);
    };

    socket.on('completed_scans_list', handleScans);
    socket.on('report_progress', handleReportProgress);
    return () => {
      socket.off('completed_scans_list', handleScans);
      socket.off('report_progress', handleReportProgress);
    };
  }, [socket]);

  const handleGenerate = async () => {
    if (!formData.scanId) return;
    setGenerating(true);
    try {
      const response = await api.post('/api/reports', formData);
      if (response.data.success) {
        const reportId = response.data.reportId;
        
        // Notify parent immediately so it can show the "generating" report card
        if (onReportGenerated) onReportGenerated();
        
        // We'll listen for the 'report_ready' socket event for the auto-download
        if (socket) {
          const handleReportReady = (data) => {
            if (data.reportId === reportId) {
              setGenerating(false);
              // Trigger download
              const link = document.createElement('a');
              link.href = data.filePath;
              link.setAttribute('download', `${formData.name}.pdf`);
              document.body.appendChild(link);
              link.click();
              link.remove();
              
              if (onReportGenerated) onReportGenerated();
              handleClose();
              socket.off('report_ready', handleReportReady);
            }
          };
          socket.on('report_ready', handleReportReady);
          
          // Fallback if socket fails: check every 3 seconds for 30 seconds
          let checks = 0;
          const checkInterval = setInterval(async () => {
            checks++;
            try {
              const checkRes = await api.get('/api/reports');
              const report = checkRes.data.reports.find(r => r.id === reportId);
              if (report && report.status === 'ready') {
                clearInterval(checkInterval);
                if (generating) { // Only if socket didn't already handle it
                  setGenerating(false);
                  const link = document.createElement('a');
                  link.href = `${api.defaults.baseURL}${report.file_path}`;
                  link.setAttribute('download', `${report.title}.pdf`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  if (onReportGenerated) onReportGenerated();
                  handleClose();
                }
              }
            } catch (e) {}
            if (checks > 10) clearInterval(checkInterval);
          }, 3000);
        } else {
          // If no socket, just close and let user find it in reports list
          if (onReportGenerated) onReportGenerated();
          handleClose();
        }
      }
    } catch (err) {
      console.error(err);
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSearchTerm('');
    setGenerating(false);
    setGenProgress(0);
    setGenStatus('');
    setFormData({
      scanId: '',
      name: '',
      investigator: '',
      agency: 'OSINT_NETWORK_COMMAND',
      template: 'technical',
      theme: 'noir',
      layout: 'classic',
      classification: 'confidential',
      sections: ['summary', 'findings', 'assets', 'technical_logs'],
      investigatorNotes: '',
      format: 'pdf',
      pageSize: 'a4',
      lineSpacing: 'relaxed',
      fontStyle: 'modern',
      includeWatermark: true,
      includePageNumbers: true,
      highPriority: false,
      encryption: 'standard'
    });
    onClose();
  };

  const templates = [
    { id: 'technical', name: 'Technical Analysis', desc: 'deep-dive dossier with raw logs.' },
    { id: 'executive', name: 'Executive Summary', desc: 'high-level risk briefing.' },
    { id: 'squad', name: 'Squad Briefing', desc: 'team-collaboration report.' }
  ];

  const themes = [
    { id: 'noir', name: 'Noir', color: '#0A0C10' },
    { id: 'executive', name: 'Executive Blue', color: '#1E293B' },
    { id: 'paper', name: 'Paper', color: '#FFFFFF' },
    { id: 'slate', name: 'Modern Slate', color: '#334155' }
  ];

  const informationBlocks = [
    { id: 'summary', name: 'exec summary' },
    { id: 'findings', name: 'findings' },
    { id: 'assets', name: 'assets' },
    { id: 'technical_logs', name: 'raw logs' },
    { id: 'risk_score', name: 'risk analysis' },
    { id: 'metadata', name: 'system metadata' }
  ];

  const formats = [
    { id: 'pdf', label: 'PDF' },
    { id: 'html', label: 'HTML' },
    { id: 'json', label: 'JSON' }
  ];

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const isStepValid = () => {
    if (step === 1) return !!formData.scanId;
    if (step === 2) return !!formData.template && formData.sections.length > 0;
    if (step === 3) return !!formData.name;
    return false;
  };

  const toggleSection = (id) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.includes(id) 
        ? prev.sections.filter(s => s !== id) 
        : [...prev.sections, id]
    }));
  };

  const filteredScans = scans.filter(s => 
    String(s.name).toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(s.description).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(s.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedScan = scans.find(s => s.id === formData.scanId);
  const selectedScanName = selectedScan ? String(selectedScan.name) : "no_node_selected";

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[10000000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300 font-['Poppins']">
      <div 
        ref={modalRef}
        className="w-[92vw] h-[95vh] max-w-[1700px] flex flex-col bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.8)] relative animate-in zoom-in-95 duration-500"
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-5 right-8 z-50 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Top Header Glow */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent" />
        
        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          
          {/* LEFT PANEL: CONFIGURATION */}
          <div className="w-full lg:w-[44%] flex flex-col bg-black/20 p-6 lg:p-10 relative border-r border-white/5 overflow-hidden">
            
            {/* Header Stage Selector */}
            <div className="flex items-center gap-4 mb-8 flex-shrink-0 pr-12">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-1 flex flex-col gap-2">
                  <div className={`h-1 rounded-full transition-all duration-1000 ease-out ${step >= i ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]' : 'bg-white/5'}`} />
                  <span className={`text-[10px] font-black tracking-[0.2em] transition-colors ${step === i ? 'text-[#00E5FF]' : 'text-white/20'}`}>STAGE 0{i}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pr-1 mb-6">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h4 className="text-white/60 text-sm font-semibold tracking-wider uppercase">
                      Select Completed Scan to Sync
                    </h4>
                    
                    <div className="relative w-full md:w-64">
                      <input
                        type="text"
                        placeholder="Filter nodes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-[#00E5FF]/50 transition-colors placeholder-white/20"
                      />
                    </div>
                  </div>

                  <div className="relative min-h-[300px] bg-white/[0.01] border border-white/5 rounded-[32px] overflow-hidden">
                    <div className="grid grid-cols-1 gap-4 p-5 max-h-[500px] overflow-y-auto no-scrollbar">
                      {loadingScans ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-6">
                          <div className="w-12 h-12 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin" />
                          <p className="text-[10px] text-[#00E5FF] font-bold lowercase tracking-[0.3em] animate-pulse">scanning archive...</p>
                        </div>
                      ) : scans.length === 0 ? (
                        <div className="py-16 text-center border border-dashed border-white/10 rounded-[32px] bg-white/[0.01]">
                          <h5 className="text-white/40 text-xs font-bold uppercase tracking-[0.1em] mb-1.5">NO SCANS COMPLETED YET !</h5>
                          <p className="text-[9px] text-white/20 lowercase tracking-normal">dossier synthesis requires a finalized investigation archive node</p>
                        </div>
                      ) : (
                        filteredScans.map((s, idx) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, scanId: s.id, name: `${String(s.name)} - DOSSIER_${s.id}` })}
                            className={`group relative p-5 rounded-[24px] border transition-all duration-500 text-left transform-gpu active:scale-[0.98] animate-slide-up ${
                              formData.scanId === s.id 
                                ? 'bg-[#00E5FF]/10 border-[#00E5FF]/40 shadow-[0_0_30px_rgba(0,229,255,0.05)] ring-1 ring-[#00E5FF]/20' 
                                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                            }`}
                            style={{ animationDelay: `${idx * 0.03}s` }}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                                formData.scanId === s.id 
                                  ? 'bg-[#00E5FF]/20 border-[#00E5FF]/30 text-[#00E5FF]' 
                                  : 'bg-white/5 border-white/10 text-white/40'
                              }`}>
                                <span className="text-lg font-bold">{(s.name || 'S')[0]}</span>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`text-[10px] font-black tracking-widest uppercase transition-colors ${formData.scanId === s.id ? 'text-[#00E5FF]/60' : 'text-white/20'}`}>
                                  NODE_{s.id}
                                </span>
                                <span className="text-[11px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase border bg-[#2DD4BF]/10 text-[#2DD4BF] border-[#2DD4BF]/20 shadow-[0_0_10px_rgba(45,212,191,0.1)]">
                                  COMPLETED
                                </span>
                              </div>
                            </div>
                            
                            <h5 className={`text-base font-bold truncate mb-1.5 transition-colors duration-500 uppercase tracking-tight ${
                              formData.scanId === s.id ? 'text-[#00E5FF]' : 'text-white'
                            }`}>
                              {String(s.name)}
                            </h5>
                            <p className="text-[10px] text-white/30 line-clamp-2 leading-relaxed mb-4 font-normal lowercase">
                              {String(s.description)}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${formData.scanId === s.id ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]' : 'bg-white/10'}`} />
                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">
                                  Intelligence Node Active
                                </span>
                              </div>
                              <span className="text-[9px] font-bold text-white/20 tracking-wider">
                                {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'SYNCED'}
                              </span>
                            </div>

                            {formData.scanId === s.id && (
                              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#00E5FF] text-black rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-[#00E5FF]/[0.02] border border-[#00E5FF]/10 rounded-2xl flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed">
                      <span className="text-[#00E5FF]/60 font-bold uppercase tracking-wider mr-1">Synthesis Policy:</span>
                      Synchronizing investigation nodes will aggregate all discovered intelligence into a unified dossier. Ensure clearance levels are verified before final execution.
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-white tracking-tight uppercase leading-none">SIGNATURE CONFIG</h4>
                    <p className="text-white/40 text-[11px] lowercase tracking-normal leading-relaxed font-medium">configure visual themes, intelligence block sorting, and operational security directives</p>
                  </div>

                  <div className="grid grid-cols-1 gap-10">
                    <div className="space-y-4">
                      <label className="text-[11px] font-black tracking-[0.15em]">VISUAL THEME</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {themes.map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, theme: t.id })}
                            className={`p-4 rounded-2xl border text-center transition-all duration-300 transform-gpu active:scale-[0.95] ${
                              formData.theme === t.id 
                                ? 'bg-[#00E5FF]/10 border-[#00E5FF]/60 shadow-[0_0_20px_rgba(0,229,255,0.1)]' 
                                : 'bg-white/5 border-white/5 hover:border-white/15'
                            }`}
                          >
                             <div className="w-6 h-6 rounded-lg mx-auto mb-2.5 border border-white/10" style={{ background: t.color }} />
                             <h5 className="text-[10px] font-black text-white uppercase">{t.name}</h5>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black tracking-[0.15em]">INTELLIGENCE BLOCKS</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {informationBlocks.map(block => (
                          <button
                            key={block.id}
                            type="button"
                            onClick={() => toggleSection(block.id)}
                            className={`px-4 py-3 rounded-xl border flex items-center justify-between transition-all duration-300 transform-gpu active:scale-[0.95] ${
                              formData.sections.includes(block.id)
                                ? 'bg-[#00E5FF]/10 border-[#00E5FF]/40 text-[#00E5FF]'
                                : 'bg-white/5 border-white/5 text-white/30'
                            }`}
                          >
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">{block.name}</span>
                             {formData.sections.includes(block.id) && <div className="w-1 h-1 bg-[#00E5FF] rounded-full" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black tracking-[0.15em] text-[#00E5FF] uppercase block pl-1 border-l-2 border-[#00E5FF]/50">LAYOUT CONTROLS</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { key: 'includeSeparators', label: 'section lines' },
                          { key: 'compactLayout', label: 'compact mode' }
                        ].map(opt => (
                          <div key={opt.key} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-2xl group hover:border-[#00E5FF]/20 transition-all">
                            <span className="text-[10px] font-bold text-white/60 lowercase">{opt.label}</span>
                            <button 
                              type="button"
                              onClick={() => setFormData({...formData, [opt.key]: !formData[opt.key]})}
                              className={`w-10 h-5 rounded-full transition-all duration-300 relative ${formData[opt.key] ? 'bg-[#00E5FF]' : 'bg-white/10'}`}
                            >
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all duration-300 ${formData[opt.key] ? 'left-5.5' : 'left-0.5'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-white tracking-tight uppercase leading-none">AUTHORIZATION</h4>
                    <p className="text-white/40 text-[11px] lowercase tracking-normal leading-relaxed font-medium">assign nomenclature and security clearance validation for archive finalization</p>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[11px] font-black tracking-[0.15em]">DOSSIER NOMENCLATURE</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-3xl text-white text-sm focus:border-[#00E5FF]/40 outline-none transition-all font-bold uppercase tracking-tight shadow-inner"
                        placeholder="ENTER REFERENCE ID..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black tracking-[0.15em]">DOCUMENT FORMAT</label>
                        <div className="flex gap-2">
                          {formats.map(f => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, format: f.id })}
                              className={`flex-1 py-3.5 rounded-xl border text-[9px] font-bold transition-all duration-300 transform-gpu active:scale-[0.95] ${
                                formData.format === f.id 
                                  ? 'bg-[#00E5FF]/10 border-[#00E5FF]/50 text-[#00E5FF]' 
                                  : 'bg-white/5 border-white/5 text-white/30 hover:border-white/15'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[11px] font-black tracking-[0.15em]">CLEARANCE</label>
                        <select
                          value={formData.classification}
                          onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                          className="w-full px-6 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white text-[12px] font-black uppercase tracking-tight focus:border-[#00E5FF]/40 outline-none appearance-none cursor-pointer"
                        >
                          <option value="confidential" className="bg-black/20">confidential // internal</option>
                          <option value="secret" className="bg-black/20">top secret // restricted</option>
                          <option value="public" className="bg-black/20">open source // global</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black tracking-[0.15em]">WORD_STYLE AUTOMATION</label>
                      <div className="grid grid-cols-2 gap-3">
                         {[
                           { key: 'autoSummary', label: 'auto-summarize results' },
                           { key: 'linkSources', label: 'cross-link evidence' }
                         ].map(opt => (
                           <div key={opt.key} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-2xl">
                             <span className="text-[9px] font-normal text-white/50 lowercase">{opt.label}</span>
                             <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] shadow-[0_0_5px_#2DD4BF]" />
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION FOOTER */}
            <div className="mt-auto pt-6 flex items-center justify-between gap-6 flex-shrink-0 border-t border-white/5">
               <div className="flex items-center gap-4">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center gap-2.5 px-6 py-3 border border-white/10 rounded-xl text-white/40 hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition-all duration-300 text-[10px] font-normal lowercase tracking-tight group active:scale-95"
                    >
                      <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                      </svg>
                      <span>[ back ]</span>
                    </button>
                  )}
               </div>

               <div className="flex flex-col gap-2 flex-1">
                 {generating && (
                   <div className="w-full space-y-2 animate-in fade-in duration-500">
                     <div className="flex justify-between items-center px-1">
                       <span className="text-[9px] font-black text-[#00E5FF] uppercase tracking-widest">{genStatus || 'Initializing Synthesis...'}</span>
                       <span className="text-[9px] font-black text-[#00E5FF]">{genProgress}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <div 
                         className="h-full bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                         style={{ width: `${genProgress}%` }}
                       />
                     </div>
                   </div>
                 )}
                 <button
                    type="button"
                    onClick={step === 3 ? handleGenerate : nextStep}
                    disabled={!isStepValid() || generating}
                    className={`flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-500 transform-gpu active:scale-[0.97] w-full ${
                      isStepValid() 
                        ? 'bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:brightness-110' 
                        : 'bg-white/5 border border-white/10 text-white/20 grayscale cursor-not-allowed opacity-30'
                    }`}
                 >
                    <span>{generating ? 'synthesizing...' : (step === 3 ? "EXECUTE SYNTHESIS" : "NEXT PROTOCOL")}</span>
                    {!generating && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                 </button>
               </div>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE DRAFT */}
          <div className="hidden lg:flex flex-1 bg-black/40 flex-col overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.02] via-transparent to-transparent pointer-events-none" />
             
             {/* Preview Header */}
             <div className="p-6 border-b border-white/[0.03] flex items-center justify-between relative z-10 bg-black/30">
                <div className="flex items-center gap-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />
                   <span className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase italic">LIVE DRAFT</span>
                </div>
             </div>

             {/* Preview Canvas */}
             <div className="flex-1 p-10 overflow-y-auto no-scrollbar relative z-10 flex flex-col items-center bg-black/20">
             <div className={`w-full max-w-[650px] p-12 sm:p-16 shadow-[0_40px_100px_rgba(0,0,0,1)] min-h-[900px] relative transform-gpu transition-all duration-700 ${
             formData.theme === 'paper' ? 'bg-white text-gray-900 border-none' : 
             formData.theme === 'executive' ? 'bg-[#1E293B] text-blue-100 border border-blue-400/20' :
             formData.theme === 'slate' ? 'bg-[#334155] text-slate-100 border border-slate-400/20' :
             'bg-[#080808] text-white border border-white/10'
             }`}>                   
                   {/* Security Watermark */}
                   {formData.includeWatermark && (
                      <div className={`absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-45deg] select-none ${formData.theme === 'paper' ? 'text-black' : 'text-current'}`}>
                         <span className="text-[8rem] font-bold tracking-tighter leading-none">{formData.classification.toUpperCase()}</span>
                      </div>
                   )}

                   <div className="relative z-20 h-full flex flex-col font-serif">
                      {/* Document Header */}
                      <div className={`flex justify-between items-start border-b-2 pb-6 mb-10 ${formData.theme === 'paper' ? 'border-gray-200' : 'border-current opacity-20'}`}>
                        <div className="space-y-1">
                          <h2 className="text-2xl font-bold tracking-tight uppercase leading-none font-['Poppins']">{formData.template} DOSSIER</h2>
                          <div className="flex items-center gap-2 pt-1">
                             <div className={`w-1 h-1 rounded-full ${formData.classification === 'secret' ? 'bg-red-600' : 'bg-[#00E5FF]'}`} />
                             <p className="text-[8px] font-bold opacity-70 tracking-[0.2em] uppercase font-['Poppins']">{formData.classification} // ARCHIVE</p>
                          </div>
                        </div>
                        <div className="text-right font-mono space-y-0.5">
                          <p className="text-[8px] opacity-40 uppercase">TIMESTAMP: {new Date().toLocaleDateString()}</p>
                          <p className={`text-[8px] uppercase tracking-tighter font-bold ${formData.theme === 'paper' ? 'text-[#00E5FF]' : 'text-current'}`}>ID: #ID-{formData.scanId || "PENDING"}</p>
                        </div>
                      </div>

                      {/* Document Sections */}
                      <div className="space-y-10 flex-1">
                        <section className="space-y-4">
                          <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] font-['Poppins'] ${formData.theme === 'paper' ? 'border-gray-100' : 'border-current opacity-10'} ${formData.includeSeparators ? 'border-b pb-2' : ''}`}>01. EXECUTIVE BRIEFING</h3>
                          <p className={`text-[13px] leading-relaxed opacity-90 italic font-normal tracking-normal font-sans ${formData.name ? 'text-inherit' : 'text-gray-400'}`}>
                            {formData.name || "awaiting nomenclature assignment from protocol stage 03..."}
                          </p>
                        </section>

                        <section className="space-y-4">
                          <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] font-['Poppins'] ${formData.theme === 'paper' ? 'border-gray-100' : 'border-current opacity-10'} ${formData.includeSeparators ? 'border-b pb-2' : ''}`}>02. INTEL VECTORS</h3>
                          <div className="space-y-4">
                             <div className={`flex items-center gap-4 p-4 rounded-2xl font-sans border transition-all ${formData.theme === 'paper' ? 'bg-gray-50 border-gray-100' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                                <div className="min-w-0">
                                   <span className="text-[10px] font-black uppercase opacity-40 block">PRIMARY_SOURCE</span>
                                   <span className="text-[12px] font-black tracking-tight truncate block max-w-[220px]">{selectedScanName}</span>
                                </div>
                             </div>
                          </div>
                        </section>

                        <section className="space-y-4">
                          <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] font-['Poppins'] ${formData.theme === 'paper' ? 'border-gray-100' : 'border-current opacity-10'} ${formData.includeSeparators ? 'border-b pb-2' : ''}`}>03. DATA_SYNC_MAP</h3>
                          <div className="grid grid-cols-2 gap-3 font-sans">
                             {formData.sections.map((s) => (
                                <div key={s} className={`px-3 py-2 border rounded-xl flex items-center justify-between ${formData.theme === 'paper' ? 'border-gray-100 bg-gray-50/50' : 'border-white/[0.05] bg-white/[0.01]'}`}>
                                   <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{s}</span>
                                   <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                                </div>
                             ))}
                          </div>
                        </section>
                      </div>

                      {/* Document Footer */}
                      <div className={`mt-auto pt-8 border-t flex justify-between items-center text-[7px] font-bold opacity-30 uppercase tracking-[0.4em] font-['Poppins'] ${formData.theme === 'paper' ? 'border-gray-100' : 'border-current opacity-10'}`}>
                         <span>OSINT_ARCHIVE_NODE</span>
                         <span>PAGE_00{step}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.97) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-in { animation-duration: 400ms; animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); animation-fill-mode: both; }
        .fade-in { animation-name: fadeIn; }
        .zoom-in-95 { animation-name: zoomIn; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ReportGenerator;
