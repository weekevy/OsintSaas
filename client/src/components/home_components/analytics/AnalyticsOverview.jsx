const AnalyticsOverview = ({ timeRange }) => {
  const stats = [
    {
      label: 'Total Scans',
      value: '1,234,567',
      trend: '+12.3%',
      trendUp: true,
      icon: (
        <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'text-[#00E5FF]'
    },
    {
      label: 'Threats Detected',
      value: '89,234',
      trend: '-5.2%',
      trendUp: false,
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'text-red-500'
    },
    {
      label: 'Avg Response Time',
      value: '187ms',
      trend: '-8.1%',
      trendUp: true,
      icon: (
        <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-[#00E5FF]'
    },
    {
      label: 'Active Users',
      value: '3,456',
      trend: '+18.7%',
      trendUp: true,
      icon: (
        <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'text-[#00E5FF]'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-['Poppins']">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 transition-colors duration-150"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-white/40 text-[11px] font-['Poppins'] font-semibold">
              {stat.label}
            </div>
            <div className="w-9 h-9 rounded-lg border border-[#00E5FF]/30 flex items-center justify-center bg-[#00E5FF]/5">
              {stat.icon}
            </div>
          </div>
          
          <div className="text-2xl md:text-3xl font-bold font-['Poppins'] text-white mb-2">
            {stat.value}
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-xs font-['Poppins'] font-semibold ${stat.trendUp ? 'text-[#2DD4BF]' : 'text-red-500'}`}>
              {stat.trend}
            </span>
            <span className="text-white/30 text-[10px] font-['Poppins']">
              vs last period
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsOverview;