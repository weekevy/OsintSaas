import { useState } from 'react';
import Modal from '../common/Modal';

const InviteMemberModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'analyst',
    message: '',
    sendInvite: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle invite logic
    onClose();
    setFormData({ email: '', role: 'analyst', message: '', sendInvite: true });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Team Member">
      <form onSubmit={handleSubmit} className="space-y-5 font-sans">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/20"
            placeholder="colleague@company.com"
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/20"
          >
            <option value="admin">Admin - Full access</option>
            <option value="analyst">Analyst - Create investigations, generate reports</option>
            <option value="investigator">Investigator - View and comment</option>
            <option value="viewer">Viewer - Read only</option>
          </select>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Personal Message (Optional)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows="3"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/20"
            placeholder="Add a personal message to your invitation..."
          />
        </div>

        <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.sendInvite}
            onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00E5FF] focus:ring-[#00E5FF]/20"
          />
          <span className="text-white/80 text-sm">Send invitation email immediately</span>
        </label>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all"
          >
            Send Invitation
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteMemberModal;