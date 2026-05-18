const TeamMembers = ({ members = [] }) => {
  const getRoleColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'owner': return 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/20';
      case 'admin': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'member': return 'text-[#2DD4BF] bg-[#2DD4BF]/10 border-[#2DD4BF]/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  const getInitials = (first, last) => {
    if (!first && !last) return 'OP';
    return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
  };

  if (!members || members.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p className="text-xs font-bold tracking-[0.3em] uppercase">No Authorized Personnel Recorded</p>
      </div>
    );
  }

  return (
    <div className="font-['Poppins']">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="group p-5 lg:p-6 rounded-[28px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-[#00E5FF]/10 to-[#2DD4BF]/10 border border-white/5 flex items-center justify-center text-white font-bold text-base lg:text-lg">
                {getInitials(member.first_name, member.last_name)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-sm lg:text-base tracking-tight truncate">
                  {member.first_name ? `${member.first_name} ${member.last_name || ''}` : member.email.split('@')[0]}
                </h4>
                <p className="text-white/30 text-[10px] truncate uppercase tracking-widest font-medium">{member.email}</p>
              </div>
              <div className={`px-2.5 py-1 rounded-lg text-[8px] font-bold tracking-widest border ${getRoleColor(member.role)}`}>
                {member.role?.toUpperCase()}
              </div>
            </div>
            
            <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
                  <span className="text-[9px] text-white/20 font-bold tracking-widest uppercase">ACTIVE</span>
               </div>
               <button className="text-[9px] font-bold text-white/30 hover:text-[#00E5FF] transition-all tracking-widest uppercase">VIEW LOGS</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembers;
