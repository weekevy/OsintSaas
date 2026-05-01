import { forwardRef, useEffect, useState } from 'react';

const HomeSection = forwardRef(({ onRegisterClick, onServicesClick }, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const FeatureIcon = ({ type, color, size = "w-6 h-6" }) => {
    const iconColor = color;
    switch(type) {
      case 'deep':
        return (
          <svg className={`${size} transition-all duration-300`} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 7V13M14 10H8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'realtime':
        return (
          <svg className={`${size} transition-all duration-300`} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'shield':
        return (
          <svg className={`${size} transition-all duration-300`} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
            <path d="M12 3L5 6C5 6 4 10 4 12C4 16 12 21 12 21C12 21 20 16 20 12C20 10 19 6 19 6L12 3Z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'api':
        return (
          <svg className={`${size} transition-all duration-300`} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
            <path d="M4 7v10c0 1.105 3.582 2 8 2s8-.895 8-2V7" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 12c0 1.105 3.582 2 8 2s8-.895 8-2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const features = [
    { 
      iconType: 'deep', 
      title: 'Deep Intelligence', 
      value: 'Billion-scale', 
      desc: 'Global multi-layered data ingestion across surface, deep, and dark web.', 
      color: '#00E5FF',
      stats: '2.5B+ Data Points',
      metric: 'Real-time'
    },
    { 
      iconType: 'realtime', 
      title: 'Real-time Linkage', 
      value: 'Instantaneous', 
      desc: 'Cross-platform identity correlation with millisecond latency.', 
      color: '#2DD4BF',
      stats: '99.99% Uptime',
      metric: '< 50ms'
    },
    { 
      iconType: 'shield', 
      title: 'SecOps Isolation', 
      value: 'Zero-Knowledge', 
      desc: 'Fully encrypted investigation enclaves with complete anonymity.', 
      color: '#00E5FF',
      stats: 'Military Grade',
      metric: 'AES-256'
    },
    { 
      iconType: 'api', 
      title: 'Modular SDK', 
      value: 'API-First', 
      desc: 'Native enterprise-grade integration with REST and GraphQL.', 
      color: '#2DD4BF',
      stats: '10k+ Requests',
      metric: 'Scalable'
    }
  ];

  return (
    <section 
      ref={ref} 
      id="home" 
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-black overflow-x-hidden"
    >
      {/* Premium Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-r from-[#00E5FF]/8 via-[#2DD4BF]/5 to-transparent blur-[180px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-[#007AFF]/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #00E5FF 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative w-full max-w-7xl mx-auto z-10 flex flex-col items-center">
        {/* Badge */}
        <div 
          className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 backdrop-blur-sm transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E5FF] animate-pulse"></span>
          </span>
          <span className="text-[11px] font-bold tracking-[0.25em] text-white/60 uppercase">
            Global Intelligence Terminal
          </span>
        </div>

        {/* Hero Title - Larger on lg screens and above */}
        <div className="w-full text-center px-4">
          <h1 
            className={`font-black tracking-tight leading-[1.02] transition-all duration-700 delay-100 ease-out ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <span className="block sm:inline text-[clamp(1.8rem,8vw,3rem)] md:text-[clamp(2rem,7vw,3.5rem)] lg:text-[clamp(2.8rem,6vw,5.5rem)] xl:text-[clamp(3rem,5.5vw,6rem)] 2xl:text-[6.5rem] bg-gradient-to-r from-[#00E5FF] via-[#2DD4BF] to-[#007AFF] bg-clip-text text-transparent animate-ocean-wave bg-[length:200%_auto]">
              Break Down Scammers.{' '}
            </span>
            <span className="text-white text-[clamp(1.8rem,8vw,3rem)] md:text-[clamp(2rem,7vw,3.5rem)] lg:text-[clamp(2.8rem,6vw,5.5rem)] xl:text-[clamp(3rem,5.5vw,6rem)] 2xl:text-[6.5rem]">
              Uncover Truth
            </span>
          </h1>
        </div>

        {/* Subtitle - Slightly reduced top margin */}
        <p 
          className={`text-gray-400 text-base sm:text-lg md:text-xl text-center max-w-2xl mt-4 mb-10 leading-relaxed font-medium transition-all duration-700 delay-200 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          The most sophisticated OSINT ecosystem ever engineered. 
          Analyze digital footprints with absolute precision.
        </p>

        {/* Buttons */}
        <div 
          className={`flex flex-wrap gap-4 justify-center mb-20 transition-all duration-700 delay-300 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button
            onClick={onRegisterClick}
            className="group relative px-8 sm:px-10 py-3 sm:py-4 bg-white text-black font-bold text-base sm:text-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-105"
          >
            <span className="relative z-10">Start Investigation</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          
          <button
            onClick={onServicesClick}
            className="px-8 sm:px-10 py-3 sm:py-4 bg-white/[0.03] text-white font-bold text-base sm:text-lg rounded-2xl border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300 hover:scale-105"
          >
            See Capabilities
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          {features.map((feature, i) => (
            <div 
              key={i}
              className={`group transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${400 + i * 100}ms` }}
            >
              <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] rounded-2xl p-5 h-full transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/10 hover:border-[#00E5FF]/30">
                {/* Icon */}
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}05)`,
                    border: `1px solid ${feature.color}30`,
                  }}
                >
                  <FeatureIcon type={feature.iconType} color={feature.color} size="w-6 h-6" />
                </div>
                
                <h3 className="text-white font-bold text-base mb-1">{feature.title}</h3>
                <div className="text-2xl font-black mb-2" style={{ color: feature.color }}>{feature.value}</div>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">{feature.desc}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-[10px] text-gray-500">{feature.stats}</span>
                  <span className="text-[10px] font-mono text-[#00E5FF]/70">{feature.metric}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes oceanWave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-ocean-wave {
          animation: oceanWave 6s ease-in-out infinite;
          background-size: 200% auto;
        }
        @keyframes ping {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </section>
  );
});

HomeSection.displayName = 'HomeSection';
export default HomeSection;