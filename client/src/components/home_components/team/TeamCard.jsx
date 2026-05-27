import React from 'react';

const TeamCard = ({ team, onClick, onAction }) => {
  const { name, member_count, max_members, created_at, role, description } = team;
  
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
      className="group relative rounded-3xl border border-white/[0.08] bg-black p-1 hover:border-[#00E5FF]/20 transition-all duration-300 cursor-pointer overflow-hidden shadow-xl animate-slide-up"
    >
      {/* Delete/Leave Action - "X" Button */}
      <button
        onClick={(e) => stopPropagation(e, () => onAction('remove', team))}
        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30 transition-all duration-200"
        title={role === 'owner' ? 'Delete Team' : 'Leave Team'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative z-10 p-4 sm:p-6 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[22px]">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4 lg:mb-6">
          <div className="relative">
            <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-[#00E5FF]/5 border border-white/10 flex items-center justify-center group-hover:border-[#00E5FF]/40 transition-all duration-500">
              <svg className="w-5 h-5 lg:w-7 lg:h-7 text-white/30 group-hover:text-[#00E5FF] transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 lg:gap-2 pr-8 lg:pr-10"> {/* Padding to avoid overlap with X */}
            <span className={`px-2.5 py-0.5 lg:px-3 lg:py-1 rounded-full border text-[8px] lg:text-[9px] font-bold tracking-[0.15em] ${getRoleBadgeColor(role)} shadow-inner`}>
              {role || 'Member'}
            </span>
            <span className="text-[8px] lg:text-[9px] text-white/20 font-bold tracking-widest">
              ID: T-{team.id.toString().padStart(4, '0')}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-bold text-white mb-1 group-hover:text-[#00E5FF] transition-colors duration-300 tracking-tight">
            {name}
          </h3>
          <p className="text-[10px] lg:text-[11px] text-white/40 font-medium leading-relaxed line-clamp-2 min-h-[30px] lg:min-h-[32px]">
            {description || 'No description provided for this team.'}
          </p>
        </div>

        {/* Stats Section */}
        <div className="space-y-3 lg:space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-0.5 lg:space-y-1">
              <span className="block text-[9px] lg:text-[10px] text-white/20 font-bold tracking-[0.1em]">Capacity</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg lg:text-xl font-bold text-white">{member_count}</span>
                <span className="text-[10px] lg:text-xs text-white/20">/ {max_members}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[9px] lg:text-[10px] text-white/20 font-bold tracking-[0.1em] mb-0.5 lg:mb-1">Established</span>
              <span className="text-[10px] lg:text-[11px] text-white/50 font-medium">{formatDate(created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
