import { useState, useEffect } from 'react';
import {
  TeamMembers,
  InviteMemberModal,
  CreateTeamModal,
  TeamCard,
  RolesPermissions,
  TeamSettings,
  TeamChat
} from '../team';
import ShareProjectModal from '../team/ShareProjectModal';
import api from '../../../services/api';

const shellMax = 'max-w-[1680px] mx-auto w-full';

const TeamDashboard = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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
    setActiveTab('members');
    setTeamDetails(null);
    fetchTeamDetails(team.id);
  };

  const handleAction = async (type, team) => {
    if (type === 'invite') {
      setSelectedTeam(team);
      setIsInviteModalOpen(true);
    } else if (type === 'share-project') {
      setSelectedTeam(team);
      setIsShareModalOpen(true);
    } else if (type === 'settings') {
      setSelectedTeam(team);
      setActiveTab('settings');
      fetchTeamDetails(team.id);
    } else if (type === 'remove') {
      const isOwner = team.role === 'owner';
      if (window.confirm(isOwner ? `Delete ${team.name}?` : `Leave ${team.name}?`)) {
        try {
          const endpoint = isOwner ? `/api/teams/${team.id}` : `/api/teams/${team.id}/leave`;
          const response = await api.delete(endpoint);
          if (response.data.success) {
            setTeams(teams.filter(t => t.id !== team.id));
            if (selectedTeam?.id === team.id) setSelectedTeam(null);
          }
        } catch (err) {
          alert(err.response?.data?.error || 'Operation failed');
        }
      }
    }
  };

  const tabs = [
    { id: 'members', label: 'Members' },
    { id: 'projects', label: 'Projects' },
    { id: 'chat', label: 'Chat' },
    { id: 'settings', label: 'Settings' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className={`${shellMax} px-4 sm:px-6 lg:px-8 py-6 lg:py-10 font-['Poppins'] text-white`}>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-6 mb-8 lg:mb-12">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-1 lg:mb-2">Collaboration Hub</h1>
            <p className="text-white/40 text-[11px] lg:text-sm font-medium">Manage elite investigation squads and shared intelligence.</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full md:w-auto px-6 lg:px-8 py-3 lg:py-3.5 bg-[#00E5FF] text-black font-bold rounded-xl lg:rounded-2xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)]"
          >
            New Command
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {teams.map(team => (
            <TeamCard key={team.id} team={team} onClick={() => handleTeamClick(team)} onAction={handleAction} />
          ))}
          {teams.length === 0 && (
            <div className="col-span-full py-20 text-center rounded-[32px] border border-dashed border-white/10">
              <p className="text-white/20 font-bold tracking-widest uppercase">No Active Squads Found</p>
            </div>
          )}
        </div>

        <CreateTeamModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onTeamCreated={fetchTeams} />
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col lg:h-full font-['Poppins'] text-white ${shellMax}`}>
      {/* Mobile Top Navigation - Professional Sticky Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#080b0d]/90 backdrop-blur-md border-b border-white/5 px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedTeam(null)}
              className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 active:scale-90 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-white tracking-tight leading-none mb-1">{selectedTeam.name}</h2>
              <span className="text-[10px] text-[#00E5FF] font-bold tracking-widest uppercase opacity-70">{selectedTeam.role} Role</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="w-10 h-10 rounded-2xl bg-[#00E5FF] text-black flex items-center justify-center shadow-lg shadow-[#00E5FF]/20 active:scale-90 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Tabs - Professional Segmented Style */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-2xl whitespace-nowrap text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-[#00E5FF]/10 text-[#00E5FF] ring-1 ring-[#00E5FF]/30' 
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* View 2: Team Detail - Full Height Container with same padding as Navbar */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 px-4 sm:px-6 lg:px-8 py-4 lg:py-6 lg:overflow-hidden">
        
        {/* Sidebar: Navigation - Fixed on Large Screens (Hidden on Mobile) */}
        <aside className="hidden lg:flex w-[320px] flex-col gap-4 flex-shrink-0 lg:overflow-y-auto no-scrollbar pb-4 lg:pb-0">
          <div className="bg-[#0f0f0f] border border-white/5 rounded-[28px] overflow-hidden flex flex-col shadow-xl">
            <div className="p-6 bg-gradient-to-br from-white/[0.03] to-transparent border-b border-white/5">
              <button 
                onClick={() => setSelectedTeam(null)}
                className="flex items-center gap-2 text-white/30 hover:text-[#00E5FF] transition-all text-[10px] font-bold tracking-widest mb-6"
              >
                ← EXIT COMMAND
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-[#00E5FF]">{selectedTeam.name[0]}</span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-white tracking-tight leading-tight truncate">{selectedTeam.name}</h2>
                  <span className="text-[9px] text-white/20 font-bold tracking-widest uppercase">{selectedTeam.role} Role</span>
                </div>
              </div>
            </div>

            <nav className="p-3 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF]' 
                      : 'text-white/30 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-[11px] font-bold tracking-widest uppercase">{tab.label}</span>
                  <div className={`w-1 h-1 rounded-full ${activeTab === tab.id ? 'bg-[#00E5FF]' : 'bg-transparent'}`} />
                </button>
              ))}
            </nav>

            <div className="mt-auto p-4 bg-white/[0.01] border-t border-white/5 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="block text-[8px] text-white/20 font-bold tracking-widest mb-1">MEMBERS</span>
                <span className="text-base font-bold text-white">{teamDetails?.members?.length || '0'}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="block text-[8px] text-white/20 font-bold tracking-widest mb-1">PROJECTS</span>
                <span className="text-base font-bold text-white">{teamDetails?.projects?.length || '0'}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0f0f0f] border border-white/5 rounded-[28px] p-4 space-y-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-[#2DD4BF] hover:border-[#2DD4BF]/40 transition-all text-[10px] font-bold tracking-widest uppercase"
            >
              Sync Project
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="w-full py-3.5 rounded-xl bg-[#00E5FF] text-black font-bold transition-all text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-[#00E5FF]/10"
            >
              Invite Member
            </button>
          </div>
        </aside>

        {/* Main Workspace: Fills remaining height and width */}
        <main className="flex-1 bg-[#0a0a0a] lg:border border-white/5 rounded-t-[32px] lg:rounded-[32px] shadow-2xl flex flex-col lg:overflow-hidden relative min-h-[500px] lg:min-h-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.01] via-transparent to-transparent pointer-events-none" />
          
          <header className="hidden lg:flex px-6 lg:px-8 py-6 border-b border-white/5 items-center justify-between relative z-10 bg-white/[0.01]">
            <div>
              <h3 className="text-[10px] font-bold text-[#00E5FF] tracking-[0.3em] uppercase mb-1">{activeTab}</h3>
              <p className="text-white/40 text-[10px] font-medium italic">Active Command Terminal</p>
            </div>
          </header>

          <div className="flex-1 lg:overflow-y-auto p-4 lg:p-8 relative z-10 no-scrollbar">
            {!teamDetails && activeTab !== 'chat' ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <div className="w-8 h-8 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin mb-4" />
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase">Initializing Workspace</span>
              </div>
            ) : (
              <div className="h-full animate-in fade-in duration-300">
                {activeTab === 'members' && <TeamMembers members={teamDetails?.members} />}
                
                {activeTab === 'projects' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamDetails?.projects?.map(project => (
                      <div key={project.id} className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/5 border border-white/10 flex items-center justify-center">
                            <span className="text-[#00E5FF] font-bold text-lg">{project.name[0]}</span>
                          </div>
                          <span className="text-[8px] font-bold text-white/20 tracking-widest bg-white/5 px-2.5 py-1 rounded-full uppercase">{project.status}</span>
                        </div>
                        <h4 className="text-base font-bold text-white mb-1.5 group-hover:text-[#00E5FF] transition-colors">{project.name}</h4>
                        <p className="text-[11px] text-white/40 leading-relaxed mb-4 line-clamp-2">{project.description}</p>
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[8px] font-bold text-white/20 tracking-widest uppercase">Owner: {project.owner_email.split('@')[0]}</span>
                          <button className="text-[9px] font-bold text-[#00E5FF] hover:underline tracking-widest uppercase">Open →</button>
                        </div>
                      </div>
                    ))}
                    {teamDetails?.projects?.length === 0 && (
                      <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-[28px]">
                        <p className="text-white/10 text-[10px] font-bold tracking-[0.3em] uppercase">No Synchronized Projects Found</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'chat' && <TeamChat teamId={selectedTeam.id} />}
                {activeTab === 'settings' && <TeamSettings team={teamDetails?.team} onUpdate={fetchTeamDetails} />}
              </div>
            )}
          </div>
        </main>
      </div>

      <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} teamId={selectedTeam.id} onMemberAdded={() => fetchTeamDetails(selectedTeam.id)} />
      <CreateTeamModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onTeamCreated={fetchTeams} />
      <ShareProjectModal isOpen={isShareModalOpen} onClose={() => { setIsShareModalOpen(false); if (selectedTeam) fetchTeamDetails(selectedTeam.id); }} teamId={selectedTeam.id} />
    </div>
  );
};

export default TeamDashboard;
