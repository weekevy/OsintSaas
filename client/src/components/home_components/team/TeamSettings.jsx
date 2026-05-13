import { useState } from 'react';
import api from '../../../services/api';

const TeamSettings = ({ team, onUpdate }) => {
  const [name, setName] = useState(team?.name || '');
  const [description, setDescription] = useState(team?.description || '');
  const [visibility, setVisibility] = useState(team?.visibility || 'private');
  const [maxMembers, setMaxMembers] = useState(team?.max_members || 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.put(`/api/teams/${team.id}`, {
        name,
        description,
        visibility,
        max_members: maxMembers
      });

      if (response.data.success) {
        setSuccess('Team updated successfully');
        onUpdate(team.id);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        const response = await api.delete(`/api/teams/${team.id}`);
        if (response.data.success) {
          window.location.reload(); // Quickest way to go back to list
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete team');
      }
    }
  };

  return (
    <div className="space-y-6 font-['Poppins']">
      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs">{error}</div>}
      {success && <div className="p-3 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xl text-[#00E5FF] text-xs">{success}</div>}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
          <h3 className="text-white font-bold text-base">General Settings</h3>
        </div>

        <div className="grid gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <label className="block text-white font-semibold text-sm mb-2">Team Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-[#00E5FF]/50 outline-none transition-colors"
            />
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <label className="block text-white font-semibold text-sm mb-2">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-[#00E5FF]/50 outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <label className="block text-white font-semibold text-sm mb-2">Visibility</label>
              <select 
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-[#00E5FF]/50 outline-none transition-colors"
              >
                <option value="private" className="bg-[#0a0a0a]">Private</option>
                <option value="public" className="bg-[#0a0a0a]">Public</option>
                <option value="hidden" className="bg-[#0a0a0a]">Hidden</option>
              </select>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <label className="block text-white font-semibold text-sm mb-2">Max Members</label>
              <input 
                type="number" 
                value={maxMembers}
                onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-[#00E5FF]/50 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleUpdate}
            disabled={loading}
            className="px-8 py-2.5 bg-[#00E5FF] text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-[#f87171] to-[#ef4444] rounded-full" />
          <h3 className="text-white font-bold text-base">Danger Zone</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <div>
            <h4 className="text-white font-semibold text-sm">Delete Team</h4>
            <p className="text-white/40 text-xs">Permanently delete this team and all associated data</p>
          </div>
          <button 
            onClick={handleDelete}
            className="px-6 py-2 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors duration-150 text-xs font-bold"
          >
            Delete Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamSettings;
