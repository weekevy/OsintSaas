import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const CurrentModules = ({ 
  limit = 3, 
  onSelectModule, 
  selectedModuleId,
  scanData = []
}) => {
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  // Use useMemo to prevent unnecessary recalculations
  const modules = useMemo(() => scanData || [], [scanData]);

  // Calculate stats with useMemo
  const moduleStats = useMemo(() => {
    const stats = {
      active: 0,
      completed: 0,
      pending: 0,
      failed: 0
    };
    
    modules.forEach(module => {
      if (stats.hasOwnProperty(module.status)) {
        stats[module.status] = (stats[module.status] || 0) + 1;
      }
    });
    
    return stats;
  }, [modules]);

  // Memoize displayed modules
  const displayedModules = useMemo(() => 
    showAll ? modules : modules.slice(0, limit),
    [modules, showAll, limit]
  );

  // Memoize status styles to prevent recreation
  const getStatusStyles = useCallback((status) => {
    const styles = {
      active: {
        bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
        text: 'text-green-400',
        border: 'border-green-500/30',
        dot: 'bg-green-500',
        gradient: 'from-green-500 to-emerald-500',
        label: 'Active',
        icon: (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      pending: {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        dot: 'bg-yellow-500',
        gradient: 'from-yellow-500 to-amber-500',
        label: 'Pending',
        icon: (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      completed: {
        bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        dot: 'bg-blue-500',
        gradient: 'from-blue-500 to-cyan-500',
        label: 'Completed',
        icon: (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      },
      failed: {
        bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
        text: 'text-red-400',
        border: 'border-red-500/30',
        dot: 'bg-red-500',
        gradient: 'from-red-500 to-rose-500',
        label: 'Failed',
        icon: (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      }
    };
    return styles[status] || styles.pending;
  }, []);

  // Memoize progress color function
  const getProgressColor = useCallback((progress) => {
    if (progress >= 75) return 'from-green-500 to-emerald-500';
    if (progress >= 50) return 'from-blue-500 to-cyan-500';
    if (progress >= 25) return 'from-yellow-500 to-orange-500';
    return 'from-purple-500 to-pink-500';
  }, []);

  // Memoize icon component to prevent recreation
  const ModuleIcon = useCallback(({ type }) => {
    const icons = {
      linkedin: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75M7.5 6v.75m0 3v.75m0 3v.75M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3zm3 6.75h6m-6 3h3" />
        </svg>
      ),
      crypto: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      email: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.57 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      website: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
      phone: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      ),
      default: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      )
    };
    
    return icons[type] || icons.default;
  }, []);

  // Memoize module item to prevent re-renders
  const ModuleItem = useCallback(({ module, isSelected }) => {
    const statusStyle = getStatusStyles(module.status);
    const progressColor = getProgressColor(module.progress);
    
    return (
      <button
        onClick={() => onSelectModule?.(module)}
        className={`relative w-full overflow-hidden rounded-xl focus:outline-none transition-all duration-300`}
      >
        <div className={`bg-white/5 p-3 sm:p-4 border-2 rounded-xl transition-all duration-300 ${
          isSelected 
            ? 'border-purple-500' 
            : 'border-transparent hover:border-purple-500/50'
        }`}>
          <div className="flex items-start gap-2 sm:gap-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${statusStyle.bg} flex items-center justify-center flex-shrink-0`}>
              <ModuleIcon type={module.type} />
            </div>
            
            <div className="flex-1 min-w-0 text-left">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                <h4 className={`text-white font-semibold text-sm sm:text-base truncate max-w-[120px] sm:max-w-none ${
                  isSelected ? statusStyle.text : ''
                }`}>
                  {module.name}
                </h4>
                <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} flex-shrink-0`}>
                  {statusStyle.icon}
                  <span className="hidden xs:inline">{statusStyle.label}</span>
                </span>
              </div>
              
              <p className="text-white/60 text-xs sm:text-sm mb-2 truncate">
                {module.target}
              </p>
              
              {module.status !== 'completed' && module.status !== 'failed' && (
                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-between text-[10px] sm:text-xs">
                    <span className="text-white/40">Progress</span>
                    <span className="text-white font-medium">{module.progress}%</span>
                  </div>
                  <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500`}
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {module.status === 'failed' && module.error && (
                <div className="mb-2 p-1.5 sm:p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-red-400 text-[10px] sm:text-xs">{module.error}</p>
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
                <div className="flex items-center gap-1 text-white/40">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="truncate max-w-[50px] sm:max-w-none">{module.startTime}</span>
                </div>
                
                {module.findings > 0 && (
                  <div className="flex items-center gap-1">
                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium ${
                      module.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      module.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {module.findings} findings
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }, [onSelectModule, getStatusStyles, getProgressColor, ModuleIcon]);

  // Handle navigation
  const handleViewAll = useCallback(() => {
    navigate('/home?tab=scan');
  }, [navigate]);

  const handleStartScan = useCallback(() => {
    navigate('/home?tab=scan');
  }, [navigate]);

  const handleShowMore = useCallback(() => {
    setShowAll(prev => !prev);
  }, []);

  if (modules.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden w-full p-3 sm:p-4 lg:p-5">
        <div className="flex flex-col items-center justify-center py-8 sm:py-10 px-4 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mb-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center border border-white/10">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          
          <h4 className="text-white font-medium text-sm sm:text-base mb-2">No active modules</h4>
          <p className="text-white/40 text-xs sm:text-sm mb-4 max-w-sm mx-auto">
            No scans are currently running
          </p>
          
          <button
            onClick={handleStartScan}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs sm:text-sm rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Scan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden w-full">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl hidden sm:block" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl hidden sm:block" />
      
      <div className="relative p-3 sm:p-4 lg:p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              {moduleStats.active > 0 && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-green-500" />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white flex items-center gap-2">
                Active Modules
                <span className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-white/60">
                  {modules.length}
                </span>
              </h3>
              <p className="text-[10px] sm:text-xs text-white/40">
                Real-time module status
              </p>
            </div>
          </div>
          
          <button
            onClick={handleViewAll}
            className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors flex items-center justify-center gap-1 border border-white/10 w-full sm:w-auto"
          >
            <span>View All</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
            <div className="text-green-400 text-base sm:text-lg lg:text-xl font-bold">{moduleStats.active}</div>
            <div className="text-white/40 text-[10px] sm:text-xs">Active</div>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-2 border border-yellow-500/20">
            <div className="text-yellow-400 text-base sm:text-lg lg:text-xl font-bold">{moduleStats.pending}</div>
            <div className="text-white/40 text-[10px] sm:text-xs">Pending</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20">
            <div className="text-blue-400 text-base sm:text-lg lg:text-xl font-bold">{moduleStats.completed}</div>
            <div className="text-white/40 text-[10px] sm:text-xs">Completed</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-2 border border-red-500/20">
            <div className="text-red-400 text-base sm:text-lg lg:text-xl font-bold">{moduleStats.failed}</div>
            <div className="text-white/40 text-[10px] sm:text-xs">Failed</div>
          </div>
        </div>

        {/* Modules List */}
        <div 
          className="space-y-3 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20 transition-colors"
          style={{
            maxHeight: 'min(380px, 50vh)',
            minHeight: '200px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent'
          }}
        >
          {displayedModules.map((module) => (
            <ModuleItem 
              key={module.id} 
              module={module} 
              isSelected={selectedModuleId === module.id}
            />
          ))}
        </div>

        {/* Show More/Less button */}
        {modules.length > limit && (
          <button
            onClick={handleShowMore}
            className="w-full mt-3 py-2 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs sm:text-sm text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2 border border-white/10"
          >
            <span>
              {showAll ? 'Show Less' : `Show ${modules.length - limit} More`}
            </span>
            <svg 
              className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        @media (max-width: 640px) {
          .scrollbar-thin::-webkit-scrollbar {
            width: 2px;
          }
        }
      `}</style>
    </div>
  );
};

export default CurrentModules;
