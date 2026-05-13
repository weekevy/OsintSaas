import { useState } from 'react';
import Modal from '../common/Modal';
import api from '../../../services/api';

const CreateTeamModal = ({ isOpen, onClose, onTeamCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [visibility, setVisibility] = useState('private');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name) {
      setError('Team name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/teams', {
        name,
        description,
        max_members: maxMembers,
        visibility
      });

      if (response.data.success) {
        onTeamCreated(response.data.team);
        onClose();
        // Reset form
        setName('');
        setDescription('');
        setMaxMembers(10);
        setVisibility('private');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Team" size="md">
      <div className="space-y-5 font-['Poppins']">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-white/50 text-xs font-['Poppins'] font-semibold mb-2">
            Team Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alpha Investigators"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-['Poppins'] placeholder-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-white/50 text-xs font-['Poppins'] font-semibold mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this team for?"
            rows="3"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-['Poppins'] placeholder-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/50 text-xs font-['Poppins'] font-semibold mb-2">
              Max Members
            </label>
            <input
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value))}
              min="1"
              max="100"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-['Poppins'] focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs font-['Poppins'] font-semibold mb-2">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-['Poppins'] focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
            >
              <option value="private" className="bg-[#0a0a0a]">Private</option>
              <option value="public" className="bg-[#0a0a0a]">Public</option>
              <option value="hidden" className="bg-[#0a0a0a]">Hidden</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-white/20 transition-colors duration-150 text-sm font-['Poppins'] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-xl hover:opacity-90 transition-opacity duration-150 text-sm font-['Poppins'] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Team'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateTeamModal;
