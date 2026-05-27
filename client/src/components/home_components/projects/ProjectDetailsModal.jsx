import { useEffect, useRef, useState } from 'react';

const ProjectDetailsModal = ({ isOpen, onClose, project }) => {
  const modalRef = useRef(null);
  const [data, setData] = useState({ assets: [], findings: [], scans: [] });
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && project?.id) {
      fetchIntelligence();
    }
  }, [isOpen, project?.id]);

  const fetchIntelligence = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/assets`, {
        credentials: 'include'
      });
      const resData = await response.json();
      if (response.ok) {
        setData(resData);
      }
    } catch (error) {
      console.error('Error fetching intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEsc = (e) => { e.key === 'Escape' && onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const getSeverityColor = (sev) => {
    switch(sev?.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-[#2DD4BF] bg-[#2DD4BF]/10 border-[#2DD4BF]/20';
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        ref={modalRef}
        className="relative w-full max-w-[90%] lg:max-w-[85%] xl:max-w-[80%] h-[90vh] bg-[#0A0C10] rounded-[40px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-slide-up"
      >
        {/* Intelligence Header */}
        <div className="relative p-8 lg:p-10 border-b border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-3xl bg-gradient-to-br from-[#00E5FF]/20 to-[#2DD4BF]/20 flex items-center justify-center border border-[#00E5FF]/30 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.03 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="absolute -inset-2 bg-[#00E5FF]/10 rounded-[36px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tighter uppercase">{project.name}</h2>
                  <span className="px-3 py-1 bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-black tracking-widest rounded-full uppercase">Verified Briefing</span>
                </div>
                <p className="text-white/40 text-xs lg:text-sm font-medium max-w-2xl line-clamp-1">{project.description || 'Confidential investigation data.'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end mr-4">
                <span className="text-[10px] font-bold text-white/20 tracking-widest uppercase">Classification</span>
                <span className="text-xs font-black text-red-500 tracking-wider">TOP SECRET // LEVEL 5</span>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-10">
            {['overview', 'findings', 'assets', 'metadata'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 border ${
                  activeView === tab 
                    ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.2)]' 
                    : 'text-white/30 border-transparent hover:text-white/60 hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Intelligence Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10 no-scrollbar bg-black/20">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-6 opacity-40">
              <div className="w-16 h-16 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin" />
              <span className="text-xs font-black text-[#00E5FF] tracking-[0.4em] uppercase animate-pulse">Decrypting Intelligence Package...</span>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              
              {/* VIEW: OVERVIEW */}
              {activeView === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Summary Cards */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: 'Scans Performed', val: data.scans.length, color: '#00E5FF' },
                        { label: 'Threats Detected', val: data.findings.length, color: '#F43F5E' },
                        { label: 'Assets Synced', val: data.assets.length, color: '#2DD4BF' }
                      ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
                          <span className="block text-[10px] font-black text-white/20 tracking-widest uppercase mb-2">{stat.label}</span>
                          <span className="text-3xl font-black text-white group-hover:scale-110 transition-transform inline-block" style={{ color: stat.color }}>{stat.val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-8 rounded-[40px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 flex flex-col h-[500px]">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 capitalize tracking-tight">
                        <div className="w-1.5 h-6 bg-[#00E5FF] rounded-full shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
                        threat intelligence briefing
                      </h3>
                      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar no-scrollbar hover:scrollbar-show">
                        {data.findings.map((f, i) => (
                          <div key={i} className="flex gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5 items-start hover:bg-white/[0.04] transition-all group">
                            <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                              f.severity === 'critical' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 
                              f.severity === 'high' ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' :
                              'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                            }`} />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-bold text-white capitalize tracking-tight">{f.title}</h4>
                                <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-white/5 text-white/40 uppercase tracking-widest">{f.severity}</span>
                              </div>
                              <p className="text-[11px] text-white/40 leading-relaxed font-medium lowercase">{f.description}</p>
                            </div>
                          </div>
                        ))}
                        {data.findings.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.03 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-center">No Active Threats Detected</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Info */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-[32px] bg-black border border-white/10 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                      </div>
                      <h4 className="text-[10px] font-black text-[#00E5FF] tracking-[0.3em] uppercase mb-6">Target Parameters</h4>
                      <div className="space-y-4">
                        {data.scans.map((s, i) => (
                          <div key={i} className="flex flex-col gap-1 border-l-2 border-white/5 pl-4 py-1">
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{s.scan_type}</span>
                            <span className="text-[11px] font-black text-white/70 truncate">{s.target_value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: FINDINGS (SSL, THREATS, ETC) */}
              {activeView === 'findings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.findings.map((finding, idx) => (
                    <div 
                      key={finding.id} 
                      className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5 hover:border-[#00E5FF]/30 transition-all group animate-slide-up"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase border ${getSeverityColor(finding.severity)}`}>
                            {finding.severity}
                          </span>
                          <span className="text-[9px] font-bold text-white/20 tracking-tighter uppercase">{finding.scan_type} Detected</span>
                        </div>
                        <span className="text-[10px] font-bold text-white/10">{new Date(finding.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <h4 className="text-base font-black text-white mb-2 group-hover:text-[#00E5FF] transition-colors uppercase tracking-tight">{finding.title}</h4>
                      <p className="text-xs text-white/40 leading-relaxed mb-6">{finding.description}</p>
                      
                      {finding.evidence && (
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-[10px] text-[#2DD4BF] overflow-x-auto whitespace-pre-wrap">
                          <div className="flex items-center gap-2 mb-2 opacity-30">
                            <div className="w-2 h-2 rounded-full bg-current" />
                            <span className="uppercase tracking-[0.2em] font-bold text-[8px]">Intelligence Evidence</span>
                          </div>
                          {finding.evidence}
                        </div>
                      )}
                    </div>
                  ))}
                  {data.findings.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white/[0.01] rounded-[40px] border border-dashed border-white/5">
                      <p className="text-white/10 text-xs font-black tracking-[0.4em] uppercase">No Critical Findings Isolated</p>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: ASSETS */}
              {activeView === 'assets' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data.assets.map((asset, idx) => (
                    <a
                      key={asset.id}
                      href={asset.url.startsWith('http') ? asset.url : `https://${asset.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group animate-slide-up block"
                      style={{ animationDelay: `${idx * 0.03}s` }}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:border-[#00E5FF]/40 transition-colors">
                        <svg className="w-6 h-6 text-white/20 group-hover:text-[#00E5FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <h5 className="text-sm font-black text-white mb-1 truncate uppercase tracking-tight">{asset.title}</h5>
                      <p className="text-[10px] text-white/30 truncate mb-4 font-medium">{asset.url}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#00E5FF]/40 tracking-widest uppercase">{asset.asset_type}</span>
                        <span className="text-[9px] font-bold text-white/10 uppercase">{new Date(asset.created_at).toLocaleDateString()}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* VIEW: METADATA */}
              {activeView === 'metadata' && (
                <div className="space-y-4 max-w-4xl mx-auto">
                  <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/10">
                    <h4 className="text-[10px] font-black text-[#00E5FF] tracking-[0.3em] uppercase mb-8">System Provenance</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                      {[
                        { label: 'Intelligence ID', val: `#PRJ-${project.id}` },
                        { label: 'Origin Date', val: new Date(project.created_at).toLocaleString() },
                        { label: 'Last Modification', val: project.updated_at ? new Date(project.updated_at).toLocaleString() : 'N/A' },
                        { label: 'Source Integrity', val: 'Verified // MariaDB CLUSTER' },
                        { label: 'Squad Association', val: project.team_id ? `T-${project.team_id}` : 'SOLO COMMAND' },
                        { label: 'Cryptographic Hash', val: '8f92-a1b4-c6d8-e5f2-9a0c' }
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{item.label}</span>
                          <span className="text-sm font-black text-white/80 tracking-tight">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Intelligence Footer */}
        <div className="p-6 lg:px-10 lg:py-6 border-t border-white/5 bg-[#0D0F14] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-white/20">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0D0F14] bg-white/5 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-current" />
                </div>
              ))}
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase italic">Secure Briefing Mode Active</span>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
             <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-10 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/60 text-[10px] font-black tracking-[0.2em] uppercase transition-all"
            >
              Terminate Session
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none px-10 py-3.5 bg-[#00E5FF] text-black rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)]"
            >
              Export Intel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
