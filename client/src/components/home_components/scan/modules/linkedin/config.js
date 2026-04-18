export const config = {
  moduleId: 'linkedin',
  name: 'LinkedIn Investigation',
  description: 'Investigate LinkedIn profiles for OSINT analysis',
  apiBase: '/api/modules/linkedin-investigation',
  fields: {
    profile_info: {
      title: 'Profile Information',
      iconName: 'user',
      iconColor: 'text-blue-400',
      description: 'Basic information about the LinkedIn profile',
      fields: [
        { id: 'profile_url', label: 'Profile URL', type: 'url', placeholder: 'https://linkedin.com/in/username', required: true, help: 'The LinkedIn profile URL to investigate' },
        { id: 'profile_name', label: 'Profile Name', type: 'text', placeholder: 'John Doe', help: 'Full name on the profile' },
        { id: 'headline', label: 'Headline', type: 'text', placeholder: 'Software Engineer at Company', help: 'Profile headline/title' },
        { id: 'location', label: 'Location', type: 'text', placeholder: 'New York, NY', help: 'Geographic location from profile' },
        { id: 'industry', label: 'Industry', type: 'text', placeholder: 'Technology', help: 'Industry sector' }
      ]
    },
    current_position: {
      title: 'Current Position',
      iconName: 'briefcase',
      iconColor: 'text-purple-400',
      description: 'Current employment information',
      fields: [
        { id: 'current_company', label: 'Current Company', type: 'text', placeholder: 'Company Name', help: 'Current employer' },
        { id: 'current_title', label: 'Current Title', type: 'text', placeholder: 'Senior Developer', help: 'Current job title' },
        { id: 'current_company_linkedin', label: 'Company LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/company/company', help: 'Company LinkedIn page' },
        { id: 'current_company_website', label: 'Company Website', type: 'url', placeholder: 'https://company.com', help: 'Official company website' },
        { id: 'current_start_date', label: 'Start Date', type: 'text', placeholder: 'January 2020', help: 'When they started this position' }
      ]
    },
    previous_positions: {
      title: 'Previous Positions',
      iconName: 'history',
      iconColor: 'text-green-400',
      description: 'Previous employment history',
      fields: [
        { id: 'previous_companies', label: 'Previous Companies', type: 'textarea', placeholder: 'Company A - Software Engineer (2018-2020)\nCompany B - Intern (2017-2018)', help: 'List previous companies and roles', rows: 4 },
        { id: 'career_timeline', label: 'Career Timeline', type: 'textarea', placeholder: '2020-2024: Senior Dev at Company X\n2018-2020: Junior Dev at Company Y', help: 'Full career timeline', rows: 3 }
      ]
    },
    education: {
      title: 'Education',
      iconName: 'academic',
      iconColor: 'text-yellow-400',
      description: 'Educational background',
      fields: [
        { id: 'schools', label: 'Schools/Universities', type: 'textarea', placeholder: 'University of X - BS Computer Science (2014-2018)\nCollege Y - Associate Degree (2012-2014)', help: 'Educational institutions attended', rows: 3 },
        { id: 'degrees', label: 'Degrees & Certifications', type: 'textarea', placeholder: 'Bachelor of Science in Computer Science\nCertified Ethical Hacker (CEH)', help: 'Degrees and certifications earned', rows: 3 }
      ]
    },
    contact_info: {
      title: 'Contact Information',
      iconName: 'contact',
      iconColor: 'text-red-400',
      description: 'Contact details found on profile',
      fields: [
        { id: 'email_address', label: 'Email Address', type: 'email', placeholder: 'john.doe@example.com', help: 'Email if visible on profile' },
        { id: 'phone_number', label: 'Phone Number', type: 'tel', placeholder: '+1 555 123 4567', help: 'Phone number if visible' },
        { id: 'personal_website', label: 'Personal Website', type: 'url', placeholder: 'https://johndoe.com', help: 'Personal portfolio/website' },
        { id: 'other_social', label: 'Other Social Media', type: 'textarea', placeholder: 'Twitter: @username\nGitHub: username\nInstagram: @username', help: 'Other social media links found', rows: 2 }
      ]
    },
    connections: {
      title: 'Network Analysis',
      iconName: 'network',
      iconColor: 'text-indigo-400',
      description: 'Connection information',
      fields: [
        { id: 'connection_count', label: 'Connection Count', type: 'text', placeholder: '500+ connections', help: 'Number of connections' },
        { id: 'mutual_connections', label: 'Mutual Connections', type: 'textarea', placeholder: 'John Smith (mutual)\nJane Doe (mutual)', help: 'People you both know', rows: 3 },
        { id: 'followers_count', label: 'Followers Count', type: 'text', placeholder: '1,000 followers', help: 'Number of followers' }
      ]
    },
    activity: {
      title: 'Activity & Engagement',
      iconName: 'activity',
      iconColor: 'text-orange-400',
      description: 'Profile activity and posts',
      fields: [
        { id: 'recent_posts', label: 'Recent Posts', type: 'textarea', placeholder: 'Post 1: About AI (2 days ago)\nPost 2: Career update (1 week ago)', help: 'Recent activity on profile', rows: 4 },
        { id: 'post_frequency', label: 'Post Frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'], help: 'How often they post' },
        { id: 'engagement_rate', label: 'Engagement Rate', type: 'text', placeholder: 'High / Medium / Low', help: 'Typical engagement on posts' },
        { id: 'topics_of_interest', label: 'Topics of Interest', type: 'textarea', placeholder: 'AI, Cybersecurity, Leadership, Product Management', help: 'Subjects they frequently post about', rows: 2 }
      ]
    },
    verification: {
      title: 'Verification Status',
      iconName: 'shield',
      iconColor: 'text-emerald-400',
      description: 'Profile verification and authenticity',
      fields: [
        { id: 'profile_verified', label: 'Profile Verified', type: 'select', options: ['Yes', 'No', 'Unknown'], help: 'Is the profile verified by LinkedIn?' },
        { id: 'profile_age', label: 'Profile Age', type: 'text', placeholder: '5+ years', help: 'How long the profile has existed' },
        { id: 'suspicious_indicators', label: 'Suspicious Indicators', type: 'textarea', placeholder: 'Generic photo, sparse history, inconsistent dates, too many connections', help: 'Red flags or suspicious elements', rows: 3 },
        { id: 'confidence_score', label: 'Confidence Score', type: 'select', options: ['High (90-100%)', 'Medium (60-89%)', 'Low (0-59%)', 'Unknown'], help: 'Overall confidence in profile authenticity' }
      ]
    },
    investigation_notes: {
      title: 'Investigation Notes',
      iconName: 'document',
      iconColor: 'text-gray-400',
      description: 'Additional investigation findings',
      fields: [
        { id: 'key_findings', label: 'Key Findings', type: 'textarea', placeholder: 'Important discoveries from the investigation...', help: 'Summary of important findings', rows: 4 },
        { id: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Further steps or actions recommended...', help: 'Next steps or recommendations', rows: 3 },
        { id: 'risk_assessment', label: 'Risk Assessment', type: 'select', options: ['Critical Risk', 'High Risk', 'Medium Risk', 'Low Risk', 'No Risk Detected'], help: 'Overall risk level' }
      ]
    }
  }
};

export default config;