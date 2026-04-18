import { useState } from 'react';

const TeamSettings = () => {
  const [settings, setSettings] = useState({
    teamName: 'OSINT OPERATIONS',
    teamEmail: 'team@osintweekeyv.com',
    defaultRole: 'analyst',
    allowGuestAccess: false,
    require2FA: true,
    sessionTimeout: '30',
    notificationPreferences: {
      email: true,
      slack: false,
      webhook: true
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="space-y-5">
      {/* General Settings */}
      <div className="bg-[#090c0e] border border-white/10 p-5 relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
        
        <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] mb-4">GENERAL SETTINGS</h3>
        
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-white/40 text-[8px] font-mono uppercase tracking-[0.12em] mb-1">
                TEAM NAME
              </label>
              <input
                type="text"
                name="teamName"
                value={settings.teamName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0d1114] border border-white/10 text-white text-[10px] font-mono focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-white/40 text-[8px] font-mono uppercase tracking-[0.12em] mb-1">
                TEAM EMAIL
              </label>
              <input
                type="email"
                name="teamEmail"
                value={settings.teamEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0d1114] border border-white/10 text-white text-[10px] font-mono focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/40 text-[8px] font-mono uppercase tracking-[0.12em] mb-1">
              DEFAULT MEMBER ROLE
            </label>
            <select
              name="defaultRole"
              value={settings.defaultRole}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#0d1114] border border-white/10 text-white text-[10px] font-mono uppercase tracking-[0.08em] focus:outline-none focus:border-[#00ff88]/50 transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300ff88'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '0.75rem'
              }}
            >
              <option value="admin" className="bg-[#0d1114]">ADMIN</option>
              <option value="analyst" className="bg-[#0d1114]">ANALYST</option>
              <option value="investigator" className="bg-[#0d1114]">INVESTIGATOR</option>
              <option value="viewer" className="bg-[#0d1114]">VIEWER</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-[#090c0e] border border-white/10 p-5 relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
        
        <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] mb-4">SECURITY</h3>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between p-2 cursor-pointer border border-transparent hover:border-[#00ff88]/20 transition-all">
            <div>
              <span className="text-white text-[9px] font-mono uppercase tracking-[0.08em]">REQUIRE TWO-FACTOR AUTHENTICATION</span>
              <p className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em] mt-0.5">TEAM MEMBERS MUST ENABLE 2FA TO ACCESS THE PLATFORM</p>
            </div>
            <input
              type="checkbox"
              name="require2FA"
              checked={settings.require2FA}
              onChange={handleChange}
              className="w-3.5 h-3.5 border border-white/20 bg-transparent text-[#00ff88] focus:ring-0 focus:ring-offset-0"
            />
          </label>

          <div>
            <label className="block text-white/40 text-[8px] font-mono uppercase tracking-[0.12em] mb-1">
              SESSION TIMEOUT (MINUTES)
            </label>
            <select
              name="sessionTimeout"
              value={settings.sessionTimeout}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#0d1114] border border-white/10 text-white text-[10px] font-mono uppercase tracking-[0.08em] focus:outline-none focus:border-[#00ff88]/50 transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300ff88'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '0.75rem'
              }}
            >
              <option value="15" className="bg-[#0d1114]">15 MINUTES</option>
              <option value="30" className="bg-[#0d1114]">30 MINUTES</option>
              <option value="60" className="bg-[#0d1114]">1 HOUR</option>
              <option value="120" className="bg-[#0d1114]">2 HOURS</option>
              <option value="240" className="bg-[#0d1114]">4 HOURS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#090c0e] border border-white/10 p-5 relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
        
        <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] mb-4">NOTIFICATION PREFERENCES</h3>
        
        <div className="space-y-2">
          <label className="flex items-center justify-between p-2 cursor-pointer border border-transparent hover:border-[#00ff88]/20 transition-all">
            <div>
              <span className="text-white text-[9px] font-mono uppercase tracking-[0.08em]">EMAIL NOTIFICATIONS</span>
              <p className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em] mt-0.5">RECEIVE TEAM ACTIVITY UPDATES VIA EMAIL</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationPreferences.email}
              onChange={() => setSettings({
                ...settings,
                notificationPreferences: {
                  ...settings.notificationPreferences,
                  email: !settings.notificationPreferences.email
                }
              })}
              className="w-3.5 h-3.5 border border-white/20 bg-transparent text-[#00ff88] focus:ring-0 focus:ring-offset-0"
            />
          </label>

          <label className="flex items-center justify-between p-2 cursor-pointer border border-transparent hover:border-[#00ff88]/20 transition-all">
            <div>
              <span className="text-white text-[9px] font-mono uppercase tracking-[0.08em]">SLACK INTEGRATION</span>
              <p className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em] mt-0.5">SEND NOTIFICATIONS TO SLACK CHANNEL</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationPreferences.slack}
              onChange={() => setSettings({
                ...settings,
                notificationPreferences: {
                  ...settings.notificationPreferences,
                  slack: !settings.notificationPreferences.slack
                }
              })}
              className="w-3.5 h-3.5 border border-white/20 bg-transparent text-[#00ff88] focus:ring-0 focus:ring-offset-0"
            />
          </label>

          <label className="flex items-center justify-between p-2 cursor-pointer border border-transparent hover:border-[#00ff88]/20 transition-all">
            <div>
              <span className="text-white text-[9px] font-mono uppercase tracking-[0.08em]">WEBHOOK</span>
              <p className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em] mt-0.5">SEND WEBHOOK NOTIFICATIONS</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationPreferences.webhook}
              onChange={() => setSettings({
                ...settings,
                notificationPreferences: {
                  ...settings.notificationPreferences,
                  webhook: !settings.notificationPreferences.webhook
                }
              })}
              className="w-3.5 h-3.5 border border-white/20 bg-transparent text-[#00ff88] focus:ring-0 focus:ring-offset-0"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#090c0e] border border-[#f87171]/30 p-5 relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#f87171]/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#f87171]/30" />
        
        <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] mb-4 text-[#f87171]">DANGER ZONE</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 border border-transparent hover:border-[#f87171]/20 transition-all">
            <div>
              <span className="text-white text-[9px] font-mono uppercase tracking-[0.08em]">TRANSFER OWNERSHIP</span>
              <p className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em] mt-0.5">TRANSFER TEAM OWNERSHIP TO ANOTHER MEMBER</p>
            </div>
            <button className="px-3 py-1 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-[8px] font-mono uppercase tracking-[0.08em]">
              TRANSFER
            </button>
          </div>

          <div className="flex items-center justify-between p-2 border border-transparent hover:border-[#f87171]/20 transition-all">
            <div>
              <span className="text-white text-[9px] font-mono uppercase tracking-[0.08em]">DELETE TEAM</span>
              <p className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em] mt-0.5">PERMANENTLY DELETE TEAM AND ALL ASSOCIATED DATA</p>
            </div>
            <button className="px-3 py-1 border border-[#f87171]/30 text-[#f87171] hover:bg-[#f87171]/10 transition-all text-[8px] font-mono uppercase tracking-[0.08em]">
              DELETE TEAM
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-[9px] font-mono uppercase tracking-[0.08em]">
          CANCEL
        </button>
        <button className="px-5 py-2 border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-[9px] font-mono uppercase tracking-[0.08em]">
          SAVE CHANGES
        </button>
      </div>
    </div>
  );
};

export default TeamSettings;