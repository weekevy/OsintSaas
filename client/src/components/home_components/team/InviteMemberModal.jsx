import { useState } from 'react';
import Modal from '../common/Modal';
import api from '../../../services/api';

const InviteMemberModal = ({ isOpen, onClose, teamId }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  const handleInvite = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.post(`/api/teams/${teamId}/invite`, {
        email,
        role
      });

      if (response.data.success) {
        setInviteLink(response.data.inviteLink);
        // Don't close immediately so they can copy the link
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('member');
    setError('');
    setInviteLink('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Member" size="md">
      <div className="space-y-5 font-['Poppins']">
        {inviteLink ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xl text-center">
              <svg className="w-12 h-12 text-[#00E5FF] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-white font-bold mb-1">Invitation Created!</h3>
              <p className="text-white/40 text-xs">Share this link with your team member</p>
            </div>
            
            <div className="relative group">
              <input
                readOnly
                value={inviteLink}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none pr-20"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  // Optional: show toast
                }}
                className="absolute right-2 top-1.5 px-3 py-1.5 bg-[#00E5FF] text-black text-[10px] font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                COPY
              </button>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-colors text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white/50 text-xs font-['Poppins'] font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-['Poppins'] placeholder-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs font-['Poppins'] font-semibold mb-2">
                Assign Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-['Poppins'] focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
              >
                <option value="member" className="bg-[#0a0a0a]">Member</option>
                <option value="admin" className="bg-[#0a0a0a]">Admin</option>
                <option value="viewer" className="bg-[#0a0a0a]">Viewer</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-white/20 transition-colors duration-150 text-sm font-['Poppins']"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-xl hover:opacity-90 transition-opacity duration-150 text-sm font-['Poppins'] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  'Generate Link'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default InviteMemberModal;
