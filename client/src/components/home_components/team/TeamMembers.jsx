const TeamMembers = ({ members }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-[#00E5FF]';
      case 'away': return 'bg-[#fbbf24]';
      case 'offline': return 'bg-[#4B5563]';
      default: return 'bg-[#4B5563]';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'Admin': return 'border-[#00E5FF]/30 text-[#00E5FF]';
      case 'Analyst': return 'border-[#00E5FF]/30 text-[#00E5FF]';
      case 'Investigator': return 'border-[#00E5FF]/30 text-[#00E5FF]';
      case 'Viewer': return 'border-white/20 text-white/40';
      default: return 'border-white/20 text-white/40';
    }
  };

  return (
    <div className="glass-card border border-white/10 overflow-hidden relative font-sans">
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00E5FF]/30" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00E5FF]/30" />
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-white/30 text-[8px] font-sans uppercase tracking-[0.12em] font-medium">MEMBER</th>
              <th className="text-left py-3 px-4 text-white/30 text-[8px] font-sans uppercase tracking-[0.12em] font-medium">ROLE</th>
              <th className="text-left py-3 px-4 text-white/30 text-[8px] font-sans uppercase tracking-[0.12em] font-medium">STATUS</th>
              <th className="text-left py-3 px-4 text-white/30 text-[8px] font-sans uppercase tracking-[0.12em] font-medium">LAST ACTIVE</th>
              <th className="text-left py-3 px-4 text-white/30 text-[8px] font-sans uppercase tracking-[0.12em] font-medium">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border border-[#00E5FF]/30 flex items-center justify-center">
                      <span className="text-white font-sans text-[10px] font-bold">{member.avatar}</span>
                    </div>
                    <div>
                      <div className="text-white font-sans text-[9px] font-bold uppercase tracking-[0.08em]">{member.name}</div>
                      <div className="text-white/30 text-[7px] font-sans uppercase tracking-[0.08em]">{member.email}</div>
                    </div>
                  </div>
                 </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 text-[7px] font-sans uppercase tracking-[0.1em] border ${getRoleBadgeColor(member.role)}`}>
                    {member.role}
                  </span>
                 </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 ${getStatusColor(member.status)}`} />
                    <span className="text-white/60 text-[8px] font-sans uppercase tracking-[0.08em]">{member.status}</span>
                  </div>
                 </td>
                <td className="py-3 px-4">
                  <span className="text-white/40 text-[7px] font-sans uppercase tracking-[0.08em]">{member.lastActive}</span>
                 </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-white/30 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition-all border border-transparent hover:border-white/10">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="p-1.5 text-white/30 hover:text-[#f87171] hover:border-[#f87171]/30 transition-all border border-transparent hover:border-white/10">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                 </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamMembers;