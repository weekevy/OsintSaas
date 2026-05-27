import { useState } from 'react';
import Modal from '../common/Modal';
import api from '../../../services/api';

const InviteMemberModal = ({ isOpen, onClose, teamId, onMemberAdded }) => {
  const [username, setUsername] = useState('');
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
        setSuccess(`Invitation transmitted to ${username}!`);
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to transmit invite');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setRole('member');
    setCanUpload(false);
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Recruit Operator" size="md">
      <div className="space-y-6 font-sans animate-in fade-in zoom-in-95 duration-300">
        
        <div className="p-4 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-2xl flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center flex-shrink-0 border border-[#00E5FF]/20">
            <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <h4 className="text-white text-[11px] font-black tracking-widest uppercase mb-1">Squad Expansion</h4>
            <p className="text-[10px] text-white/40 leading-relaxed font-medium">Transmit a secure invitation to an authorized operative's username.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-[11px] flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold tracking-tight uppercase">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 rounded-2xl text-[#2DD4BF] text-[11px] flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-black tracking-widest uppercase">{success}</span>
          </div>
        )}

        <div className="space-y-5">
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
                placeholder="Enter Operative Name..."
                className="w-full pl-11 pr-4 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white text-sm placeholder-white/10 focus:outline-none focus:border-[#00E5FF]/40 focus:bg-white/[0.04] transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-white/40 text-[10px] font-black tracking-[0.2em] ml-1 uppercase">
              Role Classification
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {['Member', 'Admin', 'Viewer'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r.toLowerCase())}
                  className={`py-3.5 text-[10px] font-black tracking-[0.2em] rounded-xl border transition-all duration-300 uppercase ${
                    role === r.toLowerCase() 
                      ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]' 
                      : 'bg-white/[0.02] border-white/10 text-white/30 hover:border-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-2xl group hover:border-[#00E5FF]/20 transition-all">
              <div>
                <h4 className="text-white text-[11px] font-black tracking-widest uppercase">Intel Submission</h4>
                <p className="text-[9px] text-white/30 font-medium italic">Grant permission to share investigation assets</p>
              </div>
              <button 
                type="button"
                onClick={() => setCanUpload(!canUpload)}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ${canUpload ? 'bg-[#00E5FF]' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-lg transition-all duration-500 transform ${canUpload ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-8 border-t border-white/5">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-4 border border-white/10 rounded-2xl text-white/30 hover:text-white hover:bg-white/5 transition-all text-[10px] font-black tracking-[0.3em] uppercase"
            >
              Abort
            </button>
            <button
              onClick={handleInviteByUsername}
              disabled={loading || !username}
              className="flex-[1.8] px-4 py-4 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-black rounded-2xl hover:brightness-110 active:scale-95 transition-all text-[10px] font-black tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-20 disabled:grayscale uppercase"
            >
              {loading ? (
                <div className="w-5 h-5 border-[3px] border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Transmit Invitation
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
