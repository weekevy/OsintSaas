import { useState } from 'react';
import logoImage from '../../assets/images/logo6.png'; // Import your logo

const Navbar = ({ 
  location, 
  navItems, 
  hasAnimated, 
  onNavClick, 
  onLoginClick, 
  onRegisterClick,
  onMenuToggle 
}) => {
  return (
    <nav className={`w-full flex justify-between items-center p-4 px-6 sm:px-8 
                    bg-black/30 backdrop-blur-2xl fixed top-0 left-0 z-50
                    border-b border-white/10 shadow-lg shadow-purple-500/5
                    transition-all duration-500 ease-out
                    ${hasAnimated ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      
      {/* Logo and Brand - Clickable to home */}
      <button
        onClick={() => onNavClick(navItems[0])}
        className="flex items-center gap-3 group"
      >
        {/* Logo Image */}
        <div className="relative w-8 h-8 md:w-10 md:h-10 overflow-hidden">
          <img 
            src={logoImage} 
            alt="WeekeyOsint" 
            className="w-full h-full object-contain"
          />
          {/* Optional glow effect on hover */}
          <div className="absolute inset-0 blur-xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
        </div>
        
        {/* Brand Name */}
        <h1 className="text-white font-bold text-xl sm:text-2xl font-robot tracking-tight relative">
          <span className="relative z-10">WeekeyOsint</span>
          <div className="absolute inset-0 blur-xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
        </h1>
      </button>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6 lg:gap-10">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onNavClick(item)}
            className={`relative text-sm lg:text-base font-medium font-inter whitespace-nowrap group
              ${location.pathname === item.path 
                ? 'text-white' 
                : 'text-white/60 hover:text-white'
              }
              transition-colors duration-300
            `}
          >
            {item.name}
            <span className={`absolute -bottom-1.5 left-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full transition-all duration-300
              ${location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'}`} 
            />
          </button>
        ))}
      </div>

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex items-center gap-3">
        <button
          onClick={onLoginClick}
          className="px-5 lg:px-7 py-2.5 text-white/70 font-robot whitespace-nowrap text-sm lg:text-base 
                   hover:text-white transition-all duration-300 rounded-full hover:bg-white/5"
        >
          Log in
        </button>
        <button
          onClick={onRegisterClick}
          className="relative px-5 lg:px-7 py-2.5 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-blue-500  
              font-inter text-sm font-medium cursor-pointer rounded-full whitespace-nowrap border-0
              hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300
              before:absolute before:inset-0 before:rounded-full before:bg-white/20 before:opacity-0 
              hover:before:opacity-100 before:transition-opacity overflow-hidden group"
        >
          <span className="relative z-10">Get Started</span>
        </button>
      </div>

      {/* Hamburger Menu */}
      <button
        onClick={onMenuToggle}
        className="md:hidden relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5 group"
        aria-label="Toggle menu"
      >
        <span className="w-6 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300 ease-out origin-center group-hover:shadow-lg group-hover:shadow-purple-500/50" />
        <span className="w-6 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300 ease-out group-hover:shadow-lg group-hover:shadow-purple-500/50" />
        <span className="w-6 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300 ease-out origin-center group-hover:shadow-lg group-hover:shadow-purple-500/50" />
      </button>
    </nav>
  );
};

export default Navbar;
