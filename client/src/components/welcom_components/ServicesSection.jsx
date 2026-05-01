import { forwardRef } from 'react';

const ServicesSection = forwardRef((props, ref) => {
  const services = [
    { 
      title: 'Email Intelligence', 
      tag: 'EMAIL', 
      desc: 'Trace email origins, breach history, and linked digital identities across 500+ sources.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: '#00E5FF'
    },
    { 
      title: 'Social Media OSINT', 
      tag: 'SOCIAL', 
      desc: 'Map social graphs and uncover hidden profiles using advanced cross-platform correlation.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: '#007AFF'
    },
    { 
      title: 'Domain Research', 
      tag: 'DOMAIN', 
      desc: 'Deep-dive into WHOIS, DNS history, and sub-domain enumeration for infrastructural analysis.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      color: '#2DD4BF'
    },
    { 
      title: 'Phone Lookup', 
      tag: 'PHONE', 
      desc: 'Global carrier identification and reputation scoring to detect VOIP and burner numbers.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      color: '#00E5FF'
    },
    { 
      title: 'Crypto Analytics', 
      tag: 'CRYPTO', 
      desc: 'Trace blockchain transactions and identify wallet clusters across major protocols.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: '#007AFF'
    },
    { 
      title: 'Dark Web Monitoring', 
      tag: 'DARKWEB', 
      desc: 'Proactive monitoring of underground forums and marketplaces for leaked credentials.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      color: '#2DD4BF'
    }
  ];

  return (
    <section ref={ref} id="services" className="relative py-40 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black">
      
      {/* Subtle background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[50vh] bg-[#00E5FF]/3 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="relative w-full max-w-7xl mx-auto z-10">
        
        {/* Header */}
        <div className="text-center mb-24">
          <div 
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="bg-[#00E5FF] absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"></span>
              <span className="bg-[#00E5FF] relative inline-flex rounded-full h-2 w-2"></span>
            </span>
            <span className="text-[11px] font-black tracking-widest text-white/60 uppercase">Capabilities</span>
          </div>
          
          <h2 
            className="text-5xl md:text-7xl font-black text-white mb-8"
          >
            Surgical <span className="text-wave">Precision</span>
          </h2>
          
          <p 
            className="text-gray-400 text-xl max-w-2xl mx-auto font-medium"
          >
            Targeted intelligence gathering across every digital vector.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div 
              key={i}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-[#0a0a0a] border border-white/8 hover:border-[#00E5FF]/30 rounded-[2.5rem] p-8 transition-all duration-300 h-full">
                
                {/* Icon */}
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${service.color}15, ${service.color}05)`,
                    border: `1px solid ${service.color}30`,
                    color: service.color
                  }}
                >
                  {service.icon}
                </div>
                
                {/* Tag */}
                <div className="mb-3">
                  <span 
                    className="text-[10px] font-black tracking-[0.2em] uppercase px-2 py-1 rounded-lg"
                    style={{ 
                      background: `${service.color}10`,
                      color: service.color,
                      border: `1px solid ${service.color}25`
                    }}
                  >
                    {service.tag}
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-black text-white mb-3 tracking-tight group-hover:text-[#00E5FF] transition-colors duration-300">
                  {service.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                  {service.desc}
                </p>
                
                {/* Action */}
                <div className="flex items-center gap-2 text-xs font-black text-white/30 group-hover:text-[#00E5FF] transition-all duration-300 uppercase tracking-widest">
                  Explore Module 
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                
                {/* Corner accent on hover */}
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#00E5FF]/0 group-hover:border-[#00E5FF]/30 rounded-tr-xl transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

ServicesSection.displayName = 'ServicesSection';
export default ServicesSection;