import React, { useState, useRef, useEffect } from 'react';
import BaseModal from '../base/BaseModal';
import { InputField, TextareaField, SelectField, Section } from '../base/BaseFields';
import config from './config';

const AddModal = ({ isOpen, onClose, moduleType, moduleName, onSave, projectId }) => {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const saveCalledRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      saveCalledRef.current = false;
      setSaving(false);
      setError(null);
      setFormData({});
    }
  }, [isOpen]);

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async () => {
    if (saveCalledRef.current || saving) return;
    saveCalledRef.current = true;
    setSaving(true);
    
    if (onSave) {
      await onSave({
        assets: formData,
        moduleType: moduleType
      });
    }
    
    setSaving(false);
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
        disabled: saving,
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