const AnalyticsOverview = ({ timeRange }) => {
  const stats = {
    totalScans: '1,234,567',
    threatsDetected: '89,234',
    avgResponseTime: '187ms',
    activeUsers: '3,456',
    scanTrend: '+12.3%',
    threatTrend: '-5.2%',
    responseTrend: '-8.1%',
    userTrend: '+18.7%'
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      <div className="glass-card border border-white/10 p-6 relative overflow-hidden group hover:border-[#00E5FF]/30 transition-all">
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00E5FF]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">TOTAL SCANS</div>
            <div className="text-2xl font-bold text-white font-mono">{stats.totalScans}</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[#00E5FF] text-[10px] font-bold">{stats.scanTrend}</span>
              <span className="text-white/20 text-[9px] uppercase tracking-wider">VS LAST PERIOD</span>
            </div>
          </div>
          <div className="w-10 h-10 border border-[#00E5FF]/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>

      <div className="glass-card border border-white/10 p-6 relative overflow-hidden group hover:border-red-500/30 transition-all">
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-red-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">THREATS DETECTED</div>
            <div className="text-2xl font-bold text-white font-mono">{stats.threatsDetected}</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-red-500 text-[10px] font-bold">{stats.threatTrend}</span>
              <span className="text-white/20 text-[9px] uppercase tracking-wider">VS LAST PERIOD</span>
            </div>
          </div>
          <div className="w-10 h-10 border border-red-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="glass-card border border-white/10 p-6 relative overflow-hidden group hover:border-[#00E5FF]/30 transition-all">
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00E5FF]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">AVG RESPONSE TIME</div>
            <div className="text-2xl font-bold text-white font-mono">{stats.avgResponseTime}</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[#00E5FF] text-[10px] font-bold">{stats.responseTrend}</span>
              <span className="text-white/20 text-[9px] uppercase tracking-wider">VS LAST PERIOD</span>
            </div>
          </div>
          <div className="w-10 h-10 border border-[#00E5FF]/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="glass-card border border-white/10 p-6 relative overflow-hidden group hover:border-[#00E5FF]/30 transition-all">
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00E5FF]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">ACTIVE USERS</div>
            <div className="text-2xl font-bold text-white font-mono">{stats.activeUsers}</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[#00E5FF] text-[10px] font-bold">{stats.userTrend}</span>
              <span className="text-white/20 text-[9px] uppercase tracking-wider">VS LAST PERIOD</span>
            </div>
          </div>
          <div className="w-10 h-10 border border-[#00E5FF]/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
