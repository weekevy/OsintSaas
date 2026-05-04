const TeamMembers = ({ members }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-[#2DD4BF]';
      case 'away': return 'bg-[#fbbf24]';
      case 'offline': return 'bg-white/30';
      default: return 'bg-white/30';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'Admin': return 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30';
      case 'Analyst': return 'text-[#2DD4BF] bg-[#2DD4BF]/10 border-[#2DD4BF]/30';
      case 'Investigator': return 'text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/30';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
          <h3 className="text-white font-['Poppins'] text-base font-bold">Team Members</h3>
        </div>
        <span className="text-white/40 text-[11px] font-['Poppins']">{members.length} members</span>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-150"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#2DD4BF] flex items-center justify-center text-white font-bold text-sm">
                  {member.avatar}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${getStatusColor(member.status)} ring-2 ring-black`} />
              </div>
              <div>
                <h4 className="text-white font-['Poppins'] font-semibold text-base">{member.name}</h4>
                <p className="text-white/40 text-xs font-['Poppins']">{member.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-[11px] font-['Poppins'] font-semibold border ${getRoleColor(member.role)}`}>
                {member.role}
              </span>
              <span className="text-white/30 text-[10px] font-['Poppins'] flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {member.lastActive}
              </span>
              <button className="p-1.5 text-white/40 hover:text-[#00E5FF] transition-colors duration-150">
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