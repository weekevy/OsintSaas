import { useEffect, useRef } from 'react';

const LegalModal = ({ isOpen, content, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getContent = () => {
    switch(content) {
      case 'privacy':
        return { title: 'Privacy Policy', content: `Last Updated: February 2026\n\nPrivacy Policy content here...` };
      case 'terms':
        return { title: 'Terms of Service', content: `Last Updated: February 2026\n\nTerms of Service content here...` };
      case 'contact':
        return {
          title: 'Contact',
          contacts: [
            { category: 'Support', email: 'support@osintweekeyv.com', desc: 'General inquiries' },
            { category: 'Security', email: 'security@osintweekeyv.com', desc: 'Report vulnerabilities' },
            { category: 'Legal', email: 'legal@osintweekeyv.com', desc: 'Legal matters' }
          ]
        };
      default: return { title: 'Info', content: 'Content not found' };
    }
  };

  const data = getContent();

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div ref={modalRef} className="relative w-full max-w-lg bg-[#090c0e] border border-white/10 shadow-2xl shadow-[#00ff88]/10" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#00ff88]/40" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#00ff88]/40" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-[#00ff88]/40" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#00ff88]/40" />
        
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="font-display text-xl font-bold text-white">{data.title}</h2>
          <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {content === 'contact' ? (
            <div className="space-y-3">
              {data.contacts.map((contact, i) => (
                <div key={i} className="p-4 bg-[#0d1114] border border-white/10 hover:border-[#00ff88]/30 transition-all duration-300">
                  <h3 className="font-display text-sm font-bold text-white mb-1">{contact.category}</h3>
                  <p className="text-white/40 text-[10px] font-mono mb-2">{contact.desc}</p>
                  <a href={`mailto:${contact.email}`} className="text-[#00ff88] text-xs font-mono hover:opacity-80 transition-opacity">{contact.email}</a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-sm font-mono leading-relaxed whitespace-pre-line">{data.content}</p>
          )}
        </div>
        
        <div className="flex justify-end p-4 border-t border-white/10">
          <button onClick={onClose} className="px-5 py-2 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] font-mono text-[10px] uppercase tracking-[0.08em] hover:bg-[#00ff88]/20 transition-all duration-300">Close</button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;