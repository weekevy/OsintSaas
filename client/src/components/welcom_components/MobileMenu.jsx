const MobileMenu = ({ 
  isOpen, 
  navItems, 
  location, 
  onNavClick, 
  onLoginClick, 
  onRegisterClick,
  onClose 
}) => {
  return (
    <>
      {/* Backdrop - Tactical */}
      <div 
        className={`fixed inset-0 bg-[#080b0d]/95 backdrop-blur-sm z-40 md:hidden transition-all duration-300
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Menu Panel - Tactical */}
      <div 
        className={`fixed top-0 right-0 h-screen w-72 bg-[#090c0e] border-l border-white/10 z-40 md:hidden transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-[#00ff88]/30" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-[#00ff88]/30" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-[#00ff88]/30" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-[#00ff88]/30" />
        
        <div className="flex flex-col h-full pt-20 px-5">
          {/* Navigation Items - Tactical Style */}
          <div className="flex flex-col gap-3 mb-10">
            {navItems.map((item, index) => (
              <button
                key={item.name}
                onClick={() => onNavClick(item)}
                className={`relative text-left text-sm font-mono uppercase tracking-[0.08em] transition-all duration-300 py-2
                  ${location.pathname === item.path 
                    ? 'text-[#00ff88] translate-x-2' 
                    : 'text-white/40 hover:text-[#00ff88] hover:translate-x-2'
                  }
                `}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {item.name}
                {location.pathname === item.path && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-1 bg-[#00ff88] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Action Buttons - Tactical Style */}
          <div className="flex flex-col gap-3 mt-auto mb-8">
            <button
              onClick={onLoginClick}
              className="w-full px-5 py-2.5 text-white/60 hover:text-[#00ff88] font-mono text-[10px] uppercase tracking-[0.08em] transition-all duration-300 text-center border border-white/10 hover:border-[#00ff88]/50" 
            >
              Log in
            </button>
            <button
              onClick={onRegisterClick}
              className="w-full px-5 py-2.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] font-mono text-[10px] uppercase tracking-[0.08em] hover:bg-[#00ff88]/20 transition-all duration-300"
            >
              Get Started
            </button>
          </div>
          
          {/* Scanline effect at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/20 to-transparent" />
        </div>
      </div>
    </>
  );
};

export default MobileMenu;