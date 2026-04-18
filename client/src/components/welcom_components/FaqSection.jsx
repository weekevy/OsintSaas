import { forwardRef, useState } from 'react';

const FaqSection = forwardRef(({ onRegisterClick }, ref) => {
  const [openIndex, setOpenIndex] = useState(null);
  
  const faqs = [
    { q: 'What is OSINT?', a: 'OSINT (Open Source Intelligence) is intelligence collected from publicly available sources. Our platform automates and enhances this process for professional investigations.' },
    { q: 'Is it legal?', a: 'Yes, OSINT uses only publicly available information and is completely legal. We encourage responsible use in compliance with all laws.' },
    { q: 'Do I need technical skills?', a: 'Not at all! Our platform is designed for everyone, from beginners to professionals. We provide guides and support to help you get started.' },
    { q: 'How accurate are the results?', a: 'We combine multiple data sources and AI algorithms to ensure high accuracy, achieving a 99%+ success rate in verifications.' },
    { q: 'Can I try it first?', a: 'Absolutely! Sign up for a free trial with full access to all features. No credit card required.' }
  ];

  return (
    <section ref={ref} id="faq" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#080b0d]">
      <div className="relative w-full max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-6 h-[1px] bg-[#00ff88]" />
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#00ff88] uppercase">FAQ</span>
            <span className="w-6 h-[1px] bg-[#00ff88]" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Got <span className="text-[#00ff88]">Questions?</span>
          </h2>
          <p className="text-white/40 text-sm font-mono">We've got answers</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-[#090c0e] border border-white/10 hover:border-[#00ff88]/30 transition-all duration-300">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center justify-between w-full p-4 text-left"
              >
                <h3 className="text-white font-mono text-sm font-medium">{faq.q}</h3>
                <svg className={`w-4 h-4 text-[#00ff88]/60 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4">
                  <p className="text-white/50 text-xs font-mono leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA at the end - Tactical Style */}
        <div className="mt-12 text-center p-8 bg-[#090c0e] border border-white/10">
          <h3 className="font-display text-xl font-bold text-white mb-2">Ready to get started?</h3>
          <p className="text-white/40 text-xs font-mono mb-6">Join thousands of investigators using our platform</p>
          <button
            onClick={onRegisterClick}
            className="px-6 py-3 bg-[#00ff88]/10 border border-[#00ff88]/40 text-[#00ff88] font-mono text-xs uppercase tracking-[0.08em] hover:bg-[#00ff88]/20 transition-all duration-300"
          >
            Start Free Trial
          </button>
        </div>
      </div>
    </section>
  );
});

FaqSection.displayName = 'FaqSection';
export default FaqSection;