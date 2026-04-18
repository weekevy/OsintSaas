import React, { useState, useRef } from 'react';
import BaseModal from '../base/BaseModal';
import { InputField, TextareaField, SelectField, FileUploadField, Section } from '../base/BaseFields';
import config from './config';
import api from './api';

const AddModal = ({ isOpen, onClose, moduleType, moduleName, onSave, projectId }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.website_url) {
      newErrors.website_url = 'Website URL is required';
    }
    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    const result = await api.create(formData, uploadedFiles);
    if (result.success && onSave) {
      await onSave(result);
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
        />
      );
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={config.name}
      description={config.description}
      onSave={handleSave}
      saving={saving}
      saveButtonText="Start Investigation"
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