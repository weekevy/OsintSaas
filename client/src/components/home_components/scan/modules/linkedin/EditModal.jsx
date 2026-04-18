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
    
    console.log('🔵 UI MODE - LinkedIn would update scan:', scan.id, { 
      profile: formData.profile_name,
      company: formData.current_company 
    });
    
    // UI ONLY MODE - No API call
    // Simulate network delay
    setTimeout(() => {
      console.log('✅ UI MODE - LinkedIn update successful (simulated)');
      
      if (onUpdate) {
        onUpdate(scan.id, formData);
      }
      onClose();
    }, 500);
  };

  const handleRevert = () => {
    setFormData(originalData);
    setError(null);
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const renderFields = (sectionId, section) => {
    return section.fields.map(field => {
      if (field.type === 'file') return null;
      
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
        <Section key={sectionId} title={section.title} description={section.description} iconName={section.iconName} iconColor={section.iconColor}>
          {renderFields(sectionId, section)}
        </Section>
      ))}
    </BaseModal>
  );
};

export default EditModal;