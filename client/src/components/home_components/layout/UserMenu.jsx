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
      {/* User Menu Button - Tactical Style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 pr-3 border border-white/10 hover:border-[#00ff88]/50 transition-all duration-300"
      >
        {/* Avatar - Tactical square instead of circle */}
        <div className="w-7 h-7 border border-[#00ff88]/30 flex items-center justify-center">
          <span className="text-[#00ff88] font-mono text-xs font-bold uppercase tracking-[0.08em]">
            {userInitial}
          </span>
        </div>
        <span className="hidden lg:block text-white/70 text-[10px] font-mono uppercase tracking-[0.08em] max-w-[100px] truncate">
          {user?.firstName || user?.email?.split('@')[0]}
        </span>
        <svg 
          className={`w-3 h-3 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - Tactical Style */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9997]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-[#090c0e] border border-white/10 shadow-2xl shadow-[#00ff88]/10 z-[10000] overflow-hidden">
            
            {/* Corner brackets */}
            <div className="absolute top-1 left-1 w-4 h-4 border-t border-l border-[#00ff88]/30" />
            <div className="absolute top-1 right-1 w-4 h-4 border-t border-r border-[#00ff88]/30" />
            <div className="absolute bottom-1 left-1 w-4 h-4 border-b border-l border-[#00ff88]/30" />
            <div className="absolute bottom-1 right-1 w-4 h-4 border-b border-r border-[#00ff88]/30" />
            
            {/* User Info Section */}
            <div className="p-4 border-b border-white/10">
              <p className="text-white font-mono text-xs font-bold uppercase tracking-[0.08em]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-white/40 text-[9px] font-mono uppercase tracking-[0.08em] mt-0.5 truncate">
                {user?.email}
              </p>
              <div className="mt-2 inline-block">
                <span className="text-[#00ff88] text-[8px] font-mono uppercase tracking-[0.12em] border border-[#00ff88]/30 px-2 py-0.5">
                  {user?.role || 'USER'}
                </span>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="p-2">
              {/* Settings Button */}
              <button
                onClick={openSettings}
                className="w-full px-3 py-2 text-left text-white/50 hover:text-[#00ff88] hover:bg-white/5 transition-all flex items-center gap-2 group"
              >
                <svg className="w-3.5 h-3.5 text-white/30 group-hover:text-[#00ff88] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[10px] font-mono uppercase tracking-[0.08em]">Settings</span>
              </button>

              {/* Divider */}
              <div className="border-t border-white/10 my-2" />
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left text-white/50 hover:text-[#f87171] hover:bg-[#f87171]/10 transition-all flex items-center gap-2 group"
              >
                <svg className="w-3.5 h-3.5 text-white/30 group-hover:text-[#f87171] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-[10px] font-mono uppercase tracking-[0.08em]">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;