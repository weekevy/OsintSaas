import { useState, useEffect, useRef } from 'react';

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

  // New state for initial asset
  const [addInitialAsset, setAddInitialAsset] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [initialAsset, setInitialAsset] = useState({
    type: 'url',
    title: '',
    url: '',
    description: '',
    file: null
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

  const getAssetIcon = (type, className = "w-5 h-5") => {
    switch(type) {
      case 'url':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'suspicious_url':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'image':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        );
      case 'document':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      default:
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        );
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
      case 'upload':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        );
      case 'link':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInitialAsset({
        ...initialAsset,
        file,
        title: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = initialData ? { ...formData, id: initialData.id } : formData;
    
    // If adding initial asset, include it in the submission
    if (addInitialAsset) {
      if (initialAsset.file || (initialAsset.title && initialAsset.url)) {
        submitData.initialAsset = initialAsset;
      }
    }
    
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

  const assetTypes = [
    { value: 'url', label: 'URL', icon: getAssetIcon('url'), color: 'from-blue-500 to-cyan-500' },
    { value: 'linkedin', label: 'LinkedIn', icon: getAssetIcon('linkedin'), color: 'from-sky-500 to-blue-500' },
    { value: 'suspicious_url', label: 'Suspicious', icon: getAssetIcon('suspicious_url'), color: 'from-red-500 to-orange-500' },
    { value: 'image', label: 'Image', icon: getAssetIcon('image'), color: 'from-purple-500 to-pink-500' },
    { value: 'document', label: 'Document', icon: getAssetIcon('document'), color: 'from-green-500 to-emerald-500' },
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

          {/* Icon and Color - Responsive grid */}
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

            {/* Color Selection - Compact */}
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

          {/* Initial Asset Section - Fancy checkbox and matching ProjectAssets design */}
          <div className="border-t border-white/10 pt-4 mt-2">
            <label className="flex items-center gap-3 text-white/80 text-sm mb-4 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={addInitialAsset}
                  onChange={(e) => setAddInitialAsset(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                  addInitialAsset 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 border-transparent' 
                    : 'bg-white/5 border-white/20 group-hover:border-white/40'
                }`}>
                  {addInitialAsset && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="group-hover:text-white transition-colors font-medium">Add initial asset to project</span>
            </label>

            {addInitialAsset && (
              <div className="space-y-4 pl-6 border-l-2 border-purple-500/30 animate-fadeIn">
                {/* Asset Type Selector - Matching ProjectAssets */}
                <div>
                  <label className="block text-white/60 text-xs mb-2">Asset Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {assetTypes.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setInitialAsset({ ...initialAsset, type: type.value, file: null })}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                          initialAsset.type === type.value
                            ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-lg`
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-purple-400">{type.icon}</span>
                        <span className="text-xs hidden sm:block">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-white/60 text-xs mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="Asset title"
                    value={initialAsset.title}
                    onChange={(e) => setInitialAsset({ ...initialAsset, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Conditional Input based on type - Matching ProjectAssets */}
                {['url', 'linkedin', 'suspicious_url'].includes(initialAsset.type) && (
                  <div>
                    <label className="block text-white/60 text-xs mb-1">URL</label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={initialAsset.url}
                        onChange={(e) => setInitialAsset({ ...initialAsset, url: e.target.value })}
                        className="w-full px-3 py-2 pl-8 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40">
                        {getActionIcon('link')}
                      </span>
                    </div>
                  </div>
                )}

                {/* File Upload for images/documents - Matching ProjectAssets */}
                {['image', 'document'].includes(initialAsset.type) && (
                  <div>
                    <label className="block text-white/60 text-xs mb-1">File</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept={initialAsset.type === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt'}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500/50 transition-colors group"
                    >
                      {initialAsset.file ? (
                        <div className="text-white/80 text-sm">
                          {initialAsset.file.name}
                          <span className="text-white/40 text-xs block mt-1">
                            {(initialAsset.file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className="text-white/40 group-hover:text-purple-400 transition-colors inline-block">
                            {getActionIcon('upload')}
                          </span>
                          <p className="text-white/40 text-sm mt-1">
                            Click to upload {initialAsset.type}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-white/60 text-xs mb-1">Description (optional)</label>
                  <textarea
                    placeholder="Add notes about this asset..."
                    value={initialAsset.description}
                    onChange={(e) => setInitialAsset({ ...initialAsset, description: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            )}
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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreateProjectModal;
