import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ProfileTab from './ProfileTab';
import SecurityTab from './SecurityTab';
import NotificationsTab from './NotificationsTab';

const AccountSettings = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);
  const { user } = useAuth();

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Modern SVG Icons with cyan/teal theme
  const getTabIcon = (tabId, isActive) => {
    const color = isActive ? '#00E5FF' : '#6B7280';
    switch(tabId) {
      case 'profile':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
            <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" 
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'security':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
            <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z" 
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'notifications':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
            <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" 
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: getTabIcon('profile', activeTab === 'profile') },
    { id: 'security', name: 'Security', icon: getTabIcon('security', activeTab === 'security') },
    { id: 'notifications', name: 'Notifications', icon: getTabIcon('notifications', activeTab === 'notifications') },
  ];

  const handleSaveClick = () => {
    const saveButton = document.getElementById('save-settings');
    if (saveButton) saveButton.click();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop - simplified */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl rounded-2xl bg-[#0a0a0a] overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Poppins']">Account Settings</h2>
              <p className="text-white/40 text-xs font-['Poppins']">Manage your profile and preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 border-b border-white/10 bg-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-lg font-['Poppins'] font-semibold transition-colors duration-150 flex items-center justify-center gap-2 text-sm
                ${activeTab === tab.id 
                  ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
            >
              <span className="text-current">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto custom-scroll">
          {activeTab === 'profile' && <ProfileTab isLoading={isLoading} setIsLoading={setIsLoading} />}
          {activeTab === 'security' && <SecurityTab isLoading={isLoading} setIsLoading={setIsLoading} />}
          {activeTab === 'notifications' && <NotificationsTab isLoading={isLoading} setIsLoading={setIsLoading} />}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-150 text-sm font-['Poppins']"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="px-5 py-2 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-lg hover:opacity-90 transition-opacity duration-150 text-sm font-['Poppins']"
          >
            Save Changes
          </button>
        </div>
      </div>

      <style>{`
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

export default AccountSettings;