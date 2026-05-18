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
    
    console.log('🔵 Updating scan:', scan.id, formData);
    
    if (onUpdate) {
      try {
        await onUpdate(scan.id, formData);
        onClose();
      } catch (err) {
        console.error('Update failed:', err);
        setError('FAILED TO UPDATE ASSETS');
        setSaving(false);
      }
    } else {
      setSaving(false);
      onClose();
    }
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
          <p className="text-red-400 text-sm font-['Poppins'] text-center">{error}</p>
        </div>
      )}
      
      <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1 custom-scroll">
        {Object.entries(config.fields).map(([sectionId, section]) => (
          <Section key={sectionId} title={section.title} description={section.description}>
            <div className="space-y-3">
              {renderFields(sectionId, section)}
            </div>
          </Section>
        ))}
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 229, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 229, 255, 0.5);
        }
      `}</style>
    </BaseModal>
  );
};

export default EditModal;