export const config = {
  moduleId: 'scam-website',
  name: 'Scam Website Analysis',
  description: 'Analyze potentially fraudulent websites',
  apiBase: '/api/modules/scam-website',
  fields: {
    website_info: {
      title: '🌐 Website Information',
      description: 'Basic website details',
      fields: [
        { id: 'website_url', label: 'Website URL', type: 'url', placeholder: 'https://suspicious-site.com', required: true, help: 'The website to investigate' },
        { id: 'domain_name', label: 'Domain Name', type: 'text', placeholder: 'suspicious-site.com', help: 'Domain name only' },
        { id: 'ip_address', label: 'IP Address', type: 'text', placeholder: '192.168.1.1', help: 'Server IP address if known' }
      ]
    },
    red_flags: {
      title: '⚠️ Red Flags',
      description: 'Suspicious indicators',
      fields: [
        { id: 'red_flags_list', label: 'Red Flags Identified', type: 'textarea', placeholder: 'List all suspicious elements...', help: 'Poor design, grammar issues, fake reviews, etc.', rows: 4 },
        { id: 'fake_reviews', label: 'Fake Reviews Detected', type: 'textarea', placeholder: 'List suspicious reviews...', help: 'Reviews that appear fake', rows: 3 },
        { id: 'payment_requests', label: 'Payment Requests', type: 'textarea', placeholder: 'Describe payment demands...', help: 'Requests for unusual payments', rows: 3 }
      ]
    },
    whois_info: {
      title: '🔍 WHOIS Information',
      description: 'Domain registration details',
      fields: [
        { id: 'registrar', label: 'Registrar', type: 'text', placeholder: 'GoDaddy', help: 'Domain registrar' },
        { id: 'registration_date', label: 'Registration Date', type: 'date', help: 'When was domain registered?' },
        { id: 'expiry_date', label: 'Expiry Date', type: 'date', help: 'Domain expiration date' },
        { id: 'registrant_country', label: 'Registrant Country', type: 'text', placeholder: 'Country', help: 'Country of registrant' },
        { id: 'is_private_registration', label: 'Private Registration', type: 'select', options: ['Yes', 'No', 'Unknown'], help: 'Is registration private?' }
      ]
    },
    evidence: {
      title: '📎 Upload Evidence',
      description: 'Upload screenshots and evidence',
      fields: [
        { id: 'files', label: 'Upload Evidence Files', type: 'file', help: 'Screenshots of website, emails, etc.', multiple: true, accept: '.jpg,.jpeg,.png,.pdf' },
        { id: 'notes', label: 'Investigation Notes', type: 'textarea', placeholder: 'Add your findings...', help: 'Detailed notes', rows: 4 }
      ]
    }
  }
};

export default config;