import { useState } from 'react';

const RolesPermissions = ({ roles }) => {
  const [selectedRole, setSelectedRole] = useState(roles[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Roles List - Tactical */}
      <div className="lg:col-span-1 space-y-2">
        {roles.map((role) => (
          <button
            key={role.name}
            onClick={() => setSelectedRole(role)}
            className={`w-full p-3 border transition-all text-left
              ${selectedRole.name === role.name
                ? 'border-[#00ff88] bg-[#00ff88]/5'
                : 'border-white/10 hover:border-white/20'
              }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-mono text-[9px] font-bold uppercase tracking-[0.08em]">{role.name}</span>
              <span className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">{role.members} MEMBERS</span>
            </div>
            <p className="text-white/40 text-[8px] font-mono leading-relaxed line-clamp-2">
              {role.permissions.slice(0, 3).join(' • ')}
            </p>
          </button>
        ))}

        <button className="w-full p-3 border border-dashed border-white/20 text-white/40 hover:text-white hover:border-[#00ff88]/50 hover:bg-[#00ff88]/5 transition-all flex items-center justify-center gap-2 text-[9px] font-mono uppercase tracking-[0.08em]">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>CREATE ROLE</span>
        </button>
      </div>

      {/* Permissions Matrix - Tactical */}
      <div className="lg:col-span-2">
        <div className="bg-[#090c0e] border border-white/10 p-5 relative">
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
          
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em]">{selectedRole.name} PERMISSIONS</h3>
            <button className="px-3 py-1.5 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10 transition-all text-[8px] font-mono uppercase tracking-[0.08em]">
              EDIT ROLE
            </button>
          </div>

          <div className="space-y-4">
            {[
              {
                category: 'INVESTIGATIONS',
                permissions: [
                  'Create investigations',
                  'View investigations',
                  'Edit investigations',
                  'Delete investigations',
                  'Export investigation data'
                ]
              },
              {
                category: 'REPORTS',
                permissions: [
                  'Generate reports',
                  'Schedule reports',
                  'Export reports',
                  'Delete reports',
                  'Create report templates'
                ]
              },
              {
                category: 'TEAM',
                permissions: [
                  'View team members',
                  'Invite members',
                  'Remove members',
                  'Edit roles',
                  'Manage permissions'
                ]
              },
              {
                category: 'SETTINGS',
                permissions: [
                  'View settings',
                  'Edit settings',
                  'Manage billing',
                  'View API keys',
                  'Manage API keys'
                ]
              }
            ].map((category) => (
              <div key={category.category} className="border-b border-white/10 pb-3 last:border-0">
                <h4 className="text-white/50 text-[8px] font-mono uppercase tracking-[0.12em] mb-2">{category.category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {category.permissions.map((permission) => (
                    <label key={permission} className="flex items-center gap-2 p-1.5 cursor-pointer border border-transparent hover:border-[#00ff88]/20 transition-all">
                      <input
                        type="checkbox"
                        checked={selectedRole.permissions.includes(permission)}
                        readOnly
                        className="w-3 h-3 border border-white/20 bg-transparent text-[#00ff88] focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-white/60 hover:text-white text-[8px] font-mono uppercase tracking-[0.08em]">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;