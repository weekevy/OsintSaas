import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserMenu = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    onLogout?.();
    navigate('/');
  };

  const openSettings = () => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('openSettings'));
  };

  // Get user initial
  const userInitial = user?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="relative z-[9999]" ref={menuRef}>
      {/* User Menu Button - Glass-morphism style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00E5FF]/50 hover:bg-white/[0.05] transition-all duration-300 group"
      >
        {/* Avatar - Rounded with cyan glow */}
        <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#00E5FF]/20 to-[#2DD4BF]/20 border border-[#00E5FF]/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <span className="text-[#00E5FF] font-bold text-xs uppercase tracking-wider">
            {userInitial}
          </span>
        </div>
        <span className="hidden lg:block text-white/70 text-xs font-medium max-w-[100px] truncate">
          {user?.firstName || user?.email?.split('@')[0]}
        </span>
        <svg 
          className={`w-3 h-3 text-white/40 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - Glass-morphism style */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9997]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 glass-card rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] border border-white/10 z-[10000] overflow-hidden animate-scaleUp">
            
            {/* Animated border beam */}
            <div className="border-beam opacity-30" />
            
            {/* User Info Section */}
            <div className="p-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#00E5FF]/20 to-[#2DD4BF]/20 border border-[#00E5FF]/30 flex items-center justify-center">
                  <span className="text-[#00E5FF] font-bold text-base uppercase">
                    {userInitial}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-white/40 text-xs truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="inline-flex">
                <span className="text-[#00E5FF] text-[9px] font-bold uppercase tracking-wider bg-[#00E5FF]/10 px-2 py-1 rounded-md border border-[#00E5FF]/20">
                  {user?.role || 'OPERATOR'}
                </span>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="p-2">
              {/* Settings Button */}
              <button
                onClick={openSettings}
                className="w-full px-3 py-2.5 rounded-xl text-left text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 flex items-center gap-3 group"
              >
                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#00E5FF]/10 transition-colors">
                  <svg className="w-3.5 h-3.5 text-white/40 group-hover:text-[#00E5FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Settings</span>
              </button>

              {/* Divider */}
              <div className="border-t border-white/10 my-2" />
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2.5 rounded-xl text-left text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 flex items-center gap-3 group"
              >
                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                  <svg className="w-3.5 h-3.5 text-white/40 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-scaleUp {
          animation: scaleUp 0.2s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
        }
        
        .glass-card {
          background: linear-gradient(135deg, rgba(10, 10, 10, 0.95), rgba(5, 5, 5, 0.98));
          backdrop-filter: blur(10px);
        }
        
        .border-beam {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.1), transparent);
          animation: beam 3s infinite;
          pointer-events: none;
        }
        
        @keyframes beam {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default UserMenu;