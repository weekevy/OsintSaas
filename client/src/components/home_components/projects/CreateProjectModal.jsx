import { useState, useEffect } from 'react';

const CreateProjectModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active', // Changed from 'planning' to 'active' to match DB
    priority: 'medium',
    dueDate: '',
    icon: 'folder',
    color: 'purple'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        status: initialData.status || 'active',
        priority: initialData.priority || 'medium',
        dueDate: initialData.dueDate || '',
        icon: initialData.icon || 'folder',
        color: initialData.color || 'purple'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'active',
        priority: 'medium',
        dueDate: '',
        icon: 'folder',
        color: 'purple'
      });
    }
  }, [initialData, isOpen]);

  // Professional SVG Icons
  const getIconSVG = (iconName) => {
    switch(iconName) {
      case 'folder':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="url(#gradient-icon)" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
        );
      case 'magnifying':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="url(#gradient-icon)" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        );
      case 'shield':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="url(#gradient-icon)" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="url(#gradient-icon)" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        );
      case 'team':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="url(#gradient-icon)" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        );
      case 'globe':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="url(#gradient-icon)" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (typeof onSubmit !== 'function') {
      console.error('onSubmit is not a function!', onSubmit);
      return;
    }
    
    const submitData = initialData ? { ...formData, id: initialData.id } : formData;
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden animate-slideUp">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            {initialData ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form - Wider with better spacing */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
          
          {/* Project Name */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Project Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="e.g., Phishing Investigation 2026"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              placeholder="Describe the project goals and scope..."
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="active">Active</option>
                <option value="planning">Planning</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Icon and Color */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Icon</label>
              <div className="relative">
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                >
                  <option value="folder">Folder</option>
                  <option value="magnifying">Magnifying Glass</option>
                  <option value="shield">Shield</option>
                  <option value="chart">Chart</option>
                  <option value="team">Team</option>
                  <option value="globe">Globe</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
                  {getIconSVG(formData.icon)}
                  <svg width="0" height="0">
                    <linearGradient id="gradient-icon" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop stopColor="#A855F7" />
                      <stop offset="1" stopColor="#3B82F6" />
                    </linearGradient>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Color</label>
              <div className="flex gap-2">
                {['purple', 'blue', 'green', 'red', 'orange', 'pink'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    className={`w-8 h-8 rounded-full transition-all ${
                      formData.color === c ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    style={{
                      background: c === 'purple' ? 'linear-gradient(135deg, #A855F7, #3B82F6)' :
                                  c === 'blue' ? 'linear-gradient(135deg, #3B82F6, #06B6D4)' :
                                  c === 'green' ? 'linear-gradient(135deg, #10B981, #059669)' :
                                  c === 'red' ? 'linear-gradient(135deg, #EF4444, #DC2626)' :
                                  c === 'orange' ? 'linear-gradient(135deg, #F97316, #EA580C)' :
                                  'linear-gradient(135deg, #EC4899, #DB2777)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              {initialData ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
