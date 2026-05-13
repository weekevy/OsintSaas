import { useState, useEffect } from 'react';
import {
  TeamMembers,
  InviteMemberModal,
  CreateTeamModal,
  TeamCard,
  RolesPermissions,
  ActivityLog,
  TeamSettings
} from '../team';
import api from '../../../services/api';

const TeamDashboard = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [teamDetails, setTeamDetails] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/teams');
      if (response.data.success) {
        setTeams(response.data.teams);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDetails = async (teamId) => {
    try {
      const response = await api.get(`/api/teams/${teamId}`);
      if (response.data.success) {
        setTeamDetails(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch team details:', err);
    }
  };

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    fetchTeamDetails(team.id);
  };

  const handleTeamCreated = (newTeam) => {
    setTeams([newTeam, ...teams]);
    handleTeamClick(newTeam);
  };

  const handleAction = async (type, team) => {
    if (type === 'invite') {
      setSelectedTeam(team);
      setIsInviteModalOpen(true);
    } else if (type === 'settings') {
      setSelectedTeam(team);
      setActiveTab('settings');
      fetchTeamDetails(team.id);
    } else if (type === 'remove') {
      const isOwner = team.role === 'owner';
      const message = isOwner 
        ? `Are you sure you want to DELETE "${team.name}"? This will remove all data for everyone.`
        : `Are you sure you want to LEAVE "${team.name}"?`;
      
      if (window.confirm(message)) {
        try {
          const endpoint = isOwner ? `/api/teams/${team.id}` : `/api/teams/${team.id}/leave`;
          const response = await api.delete(endpoint);
          if (response.data.success) {
            setTeams(teams.filter(t => t.id !== team.id));
            if (selectedTeam?.id === team.id) {
              setSelectedTeam(null);
            }
          }
        } catch (err) {
          alert(err.response?.data?.error || 'Failed to process request');
        }
      }
    }
  };

  const stats = [
    { label: 'Total Members', value: teamDetails?.members?.length || '0' },
    { label: 'Max Capacity', value: selectedTeam?.max_members || '0' },
    { label: 'Role', value: selectedTeam?.role || 'Member' },
    { label: 'Visibility', value: selectedTeam?.visibility || 'Private' }
  ];

  const tabs = [
    { id: 'members', label: 'Members' },
    { id: 'roles', label: 'Roles' },
    { id: 'activity', label: 'Activity' },
    { id: 'settings', label: 'Settings' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin" />
      </div>
    );
  }

  // View 1: Teams List
  if (!selectedTeam) {
    return (
      <div className="min-h-screen font-['Poppins'] text-white bg-black">
        <div className="relative z-[1] max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 pb-12 md:pb-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Teams</h1>
              <p className="text-sm text-white/40">Manage your collaborative OSINT investigation teams</p>
            </div>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-xl hover:opacity-90 transition-opacity duration-150 text-sm font-['Poppins'] shadow-[0_0_20px_rgba(0,229,255,0.2)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Team
            </button>
          </div>

          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/5 bg-[#0a0a0a]">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No Teams Found</h2>
              <p className="text-white/40 mb-8 max-w-md text-center">You aren't a member of any teams yet. Create a new team to start collaborating on investigations.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-colors"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {teams.map((team) => (
                <TeamCard 
                  key={team.id} 
                  team={team} 
                  onClick={() => handleTeamClick(team)}
                  onAction={handleAction}
                />
              ))}
            </div>
          )}
        </div>

        <CreateTeamModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onTeamCreated={handleTeamCreated}
        />
      </div>
    );
  }

  // View 2: Team Detail
  return (
    <div className="min-h-screen font-['Poppins'] text-white bg-black">
      <div className="relative z-[1] max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 pb-12 md:pb-10">
        
        {/* Back Navigation */}
        <button 
          onClick={() => setSelectedTeam(null)}
          className="flex items-center gap-2 text-white/40 hover:text-[#00E5FF] transition-colors mb-6 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Teams
        </button>

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
                <div>
                  <h1 className="font-['Poppins'] text-2xl md:text-3xl font-bold text-white">
                    {selectedTeam.name}
                  </h1>
                  <p className="text-sm font-['Poppins'] text-white/40">
                    {selectedTeam.description || 'No description provided'}
                  </p>
                </div>
              </div>
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
              <div className="text-3xl md:text-4xl font-bold font-['Poppins'] text-white mb-2 truncate">
                {stat.value}
              </div>
              <div className="text-[11px] md:text-xs font-['Poppins'] font-semibold text-white/40 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-1 mb-6">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-['Poppins'] font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap ${
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
          {!teamDetails ? (
             <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'members' && (
                <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
                  <TeamMembers members={teamDetails.members} />
                </div>
              )}

              {activeTab === 'roles' && (
                <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
                  <RolesPermissions />
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
                  <ActivityLog />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
                  <TeamSettings team={teamDetails.team} onUpdate={fetchTeamDetails} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Modals */}
        <InviteMemberModal 
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          teamId={selectedTeam.id}
        />
        <CreateTeamModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onTeamCreated={handleTeamCreated}
        />
      </div>
    </div>
  );
};

export default TeamDashboard;
