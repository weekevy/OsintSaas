import React, { useEffect, useRef } from 'react';

const BaseModal = ({ 
  isOpen, 
  onClose, 
  title, 
  description,
  children,
  onSave,
  saving = false,
  saveButtonText = "START INVESTIGATION",
  cancelButtonText = "CANCEL",
  showRevert = false,
  onRevert = null
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
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

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div ref={modalRef} className="relative w-full max-w-5xl md:max-w-6xl bg-[#090c0e] border border-white/10 shadow-2xl shadow-[#00ff88]/10 overflow-hidden my-8 mx-auto animate-slideUp">
        
        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-[#00ff88]/40" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-[#00ff88]/40" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-[#00ff88]/40" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-[#00ff88]/40" />
        
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/40 to-transparent" />
        
        {/* Header */}
        <div className="relative sticky top-0 z-10 bg-[#090c0e]">
          <div className="relative px-6 py-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-[#00ff88]/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-display text-xl md:text-2xl font-bold text-white uppercase tracking-[-0.02em]">{title}</h2>
                  <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.08em] mt-0.5 max-w-2xl">{description}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-white/40 hover:text-[#00ff88] transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin">
          {children}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 border-t border-white/10 bg-[#080b0d]/90 flex justify-end gap-3">
          {showRevert && onRevert && (
            <button 
              onClick={onRevert} 
              disabled={saving}
              className="px-5 py-2 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-[10px] font-mono uppercase tracking-[0.08em] disabled:opacity-50"
            >
              REVERT
            </button>
          )}
          <button 
            onClick={onClose} 
            disabled={saving}
            className="px-5 py-2 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-[10px] font-mono uppercase tracking-[0.08em] disabled:opacity-50"
          >
            {cancelButtonText}
          </button>
          <button 
            onClick={onSave} 
            disabled={saving}
            className="px-6 py-2 border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-[10px] font-mono uppercase tracking-[0.08em] font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3 h-3 border-2 border-[#00ff88]/30 border-t-[#00ff88] rounded-full animate-spin" />
                SAVING...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {saveButtonText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaseModal;