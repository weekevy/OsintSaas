import React, { useState } from 'react';
import BaseModal from '../base/BaseModal';
import { InputField, TextareaField, SelectField, Section } from '../base/BaseFields';
import config from './config';

const AddModal = ({ isOpen, onClose, onSave, moduleType, moduleName, projectId }) => {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleFileChange = (fieldId, fileList) => {
    const newFiles = Array.from(fileList);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleSave = async () => {
    // Prevent duplicate saves
    if (saving) return;
    
    setSaving(true);
    setError(null);
    
    const dataToSend = {
      ...formData,
      project_id: projectId
    };
    
    console.log('🔵 UI MODE - LinkedIn data that would be saved:', { 
      profile: dataToSend.profile_name, 
      company: dataToSend.current_company,
      files: files.length 
    });
    
    // UI ONLY MODE - No API call
    // Simulate network delay
    setTimeout(() => {
      console.log('✅ UI MODE - LinkedIn save successful (simulated)');
      
      if (onSave) {
        onSave({
          assets: formData,
          files: files,
          moduleType: moduleType
        });
      }
      setFormData({});
      setFiles([]);
      onClose();
    }, 500);
  };

  const handleClose = () => {
    if (saving) return;
    setFormData({});
    setFiles([]);
    setError(null);
    onClose();
  };

  const renderFields = (sectionId, section) => {
    return section.fields.map(field => {
      const commonProps = {
        id: field.id,
        label: field.label,
        value: formData[field.id],
        onChange: handleInputChange,
        placeholder: field.placeholder,
        required: field.required,
        help: field.help,
        disabled: saving
      };

      if (field.type === 'file') {
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              accept={field.accept}
              multiple={field.multiple}
              onChange={(e) => handleFileChange(field.id, e.target.files)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              disabled={saving}
            />
            {field.help && <p className="text-xs text-gray-400 mt-1">{field.help}</p>}
          </div>
        );
      }

      if (field.type === 'textarea') {
        return <TextareaField key={field.id} {...commonProps} rows={field.rows || 3} />;
      }
      if (field.type === 'select') {
        return <SelectField key={field.id} {...commonProps} options={field.options} />;
      }
      return <InputField key={field.id} {...commonProps} type={field.type} />;
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`New ${config.name}`}
      description="Enter LinkedIn profile information to start investigation"
      onSave={handleSave}
      saving={saving}
      saveButtonText="Start Investigation"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}
      
      {Object.entries(config.fields).map(([sectionId, section]) => (
        <Section key={sectionId} title={section.title} description={section.description} iconName={section.iconName} iconColor={section.iconColor}>
          {renderFields(sectionId, section)}
        </Section>
      ))}
    </BaseModal>
  );
};

export default AddModal;