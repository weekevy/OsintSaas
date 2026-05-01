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
      label: 'CRITICAL', color: '#f87171', border: 'rgba(248,113,113,0.3)', bg: 'rgba(248,113,113,0.05)'
    };
    if (score >= 50) return {
      label: 'HIGH', color: '#fbbf24', border: 'rgba(251,191,36,0.3)', bg: 'rgba(251,191,36,0.05)'
    };
    if (score >= 25) return {
      label: 'MEDIUM', color: '#fb923c', border: 'rgba(251,146,60,0.3)', bg: 'rgba(251,146,60,0.05)'
    };
    return {
      label: 'OPTIMAL', color: '#00E5FF', border: 'rgba(0,229,255,0.3)', bg: 'rgba(0,229,255,0.05)'
    };
  };

  const size = 200;
  const radius = 85;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  const cfg = getRiskConfig(displayScore);
  const isNoProject = !projectName || projectName === 'No Project Selected';
  const hasData = displayScore > 0 && !isNoProject;

  return (
    <div className="glass-card rounded-2xl p-8 flex flex-col items-center relative overflow-hidden h-full min-h-[450px]">
      {/* Background glow */}
      {hasData && (
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-20"
          style={{ background: cfg.color }}
        />
      )}

      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-1 h-4 rounded-full" style={{ background: hasData ? cfg.color : 'rgba(255,255,255,0.1)' }} />
          <div>
            <div className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Security Index</div>
            <div className="text-xs font-bold text-white truncate max-w-[120px]">
              {isNoProject ? 'STATION IDLE' : projectName}
            </div>
          </div>
        </div>
        {hasData && (
          <div 
            className="px-3 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase"
            style={{ color: cfg.color, borderColor: cfg.border, background: cfg.bg }}
          >
            {cfg.label}
          </div>
        )}
      </div>

      {/* Ring */}
      <div className="relative mb-8">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={center} cy={center} r={radius}
            fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8"
          />
          <circle
            cx={center} cy={center} r={radius}
            fill="none"
            stroke={hasData ? cfg.color : 'rgba(255,255,255,0.05)'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={hasData ? offset : circumference}
            className="transition-all duration-500"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-black tracking-tighter" style={{ color: hasData ? cfg.color : 'rgba(255,255,255,0.1)' }}>
            {displayScore}
          </div>
          <div className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-1">
            Threat Level
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full mt-auto relative z-10">
        <div className="flex justify-between text-[10px] font-black text-white/30 tracking-widest uppercase mb-4">
          <span>Operational</span>
          <span>Verified</span>
        </div>
        
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: hasData ? `${displayScore}%` : '0%',
              background: hasData ? cfg.color : 'transparent'
            }}
          />
        </div>
        
        <p className="mt-4 text-[10px] text-white/40 leading-relaxed font-medium">
          {isNoProject 
            ? 'Select a designated investigation target to initialize risk assessment sequence.' 
            : `Continuous monitoring active for ${projectTarget || 'specified target'}. Integrity check complete.`}
        </p>
      </div>
    </div>
  );
};

export default RiskCircle;