import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SessionExpiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
        navigate('/');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, navigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-[100000] animate-slide-down">
      <div className="bg-[#090c0e] border border-[#f87171]/40 p-4 shadow-2xl max-w-md">
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#f87171]/60" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#f87171]/60" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#f87171]/60" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#f87171]/60" />
        
        <div className="flex items-start gap-3 relative">
          <div className="w-10 h-10 border border-[#f87171]/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#f87171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="text-[#f87171] font-bold text-sm font-mono uppercase tracking-wider mb-1">
              SESSION EXPIRED
            </h3>
            <p className="text-white/60 text-xs font-mono">
              Your session has expired. Redirecting to login...
            </p>
          </div>
          
          <button 
            onClick={onClose} 
            className="text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes slide-down {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-slide-down { 
          animation: slide-down 0.3s ease-out; 
        }
      `}</style>
    </div>
  );
};

export default SessionExpiredModal;