import { useState } from 'react';
import logoImage from '../../assets/images/logo6.png';



const Navbar = ({ location, navItems, hasAnimated, onNavClick, onLoginClick, onRegisterClick, onMenuToggle }) => {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
      <div className={`glass-nav px-6 py-3 rounded-2xl flex items-center justify-between transition-all duration-700 ${hasAnimated ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}>
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavClick(navItems[0])}>
          <span className="text-white font-bold tracking-tight text-[22px]
          group-hover:text-[#00E5FF] transition-colors"><span className='text-[#00E5FF]'>Weeky</span>Osint</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => onNavClick(item)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                location.pathname === item.path 
                ? 'text-[#00E5FF] bg-[#00E5FF]/10' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onLoginClick}
            className="hidden sm:block text-gray-400 hover:text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={onRegisterClick}
            className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          >
            Get Started
          </button>
          
          <button 
            onClick={onMenuToggle}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;