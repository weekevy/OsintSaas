import { useState } from 'react';
import {
  TeamMembers,
  InviteMemberModal,
  RolesPermissions,
  ActivityLog,
  TeamSettings
} from '../team';

const TeamDashboard = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const members = [
    {
      id: 1,
      name: 'JOHN DOE',
      email: 'john.doe@osint.com',
      role: 'Admin',
      status: 'active',
      lastActive: '2 MIN AGO',
      avatar: 'JD'
    },
    {
      id: 2,
      name: 'JANE SMITH',
      email: 'jane.smith@osint.com',
      role: 'Analyst',
      status: 'active',
      lastActive: '15 MIN AGO',
      avatar: 'JS'
    },
    {
      id: 3,
      name: 'MIKE JOHNSON',
      email: 'mike.johnson@osint.com',
      role: 'Investigator',
      status: 'away',
      lastActive: '1 HOUR AGO',
      avatar: 'MJ'
    },
    {
      id: 4,
      name: 'SARAH WILLIAMS',
      email: 'sarah.williams@osint.com',
      role: 'Viewer',
      status: 'offline',
      lastActive: '1 DAY AGO',
      avatar: 'SW'
    }
  ];

  const roles = [
    {
      name: 'ADMIN',
      permissions: ['FULL ACCESS', 'MANAGE TEAM', 'BILLING', 'API KEYS'],
      members: 1
    },
    {
      name: 'ANALYST',
      permissions: ['CREATE INVESTIGATIONS', 'GENERATE REPORTS', 'EXPORT DATA'],
      members: 3
    },
    {
      name: 'INVESTIGATOR',
      permissions: ['VIEW INVESTIGATIONS', 'ADD COMMENTS', 'BASIC SEARCH'],
      members: 2
    },
    {
      name: 'VIEWER',
      permissions: ['READ-ONLY ACCESS', 'VIEW REPORTS'],
      members: 4
    }
  ];

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-5 bg-[#080b0d]">
      
      {/* Header - Tactical */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-white uppercase tracking-[-0.02em] flex items-center gap-3">
            <svg className="w-6 h-6 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            TEAM MANAGEMENT
          </h1>
          <p className="text-[9px] font-mono text-white/40 uppercase tracking-[0.12em] mt-1">
            MANAGE YOUR TEAM MEMBERS, ROLES, AND PERMISSIONS
          </p>
        </div>
        
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2 border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-[9px] font-mono uppercase tracking-[0.08em] flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          INVITE MEMBER
        </button>
      </div>

      {/* Team Stats - Tactical */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#090c0e] border border-white/10 p-4 relative">
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00ff88]/30" />
          <div className="text-2xl font-bold text-white font-mono mb-0.5">12</div>
          <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">TOTAL MEMBERS</div>
        </div>
        <div className="bg-[#090c0e] border border-white/10 p-4 relative">
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#34d399]/30" />
          <div className="text-2xl font-bold text-[#34d399] font-mono mb-0.5">8</div>
          <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">ACTIVE NOW</div>
        </div>
        <div className="bg-[#090c0e] border border-white/10 p-4 relative">
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#fbbf24]/30" />
          <div className="text-2xl font-bold text-[#fbbf24] font-mono mb-0.5">4</div>
          <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">PENDING INVITES</div>
        </div>
        <div className="bg-[#090c0e] border border-white/10 p-4 relative">
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#22d3ee]/30" />
          <div className="text-2xl font-bold text-[#22d3ee] font-mono mb-0.5">6</div>
          <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">TEAMS</div>
        </div>
      </div>

      {/* Tabs - Tactical */}
      <div className="flex gap-1 border-b border-white/10">
        {['members', 'roles', 'activity', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[9px] font-mono uppercase tracking-[0.08em] capitalize transition-all whitespace-nowrap
              ${activeTab === tab 
                ? 'text-[#00ff88] border-b-2 border-[#00ff88]' 
                : 'text-white/40 hover:text-white'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === 'members' && (
          <TeamMembers members={members} />
        )}

        {activeTab === 'roles' && (
          <RolesPermissions roles={roles} />
        )}

        {activeTab === 'activity' && (
          <ActivityLog />
        )}

        {activeTab === 'settings' && (
          <TeamSettings />
        )}
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};

export default TeamDashboard;