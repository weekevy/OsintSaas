import { useEffect, useRef } from 'react';

const ProjectDetailsModal = ({ isOpen, onClose, project }) => {
  const modalRef = useRef(null);

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

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden animate-slideUp"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{project.icon || '📁'}</div>
            <div>
              <h2 className="text-2xl font-bold text-white">{project.name}</h2>
              <div className="flex gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(project.priority)}`}>
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

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Description
            </h3>
            <p className="text-white/70 bg-white/5 p-4 rounded-xl border border-white/10">
              {project.description || 'No description provided.'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="text-white/40 text-sm mb-1">Progress</div>
              <div className="text-2xl font-bold text-white">{project.progress || 0}%</div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${project.progress || 0}%` }} />
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="text-white/40 text-sm mb-1">Members</div>
              <div className="text-2xl font-bold text-white">{project.members || 1}</div>
              <div className="text-white/40 text-sm mt-2">Team size</div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="text-white/40 text-sm mb-1">Due Date</div>
              <div className="text-lg font-bold text-white">{project.dueDate || 'No date set'}</div>
              <div className="text-white/40 text-sm mt-2">Deadline</div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="text-white/40 text-sm mb-1">Created</div>
              <div className="text-lg font-bold text-white">
                {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Unknown'}
              </div>
              <div className="text-white/40 text-sm mt-2">Start date</div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Additional Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/40">Project ID:</span>
                <span className="text-white/80 ml-2 font-mono">{project.id}</span>
              </div>
              <div>
                <span className="text-white/40">Icon:</span>
                <span className="text-white/80 ml-2">{project.icon}</span>
              </div>
              <div>
                <span className="text-white/40">Color:</span>
                <span className="text-white/80 ml-2 capitalize">{project.color}</span>
              </div>
              <div>
                <span className="text-white/40">Threat Level:</span>
                <span className={`ml-2 ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-white/10 bg-black/20">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
