import { forwardRef, useState, useEffect, useRef } from 'react';

// Counter component for animated numbers - Tactical version
const AnimatedNumber = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const end = parseInt(value.toString().replace(/[^0-9]/g, ''));
    const suffix = value.toString().replace(/[0-9]/g, '');
    
    if (start === end) return;

    const incrementTime = duration / end;
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [isVisible, value, duration]);

  return <span ref={elementRef}>{count}{value.toString().replace(/[0-9]/g, '')}</span>;
};

const AboutSection = forwardRef((props, ref) => {
  // Unique icons for each stat
  const getStatIcon = (type) => {
    const color = '#00ff88';
    switch(type) {
      case 'users':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2">
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'uptime':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3v1M5 5l1 1M19 5l-1 1" strokeLinecap="round"/>
          </svg>
        );
      case 'support':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2">
            <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.7 9.7 0 01-2.726-.378l-3.905 1.714.944-3.443A7.466 7.466 0 015.055 15.5C3.78 14.137 3 12.167 3 10c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'countries':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2">
            <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  // Unique icons for each feature
  const getFeatureIcon = (type) => {
    const color = '#00ff88';
    switch(type) {
      case 'ai':
        return (
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'database':
        return (
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2">
            <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375 7.444 2.25 12 2.25s8.25 1.847 8.25 4.125zm0 0v11.25m0 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'reports':
        return (
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'team':
        return (
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section ref={ref} id="about" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#080b0d]">
      <div className="relative w-full max-w-6xl mx-auto">
        {/* Section Header - Tactical */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-6 h-[1px] bg-[#00ff88]" />
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#00ff88] uppercase">Why Choose Us</span>
            <span className="w-6 h-[1px] bg-[#00ff88]" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Built for <span className="text-[#00ff88]">Investigators</span>
          </h2>
          <p className="text-white/40 text-sm font-mono max-w-2xl mx-auto">Professional-grade tools that make complex investigations simple and accessible</p>
        </div>

        {/* Stats Grid - Tactical Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { value: '50K+', label: 'Active Users', icon: 'users' },
            { value: '99.9%', label: 'Uptime', icon: 'uptime' },
            { value: '24/7', label: 'Support', icon: 'support' },
            { value: '100+', label: 'Countries', icon: 'countries' }
          ].map((stat, i) => (
            <div key={i} className="group relative bg-[#090c0e] border border-white/10 hover:border-[#00ff88]/30 transition-all duration-300 p-4 text-center">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#00ff88]/0 group-hover:bg-[#00ff88]/50 transition-all duration-300" />
              <div className="opacity-70 group-hover:opacity-100 transition-opacity mb-2">{getStatIcon(stat.icon)}</div>
              <div className="text-2xl md:text-3xl font-bold text-[#00ff88] font-mono mb-1">
                <AnimatedNumber value={stat.value} duration={2000} />
              </div>
              <div className="text-white/40 text-[9px] font-mono uppercase tracking-[0.08em]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Showcase - Tactical Cards with unique icons */}
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: 'AI-POWERED ANALYSIS', desc: 'Machine learning algorithms that detect patterns and anomalies in real-time', icon: 'ai' },
            { title: 'GLOBAL DATABASE', desc: 'Access to billions of records from trusted sources worldwide', icon: 'database' },
            { title: 'ADVANCED REPORTING', desc: 'Generate comprehensive reports with actionable insights', icon: 'reports' },
            { title: 'TEAM COLLABORATION', desc: 'Work together seamlessly with your investigation team', icon: 'team' }
          ].map((feature, i) => (
            <div key={i} className="group relative bg-[#090c0e] border border-white/10 hover:border-[#00ff88]/30 transition-all duration-300 p-5">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#00ff88]/0 group-hover:bg-[#00ff88]/50 transition-all duration-300" />
              <div className="opacity-70 group-hover:opacity-100 transition-opacity mb-3">{getFeatureIcon(feature.icon)}</div>
              <h3 className="font-display text-base font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-white/40 text-xs font-mono leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
        
        {/* Bottom accent line */}
        <div className="mt-12 flex justify-center">
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/50 to-transparent" />
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';
export default AboutSection;