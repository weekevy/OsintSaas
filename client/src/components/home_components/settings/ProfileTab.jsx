import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

const ProfileTab = ({ isLoading, setIsLoading }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    title: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    twitter: '',
    github: '',
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
            bio: userData.bio || '',
            title: userData.title || '',
            phone: userData.phone || '',
            location: userData.location || '',
            website: userData.website || '',
            linkedin: userData.social?.linkedin || '',
            twitter: userData.social?.twitter || '',
            github: userData.social?.github || '',
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
    <form onSubmit={handleSubmit} className="space-y-5 font-['Poppins']">
      <button type="submit" id="save-settings" className="hidden" />

      {/* Success/Error Messages - Simplified animations */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-xs font-['Poppins']">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-lg">
          <p className="text-[#00E5FF] text-xs font-['Poppins']">{success}</p>
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
        <div className="relative group">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-[#00E5FF]/15 to-[#2DD4BF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-xl font-bold text-[#00E5FF]">
            {formData.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <svg className="w-4 h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <div>
          <h3 className="text-white font-['Poppins'] text-sm font-semibold">Profile Picture</h3>
          <p className="text-white/40 text-[10px] font-['Poppins']">Click to upload a new photo</p>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/50 text-[10px] font-['Poppins'] font-semibold uppercase tracking-wider mb-1.5">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-['Poppins'] placeholder-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            placeholder="John"
          />
        </div>

        <div>
          <label className="block text-white/50 text-[10px] font-['Poppins'] font-semibold uppercase tracking-wider mb-1.5">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-['Poppins'] placeholder-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            placeholder="Doe"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-white/50 text-[10px] font-['Poppins'] font-semibold uppercase tracking-wider mb-1.5">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/40 text-sm font-['Poppins'] cursor-not-allowed"
            placeholder="john@example.com"
          />
          <p className="text-white/30 text-[9px] font-['Poppins'] mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-white/50 text-[10px] font-['Poppins'] font-semibold uppercase tracking-wider mb-1.5">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-['Poppins'] placeholder-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            placeholder="Security Analyst"
          />
        </div>

        <div>
          <label className="block text-white/50 text-[10px] font-['Poppins'] font-semibold uppercase tracking-wider mb-1.5">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-['Poppins'] placeholder-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div>
          <label className="block text-white/50 text-[10px] font-['Poppins'] font-semibold uppercase tracking-wider mb-1.5">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-['Poppins'] placeholder-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            placeholder="New York, NY"
          />
        </div>

        <div>
          <label className="block text-white/50 text-[10px] font-['Poppins'] font-semibold uppercase tracking-wider mb-1.5">Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-['Poppins'] placeholder-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-white/50 text-[10px] font-['Poppins'] font-semibold uppercase tracking-wider mb-1.5">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-['Poppins'] placeholder-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150 resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Social Links Section */}
        <div className="md:col-span-2">
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#0a0a0a] text-white/40 text-[9px] font-['Poppins'] font-semibold uppercase tracking-wider">
                Social Links
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-white/50 text-[10px] font-['Poppins'] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <svg className="w-3 h-3 text-[#00E5FF]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            LinkedIn
          </label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-['Poppins'] placeholder-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div>
          <label className="block text-white/50 text-[10px] font-['Poppins'] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <svg className="w-3 h-3 text-[#00E5FF]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.68-11.402c0-.213-.005-.426-.015-.637A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter
          </label>
          <input
            type="url"
            name="twitter"
            value={formData.twitter}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-['Poppins'] placeholder-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            placeholder="https://twitter.com/username"
          />
        </div>

        <div>
          <label className="block text-white/50 text-[10px] font-['Poppins'] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <svg className="w-3 h-3 text-[#00E5FF]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            GitHub
          </label>
          <input
            type="url"
            name="github"
            value={formData.github}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-['Poppins'] placeholder-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors duration-150"
            placeholder="https://github.com/username"
          />
        </div>
      </div>
    </form>
  );
};

export default ProfileTab;