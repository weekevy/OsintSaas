const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50 overflow-hidden">
      
      {/* Premium Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-[#00E5FF]/8 via-[#2DD4BF]/5 to-transparent blur-[120px]" />
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #00E5FF 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Main Loader Container */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Animated Rings - Fancy AI style */}
        <div className="relative w-24 h-24 mb-10">
          {/* Outer ring - slow spin */}
          <div className="absolute inset-0 rounded-full border-2 border-[#00E5FF]/20 animate-spin-slow" />
          
          {/* Middle ring - reverse spin */}
          <div className="absolute inset-2 rounded-full border-2 border-[#2DD4BF]/15 animate-spin-reverse" 
            style={{ animationDuration: '3s' }}
          />
          
          {/* Inner ring - fast pulse */}
          <div className="absolute inset-4 rounded-full border border-[#00E5FF]/30 animate-pulse-ring" />
          
          {/* Center - Loading circle instead of icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 24 24" fill="none">
              {/* Track */}
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
              {/* Spinning arc */}
              <circle 
                cx="12" cy="12" r="10" 
                stroke="url(#loadingGradient)" 
                strokeWidth="1.5" 
                strokeLinecap="round"
                strokeDasharray="8 55"
                className="animate-spin-fast"
              />
              <defs>
                <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" />
                  <stop offset="50%" stopColor="#2DD4BF" />
                  <stop offset="100%" stopColor="#00E5FF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Brand name */}
        <h2 className="text-3xl font-black tracking-tight relative">
          <span className="text-white">Weekey</span>
          <span className="bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] bg-clip-text text-transparent">Osint</span>
          <span className="inline-block w-2 h-2 ml-1 rounded-full bg-[#00E5FF] animate-pulse-dot" />
        </h2>

        {/* Loading status */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-white/25 uppercase tracking-[0.25em]">Initializing</span>
            <span className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-[#00E5FF]/60 animate-bounce-dot" />
              <span className="w-1 h-1 rounded-full bg-[#2DD4BF]/60 animate-bounce-dot" style={{ animationDelay: '0.15s' }} />
              <span className="w-1 h-1 rounded-full bg-[#00E5FF]/60 animate-bounce-dot" style={{ animationDelay: '0.3s' }} />
            </span>
          </div>
        </div>

        {/* Bottom status */}
        <p className="mt-12 text-[9px] font-bold text-white/[0.12] uppercase tracking-[0.3em]">
          Global Intelligence Platform
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes bounce-dot {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }
        .animate-spin-fast {
          animation: spin-fast 1.2s linear infinite;
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
        .animate-pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
        .animate-bounce-dot {
          animation: bounce-dot 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;