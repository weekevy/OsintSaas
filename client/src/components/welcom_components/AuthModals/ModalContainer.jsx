const ModalContainer = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* Backdrop with smooth fade */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal with buttery smooth spring physics */}
      <div 
        className="relative w-full max-w-md glass-card rounded-[2.5rem] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.6)] border border-white/10"
      >
        {/* Animated border beam */}
        <div className="border-beam opacity-30" />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Content with fade-in delay */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalContainer;