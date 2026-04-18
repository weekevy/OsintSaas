const UserActivity = ({ timeRange, detailed = false }) => {
  const activityData = {
    daily: [45, 52, 48, 71, 65, 58, 62, 68, 72, 78, 82, 85, 88, 92, 95, 98, 102, 108, 112, 118, 124, 128, 132, 138],
    hourly: [12, 8, 5, 3, 2, 4, 8, 15, 25, 35, 42, 48, 52, 55, 58, 62, 65, 68, 72, 75, 78, 72, 58, 42]
  };

  const topUsers = [
    { name: 'JOHN DOE', scans: 1245, threats: 89, accuracy: '98%' },
    { name: 'JANE SMITH', scans: 1098, threats: 76, accuracy: '96%' },
    { name: 'MIKE JOHNSON', scans: 876, threats: 54, accuracy: '95%' },
    { name: 'SARAH WILLIAMS', scans: 765, threats: 48, accuracy: '97%' },
    { name: 'ALEX BROWN', scans: 654, threats: 41, accuracy: '94%' }
  ];

  if (!detailed) {
    return (
      <div className="bg-[#090c0e] border border-white/10 p-5 relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
        
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em]">USER ACTIVITY</h3>
          <span className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">LAST 7 DAYS</span>
        </div>

        {/* Activity Heatmap Mini */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {activityData.daily.slice(0, 7).map((value, i) => (
            <div key={i} className="text-center">
              <div 
                className="h-10 bg-[#00ff88]"
                style={{ opacity: value / 150 }}
              />
              <div className="text-white/30 text-[7px] font-mono mt-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center bg-[#0d1114] border border-white/10 p-2">
            <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">ACTIVE USERS</div>
            <div className="text-xl font-bold text-white font-mono">156</div>
            <div className="text-[#34d399] text-[7px] font-mono">+12%</div>
          </div>
          <div className="text-center bg-[#0d1114] border border-white/10 p-2">
            <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">AVG SESSION</div>
            <div className="text-xl font-bold text-white font-mono">24M</div>
            <div className="text-[#34d399] text-[7px] font-mono">+8%</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Activity Overview */}
      <div className="bg-[#090c0e] border border-white/10 p-5 relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-mono text-[11px] font-bold uppercase tracking-[0.12em]">USER ACTIVITY ANALYSIS</h3>
            <p className="text-white/30 text-[8px] font-mono uppercase tracking-[0.08em] mt-0.5">DETAILED USER ENGAGEMENT METRICS</p>
          </div>
          <div className="flex gap-1">
            {['DAILY', 'WEEKLY', 'MONTHLY'].map((period) => (
              <button key={period} className="px-2 py-1 border border-white/10 text-white/40 hover:text-white text-[7px] font-mono uppercase tracking-[0.08em] transition-all">
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="relative h-40 mb-4">
          <svg className="w-full h-full" viewBox="0 0 800 160">
            {/* Grid */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="30" y1={20 + i * 30} x2="770" y2={20 + i * 30} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
            ))}

            {/* Activity bars */}
            {activityData.daily.slice(0, 24).map((value, i) => (
              <rect key={i} x={35 + i * 30} y={140 - value * 0.8} width="18" height={value * 0.8} fill="#00ff88" opacity={value / 150} />
            ))}

            {/* X-axis labels */}
            {[0, 6, 12, 18, 23].map((i) => (
              <text key={i} x={35 + i * 30} y="155" textAnchor="middle" className="text-[6px] fill-white/30 font-mono">{i}:00</text>
            ))}
          </svg>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3">
          <div className="bg-[#0d1114] border border-white/10 p-2 text-center">
            <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">DAILY ACTIVE USERS</div>
            <div className="text-lg font-bold text-white font-mono">1,245</div>
            <div className="text-[#34d399] text-[7px] font-mono">+18%</div>
          </div>
          <div className="bg-[#0d1114] border border-white/10 p-2 text-center">
            <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">AVG SESSION DURATION</div>
            <div className="text-lg font-bold text-white font-mono">24M 36S</div>
            <div className="text-[#34d399] text-[7px] font-mono">+12%</div>
          </div>
          <div className="bg-[#0d1114] border border-white/10 p-2 text-center">
            <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">TOTAL SEARCHES</div>
            <div className="text-lg font-bold text-white font-mono">8,942</div>
            <div className="text-[#34d399] text-[7px] font-mono">+23%</div>
          </div>
          <div className="bg-[#0d1114] border border-white/10 p-2 text-center">
            <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">REPORTS GENERATED</div>
            <div className="text-lg font-bold text-white font-mono">345</div>
            <div className="text-[#34d399] text-[7px] font-mono">+7%</div>
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-[#090c0e] border border-white/10 p-5 relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
        
        <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] mb-3">TOP INVESTIGATORS</h3>
        
        <div className="space-y-2">
          {topUsers.map((user, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[#0d1114] border border-white/10 hover:border-[#00ff88]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 border border-[#00ff88]/30 flex items-center justify-center">
                  <span className="text-white font-mono text-[9px] font-bold">{user.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <div className="text-white font-mono text-[8px] font-bold uppercase tracking-[0.08em]">{user.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/30 text-[6px] font-mono uppercase">{user.scans} SCANS</span>
                    <span className="text-white/30 text-[6px] font-mono uppercase">{user.threats} THREATS</span>
                    <span className="text-[#34d399] text-[6px] font-mono uppercase">{user.accuracy} ACCURACY</span>
                  </div>
                </div>
              </div>
              <div className="px-1.5 py-0.5 border border-[#00ff88]/30 text-[#00ff88] text-[6px] font-mono">#{i + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity by Hour Heatmap */}
      <div className="bg-[#090c0e] border border-white/10 p-5 relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
        
        <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] mb-3">ACTIVITY HEATMAP</h3>
        
        <div className="grid grid-cols-24 gap-0.5 mb-2">
          {activityData.hourly.map((value, i) => (
            <div key={i} className="text-center">
              <div className="h-12 bg-[#00ff88]" style={{ opacity: value / 80 }} />
              <div className="text-white/25 text-[5px] font-mono mt-0.5">{i}</div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#00ff88]/20" /><span className="text-white/30 text-[6px] font-mono uppercase">LOW</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#00ff88]/60" /><span className="text-white/30 text-[6px] font-mono uppercase">MEDIUM</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#00ff88]" /><span className="text-white/30 text-[6px] font-mono uppercase">HIGH</span></div>
        </div>
      </div>
    </div>
  );
};

export default UserActivity;