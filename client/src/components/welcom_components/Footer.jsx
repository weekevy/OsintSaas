import { useState } from 'react';
import LegalModal from './LegalModal';

const Footer = () => {
  const [modalContent, setModalContent] = useState(null);

  return (
    <>
      <footer className="relative py-12 px-4 sm:px-6 md:px-10 lg:px-16 border-t border-white/10">
        <div className="relative w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-white/60 text-sm">
              © 2026 OsintWeekeyv. All rights reserved.
            </div>
            <div className="flex gap-6">
              <button 
                onClick={() => setModalContent('privacy')}
                className="text-white/40 hover:text-white transition-colors duration-300"
              >
                Privacy
              </button>
              <button 
                onClick={() => setModalContent('terms')}
                className="text-white/40 hover:text-white transition-colors duration-300"
              >
                Terms
              </button>
              <button 
                onClick={() => setModalContent('contact')}
                className="text-white/40 hover:text-white transition-colors duration-300"
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
