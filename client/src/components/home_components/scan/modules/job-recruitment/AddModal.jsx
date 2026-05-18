import React, { useState, useRef, useEffect } from 'react';
import BaseModal from '../base/BaseModal';
import { InputField, TextareaField, SelectField, Section } from '../base/BaseFields';
import config from './config';

const AddModal = ({ isOpen, onClose, onSave, moduleType, moduleName, projectId }) => {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  
  // Track if save has been called
  const saveCalledRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      saveCalledRef.current = false;
      setSaving(false);
      setError(null);
    }
  }, [isOpen]);

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleFileChange = (fieldId, fileList) => {
    const newFiles = Array.from(fileList);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleSave = async () => {
    // Prevent multiple saves
    if (saveCalledRef.current || saving) {
      console.log('⛔ SAVE BLOCKED - Already in progress or completed');
      return;
    }
    
    saveCalledRef.current = true;
    setSaving(true);
    setError(null);
    
    const dataToSend = {
      ...formData,
      project_id: projectId
    };
    
    console.log('🔵 Saving data:', { company: dataToSend.company_name, job: dataToSend.job_title });
    
    if (onSave && typeof onSave === 'function') {
      try {
        await onSave({
          assets: formData,
          files: files,
          moduleType: moduleType
        });
        
        // Reset form
        setFormData({});
        setFiles([]);
        setError(null);
        
        // Close modal
        onClose();
      } catch (err) {
        console.error('Save failed:', err);
        setError('FAILED TO START INVESTIGATION');
        saveCalledRef.current = false;
        setSaving(false);
      }
    } else {
      setSaving(false);
      saveCalledRef.current = false;
    }
  };

  const handleClose = () => {
    if (saving) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveCalledRef.current = false;
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
            <label className="block text-white/60 text-[9px] font-mono uppercase tracking-[0.12em] mb-1">
              {field.label}
              {field.required && <span className="text-[#f87171] ml-1">*</span>}
            </label>
            <input
              type="file"
              accept={field.accept}
              multiple={field.multiple}
              onChange={(e) => handleFileChange(field.id, e.target.files)}
              className="w-full px-3 py-2 bg-[#0d1114] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              disabled={saving}
            />
            {field.help && <p className="text-white/30 text-[8px] font-mono mt-1">{field.help}</p>}
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
      title={`NEW ${config.name.toUpperCase()}`}
      description="FILL IN THE DETAILS TO START A NEW INVESTIGATION"
      onSave={handleSave}
      saving={saving}
      saveButtonText="START INVESTIGATION"
    >
      {error && (
        <div className="mb-4 p-3 bg-[#f87171]/10 border border-[#f87171]/30">
          <p className="text-[#f87171] text-[10px] font-mono text-center">{error}</p>
        </div>
      )}
      
      {Object.entries(config.fields).map(([sectionId, section]) => (
        <Section key={sectionId} title={section.title} description={section.description}>
          {renderFields(sectionId, section)}
        </Section>
      ))}
    </BaseModal>
  );
};

export default AddModal;