import { forwardRef, useEffect, useState } from 'react';
import dashboardScreenshot from '../../assets/images/for_welcom.png';

const HomeSection = forwardRef(({ onRegisterClick, onServicesClick }, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { 
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const FeatureIcon = ({ type, color, size = "w-6 h-6" }) => {
    switch(type) {
      case 'deep': return (
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 7V13M14 10H8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
      case 'realtime': return (
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
      case 'shield': return (
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M12 3L5 6C5 6 4 10 4 12C4 16 12 21 12 21C12 21 20 16 20 12C20 10 19 6 19 6L12 3Z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
      case 'api': return (
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M4 7v10c0 1.105 3.582 2 8 2s8-.895 8-2V7" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 12c0 1.105 3.582 2 8 2s8-.895 8-2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
      default: return null;
    }
  };

  const features = [
    { iconType: 'deep',     title: 'Deep Intelligence', value: 'Billion-scale',   desc: 'Global multi-layered data ingestion across surface, deep, and dark web.',  color: '#00E5FF', stats: '2.5B+ Data Points', metric: 'Real-time' },
    { iconType: 'realtime', title: 'Real-time Linkage',  value: 'Instantaneous',  desc: 'Cross-platform identity correlation with millisecond latency.',              color: '#2DD4BF', stats: '99.99% Uptime',     metric: '< 50ms'   },
    { iconType: 'shield',   title: 'SecOps Isolation',   value: 'Zero-Knowledge', desc: 'Fully encrypted investigation enclaves with complete anonymity.',            color: '#00E5FF', stats: 'Military Grade',    metric: 'AES-256'  },
    { iconType: 'api',      title: 'Modular SDK',        value: 'API-First',      desc: 'Native enterprise-grade integration with REST and GraphQL.',                 color: '#2DD4BF', stats: '10k+ Requests',    metric: 'Scalable' },
  ];

  const statusPills = [
    { label: 'THREAT INDEX', value: '100',      color: '#ff6b6b', pulse: true  },
    { label: 'PROJECTS',     value: '1 ACTIVE', color: '#2DD4BF', pulse: false },
    { label: 'ALERTS',       value: '3 NEW',    color: '#00E5FF', pulse: true  },
    { label: 'STATUS',       value: 'LIVE',     color: '#2DD4BF', pulse: true  },
  ];

  return (
    <section
      ref={ref}
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-black overflow-x-hidden"
    >
      <div className="relative w-full max-w-[1400px] mx-auto z-10 flex flex-col items-center">

        {/* Badge */}
        <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-3 mt-3 backdrop-blur-sm transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E5FF]" style={{ animation: 'blink 2s cubic-bezier(.4,0,.6,1) infinite' }} />
          </span>
          <span className="text-[11px] font-bold tracking-[0.25em] text-white/60 uppercase">Global Intelligence Terminal</span>
        </div>

        {/* Hero Title */}
        <div
          className="w-full text-center px-4 flex flex-col justify-center overflow-visible mb-6"
          style={{ minHeight: '1.2em', contain: 'layout' }}
        >
          <h1
            className={`font-black tracking-tight leading-[1.15] transition-all duration-1000 delay-100 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ fontSynthesis: 'none', textRendering: 'optimizeLegibility' }}
          >
            <span
              className="block text-white"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', willChange: 'transform, opacity' }}
            >
              Uncover the Truth
            </span>

            <span
              className="block pb-2"
              style={{ fontSize: 'clamp(3.5rem, 9.5vw, 6.5rem)', position: 'relative', display: 'block' }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute', inset: 0, display: 'block',
                  color: '#00E5FF', fontSize: 'inherit', fontWeight: 'inherit',
                  lineHeight: 'inherit', letterSpacing: 'inherit',
                  userSelect: 'none', pointerEvents: 'none',
                }}
              >
                Break Down Scammers.
              </span>
              <span
                style={{
                  position: 'relative', display: 'block',
                  backgroundImage: 'linear-gradient(90deg, #00E5FF 0%, #2DD4BF 20%, #007AFF 45%, #00E5FF 65%, #2DD4BF 82%, #007AFF 100%)',
                  backgroundSize: '300% 100%',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent', color: 'transparent',
                  animation: 'gradientSweep 4s linear infinite',
                  transform: 'translate3d(0, 0, 0)', willChange: 'background-position',
                }}
              >
                Break Down Scammers.
              </span>
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className={`text-gray-400 text-base sm:text-lg md:text-xl text-center max-w-2xl mt-4 mb-10 leading-relaxed font-medium transition-all duration-700 delay-200 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          The most sophisticated OSINT ecosystem ever engineered.
          Analyze digital footprints with absolute precision.
        </p>

        {/* Buttons */}
        <div className={`flex flex-wrap gap-4 justify-center mb-16 transition-all duration-700 delay-300 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button onClick={onRegisterClick} className="group relative px-8 sm:px-10 py-3 sm:py-4 bg-white text-black font-bold text-base sm:text-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-105">
            <span className="relative z-10">Start Investigation</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          <button onClick={onServicesClick} className="px-8 sm:px-10 py-3 sm:py-4 bg-white/[0.03] text-white font-bold text-base sm:text-lg rounded-2xl border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300 hover:scale-105">
            See Capabilities
          </button>
        </div>

        {/* ── DASHBOARD SCREENSHOT — full width, centered ───────────────── */}
        <div
          className={`w-full transition-all duration-1000 delay-400 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div
            className="w-full rounded-2xl overflow-hidden"
            style={{
              boxShadow: '0 0 0 1px rgba(0,229,255,0.15), 0 0 80px rgba(0,229,255,0.10), 0 40px 100px rgba(0,0,0,0.7)',
            }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-black border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 mx-3 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center px-3 gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00E5FF]/40" style={{ animation: 'blink 2s ease-in-out infinite' }} />
                <span className="text-[10px] font-mono text-white/25 tracking-wide">app.weekeyosint.com/dashboard</span>
              </div>
              <div className="flex gap-2">
                {['SCAN', 'LIVE'].map((t, i) => (
                  <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded border tracking-widest"
                    style={{ color: i === 1 ? '#00E5FF' : 'rgba(255,255,255,0.25)', borderColor: i === 1 ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.08)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Screenshot */}
            <img
              src={dashboardScreenshot}
              alt="WeekeyOsint Dashboard"
              className="w-full block"
              style={{ display: 'block', userSelect: 'none', pointerEvents: 'none' }}
            />

            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-black border-t border-white/[0.06]">
              <div className="flex items-center gap-4">
                {statusPills.map((pill, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    {pill.pulse && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pill.color, animation: 'blink 1.8s ease-in-out infinite', animationDelay: `${i * 0.3}s` }} />
                    )}
                    <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{pill.label}</span>
                    <span className="text-[9px] font-mono font-bold" style={{ color: pill.color }}>{pill.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-white/20">SESSION</span>
                <span className="text-[9px] font-mono text-[#00E5FF]/50" style={{ animation: 'blink 3s ease-in-out infinite' }}>ENCRYPTED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom rule */}
        <div className="flex items-center gap-4 mt-10 w-full">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent" />
          <span className="text-[10px] font-mono tracking-[0.3em] text-[#00E5FF]/35 uppercase whitespace-nowrap">Intelligence Network</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent" />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full mt-10">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`group transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${600 + i * 100}ms` }}
            >
              <div className="bg-black rounded-2xl p-5 h-full transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/10 hover:border-[#00E5FF]/30">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}05)`, border: `1px solid ${feature.color}30` }}>
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

      <style>{`
        @keyframes gradientSweep {
          0%   { background-position: 0%   50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </section>
  );
});

HomeSection.displayName = 'HomeSection';
export default HomeSection;