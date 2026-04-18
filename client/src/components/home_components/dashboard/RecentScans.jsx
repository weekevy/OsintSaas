import { useState, useEffect } from 'react';

const RecentScans = ({ scans = [], selectedProjectId }) => {
  const [recentScans, setRecentScans] = useState([]);

  // Use scans from props
  useEffect(() => {
    if (scans && scans.length > 0) {
      setRecentScans(scans);
    } else {
      setRecentScans([]);
    }
  }, [scans, selectedProjectId]);

  const getRiskColor = (score) => {
    if (score >= 75) return "text-[#f87171]";
    if (score >= 50) return "text-[#fbbf24]";
    if (score >= 25) return "text-[#00ff88]";
    return "text-[#22d3ee]";
  };

  const getRiskBgColor = (score) => {
    if (score >= 75) return "bg-[#f87171]";
    if (score >= 50) return "bg-[#fbbf24]";
    if (score >= 25) return "bg-[#00ff88]";
    return "bg-[#22d3ee]";
  };

  const getTypeIcon = (type) => {
    const color = '#00ff88';
    switch(type) {
      case "url": return (
        <svg className="w-3.5 h-3.5" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
      case "email": return (
        <svg className="w-3.5 h-3.5" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
      case "file": return (
        <svg className="w-3.5 h-3.5" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
      default: return (
        <svg className="w-3.5 h-3.5" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    }
  };

  const handleRefresh = () => {
    console.log('Refresh scans');
  };

  // Check if no project is selected
  if (!selectedProjectId) {
    return (
      <div className="bg-[#090c0e] border-2 border-[#00ff88]/40 rounded-2xl p-5 flex flex-col h-full relative shadow-lg shadow-[#00ff88]/5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-mono text-[11px] font-bold text-white uppercase tracking-[0.08em] flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            RECENT INVESTIGATIONS
          </h4>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[200px]">
          <div className="w-12 h-12 mb-3 border-2 border-[#00ff88]/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-[#00ff88]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.08em]">NO PROJECT SELECTED</p>
          <p className="text-white/20 text-[8px] font-mono uppercase tracking-[0.08em] mt-1">SELECT A PROJECT TO VIEW SCANS</p>
        </div>
        
        <button className="w-full mt-4 p-2 border-2 border-[#00ff88]/20 rounded-xl text-white/30 text-[9px] font-mono uppercase tracking-[0.08em] cursor-not-allowed" disabled>
          VIEW ALL
        </button>
      </div>
    );
  }

  // Check if no scans exist for selected project
  if (recentScans.length === 0) {
    return (
      <div className="bg-[#090c0e] border-2 border-[#00ff88]/40 rounded-2xl p-5 flex flex-col h-full relative shadow-lg shadow-[#00ff88]/5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-mono text-[11px] font-bold text-white uppercase tracking-[0.08em] flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            RECENT INVESTIGATIONS
          </h4>
          <button onClick={handleRefresh} className="text-white/40 hover:text-[#00ff88] transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[200px]">
          <div className="w-12 h-12 mb-3 border-2 border-[#00ff88]/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-[#00ff88]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.08em]">NO INVESTIGATIONS</p>
          <p className="text-white/20 text-[8px] font-mono uppercase tracking-[0.08em] mt-1">RUN A SCAN TO SEE RESULTS</p>
        </div>
        
        <button className="w-full mt-4 p-2 border-2 border-[#00ff88]/30 rounded-xl text-white/40 hover:text-[#00ff88] hover:border-[#00ff88] hover:bg-[#00ff88]/5 text-[9px] font-mono uppercase tracking-[0.08em] transition-all">
          VIEW ALL
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#090c0e] border-2 border-[#00ff88]/40 rounded-2xl p-5 flex flex-col h-full relative shadow-lg shadow-[#00ff88]/5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-mono text-[11px] font-bold text-white uppercase tracking-[0.08em] flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          RECENT INVESTIGATIONS
        </h4>
        <button onClick={handleRefresh} className="text-white/40 hover:text-[#00ff88] transition-colors">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 space-y-2">
        {recentScans.map((scan) => (
          <div key={scan.id} className="flex items-center justify-between p-3 border-2 border-[#00ff88]/20 rounded-xl hover:border-[#00ff88]/50 hover:bg-[#00ff88]/5 transition-all cursor-pointer group">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 border-2 ${getRiskBgColor(scan.risk)}/20 rounded-lg flex items-center justify-center flex-shrink-0`}>
                {getTypeIcon(scan.type)}
              </div>
              <div className="min-w-0">
                <p className="text-white text-[10px] font-mono truncate">{scan.target}</p>
                <p className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">{scan.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`px-2 py-1 border-2 border-current rounded-lg text-[8px] font-mono font-bold ${getRiskColor(scan.risk)}`}>
                {scan.risk}%
              </div>
              <svg className="w-3 h-3 text-white/30 group-hover:text-[#00ff88] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 p-2 border-2 border-[#00ff88]/30 rounded-xl text-white/40 hover:text-[#00ff88] hover:border-[#00ff88] hover:bg-[#00ff88]/5 text-[9px] font-mono uppercase tracking-[0.08em] transition-all">
        VIEW ALL INVESTIGATIONS
      </button>
    </div>
  );
};

export default RecentScans;