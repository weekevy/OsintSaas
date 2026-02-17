import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CurrentProjects = ({ limit = 3, onSelectProject, selectedProjectId }) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  // Auto-select first project when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId && onSelectProject) {
      onSelectProject(projects[0]);
    }
  }, [projects, selectedProjectId, onSelectProject]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityStyles = (priority) => {
    const styles = {
      critical: {
        bg: 'bg-gradient-to-r from-red-500/20 to-red-600/20',
        text: 'text-red-400',
        border: 'border-red-500/30',
        dot: 'bg-red-500',
        gradient: 'from-red-500 to-red-600',
        glow: 'shadow-red-500/20'
      },
      high: {
        bg: 'bg-gradient-to-r from-orange-500/20 to-orange-600/20',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        dot: 'bg-orange-500',
        gradient: 'from-orange-500 to-orange-600',
        glow: 'shadow-orange-500/20'
      },
      medium: {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        dot: 'bg-yellow-500',
        gradient: 'from-yellow-500 to-yellow-600',
        glow: 'shadow-yellow-500/20'
      },
      low: {
        bg: 'bg-gradient-to-r from-green-500/20 to-green-600/20',
        text: 'text-green-400',
        border: 'border-green-500/30',
        dot: 'bg-green-500',
        gradient: 'from-green-500 to-green-600',
        glow: 'shadow-green-500/20'
      }
    };
    return styles[priority] || styles.medium;
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'from-green-500 to-emerald-500';
    if (progress >= 50) return 'from-blue-500 to-cyan-500';
    if (progress >= 25) return 'from-yellow-500 to-orange-500';
    return 'from-purple-500 to-pink-500';
  };

  // Professional SVG Icons for different project types
  const getProjectIcon = (iconName, priority) => {
    const gradientId = `gradient-${iconName}-${priority}`;
    const priorityGradient = {
      critical: { start: '#EF4444', end: '#DC2626' },
      high: { start: '#F97316', end: '#EA580C' },
      medium: { start: '#EAB308', end: '#CA8A04' },
      low: { start: '#10B981', end: '#059669' }
    }[priority] || { start: '#A855F7', end: '#3B82F6' };

    const renderGradient = () => (
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={priorityGradient.start} />
          <stop offset="100%" stopColor={priorityGradient.end} />
        </linearGradient>
      </defs>
    );

    switch(iconName?.toLowerCase()) {
      case '🔍':
      case 'magnifying':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {renderGradient()}
            <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" 
              stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case '🛡️':
      case 'shield':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {renderGradient()}
            <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z" 
              stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case '📊':
      case 'chart':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {renderGradient()}
            <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" 
              stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case '👥':
      case 'team':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {renderGradient()}
            <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 018 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" 
              stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case '🌐':
      case 'globe':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {renderGradient()}
            <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" 
              stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case '📁':
      case 'folder':
      default:
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {renderGradient()}
            <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" 
              stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  const displayedProjects = showAll ? projects : projects.slice(0, limit);

  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 animate-pulse" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-400/50 rounded animate-pulse" />
              </div>
              <div>
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-1" />
                <div className="h-2 w-12 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
            <div className="w-16 h-6 bg-white/10 rounded-lg animate-pulse" />
          </div>
          
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                      <div className="h-3 w-12 bg-white/5 rounded-full animate-pulse" />
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded animate-pulse mb-1" />
                    <div className="h-2 w-2/3 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
      
      <div className="relative p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                {getProjectIcon('folder', 'medium')}
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-purple-500" />
              </div>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Active Projects
                <span className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-white/60">
                  {projects.length}
                </span>
              </h3>
              <p className="text-xs text-white/40">
                Select a project to view details
              </p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/home?tab=projects')}
            className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors flex items-center gap-1 border border-white/10"
          >
            <span>View All</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Projects List - Scrollable Container */}
        {projects.length === 0 ? (
          <div className="relative py-10 px-4 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-blue-500/5 rounded-lg" />
            
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center border border-white/10">
                {getProjectIcon('folder', 'medium')}
              </div>
              
              <h4 className="text-white font-medium mb-2">No projects yet</h4>
              <p className="text-white/40 text-sm mb-4 max-w-sm mx-auto">
                Create your first project to start tracking investigations
              </p>
              
              <button
                onClick={() => navigate('/home?tab=projects')}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Project
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Scrollable container with larger cards */}
            <div 
              className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20 transition-colors"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.1) transparent'
              }}
            >
              {displayedProjects.map((project) => {
                const priorityStyle = getPriorityStyles(project.priority);
                const progressColor = getProgressColor(project.progress);
                const isSelected = selectedProjectId === project.id;
                
                return (
                  <button
                    key={project.id}
                    onClick={() => onSelectProject?.(project)}
                    className={`relative w-full overflow-hidden rounded-xl focus:outline-none transition-all duration-300`}
                  >
                    {/* Main content - Larger with more padding */}
                    <div className={`bg-white/5 p-4 border-2 rounded-xl transition-all duration-300 ${
                      isSelected 
                        ? 'border-purple-500' 
                        : 'border-transparent hover:border-purple-500/50'
                    }`}>
                      <div className="flex items-start gap-3">
                        {/* Icon - Larger */}
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${priorityStyle.bg} flex items-center justify-center flex-shrink-0`}>
                          {getProjectIcon(project.icon, project.priority)}
                        </div>
                        
                        {/* Content - More details */}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-white font-semibold text-base truncate ${
                              isSelected ? priorityStyle.text : ''
                            }`}>
                              {project.name}
                            </h4>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text} border ${priorityStyle.border} flex-shrink-0`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot} ${isSelected ? 'animate-pulse' : ''}`} />
                              {project.priority}
                            </span>
                          </div>
                          
                          {/* Description - Now showing */}
                          <p className="text-white/60 text-sm mb-2 line-clamp-2">
                            {project.description || 'No description provided'}
                          </p>
                          
                          {/* Progress Bar - Larger */}
                          <div className="space-y-1 mb-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-white/40">Progress</span>
                              <span className="text-white font-medium">{project.progress || 0}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500`}
                                style={{ width: `${project.progress || 0}%` }}
                              />
                            </div>
                          </div>
                          
                          {/* Meta Info - More details */}
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <div className="flex items-center gap-1 text-white/40">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              <span>{project.members || 1} {project.members === 1 ? 'member' : 'members'}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-white/40">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{project.dueDate || 'No deadline'}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-white/40">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Show More/Less button */}
            {projects.length > limit && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-3 py-2 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2 border border-white/10"
              >
                <span>
                  {showAll ? 'Show Less' : `Show ${projects.length - limit} More Projects`}
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>

      {/* CSS for custom scrollbar */}
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
          transition: background 0.3s;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default CurrentProjects;
