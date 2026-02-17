import React from 'react';

const ProjectCard = ({ project, onEdit, onDelete, onView }) => {
  console.log('🎴 ProjectCard rendering for:', project?.name);
  console.log('   Handlers - onEdit:', !!onEdit, 'onDelete:', !!onDelete, 'onView:', !!onView);

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'planning': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('✏️ Edit button clicked for:', project?.name);
    if (onEdit && typeof onEdit === 'function') {
      onEdit(project);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🗑️ Delete button clicked for:', project?.name);
    if (onDelete && typeof onDelete === 'function') {
      onDelete(project);
    }
  };

  const handleView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('👁️ View button clicked for:', project?.name);
    if (onView && typeof onView === 'function') {
      onView(project);
    }
  };

  if (!project) {
    console.error('❌ ProjectCard received no project prop!');
    return null;
  }

  return (
    <div className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/20">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
              {project.name || 'Unnamed Project'}
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(project.status)}`}>
              {project.status || 'unknown'}
            </span>
          </div>
          <p className="text-white/60 text-sm line-clamp-2">{project.description || 'No description'}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(project.priority)}`}>
          {project.priority || 'unknown'}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-white/60">Progress</span>
          <span className="text-white font-medium">{project.progress || 0}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${project.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Footer with Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-white/60 text-sm">{project.members || 1}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-white/60 text-sm">{project.dueDate || 'No date'}</span>
          </div>
          {/* Asset count indicator */}
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-white/60 text-sm">{project.asset_count || 0} assets</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/10">
        {/* View Button */}
        <button
          type="button"
          onClick={handleView}
          className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>View</span>
        </button>

        {/* Edit Button */}
        <button
          type="button"
          onClick={handleEdit}
          className="flex-1 px-3 py-2 bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-white rounded-lg transition-all flex items-center justify-center gap-2 text-sm border border-purple-500/30 hover:border-transparent"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Edit</span>
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={handleDelete}
          className="px-3 py-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all flex items-center justify-center border border-red-500/30 hover:border-transparent"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
