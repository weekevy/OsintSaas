import React from 'react';

const TeamCard = ({ team, onClick, onAction }) => {
  const { name, member_count, max_members, created_at, role } = team;
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'owner': return 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30';
      case 'admin': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default: return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  const stopPropagation = (e, callback) => {
    e.stopPropagation();
    callback();
  };

  return (
    <div 
      onClick={onClick}
      className="group relative rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 hover:border-[#00E5FF]/30 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#00E5FF]/5 blur-3xl rounded-full group-hover:bg-[#00E5FF]/10 transition-colors duration-300" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#00E5FF]/30 transition-colors duration-300">
            <svg className="w-6 h-6 text-[#00E5FF]/60 group-hover:text-[#00E5FF] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(role)}`}>
            {role || 'Member'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#00E5FF] transition-colors duration-300 truncate">
          {name}
        </h3>
        <p className="text-xs text-white/40 mb-6 font-medium">
          Created on {formatDate(created_at)}
        </p>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/40">Members</span>
            <span className="text-white font-semibold">{member_count} / {max_members}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] transition-all duration-500"
              style={{ width: `${(member_count / max_members) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6 pt-4 border-t border-white/5">
          <button 
            onClick={(e) => stopPropagation(e, () => onAction('invite', team))}
            className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-white/60 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition-all duration-200"
          >
            Invite
          </button>
          <button 
            onClick={(e) => stopPropagation(e, () => onAction('settings', team))}
            className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
          >
            Manage
          </button>
          <button 
            onClick={(e) => stopPropagation(e, () => onAction('remove', team))}
            className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500/60 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30 transition-all duration-200"
            title={role === 'owner' ? 'Delete Team' : 'Leave Team'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
