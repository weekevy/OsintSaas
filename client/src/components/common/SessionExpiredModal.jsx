import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SessionExpiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (isOpen) {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1));
      }, 1000);

      const timer = setTimeout(() => {
        onClose();
        navigate('/');
      }, 3000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isOpen, onClose, navigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-6 right-6 z-[100000] w-full max-w-[320px] animate-slideIn">
      <div className="relative overflow-hidden rounded-2xl border border-[#f87171]/20 bg-[#090c0e]/95 p-5 shadow-[0_8px_32px_rgba(248,113,113,0.15)] backdrop-blur-xl">
        {/* Background Subtle Red Glow */}
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-[#f87171]/10 blur-2xl" />
        
        {/* Corner Brackets (Red Stylized) */}
        <div className="absolute top-3 left-3 h-3 w-3 border-l border-t border-[#f87171]/40 rounded-tl-md" />
        <div className="absolute top-3 right-3 h-3 w-3 border-r border-t border-[#f87171]/40 rounded-tr-md" />
        <div className="absolute bottom-3 left-3 h-3 w-3 border-l border-b border-[#f87171]/40 rounded-bl-md" />
        <div className="absolute bottom-3 right-3 h-3 w-3 border-r border-b border-[#f87171]/40 rounded-br-md" />

        <div className="flex items-start gap-4">
          {/* Warning Icon */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#f87171]/30 bg-[#f87171]/10">
            <svg className="h-5 w-5 text-[#f87171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="font-['Plus_Jakarta_Sans',_sans-serif] text-sm font-extrabold uppercase tracking-wider text-[#f87171]">
              Session Expired
            </h3>
            <p className="mt-1 font-['Inter',_sans-serif] text-[11px] font-medium leading-relaxed text-white/60">
              Inactivity detected. Redirecting to welcome page in <span className="font-bold text-white">{countdown}s</span>...
            </p>
          </div>
          
          <button 
            onClick={onClose} 
            className="text-white/20 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress Bar (Red) */}
        <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-[#f87171] to-[#ef4444]" style={{
          width: '100%',
          animation: 'notification-progress 3s linear forwards'
        }} />
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes notification-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-slideIn { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default SessionExpiredModal;