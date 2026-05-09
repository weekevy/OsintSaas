export const config = {
  moduleId: 'email-leak',
  name: 'Email Leak Check',
  description: 'Check if an email address has been compromised in data breaches',
  apiBase: '/api/modules/email-leak',
  fields: {
    email_info: {
      title: '📧 Email Information',
      description: 'The email address to investigate',
      fields: [
        { id: 'email_address', label: 'Email Address', type: 'email', placeholder: 'target@example.com', required: true, help: 'The email to check for leaks' },
        { id: 'additional_emails', label: 'Secondary Emails', type: 'textarea', placeholder: 'Other emails related to the target...', help: 'Comma-separated list', rows: 2 }
      ]
    },
    investigation_notes: {
      title: '📝 Investigation Notes',
      description: 'Add your findings and observations',
      fields: [
        { id: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Any specific details found during investigation...', help: 'Detailed observations', rows: 4 }
      ]
    }
  }
};

export default config;