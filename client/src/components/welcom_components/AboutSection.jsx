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
  return (
    <section ref={ref} id="about" className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="relative w-full max-w-7xl mx-auto z-10">
        <div className="text-center mb-24">
          <div 
            className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10"
          >
            <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">Operational Reach</span>
          </div>
          <h2 
            className="text-5xl md:text-7xl font-black text-white mb-8"
          >
            Built for <span className="text-gradient-cyan text-wave">The Global Era</span>
          </h2>
          <p 
            className="text-gray-400 text-xl max-w-2xl mx-auto font-medium"
          >
            Protecting organizations with planetary-scale data intelligence.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {[
            { value: '50K+', label: 'Active Operators' },
            { value: '90.9%', label: 'Infrastructure Uptime' },
            { value: '24/7', label: 'Tactical Support' },
            { value: '100+', label: 'Sovereign States' }
          ].map((stat, i) => (
            <div 
              key={i} 
              className="group relative glass-card p-10 rounded-[2.5rem] text-center overflow-hidden border-white/5 hover:border-wave"
            >
              <div className="border-beam" />
              <div className={`text-5xl md:text-6xl font-black text-wave mb-3`}>
                <AnimatedNumber value={stat.value} />
              </div>
              <div className="text-white/40 text-[11px] font-black uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Showcase */}
        <div className="grid md:grid-cols-2 gap-8">
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
              className="group relative glass-card p-10 rounded-[3rem] flex flex-col items-start text-left border-white/5 hover:border-wave"
            >
              <div className="border-beam" />
              <div className="mb-8 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-wave group-hover:scale-110 transition-all">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-lg font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';
export default AboutSection;