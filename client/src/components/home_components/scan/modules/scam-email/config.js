export const config = {
  moduleId: 'scam-email',
  name: 'Scam Email Analysis',
  description: 'Analyze suspicious emails for phishing or fraud indicators',
  apiBase: '/api/modules/scam-email',
  fields: {
    sender_info: {
      title: '📤 Sender Information',
      description: 'Who sent the suspicious email?',
      fields: [
        { id: 'sender_email', label: 'Sender Email', type: 'email', placeholder: 'sender@suspicious.com', required: true, help: 'The email address of the sender' },
        { id: 'sender_name', label: 'Sender Name', type: 'text', placeholder: 'John Doe / Support Team', help: 'The display name shown in the email' },
        { id: 'reply_to', label: 'Reply-To Address', type: 'email', placeholder: 'different-email@reply.com', help: 'If the reply address is different' }
      ]
    },
    email_content: {
      title: '📧 Email Content',
      description: 'Subject and body of the email',
      fields: [
        { id: 'subject', label: 'Email Subject', type: 'text', placeholder: 'URGENT: Your account...', required: true, help: 'The subject line of the email' },
        { id: 'email_body', label: 'Email Body', type: 'textarea', placeholder: 'Paste the email content here...', help: 'The main text of the email', rows: 5 },
        { id: 'suspicious_links', label: 'Suspicious Links', type: 'textarea', placeholder: 'List any weird links found...', help: 'URLs that seem fraudulent', rows: 2 }
      ]
    },
    technical_details: {
      title: '🔍 Technical Details',
      description: 'Headers and attachments',
      fields: [
        { id: 'headers_raw', label: 'Email Headers', type: 'textarea', placeholder: 'Paste full email headers...', help: 'Raw SMTP headers if available', rows: 3 },
        { id: 'attachments', label: 'Attachments Found', type: 'text', placeholder: 'invoice.pdf.exe, document.zip', help: 'Names of files attached' },
        { id: 'return_path', label: 'Return Path', type: 'email', placeholder: 'bounce@domain.com', help: 'The Return-Path header value' }
      ]
    },
    investigation_notes: {
      title: '📝 Investigation Notes',
      description: 'Add your findings',
      fields: [
        { id: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Observations and analysis results...', help: 'Detailed notes', rows: 4 }
      ]
    }
  }
};

export default config;