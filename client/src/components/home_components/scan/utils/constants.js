// Investigation Modules data
export const investigationModules = [
  { 
    id: 'job-recruitment', 
    name: 'Company & Job Scam', 
    description: 'Verify if a job offer, company, or recruiter is legitimate', 
    icon: 'job', 
    color: 'from-purple-500 to-pink-500' 
  },
  { 
    id: 'linkedin', 
    name: 'Recruiter Check', 
    description: 'Verify recruiters and suspicious LinkedIn profiles', 
    icon: 'linkedin', 
    color: 'from-blue-500 to-cyan-500' 
  },
  { 
    id: 'social-media', 
    name: 'Social Media OSINT', 
    description: 'Cross-platform identity verification and threat detection', 
    icon: 'social', 
    color: 'from-green-500 to-emerald-500' 
  },
  { 
    id: 'scam-website', 
    name: 'Scam Website Analysis', 
    description: 'Detect phishing sites, fake stores, and malicious domains', 
    icon: 'website', 
    color: 'from-orange-500 to-red-500' 
  },
  { 
    id: 'email-leak', 
    name: 'Email Leak Check', 
    description: 'Check if email addresses appear in known data breaches', 
    icon: 'email', 
    color: 'from-yellow-500 to-amber-500' 
  },
  { 
    id: 'scam-email', 
    name: 'Scam Email Analysis', 
    description: 'Analyze email headers and content for phishing indicators', 
    icon: 'email-scam', 
    color: 'from-red-500 to-pink-500' 
  },
  { 
    id: 'phone-number', 
    name: 'Phone Number OSINT', 
    description: 'Carrier lookup, location data, and spam detection', 
    icon: 'phone', 
    color: 'from-teal-500 to-cyan-500' 
  },
  { 
    id: 'crypto-wallet', 
    name: 'Crypto Wallet Tracker', 
    description: 'Analyze blockchain transactions and wallet activity', 
    icon: 'crypto', 
    color: 'from-indigo-500 to-purple-500' 
  },
];

// Open Source Platforms data
export const openSourcePlatforms = [
  { 
    id: 'shodan', 
    name: 'Shodan', 
    description: 'Internet device database', 
    icon: 'shodan', 
    color: 'from-red-500 to-orange-500' 
  },
  { 
    id: 'censys', 
    name: 'Censys', 
    description: 'Certificate & asset discovery', 
    icon: 'censys', 
    color: 'from-blue-500 to-purple-500' 
  },
  { 
    id: 'virustotal', 
    name: 'VirusTotal', 
    description: 'Malware & hash lookup', 
    icon: 'virustotal', 
    color: 'from-green-500 to-teal-500' 
  },
  { 
    id: 'greynoise', 
    name: 'GreyNoise', 
    description: 'Internet noise analysis', 
    icon: 'greynoise', 
    color: 'from-gray-500 to-slate-500' 
  },
  { 
    id: 'haveibeenpwned', 
    name: 'Have I Been Pwned', 
    description: 'Breach data lookup', 
    icon: 'hibp', 
    color: 'from-red-500 to-pink-500' 
  },
  { 
    id: 'dehashed', 
    name: 'DeHashed', 
    description: 'Credential breach search', 
    icon: 'dehashed', 
    color: 'from-purple-500 to-indigo-500' 
  },
];

// Asset configuration for modules
export const moduleAssetsConfig = {
  'job-recruitment': {
    title: 'Company & Job Scam Check',
    description: 'Verify if a job offer, company, or recruiter is legitimate',
    categories: [
      {
        id: 'job_details',
        name: 'Job Details',
        icon: 'job',
        color: 'from-purple-500 to-pink-500',
        fields: [
          { 
            id: 'job_url', 
            label: 'Job Posting URL', 
            type: 'url', 
            placeholder: 'https://...', 
            required: false,
            help: 'Paste the link to the job posting'
          },
          { 
            id: 'job_title', 
            label: 'Job Title', 
            type: 'text', 
            placeholder: 'e.g., Software Engineer', 
            required: false,
            help: 'The position you applied for'
          },
          { 
            id: 'salary_offered', 
            label: 'Salary Offered', 
            type: 'text', 
            placeholder: '$50,000 - $70,000 per year', 
            required: false,
            help: 'What salary was promised?'
          },
          { 
            id: 'job_description', 
            label: 'Job Description', 
            type: 'textarea', 
            placeholder: 'Paste the full job description here...', 
            required: false,
            help: 'Copy the job description from the posting'
          }
        ]
      },
      {
        id: 'company_info',
        name: 'Company Information',
        icon: 'website',
        color: 'from-blue-500 to-cyan-500',
        fields: [
          { 
            id: 'company_name', 
            label: 'Company Name', 
            type: 'text', 
            placeholder: 'Company name', 
            required: false,
            help: 'Name of the company offering the job'
          },
          { 
            id: 'company_website', 
            label: 'Company Website', 
            type: 'url', 
            placeholder: 'https://company.com', 
            required: false,
            help: 'Official company website if provided'
          },
          { 
            id: 'company_linkedin', 
            label: 'Company LinkedIn', 
            type: 'url', 
            placeholder: 'https://linkedin.com/company/...', 
            required: false,
            help: 'LinkedIn company page URL'
          },
          { 
            id: 'company_email_domain', 
            label: 'Company Email Domain', 
            type: 'text', 
            placeholder: '@company.com', 
            required: false,
            help: 'The email domain used by the company'
          },
          { 
            id: 'company_phone', 
            label: 'Company Phone', 
            type: 'tel', 
            placeholder: '+1 555 123 4567', 
            required: false,
            help: 'Phone number listed for the company'
          },
          { 
            id: 'company_address', 
            label: 'Company Address', 
            type: 'text', 
            placeholder: '123 Business St, City, Country', 
            required: false,
            help: 'Physical address of the company'
          }
        ]
      },
      {
        id: 'recruiter_info',
        name: 'Recruiter Information',
        icon: 'contacts',
        color: 'from-green-500 to-emerald-500',
        fields: [
          { 
            id: 'recruiter_name', 
            label: 'Recruiter Name', 
            type: 'text', 
            placeholder: 'John Doe', 
            required: false,
            help: 'Name of the person contacting you'
          },
          { 
            id: 'recruiter_email', 
            label: 'Recruiter Email', 
            type: 'email', 
            placeholder: 'recruiter@company.com', 
            required: false,
            help: 'Email address of the recruiter'
          },
          { 
            id: 'recruiter_phone', 
            label: 'Recruiter Phone', 
            type: 'tel', 
            placeholder: '+1 555 123 4567', 
            required: false,
            help: 'Phone number of the recruiter'
          },
          { 
            id: 'recruiter_linkedin', 
            label: 'Recruiter LinkedIn', 
            type: 'url', 
            placeholder: 'https://linkedin.com/in/...', 
            required: false,
            help: 'LinkedIn profile URL of the recruiter'
          },
          { 
            id: 'recruiter_title', 
            label: 'Recruiter Title', 
            type: 'text', 
            placeholder: 'HR Manager / Talent Acquisition', 
            required: false,
            help: 'Job title claimed by the recruiter'
          }
        ]
      },
      {
        id: 'communication',
        name: 'Communication',
        icon: 'email',
        color: 'from-yellow-500 to-amber-500',
        fields: [
          { 
            id: 'suspicious_message', 
            label: 'Suspicious Message', 
            type: 'textarea', 
            placeholder: 'Paste any suspicious email or message here...', 
            required: false,
            help: 'Copy and paste the message you received',
            rows: 4
          },
          { 
            id: 'communication_channel', 
            label: 'Communication Channel', 
            type: 'select', 
            options: ['Email', 'LinkedIn', 'WhatsApp', 'Telegram', 'SMS', 'Phone Call', 'Other'],
            required: false,
            help: 'How were you contacted?'
          },
          { 
            id: 'red_flags_noticed', 
            label: 'Red Flags Noticed', 
            type: 'textarea', 
            placeholder: 'List any suspicious things you noticed...', 
            required: false,
            help: 'Poor grammar, urgent requests, payment demands, etc.'
          }
        ]
      },
      {
        id: 'evidence',
        name: 'Upload Evidence',
        icon: 'document',
        color: 'from-red-500 to-pink-500',
        fields: [
          {
            id: 'notes',
            label: 'Additional Notes',
            type: 'textarea',
            placeholder: 'Any other information you want to share...',
            required: false,
            help: 'Add any additional context or observations',
            rows: 3
          }
        ]
      }
    ]
  },
  'linkedin': {
    title: 'LinkedIn Investigation',
    description: 'Add LinkedIn profiles and related information',
    categories: [
      {
        id: 'profile_info',
        name: 'Profile Information',
        icon: 'linkedin',
        color: 'from-blue-500 to-cyan-500',
        fields: [
          { id: 'profile_url', label: 'LinkedIn Profile URL', type: 'url', placeholder: 'https://linkedin.com/in/username', required: true },
          { id: 'profile_name', label: 'Profile Name', type: 'text', placeholder: 'Full name', required: true },
          { id: 'profile_headline', label: 'Headline', type: 'text', placeholder: 'e.g., Software Engineer at Company', required: false },
          { id: 'profile_location', label: 'Location', type: 'text', placeholder: 'City, Country', required: false },
        ]
      },
      {
        id: 'connections',
        name: 'Connections',
        icon: 'social',
        color: 'from-green-500 to-emerald-500',
        fields: [
          { id: 'connections_list', label: 'Notable Connections', type: 'textarea', placeholder: 'List notable connections (one per line)', required: false },
          { id: 'mutual_connections', label: 'Mutual Connections', type: 'textarea', placeholder: 'List mutual connections', required: false },
        ]
      }
    ]
  },
  'social-media': {
    title: 'Social Media OSINT',
    description: 'Add social media profiles across platforms',
    categories: [
      {
        id: 'platforms',
        name: 'Social Platforms',
        icon: 'social',
        color: 'from-green-500 to-emerald-500',
        fields: [
          { id: 'twitter_url', label: 'Twitter/X URL', type: 'url', placeholder: 'https://twitter.com/username', required: false },
          { id: 'facebook_url', label: 'Facebook URL', type: 'url', placeholder: 'https://facebook.com/username', required: false },
          { id: 'instagram_url', label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/username', required: false },
          { id: 'tiktok_url', label: 'TikTok URL', type: 'url', placeholder: 'https://tiktok.com/@username', required: false },
          { id: 'youtube_url', label: 'YouTube URL', type: 'url', placeholder: 'https://youtube.com/@channel', required: false },
          { id: 'reddit_url', label: 'Reddit URL', type: 'url', placeholder: 'https://reddit.com/user/username', required: false },
        ]
      },
      {
        id: 'identity',
        name: 'Identity Information',
        icon: 'contacts',
        color: 'from-purple-500 to-pink-500',
        fields: [
          { id: 'display_name', label: 'Display Name', type: 'text', placeholder: 'Name used across platforms', required: false },
          { id: 'username_variations', label: 'Username Variations', type: 'textarea', placeholder: 'List username variations', required: false },
          { id: 'profile_pictures', label: 'Profile Picture URLs', type: 'textarea', placeholder: 'URLs to profile pictures', required: false },
        ]
      }
    ]
  },
  'scam-website': {
    title: 'Scam Website Analysis',
    description: 'Add suspicious website information',
    categories: [
      {
        id: 'website_info',
        name: 'Website Information',
        icon: 'website',
        color: 'from-orange-500 to-red-500',
        fields: [
          { id: 'website_url', label: 'Website URL', type: 'url', placeholder: 'https://suspicious-site.com', required: true },
          { id: 'website_name', label: 'Website Name', type: 'text', placeholder: 'Site name', required: true },
          { id: 'ip_address', label: 'IP Address', type: 'text', placeholder: '192.168.1.1', required: false },
          { id: 'hosting_provider', label: 'Hosting Provider', type: 'text', placeholder: 'e.g., Cloudflare, AWS', required: false },
          { id: 'registration_date', label: 'Registration Date', type: 'date', placeholder: 'YYYY-MM-DD', required: false },
        ]
      },
      {
        id: 'red_flags',
        name: 'Red Flags',
        icon: 'suspicious',
        color: 'from-red-500 to-pink-500',
        fields: [
          { id: 'suspicious_patterns', label: 'Suspicious Patterns', type: 'textarea', placeholder: 'Describe suspicious patterns found', required: false },
          { id: 'fake_testimonials', label: 'Fake Testimonials', type: 'textarea', placeholder: 'Examples of fake testimonials', required: false },
          { id: 'payment_methods', label: 'Payment Methods', type: 'text', placeholder: 'Unusual payment methods', required: false },
        ]
      }
    ]
  },
  'email-leak': {
    title: 'Email Leak Check',
    description: 'Add email addresses to check for breaches',
    categories: [
      {
        id: 'emails',
        name: 'Email Addresses',
        icon: 'email',
        color: 'from-yellow-500 to-amber-500',
        fields: [
          { id: 'email_address', label: 'Email Address', type: 'email', placeholder: 'email@example.com', required: true },
          { id: 'additional_emails', label: 'Additional Emails', type: 'textarea', placeholder: 'One email per line', required: false },
        ]
      }
    ]
  },
  'scam-email': {
    title: 'Scam Email Analysis',
    description: 'Add suspicious email content for analysis',
    categories: [
      {
        id: 'email_content',
        name: 'Email Content',
        icon: 'email-scam',
        color: 'from-red-500 to-pink-500',
        fields: [
          { id: 'sender_email', label: 'Sender Email', type: 'email', placeholder: 'sender@example.com', required: true },
          { id: 'sender_name', label: 'Sender Name', type: 'text', placeholder: 'Display name', required: false },
          { id: 'subject', label: 'Subject', type: 'text', placeholder: 'Email subject line', required: true },
          { id: 'email_body', label: 'Email Body', type: 'textarea', placeholder: 'Paste the email content here', required: true },
          { id: 'attachments', label: 'Attachment Names', type: 'text', placeholder: 'Comma-separated attachment names', required: false },
        ]
      },
      {
        id: 'headers',
        name: 'Email Headers',
        icon: 'document',
        color: 'from-gray-500 to-slate-500',
        fields: [
          { id: 'headers_raw', label: 'Raw Headers', type: 'textarea', placeholder: 'Paste email headers here', required: false },
          { id: 'reply_to', label: 'Reply-To', type: 'email', placeholder: 'reply-to@example.com', required: false },
          { id: 'return_path', label: 'Return-Path', type: 'email', placeholder: 'return-path@example.com', required: false },
        ]
      }
    ]
  },
  'phone-number': {
    title: 'Phone Number OSINT',
    description: 'Add phone numbers for investigation',
    categories: [
      {
        id: 'phone_info',
        name: 'Phone Information',
        icon: 'phone',
        color: 'from-teal-500 to-cyan-500',
        fields: [
          { id: 'phone_number', label: 'Phone Number', type: 'phone', placeholder: '+1 (555) 123-4567', required: true },
          { id: 'carrier', label: 'Carrier (if known)', type: 'text', placeholder: 'e.g., Verizon, T-Mobile', required: false },
          { id: 'country', label: 'Country', type: 'text', placeholder: 'Country code or name', required: false },
        ]
      }
    ]
  },
  'crypto-wallet': {
    title: 'Crypto Wallet Tracker',
    description: 'Add cryptocurrency wallet addresses',
    categories: [
      {
        id: 'wallet_info',
        name: 'Wallet Information',
        icon: 'crypto',
        color: 'from-indigo-500 to-purple-500',
        fields: [
          { id: 'wallet_address', label: 'Wallet Address', type: 'text', placeholder: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', required: true },
          { id: 'blockchain', label: 'Blockchain', type: 'select', options: ['Ethereum', 'Bitcoin', 'Solana', 'Binance', 'Other'], required: true },
          { id: 'exchange', label: 'Exchange (if known)', type: 'text', placeholder: 'e.g., Binance, Coinbase', required: false },
          { id: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes about this wallet', required: false },
        ]
      }
    ]
  }
};