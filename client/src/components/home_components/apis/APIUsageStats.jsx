const APIUsageStats = ({ stats }) => {
  const statItems = [
    { 
      label: 'Total API Calls', 
      value: stats.totalCalls, 
      icon: (
        <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-white'
    },
    { 
      label: 'Active Keys', 
      value: stats.activeKeys, 
      icon: (
        <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
      color: 'text-white'
    },
    { 
      label: 'Error Rate', 
      value: stats.errorRate, 
      icon: (
        <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 01-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-red-500/60'
    },
    { 
      label: 'Avg Latency', 
      value: stats.avgLatency, 
      icon: (
        <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 01-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-white'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
      {statItems.map((item, idx) => (
        <div
          key={idx}
          className="rounded-[32px] border border-white/5 bg-white/[0.02] p-8 group hover:bg-white/[0.04] transition-all duration-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
                {item.label}
              </div>
              <div className={`text-2xl md:text-3xl font-black ${item.color} tracking-tight group-hover:scale-105 transition-transform origin-left`}>
                {item.value}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl border border-white/5 flex items-center justify-center bg-white/5 shadow-inner group-hover:border-[#00E5FF]/40 transition-colors duration-500">
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default APIUsageStats;