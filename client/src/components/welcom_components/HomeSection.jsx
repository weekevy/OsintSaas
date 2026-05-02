import { forwardRef, useEffect, useState } from 'react';

const HomeSection = forwardRef(({ onRegisterClick, onServicesClick }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { setIsVisible(true); }, []);

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

  const tags = [
    { label: 'IP TRACED',  sub: '104.21.x.x', top: '6%',  left: '2%',   delay: '0s',   color: '#00E5FF' },
    { label: 'IDENTITY',   sub: 'LINKED',      top: '20%', right: '2%',  delay: '0.5s', color: '#2DD4BF' },
    { label: 'DARKWEB',    sub: 'HIT ×3',      top: '60%', left: '0%',   delay: '1.0s', color: '#00E5FF' },
    { label: 'CRYPTO TX',  sub: 'FLAGGED',     top: '72%', right: '1%',  delay: '1.5s', color: '#2DD4BF' },
    { label: 'BREACH DB',  sub: 'MATCH',       top: '4%',  right: '14%', delay: '0.3s', color: '#00E5FF' },
    { label: 'SOCIAL',     sub: 'UNMASKED',    top: '84%', left: '14%',  delay: '0.8s', color: '#2DD4BF' },
  ];

  const leftFeed = [
    { time: '00:00:01', event: 'Surface scan initiated',  type: 'info'  },
    { time: '00:00:03', event: 'IP cluster identified',   type: 'warn'  },
    { time: '00:00:05', event: 'Dark web index hit',      type: 'alert' },
    { time: '00:00:08', event: 'Identity node resolved',  type: 'info'  },
    { time: '00:00:11', event: 'Crypto wallet flagged',   type: 'alert' },
    { time: '00:00:14', event: 'Social profile mapped',   type: 'info'  },
    { time: '00:00:17', event: 'Breach record matched',   type: 'warn'  },
    { time: '00:00:20', event: 'Geo-fence correlation',   type: 'info'  },
    { time: '00:00:23', event: 'OSINT layer complete',    type: 'info'  },
    { time: '00:00:26', event: 'Target profile built',    type: 'alert' },
  ];

  const rightFeed = [
    { key: 'SURFACE_IDX',  val: '99.2%',   label: 'Coverage' },
    { key: 'DARK_WEB',     val: '3 hits',  label: 'Results'  },
    { key: 'LATENCY',      val: '38ms',    label: 'Response' },
    { key: 'THREAT_LVL',   val: 'HIGH',    label: 'Risk'     },
    { key: 'IDENTITY',     val: 'LINKED',  label: 'Status'   },
    { key: 'CRYPTO_TXN',   val: '7 found', label: 'Matches'  },
    { key: 'BREACH_DB',    val: '2 hits',  label: 'Records'  },
    { key: 'SOCIAL_NODES', val: '14',      label: 'Mapped'   },
    { key: 'ENCRYPTION',   val: 'AES-256', label: 'Active'   },
    { key: 'API_CALLS',    val: '1,204',   label: 'Requests' },
  ];

  const typeColor = { info: '#2DD4BF', warn: '#00E5FF', alert: '#ff6b6b' };
  const leftDouble  = [...leftFeed,  ...leftFeed];
  const rightDouble = [...rightFeed, ...rightFeed];

  // Right panel — capability pillars shown beside the orb on xl
  const capabilities = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          <path d="M11 8v6M8 11h6"/>
        </svg>
      ),
      title: 'Surface & Deep Web',
      desc: 'Continuously indexes billions of open-source data points across the visible and hidden web in real time.',
      accent: '#00E5FF',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      title: 'Identity Resolution',
      desc: 'Links fragmented digital identities across platforms, wallets, and breach databases into a single unified profile.',
      accent: '#2DD4BF',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
      title: 'Zero-Knowledge Ops',
      desc: 'Military-grade encrypted enclaves ensure your investigations leave zero forensic trace on any external system.',
      accent: '#00E5FF',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      title: 'Live Threat Scoring',
      desc: 'Every target receives a continuously updated risk score derived from cross-source behavioral pattern analysis.',
      accent: '#2DD4BF',
    },
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
        <div className="w-full text-center px-4">
          <h1 className={`font-black tracking-tight leading-[1.02] transition-all duration-700 delay-100 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <span
              className="block bg-gradient-to-r from-[#00E5FF] via-[#2DD4BF] to-[#007AFF] bg-clip-text text-transparent"
              style={{ fontSize: 'clamp(3.3rem, 9.5vw, 6.5rem)' }}
            >
              Break Down Scammers.
            </span>
            <span
              className="block text-white mt-1"
              style={{ fontSize: 'clamp(2rem, 8vw, 5.5rem)' }}
            >
              Uncover the Truth
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

        {/* ── SIGNAL BROADCAST ZONE ─────────────────────────────────────── */}
        <div className={`relative w-full transition-all duration-1000 delay-400 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Top rule */}
          <div className="flex items-center gap-4 mb-8 w-full max-w-3xl mx-auto xl:mx-0 xl:max-w-full">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#00E5FF]/35 uppercase whitespace-nowrap">Live Signal Broadcast</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent" />
          </div>

          {/* ── xl: side-by-side  |  below xl: stacked centered ── */}
          <div className="flex flex-col xl:flex-row xl:items-center xl:gap-10">

            {/* ════════════════════════════════
                LEFT — orb + flanking feeds
            ════════════════════════════════ */}
            <div className="flex items-center justify-center xl:justify-start gap-5 xl:gap-6 xl:flex-shrink-0">

              {/* Threat feed (lg+) */}
              <div className="hidden lg:flex flex-col" style={{ width: '160px', height: '310px' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" style={{ animation: 'blink 1.8s ease-in-out infinite' }} />
                  <span className="text-[9px] font-mono tracking-[0.2em] text-[#2DD4BF]/50 uppercase">Threat Feed</span>
                </div>
                <div className="relative flex-1 overflow-hidden" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
                  <div style={{ animation: 'scrollUp 18s linear infinite', willChange: 'transform' }}>
                    {leftDouble.map((row, i) => (
                      <div key={i} className="flex items-start gap-2 py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <span className="text-[8px] font-mono shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{row.time}</span>
                        <span className="text-[9px] font-mono leading-tight" style={{ color: typeColor[row.type] + 'BB' }}>{row.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center orb */}
              <div className="relative flex items-center justify-center shrink-0 scale-75 sm:scale-100 transition-transform duration-700" style={{ width: '310px', height: '310px' }}>
                {tags.map((t, i) => (
                  <div key={i} className="absolute flex flex-col items-start px-2.5 py-1.5 rounded-lg pointer-events-none"
                    style={{
                      top: t.top, left: t.left, right: t.right,
                      border: `0.5px solid ${t.color}22`,
                      background: 'rgba(0,0,0,0.55)',
                      animation: 'tagFloat 3.2s ease-in-out infinite',
                      animationDelay: t.delay,
                      willChange: 'transform',
                    }}>
                    <span className="text-[8px] font-mono tracking-widest" style={{ color: `${t.color}80` }}>{t.label}</span>
                    <span className="text-[10px] font-bold text-white/65">{t.sub}</span>
                  </div>
                ))}
                <div className="absolute flex items-center justify-center" style={{ width: '120px', height: '120px' }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} className={`absolute rounded-full ${i > 1 ? 'hidden sm:block' : ''}`} style={{
                      width: `${120 + i * 50}px`, height: `${120 + i * 50}px`,
                      border: `0.5px solid ${i % 2 === 0 ? 'rgba(0,229,255,0.22)' : 'rgba(45,212,191,0.14)'}`,
                      animation: 'ringPulse 3.2s ease-out infinite',
                      animationDelay: `${i * 0.65}s`,
                      willChange: 'transform, opacity',
                    }} />
                  ))}
                  <div className="absolute rounded-full" style={{ width: '86px', height: '86px', border: '0.5px solid rgba(0,229,255,0.30)' }} />
                  <div className="absolute rounded-full" style={{ width: '64px', height: '64px', background: 'radial-gradient(circle, rgba(0,229,255,0.10) 0%, transparent 70%)' }} />
                  <div className="relative z-10 flex items-center justify-center rounded-full"
                    style={{ width: '44px', height: '44px', border: '0.5px solid rgba(0,229,255,0.38)', background: 'rgba(0,229,255,0.04)', animation: 'corePulse 2.4s ease-in-out infinite', willChange: 'box-shadow' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.75 }}>
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M6.3 6.3a8 8 0 0 0 0 11.4"/><path d="M17.7 6.3a8 8 0 0 1 0 11.4"/>
                      <path d="M3.5 3.5a14 14 0 0 0 0 17"/><path d="M20.5 3.5a14 14 0 0 1 0 17"/>
                    </svg>
                  </div>
                </div>
                <div className="absolute left-0 right-0 pointer-events-none" style={{
                  top: '50%', height: '1px',
                  background: 'linear-gradient(to right, transparent, rgba(0,229,255,0.12), rgba(0,229,255,0.30), rgba(0,229,255,0.12), transparent)',
                  animation: 'scanLine 2.8s ease-in-out infinite',
                  willChange: 'opacity, transform',
                }} />
              </div>

              {/* Data stream feed (lg+) */}
              <div className="hidden lg:flex flex-col" style={{ width: '160px', height: '310px' }}>
                <div className="flex items-center gap-2 mb-3 justify-end">
                  <span className="text-[9px] font-mono tracking-[0.2em] text-[#00E5FF]/50 uppercase">Data Stream</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" style={{ animation: 'blink 2.2s ease-in-out infinite' }} />
                </div>
                <div className="relative flex-1 overflow-hidden" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
                  <div style={{ animation: 'scrollUp 22s linear infinite', willChange: 'transform' }}>
                    {rightDouble.map((row, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <span className="text-[9px] font-mono" style={{ color: 'rgba(0,229,255,0.35)' }}>{row.key}</span>
                        <div className="flex flex-col items-end ml-2">
                          <span className="text-[10px] font-bold text-white/60 leading-tight">{row.val}</span>
                          <span className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>{row.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>{/* end left orb group */}

            {/* ════════════════════════════════
                RIGHT — capability panel (xl only)
            ════════════════════════════════ */}
            <div className="hidden xl:flex flex-col flex-1 min-w-0 pl-4">

              {/* Section eyebrow */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-[#00E5FF]/20 to-transparent" />
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#00E5FF]/40 uppercase whitespace-nowrap">What We Expose</span>
              </div>

              {/* Big ghost word — purely decorative typography */}
              <div className="relative mb-4 select-none pointer-events-none overflow-hidden" style={{ height: '64px' }}>
                <span
                  className="absolute left-0 top-0 font-black tracking-tighter leading-none whitespace-nowrap bg-gradient-to-r from-[#00E5FF]/8 to-transparent bg-clip-text text-transparent"
                  style={{ fontSize: '72px' }}
                >
                  OSINT
                </span>
              </div>

              {/* Capability rows */}
              <div className="flex flex-col gap-4">
                {capabilities.map((c, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                    style={{ transitionDelay: `${500 + i * 80}ms` }}
                  >
                    {/* Icon pill */}
                    <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                      style={{ background: `${c.accent}0D`, border: `0.5px solid ${c.accent}28` }}>
                      {c.icon}
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white font-bold text-sm">{c.title}</span>
                        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${c.accent}30, transparent)` }} />
                      </div>
                      <p className="text-[11px] text-white/35 leading-relaxed">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom stat row */}
              <div className="flex items-center gap-6 mt-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {[
                  { v: '18,340', l: 'Active Targets'  },
                  { v: '2,500+', l: 'Data Sources'    },
                  { v: '42ms',   l: 'Avg Latency'     },
                  { v: '180+',   l: 'Countries'       },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <span className="text-base font-black text-white">{s.v}</span>
                    <span className="text-[9px] font-mono text-white/25 tracking-wider uppercase">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>{/* end right panel */}

          </div>{/* end xl side-by-side */}

          {/* Stats strip — visible below xl only */}
          <div className="flex xl:hidden items-center gap-6 sm:gap-10 mt-8 justify-center">
            {[
              { label: 'Targets Tracked', value: '18,340' },
              { label: 'Data Sources',    value: '2,500+' },
              { label: 'Avg. Latency',    value: '42ms'   },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-lg font-black text-white tracking-tight">{s.value}</span>
                <span className="text-[10px] font-mono text-white/25 tracking-wider uppercase">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Bottom rule */}
          <div className="flex items-center gap-4 mt-8 w-full max-w-3xl mx-auto xl:mx-0 xl:max-w-full">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#00E5FF]/35 uppercase whitespace-nowrap">Intelligence Network</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent" />
          </div>

        </div>{/* end broadcast zone */}

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full mt-16">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`group transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${600 + i * 100}ms` }}
            >
              <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] rounded-2xl p-5 h-full transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/10 hover:border-[#00E5FF]/30">
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
        @keyframes ringPulse {
          0%   { opacity: 0;   transform: scale(0.88) translate3d(0,0,0); }
          25%  { opacity: 1; }
          100% { opacity: 0;   transform: scale(1.12) translate3d(0,0,0); }
        }
        @keyframes corePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,229,255,0); transform: translate3d(0,0,0); }
          50%       { box-shadow: 0 0 14px 3px rgba(0,229,255,0.13); transform: translate3d(0,0,0); }
        }
        @keyframes tagFloat {
          0%, 100% { transform: translateY(0px) translate3d(0,0,0);  opacity: 0.65; }
          50%       { transform: translateY(-6px) translate3d(0,0,0); opacity: 1; }
        }
        @keyframes scanLine {
          0%, 100% { opacity: 0.35; transform: scaleX(0.55) translate3d(0,0,0); }
          50%       { opacity: 1;   transform: scaleX(1) translate3d(0,0,0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes scrollUp {
          0%   { transform: translateY(0) translate3d(0,0,0); }
          100% { transform: translateY(-50%) translate3d(0,0,0); }
        }
      `}</style>
    </section>
  );
});

HomeSection.displayName = 'HomeSection';
export default HomeSection;