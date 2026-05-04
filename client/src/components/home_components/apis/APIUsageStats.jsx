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
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-red-500'
    },
    { 
      label: 'Avg Latency', 
      value: stats.avgLatency, 
      icon: (
        <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-white'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-['Poppins']">
      {statItems.map((item, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 transition-colors duration-150"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/40 text-[11px] font-['Poppins'] font-semibold mb-1">
                {item.label}
              </div>
              <div className={`text-2xl md:text-3xl font-bold font-['Poppins'] ${item.color}`}>
                {item.value}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg border border-[#00E5FF]/30 flex items-center justify-center bg-[#00E5FF]/5">
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default APIUsageStats;