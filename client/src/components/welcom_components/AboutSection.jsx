import { forwardRef, useState, useEffect, useRef } from 'react';

const AnimatedNumber = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(value.toString().replace(/[^0-9]/g, ''));
    if (start === end) return;
    
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{value.toString().replace(/[0-9]/g, '')}</span>;
};

const AboutSection = forwardRef((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={(node) => {
        sectionRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }} 
      id="about" 
      className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black"
    >
      {/* Simplified background - removed heavy gradients */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#00E5FF]/5 blur-[150px]" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto z-10">
        <div className="text-center mb-16 sm:mb-24">
          <div 
            className={`inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
            }`}
          >
            <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">Operational Reach</span>
          </div>
          <h2 
            className={`text-3xl sm:text-5xl md:text-7xl font-black text-white mb-6 sm:mb-8 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Built for <span className="bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] bg-clip-text text-transparent">The Global Era</span>
          </h2>
          <p 
            className={`text-gray-400 text-base sm:text-xl max-w-2xl mx-auto font-medium transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Protecting organizations with planetary-scale data intelligence.
          </p>
        </div>

        {/* Stats Grid - Simplified cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-24">
          {[
            { value: '50K+', label: 'Active Operators' },
            { value: '100%', label: 'Infrastructure Uptime' },
            { value: '24/7', label: 'Tactical Support' },
            { value: '100+', label: 'Sovereign States' }
          ].map((stat, i) => (
            <div 
              key={i} 
              className={`group bg-gradient-to-br from-white/[0.02] to-transparent rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center border border-white/10 transition-all duration-500 hover:border-[#00E5FF]/30 hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${300 + i * 100}ms` }}
            >
              <div className={`text-3xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] bg-clip-text text-transparent mb-2 sm:mb-3`}>
                <AnimatedNumber value={stat.value} />
              </div>
              <div className="text-white/40 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Showcase - Simplified */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {[
            { 
              title: 'Autonomous ML Analysis', 
              desc: 'Neural architectures that map digital footprints and predict threat vectors without human intervention.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            },
            { 
              title: 'Unified Data Fabric', 
              desc: 'Real-time ingestion of multi-source intelligence across surface, deep, and dark web layers.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 1.105 3.582 2 8 2s8-.895 8-2V7M4 7c0 1.105 3.582 2 8 2s8-.895 8-2M4 7c0-1.105 3.582-2 8-2s8 .895 8 2m-16 5c0 1.105 3.582 2 8 2s8-.895 8-2" />
            },
            { 
              title: 'Forensic Reporting', 
              desc: 'Instant, court-admissible documentation with high-fidelity visual relationship mapping.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            },
            { 
              title: 'Zero-Knowledge Ops', 
              desc: 'End-to-end encrypted investigation environments ensuring complete operational anonymity.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            }
          ].map((feature, i) => (
            <div 
              key={i} 
              className={`group bg-gradient-to-br from-white/[0.02] to-transparent rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col items-start text-left border border-white/10 transition-all duration-500 hover:border-[#00E5FF]/30 hover:scale-[1.02] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${500 + i * 100}ms` }}
            >
              <div className="mb-5 sm:mb-8 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00E5FF] group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-xl sm:text-3xl font-black text-white mb-3 sm:mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-lg font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';
export default AboutSection;