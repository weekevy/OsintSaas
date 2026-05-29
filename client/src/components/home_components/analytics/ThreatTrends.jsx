import { useState } from 'react';

const ThreatTrends = ({ trends = [], threatTypes = [], topIOCs = [], detailed = false }) => {
  const [chartType, setChartType] = useState('line');

  const getThreatIcon = (type) => {
    const className = "w-5 h-5";
    // Map existing icons to module names or generic icons
    return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
  };

  // Process trends for visualization
  const labels = trends.map(t => t.date.split('-').slice(1).join('/')); // MM/DD
  const critical = trends.map(t => t.critical);
  const high = trends.map(t => t.high);
  const medium = trends.map(t => t.medium);

  const getLevelColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'critical': return '#f87171';
      case 'high': return '#f97316';
      case 'medium': return '#fbbf24';
      default: return '#2DD4BF';
    }
  };

  if (!detailed) {
    return (
      <div className="rounded-xl border border-white/10 bg-black p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-sans text-xs font-bold">Threat Trends</h3>
          <span className="text-white/40 text-[9px] uppercase tracking-widest font-black">Live Data</span>
        </div>

        {/* Mini Chart */}
        <div className="relative h-16 mb-3">
          {trends.length > 1 ? (
            <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
              <path 
                d={`M 0,${60 - (trends[0]?.critical + trends[0]?.high) * 2} ` + trends.map((t, i) => `L ${(i * 300) / (trends.length - 1)},${60 - (t.critical + t.high) * 2}`).join(' ')} 
                stroke="#00E5FF" 
                strokeWidth="2" 
                fill="none" 
              />
            </svg>
          ) : (
            <div className="h-full flex items-center justify-center text-[10px] text-white/20 uppercase tracking-widest font-black">
              Insufficent Data Points
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
            <div className="text-white/40 text-[8px] font-sans font-semibold">Critical</div>
            <div className="text-[#f87171] text-lg font-bold font-sans">{trends.reduce((a, b) => a + b.critical, 0)}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
            <div className="text-white/40 text-[8px] font-sans font-semibold">High</div>
            <div className="text-[#f97316] text-lg font-bold font-sans">{trends.reduce((a, b) => a + b.high, 0)}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
            <div className="text-white/40 text-[8px] font-sans font-semibold">Medium</div>
            <div className="text-[#fbbf24] text-lg font-bold font-sans">{trends.reduce((a, b) => a + b.medium, 0)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans">
      {/* Chart Controls */}
      <div className="rounded-xl border border-white/10 bg-black p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-white font-sans text-sm font-bold">Threat Intelligence Trends</h3>
            <p className="text-white/30 text-[10px] mt-0.5">Analysis of threat patterns over time</p>
          </div>
          <div className="flex gap-1">
            {['Line', 'Bar', 'Area'].map((type) => (
              <button 
                key={type} 
                onClick={() => setChartType(type.toLowerCase())} 
                className={`px-3 py-1 rounded-lg text-[9px] font-sans font-semibold transition-colors duration-150 ${chartType === type.toLowerCase() ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30' : 'text-white/40 hover:text-white'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Chart */}
        <div className="relative h-48 mb-4">
          {trends.length > 0 ? (
            <svg className="w-full h-full" viewBox="0 0 800 160" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1="30" y1={20 + i * 30} x2="770" y2={20 + i * 30} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              ))}

              {/* Critical threats line */}
              <path 
                d={`M 35,${140 - (critical[0] || 0) * 10} ` + critical.map((value, i) => `L ${35 + i * (700 / (trends.length || 1))},${140 - value * 10}`).join(' ')} 
                stroke="#f87171" 
                strokeWidth="2" 
                fill="none" 
              />
              {/* High threats line */}
              <path 
                d={`M 35,${140 - (high[0] || 0) * 10} ` + high.map((value, i) => `L ${35 + i * (700 / (trends.length || 1))},${140 - value * 10}`).join(' ')} 
                stroke="#f97316" 
                strokeWidth="2" 
                fill="none" 
              />
              {/* Medium threats line */}
              <path 
                d={`M 35,${140 - (medium[0] || 0) * 10} ` + medium.map((value, i) => `L ${35 + i * (700 / (trends.length || 1))},${140 - value * 10}`).join(' ')} 
                stroke="#fbbf24" 
                strokeWidth="2" 
                fill="none" 
              />

              {/* X-axis labels */}
              {labels.map((label, i) => (
                <text key={i} x={35 + i * (700 / (trends.length || 1))} y="155" textAnchor="middle" className="text-[8px] fill-white/30 font-sans">{label}</text>
              ))}
            </svg>
          ) : (
            <div className="h-full flex items-center justify-center text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">
              Intelligence Stream Empty
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#f87171]" />
            <span className="text-white/50 text-[9px] font-sans">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#f97316]" />
            <span className="text-white/50 text-[9px] font-sans">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#fbbf24]" />
            <span className="text-white/50 text-[9px] font-sans">Medium</span>
          </div>
        </div>
      </div>

      {/* Threat Type Breakdown */}
      <div className="rounded-xl border border-white/10 bg-black p-5">
        <h3 className="text-white font-sans text-sm font-bold mb-4">Threat Type Breakdown</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {threatTypes.length > 0 ? threatTypes.map((threat, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
              <div className="w-9 h-9 rounded-lg border border-[#00E5FF]/30 bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF]">
                {getThreatIcon(threat.name)}
              </div>
              <div className="flex-1">
                <div className="text-white text-[10px] font-sans font-semibold truncate max-w-[120px]">{threat.name}</div>
                <div className="text-lg font-bold font-sans" style={{ color: getLevelColor(threat.severity) }}>{threat.count.toLocaleString()}</div>
              </div>
              <div className="text-[11px] font-sans font-semibold text-[#2DD4BF]">
                {threat.change}
              </div>
            </div>
          )) : (
            <div className="col-span-full py-8 text-center text-[10px] text-white/20 uppercase tracking-widest font-black">
              No Threat Classifications Yet
            </div>
          )}
        </div>
      </div>

      {/* Top IOCs */}
      <div className="rounded-xl border border-white/10 bg-black p-5">
        <h3 className="text-white font-sans text-sm font-bold mb-4">Top Indicators of Compromise</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-white/40 font-sans font-semibold">IOC</th>
                <th className="text-left py-2 px-3 text-white/40 font-sans font-semibold">Type</th>
                <th className="text-left py-2 px-3 text-white/40 font-sans font-semibold">Level</th>
                <th className="text-left py-2 px-3 text-white/40 font-sans font-semibold hidden md:table-cell">First Seen</th>
                <th className="text-left py-2 px-3 text-white/40 font-sans font-semibold hidden md:table-cell">Last Seen</th>
                <th className="text-left py-2 px-3 text-white/40 font-sans font-semibold">Count</th>
              </tr>
            </thead>
            <tbody>
              {topIOCs.length > 0 ? topIOCs.map((ioc, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150">
                  <td className="py-2 px-3"><code className="text-[#00E5FF] text-[9px] font-mono">{ioc.ioc}</code></td>
                  <td className="py-2 px-3 text-white/60 text-[9px]">{ioc.type}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-sans font-semibold uppercase" style={{ color: getLevelColor(ioc.level), backgroundColor: `${getLevelColor(ioc.level)}10`, border: `1px solid ${getLevelColor(ioc.level)}30` }}>
                      {ioc.level}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-white/40 text-[9px] hidden md:table-cell">{new Date(ioc.first_seen).toLocaleDateString()}</td>
                  <td className="py-2 px-3 text-white/40 text-[9px] hidden md:table-cell">{new Date(ioc.last_seen).toLocaleDateString()}</td>
                  <td className="py-2 px-3 text-white font-sans font-bold text-[11px]">{ioc.count}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[10px] text-white/20 uppercase tracking-widest font-black">
                    No Indicators Identified
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ThreatTrends;