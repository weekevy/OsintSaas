import { useState } from 'react';
import LegalModal from './LegalModal';

const Footer = () => {
  const [modalContent, setModalContent] = useState(null);

  return (
    <>
      <footer className="relative py-8 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#080b0d]">
        <div className="relative w-full max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/30 text-[10px] font-mono">
              © 2026 OsintWeekeyv. All rights reserved.
            </div>
            <div className="flex gap-6">
              <button 
                onClick={() => setModalContent('privacy')}
                className="text-white/30 hover:text-[#00ff88] text-[10px] font-mono uppercase tracking-[0.08em] transition-colors duration-300"
              >
                Privacy
              </button>
              <button 
                onClick={() => setModalContent('terms')}
                className="text-white/30 hover:text-[#00ff88] text-[10px] font-mono uppercase tracking-[0.08em] transition-colors duration-300"
              >
                Terms
              </button>
              <button 
                onClick={() => setModalContent('contact')}
                className="text-white/30 hover:text-[#00ff88] text-[10px] font-mono uppercase tracking-[0.08em] transition-colors duration-300"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>

      <LegalModal 
        isOpen={modalContent !== null}
        content={modalContent}
        onClose={() => setModalContent(null)}
      />
    </>
  );
};

export default Footer;