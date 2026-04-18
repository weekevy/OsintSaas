import React, { useState, useEffect } from 'react';
import BaseModal from '../base/BaseModal';
import { InputField, TextareaField, SelectField, Section } from '../base/BaseFields';
import config from './config';
import api from './api';

const EditModal = ({ isOpen, onClose, scan, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (scan?.assets) {
      setFormData(scan.assets);
      setOriginalData(scan.assets);
    }
  }, [scan]);

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await api.update(scan.id, formData);
    if (result.success && onUpdate) {
      await onUpdate(scan.id, formData);
      onClose();
    } else {
      setError(result.error || 'Failed to update assets');
    }
    setSaving(false);
  };

  const handleRevert = () => {
    setFormData(originalData);
    setError(null);
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const renderFields = (sectionId, section) => {
    return section.fields
      .filter(field => field.type !== 'file')
      .map(field => {
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
            disabled={saving}
          />
        );
      });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${config.name}`}
      description="Update the investigation assets"
      onSave={handleSave}
      saving={saving}
      saveButtonText="Update Assets"
      showRevert={hasChanges}
      onRevert={handleRevert}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm text-center">{error}</p>
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

export default EditModal;