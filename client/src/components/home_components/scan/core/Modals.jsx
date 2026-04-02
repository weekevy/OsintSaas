import React, { useState, useEffect, useRef } from 'react';
import { moduleAssetsConfig } from '../utils/constants';
import { getIcon } from '../utils/icons';
import { validateForm } from '../utils/helpers';

// Helper function to get API base based on module type
const getApiBase = (moduleType) => {
  const apiMap = {
    'job-recruitment': '/api/modules/job-recruitment',
    'linkedin': '/api/modules/linkedin-investigation',
    'social-media': '/api/modules/social-media',
    'scam-website': '/api/modules/scam-website',
    'email-leak': '/api/modules/email-leak',
    'scam-email': '/api/modules/scam-email',
    'phone-number': '/api/modules/phone-number',
    'crypto-wallet': '/api/modules/crypto-wallet'
  };
  return apiMap[moduleType] || '/api/modules/job-recruitment';
};

// ==================== TargetInput Component ====================
export const TargetInput = ({ 
  searchInput, 
  onSearchChange, 
  onAnalyze, 
  isAnalyzing 
}) => {
  const [showRecent, setShowRecent] = useState(false);
  const [targetType, setTargetType] = useState('all');
  const [recentTargets] = useState([
    { value: 'example.com', type: 'domain', count: 3 },
    { value: 'user@example.com', type: 'email', count: 2 },
    { value: '+1-555-123-4567', type: 'phone', count: 1 }
  ]);

  const getTargetIcon = (type) => {
    const icons = {
      domain: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
      email: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.57 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      phone: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      ),
      wallet: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
    return icons[type] || icons.domain;
  };

  const quickActions = [
    { id: 'domain', label: 'URL', icon: 'domain' },
    { id: 'email', label: 'Email', icon: 'email' },
    { id: 'phone', label: 'Phone', icon: 'phone' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  ];

  const examples = [
    'example.com',
    'user@example.com',
    '+1-555-123-4567',
    '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold">Investigate Target</h3>
        </div>
        
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => setTargetType(action.id)}
              className={`p-2 rounded-lg transition-all ${
                targetType === action.id 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
              title={action.label}
            >
              {getTargetIcon(action.icon)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setShowRecent(true)}
            onBlur={() => setTimeout(() => setShowRecent(false), 200)}
            placeholder="Enter domain, email, phone, or wallet address..."
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all pl-12 pr-24"
          />
          <svg className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/20">
            e.g., {examples[Math.floor(Math.random() * examples.length)]}
          </div>

          {showRecent && recentTargets.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fadeIn">
              <div className="px-4 py-2 text-xs text-white/40 border-b border-white/10">
                Recent Targets
              </div>
              {recentTargets.map((target, index) => (
                <button
                  key={index}
                  onClick={() => onSearchChange(target.value)}
                  className="w-full px-4 py-3 text-left text-white/80 hover:bg-white/5 flex items-center gap-3 transition-colors"
                >
                  {getTargetIcon(target.type)}
                  <span className="flex-1">{target.value}</span>
                  <span className="text-xs text-white/40">{target.count} scans</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || !searchInput}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group min-w-[140px]"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Quick Scan</span>
              </>
            )}
          </button>

          <div className="flex-1 flex items-center gap-2 text-xs text-white/40">
            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            <span>Supports domains, emails, phones, and wallet addresses</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => setTargetType(action.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                targetType === action.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-white/5 text-white/40 hover:text-white/80 hover:bg-white/10'
              }`}
            >
              {getTargetIcon(action.icon)}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {!searchInput && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-xl border border-purple-500/20 animate-fadeIn">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400 text-xs">ℹ️</span>
            </div>
            <p className="text-white/60">
              Enter a target above to start your investigation. 
              <span className="text-white/40 block text-xs mt-0.5">
                Try an example: example.com, user@email.com, +1234567890
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== AddAssetsModal Component ====================
export const AddAssetsModal = ({ isOpen, onClose, moduleType, moduleName, onSave, projectId }) => {
  const [formData, setFormData] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const modalRef = useRef(null);
  
  const config = moduleAssetsConfig[moduleType];
  const apiBase = getApiBase(moduleType);

  useEffect(() => {
    if (config && config.categories.length > 0) {
      setActiveCategory(config.categories[0].id);
    }
    if (isOpen) {
      setFormData({});
      setErrors({});
    }
  }, [config, isOpen]);

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
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: null
      }));
    }
  };

  const handleSave = async () => {
    const validationErrors = validateForm(config, formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    
    // Log what module type and data is being sent
    console.log('=== SAVING ASSETS ===');
    console.log('Module Type:', moduleType);
    console.log('Module Name:', moduleName);
    console.log('Form Data:', formData);
    console.log('API Endpoint:', apiBase);
    
    try {
      const response = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          project_id: projectId
        })
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (data.success) {
        if (onSave) {
          onSave({
            moduleType,
            moduleName,
            assets: formData,
            timestamp: new Date().toISOString()
          });
        }
        onClose();
      } else {
        console.error('API Error:', data.error);
        setErrors({ submit: data.error || 'Failed to save assets' });
      }
    } catch (error) {
      console.error('Network Error:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div ref={modalRef} className="relative w-full max-w-4xl bg-gradient-to-b from-gray-900 to-black rounded-xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden animate-slideUp">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
          <div className="relative px-6 py-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{config.title}</h2>
                  <p className="text-white/40 text-sm">{config.description}</p>
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
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                    {category.fields.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

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
                          className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none ${
                            errors[field.id] ? 'border-red-500' : 'border-white/10'
                          }`}
                          placeholder={field.placeholder}
                          rows="4"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors ${
                            errors[field.id] ? 'border-red-500' : 'border-white/10'
                          }`}
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
                          className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors ${
                            errors[field.id] ? 'border-red-500' : 'border-white/10'
                          }`}
                          placeholder={field.placeholder}
                        />
                      )}
                      
                      {errors[field.id] && (
                        <p className="text-red-400 text-xs mt-1">{errors[field.id]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {errors.submit && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Assets
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== EditAssetsModal Component ====================
export const EditAssetsModal = ({ isOpen, onClose, scan, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  
  const config = moduleAssetsConfig[scan?.toolId];
  const apiBase = getApiBase(scan?.toolId);

  useEffect(() => {
    if (scan?.assets) {
      setFormData(scan.assets);
      setOriginalData(scan.assets);
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

  const handleSave = async () => {
    setSaving(true);
    
    console.log('=== UPDATING ASSETS ===');
    console.log('Scan ID:', scan.id);
    console.log('Tool ID:', scan.toolId);
    console.log('API Endpoint:', `${apiBase}?id=${scan.id}`);
    console.log('Form Data:', formData);
    
    try {
      const response = await fetch(`${apiBase}?id=${scan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (data.success) {
        if (onUpdate) {
          onUpdate(scan.id, formData);
        }
        onClose();
      } else {
        console.error('API Error:', data.error);
        setError(data.error || 'Failed to update assets');
      }
    } catch (error) {
      console.error('Network Error:', error);
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    setFormData(originalData);
    setError(null);
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  if (!isOpen || !config || !scan) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div ref={modalRef} className="relative w-full max-w-4xl bg-gradient-to-b from-gray-900 to-black rounded-xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden animate-slideUp">
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
          <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
            <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Categories</h3>
            <div className="space-y-2">
              {config.categories.map(category => {
                const filledCount = category.fields.filter(f => 
                  formData[f.id] && formData[f.id].trim() !== ''
                ).length;
                
                return (
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
                    {filledCount > 0 && (
                      <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                        {filledCount}/{category.fields.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

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
                        {formData[field.id] && (
                          <span className="ml-2 text-green-400 text-xs">✓ filled</span>
                        )}
                      </label>
                      
                      {field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                          placeholder={field.placeholder}
                          rows="4"
                          disabled={saving}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                          disabled={saving}
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
                          disabled={saving}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm">
            Cancel
          </button>
          
          {hasChanges && (
            <button 
              onClick={handleRevert}
              className="px-5 py-2.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg transition-all text-sm flex items-center gap-2"
              disabled={saving}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Revert Changes
            </button>
          )}

          <button 
            onClick={handleSave} 
            disabled={saving || !hasChanges}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update Assets
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};