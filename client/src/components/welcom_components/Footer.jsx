import { useState } from 'react';
import LegalModal from './LegalModal';

const Footer = () => {
  const [modalContent, setModalContent] = useState(null);

  return (
    <>
      <footer className="relative py-32 px-4 sm:px-6 lg:px-8 bg-black overflow-hidden">
        {/* Gradient overlay to mask the seam between sections */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10" />
        
        <div 
          className="relative w-full max-w-7xl mx-auto z-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                  
                <span className="text-white font-black tracking-tight text-2xl">Weekey<span className="text-[#00E5FF]">Osint</span></span>
              </div>
              <p className="text-gray-500 max-w-sm text-lg leading-relaxed font-medium">
                The world's most advanced intelligence ecosystem. 
                Built for the next generation of digital investigators.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-black mb-8 text-xs uppercase tracking-[0.2em]">Core Platform</h4>
              <ul className="space-y-5">
                <li><button className="text-gray-500 hover:text-[#00E5FF] transition-all text-sm font-bold">Investigation Modules</button></li>
                <li><button className="text-gray-500 hover:text-[#00E5FF] transition-all text-sm font-bold">API Terminal</button></li>
                <li><button className="text-gray-500 hover:text-[#00E5FF] transition-all text-sm font-bold">Enterprise Access</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black mb-8 text-xs uppercase tracking-[0.2em]">Directives</h4>
              <ul className="space-y-5">
                <li><button onClick={() => setModalContent('privacy')} className="text-gray-500 hover:text-[#00E5FF] transition-all text-sm font-bold text-left">Privacy Protocol</button></li>
                <li><button onClick={() => setModalContent('terms')} className="text-gray-500 hover:text-[#00E5FF] transition-all text-sm font-bold text-left">Operational Terms</button></li>
                <li><button onClick={() => setModalContent('contact')} className="text-gray-500 hover:text-[#00E5FF] transition-all text-sm font-bold text-left">Contact Command</button></li>
              </ul>
            </div>
          </div>

          <div 
            className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6"
          >
            <div className="text-gray-600 text-[11px] font-black uppercase tracking-[0.3em]">
              © 2026 WeekeyOsint intelligence services. all rights reserved.
            </div>
            <div className="flex gap-6">
              {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
                <button key={social} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition-all group">
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5 bg-current rounded-md opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
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