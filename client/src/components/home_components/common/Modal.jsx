import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
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

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  const modalContent = (
    <>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[10000000] animate-fade-in"
        onClick={onClose}
      />
      
      <div 
        className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 z-[10000001] overflow-y-auto"
        onClick={onClose}
      >
        <div 
          className={`w-full ${sizeClasses[size]} bg-gradient-to-b from-gray-900 to-black rounded-xl sm:rounded-2xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden animate-scale-in`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
