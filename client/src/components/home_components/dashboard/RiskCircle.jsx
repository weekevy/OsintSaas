import { useState, useEffect, useRef } from 'react';

const EnhancedRiskCircle = ({
  riskData = null,
  projectName,
  projectTarget,
  onRiskChange
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState('low');
  const [riskDetails, setRiskDetails] = useState(null);
  const animationTimerRef = useRef(null);
  const prevRiskDataRef = useRef(null);

  const cleanupTimers = () => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!projectName || projectName === 'No Project Selected') {
      cleanupTimers();
      setDisplayScore(0);
      setRiskDetails(null);
      setRiskLevel('low');
      if (onRiskChange) onRiskChange(0, 'low', null);
      prevRiskDataRef.current = null;
      return;
    }

    cleanupTimers();

    if (riskData && Object.keys(riskData).length > 0) {
      let score = 0;
      let level = 'low';
      let details = null;

      if (typeof riskData === 'number') {
        score = riskData;
      } else if (riskData.risk_score !== undefined) {
        score = riskData.risk_score;
        details = riskData;
      } else if (riskData.score !== undefined) {
        score = riskData.score;
        details = riskData;
      } else if (riskData.risk_level) {
        level = riskData.risk_level;
        const levelMap = { low: 15, medium: 45, high: 70, critical: 85 };
        score = levelMap[riskData.risk_level] || 15;
        details = riskData;
      }

      setRiskDetails(details);
      setRiskLevel(level);

      const isNewProject = prevRiskDataRef.current !== riskData;
      const isScoreDifferent = displayScore !== score;

      if (isNewProject || isScoreDifferent || (displayScore === 0 && score > 0)) {
        animateScoreChange(score);
      } else {
        setDisplayScore(score);
      }

      prevRiskDataRef.current = riskData;
    } else {
      setRiskDetails(null);
      setRiskLevel('low');
      setDisplayScore(0);
      if (onRiskChange) onRiskChange(0, 'low', null);
      prevRiskDataRef.current = null;
    }

    return cleanupTimers;
  }, [riskData, projectName]);

  const animateScoreChange = (newScore) => {
    if (newScore === 0 && displayScore === 0) return;
    cleanupTimers();
    const duration = 700;
    const steps = 35;
    const stepTime = duration / steps;
    let currentScore = displayScore;
    const difference = newScore - currentScore;
    let step = 0;
    animationTimerRef.current = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(currentScore + difference * ease));
      if (step >= steps) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
        setDisplayScore(newScore);
        if (onRiskChange) onRiskChange(newScore, riskLevel, riskDetails);
      }
    }, stepTime);
  };

  const getRiskConfig = (score) => {
    if (score >= 75) return {
      label: 'CRITICAL', short: 'C',
      color: '#f87171', colorDim: '#f8717133', colorBg: 'rgba(248,113,113,0.07)',
      gradStart: '#f87171', gradEnd: '#ef4444',
      trackColor: 'rgba(248,113,113,0.12)',
      border: 'rgba(248,113,113,0.3)',
    };
    if (score >= 50) return {
      label: 'HIGH', short: 'H',
      color: '#fbbf24', colorDim: '#fbbf2433', colorBg: 'rgba(251,191,36,0.07)',
      gradStart: '#fbbf24', gradEnd: '#f59e0b',
      trackColor: 'rgba(251,191,36,0.12)',
      border: 'rgba(251,191,36,0.3)',
    };
    if (score >= 25) return {
      label: 'MEDIUM', short: 'M',
      color: '#fb923c', colorDim: '#fb923c33', colorBg: 'rgba(251,146,60,0.07)',
      gradStart: '#fb923c', gradEnd: '#f97316',
      trackColor: 'rgba(251,146,60,0.12)',
      border: 'rgba(251,146,60,0.3)',
    };
    return {
      label: 'LOW', short: 'L',
      color: '#22d3ee', colorDim: '#22d3ee33', colorBg: 'rgba(34,211,238,0.07)',
      gradStart: '#22d3ee', gradEnd: '#06b6d4',
      trackColor: 'rgba(34,211,238,0.12)',
      border: 'rgba(34,211,238,0.3)',
    };
  };

  const size = 180;
  const outerR = 78;
  const innerR = 66;
  const center = size / 2;
  const outerCirc = 2 * Math.PI * outerR;
  const innerCirc = 2 * Math.PI * innerR;
  const outerOffset = outerCirc - (displayScore / 100) * outerCirc;
  const innerOffset = innerCirc - ((displayScore * 0.7) / 100) * innerCirc;

  const cfg = getRiskConfig(displayScore);
  const isNoProject = !projectName || projectName === 'No Project Selected';
  const hasData = displayScore > 0 && !isNoProject;

  const gradId = `rg_${Math.round(displayScore)}`;

  return (
    <div style={{
      background: 'linear-gradient(160deg, #0c1115 0%, #090d10 100%)',
      border: `1px solid ${hasData ? cfg.border : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 14,
      padding: '18px 16px 16px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      position: 'relative',
      minHeight: 445,
      width: '100%',
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'",
      overflow: 'hidden',
      transition: 'border-color 0.4s ease',
    }}>

      {/* Background glow blob */}
      {hasData && (
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${cfg.color}0a 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)',
        backgroundSize: '20px 20px',
      }} />

      {/* Header with Project Name */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 16, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <div style={{ width: 3, height: 14, borderRadius: 2, background: hasData ? cfg.color : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.12em', display: 'block' }}>RISK ASSESSMENT</span>
            <p style={{
              fontSize: 8, color: hasData ? cfg.color : 'rgba(255,255,255,0.35)',
              margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              fontWeight: 600, letterSpacing: '0.06em',
            }}>
              {isNoProject ? 'NO PROJECT SELECTED' : projectName}
            </p>
          </div>
        </div>
        {hasData && (
          <span style={{
            padding: '2px 8px', borderRadius: 4,
            background: cfg.colorBg, border: `1px solid ${cfg.border}`,
            fontSize: 7, color: cfg.color, fontWeight: 700, letterSpacing: '0.1em',
            display: 'flex', alignItems: 'center', gap: 4,
            flexShrink: 0, marginLeft: 8,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, display: 'inline-block', animation: 'pulseDot 2s ease-in-out infinite' }} />
            {cfg.label}
          </span>
        )}
      </div>

      {/* SVG Ring — fixed dimensions, no layout shift */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, marginBottom: 12 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={cfg.gradStart} />
              <stop offset="100%" stopColor={cfg.gradEnd} />
            </linearGradient>
            {Array.from({ length: 20 }).map((_, i) => {
              const angle = (i / 20) * 360;
              const rad = (angle * Math.PI) / 180;
              const x1 = center + (outerR + 6) * Math.cos(rad);
              const y1 = center + (outerR + 6) * Math.sin(rad);
              const x2 = center + (outerR + 9) * Math.cos(rad);
              const y2 = center + (outerR + 9) * Math.sin(rad);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
            })}
          </defs>

          <circle cx={center} cy={center} r={outerR} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />

          <circle
            cx={center} cy={center} r={outerR} fill="none"
            stroke={hasData ? `url(#${gradId})` : 'transparent'}
            strokeWidth="5" strokeLinecap="round"
            strokeDasharray={outerCirc}
            strokeDashoffset={hasData ? outerOffset : outerCirc}
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.4s' }}
          />

          <circle cx={center} cy={center} r={innerR} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />

          <circle
            cx={center} cy={center} r={innerR} fill="none"
            stroke={hasData ? cfg.color + '44' : 'transparent'}
            strokeWidth="3" strokeLinecap="round"
            strokeDasharray={innerCirc}
            strokeDashoffset={hasData ? innerOffset : innerCirc}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.4s' }}
          />
        </svg>

        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 44, fontWeight: 700, lineHeight: 1,
            color: hasData ? cfg.color : 'rgba(255,255,255,0.15)',
            fontVariantNumeric: 'tabular-nums',
            transition: 'color 0.4s',
          }}>
            {displayScore}
          </span>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', marginTop: 4 }}>/100</span>
          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', marginTop: 2 }}>SCORE</span>
        </div>
      </div>

      {/* Threat meter bar — fixed height always rendered */}
      <div style={{ width: '100%', marginBottom: 14, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          {['LOW', 'MED', 'HIGH', 'CRIT'].map((lbl, i) => {
            const thresholds = [0, 25, 50, 75];
            const isActive = hasData && displayScore >= thresholds[i];
            const segColors = ['#22d3ee', '#fb923c', '#fbbf24', '#f87171'];
            return (
              <span key={lbl} style={{ fontSize: 7, letterSpacing: '0.08em', color: isActive ? segColors[i] : 'rgba(255,255,255,0.2)', fontWeight: isActive ? 700 : 400, transition: 'color 0.4s' }}>
                {lbl}
              </span>
            );
          })}
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            width: hasData ? `${displayScore}%` : '0%',
            background: hasData ? `linear-gradient(90deg, #22d3ee, #fb923c, ${cfg.color})` : 'transparent',
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      </div>

      {/* Risk factors — fixed-height container so it doesn't collapse */}
      <div style={{ width: '100%', minHeight: 110, marginBottom: 0, position: 'relative', zIndex: 1, flex: 1 }}>
        {riskDetails?.risk_factors?.length > 0 && !isNoProject ? (
          <>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', marginBottom: 8 }}>DETECTED RISK FACTORS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {riskDetails.risk_factors.slice(0, 4).map((factor, idx) => (
                <span key={idx} style={{
                  fontSize: 8, padding: '3px 8px', borderRadius: 4,
                  border: `1px solid ${cfg.color}35`,
                  color: cfg.color, background: cfg.colorBg,
                  letterSpacing: '0.06em', fontWeight: 700,
                }}>
                  {factor}
                </span>
              ))}
            </div>
            {projectTarget && !isNoProject && (
              <p style={{
                fontSize: 7, color: 'rgba(255,255,255,0.3)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                margin: '10px 0 0', letterSpacing: '0.08em',
              }}>
                TARGET: {projectTarget}
              </p>
            )}
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>
              {isNoProject ? 'SELECT A PROJECT TO VIEW RISK' : 'NO RISK FACTORS DETECTED'}
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
      `}</style>
    </div>
  );
};

export default EnhancedRiskCircle;