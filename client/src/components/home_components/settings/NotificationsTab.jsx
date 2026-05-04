import { useState } from 'react';

const NotificationsTab = ({ isLoading, setIsLoading }) => {
  const [settings, setSettings] = useState({
    emailAlerts: true,
    emailFrequency: 'instant',
    pushNotifications: true,
    scanComplete: true,
    threatDetected: true,
    weeklyReport: true,
    marketingEmails: false,
    slackWebhook: '',
    discordWebhook: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        console.log('Settings saved');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-['Poppins']">
      <button type="submit" id="save-settings" className="hidden" />

      {/* Email Notifications */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-[#00E5FF]/15 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-white font-['Poppins'] text-sm font-semibold">Email Notifications</h3>
        </div>
        
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-white text-[13px] font-['Poppins']">Email Alerts</p>
            <p className="text-white/40 text-[10px] font-['Poppins']">Receive alerts via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="emailAlerts"
              checked={settings.emailAlerts}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#00E5FF] peer-checked:to-[#2DD4BF]"></div>
          </label>
        </div>

        {settings.emailAlerts && (
          <div className="mt-2 pt-2">
            <label className="block text-white/50 text-[10px] font-['Poppins'] font-semibold uppercase tracking-wider mb-1.5">Email Frequency</label>
            <select
              name="emailFrequency"
              value={settings.emailFrequency}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-['Poppins'] focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            >
              <option value="instant">Instant</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
            </select>
          </div>
        )}
      </div>

      {/* Push Notifications */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-[#00E5FF]/15 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 21a1 1 0 100-2 1 1 0 000 2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-['Poppins'] text-sm font-semibold">Push Notifications</h3>
            <p className="text-white/40 text-[10px] font-['Poppins']">In-app notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="pushNotifications"
              checked={settings.pushNotifications}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#00E5FF] peer-checked:to-[#2DD4BF]"></div>
          </label>
        </div>

        {settings.pushNotifications && (
          <div className="space-y-2 ml-8">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-[12px] font-['Poppins']">Scan Complete</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="scanComplete"
                  checked={settings.scanComplete}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#00E5FF]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/70 text-[12px] font-['Poppins']">Threat Detected</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="threatDetected"
                  checked={settings.threatDetected}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#00E5FF]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/70 text-[12px] font-['Poppins']">Weekly Report</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="weeklyReport"
                  checked={settings.weeklyReport}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#00E5FF]"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Integrations */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-[#00E5FF]/15 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-white font-['Poppins'] text-sm font-semibold">Integrations</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-white/50 text-[10px] font-['Poppins'] font-semibold uppercase tracking-wider mb-1.5">Slack Webhook URL</label>
            <input
              type="url"
              name="slackWebhook"
              value={settings.slackWebhook}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-['Poppins'] placeholder-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>

          <div>
            <label className="block text-white/50 text-[10px] font-['Poppins'] font-semibold uppercase tracking-wider mb-1.5">Discord Webhook URL</label>
            <input
              type="url"
              name="discordWebhook"
              value={settings.discordWebhook}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-['Poppins'] placeholder-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>
        </div>
      </div>

      {/* Marketing Preferences */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-white text-[13px] font-['Poppins']">Marketing Emails</p>
            <p className="text-white/40 text-[10px] font-['Poppins']">Receive updates about new features</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="marketingEmails"
              checked={settings.marketingEmails}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#00E5FF] peer-checked:to-[#2DD4BF]"></div>
          </label>
        </div>
      </div>
    </form>
  );
};

export default NotificationsTab;