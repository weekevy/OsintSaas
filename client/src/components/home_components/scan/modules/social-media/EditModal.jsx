import React, { useState, useEffect } from 'react';
import BaseModal from '../base/BaseModal';
import { InputField, TextareaField, SelectField, Section } from '../base/BaseFields';
import config from './config';

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
    if (saving) return;
    setSaving(true);
    setError(null);
    
    // Pattern: onUpdate handles API
    if (onUpdate) {
      await onUpdate(scan.id, formData);
    }
    
    setSaving(false);
    onClose();
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
      title={`EDIT ${config.name.toUpperCase()}`}
      description="UPDATE THE INVESTIGATION ASSETS"
      onSave={handleSave}
      saving={saving}
      saveButtonText="UPDATE ASSETS"
      showRevert={hasChanges}
      onRevert={handleRevert}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-[10px] font-mono text-center">{error}</p>
        </div>
      )}
      <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1">
        {Object.entries(config.fields).map(([sectionId, section]) => (
          <Section key={sectionId} title={section.title} description={section.description}>
            <div className="space-y-3">
              {renderFields(sectionId, section)}
            </div>
          </Section>
        ))}
      </div>
    </BaseModal>
  );
};

export default EditModal;