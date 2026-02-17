import { useEffect, useRef, useState } from 'react';
import ProjectAssets from './ProjectAssets';

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

  const handleDeleteAsset = async (assetId) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      const response = await fetch(`/api/projects/${project.id}/assets/${assetId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Refresh assets
        fetchAssets();
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
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
                {/* Icon with glow */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-3xl">
                    {project.icon || '📁'}
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

          {/* Stats Grid - Redesigned */}
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

          {/* Assets Section - NEW */}
          <div className="mb-6">
            <ProjectAssets
              projectId={project.id}
              assets={assets}
              onAddAsset={fetchAssets}
              onDeleteAsset={handleDeleteAsset}
            />
            {loadingAssets && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Additional Info - Redesigned */}
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
                  <span className="text-white/80">{project.icon}</span>
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
