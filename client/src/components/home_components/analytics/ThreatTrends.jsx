import { useState } from 'react';

const ThreatTrends = ({ timeRange, detailed = false }) => {
  const [chartType, setChartType] = useState('line');

  const threatData = {
    labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    critical: [45, 52, 48, 71, 65, 58, 62, 68, 72, 78, 82, 85],
    high: [82, 78, 85, 91, 88, 84, 89, 92, 95, 98, 102, 108],
    medium: [124, 118, 132, 128, 135, 142, 138, 145, 152, 158, 162, 168],
    low: [210, 198, 215, 208, 222, 235, 228, 242, 255, 248, 262, 275]
  };

  const threatTypes = [
    { name: 'PHISHING', count: 2345, change: '+12%', color: 'text-[#f87171]' },
    { name: 'MALWARE', count: 1876, change: '-5%', color: 'text-[#f97316]' },
    { name: 'RANSOMWARE', count: 892, change: '+23%', color: 'text-[#fbbf24]' },
    { name: 'SOCIAL ENGINEERING', count: 654, change: '-8%', color: 'text-[#22d3ee]' },
    { name: 'DDOS', count: 432, change: '-15%', color: 'text-[#34d399]' },
    { name: 'ZERO-DAY', count: 123, change: '+45%', color: 'text-[#00ff88]' }
  ];

  if (!detailed) {
    return (
      <div className="bg-[#090c0e] border border-white/10 p-5 relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
        
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em]">THREAT TRENDS</h3>
          <select className="px-2 py-1 bg-[#0d1114] border border-white/10 text-white/60 text-[7px] font-mono uppercase">
            <option>LAST 30 DAYS</option>
            <option>LAST 90 DAYS</option>
            <option>LAST 12 MONTHS</option>
          </select>
        </div>

        {/* Mini Chart */}
        <div className="relative h-20 mb-3">
          <svg className="w-full h-full" viewBox="0 0 400 80">
            <path d="M 0,60 C 40,50 80,35 120,30 C 160,25 200,40 240,35 C 280,30 320,45 360,40 C 400,35" stroke="#00ff88" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center bg-[#0d1114] border border-white/10 p-2">
            <div className="text-white/40 text-[7px] font-mono uppercase">CRITICAL</div>
            <div className="text-[#f87171] text-base font-bold font-mono">85</div>
            <div className="text-white/30 text-[6px] font-mono">+12%</div>
          </div>
          <div className="text-center bg-[#0d1114] border border-white/10 p-2">
            <div className="text-white/40 text-[7px] font-mono uppercase">HIGH</div>
            <div className="text-[#f97316] text-base font-bold font-mono">108</div>
            <div className="text-white/30 text-[6px] font-mono">+8%</div>
          </div>
          <div className="text-center bg-[#0d1114] border border-white/10 p-2">
            <div className="text-white/40 text-[7px] font-mono uppercase">MEDIUM</div>
            <div className="text-[#fbbf24] text-base font-bold font-mono">168</div>
            <div className="text-white/30 text-[6px] font-mono">-3%</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Chart Controls */}
      <div className="bg-[#090c0e] border border-white/10 p-5 relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-mono text-[11px] font-bold uppercase tracking-[0.12em]">THREAT INTELLIGENCE TRENDS</h3>
            <p className="text-white/30 text-[8px] font-mono uppercase tracking-[0.08em] mt-0.5">ANALYSIS OF THREAT PATTERNS OVER TIME</p>
          </div>
          <div className="flex gap-1">
            {['LINE', 'BAR', 'AREA'].map((type) => (
              <button key={type} onClick={() => setChartType(type.toLowerCase())} className={`px-2 py-1 text-[7px] font-mono uppercase tracking-[0.08em] border transition-all ${chartType === type.toLowerCase() ? 'border-[#00ff88] text-[#00ff88]' : 'border-white/10 text-white/40 hover:text-white'}`}>
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Chart */}
        <div className="relative h-48 mb-4">
          <svg className="w-full h-full" viewBox="0 0 800 200">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="30" y1={30 + i * 35} x2="770" y2={30 + i * 35} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
            ))}

            {/* Critical threats line */}
            <path d={`M 35,${200 - threatData.critical[0]} ` + threatData.critical.map((value, i) => `L ${35 + i * 65},${200 - value}`).join(' ')} stroke="#f87171" strokeWidth="1.5" fill="none" />
            {/* High threats line */}
            <path d={`M 35,${200 - threatData.high[0]} ` + threatData.high.map((value, i) => `L ${35 + i * 65},${200 - value}`).join(' ')} stroke="#f97316" strokeWidth="1.5" fill="none" />
            {/* Medium threats line */}
            <path d={`M 35,${200 - threatData.medium[0]} ` + threatData.medium.map((value, i) => `L ${35 + i * 65},${200 - value}`).join(' ')} stroke="#fbbf24" strokeWidth="1.5" fill="none" />

            {/* X-axis labels */}
            {threatData.labels.map((label, i) => (
              <text key={i} x={35 + i * 65} y="190" textAnchor="middle" className="text-[6px] fill-white/30 font-mono">{label}</text>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#f87171]" /><span className="text-white/50 text-[7px] font-mono uppercase">CRITICAL</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#f97316]" /><span className="text-white/50 text-[7px] font-mono uppercase">HIGH</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#fbbf24]" /><span className="text-white/50 text-[7px] font-mono uppercase">MEDIUM</span></div>
        </div>
      </div>

      {/* Threat Type Breakdown */}
      <div className="bg-[#090c0e] border border-white/10 p-5 relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
        
        <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] mb-3">THREAT TYPE BREAKDOWN</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {threatTypes.map((threat, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[#0d1114] border border-white/10">
              <div>
                <div className="text-white font-mono text-[8px] font-bold uppercase tracking-[0.08em]">{threat.name}</div>
                <div className={`text-lg font-bold font-mono ${threat.color}`}>{threat.count}</div>
              </div>
              <div className={`text-[8px] font-mono ${threat.change.startsWith('+') ? 'text-[#f87171]' : 'text-[#34d399]'}`}>{threat.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top IOCs */}
      <div className="bg-[#090c0e] border border-white/10 p-5 relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
        
        <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] mb-3">TOP INDICATORS OF COMPROMISE</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-[7px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-2 text-white/30 font-mono uppercase">IOC</th>
                <th className="text-left py-2 px-2 text-white/30 font-mono uppercase">TYPE</th>
                <th className="text-left py-2 px-2 text-white/30 font-mono uppercase">LEVEL</th>
                <th className="text-left py-2 px-2 text-white/30 font-mono uppercase">FIRST SEEN</th>
                <th className="text-left py-2 px-2 text-white/30 font-mono uppercase">LAST SEEN</th>
                <th className="text-left py-2 px-2 text-white/30 font-mono uppercase">COUNT</th>
              </tr>
            </thead>
            <tbody>
              {[
                { ioc: 'suspicious-domain.com', type: 'DOMAIN', level: 'CRITICAL', first: '2024-03-01', last: '2024-03-19', count: 345 },
                { ioc: '185.234.56.78', type: 'IP', level: 'HIGH', first: '2024-03-15', last: '2024-03-19', count: 234 },
                { ioc: 'malware.exe', type: 'FILE', level: 'HIGH', first: '2024-03-10', last: '2024-03-18', count: 189 },
                { ioc: 'scam@phishing.com', type: 'EMAIL', level: 'MEDIUM', first: '2024-03-05', last: '2024-03-19', count: 156 },
              ].map((ioc, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-2"><code className="text-[#00ff88] text-[7px]">{ioc.ioc}</code></td>
                  <td className="py-2 px-2 text-white/50">{ioc.type}</td>
                  <td className="py-2 px-2"><span className={`px-1 py-0.5 text-[6px] font-mono border ${ioc.level === 'CRITICAL' ? 'border-[#f87171]/30 text-[#f87171]' : ioc.level === 'HIGH' ? 'border-[#f97316]/30 text-[#f97316]' : 'border-[#fbbf24]/30 text-[#fbbf24]'}`}>{ioc.level}</span></td>
                  <td className="py-2 px-2 text-white/40">{ioc.first}</td>
                  <td className="py-2 px-2 text-white/40">{ioc.last}</td>
                  <td className="py-2 px-2 text-white font-mono font-bold">{ioc.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ThreatTrends;