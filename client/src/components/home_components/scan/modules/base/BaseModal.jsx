import React, { useEffect } from 'react';

const BaseModal = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  onSave, 
  saving = false,
  saveButtonText = "Save Changes",
  showRevert = false,
  onRevert,
  // maxWidth = "max-w-3xl"  // Wider modal
  maxWidth = "max-w-6xl"  // 1152px
}) => {
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

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80">
      <div className={`relative w-full ${maxWidth} max-h-[85vh] border border-white/10 rounded-2xl bg-[#0a0a0a] overflow-hidden`}>
        
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Poppins'] text-xl font-bold text-white">{title}</h2>
              {description && (
                <p className="font-['Poppins'] text-[11px] text-white/40 uppercase tracking-[0.1em] mt-1">{description}</p>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-150"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)] custom-scroll">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-black/20 flex justify-end gap-3">
          {showRevert && onRevert && (
            <button
              onClick={onRevert}
              disabled={saving}
              className="px-4 py-2 border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-white/20 transition-colors duration-150 text-[11px] font-['Poppins'] uppercase tracking-[0.08em] disabled:opacity-50"
            >
              Revert
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-white/20 transition-colors duration-150 text-[11px] font-['Poppins'] uppercase tracking-[0.08em]"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-xl hover:opacity-90 transition-all duration-150 text-[11px] font-['Poppins'] uppercase tracking-[0.08em] disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              saveButtonText
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 229, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 229, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default BaseModal;