const TeamMembers = ({ members = [] }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-[#2DD4BF]';
      case 'away': return 'bg-[#fbbf24]';
      case 'offline': return 'bg-white/30';
      default: return 'bg-[#2DD4BF]'; // Default to active for now as we don't have real-time status
    }
  };

  const getRoleColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'owner': return 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30';
      case 'admin': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'member': return 'text-[#2DD4BF] bg-[#2DD4BF]/10 border-[#2DD4BF]/30';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  const getInitials = (first, last) => {
    if (!first && !last) return '?';
    return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-4 font-['Poppins']">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
          <h3 className="text-white font-bold text-base">Team Members</h3>
        </div>
        <span className="text-white/40 text-[11px] font-semibold">{members.length} members</span>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-150"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#2DD4BF] flex items-center justify-center text-black font-bold text-sm">
                  {getInitials(member.first_name, member.last_name)}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${getStatusColor('active')} ring-2 ring-black`} />
              </div>
              <div>
                <h4 className="text-white font-semibold text-base">
                  {member.first_name ? `${member.first_name} ${member.last_name || ''}` : member.email.split('@')[0]}
                </h4>
                <p className="text-white/40 text-xs">{member.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getRoleColor(member.role)}`}>
                {member.role}
              </span>
              <span className="text-white/30 text-[10px] font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Joined {new Date(member.joined_at).toLocaleDateString()}
              </span>
              <button className="p-1.5 text-white/40 hover:text-[#00E5FF] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembers;
