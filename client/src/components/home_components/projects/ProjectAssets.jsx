import { useState, useRef } from 'react';

const ProjectAssets = ({ projectId, assets, onAddAsset, onDeleteAsset, onRefresh }) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [newAsset, setNewAsset] = useState({
    type: 'url',
    title: '',
    url: '',
    description: '',
    file: null
  });

  // SVG Icons for asset types
  const getTypeIcon = (type, className = "w-5 h-5") => {
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
    }
  };

  // SVG Icons for actions
  const getActionIcon = (action) => {
    switch(action) {
      case 'add':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        );
      case 'upload':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        );
      case 'delete':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        );
      case 'close':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

  const assetTypes = [
    { value: 'url', label: 'URL', icon: getTypeIcon('url', 'w-5 h-5'), color: 'from-blue-500 to-cyan-500' },
    { value: 'linkedin', label: 'LinkedIn Profile', icon: getTypeIcon('linkedin', 'w-5 h-5'), color: 'from-sky-500 to-blue-500' },
    { value: 'suspicious_url', label: 'Suspicious URL', icon: getTypeIcon('suspicious_url', 'w-5 h-5'), color: 'from-red-500 to-orange-500' },
    { value: 'image', label: 'Image', icon: getTypeIcon('image', 'w-5 h-5'), color: 'from-purple-500 to-pink-500' },
    { value: 'document', label: 'Document', icon: getTypeIcon('document', 'w-5 h-5'), color: 'from-green-500 to-emerald-500' },
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAsset({
        ...newAsset,
        file,
        title: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document'
      });
    }
  };

  const handleAddAsset = async () => {
    if (!newAsset.title) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      let response;
      
      if (newAsset.file) {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', newAsset.file);
        formData.append('title', newAsset.title);
        formData.append('type', newAsset.type);
        formData.append('description', newAsset.description || '');

        response = await fetch(`/api/projects/${projectId}/assets/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
      } else {
        // Handle URL asset
        response = await fetch(`/api/projects/${projectId}/assets`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: newAsset.type,
            title: newAsset.title,
            url: newAsset.url,
            description: newAsset.description || ''
          })
        });
      }

      clearInterval(interval);
      setUploadProgress(100);

      if (response.ok) {
        setTimeout(() => {
          onAddAsset();
          setNewAsset({ type: 'url', title: '', url: '', description: '', file: null });
          setShowAddMenu(false);
          setUploadProgress(0);
        }, 500);
      } else {
        const error = await response.json();
        console.error('Error response:', error);
      }
    } catch (error) {
      console.error('Error adding asset:', error);
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 1000);
    }
  };

  const getAssetIcon = (asset) => {
    return getTypeIcon(asset.asset_type, 'w-5 h-5');
  };

  const getAssetColor = (type) => {
    switch(type) {
      case 'url': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'linkedin': return 'from-sky-500/20 to-blue-500/20 border-sky-500/30';
      case 'suspicious_url': return 'from-red-500/20 to-orange-500/20 border-red-500/30';
      case 'image': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'document': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      default: return 'from-white/5 to-white/10 border-white/10';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Project Assets ({assets?.length || 0})
        </h3>
        
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm rounded-lg hover:shadow-lg transition-all flex items-center gap-1"
          >
            {getActionIcon('add')}
            Add Asset
          </button>

          {/* Add Asset Menu */}
          {showAddMenu && (
            <div className="absolute right-0 mt-2 w-96 bg-gradient-to-b from-gray-900 to-black rounded-xl border border-white/10 shadow-2xl z-50 p-5 animate-slideDown">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">Add New Asset</h4>
                <button onClick={() => setShowAddMenu(false)} className="text-white/40 hover:text-white">
                  {getActionIcon('close')}
                </button>
              </div>

              {/* Asset Type Selector with Icons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {assetTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setNewAsset({ ...newAsset, type: type.value, file: null })}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                      newAsset.type === type.value
                        ? `bg-gradient-to-r ${type.color} text-white border-transparent`
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-purple-400">{type.icon}</span>
                    <span className="text-xs">{type.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {/* Title Input */}
                <div>
                  <label className="block text-white/60 text-xs mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="Asset title"
                    value={newAsset.title}
                    onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Conditional Input based on type */}
                {['url', 'linkedin', 'suspicious_url'].includes(newAsset.type) && (
                  <div>
                    <label className="block text-white/60 text-xs mb-1">URL</label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newAsset.url}
                        onChange={(e) => setNewAsset({ ...newAsset, url: e.target.value })}
                        className="w-full px-3 py-2 pl-8 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40">
                        {getActionIcon('link')}
                      </span>
                    </div>
                  </div>
                )}

                {/* File Upload for images/documents */}
                {['image', 'document'].includes(newAsset.type) && (
                  <div>
                    <label className="block text-white/60 text-xs mb-1">File</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept={newAsset.type === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt'}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500/50 transition-colors group"
                    >
                      {newAsset.file ? (
                        <div className="text-white/80 text-sm">
                          {newAsset.file.name}
                          <span className="text-white/40 text-xs block mt-1">
                            {(newAsset.file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className="text-white/40 group-hover:text-purple-400 transition-colors">
                            {getActionIcon('upload')}
                          </span>
                          <p className="text-white/40 text-sm mt-1">
                            Click to upload {newAsset.type}
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
                    value={newAsset.description}
                    onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Uploading...</span>
                      <span className="text-purple-400">{uploadProgress}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleAddAsset}
                  disabled={uploading || (!newAsset.title || (!newAsset.url && !newAsset.file))}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      {getActionIcon('add')}
                      Add Asset
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assets Grid */}
      {assets && assets.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {assets.map(asset => (
            <div
              key={asset.id}
              className={`group relative bg-gradient-to-br ${getAssetColor(asset.asset_type)} rounded-xl p-4 border hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]`}
              onClick={() => asset.url && window.open(asset.url, '_blank')}
            >
              <div className="flex items-start gap-3">
                {/* Icon with gradient background */}
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAssetColor(asset.asset_type).split(' ')[0]} bg-opacity-30 flex items-center justify-center`}>
                  <span className="text-purple-400">{getAssetIcon(asset)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h5 className="text-white font-medium text-sm truncate group-hover:text-purple-400 transition-colors">
                    {asset.title}
                  </h5>
                  
                  {asset.url && (
                    <p className="text-white/40 text-xs truncate mt-0.5">{asset.url}</p>
                  )}
                  
                  {asset.description && (
                    <p className="text-white/40 text-xs mt-1 line-clamp-2">{asset.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/40`}>
                      {asset.asset_type}
                    </span>
                    <span className="text-white/30 text-[10px]">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAsset(asset.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400"
                >
                  {getActionIcon('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
          <svg className="w-12 h-12 mx-auto text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-white/40 text-sm">No assets yet</p>
          <button
            onClick={() => setShowAddMenu(true)}
            className="mt-2 text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 mx-auto"
          >
            {getActionIcon('add')}
            Add your first asset
          </button>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProjectAssets;
