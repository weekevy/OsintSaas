import { useState, useEffect } from 'react';

const RiskCircle = ({
  riskData = null,
  projectName,
  projectTarget,
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!projectName || projectName === 'No Project Selected') {
      setDisplayScore(0);
      return;
    }

    if (riskData && Object.keys(riskData).length > 0) {
      let score = 0;
      if (typeof riskData === 'number') {
        score = riskData;
      } else if (riskData.risk_score !== undefined) {
        score = riskData.risk_score;
      } else if (riskData.score !== undefined) {
        score = riskData.score;
      } else if (riskData.risk_level) {
        const levelMap = { low: 15, medium: 45, high: 70, critical: 85 };
        score = levelMap[riskData.risk_level] || 15;
      }
      setDisplayScore(score);
    } else {
      setDisplayScore(0);
    }
  }, [riskData, projectName]);

  const getRiskConfig = (score) => {
    if (score >= 75) return {
      label: 'CRITICAL', 
      color: '#f87171', 
      border: 'rgba(248,113,113,0.4)', 
      bg: 'rgba(248,113,113,0.1)',
      glow: 'rgba(248,113,113,0.3)'
    };
    if (score >= 50) return {
      label: 'HIGH', 
      color: '#fbbf24', 
      border: 'rgba(251,191,36,0.4)', 
      bg: 'rgba(251,191,36,0.1)',
      glow: 'rgba(251,191,36,0.3)'
    };
    if (score >= 25) return {
      label: 'MEDIUM', 
      color: '#fb923c', 
      border: 'rgba(251,146,60,0.4)', 
      bg: 'rgba(251,146,60,0.1)',
      glow: 'rgba(251,146,60,0.3)'
    };
    return {
      label: 'OPTIMAL', 
      color: '#00E5FF', 
      border: 'rgba(0,229,255,0.4)', 
      bg: 'rgba(0,229,255,0.1)',
      glow: 'rgba(0,229,255,0.3)'
    };
  };

  const size = 254;
  const radius = 92;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  const cfg = getRiskConfig(displayScore);
  const isNoProject = !projectName || projectName === 'No Project Selected';
  const hasData = displayScore > 0 && !isNoProject;

  return (
    <div className="relative">
      {/* Main card */}
      <div className="relative rounded-3xl overflow-hidden font-['Poppins'] h-full min-h-[480px] flex flex-col border border-white/[0.09] shadow-xl shadow-black/40 ring-1 ring-white/[0.04]">
        {/* Glass background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0e12]/95 via-[#080a0d] to-[#050608] pointer-events-none max-md:backdrop-blur-none md:backdrop-blur-md" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/6 via-transparent to-[#2DD4BF]/5 pointer-events-none" />
        
        {/* Grid texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]" 
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #00E5FF 1px, transparent 0)', backgroundSize: '30px 30px' }} />

        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Header */}
          <div className="w-full flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Decorative line */}
              <div className="relative">
                <div className="w-[2px] h-8 rounded-full bg-gradient-to-b from-[#00E5FF] to-transparent" />
                <div className="absolute -left-[2px] top-0 w-[6px] h-[2px] rounded-full bg-[#00E5FF]" />
              </div>
              <div>
                <div className="text-[11px] font-black text-white/40 tracking-[0.2em] uppercase font-['Poppins']">Security Index</div>
                <div className="text-base font-bold text-white/90 truncate max-w-[160px] font-['Poppins']">
                  {isNoProject ? 'STATION IDLE' : projectName}
                </div>
              </div>
            </div>
            {hasData && (
              <div 
                className="px-3 py-1.5 rounded-full border text-[10px] font-black tracking-widest uppercase shadow-sm font-['Poppins'] md:transition-colors md:duration-200"
                style={{ 
                  color: cfg.color, 
                  borderColor: cfg.border, 
                  background: cfg.bg,
                  boxShadow: `0 0 10px ${cfg.glow}`
                }}
              >
                <span className="relative flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full md:animate-pulse" style={{ background: cfg.color }} />
                  {cfg.label}
                </span>
              </div>
            )}
          </div>

          {/* Ring Section */}
          <div className="relative flex justify-center mb-6">
            {/* Outer decorative rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-white/5 opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full border border-white/3 opacity-30" />
            
            {/* Main SVG Ring */}
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              {/* Background track */}
              <circle
                cx={center} cy={center} r={radius}
                fill="none" 
                stroke="rgba(255,255,255,0.03)" 
                strokeWidth="10"
              />
              {/* Progress ring */}
              <circle
                cx={center} cy={center} r={radius}
                fill="none"
                stroke={hasData ? cfg.color : 'rgba(255,255,255,0.05)'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={hasData ? offset : circumference}
                className="max-md:transition-none md:transition-all md:duration-500"
                style={{ filter: hasData ? `drop-shadow(0 0 8px ${cfg.color})` : 'none' }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Inner glow ring */}
              {hasData && (
                <div 
                  className="absolute w-[100px] h-[100px] rounded-full opacity-15 -z-10 max-md:blur-md md:blur-2xl md:opacity-20"
                  style={{ background: cfg.color }}
                />
              )}
              <div className="text-7xl font-black tracking-tighter font-['Poppins']" style={{ color: hasData ? cfg.color : 'rgba(255,255,255,0.08)' }}>
                {displayScore}
              </div>
              <div className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase mt-1 font-['Poppins']">
                THREAT INDEX
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="mb-5">
            <div className="flex justify-between text-[10px] font-black text-white/30 tracking-widest uppercase mb-2 font-['Poppins']">
              <span>OPERATIONAL STATUS</span>
              <span>{hasData ? `${displayScore}%` : '—'}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full max-md:transition-none md:transition-[width] md:duration-300"
                style={{ 
                  width: hasData ? `${displayScore}%` : '0%',
                  background: hasData ? cfg.color : 'transparent'
                }}
              />
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-auto">
            <div className="flex gap-2 mb-4">
              <div className="flex-1 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="text-[9px] font-black text-white/30 tracking-wider uppercase font-['Poppins']">Target</div>
                <div className="text-[11px] font-mono text-white/60 truncate font-['Poppins']">
                  {isNoProject ? '—' : (projectTarget || 'Unknown')}
                </div>
              </div>
              <div className="flex-1 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="text-[9px] font-black text-white/30 tracking-wider uppercase font-['Poppins']">Status</div>
                <div className="text-[11px] font-mono font-['Poppins']" style={{ color: hasData ? cfg.color : 'rgba(255,255,255,0.3)' }}>
                  {isNoProject ? 'INACTIVE' : 'MONITORING'}
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-white/10">
              <p className="text-[11px] text-white/40 leading-relaxed font-medium flex items-start gap-2 font-['Poppins']">
                <span className="w-1 h-1 rounded-full mt-1 flex-shrink-0" style={{ background: hasData ? cfg.color : 'rgba(255,255,255,0.2)' }} />
                {isNoProject 
                  ? 'Select a investigation target to initialize risk assessment sequence.'
                  : `Continuous monitoring active for ${projectTarget || 'target'}. ${displayScore >= 70 ? 'Immediate attention recommended.' : 'Integrity check complete.'}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskCircle;
