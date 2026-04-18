import { useState } from 'react';
import logoImage from '../../assets/images/logo6.png';

const Navbar = ({ location, navItems, hasAnimated, onNavClick, onLoginClick, onRegisterClick, onMenuToggle }) => {
  return (
    <nav className={`w-full flex justify-between items-center p-3 px-4 sm:px-6 lg:px-8 bg-[#080b0d]/90 backdrop-blur-md fixed top-0 left-0 z-50 border-b border-white/10 transition-all duration-500 font-mono ${hasAnimated ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <button onClick={() => onNavClick(navItems[0])} className="flex items-center gap-2 group relative">
        <div className="relative w-7 h-7 md:w-8 md:h-8 overflow-hidden">
          <div className="absolute inset-0 blur-lg bg-[#00ff88] opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
        </div>
        <h1 className="text-white font-display font-bold text-lg md:text-xl tracking-tight relative">Weekey<span className="text-[#00ff88]">Osint</span></h1>
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-[#00ff88]/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-[#00ff88]/40 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      <div className="hidden lg:flex items-center gap-6 lg:gap-8">
        {navItems.map((item) => (
          <button key={item.name} onClick={() => onNavClick(item)} className={`relative text-xs uppercase tracking-[0.08em] font-mono font-medium transition-colors duration-300 ${location.pathname === item.path ? 'text-[#00ff88]' : 'text-white/50 hover:text-white'}`}>
            {item.name}
            <span className={`absolute -bottom-2 left-0 h-[1px] bg-[#00ff88] transition-all duration-300 ${location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
          </button>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-3">
        <button onClick={onLoginClick} className="px-5 py-2 text-white/60 hover:text-white font-mono text-xs uppercase tracking-[0.08em] transition-all duration-300 border border-white/10 hover:border-[#00ff88]/30 hover:text-[#00ff88]">Log in</button>
        <button onClick={onRegisterClick} className="px-5 py-2 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] font-mono text-xs uppercase tracking-[0.08em] hover:bg-[#00ff88]/20 transition-all duration-300">Get Started</button>
      </div>

      <button onClick={onMenuToggle} className="lg:hidden relative z-50 w-8 h-8 flex flex-col items-center justify-center gap-1.5 group">
        <span className="w-5 h-[1px] bg-[#00ff88] transition-all duration-300" />
        <span className="w-5 h-[1px] bg-[#00ff88] transition-all duration-300" />
        <span className="w-5 h-[1px] bg-[#00ff88] transition-all duration-300" />
      </button>
    </nav>
  );
};

export default Navbar;