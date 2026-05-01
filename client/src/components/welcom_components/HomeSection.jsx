import { forwardRef } from 'react';

const HomeSection = forwardRef(({ onRegisterClick, onServicesClick }, ref) => {
  const FeatureIcon = ({ type, color }) => {
    const iconColor = color;
    switch(type) {
      case 'deep':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 7V13M14 10H8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'realtime':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'shield':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
            <path d="M12 3L5 6C5 6 4 10 4 12C4 16 12 21 12 21C12 21 20 16 20 12C20 10 19 6 19 6L12 3Z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'api':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
            <path d="M4 7v10c0 1.105 3.582 2 8 2s8-.895 8-2V7" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 12c0 1.105 3.582 2 8 2s8-.895 8-2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const features = [
    { iconType: 'deep', title: 'Deep Intelligence', value: 'Billion-scale', desc: 'Global multi-layered data ingestion across surface, deep, and dark web.', color: '#00E5FF' },
    { iconType: 'realtime', title: 'Real-time Linkage', value: 'Instantaneous', desc: 'Cross-platform identity correlation with millisecond latency.', color: '#2DD4BF' },
    { iconType: 'shield', title: 'SecOps Isolation', value: 'Zero-Knowledge', desc: 'Fully encrypted investigation enclaves with complete anonymity.', color: '#00E5FF' },
    { iconType: 'api', title: 'Modular SDK', value: 'API-First', desc: 'Native enterprise-grade integration with REST and GraphQL.', color: '#2DD4BF' }
  ];

  return (
    <section 
      ref={ref} 
      id="home" 
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-black overflow-hidden"
    >
      {/* Premium Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Main glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-r from-[#00E5FF]/8 via-[#2DD4BF]/5 to-transparent blur-[180px]" />
        {/* Secondary accent */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-[#007AFF]/5 blur-[120px]" />
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #00E5FF 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative w-full max-w-7xl mx-auto z-10 flex flex-col items-center">
        {/* Premium Badge - Smaller gap to top */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 backdrop-blur-sm">
          {/* Active rings - Non-animated */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E5FF]"></span>
          </span>
          <span className="text-[11px] font-bold tracking-[0.25em] text-white/60 uppercase">
            Global Intelligence Terminal
          </span>
        </div>

        {/* Hero Text - BIGGER & THICKER - Single line with smaller gap */}
        <h1 className="text-center mb-8">
          <div className="text-[10vw] sm:text-[4.5rem] md:text-[6rem] lg:text-[7.5rem] font-black tracking-[-0.03em] leading-[1.05]">
            {/* First line - Silver gradient */}
            <span className="block bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent pb-2">
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(90deg, #00E5FF, #2DD4BF, #007AFF, #00E5FF, #2DD4BF)',
                backgroundSize: '300% 100%',
              }}
            >
              Break Down Scammers.
            </span>
              Uncover Truth
            </span>
          </div>
        </h1>

        {/* Subtitle - Smaller gap */}
        <p className="text-gray-400 text-lg md:text-xl text-center max-w-2xl mb-10 leading-relaxed font-medium">
          The most sophisticated OSINT ecosystem ever engineered. 
          Analyze digital footprints with absolute precision.
        </p>

        {/* Buttons - Smaller gap */}
        <div className="flex flex-wrap gap-4 justify-center mb-20">
          <button
            onClick={onRegisterClick}
            className="group relative px-12 py-5 bg-white text-black font-bold text-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          >
            <span className="relative z-10">Start Investigation</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          
          <button
            onClick={onServicesClick}
            className="px-12 py-5 bg-white/[0.03] text-white font-bold text-lg rounded-2xl border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
          >
            See Capabilities
          </button>
        </div>

        {/* Cards - Fancy AI-brand style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="group relative"
            >
              <div className="relative bg-[#0a0a0a] rounded-2xl p-6 h-full transition-all duration-300"
                style={{
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Hover border glow */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}10, transparent 60%)`,
                    border: `1px solid ${feature.color}30`,
                    margin: '-1px',
                  }}
                />
                
                {/* Icon container */}
                <div 
                  className="relative w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105"
                  style={{ 
                    background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}05)`,
                    border: `1px solid ${feature.color}25`
                  }}
                >
                  <FeatureIcon type={feature.iconType} color={feature.color} />
                </div>
                
                {/* Category */}
                <span className="relative text-[8px] font-bold text-white/25 uppercase tracking-[0.2em] mb-2 block">
                  {feature.title}
                </span>
                
                {/* Value */}
                <div 
                  className="relative text-2xl font-black mb-2 tracking-[-0.02em]"
                  style={{ color: feature.color }}
                >
                  {feature.value}
                </div>
                
                {/* Description */}
                <p className="relative text-gray-500 text-xs leading-relaxed font-medium">
                  {feature.desc}
                </p>
                
                {/* Subtle arrow on hover */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                  <svg className="w-4 h-4 text-[#00E5FF]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

HomeSection.displayName = 'HomeSection';
export default HomeSection;