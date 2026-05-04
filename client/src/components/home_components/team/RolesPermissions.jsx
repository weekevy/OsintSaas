const RolesPermissions = ({ roles }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
        <h3 className="text-white font-['Poppins'] text-base font-bold">Roles & Permissions</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-150"
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-white font-['Poppins'] font-bold text-base">{role.name}</h4>
              <span className="text-white/40 text-xs font-['Poppins']">{role.members} members</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {role.permissions.map((perm, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60 text-[10px] font-['Poppins']"
                >
                  {perm}
                </span>
              ))}
            </div>
            
            <button className="text-[#00E5FF] hover:text-[#2DD4BF] transition-colors duration-150 text-xs font-['Poppins'] font-semibold flex items-center gap-1">
              Edit Role
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolesPermissions;