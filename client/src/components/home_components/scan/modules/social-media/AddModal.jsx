import React, { useState, useRef, useEffect } from 'react';
import BaseModal from '../base/BaseModal';
import { InputField, TextareaField, SelectField, FileUploadField, Section } from '../base/BaseFields';
import config from './config';

const AddModal = ({ isOpen, onClose, moduleType, moduleName, onSave, projectId }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  
  // Track if save has been called
  const saveCalledRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      saveCalledRef.current = false;
      setSaving(false);
      setErrors({});
      setFormData({});
      setUploadedFiles([]);
    }
  }, [isOpen]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) setErrors(prev => ({ ...prev, [fieldId]: null }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (saveCalledRef.current || saving) return;
    
    saveCalledRef.current = true;
    setSaving(true);
    
    // Follow pattern: pass to onSave which handles API
    if (onSave) {
      await onSave({
        assets: formData,
        files: uploadedFiles,
        moduleType: moduleType
      });
    }
    
    setSaving(false);
    onClose();
  };

  const renderFields = (sectionId, section) => {
    return section.fields.map(field => {
      if (field.type === 'file') {
        return (
          <FileUploadField
            key={field.id}
            id={field.id}
            label={field.label}
            files={uploadedFiles}
            onFileChange={handleFileChange}
            onFileRemove={handleRemoveFile}
            isDragging={isDragging}
            onDragEvents={{ fileInputRef, handleDragEnter, handleDragLeave, handleDragOver, handleDrop }}
            help={field.help}
            error={errors[field.id]}
          />
        );
      }
      if (field.type === 'textarea') {
        return (
          <TextareaField
            key={field.id}
            id={field.id}
            label={field.label}
            value={formData[field.id]}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            required={field.required}
            help={field.help}
            rows={field.rows || 3}
            error={errors[field.id]}
            disabled={saving}
          />
        );
      }
      if (field.type === 'select') {
        return (
          <SelectField
            key={field.id}
            id={field.id}
            label={field.label}
            value={formData[field.id]}
            onChange={handleInputChange}
            options={field.options}
            required={field.required}
            help={field.help}
            error={errors[field.id]}
            disabled={saving}
          />
        );
      }
      return (
        <InputField
          key={field.id}
          id={field.id}
          label={field.label}
          type={field.type}
          value={formData[field.id]}
          onChange={handleInputChange}
          placeholder={field.placeholder}
          required={field.required}
          help={field.help}
          error={errors[field.id]}
          disabled={saving}
        />
      );
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`NEW ${config.name.toUpperCase()}`}
      description={config.description.toUpperCase()}
      onSave={handleSave}
      saving={saving}
      saveButtonText="START INVESTIGATION"
    >
      {Object.entries(config.fields).map(([sectionId, section]) => (
        <Section key={sectionId} title={section.title} description={section.description}>
          {renderFields(sectionId, section)}
        </Section>
      ))}
    </BaseModal>
  );
};

export default AddModal;