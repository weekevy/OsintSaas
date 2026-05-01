const MobileMenu = ({ 
  isOpen, 
  navItems, 
  location, 
  onNavClick, 
  onLoginClick, 
  onRegisterClick,
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] md:hidden"
        onClick={onClose}
      />

      {/* Menu Panel - Border removed */}
      <div 
        className="fixed top-0 right-0 h-screen w-80 bg-black/95 backdrop-blur-2xl z-[70] md:hidden shadow-2xl"
      >
        <div className="flex flex-col h-full p-8 pt-24">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col gap-6">
            {navItems.map((item, index) => (
              <button
                key={item.name}
                onClick={() => onNavClick(item)}
                className={`text-left text-2xl font-bold tracking-tight transition-all
                  ${location.pathname === item.path 
                    ? 'text-[#00E5FF]' 
                    : 'text-white/40 hover:text-white'
                  }
                `}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="mt-auto space-y-4">
            <button
              onClick={onLoginClick}
              className="w-full py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={onRegisterClick}
              className="w-full py-4 bg-[#00E5FF] text-black font-bold rounded-2xl hover:bg-[#00D4EB] transition-all"
            >
              Get Started
            </button>
            <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest mt-8">
              Weekey<span className="text-[#00E5FF]">Osint</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;