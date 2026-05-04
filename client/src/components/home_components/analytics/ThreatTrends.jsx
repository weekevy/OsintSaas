import { useState } from 'react';

const ThreatTrends = ({ timeRange, detailed = false }) => {
  const [chartType, setChartType] = useState('line');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const threatData = {
    labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    critical: [45, 52, 48, 71, 65, 58, 62, 68, 72, 78, 82, 85],
    high: [82, 78, 85, 91, 88, 84, 89, 92, 95, 98, 102, 108],
    medium: [124, 118, 132, 128, 135, 142, 138, 145, 152, 158, 162, 168],
    low: [210, 198, 215, 208, 222, 235, 228, 242, 255, 248, 262, 275]
  };

  const threatTypes = [
    { name: 'Phishing', count: 2345, change: '+12%', color: '#f87171', icon: 'phishing' },
    { name: 'Malware', count: 1876, change: '-5%', color: '#f97316', icon: 'malware' },
    { name: 'Ransomware', count: 892, change: '+23%', color: '#fbbf24', icon: 'ransomware' },
    { name: 'Social Engineering', count: 654, change: '-8%', color: '#22d3ee', icon: 'social' },
    { name: 'DDoS', count: 432, change: '-15%', color: '#34d399', icon: 'ddos' },
    { name: 'Zero-Day', count: 123, change: '+45%', color: '#00E5FF', icon: 'zero' }
  ];

  const getThreatIcon = (type) => {
    const className = "w-5 h-5";
    switch(type) {
      case 'phishing':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'malware':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
      case 'ransomware':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;
      case 'social':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
      case 'ddos':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      default:
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    }
  };

  const periods = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '12m', label: '12 Months' }
  ];

  if (!detailed) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-['Poppins'] text-xs font-bold">Threat Trends</h3>
          <select className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/60 text-[9px] font-['Poppins']">
            {periods.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Mini Chart */}
        <div className="relative h-16 mb-3">
          <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
            <path 
              d="M 0,50 Q 50,40 100,35 T 200,30 T 300,25" 
              stroke="#00E5FF" 
              strokeWidth="2" 
              fill="none" 
            />
            <path 
              d="M 0,50 Q 50,40 100,35 T 200,30 T 300,25 L 300,60 L 0,60 Z" 
              fill="url(#gradient)" 
              opacity="0.1"
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
            <div className="text-white/40 text-[8px] font-['Poppins'] font-semibold">Critical</div>
            <div className="text-[#f87171] text-lg font-bold font-['Poppins']">85</div>
            <div className="text-[#2DD4BF] text-[7px] font-['Poppins'] font-semibold">+12%</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
            <div className="text-white/40 text-[8px] font-['Poppins'] font-semibold">High</div>
            <div className="text-[#f97316] text-lg font-bold font-['Poppins']">108</div>
            <div className="text-[#2DD4BF] text-[7px] font-['Poppins'] font-semibold">+8%</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
            <div className="text-white/40 text-[8px] font-['Poppins'] font-semibold">Medium</div>
            <div className="text-[#fbbf24] text-lg font-bold font-['Poppins']">168</div>
            <div className="text-[#f87171] text-[7px] font-['Poppins'] font-semibold">-3%</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-['Poppins']">
      {/* Chart Controls */}
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-white font-['Poppins'] text-sm font-bold">Threat Intelligence Trends</h3>
            <p className="text-white/30 text-[10px] mt-0.5">Analysis of threat patterns over time</p>
          </div>
          <div className="flex gap-1">
            {['Line', 'Bar', 'Area'].map((type) => (
              <button 
                key={type} 
                onClick={() => setChartType(type.toLowerCase())} 
                className={`px-3 py-1 rounded-lg text-[9px] font-['Poppins'] font-semibold transition-colors duration-150 ${chartType === type.toLowerCase() ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30' : 'text-white/40 hover:text-white'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Chart */}
        <div className="relative h-48 mb-4">
          <svg className="w-full h-full" viewBox="0 0 800 160" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="30" y1={20 + i * 30} x2="770" y2={20 + i * 30} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}

            {/* Critical threats line */}
            <path 
              d={`M 35,${140 - threatData.critical[0]} ` + threatData.critical.slice(0, 8).map((value, i) => `L ${35 + i * 90},${140 - value}`).join(' ')} 
              stroke="#f87171" 
              strokeWidth="2" 
              fill="none" 
            />
            {/* High threats line */}
            <path 
              d={`M 35,${140 - threatData.high[0]} ` + threatData.high.slice(0, 8).map((value, i) => `L ${35 + i * 90},${140 - value}`).join(' ')} 
              stroke="#f97316" 
              strokeWidth="2" 
              fill="none" 
            />
            {/* Medium threats line */}
            <path 
              d={`M 35,${140 - threatData.medium[0]} ` + threatData.medium.slice(0, 8).map((value, i) => `L ${35 + i * 90},${140 - value}`).join(' ')} 
              stroke="#fbbf24" 
              strokeWidth="2" 
              fill="none" 
            />

            {/* X-axis labels */}
            {threatData.labels.slice(0, 8).map((label, i) => (
              <text key={i} x={35 + i * 90} y="155" textAnchor="middle" className="text-[8px] fill-white/30 font-['Poppins']">{label}</text>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#f87171]" />
            <span className="text-white/50 text-[9px] font-['Poppins']">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#f97316]" />
            <span className="text-white/50 text-[9px] font-['Poppins']">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#fbbf24]" />
            <span className="text-white/50 text-[9px] font-['Poppins']">Medium</span>
          </div>
        </div>
      </div>

      {/* Threat Type Breakdown */}
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5">
        <h3 className="text-white font-['Poppins'] text-sm font-bold mb-4">Threat Type Breakdown</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {threatTypes.map((threat, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
              <div className="w-9 h-9 rounded-lg border border-[#00E5FF]/30 bg-[#00E5FF]/10 flex items-center justify-center">
                {getThreatIcon(threat.icon)}
              </div>
              <div className="flex-1">
                <div className="text-white text-[10px] font-['Poppins'] font-semibold">{threat.name}</div>
                <div className="text-lg font-bold font-['Poppins']" style={{ color: threat.color }}>{threat.count.toLocaleString()}</div>
              </div>
              <div className={`text-[11px] font-['Poppins'] font-semibold ${threat.change.startsWith('+') ? 'text-[#f87171]' : 'text-[#2DD4BF]'}`}>
                {threat.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top IOCs */}
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5">
        <h3 className="text-white font-['Poppins'] text-sm font-bold mb-4">Top Indicators of Compromise</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-white/40 font-['Poppins'] font-semibold">IOC</th>
                <th className="text-left py-2 px-3 text-white/40 font-['Poppins'] font-semibold">Type</th>
                <th className="text-left py-2 px-3 text-white/40 font-['Poppins'] font-semibold">Level</th>
                <th className="text-left py-2 px-3 text-white/40 font-['Poppins'] font-semibold hidden md:table-cell">First Seen</th>
                <th className="text-left py-2 px-3 text-white/40 font-['Poppins'] font-semibold hidden md:table-cell">Last Seen</th>
                <th className="text-left py-2 px-3 text-white/40 font-['Poppins'] font-semibold">Count</th>
              </tr>
            </thead>
            <tbody>
              {[
                { ioc: 'suspicious-domain.com', type: 'Domain', level: 'Critical', first: '2024-03-01', last: '2024-03-19', count: 345, levelColor: '#f87171' },
                { ioc: '185.234.56.78', type: 'IP', level: 'High', first: '2024-03-15', last: '2024-03-19', count: 234, levelColor: '#f97316' },
                { ioc: 'malware.exe', type: 'File', level: 'High', first: '2024-03-10', last: '2024-03-18', count: 189, levelColor: '#f97316' },
                { ioc: 'scam@phishing.com', type: 'Email', level: 'Medium', first: '2024-03-05', last: '2024-03-19', count: 156, levelColor: '#fbbf24' },
              ].map((ioc, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150">
                  <td className="py-2 px-3"><code className="text-[#00E5FF] text-[9px] font-mono">{ioc.ioc}</code></td>
                  <td className="py-2 px-3 text-white/60 text-[9px]">{ioc.type}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-['Poppins'] font-semibold" style={{ color: ioc.levelColor, backgroundColor: `${ioc.levelColor}10`, border: `1px solid ${ioc.levelColor}30` }}>
                      {ioc.level}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-white/40 text-[9px] hidden md:table-cell">{ioc.first}</td>
                  <td className="py-2 px-3 text-white/40 text-[9px] hidden md:table-cell">{ioc.last}</td>
                  <td className="py-2 px-3 text-white font-['Poppins'] font-bold text-[11px]">{ioc.count}</td>
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