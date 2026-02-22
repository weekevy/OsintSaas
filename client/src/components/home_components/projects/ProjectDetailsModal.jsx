import { useEffect, useRef, useState } from 'react';

const ProjectDetailsModal = ({ isOpen, onClose, project }) => {
  const modalRef = useRef(null);
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Fetch assets when modal opens
  useEffect(() => {
    if (isOpen && project?.id) {
      fetchAssets();
    }
  }, [isOpen, project?.id]);

  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/assets`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'planning': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-white/20 text-white/60 border-white/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-white/40 bg-white/5';
    }
  };

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get asset icon based on type
  const getAssetIcon = (type) => {
    switch(type) {
      case 'url':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'suspicious_url':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        );
      case 'document':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.57 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        );
      case 'phone':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        );
      case 'crypto':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
    }
  };

  // Get asset color based on type
  const getAssetColor = (type) => {
    switch(type) {
      case 'url': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'linkedin': return 'from-sky-500/20 to-blue-500/20 border-sky-500/30';
      case 'suspicious_url': return 'from-red-500/20 to-orange-500/20 border-red-500/30';
      case 'image': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'document': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'email': return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      case 'phone': return 'from-teal-500/20 to-cyan-500/20 border-teal-500/30';
      case 'crypto': return 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30';
      default: return 'from-white/5 to-white/10 border-white/10';
    }
  };

  // Folder icon SVG component
  const FolderIcon = () => (
    <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden animate-slideUp"
      >
        {/* Header with gradient background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
          <div className="relative p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Icon with glow - Fixed folder icon */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <FolderIcon />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-30" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{project.name}</h2>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className={`px-3 py-1 text-xs rounded-full ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          {/* Description Card */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Description
            </h3>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-white/70 leading-relaxed">
                {project.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4 rounded-xl border border-purple-500/30">
              <div className="text-purple-400 text-sm mb-1">Progress</div>
              <div className="text-2xl font-bold text-white">{project.progress || 0}%</div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${project.progress || 0}%` }} 
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 rounded-xl border border-blue-500/30">
              <div className="text-blue-400 text-sm mb-1">Members</div>
              <div className="text-2xl font-bold text-white">{project.members || 1}</div>
              <div className="text-white/40 text-xs mt-2">Team members</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-4 rounded-xl border border-orange-500/30">
              <div className="text-orange-400 text-sm mb-1">Due Date</div>
              <div className="text-lg font-bold text-white">{formatDate(project.dueDate)}</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 rounded-xl border border-green-500/30">
              <div className="text-green-400 text-sm mb-1">Created</div>
              <div className="text-lg font-bold text-white">{formatDate(project.created_at)}</div>
            </div>
          </div>

          {/* Assets Section - Display Only (No Add/Delete) */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Project Assets ({assets.length})
            </h3>

            {loadingAssets ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : assets.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {assets.map((asset) => (
                  <a
                    key={asset.id}
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative bg-gradient-to-br ${getAssetColor(asset.asset_type)} rounded-xl p-4 border hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer`}
                  >
                    <div className="flex flex-col items-start gap-2">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAssetColor(asset.asset_type).split(' ')[0]} bg-opacity-30 flex items-center justify-center`}>
                        <span className="text-purple-400">{getAssetIcon(asset.asset_type)}</span>
                      </div>
                      <div className="flex-1 min-w-0 w-full">
                        <h5 className="text-white font-medium text-sm truncate group-hover:text-purple-400 transition-colors">
                          {asset.title}
                        </h5>
                        {asset.url && (
                          <p className="text-white/40 text-xs truncate mt-1">{asset.url}</p>
                        )}
                        {asset.description && (
                          <p className="text-white/40 text-xs mt-1 line-clamp-2">{asset.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40 capitalize">
                            {asset.asset_type}
                          </span>
                          <span className="text-white/30 text-[10px]">
                            {formatDate(asset.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                <svg className="w-12 h-12 mx-auto text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-white/40 text-sm">No assets for this project</p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Additional Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Project ID</span>
                  <span className="text-white/80 font-mono">#{project.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Icon</span>
                  <span className="text-white/80">
                    <FolderIcon />
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Color Theme</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full bg-gradient-to-r from-${project.color}-500 to-${project.color}-600`} />
                    <span className="text-white/80 capitalize">{project.color}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Assets</span>
                  <span className="text-white/80">{assets.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Last Updated</span>
                  <span className="text-white/80">
                    {project.updated_at ? formatDate(project.updated_at) : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Threat Level</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-white/10 bg-black/20">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
