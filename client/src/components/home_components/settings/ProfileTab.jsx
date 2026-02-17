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

  // Load user data when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
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
        headers: {
          'Content-Type': 'application/json',
        },
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <button type="submit" id="save-settings" className="hidden" />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white">
            {formData.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
          </div>
          <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <div>
          <h3 className="text-white font-semibold">Profile Picture</h3>
          <p className="text-white/60 text-sm">Click to upload a new photo</p>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors duration-300"
            placeholder="John"
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors duration-300"
            placeholder="Doe"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-white/80 text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors duration-300"
            placeholder="john@example.com"
            disabled
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/60 cursor-not-allowed"
          />
          <p className="text-white/40 text-xs mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors duration-300"
            placeholder="Security Analyst"
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors duration-300"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors duration-300"
            placeholder="New York, NY"
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors duration-300"
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-white/80 text-sm font-medium mb-2">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors duration-300 resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        <h3 className="text-white font-semibold pt-4 border-t border-white/10 md:col-span-2">
          Social Links
        </h3>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">LinkedIn</label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors duration-300"
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Twitter</label>
          <input
            type="url"
            name="twitter"
            value={formData.twitter}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors duration-300"
            placeholder="https://twitter.com/username"
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">GitHub</label>
          <input
            type="url"
            name="github"
            value={formData.github}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors duration-300"
            placeholder="https://github.com/username"
          />
        </div>
      </div>
    </form>
  );
};

export default ProfileTab;
