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

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent body scroll when menu is open on mobile
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

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    onLogout?.();
    navigate('/');
  };

  const openSettings = () => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('openSettings'));
  };

  const userInitial = user?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U';
  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User';
  const fullName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : displayName;

  return (
    <div className="relative z-[9999] font-['Poppins']" ref={menuRef}>
      {/* User Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00E5FF]/40 hover:bg-white/10 transition-colors duration-150 group"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#00E5FF]/15 to-[#2DD4BF]/15 border border-[#00E5FF]/30 flex items-center justify-center">
          <span className="text-[#00E5FF] font-bold text-xs uppercase">
            {userInitial}
          </span>
        </div>
        
        <span className="hidden lg:block text-white/70 text-xs font-medium max-w-[100px] truncate">
          {displayName}
        </span>
        
        <svg 
          className={`w-3 h-3 text-white/40 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - Mobile Responsive with Glass Background */}
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm md:hidden" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Mobile Menu - 90% width, centered, glassmorphism */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10002] w-[90%] max-w-sm md:absolute md:left-auto md:right-0 md:top-full md:translate-x-0 md:translate-y-0 md:w-72">
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden md:bg-[#0a0a0a] md:backdrop-blur-none">
              
              {/* User Info Section */}
              <div className="p-5 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-[#00E5FF]/20 to-[#2DD4BF]/20 border border-[#00E5FF]/40 flex items-center justify-center">
                    <span className="text-[#00E5FF] font-bold text-xl uppercase">
                      {userInitial}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-base truncate">
                      {fullName}
                    </p>
                    <p className="text-white/50 text-xs truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00E5FF] text-[9px] font-bold uppercase tracking-[0.15em] bg-[#00E5FF]/15 px-2.5 py-1 rounded-md border border-[#00E5FF]/25">
                    {user?.role || 'Operator'}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
                  <span className="text-white/30 text-[8px] uppercase tracking-wider">Active</span>
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="p-3">
                {/* Settings Button */}
                <button
                  onClick={openSettings}
                  className="w-full px-4 py-3 rounded-xl text-left text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-150 flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#00E5FF]/10 transition-colors duration-150">
                    <svg className="w-4 h-4 text-white/50 group-hover:text-[#00E5FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold">Settings</span>
                    <p className="text-white/30 text-[10px] mt-0.5">Manage your account</p>
                  </div>
                  <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Divider */}
                <div className="border-t border-white/10 my-3 mx-2" />
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 rounded-xl text-left text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150 flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 transition-colors duration-150">
                    <svg className="w-4 h-4 text-white/50 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold">Logout</span>
                    <p className="text-white/30 text-[10px] mt-0.5">Sign out of your account</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;