import { useEffect, useRef } from 'react';

const LegalModal = ({ isOpen, content, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getContent = () => {
    switch(content) {
      case 'privacy':
        return { 
          title: 'Privacy Policy', 
          content: `Last Updated: April 2026\n\nYour privacy is our priority. We employ industry-standard encryption and zero-knowledge architecture. This means your investigation data never leaves your secure enclave in a readable format. We do not sell or share your digital footprint with third parties.` 
        };
      case 'terms':
        return { 
          title: 'Terms of Service', 
          content: `Last Updated: April 2026\n\nBy accessing OsintSaas, you agree to use our intelligence tools for ethical, legal, and legitimate investigative purposes. Any misuse for harassment or illegal tracking is strictly prohibited and will result in immediate account termination.` 
        };
      case 'contact':
        return {
          title: 'Global Support',
          contacts: [
            { category: 'Intelligence Support', email: 'intel@osintsaas.com', desc: 'Direct line for investigative assistance.' },
            { category: 'Security Ops', email: 'secops@osintsaas.com', desc: 'Report vulnerabilities or data concerns.' },
            { category: 'General Inquiries', email: 'hello@osintsaas.com', desc: 'Partner with us or learn more.' }
          ]
        };
      default: return { title: 'Information', content: 'Data unavailable.' };
    }
  };

  const data = getContent();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div 
        ref={modalRef} 
        className="relative w-full max-w-xl glass-card rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="border-beam" />
        
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <h2 className="text-2xl font-bold text-white">{data.title}</h2>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {content === 'contact' ? (
            <div className="grid gap-4">
              {data.contacts.map((contact, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[#00E5FF]/30 transition-all group">
                  <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">{contact.category}</h3>
                  <p className="text-white font-bold mb-4">{contact.desc}</p>
                  <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 text-[#00E5FF] font-bold group-hover:gap-3 transition-all">
                    {contact.email}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">
              {data.content}
            </p>
          )}
        </div>
        
        <div className="p-8 bg-white/[0.02] flex justify-end">
          <button 
            onClick={onClose} 
            className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;