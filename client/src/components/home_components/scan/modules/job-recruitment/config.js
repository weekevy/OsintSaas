export const config = {
  moduleId: 'job-recruitment',
  name: 'Company & Job Scam Check',
  description: 'Verify if a job offer, company, or recruiter is legitimate',
  apiBase: '/api/modules/company-jobscam',
  fields: {
    job_details: {
      title: 'Job Details',
      iconName: 'briefcase',
      iconColor: 'text-purple-400',
      description: 'Information about the job posting and position',
      fields: [
        { id: 'job_url', label: 'Job Posting URL', type: 'url', placeholder: 'https://...', help: 'Paste the link to the job posting' },
        { id: 'job_title', label: 'Job Title', type: 'text', placeholder: 'e.g., Software Engineer', help: 'The position you applied for' },
        { id: 'salary_offered', label: 'Salary Offered', type: 'text', placeholder: '$50,000 - $70,000 per year', help: 'What salary was promised?' },
        { id: 'job_description', label: 'Job Description', type: 'textarea', placeholder: 'Paste the full job description here...', help: 'Copy the job description from the posting', rows: 4 }
      ]
    },
    company_info: {
      title: 'Company Information',
      iconName: 'building-office',
      iconColor: 'text-blue-400',
      description: 'Details about the company offering the position',
      fields: [
        { id: 'company_name', label: 'Company Name', type: 'text', placeholder: 'Company name', help: 'Name of the company offering the job' },
        { id: 'company_website', label: 'Company Website', type: 'url', placeholder: 'https://company.com', help: 'Official company website if provided' },
        { id: 'company_linkedin', label: 'Company LinkedIn', type: 'url', placeholder: 'https://linkedin.com/company/...', help: 'LinkedIn company page URL' },
        { id: 'company_email_domain', label: 'Company Email Domain', type: 'text', placeholder: '@company.com', help: 'The email domain used by the company' },
        { id: 'company_phone', label: 'Company Phone', type: 'tel', placeholder: '+1 555 123 4567', help: 'Phone number listed for the company' },
        { id: 'company_address', label: 'Company Address', type: 'text', placeholder: '123 Business St, City, Country', help: 'Physical address of the company' }
      ]
    },
    recruiter_info: {
      title: 'Recruiter Information',
      iconName: 'user',
      iconColor: 'text-green-400',
      description: 'Information about the person contacting you',
      fields: [
        { id: 'recruiter_name', label: 'Recruiter Name', type: 'text', placeholder: 'John Doe', help: 'Name of the person contacting you' },
        { id: 'recruiter_email', label: 'Recruiter Email', type: 'email', placeholder: 'recruiter@company.com', help: 'Email address of the recruiter' },
        { id: 'recruiter_phone', label: 'Recruiter Phone', type: 'tel', placeholder: '+1 555 123 4567', help: 'Phone number of the recruiter' },
        { id: 'recruiter_linkedin', label: 'Recruiter LinkedIn', type: 'url', placeholder: 'https://linkedin.com/in/...', help: 'LinkedIn profile URL of the recruiter' },
        { id: 'recruiter_title', label: 'Recruiter Title', type: 'text', placeholder: 'HR Manager / Talent Acquisition', help: 'Job title claimed by the recruiter' }
      ]
    },
    communication: {
      title: 'Communication Analysis',
      iconName: 'chat-bubble',
      iconColor: 'text-yellow-400',
      description: 'Details about how you were contacted',
      fields: [
        { id: 'suspicious_message', label: 'Suspicious Message', type: 'textarea', placeholder: 'Paste any suspicious email or message here...', help: 'Copy and paste the message you received', rows: 4 },
        { id: 'communication_channel', label: 'Communication Channel', type: 'select', options: ['Email', 'LinkedIn', 'WhatsApp', 'Telegram', 'SMS', 'Phone Call', 'Other'], help: 'How were you contacted?' },
        { id: 'red_flags_noticed', label: 'Red Flags Noticed', type: 'textarea', placeholder: 'List any suspicious things you noticed...', help: 'Poor grammar, urgent requests, payment demands, etc.', rows: 3 }
      ]
    },
    evidence: {
      title: 'Upload Evidence',
      iconName: 'document',
      iconColor: 'text-red-400',
      description: 'Upload supporting documents and evidence',
      fields: [
        { id: 'files', label: 'Upload Evidence Files', type: 'file', help: 'Upload screenshots, PDFs, images, or documents as evidence', multiple: true, accept: '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.eml,.msg' },
        { id: 'notes', label: 'Additional Notes', type: 'textarea', placeholder: 'Any other information you want to share...', help: 'Add any additional context or observations', rows: 3 }
      ]
    }
  }
};

export default config;