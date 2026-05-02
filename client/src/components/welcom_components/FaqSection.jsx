import { forwardRef, useState } from 'react';

const FaqSection = forwardRef(({ onRegisterClick }, ref) => {
  const [openIndex, setOpenIndex] = useState(null);
  
  const faqs = [
    { q: 'What is OSINT?', a: 'OSINT (Open Source Intelligence) is intelligence collected from publicly available sources. Our platform automates and enhances this process for professional investigations using AI-driven correlation.' },
    { q: 'Is it legal?', a: 'Yes, OSINT uses only publicly available information and is completely legal. We encourage responsible use in compliance with all local and international data protection laws.' },
    { q: 'Do I need technical skills?', a: 'Not at all. While our platform is enterprise-grade, we\'ve designed the interface to be intuitive. If you can use a search engine, you can use OsintSaas.' },
    { q: 'How accurate are the results?', a: 'We combine 1,000+ data sources with neural pattern matching to ensure high accuracy, achieving a 99%+ success rate in identity verifications.' },
    { q: 'Can I try it first?', a: 'Absolutely. Sign up for a free trial to explore our capabilities. No credit card is required for the initial investigation phase.' }
  ];

  return (
    <section ref={ref} id="faq" className="relative py-24 sm:py-40 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black">
      <div className="relative w-full max-w-4xl mx-auto z-10">
        <div className="text-center mb-16 sm:mb-24">
          <div 
            className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10"
          >
            <span className="text-[11px] font-black tracking-widest text-white/50 uppercase">Knowledge Base</span>
          </div>
          <h2 
            className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 sm:mb-8"
          >
            Common <span className="bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] bg-clip-text text-transparent">Inquiries</span>
          </h2>
        </div>

        <div className="space-y-4 sm:space-y-6 mb-20 sm:mb-32">
          {faqs.map((faq, i) => (
            <div 
              key={i}
              className="group relative bg-[#0a0a0a] rounded-2xl sm:rounded-[2rem] overflow-hidden transition-colors duration-300 border border-white/5 md:hover:border-[#00E5FF]/20"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center justify-between w-full p-5 sm:p-8 text-left outline-none"
              >
                <h3 className={`font-black text-base sm:text-xl tracking-tight pr-4 transition-colors duration-300 ${openIndex === i ? 'text-[#00E5FF]' : 'text-white'}`}>{faq.q}</h3>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${openIndex === i ? 'rotate-180 bg-[#00E5FF]/20 text-[#00E5FF]' : 'text-white/40'}`}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div 
                className={`px-5 sm:px-8 transition-all duration-300 ease-in-out overflow-hidden ${openIndex === i ? 'max-h-[500px] pb-5 sm:pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="text-gray-400 text-sm sm:text-lg leading-relaxed border-t border-white/5 pt-4 sm:pt-6 font-medium">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Card - removed wave and pulse effects */}
        <div 
          className="relative bg-gradient-to-br from-[#0a0a0a] to-[#050505] p-8 sm:p-16 rounded-3xl sm:rounded-[4rem] text-center border border-white/10"
        >
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">Ready to uncover the truth?</h3>
          <p className="text-gray-400 text-base sm:text-xl mb-8 sm:mb-10 max-w-xl mx-auto font-medium">Join our elite network of investigators and initiate your first deep-search operation today.</p>
          <button
            onClick={onRegisterClick}
            className="px-8 sm:px-12 py-3 sm:py-5 bg-white text-black font-black text-base sm:text-lg rounded-2xl sm:rounded-[1.5rem] hover:bg-gray-100 transition-all duration-200 shadow-lg"
          >
            Begin Free Investigation
          </button>
        </div>
      </div>
    </section>
  );
});

FaqSection.displayName = 'FaqSection';
export default FaqSection;