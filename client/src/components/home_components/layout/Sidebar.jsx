const Sidebar = ({ isCollapsed, onToggleCollapse, activeTab, onTabChange, navItems }) => {
  return (
    <aside 
      className={`
        hidden lg:flex h-full flex-col
        ${isCollapsed ? 'w-20' : 'w-72'}
        bg-gradient-to-b from-gray-900 to-black border-r border-white/10 
        transition-all duration-300 overflow-hidden
      `}
    >
      {/* Logo Area - Button centered when collapsed */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-white/10 flex-shrink-0`}>
        {!isCollapsed && (
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
            Osint<span className="text-white">Saas</span>
          </h1>
        )}
        <button 
          onClick={onToggleCollapse}
          className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg flex-shrink-0"
        >
          {isCollapsed ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation - Fixed scrolling */}
      <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
        <div className="space-y-1 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl transition-all duration-200 group relative
                ${activeTab === item.id 
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
            >
              <span className="text-current flex-shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <span className="ml-3 font-medium text-sm lg:text-base truncate">{item.label}</span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 rounded-lg text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] border border-white/10 shadow-2xl">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Storage Icon - Just the icon when collapsed */}
      {isCollapsed ? (
        <div className="p-3 mb-4 flex-shrink-0">
          <div className="relative group flex justify-center">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 rounded-lg text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] border border-white/10 shadow-2xl">
              Storage: 2.3GB of 5GB used
            </div>
          </div>
        </div>
      ) : (
        /* Storage Section - Only when expanded */
        <div className="p-3 mb-4 flex-shrink-0">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">Storage</span>
              <span className="text-white font-medium">45%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[45%] bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
            </div>
            <p className="text-xs text-white/40 mt-3 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              2.3GB of 5GB used
            </p>
            
            {/* Upgrade Button */}
            <button className="w-full mt-3 py-2 px-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500 hover:to-blue-500 text-purple-400 hover:text-white rounded-lg border border-purple-500/30 hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium group">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Upgrade Storage</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
