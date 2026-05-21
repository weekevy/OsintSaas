import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

const ProfileTab = ({ isLoading, setIsLoading }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    title: '',
    phone: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (response.ok) {
          const userData = data.user;
          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            title: userData.title || '',
            phone: userData.phone || '',
            location: userData.location || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans py-2">
      <button type="submit" id="save-settings" className="hidden" />

      {/* Success/Error Messages */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-red-400 text-xs font-sans flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-[#00E5FF] text-xs font-sans flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            {success}
          </p>
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/10 shadow-inner">
        <div className="relative group">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00E5FF]/15 to-[#2DD4BF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-2xl font-bold text-[#00E5FF]">
            {formData.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button type="button" className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm active:scale-95">
            <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <div>
          <h3 className="text-white font-sans text-base font-semibold">Identity Profile</h3>
          <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">Operative Credentials</p>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-white/60 text-xs font-sans font-semibold ml-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-sans placeholder-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            placeholder="John"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-white/60 text-xs font-sans font-semibold ml-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-sans placeholder-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            placeholder="Doe"
          />
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-white/60 text-xs font-sans font-semibold ml-1">Primary Email (Secured)</label>
          <div className="relative group">
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg text-white/30 text-sm font-sans cursor-not-allowed"
              placeholder="john@example.com"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-white/60 text-xs font-sans font-semibold ml-1">Professional Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-sans placeholder-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            placeholder="Security Analyst"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-white/60 text-xs font-sans font-semibold ml-1">Secure Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-sans placeholder-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-white/60 text-xs font-sans font-semibold ml-1">Operational Base (Location)</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-sans placeholder-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            placeholder="New York, NY"
          />
        </div>
      </div>
    </form>
  );
};

export default ProfileTab;
