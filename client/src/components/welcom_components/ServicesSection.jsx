import { forwardRef } from 'react';

const ServicesSection = forwardRef((props, ref) => {
  const services = [
    { title: 'EMAIL INTELLIGENCE', tag: 'EMAIL', features: ['Data breach check', 'Account discovery', 'Reputation analysis'] },
    { title: 'SOCIAL MEDIA OSINT', tag: 'SOCIAL', features: ['Profile analysis', 'Network mapping', 'Content tracking'] },
    { title: 'DOMAIN RESEARCH', tag: 'DOMAIN', features: ['WHOIS lookup', 'DNS analysis', 'SSL verification'] },
    { title: 'PHONE LOOKUP', tag: 'PHONE', features: ['Carrier info', 'Location data', 'Spam detection'] },
    { title: 'BUSINESS INTEL', tag: 'BUSINESS', features: ['Company records', 'Executive info', 'Financial data'] },
    { title: 'THREAT DETECTION', tag: 'THREAT', features: ['Risk scoring', 'Pattern recognition', 'Real-time alerts'] }
  ];

  const getIcon = (type) => {
    const color = '#00ff88';
    switch(type) {
      case 'email':
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2">
            <path d="M21.75 6.75V17.25C21.75 17.6478 21.592 18.0294 21.3107 18.3107C21.0294 18.592 20.6478 18.75 20.25 18.75H3.75C3.35218 18.75 2.97064 18.592 2.68934 18.3107C2.40804 18.0294 2.25 17.6478 2.25 17.25V6.75M21.75 6.75C21.75 6.35218 21.592 5.97064 21.3107 5.68934C21.0294 5.40804 20.6478 5.25 20.25 5.25H3.75C3.35218 5.25 2.97064 5.40804 2.68934 5.68934C2.40804 5.97064 2.25 6.35218 2.25 6.75M21.75 6.75L12 13.5L2.25 6.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'social':
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2">
            <path d="M7.5 8.25H9M7.5 12H9M15 8.25H16.5M15 12H16.5M8.25 15.75L12 12.75L15.75 15.75M16.5 20.25H7.5C6.90326 20.25 6.33097 20.0129 5.90901 19.591C5.48705 19.169 5.25 18.5967 5.25 18V6C5.25 5.40326 5.48705 4.83097 5.90901 4.40901C6.33097 3.98705 6.90326 3.75 7.5 3.75H16.5C17.0967 3.75 17.669 3.98705 18.091 4.40901C18.5129 4.83097 18.75 5.40326 18.75 6V18C18.75 18.5967 18.5129 19.169 18.091 19.591C17.669 20.0129 17.0967 20.25 16.5 20.25Z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2">
            <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <section ref={ref} id="services" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#080b0d]">
      <div className="relative w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-6 h-[1px] bg-[#00ff88]" />
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#00ff88] uppercase">Service Modules</span>
            <span className="w-6 h-[1px] bg-[#00ff88]" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Investigation <span className="text-[#00ff88]">Capabilities</span>
          </h2>
          <p className="text-white/40 text-sm font-mono max-w-2xl mx-auto">Enterprise-grade OSINT tools for comprehensive threat intelligence</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, i) => (
            <div key={i} className="group relative bg-[#090c0e] border border-white/10 hover:border-[#00ff88]/40 transition-all duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#00ff88]/0 group-hover:bg-[#00ff88]/50 transition-all duration-300" />
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[6px] border-r-[6px] border-t-[#00ff88]/20 border-r-transparent" />
              <div className="p-5">
                <div className="mb-4 opacity-70 group-hover:opacity-100 transition-opacity">{getIcon(service.tag.toLowerCase())}</div>
                <h3 className="font-display text-base font-bold text-white mb-1">{service.title}</h3>
                <div className="inline-block mb-3"><span className="text-[8px] font-mono tracking-[0.12em] text-[#00ff88]/60 uppercase bg-[#00ff88]/5 px-2 py-0.5 border border-[#00ff88]/20">{service.tag}</span></div>
                <ul className="space-y-1.5 mb-4">
                  {service.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-white/50 text-xs font-mono">
                      <span className="w-1 h-1 bg-[#00ff88]/60 rounded-full" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="text-[9px] font-mono uppercase tracking-[0.08em] text-white/40 hover:text-[#00ff88] transition-colors flex items-center gap-1 group/btn">
                  Explore <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/50 to-transparent" />
        </div>
      </div>
    </section>
  );
});

ServicesSection.displayName = 'ServicesSection';
export default ServicesSection;