const TeamSettings = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
          <h3 className="text-white font-['Poppins'] text-base font-bold">General Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <div>
              <h4 className="text-white font-['Poppins'] font-semibold text-sm">Team Name</h4>
              <p className="text-white/40 text-xs font-['Poppins']">Change your team display name</p>
            </div>
            <button className="px-4 py-2 border border-white/10 rounded-lg text-white/60 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition-colors duration-150 text-xs font-['Poppins']">
              Edit
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <div>
              <h4 className="text-white font-['Poppins'] font-semibold text-sm">Team Logo</h4>
              <p className="text-white/40 text-xs font-['Poppins']">Update your team avatar</p>
            </div>
            <button className="px-4 py-2 border border-white/10 rounded-lg text-white/60 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition-colors duration-150 text-xs font-['Poppins']">
              Change
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
            <div>
              <h4 className="text-white font-['Poppins'] font-semibold text-sm">Default Role</h4>
              <p className="text-white/40 text-xs font-['Poppins']">Set role for new members</p>
            </div>
            <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-['Poppins'] focus:outline-none focus:border-[#00E5FF]/50 transition-colors">
              <option className="bg-[#0a0a0a]">Analyst</option>
              <option className="bg-[#0a0a0a]">Investigator</option>
              <option className="bg-[#0a0a0a]">Viewer</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-[#f87171] to-[#ef4444] rounded-full" />
          <h3 className="text-white font-['Poppins'] text-base font-bold">Danger Zone</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <div>
            <h4 className="text-white font-['Poppins'] font-semibold text-sm">Delete Team</h4>
            <p className="text-white/40 text-xs font-['Poppins']">Permanently delete this team and all data</p>
          </div>
          <button className="px-4 py-2 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors duration-150 text-xs font-['Poppins']">
            Delete Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamSettings;