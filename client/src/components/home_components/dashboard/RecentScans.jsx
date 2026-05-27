import { useState, useEffect } from 'react';

const RecentScans = ({ scans = [], selectedProjectId, isLoading }) => {
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
    if (score >= 25) return "text-[#00E5FF]";
    return "text-[#22d3ee]";
  };

  const getRiskBgColor = (score) => {
    if (score >= 75) return "bg-[#f87171]";
    if (score >= 50) return "bg-[#fbbf24]";
    if (score >= 25) return "bg-[#00E5FF]";
    return "bg-[#22d3ee]";
  };

  const getTypeIcon = (type) => {
    const color = '#00E5FF';
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

  const cardShell = 'bg-black rounded-2xl p-5 flex flex-col h-full relative border border-white/[0.07]';

  const RecentScanSkeleton = () => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 bg-white/5 rounded-xl border border-white/10" />
        <div className="min-w-0 flex-1">
          <div className="h-3 bg-white/10 rounded w-3/4 mb-1.5" />
          <div className="h-2 bg-white/5 rounded w-1/2" />
        </div>
      </div>
      <div className="w-12 h-6 bg-white/5 rounded-lg ml-4" />
    </div>
  );

  if (isLoading) {
    return (
      <div className={cardShell}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-semibold text-[#00E5FF]/80 tracking-[0.18em] uppercase">Activity</p>
            <div className="h-5 w-40 bg-white/10 rounded mt-1 animate-pulse" />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {[1, 2, 3, 4].map(i => <RecentScanSkeleton key={i} />)}
        </div>
        <div className="h-9 w-full bg-white/5 rounded-xl mt-4 animate-pulse" />
      </div>
    );
  }

  if (!selectedProjectId) {
    return (
      <div className={cardShell}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-semibold text-[#00E5FF]/80 tracking-[0.18em] uppercase">Activity</p>
            <h4 className="font-sans text-sm font-semibold text-white mt-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent investigations
            </h4>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[200px] rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="w-12 h-12 mb-3 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#00E5FF]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-white/50 text-sm font-medium">No project selected</p>
          <p className="text-white/35 text-xs mt-1 max-w-[220px]">Choose a project to see recent scans.</p>
        </div>
        
        <button className="w-full mt-4 p-2.5 rounded-xl border border-white/[0.08] text-white/35 text-xs font-medium cursor-not-allowed" disabled>
          View all
        </button>
      </div>
    );
  }

  // Check if no scans exist for selected project
  if (recentScans.length === 0) {
    return (
      <div className={cardShell}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-semibold text-[#00E5FF]/80 tracking-[0.18em] uppercase">Activity</p>
            <h4 className="font-sans text-sm font-semibold text-white mt-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent investigations
            </h4>
          </div>
          <button type="button" onClick={handleRefresh} className="text-white/40 hover:text-[#00E5FF] transition-colors p-1 rounded-lg hover:bg-white/[0.05]" aria-label="Refresh">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[200px] rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="w-12 h-12 mb-3 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#00E5FF]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-white/50 text-sm font-medium">No investigations yet</p>
          <p className="text-white/35 text-xs mt-1">Run a scan to see results here.</p>
        </div>
        
        <button type="button" className="w-full mt-4 p-2.5 rounded-xl border border-white/[0.12] text-white/70 hover:text-[#00E5FF] hover:border-[#00E5FF]/35 hover:bg-[#00E5FF]/5 text-xs font-medium transition-all">
          View all
        </button>
      </div>
    );
  }

  return (
    <div className={cardShell}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold text-[#00E5FF]/80 tracking-[0.18em] uppercase">Activity</p>
          <h4 className="font-sans text-sm font-semibold text-white mt-1 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent investigations
          </h4>
        </div>
        <button type="button" onClick={handleRefresh} className="text-white/40 hover:text-[#00E5FF] transition-colors p-1 rounded-lg hover:bg-white/[0.05]" aria-label="Refresh">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {recentScans.map((scan) => (
          <div key={scan.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#00E5FF]/25 hover:bg-[#00E5FF]/5 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 border border-white/10 ${getRiskBgColor(scan.risk)}/15 rounded-xl flex items-center justify-center flex-shrink-0`}>
                {getTypeIcon(scan.type)}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{scan.target}</p>
                <p className="text-white/40 text-[11px] mt-0.5">{scan.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`px-2 py-1 rounded-lg text-[11px] font-semibold tabular-nums border border-white/10 ${getRiskColor(scan.risk)}`}>
                {scan.risk}%
              </div>
              <svg className="w-4 h-4 text-white/25 group-hover:text-[#00E5FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 229, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 229, 255, 0.4);
        }
      `}</style>
      
      <button type="button" className="w-full mt-4 p-2.5 rounded-xl border border-white/[0.12] text-white/70 hover:text-[#00E5FF] hover:border-[#00E5FF]/35 hover:bg-[#00E5FF]/5 text-xs font-medium transition-all">
        View all investigations
      </button>
    </div>
  );
};

export default RecentScans;