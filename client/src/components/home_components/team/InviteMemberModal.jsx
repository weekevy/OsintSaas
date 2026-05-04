import { useState } from 'react';
import Modal from '../common/Modal';

const InviteMemberModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Analyst');

  const handleInvite = () => {
    // Handle invite logic here
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Member" size="md">
      <div className="space-y-5 font-['Poppins']">
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
            <option className="bg-[#0a0a0a]">Admin</option>
            <option className="bg-[#0a0a0a]">Analyst</option>
            <option className="bg-[#0a0a0a]">Investigator</option>
            <option className="bg-[#0a0a0a]">Viewer</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-white/20 transition-colors duration-150 text-sm font-['Poppins']"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-xl hover:opacity-90 transition-opacity duration-150 text-sm font-['Poppins']"
          >
            Send Invite
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InviteMemberModal;