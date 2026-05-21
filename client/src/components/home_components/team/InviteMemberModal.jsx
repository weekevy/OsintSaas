import { useState } from 'react';
import Modal from '../common/Modal';
import api from '../../../services/api';

const InviteMemberModal = ({ isOpen, onClose, teamId, onMemberAdded }) => {
  const [activeTab, setActiveTab] = useState('username'); // 'username' or 'direct'
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('member');
  const [canUpload, setCanUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInviteByUsername = async () => {
    if (!username) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post(`/api/teams/${teamId}/invite`, {
        username: username.trim(),
        role,
        canUpload
      });

      if (response.data.success) {
        setSuccess(`Invitation sent to ${username}!`);
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectAdd = async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post(`/api/teams/${teamId}/add-member`, {
        userId: parseInt(userId),
        role,
        canUpload
      });

      if (response.data.success) {
        setSuccess('Member added successfully!');
        if (onMemberAdded) onMemberAdded();
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setUserId('');
    setRole('member');
    setCanUpload(false);
    setError('');
    setSuccess('');
    setActiveTab('username');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Team Member" size="md">
      <div className="space-y-6 font-sans">
        {/* Tab Selection */}
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('username')}
            className={`flex-1 py-2.5 text-[11px] font-bold tracking-wider rounded-lg transition-all ${
              activeTab === 'username' ? 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20' : 'text-white/40 hover:text-white'
            }`}
          >
            Invite Username
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2.5 text-[11px] font-bold tracking-wider rounded-lg transition-all ${
              activeTab === 'direct' ? 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20' : 'text-white/40 hover:text-white'
            }`}
          >
            Direct Add (ID)
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-xs flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 rounded-2xl text-[#2DD4BF] text-xs flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-black tracking-wider">{success}</span>
          </div>
        )}

        <div className="space-y-5">
          {activeTab === 'username' ? (
            <div className="space-y-2">
              <label className="block text-white/40 text-[10px] font-black tracking-[0.2em] ml-1">
                Target Operator Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-[#00E5FF] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. shadow_stalker"
                  className="w-full pl-11 pr-4 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white text-sm placeholder-white/10 focus:outline-none focus:border-[#00E5FF]/40 focus:bg-white/[0.04] transition-all"
                />
              </div>
              <p className="mt-2 text-[9px] text-white/20 italic ml-1">
                The operative will receive a secure notification to accept your invitation.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-white/40 text-[10px] font-black tracking-[0.2em] ml-1">
                Platform Operator ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-[#00E5FF] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <input
                  type="number"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. 0042"
                  className="w-full pl-11 pr-4 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white text-sm placeholder-white/10 focus:outline-none focus:border-[#00E5FF]/40 focus:bg-white/[0.04] transition-all"
                />
              </div>
              <p className="mt-2 text-[9px] text-white/20 italic ml-1">
                Directly add an authorized operative using their unique system ID.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-white/40 text-[10px] font-medium tracking-[0.2em] ml-1">
              Clearance Level
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {['Member', 'Admin', 'Viewer'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r.toLowerCase())}
                  className={`py-3 text-[10px] font-semibold tracking-widest rounded-xl border transition-all duration-300 ${
                    role === r.toLowerCase() 
                      ? 'bg-[#00E5FF]/10 border-[#00E5FF]/40 text-[#00E5FF]' 
                      : 'bg-white/[0.02] border-white/10 text-white/30 hover:border-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-2xl">
              <div>
                <h4 className="text-white text-[11px] font-semibold tracking-wide">Project Collaboration</h4>
                <p className="text-[9px] text-white/30">Allow operative to share their own projects</p>
              </div>
              <button 
                type="button"
                onClick={() => setCanUpload(!canUpload)}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${canUpload ? 'bg-[#00E5FF]' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 ${canUpload ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-8 border-t border-white/5">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-4 border border-white/10 rounded-2xl text-white/30 hover:text-white hover:bg-white/5 transition-all text-[10px] font-black tracking-[0.2em]"
            >
              Abort
            </button>
            <button
              onClick={activeTab === 'username' ? handleInviteByUsername : handleDirectAdd}
              disabled={loading || (activeTab === 'username' ? !username : !userId)}
              className="flex-[1.5] px-4 py-4 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-black rounded-2xl hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all text-[10px] font-black tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-30 disabled:scale-100 disabled:grayscale"
            >
              {loading ? (
                <div className="w-5 h-5 border-[3px] border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {activeTab === 'username' ? 'Transmit Invite' : 'Authorize Member'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InviteMemberModal;
