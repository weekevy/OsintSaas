import { useState, useEffect } from 'react';

const CreateProjectModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    dueDate: '',
    icon: 'folder',
    color: 'purple'
  });

  // SVG Icons
  const getIcon = (type, className = "w-5 h-5") => {
    switch(type) {
      case 'folder':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
        );
      case 'magnifying':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        );
      case 'shield':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        );
      case 'team':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 018 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        );
      case 'globe':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getActionIcon = (action) => {
    switch(action) {
      case 'close':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'add':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        status: initialData.status || 'planning',
        priority: initialData.priority || 'medium',
        dueDate: initialData.dueDate || '',
        icon: initialData.icon || 'folder',
        color: initialData.color || 'purple'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        dueDate: '',
        icon: 'folder',
        color: 'purple'
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = initialData ? { ...formData, id: initialData.id } : formData;
    onSubmit(submitData);
  };

  const iconOptions = [
    { value: 'folder', label: 'Folder', icon: getIcon('folder') },
    { value: 'magnifying', label: 'Search', icon: getIcon('magnifying') },
    { value: 'shield', label: 'Shield', icon: getIcon('shield') },
    { value: 'chart', label: 'Chart', icon: getIcon('chart') },
    { value: 'team', label: 'Team', icon: getIcon('team') },
    { value: 'globe', label: 'Globe', icon: getIcon('globe') },
  ];

  const colorOptions = [
    { value: 'purple', gradient: 'from-purple-500 to-blue-500' },
    { value: 'blue', gradient: 'from-blue-500 to-cyan-500' },
    { value: 'green', gradient: 'from-green-500 to-emerald-500' },
    { value: 'red', gradient: 'from-red-500 to-orange-500' },
    { value: 'orange', gradient: 'from-orange-500 to-red-500' },
    { value: 'pink', gradient: 'from-pink-500 to-purple-500' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden animate-slideUp">
        
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
          <div className="relative flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">
                {initialData ? getIcon('folder') : getActionIcon('add')}
              </span>
              {initialData ? 'Edit Project' : 'Create New Project'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              {getActionIcon('close')}
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin">
          
          {/* Project Name */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Project Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="e.g., Phishing Investigation 2026"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              placeholder="Describe the project goals and scope..."
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
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
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {/* Icon and Color */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Icon Selection */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">Project Icon</label>
              <div className="grid grid-cols-3 gap-2">
                {iconOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: option.value })}
                    className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                      formData.icon === option.value
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-transparent shadow-lg shadow-purple-500/30'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-purple-400">{option.icon}</span>
                    <span className="text-xs hidden sm:block">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">Theme Color</label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: option.value })}
                    className={`p-2 rounded-lg border transition-all ${
                      formData.color === option.value
                        ? `bg-gradient-to-r ${option.gradient} border-transparent ring-2 ring-white shadow-lg`
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-full h-6 rounded bg-gradient-to-r ${option.gradient}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-3 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {getActionIcon('add')}
              {initialData ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreateProjectModal;
