import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../../services/api';

const ReportGenerator = ({ isOpen, onClose, onReportGenerated }) => {
  const [step, setStep] = useState(1);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    template: 'technical',
    pdfTemplate: 'standard',
    classification: 'confidential',
    sections: ['summary', 'findings', 'assets', 'technical_logs'],
    investigatorNotes: '',
    format: 'pdf'
  });

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await api.get('/api/projects');
      if (response.data.success) {
        setProjects(response.data.projects);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const templates = [
    { 
      id: 'technical', 
      name: 'technical analysis', 
      desc: 'deep-dive dossier with raw logs, ssl details, and ioc lists.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    { 
      id: 'executive', 
      name: 'executive summary', 
      desc: 'high-level risk briefing with charts and visualization.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'squad', 
      name: 'squad briefing', 
      desc: 'collaboration-focused report highlighting team shares.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  const pdfTemplates = [
    { id: 'standard', name: 'Standard protocol', desc: 'Default investigative layout' },
    { id: 'noir', name: 'Dark obsidian', desc: 'High-contrast tactical theme' },
    { id: 'minimal', name: 'Clean minimalist', desc: 'Focus on essential data' },
    { id: 'compact', name: 'Compact briefing', desc: 'Dense intelligence package' }
  ];

  const sections = [
    { 
      id: 'summary', 
      name: 'summary', 
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'findings', 
      name: 'findings', 
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.03 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      id: 'assets', 
      name: 'assets', 
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    { 
      id: 'technical_logs', 
      name: 'evidence', 
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    { 
      id: 'timeline', 
      name: 'timeline', 
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'risk_analysis', 
      name: 'risk', 
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  const formats = [
    { 
      id: 'pdf', 
      label: 'PDF', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'html', 
      label: 'HTML', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    { 
      id: 'xml', 
      label: 'XML', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'jpg', 
      label: 'JPG', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'json', 
      label: 'JSON', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    }
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // 1. First, create the report record in DB
      const response = await api.post('/api/reports', formData);
      
      if (response.data.success) {
        // 2. Fetch full intelligence data to generate the file
        const intelRes = await api.get(`/api/projects/${formData.projectId}/assets`);
        const intelData = intelRes.data;

        // 3. Synthesize the file based on format
        const fileName = `${formData.name.replace(/\s+/g, '_')}_${new Date().getTime()}`;
        let blob;
        let mimeType;

        if (formData.format === 'json') {
          const content = JSON.stringify({
            report_info: formData,
            intelligence_data: intelData,
            generated_at: new Date().toISOString()
          }, null, 2);
          blob = new Blob([content], { type: 'application/json' });
          mimeType = 'json';
        } else if (formData.format === 'xml') {
          // Simple XML serialization
          const content = `<?xml version="1.0" encoding="UTF-8"?>
<report>
  <metadata>
    <title>${formData.name}</title>
    <classification>${formData.classification}</classification>
    <generated_at>${new Date().toISOString()}</generated_at>
  </metadata>
  <findings>
    ${intelData.findings.map(f => `<finding severity="${f.severity}"><title>${f.title}</title><desc>${f.description}</desc></finding>`).join('\n')}
  </findings>
</report>`;
          blob = new Blob([content], { type: 'application/xml' });
          mimeType = 'xml';
        } else if (formData.format === 'html') {
          const content = `<html><head><title>${formData.name}</title><style>body{font-family:sans-serif;background:#000;color:white;padding:50px;} h1{color:#00E5FF;}</style></head><body><h1>${formData.name}</h1><h3>Classification: ${formData.classification}</h3><hr/><h2>Findings</h2>${intelData.findings.map(f => `<div><h4>${f.title} (${f.severity})</h4><p>${f.description}</p></div>`).join('')}</body></html>`;
          blob = new Blob([content], { type: 'text/html' });
          mimeType = 'html';
        } else {
          // For PDF/JPG, use the browser's high-fidelity print mechanism
          // We trigger the print dialog for the current preview
          setTimeout(() => {
            window.print();
          }, 500);
        }

        // 4. Trigger download if a blob was created
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${fileName}.${mimeType}`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }

        if (onReportGenerated) onReportGenerated();
        handleClose();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to synthesize dossier');
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      projectId: '',
      name: '',
      template: 'technical',
      pdfTemplate: 'standard',
      classification: 'confidential',
      sections: ['summary', 'findings', 'assets', 'technical_logs'],
      investigatorNotes: '',
      format: 'pdf'
    });
    onClose();
  };

  const toggleSection = (id) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.includes(id) 
        ? prev.sections.filter(s => s !== id) 
        : [...prev.sections, id]
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="intelligence dossier builder" size="xl">
      <div className="flex flex-col lg:flex-row h-[75vh] -m-6 overflow-hidden bg-[#0D0F14] font-sans">
        
        {/* Left: Configuration Steps */}
        <div className="w-full lg:w-[450px] flex flex-col border-r border-white/5 bg-black p-8 overflow-y-auto no-scrollbar relative z-20">
          
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#00E5FF]' : 'bg-white/5'}`} />
            ))}
          </div>

          {/* STEP 1: PROJECT SYNC */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-bold text-white tracking-tight capitalize mb-2">Sync intelligence</h4>
                <p className="text-white/40 text-[10px] font-medium tracking-wide font-sans">Select a project to aggregate investigation data.</p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar animate-fade-in">
                {loadingProjects ? (
                  <div className="py-10 flex justify-center"><div className="w-8 h-8 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin" /></div>
                ) : projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setFormData({ ...formData, projectId: p.id, name: `${p.name} - investigation dossier` })}
                    className={`w-full text-left p-5 rounded-2xl border transition-all ${
                      formData.projectId === p.id 
                        ? 'bg-[#00E5FF]/10 border-[#00E5FF]/30' 
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-bold text-[#00E5FF]/40 tracking-widest uppercase font-sans">id: {p.id}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full uppercase font-sans">{p.status}</span>
                    </div>
                    <h5 className="text-sm font-bold text-white tracking-tight">{p.name}</h5>
                    <p className="text-[10px] text-white/20 mt-1 line-clamp-1 lowercase">{p.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: TEMPLATE & SECTIONS */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h4 className="text-xl font-bold text-white tracking-tight capitalize mb-2">Design parameters</h4>
                <p className="text-white/40 text-[10px] font-medium tracking-wide">Configure briefing template and data inclusion.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-white/20 tracking-widest uppercase font-sans">output template</label>
                <div className="grid grid-cols-1 gap-2">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setFormData({ ...formData, template: t.id })}
                      className={`flex gap-4 items-center p-4 rounded-2xl border transition-all text-left ${
                        formData.template === t.id 
                          ? 'bg-[#00E5FF]/10 border-[#00E5FF]/30' 
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className={`${formData.template === t.id ? 'text-[#00E5FF]' : 'text-white/20'} transition-colors`}>
                        {t.icon}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white capitalize font-sans">{t.name}</h5>
                        <p className="text-[9px] text-white/30 mt-0.5 font-sans lowercase">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-white/20 tracking-widest uppercase font-sans">dossier sections</label>
                <div className="grid grid-cols-2 gap-2">
                  {sections.map(s => (
                    <button
                      key={s.id}
                      onClick={() => toggleSection(s.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[10px] font-bold transition-all tracking-tight font-sans capitalize ${
                        formData.sections.includes(s.id) 
                          ? 'bg-[#00E5FF] text-black border-[#00E5FF]' 
                          : 'bg-white/[0.02] border-white/5 text-white/40'
                      }`}
                    >
                      <span className={formData.sections.includes(s.id) ? 'text-black' : 'text-[#00E5FF]'}>{s.icon}</span>
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FINAL REVIEW & FORMAT */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h4 className="text-xl font-bold text-white tracking-tight capitalize mb-2">Manual briefing</h4>
                <p className="text-white/40 text-[10px] font-medium tracking-wide">Add your professional observations and classification.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 tracking-widest uppercase font-sans">report nomenclature</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white text-sm focus:border-[#00E5FF]/40 outline-none transition-all font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 tracking-widest uppercase font-sans">export format</label>
                  <div className="grid grid-cols-5 gap-2">
                    {formats.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setFormData({ ...formData, format: f.id })}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          formData.format === f.id 
                            ? 'bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]' 
                            : 'bg-white/[0.02] border-white/5 text-white/30 hover:border-white/20'
                        }`}
                      >
                        <span className="text-sm mb-1">{f.icon}</span>
                        <span className="text-[8px] font-black">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.format === 'pdf' && (
                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-bold text-white/20 tracking-widest uppercase font-sans">pdf draft design</label>
                    <div className="grid grid-cols-2 gap-2">
                      {pdfTemplates.map(pt => (
                        <button
                          key={pt.id}
                          onClick={() => setFormData({ ...formData, pdfTemplate: pt.id })}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            formData.pdfTemplate === pt.id 
                              ? 'bg-[#00E5FF]/10 border-[#00E5FF]/30' 
                              : 'bg-white/[0.02] border-white/5 text-white/30'
                          }`}
                        >
                          <h6 className="text-[10px] font-bold text-white mb-0.5 capitalize">{pt.name}</h6>
                          <p className="text-[8px] opacity-40 lowercase">{pt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 tracking-widest uppercase font-sans">security classification</label>
                  <select
                    value={formData.classification}
                    onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                    className="w-full px-5 py-4 bg-black border border-white/10 rounded-2xl text-white text-sm focus:border-[#00E5FF]/40 outline-none appearance-none cursor-pointer font-sans"
                  >
                    <option value="confidential">confidential // internal</option>
                    <option value="secret">top secret // eyes only</option>
                    <option value="public">open source // unclassified</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Builder Navigation */}
          <div className="mt-auto pt-8 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 text-[10px] font-bold tracking-widest hover:text-white transition-all font-sans uppercase"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !formData.projectId}
                className="flex-1 py-4 bg-[#00E5FF] text-black font-bold rounded-2xl text-[10px] uppercase tracking-wider transition-all hover:brightness-110 disabled:opacity-20 disabled:grayscale font-sans"
              >
                Next protocol
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 py-4 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-2xl text-[10px] uppercase tracking-wider transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(0,229,255,0.3)] disabled:opacity-50 font-sans"
              >
                {generating ? 'synthesizing...' : 'generate dossier'}
              </button>
            )}
          </div>
        </div>

        {/* Right: Real-time Live Preview Panel */}
        <div id="report-preview-canvas" className="hidden lg:flex flex-1 bg-[#12141A] flex-col overflow-hidden relative print:hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Preview Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10 bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
               <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase italic font-sans">Draft preview mode</span>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-bold text-white/30 uppercase tracking-widest border border-white/5 font-sans">Format: {formData.format}</span>
            </div>
          </div>

          {/* Preview Canvas (Scrollable) */}
          <div className="flex-1 p-12 overflow-y-auto no-scrollbar relative z-10">
            <div className={`max-w-[650px] mx-auto p-12 shadow-2xl min-h-[850px] relative transition-all duration-500 font-sans ${formData.pdfTemplate === 'noir' ? 'bg-[#0A0C10] text-white border border-white/10' : 'bg-white text-black'}`}>
               {/* Watermark */}
               <div className={`absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-45deg] select-none ${formData.pdfTemplate === 'noir' ? 'text-white' : 'text-black'}`}>
                  <span className="text-8xl font-black">{formData.classification.toUpperCase()}</span>
               </div>

               {/* Report Content Simulation */}
               <div className="relative z-20">
                  <div className={`flex justify-between items-start border-b-2 pb-6 mb-10 ${formData.pdfTemplate === 'noir' ? 'border-white/20' : 'border-black'}`}>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight uppercase mb-1">Intelligence dossier</h2>
                      <p className="text-[10px] font-bold opacity-60">Status: {formData.classification}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase">Date: {new Date().toLocaleDateString()}</p>
                      <p className="text-[10px] font-bold uppercase">Report ID: #DE-9942</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h3 className={`text-sm font-bold uppercase border-b pb-1 mb-4 ${formData.pdfTemplate === 'noir' ? 'border-white/10' : 'border-black/10'}`}>I. Executive summary</h3>
                      <p className="text-xs leading-relaxed opacity-80 italic lowercase">
                        {formData.name || "[Assemble intelligence to begin briefing...]"}
                      </p>
                    </section>

                    <section className="space-y-4">
                       <h3 className={`text-sm font-bold uppercase border-b pb-1 mb-2 ${formData.pdfTemplate === 'noir' ? 'border-white/10' : 'border-black/10'}`}>II. Operational targets</h3>
                       <div className="grid grid-cols-1 gap-2">
                          <div className={`h-3 rounded w-full animate-pulse ${formData.pdfTemplate === 'noir' ? 'bg-white/5' : 'bg-black/5'}`} />
                          <div className={`h-3 rounded w-[80%] animate-pulse ${formData.pdfTemplate === 'noir' ? 'bg-white/5' : 'bg-black/5'}`} />
                       </div>
                    </section>

                    <section className="space-y-4">
                       <h3 className={`text-sm font-bold uppercase border-b pb-1 mb-2 ${formData.pdfTemplate === 'noir' ? 'border-white/10' : 'border-black/10'}`}>III. Findings detail</h3>
                       <div className="space-y-3">
                          {[1,2].map(i => (
                             <div key={i} className={`p-3 border-l-2 ${formData.pdfTemplate === 'noir' ? 'border-[#00E5FF]/40 bg-white/5' : 'border-black bg-black/5'}`}>
                                <div className={`h-2 rounded w-1/2 mb-2 ${formData.pdfTemplate === 'noir' ? 'bg-white/10' : 'border-black/10'}`} />
                                <div className={`h-2 rounded w-full ${formData.pdfTemplate === 'noir' ? 'bg-white/5' : 'bg-black/5'}`} />
                             </div>
                          ))}
                       </div>
                    </section>
                  </div>

                  {/* Footer */}
                  <div className={`absolute bottom-12 left-12 right-12 pt-6 border-t flex justify-between items-center text-[8px] font-bold opacity-40 uppercase tracking-widest ${formData.pdfTemplate === 'noir' ? 'border-white/10' : 'border-black/10'}`}>
                     <span>Generated by OsintSaas cluster</span>
                     <span>Page 01 // 04</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* Global CSS for Printing PDF Dossiers */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-preview-canvas, #report-preview-canvas * { visibility: visible; }
          #report-preview-canvas { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            height: auto; 
            background: white !important;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </Modal>
  );
};

export default ReportGenerator;
