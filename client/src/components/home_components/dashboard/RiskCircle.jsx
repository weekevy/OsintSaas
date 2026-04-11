import { useState, useEffect } from 'react';

const RiskCircle = ({ 
  riskData = null, 
  projectName, 
  projectTarget, 
  getRiskColor, 
  getRiskBgColor,
  onRiskChange 
}) => {
  const [animate, setAnimate] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState('low');
  const [riskDetails, setRiskDetails] = useState(null);

  // Extract risk score and details from JSON data
  useEffect(() => {
    if (riskData) {
      let score = 0;
      let level = 'low';
      let details = null;
      
      // If riskData is a number directly
      if (typeof riskData === 'number') {
        score = riskData;
      } 
      // If riskData has risk_score property
      else if (riskData.risk_score !== undefined) {
        score = riskData.risk_score;
        details = riskData;
      }
      // If riskData has score property
      else if (riskData.score !== undefined) {
        score = riskData.score;
        details = riskData;
      }
      // If riskData has risk_level
      else if (riskData.risk_level) {
        level = riskData.risk_level;
        const levelMap = { 'low': 15, 'medium': 45, 'high': 70, 'critical': 85 };
        score = levelMap[riskData.risk_level] || 15;
        details = riskData;
      }
      
      setRiskDetails(details);
      setRiskLevel(level);
      animateScoreChange(score);
    } else {
      animateScoreChange(0);
      setRiskDetails(null);
      setRiskLevel('low');
    }
  }, [riskData]);

  // Animate when riskScore changes
  const animateScoreChange = (newScore) => {
    setAnimate(true);
    
    const duration = 500;
    const steps = 20;
    const stepTime = duration / steps;
    const startScore = displayScore;
    const difference = newScore - startScore;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const currentScore = Math.round(startScore + (difference * progress));
      setDisplayScore(currentScore);
      
      if (step >= steps) {
        clearInterval(timer);
        setDisplayScore(newScore);
        if (onRiskChange) {
          onRiskChange(newScore, riskLevel, riskDetails);
        }
      }
    }, stepTime);
    
    const scaleTimer = setTimeout(() => setAnimate(false), 700);
    
    return () => {
      clearInterval(timer);
      clearTimeout(scaleTimer);
    };
  };

  // Calculate circle properties
  const size = 200;
  const radius = 85;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  // Helper function to get risk level text
  const getRiskLevelText = (score) => {
    if (score >= 75) return 'Critical Risk';
    if (score >= 50) return 'High Risk';
    if (score >= 25) return 'Medium Risk';
    return 'Low Risk';
  };

  // Get gradient colors based on score
  const getGradientColors = (score) => {
    if (score >= 75) return { start: '#EF4444', end: '#DC2626' };
    if (score >= 50) return { start: '#F97316', end: '#EA580C' };
    if (score >= 25) return { start: '#F59E0B', end: '#D97706' };
    return { start: '#10B981', end: '#059669' };
  };

  const colors = getGradientColors(displayScore);

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 p-5 lg:p-6 flex flex-col items-center justify-center overflow-hidden relative w-full max-w-[550px] mx-auto">
      
      <h3 className="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4 relative z-10 flex items-center gap-2">
        Risk Assessment
        {animate && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
          </span>
        )}
      </h3>
      
      {/* Circle Container */}
      <div className={`relative w-44 h-44 sm:w-48 sm:h-48 lg:w-52 lg:h-52 mb-3 lg:mb-4 transition-all duration-700 ${animate ? 'scale-105' : 'scale-100'}`}>
        <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            strokeDasharray="4 4"
          />
          
          {/* Progress circle with animation */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#riskGradient-${displayScore})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{
              transition: 'stroke-dashoffset 1000ms ease-out'
            }}
          />
          
          {/* Dynamic gradient based on risk score */}
          <defs>
            <linearGradient id={`riskGradient-${displayScore}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center text with counting animation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl sm:text-4xl lg:text-5xl font-bold transition-colors duration-500`} style={{ color: colors.start }}>
            {displayScore}
          </span>
          <span className="text-white/40 text-xs mt-1">Risk Score</span>
        </div>
      </div>

      {/* Risk level indicator with animation */}
      <div className={`flex items-center gap-2 transition-all duration-500 mb-3 lg:mb-4 ${animate ? 'scale-105' : 'scale-100'}`}>
        <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${animate ? 'animate-pulse' : ''}`} style={{ backgroundColor: colors.start }} />
        <span className="text-sm text-white font-medium">
          {getRiskLevelText(displayScore)}
        </span>
      </div>

      {/* Risk Factors from JSON */}
      {riskDetails && riskDetails.risk_factors && riskDetails.risk_factors.length > 0 && (
        <div className="w-full text-left space-y-2 pt-2 border-t border-white/10 mb-3">
          <div className="text-white/40 text-xs">Risk Factors:</div>
          <div className="flex flex-wrap gap-1">
            {riskDetails.risk_factors.slice(0, 3).map((factor, idx) => (
              <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Current Project Info */}
      <div className="text-center pt-3 border-t border-white/10 w-full">
        <div className="text-white/60 text-xs mb-1">Current Project</div>
        <div className="text-white font-medium text-sm truncate px-2">
          {projectName || 'No Project Selected'}
        </div>
        {projectTarget && (
          <div className="text-white/40 text-xs truncate px-2 mt-1">
            {projectTarget}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskCircle;