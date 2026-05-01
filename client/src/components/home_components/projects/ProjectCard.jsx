import React, { useState } from 'react';
import AddAssets from './AddAssets';

const ProjectCard = ({ project, onEdit, onDelete, onView, onAddAsset }) => {
  const [isAddAssetsOpen, setIsAddAssetsOpen] = useState(false);

  console.log('🎴 ProjectCard rendering for:', project?.name);
  console.log('   Handlers - onEdit:', !!onEdit, 'onDelete:', !!onDelete, 'onView:', !!onView, 'onAddAsset:', !!onAddAsset);

  // Professional SVG Icons
  const getIcon = (type, className = "w-4 h-4") => {
    switch(type) {
      case 'members':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
        );
      case 'assets':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10" />
          </svg>
        );
      case 'view':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        );
      case 'add':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10" />
          </svg>
        );
      case 'edit':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        );
      case 'delete':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        );
      case 'progress':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/30';
      case 'review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'planning': return 'bg-[#2DD4BF]/20 text-[#2DD4BF] border-[#2DD4BF]/30';
      case 'completed': return 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/30';
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-white/20 text-white/60 border-white/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-[#00E5FF] bg-[#00E5FF]/20';
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

  const handleAddAssetClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('➕ Add Asset button clicked for:', project?.name);
    setIsAddAssetsOpen(true);
    if (onAddAsset && typeof onAddAsset === 'function') {
      onAddAsset(project);
    }
  };

  const handleAssetsAdded = () => {
    console.log('✅ Assets added for project:', project?.name);
    if (onAddAsset) {
      onAddAsset(project);
    }
  };

  if (!project) {
    console.error('❌ ProjectCard received no project prop!');
    return null;
  }

  return (
    <>
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

        {/* Progress with SVG icon */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            {getIcon('progress', 'w-4 h-4 text-purple-400')}
            <span className="text-white/60 text-sm">Progress</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/40">{project.progress || 0}%</span>
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
              {getIcon('members', 'w-4 h-4 text-white/40')}
              <span className="text-white/60 text-sm">{project.members || 1}</span>
            </div>
            <div className="flex items-center gap-1">
              {getIcon('calendar', 'w-4 h-4 text-white/40')}
              <span className="text-white/60 text-sm">{project.dueDate || 'No date'}</span>
            </div>
            <div className="flex items-center gap-1">
              {getIcon('assets', 'w-4 h-4 text-white/40')}
              <span className="text-white/60 text-sm">{project.asset_count || 0} assets</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/10">
          {/* View Button */}
          <button
            type="button"
            onClick={handleView}
            className="flex flex-col items-center justify-center p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all group"
            title="View Details"
          >
            <div className="mb-1 group-hover:scale-110 transition-transform">
              {getIcon('view', 'w-4 h-4')}
            </div>
            <span className="text-xs">View</span>
          </button>

          {/* Add Asset Button */}
          <button
            type="button"
            onClick={handleAddAssetClick}
            className="flex flex-col items-center justify-center p-2 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white rounded-lg transition-all group"
            title="Add Asset"
          >
            <div className="mb-1 group-hover:scale-110 transition-transform">
              {getIcon('add', 'w-4 h-4')}
            </div>
            <span className="text-xs">Add Asset</span>
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={handleEdit}
            className="flex flex-col items-center justify-center p-2 bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-white rounded-lg transition-all group"
            title="Edit Project"
          >
            <div className="mb-1 group-hover:scale-110 transition-transform">
              {getIcon('edit', 'w-4 h-4')}
            </div>
            <span className="text-xs">Edit</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            className="flex flex-col items-center justify-center p-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all group"
            title="Delete Project"
          >
            <div className="mb-1 group-hover:scale-110 transition-transform">
              {getIcon('delete', 'w-4 h-4')}
            </div>
            <span className="text-xs">Delete</span>
          </button>
        </div>

        {/* Asset count badge */}
        {project.asset_count > 0 && (
          <div className="absolute top-2 right-2">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
              {getIcon('assets', 'w-3 h-3')}
              <span>{project.asset_count}</span>
            </div>
          </div>
        )}
      </div>

      {/* Add Assets Modal */}
      <AddAssets
        isOpen={isAddAssetsOpen}
        onClose={() => setIsAddAssetsOpen(false)}
        projectId={project.id}
        onAssetsAdded={handleAssetsAdded}
      />
    </>
  );
};

export default ProjectCard;
