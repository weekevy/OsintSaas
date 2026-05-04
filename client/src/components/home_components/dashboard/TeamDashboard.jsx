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
      name: 'John Doe',
      email: 'john.doe@osint.com',
      role: 'Admin',
      status: 'active',
      lastActive: '2 min ago',
      avatar: 'JD'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@osint.com',
      role: 'Analyst',
      status: 'active',
      lastActive: '15 min ago',
      avatar: 'JS'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@osint.com',
      role: 'Investigator',
      status: 'away',
      lastActive: '1 hour ago',
      avatar: 'MJ'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.williams@osint.com',
      role: 'Viewer',
      status: 'offline',
      lastActive: '1 day ago',
      avatar: 'SW'
    }
  ];

  const roles = [
    {
      name: 'Admin',
      permissions: ['Full Access', 'Manage Team', 'Billing', 'API Keys'],
      members: 1
    },
    {
      name: 'Analyst',
      permissions: ['Create Investigations', 'Generate Reports', 'Export Data'],
      members: 3
    },
    {
      name: 'Investigator',
      permissions: ['View Investigations', 'Add Comments', 'Basic Search'],
      members: 2
    },
    {
      name: 'Viewer',
      permissions: ['Read-only Access', 'View Reports'],
      members: 4
    }
  ];

  const stats = [
    { label: 'Total Members', value: '12' },
    { label: 'Active Now', value: '8' },
    { label: 'Pending Invites', value: '4' },
    { label: 'Teams', value: '6' }
  ];

  const tabs = [
    { id: 'members', label: 'Members' },
    { id: 'roles', label: 'Roles' },
    { id: 'activity', label: 'Activity' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div className="min-h-screen font-['Poppins'] text-white bg-black">
      <div className="relative z-[1] max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 pb-12 md:pb-10">
        
        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 md:p-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h1 className="font-['Poppins'] text-2xl md:text-3xl font-bold text-white">
                  Team Management
                </h1>
              </div>
              <p className="text-sm font-['Poppins'] text-white/40 ml-16">
                Manage team members, roles, and permissions
              </p>
            </div>
            
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 text-white/60 hover:text-[#00E5FF] transition-colors duration-150 text-sm font-['Poppins']"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invite Member
            </button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 text-center"
            >
              <div className="text-3xl md:text-4xl font-bold font-['Poppins'] text-white mb-2">
                {stat.value}
              </div>
              <div className="text-[11px] md:text-xs font-['Poppins'] font-semibold text-white/40">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-1 mb-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-['Poppins'] font-semibold rounded-lg transition-colors duration-150 ${
                  activeTab === tab.id 
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="mt-6">
          {activeTab === 'members' && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <TeamMembers members={members} />
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <RolesPermissions roles={roles} />
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <ActivityLog />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <TeamSettings />
            </div>
          )}
        </div>

        {/* Invite Member Modal */}
        <InviteMemberModal 
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default TeamDashboard;