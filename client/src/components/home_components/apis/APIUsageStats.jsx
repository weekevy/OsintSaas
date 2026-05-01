const APIUsageStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-sans">
      {/* Total API Calls */}
      <div className="glass-card border border-white/10 p-4 relative group hover:border-[#00E5FF]/30 transition-all">
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00E5FF]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/30 text-[7px] font-sans uppercase tracking-[0.12em] mb-1">TOTAL API CALLS</div>
            <div className="text-2xl font-bold text-white font-mono">{stats.totalCalls}</div>
          </div>
          <div className="w-8 h-8 border border-[#00E5FF]/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Active Keys */}
      <div className="glass-card border border-white/10 p-4 relative group hover:border-[#00E5FF]/30 transition-all">
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00E5FF]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/30 text-[7px] font-sans uppercase tracking-[0.12em] mb-1">ACTIVE KEYS</div>
            <div className="text-2xl font-bold text-white font-mono">{stats.activeKeys}</div>
          </div>
          <div className="w-8 h-8 border border-[#00E5FF]/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Error Rate */}
      <div className="glass-card border border-white/10 p-4 relative group hover:border-[#00E5FF]/30 transition-all">
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00E5FF]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/30 text-[7px] font-sans uppercase tracking-[0.12em] mb-1">ERROR RATE</div>
            <div className="text-2xl font-bold text-red-500 font-mono">{stats.errorRate}</div>
          </div>
          <div className="w-8 h-8 border border-[#00E5FF]/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Avg Latency */}
      <div className="glass-card border border-white/10 p-4 relative group hover:border-[#00E5FF]/30 transition-all">
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00E5FF]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/30 text-[7px] font-sans uppercase tracking-[0.12em] mb-1">AVG LATENCY</div>
            <div className="text-2xl font-bold text-white font-mono">{stats.avgLatency}</div>
          </div>
          <div className="w-8 h-8 border border-[#00E5FF]/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIUsageStats;