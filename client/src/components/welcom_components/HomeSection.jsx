import { forwardRef } from 'react';

const HomeSection = forwardRef(({ hasAnimated, onRegisterClick, onServicesClick }, ref) => {
  // Tactical SVG icons with acid green
  const getFeatureIcon = (type) => {
    const iconColor = '#00ff88';
    switch(type) {
      case 'research':
        return (
          <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.2">
            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 7V13M14 10H8" strokeLinecap="round"/>
          </svg>
        );
      case 'realtime':
        return (
          <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.2">
            <path d="M3 12H5L7 8L9 16L11 10L13 14L15 12L17 12" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="19" cy="12" r="2" strokeLinecap="round"/>
            <path d="M12 3V5M12 19V21" strokeLinecap="round"/>
          </svg>
        );
      case 'secure':
        return (
          <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.2">
            <path d="M12 3L5 6C5 6 4 10 4 12C4 16 12 21 12 21C12 21 20 16 20 12C20 10 19 6 19 6L12 3Z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section ref={ref} id="home" className="relative min-h-screen flex items-center pt-20 px-4 sm:px-6 lg:px-8 bg-[#080b0d]">
      <div className="relative w-full max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center">
          {/* Badge - Tactical */}
          <div className={`inline-flex items-center gap-2 mb-6 transition-all duration-700 delay-100 ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
            </span>
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#00ff88] uppercase">OSINT Platform</span>
          </div>

        <div className={`mb-6 max-w-6xl transition-all duration-700 delay-200 ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
  
  <h1 
    className="text-white relative"
    style={{
      fontFamily: "'Poppins', sans-serif", // 👈 ADD THIS
      fontSize: 'clamp(3.5rem, 9vw, 7rem)',
      fontWeight: 900,
      lineHeight: 0.85,
      letterSpacing: '-0.01em', // Poppins looks better with slightly less negative spacing
    }}
  >
    <div className="relative mb-3 sm:mb-4">
      <span className="relative z-10 inline-block">
        Uncover the Truth
      </span>
      <span className="absolute inset-0 text-white translate-x-1 translate-y-1 opacity-10 select-none" aria-hidden="true">
        Uncover the Truth
      </span>
    </div>
    
    <div className="relative">
      <span className="relative z-10 inline-block text-[#00ff88]">
        Break Down Scammers
      </span>
      <span className="absolute inset-0 text-[#00ff88] translate-x-1.5 translate-y-1.5 opacity-20 select-none" aria-hidden="true">
        Break Down Scammers
      </span>
      <span className="absolute inset-0 text-[#00ff88] blur-xl opacity-30 select-none" aria-hidden="true">
        Break Down Scammers
      </span>
    </div>
  </h1>
</div>
          


          {/* Subtitle */}
          <p className={`text-white/40 text-sm sm:text-base max-w-2xl mb-10 font-mono transition-all duration-700 delay-300 ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            Professional OSINT tools to investigate, verify, and protect yourself from online fraud
          </p>

          {/* CTA Buttons - Tactical Style */}
          <div className={`flex flex-wrap gap-4 justify-center mb-16 transition-all duration-700 delay-400 ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <button
              onClick={onRegisterClick}
              className="group px-6 py-3 bg-[#00ff88]/10 border border-[#00ff88]/40 text-[#00ff88] font-mono text-xs uppercase tracking-[0.08em] hover:bg-[#00ff88]/20 transition-all duration-300 flex items-center gap-2"
            >
              Start Investigation
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            
            <button
              onClick={onServicesClick}
              className="group px-6 py-3 border border-white/10 text-white/60 font-mono text-xs uppercase tracking-[0.08em] hover:border-[#00ff88]/40 hover:text-[#00ff88] transition-all duration-300"
            >
              View Services
            </button>
          </div>

          {/* Feature Cards Grid - Tactical Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl transition-all duration-700 delay-500 ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            {[
              { icon: 'research', title: 'Deep Research', desc: 'Advanced investigation tools' },
              { icon: 'realtime', title: 'Real-time Data', desc: 'Live information gathering' },
              { icon: 'secure', title: 'Secure & Private', desc: 'Your data stays protected' }
            ].map((feature, i) => (
              <div key={i} className="group relative bg-[#090c0e] border border-white/10 hover:border-[#00ff88]/30 transition-all duration-300 p-5">
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#00ff88]/0 group-hover:bg-[#00ff88]/50 transition-all duration-300" />
                {/* Corner pip */}
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[6px] border-r-[6px] border-t-[#00ff88]/20 border-r-transparent" />
                
                <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                  {getFeatureIcon(feature.icon)}
                </div>
                <h3 className="font-display text-base font-bold text-white mb-1">{feature.title}</h3>
                <p className="text-white/40 text-xs font-mono">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/20 to-transparent" />
    </section>
  );
});

HomeSection.displayName = 'HomeSection';
export default HomeSection;