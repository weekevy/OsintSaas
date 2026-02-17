import { useState, useEffect } from 'react';

const RiskCircle = ({ riskScore, getRiskColor, getRiskBgColor }) => {
  const [animate, setAnimate] = useState(false);
  const [displayScore, setDisplayScore] = useState(riskScore);
  
  // Animate when riskScore changes
  useEffect(() => {
    setAnimate(true);
    
    // Animate the number counting up/down
    const duration = 500;
    const steps = 20;
    const stepTime = duration / steps;
    const startScore = displayScore;
    const difference = riskScore - startScore;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const currentScore = Math.round(startScore + (difference * progress));
      setDisplayScore(currentScore);
      
      if (step >= steps) {
        clearInterval(timer);
        setDisplayScore(riskScore);
      }
    }, stepTime);
    
    // Remove scale animation after delay
    const scaleTimer = setTimeout(() => setAnimate(false), 700);
    
    return () => {
      clearInterval(timer);
      clearTimeout(scaleTimer);
    };
  }, [riskScore]);

  const stats = [
    { label: 'Total Scans', value: '1,234' },
    { label: 'Threats', value: '89' },
    { label: 'Clean', value: '1,145' }
  ];

  // Calculate circle properties
  const size = 200;
  const radius = 85;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 p-5 lg:p-6 flex flex-col items-center justify-center overflow-hidden relative w-full max-w-[320px] mx-auto">
      
      {/* No background glow animation - removed completely */}
      
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
              <stop offset="0%" stopColor="#10B981" />
              <stop offset={`${Math.max(0, 100 - displayScore)}%`} stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center text with counting animation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl sm:text-4xl lg:text-5xl font-bold transition-colors duration-500 ${getRiskColor(displayScore)}`}>
            {displayScore}
          </span>
          <span className="text-white/40 text-xs mt-1">Risk Score</span>
        </div>
      </div>

      {/* Risk level indicator with animation */}
      <div className={`flex items-center gap-2 transition-all duration-500 mb-3 lg:mb-4 ${animate ? 'scale-105' : 'scale-100'}`}>
        <div className={`w-2 h-2 rounded-full ${getRiskBgColor(displayScore)} ${animate ? 'animate-pulse' : ''}`} />
        <span className="text-sm text-white font-medium">
          {displayScore >= 75 ? 'Critical Risk' : 
           displayScore >= 50 ? 'High Risk' : 
           displayScore >= 25 ? 'Medium Risk' : 'Low Risk'}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 w-full mt-2 pt-3 border-t border-white/10">
        {stats.map((stat, i) => (
          <div key={i} className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="text-white font-semibold text-sm sm:text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400">
              {stat.value}
            </div>
            <div className="text-white/40 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskCircle;
