// Helper functions
export const validateForm = (config, formData) => {
  const newErrors = {};
  config.categories.forEach(category => {
    category.fields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });
  });
  return newErrors;
};

export const formatOptionLabel = (key) => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};
