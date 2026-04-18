export const config = {
  moduleId: 'social-media',
  name: 'Social Media OSINT',
  description: 'Analyze social media profiles across multiple platforms',
  apiBase: '/api/modules/social-media',
  fields: {
    profile_info: {
      title: '👤 Profile Information',
      description: 'Target profile across platforms',
      fields: [
        { id: 'platform', label: 'Platform', type: 'select', options: ['Twitter/X', 'Instagram', 'Facebook', 'TikTok', 'Reddit', 'Other'], required: true, help: 'Which social media platform?' },
        { id: 'profile_url', label: 'Profile URL', type: 'url', placeholder: 'https://...', required: true, help: 'Direct link to the profile' },
        { id: 'username', label: 'Username', type: 'text', placeholder: '@username', help: 'Profile username/handle' },
        { id: 'display_name', label: 'Display Name', type: 'text', placeholder: 'John Doe', help: 'Name shown on profile' },
        { id: 'bio', label: 'Bio/Description', type: 'textarea', placeholder: 'Profile bio...', help: 'Profile description text', rows: 3 }
      ]
    },
    activity: {
      title: '📱 Activity & Content',
      description: 'Posts and engagement analysis',
      fields: [
        { id: 'post_count', label: 'Post Count', type: 'number', placeholder: 'Number of posts', help: 'Total posts/tweets' },
        { id: 'follower_count', label: 'Follower Count', type: 'text', placeholder: 'Followers', help: 'Number of followers' },
        { id: 'following_count', label: 'Following Count', type: 'text', placeholder: 'Following', help: 'Number of accounts followed' },
        { id: 'suspicious_posts', label: 'Suspicious Posts', type: 'textarea', placeholder: 'List any concerning posts...', help: 'Posts that raise red flags', rows: 4 }
      ]
    },
    evidence: {
      title: '📎 Upload Evidence',
      description: 'Upload screenshots and evidence',
      fields: [
        { id: 'files', label: 'Upload Evidence Files', type: 'file', help: 'Screenshots of profile, posts, etc.', multiple: true, accept: '.jpg,.jpeg,.png,.pdf' },
        { id: 'notes', label: 'Investigation Notes', type: 'textarea', placeholder: 'Add your findings and observations...', help: 'Detailed notes', rows: 4 }
      ]
    }
  }
};

export default config;