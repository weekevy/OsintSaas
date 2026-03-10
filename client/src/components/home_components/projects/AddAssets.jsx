import { useState, useEffect, useRef } from 'react';

const AddAssets = ({ isOpen, onClose, projectId, onAssetsAdded }) => {
  const [view, setView] = useState('grid');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const addPanelRef = useRef(null);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [newAsset, setNewAsset] = useState({
    type: 'url',
    category: 'links',
    subcategory: 'url',
    title: '',
    url: '',
    description: '',
    tags: [],
    file: null,
    metadata: {}
  });

  // SVG Icons (keeping the same comprehensive set)
  const icons = {
    all: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    links: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    contacts: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    finance: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    documents: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    search: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    grid: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    list: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
      </svg>
    ),
    add: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 4v16m8-8H4" strokeLinecap="round" />
      </svg>
    ),
    close: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    delete: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
    folder: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
    url: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    linkedin: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    twitter: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    facebook: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
    instagram: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" />
        <circle cx="18" cy="6" r="0.5" fill="currentColor" />
      </svg>
    ),
    github: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5-2a.5.5 0 11-1 0 .5.5 0 011 0zm-6 0a.5.5 0 11-1 0 .5.5 0 011 0z" />
      </svg>
    ),
    suspicious: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    email: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.57 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    phone: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    crypto: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    image: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    pdf: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    document: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    text: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    upload: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    chevronLeft: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    ),
  };

  // Category structure with subcategories
  const categories = [
    {
      id: 'all',
      name: 'All Assets',
      icon: icons.all,
      color: 'from-purple-500 to-blue-500'
    },
    {
      id: 'links',
      name: 'Links & URLs',
      icon: icons.links,
      color: 'from-blue-500 to-cyan-500',
      subcategories: [
        { id: 'url', name: 'Generic URLs', icon: icons.url, placeholder: 'https://example.com' },
        { id: 'linkedin', name: 'LinkedIn', icon: icons.linkedin, placeholder: 'https://linkedin.com/in/username' },
        { id: 'twitter', name: 'Twitter/X', icon: icons.twitter, placeholder: 'https://twitter.com/username' },
        { id: 'facebook', name: 'Facebook', icon: icons.facebook, placeholder: 'https://facebook.com/username' },
        { id: 'instagram', name: 'Instagram', icon: icons.instagram, placeholder: 'https://instagram.com/username' },
        { id: 'github', name: 'GitHub', icon: icons.github, placeholder: 'https://github.com/username' },
        { id: 'suspicious_url', name: 'Suspicious/Malicious', icon: icons.suspicious, placeholder: 'https://suspicious-site.com' }
      ]
    },
    {
      id: 'contacts',
      name: 'Contact Information',
      icon: icons.contacts,
      color: 'from-green-500 to-emerald-500',
      subcategories: [
        { id: 'email', name: 'Email Addresses', icon: icons.email, placeholder: 'contact@example.com' },
        { id: 'phone', name: 'Phone Numbers', icon: icons.phone, placeholder: '+1 (555) 123-4567' }
      ]
    },
    {
      id: 'finance',
      name: 'Financial Assets',
      icon: icons.finance,
      color: 'from-yellow-500 to-orange-500',
      subcategories: [
        { id: 'crypto', name: 'Cryptocurrency Wallets', icon: icons.crypto, placeholder: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' }
      ]
    },
    {
      id: 'documents',
      name: 'Documents & Files',
      icon: icons.documents,
      color: 'from-purple-500 to-pink-500',
      subcategories: [
        { id: 'image', name: 'Images', icon: icons.image, placeholder: 'Upload image files' },
        { id: 'pdf', name: 'PDF Documents', icon: icons.pdf, placeholder: 'Upload PDF files' },
        { id: 'document', name: 'Text Documents', icon: icons.document, placeholder: 'Upload document files' },
        { id: 'text', name: 'Raw Text', icon: icons.text, placeholder: 'Upload text files' }
      ]
    }
  ];

  // Asset type definitions
  const assetTypes = [
    // Links & URLs
    { value: 'url', label: 'Generic URL', category: 'links', subcategory: 'url', icon: icons.url, color: 'from-blue-500 to-cyan-500', placeholder: 'https://example.com' },
    { value: 'linkedin', label: 'LinkedIn Profile', category: 'links', subcategory: 'linkedin', icon: icons.linkedin, color: 'from-sky-500 to-blue-500', placeholder: 'https://linkedin.com/in/username' },
    { value: 'twitter', label: 'Twitter/X Profile', category: 'links', subcategory: 'twitter', icon: icons.twitter, color: 'from-blue-400 to-cyan-400', placeholder: 'https://twitter.com/username' },
    { value: 'facebook', label: 'Facebook Profile', category: 'links', subcategory: 'facebook', icon: icons.facebook, color: 'from-indigo-500 to-blue-500', placeholder: 'https://facebook.com/username' },
    { value: 'instagram', label: 'Instagram Profile', category: 'links', subcategory: 'instagram', icon: icons.instagram, color: 'from-pink-500 to-purple-500', placeholder: 'https://instagram.com/username' },
    { value: 'github', label: 'GitHub Repository', category: 'links', subcategory: 'github', icon: icons.github, color: 'from-gray-500 to-slate-500', placeholder: 'https://github.com/username/repo' },
    { value: 'suspicious_url', label: 'Suspicious URL', category: 'links', subcategory: 'suspicious_url', icon: icons.suspicious, color: 'from-red-500 to-pink-500', placeholder: 'https://suspicious-site.com' },
    
    // Contacts
    { value: 'email', label: 'Email Address', category: 'contacts', subcategory: 'email', icon: icons.email, color: 'from-yellow-500 to-amber-500', placeholder: 'contact@example.com' },
    { value: 'phone', label: 'Phone Number', category: 'contacts', subcategory: 'phone', icon: icons.phone, color: 'from-green-500 to-emerald-500', placeholder: '+1 (555) 123-4567' },
    
    // Finance
    { value: 'crypto', label: 'Crypto Wallet', category: 'finance', subcategory: 'crypto', icon: icons.crypto, color: 'from-orange-500 to-red-500', placeholder: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    
    // Documents
    { value: 'image', label: 'Image', category: 'documents', subcategory: 'image', icon: icons.image, color: 'from-purple-500 to-pink-500', placeholder: 'Upload image files' },
    { value: 'pdf', label: 'PDF Document', category: 'documents', subcategory: 'pdf', icon: icons.pdf, color: 'from-red-400 to-orange-400', placeholder: 'Upload PDF files' },
    { value: 'document', label: 'Document', category: 'documents', subcategory: 'document', icon: icons.document, color: 'from-green-500 to-teal-500', placeholder: 'Upload document files' },
    { value: 'text', label: 'Text File', category: 'documents', subcategory: 'text', icon: icons.text, color: 'from-gray-400 to-slate-400', placeholder: 'Upload text files' },
  ];

  // Fetch assets when modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      fetchAssets();
    }
  }, [isOpen, projectId]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        if (showAddPanel) {
          setShowAddPanel(false);
          resetNewAsset();
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, showAddPanel]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/assets`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetNewAsset = () => {
    setNewAsset({
      type: 'url',
      category: 'links',
      subcategory: 'url',
      title: '',
      url: '',
      description: '',
      tags: [],
      file: null,
      metadata: {}
    });
  };

  const handleCategorySelect = (category, subcategory) => {
    const assetType = assetTypes.find(t => t.subcategory === subcategory);
    if (assetType) {
      setNewAsset({
        ...newAsset,
        type: assetType.value,
        category: category,
        subcategory: subcategory,
        title: '',
        url: '',
        file: null
      });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const type = file.type.startsWith('image/') ? 'image' :
                   file.type === 'application/pdf' ? 'pdf' :
                   file.type.includes('text') ? 'text' : 'document';
      
      const assetType = assetTypes.find(t => t.value === type);
      
      setNewAsset({
        ...newAsset,
        file,
        title: file.name,
        type: type,
        category: 'documents',
        subcategory: type,
        url: ''
      });
    }
  };

  const handleAddAsset = async () => {
    if (!newAsset.title) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      let response;
      let data;
      
      if (newAsset.file) {
        // File upload
        const formData = new FormData();
        formData.append('file', newAsset.file);
        formData.append('title', newAsset.title);
        formData.append('type', newAsset.type);
        formData.append('description', newAsset.description || '');

        response = await fetch(`/api/projects/${projectId}/assets`, {
          method: 'PUT',
          credentials: 'include',
          body: formData
        });
        data = await response.json();
      } else {
        // URL/Text asset
        response = await fetch(`/api/projects/${projectId}/assets`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: newAsset.type,
            title: newAsset.title,
            url: newAsset.url,
            description: newAsset.description || ''
          })
        });
        data = await response.json();
      }

      clearInterval(interval);
      setUploadProgress(100);

      if (response.ok) {
        setTimeout(() => {
          fetchAssets();
          setShowAddPanel(false);
          resetNewAsset();
          setUploadProgress(0);
          setUploading(false);
          if (onAssetsAdded) onAssetsAdded();
        }, 500);
      } else {
        console.error('Error adding asset:', data.error);
        setUploading(false);
        alert(data.error || 'Failed to add asset');
      }
    } catch (error) {
      console.error('Error adding asset:', error);
      setUploading(false);
      alert('Network error. Please try again.');
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}/assets/${assetId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        fetchAssets();
        setSelectedAssets(selectedAssets.filter(id => id !== assetId));
        if (onAssetsAdded) onAssetsAdded();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAssets.length === 0) return;
    if (!confirm(`Delete ${selectedAssets.length} selected assets?`)) return;
    
    for (const assetId of selectedAssets) {
      await handleDeleteAsset(assetId);
    }
    setSelectedAssets([]);
  };

  const toggleAssetSelection = (assetId) => {
    setSelectedAssets(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getAssetIcon = (type, className = "w-4 h-4") => {
    const assetType = assetTypes.find(t => t.value === type);
    return assetType?.icon(className) || icons.document(className);
  };

  const getAssetColor = (type) => {
    const assetType = assetTypes.find(t => t.value === type);
    return assetType?.color || 'from-gray-500 to-slate-500';
  };

  const getCurrentCategoryAssets = () => {
    if (activeCategory === 'all') return assets;
    
    const categoryTypes = assetTypes
      .filter(t => t.category === activeCategory)
      .map(t => t.value);
    
    let filtered = assets.filter(asset => categoryTypes.includes(asset.asset_type));
    
    if (activeSubCategory) {
      const subcategoryTypes = assetTypes
        .filter(t => t.subcategory === activeSubCategory)
        .map(t => t.value);
      filtered = filtered.filter(asset => subcategoryTypes.includes(asset.asset_type));
    }
    
    return filtered;
  };

  const currentCategoryAssets = getCurrentCategoryAssets();

  const getCategoryDisplayName = () => {
    if (activeCategory === 'all') return 'All Assets';
    const category = categories.find(c => c.id === activeCategory);
    if (activeSubCategory) {
      const sub = category?.subcategories?.find(s => s.id === activeSubCategory);
      return sub ? sub.name : category?.name;
    }
    return category?.name;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        ref={modalRef}
        className="relative w-full max-w-7xl bg-gradient-to-b from-gray-900 to-black rounded-xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden animate-slideUp"
      >
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
          <div className="relative px-6 py-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showAddPanel ? (
                  <button
                    onClick={() => {
                      setShowAddPanel(false);
                      resetNewAsset();
                    }}
                    className="p-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    {icons.chevronLeft("w-5 h-5")}
                  </button>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    {icons.folder("w-6 h-6 text-purple-400")}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {showAddPanel ? 'Add New Asset' : 'Asset Manager'}
                  </h2>
                  <p className="text-white/40 text-sm">
                    {showAddPanel 
                      ? 'Fill in the details to add a new asset' 
                      : 'Manage and organize project assets'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                {icons.close("w-5 h-5")}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Conditionally show either assets view or add panel */}
        {showAddPanel ? (
          /* Add Asset Panel - Integrated inside the main popup */
          <div ref={addPanelRef} className="p-6 max-h-[600px] overflow-y-auto">
            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-white/60 text-sm font-medium mb-3">Select Category</label>
              <div className="grid grid-cols-4 gap-3">
                {categories.filter(c => c.id !== 'all').map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setNewAsset({
                        ...newAsset,
                        category: category.id,
                        subcategory: category.subcategories[0]?.id,
                        type: assetTypes.find(t => t.subcategory === category.subcategories[0]?.id)?.value || 'url'
                      });
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                      newAsset.category === category.id
                        ? `bg-gradient-to-r ${category.color} text-white border-transparent`
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {category.icon("w-6 h-6")}
                    <span className="text-xs font-medium text-center">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategory Selection */}
            {newAsset.category !== 'all' && (
              <div className="mb-6">
                <label className="block text-white/60 text-sm font-medium mb-3">Select Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {categories
                    .find(c => c.id === newAsset.category)
                    ?.subcategories.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          const assetType = assetTypes.find(t => t.subcategory === sub.id);
                          if (assetType) {
                            setNewAsset({
                              ...newAsset,
                              subcategory: sub.id,
                              type: assetType.value,
                              url: '',
                              file: null
                            });
                          }
                        }}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                          newAsset.subcategory === sub.id
                            ? `bg-gradient-to-r ${categories.find(c => c.id === newAsset.category)?.color} text-white border-transparent`
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {sub.icon("w-5 h-5")}
                        <span className="text-[10px] font-medium text-center">{sub.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Asset Form Fields */}
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newAsset.title}
                  onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Enter a descriptive title"
                  autoFocus
                />
              </div>

              {/* URL/Identifier Field (for non-file types) */}
              {!['image', 'pdf', 'document', 'text'].includes(newAsset.type) && (
                <div>
                  <label className="block text-white/60 text-sm font-medium mb-2">
                    {newAsset.type === 'email' ? 'Email Address' :
                     newAsset.type === 'phone' ? 'Phone Number' :
                     newAsset.type === 'crypto' ? 'Wallet Address' :
                     'URL'}
                  </label>
                  <input
                    type="text"
                    value={newAsset.url}
                    onChange={(e) => setNewAsset({ ...newAsset, url: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder={assetTypes.find(t => t.value === newAsset.type)?.placeholder || 'Enter value'}
                  />
                </div>
              )}

              {/* File Upload (for document types) */}
              {['image', 'pdf', 'document', 'text'].includes(newAsset.type) && (
                <div>
                  <label className="block text-white/60 text-sm font-medium mb-2">File</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept={
                      newAsset.type === 'image' ? 'image/*' :
                      newAsset.type === 'pdf' ? '.pdf' :
                      '.txt,.csv,.json,.pdf,.doc,.docx,.md'
                    }
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors group"
                  >
                    {newAsset.file ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                          {getAssetIcon(newAsset.type, "w-8 h-8 text-purple-400")}
                        </div>
                        <div>
                          <p className="text-white text-base font-medium">{newAsset.file.name}</p>
                          <p className="text-white/40 text-sm">{formatFileSize(newAsset.file.size)}</p>
                        </div>
                        <p className="text-purple-400 text-sm mt-2">Click to change file</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {icons.upload("w-8 h-8 text-white/40")}
                        </div>
                        <div>
                          <p className="text-white text-base font-medium">Click to upload</p>
                          <p className="text-white/40 text-sm">{assetTypes.find(t => t.value === newAsset.type)?.placeholder || 'Select a file'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Description (optional)</label>
                <textarea
                  value={newAsset.description}
                  onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  placeholder="Add any additional notes or context about this asset..."
                />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Uploading...</span>
                    <span className="text-purple-400">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-white/10">
              <button
                onClick={() => {
                  setShowAddPanel(false);
                  resetNewAsset();
                }}
                className="px-5 py-2.5 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAsset}
                disabled={uploading || !newAsset.title || (!newAsset.file && !newAsset.url && !['image', 'pdf', 'document', 'text'].includes(newAsset.type))}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:hover:shadow-none transition-all text-sm font-medium flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    {icons.add("w-4 h-4")}
                    Add Asset
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Assets View */
          <>
            {/* Left Sidebar - Categories */}
            <div className="flex h-[600px]">
              <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search assets..."
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <div className="absolute left-3 top-3 text-white/40">
                      {icons.search("w-4 h-4")}
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-1.5">
                  {categories.map(category => (
                    <div key={category.id}>
                      <button
                        onClick={() => {
                          setActiveCategory(category.id);
                          setActiveSubCategory(null);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                          activeCategory === category.id && !activeSubCategory
                            ? `bg-gradient-to-r ${category.color} text-white`
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {category.icon("w-4 h-4")}
                        <span className="flex-1 text-left">{category.name}</span>
                        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                          {assets.filter(a => {
                            if (category.id === 'all') return true;
                            const categoryTypes = assetTypes.filter(t => t.category === category.id).map(t => t.value);
                            return categoryTypes.includes(a.asset_type);
                          }).length}
                        </span>
                      </button>

                      {/* Subcategories */}
                      {category.subcategories && activeCategory === category.id && (
                        <div className="ml-7 mt-1 space-y-1">
                          {category.subcategories.map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setActiveSubCategory(sub.id);
                                setActiveCategory(category.id);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs ${
                                activeSubCategory === sub.id
                                  ? `bg-gradient-to-r ${category.color} text-white`
                                  : 'text-white/40 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {sub.icon("w-3.5 h-3.5")}
                              <span className="flex-1 text-left">{sub.name}</span>
                              <span className="text-[10px] bg-white/20 px-1 py-0.5 rounded-full">
                                {assets.filter(a => {
                                  const subTypes = assetTypes.filter(t => t.subcategory === sub.id).map(t => t.value);
                                  return subTypes.includes(a.asset_type);
                                }).length}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Content */}
              <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedAssets.length > 0 ? (
                      <>
                        <span className="text-white/60 text-sm">{selectedAssets.length} selected</span>
                        <button
                          onClick={handleBulkDelete}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm flex items-center gap-1.5"
                        >
                          {icons.delete("w-4 h-4")}
                          Delete Selected
                        </button>
                      </>
                    ) : (
                      <span className="text-white/40 text-sm">{currentCategoryAssets.length} assets in {getCategoryDisplayName()}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Name</option>
                    </select>

                    {/* View toggle */}
                    <div className="flex bg-white/5 rounded-lg border border-white/10 p-1">
                      <button
                        onClick={() => setView('grid')}
                        className={`p-1.5 rounded ${view === 'grid' ? 'bg-purple-500 text-white' : 'text-white/40 hover:text-white'}`}
                      >
                        {icons.grid("w-4 h-4")}
                      </button>
                      <button
                        onClick={() => setView('list')}
                        className={`p-1.5 rounded ${view === 'list' ? 'bg-purple-500 text-white' : 'text-white/40 hover:text-white'}`}
                      >
                        {icons.list("w-4 h-4")}
                      </button>
                    </div>

                    {/* Add Asset Button - Only in toolbar */}
                    <button
                      onClick={() => setShowAddPanel(true)}
                      className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm flex items-center gap-1.5"
                    >
                      {icons.add("w-4 h-4")}
                      Add Asset
                    </button>
                  </div>
                </div>

                {/* Assets display */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin" />
                    </div>
                  ) : currentCategoryAssets.length > 0 ? (
                    view === 'grid' ? (
                      // Grid view
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {currentCategoryAssets.map(asset => (
                          <div
                            key={asset.id}
                            onClick={() => toggleAssetSelection(asset.id)}
                            className={`group relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4 border-2 cursor-pointer transition-all ${
                              selectedAssets.includes(asset.id)
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-white/10 hover:border-purple-500/50 hover:scale-105'
                            }`}
                          >
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <input
                                type="checkbox"
                                checked={selectedAssets.includes(asset.id)}
                                onChange={() => {}}
                                className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-purple-500"
                              />
                            </div>
                            
                            <div className="flex flex-col items-center text-center">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAssetColor(asset.asset_type)} bg-opacity-20 flex items-center justify-center mb-3`}>
                                {getAssetIcon(asset.asset_type, "w-6 h-6")}
                              </div>
                              <h4 className="text-white font-medium text-sm truncate w-full">{asset.title}</h4>
                              <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/40 mt-2">
                                {asset.asset_type}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // List view
                      <div className="space-y-2">
                        {currentCategoryAssets.map(asset => (
                          <div
                            key={asset.id}
                            className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedAssets.includes(asset.id)
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-transparent hover:border-white/10 hover:bg-white/5'
                            }`}
                            onClick={() => toggleAssetSelection(asset.id)}
                          >
                            <div>
                              <input
                                type="checkbox"
                                checked={selectedAssets.includes(asset.id)}
                                onChange={() => {}}
                                className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-purple-500"
                              />
                            </div>
                            
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAssetColor(asset.asset_type)} bg-opacity-20 flex items-center justify-center`}>
                              {getAssetIcon(asset.asset_type, "w-5 h-5")}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-white font-medium text-sm truncate">{asset.title}</h4>
                                <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/40">
                                  {asset.asset_type}
                                </span>
                              </div>
                              {asset.url && (
                                <p className="text-white/40 text-xs truncate">{asset.url}</p>
                              )}
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAsset(asset.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-white/40 hover:text-red-400 transition-all"
                            >
                              {icons.delete("w-4 h-4")}
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    // Empty state for current category - NO ADD BUTTON HERE
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 flex items-center justify-center mb-4">
                        {activeCategory === 'all' ? icons.folder("w-10 h-10 text-white/30") :
                         activeCategory === 'links' ? icons.links("w-10 h-10 text-white/30") :
                         activeCategory === 'contacts' ? icons.contacts("w-10 h-10 text-white/30") :
                         activeCategory === 'finance' ? icons.finance("w-10 h-10 text-white/30") :
                         activeCategory === 'documents' ? icons.documents("w-10 h-10 text-white/30") :
                         icons.folder("w-10 h-10 text-white/30")}
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">No assets in {getCategoryDisplayName()}</h3>
                      <p className="text-white/40 text-sm max-w-xs">
                        {activeCategory === 'all' 
                          ? "This project doesn't have any assets yet." 
                          : `This category doesn't have any assets yet.`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/10 bg-black/20 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddAssets;
