import { forwardRef, useState } from 'react';

const FaqSection = forwardRef(({ onRegisterClick }, ref) => {
  const [openIndex, setOpenIndex] = useState(null);
  
  const faqs = [
    { q: 'What is OSINT?', a: 'OSINT (Open Source Intelligence) is intelligence collected from publicly available sources. Our platform automates and enhances this process for professional investigations using AI-driven correlation.' },
    { q: 'Is it legal?', a: 'Yes, OSINT uses only publicly available information and is completely legal. We encourage responsible use in compliance with all local and international data protection laws.' },
    { q: 'Do I need technical skills?', a: 'Not at all. While our platform is enterprise-grade, we’ve designed the interface to be intuitive. If you can use a search engine, you can use OsintSaas.' },
    { q: 'How accurate are the results?', a: 'We combine 1,000+ data sources with neural pattern matching to ensure high accuracy, achieving a 99%+ success rate in identity verifications.' },
    { q: 'Can I try it first?', a: 'Absolutely. Sign up for a free trial to explore our capabilities. No credit card is required for the initial investigation phase.' }
  ];

  return (
    <section ref={ref} id="faq" className="relative py-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="relative w-full max-w-4xl mx-auto z-10">
        <div className="text-center mb-24">
          <div 
            className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10"
          >
            <span className="text-[11px] font-black tracking-widest text-white/50 uppercase">Knowledge Base</span>
          </div>
          <h2 
            className="text-5xl md:text-7xl font-black text-white mb-8"
          >
            Common <span className="text-gradient-cyan text-wave">Inquiries</span>
          </h2>
        </div>

        <div className="space-y-6 mb-32">
          {faqs.map((faq, i) => (
            <div 
              key={i}
              className="group relative glass-card rounded-[2rem] overflow-hidden transition-all duration-300 border border-white/5 hover:border-wave"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center justify-between w-full p-8 text-left"
              >
                <h3 className="text-white font-black text-xl tracking-tight">{faq.q}</h3>
                <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-all duration-500 ${openIndex === i ? 'rotate-180 bg-[#00E5FF] text-black scale-110' : 'text-white/40'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {openIndex === i && (
                <div>
                  <div className="px-8 pb-8 text-gray-400 text-lg leading-relaxed border-t border-white/5 pt-6 font-medium">
                    {faq.a}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div 
          className="relative glass-card p-16 rounded-[4rem] text-center overflow-hidden shadow-2xl"
        >
          <div className="border-beam" />
          <h3 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to uncover the truth?</h3>
          <p className="text-gray-400 text-xl mb-10 max-w-xl mx-auto font-medium">Join our elite network of investigators and initiate your first deep-search operation today.</p>
          <button
            onClick={onRegisterClick}
            className="px-12 py-5 bg-white text-black font-black text-lg rounded-[1.5rem] hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Begin Free Investigation
          </button>
          
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-wave opacity-10 blur-[100px] rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
});

FaqSection.displayName = 'FaqSection';
export default FaqSection;