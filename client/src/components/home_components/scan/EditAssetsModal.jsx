import React, { useState, useEffect, useRef } from 'react';
import { moduleAssetsConfig } from './utils/constants';
import { getIcon } from './utils/icons';

const EditAssetsModal = ({ isOpen, onClose, scan, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const modalRef = useRef(null);
  
  const config = moduleAssetsConfig[scan?.toolId];

  useEffect(() => {
    if (scan?.assets) {
      setFormData(scan.assets);
    }
    if (config?.categories?.length > 0) {
      setActiveCategory(config.categories[0].id);
    }
  }, [scan, config]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
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

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(scan.id, formData);
    }
    onClose();
  };

  if (!isOpen || !config || !scan) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div ref={modalRef} className="relative w-full max-w-4xl bg-gradient-to-b from-gray-900 to-black rounded-xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
          <div className="relative px-6 py-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Assets - {scan.tool}</h2>
                  <p className="text-white/40 text-sm">Update the investigation assets</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[500px]">
          {/* Categories Sidebar */}
          <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
            <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Categories</h3>
            <div className="space-y-2">
              {config.categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                    activeCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white`
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {getIcon(category.icon, "w-4 h-4")}
                  <span className="flex-1 text-left">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex-1 p-6 overflow-y-auto">
            {config.categories.map(category => (
              <div key={category.id} className={activeCategory === category.id ? 'block' : 'hidden'}>
                <div className={`inline-flex px-3 py-1 rounded-full bg-gradient-to-r ${category.color} bg-opacity-20 text-white text-xs mb-4`}>
                  {category.name}
                </div>
                
                <div className="space-y-5">
                  {category.fields.map(field => (
                    <div key={field.id}>
                      <label className="block text-white/60 text-sm font-medium mb-2">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      
                      {field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                          placeholder={field.placeholder}
                          rows="4"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                        >
                          <option value="" className="bg-gray-900">Select {field.label}</option>
                          {field.options.map(option => (
                            <option key={option} value={option} className="bg-gray-900">
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Update Assets
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAssetsModal;
