import { useState, useEffect } from 'react';

const ScanDashboard = ({ 
  searchInput, 
  onSearchChange, 
  searchType, 
  onSearchTypeChange, 
  onAnalyze, 
  isAnalyzing,
  recentScans,
  alerts,
  selectedProject 
}) => {
  const [activeScanTab, setActiveScanTab] = useState('module');
  const [scanOptions, setScanOptions] = useState({
    deepScan: false,
    passiveMode: true,
    activeMode: false,
    stealthMode: false,
    followRedirects: true,
    // Removed rateLimit and threads - empty until API ready
  });

  const [runningScans, setRunningScans] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProjectForScan, setSelectedProjectForScan] = useState(selectedProject);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setAvailableProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Investigation Modules with SVG icons - Added 4 new modules
  const investigationModules = [
    { 
      id: 'job-recruitment', 
      name: 'Job Recruitment', 
      description: 'Analyze job postings for scams and fraudulent companies', 
      icon: 'job',
      color: 'from-purple-500 to-pink-500' 
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn Investigation', 
      description: 'Profile analysis, connection mapping, and suspicious activity detection', 
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

  const openSourcePlatforms = [
    { id: 'shodan', name: 'Shodan', description: 'Internet device database', icon: 'shodan', color: 'from-red-500 to-orange-500' },
    { id: 'censys', name: 'Censys', description: 'Certificate & asset discovery', icon: 'censys', color: 'from-blue-500 to-purple-500' },
    { id: 'virustotal', name: 'VirusTotal', description: 'Malware & hash lookup', icon: 'virustotal', color: 'from-green-500 to-teal-500' },
    { id: 'greynoise', name: 'GreyNoise', description: 'Internet noise analysis', icon: 'greynoise', color: 'from-gray-500 to-slate-500' },
    { id: 'haveibeenpwned', name: 'Have I Been Pwned', description: 'Breach data lookup', icon: 'hibp', color: 'from-red-500 to-pink-500' },
    { id: 'dehashed', name: 'DeHashed', description: 'Credential breach search', icon: 'dehashed', color: 'from-purple-500 to-indigo-500' },
  ];

  // SVG Icon components - All icons are now SVGs
  const getIcon = (iconName) => {
    switch(iconName) {
      case 'job':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75M7.5 6v.75m0 3v.75m0 3v.75M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3zm3 6.75h6m-6 3h3" />
          </svg>
        );
      case 'social':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 5.25h4.5m-4.5 0a9 9 0 1118 0m-18 0a9 9 0 0118 0m-18 0v.75m18-0.75v.75M15 8.25h.008v.008H15V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        );
      case 'website':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.57 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        );
      case 'email-scam':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75" />
          </svg>
        );
      case 'phone':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        );
      case 'crypto':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'shodan':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        );
      case 'censys':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'virustotal':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
          </svg>
        );
      case 'greynoise':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        );
      case 'hibp':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
          </svg>
        );
      case 'dehashed':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        );
    }
  };

  // Professional SVG icons for project display (instead of emojis)
  const getProjectIcon = (iconName) => {
    switch(iconName) {
      case 'folder':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
        );
      case 'magnifying':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        );
      case 'shield':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        );
      case 'team':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 018 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        );
      case 'globe':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
        );
    }
  };

  // Fancy checkbox component
  const FancyCheckbox = ({ label, checked, onChange }) => {
    return (
      <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all group">
        <div className="relative">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only"
          />
          <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
            checked 
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 border-transparent' 
              : 'bg-white/5 border-white/20 group-hover:border-white/40'
          }`}>
            {checked && (
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-white/80 text-sm capitalize group-hover:text-white transition-colors">
          {label}
        </span>
      </label>
    );
  };

  const handleStartScan = (module) => {
    const target = selectedProjectForScan?.name || searchInput || 'No target';
    const newScan = {
      id: Date.now(),
      tool: module.name,
      toolIcon: module.icon,
      target: target,
      status: 'running',
      progress: 0,
      startTime: new Date().toLocaleTimeString(),
      findings: []
    };
    setRunningScans([...runningScans, newScan]);
    
    // Simulate scan progress
    const interval = setInterval(() => {
      setRunningScans(prev => prev.map(scan => {
        if (scan.id === newScan.id) {
          const newProgress = scan.progress + Math.random() * 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            setScanHistory(prev => [...prev, { 
              ...scan, 
              progress: 100, 
              status: 'completed', 
              endTime: new Date().toLocaleTimeString(),
              findings: Math.floor(Math.random() * 20) + 5
            }]);
            return null;
          }
          return { ...scan, progress: newProgress };
        }
        return scan;
      }).filter(Boolean));
    }, 1000);
  };

  const handleStopScan = (scanId) => {
    setRunningScans(prev => prev.map(scan => 
      scan.id === scanId ? { ...scan, status: 'stopped' } : scan
    ));
  };

  const handleResumeScan = (scanId) => {
    setRunningScans(prev => prev.map(scan => 
      scan.id === scanId ? { ...scan, status: 'running' } : scan
    ));
  };

  const toggleOption = (option) => {
    setScanOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
              <span className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3 rounded-2xl">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </span>
              Investigation Modules
            </h1>
            <p className="text-white/40 text-sm mt-2 flex items-center gap-2">
              <span className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" />
              Specialized OSINT investigation tools
            </p>
          </div>
          
          {/* Stats Badge */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 px-4 py-2">
            <div className="text-xs text-white/40">Total Scans</div>
            <div className="text-xl font-bold text-white">{scanHistory.length + runningScans.length}</div>
          </div>
        </div>
      </div>

      {/* Project Selector */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold">Select Target</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Quick Input Option */}
          <div className="relative group">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Enter target..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all pl-10"
            />
            <svg className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Project Selection Dropdown */}
          <div className="relative col-span-2">
            <select
              value={selectedProjectForScan?.id || ''}
              onChange={(e) => {
                const project = availableProjects.find(p => p.id === parseInt(e.target.value));
                setSelectedProjectForScan(project);
              }}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 appearance-none cursor-pointer"
            >
              <option value="" className="bg-gray-900">Choose a project...</option>
              {availableProjects.map(project => (
                <option key={project.id} value={project.id} className="bg-gray-900">
                  {project.icon && getProjectIcon(project.icon)} {project.name} ({project.priority})
                </option>
              ))}
            </select>
            <svg className="w-4 h-4 text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Quick Scan Button */}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || (!searchInput && !selectedProjectForScan)}
            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Quick Scan</span>
              </>
            )}
          </button>
        </div>

        {/* Selected Project Display */}
        {selectedProjectForScan && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/30 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                {selectedProjectForScan.icon && getProjectIcon(selectedProjectForScan.icon)}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">{selectedProjectForScan.name}</h4>
                <p className="text-white/60 text-sm">{selectedProjectForScan.description || 'No description'}</p>
              </div>
              <div className="flex gap-3">
                <span className={`px-2 py-1 text-xs rounded-full bg-${selectedProjectForScan.priority}-500/20 text-${selectedProjectForScan.priority}-400`}>
                  {selectedProjectForScan.priority}
                </span>
                <span className="text-white/40 text-sm">{selectedProjectForScan.progress || 0}% complete</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scan Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 w-fit">
        {['module', 'custom', 'scheduled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveScanTab(tab)}
            className={`relative px-6 py-2.5 rounded-xl font-medium transition-all capitalize ${
              activeScanTab === tab
                ? 'text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {activeScanTab === tab && (
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-20" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab === 'module' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )}
              {tab === 'custom' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              {tab === 'scheduled' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
              {tab} Scan
            </span>
          </button>
        ))}
      </div>

      {/* Module Scan - Investigation Modules */}
      {activeScanTab === 'module' && (
        <div className="space-y-8">
          {/* Investigation Modules Grid */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <h3 className="text-white font-semibold">Investigation Modules</h3>
              <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/40">{investigationModules.length} available</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {investigationModules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => handleStartScan(module)}
                  className="group relative bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-500 text-left overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className="relative flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} bg-opacity-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                      {getIcon(module.icon)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-lg mb-1">{module.name}</h4>
                      <p className="text-white/40 text-sm">{module.description}</p>
                      
                      {/* Tags */}
                      <div className="flex gap-2 mt-3">
                        <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/40">
                          Deep analysis
                        </span>
                        <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/40">
                          Real-time
                        </span>
                      </div>
                    </div>
                    
                    {/* Scan indicator */}
                    <div className="absolute top-4 right-4 w-2 h-2">
                      <span className="absolute inset-0 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 animate-pulse" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Open Source Platforms */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
              <h3 className="text-white font-semibold">Open Source Platforms</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {openSourcePlatforms.map((platform) => (
                <button
                  key={platform.id}
                  className="group relative bg-gradient-to-br from-gray-900 to-black rounded-2xl p-4 border border-white/10 hover:border-blue-500/50 transition-all duration-500 text-left flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform.color} bg-opacity-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    {getIcon(platform.icon)}
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">{platform.name}</h4>
                    <p className="text-white/40 text-xs">{platform.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Scan Options - With fancy checkboxes and empty performance section */}
      {activeScanTab === 'custom' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Options Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Scan Configuration
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(scanOptions).map(([key, value]) => (
                  <FancyCheckbox
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    checked={value}
                    onChange={() => toggleOption(key)}
                  />
                ))}
              </div>
            </div>

            {/* Empty Performance Settings - Waiting for API */}
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                Performance Settings
              </h3>
              
              <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                <svg className="w-12 h-12 mx-auto text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233l3.277-3.277a2.543 2.543 0 10-3.594-3.594l-3.277 3.277m0 0L9.75 8.352" />
                </svg>
                <p className="text-white/40 text-sm">Performance settings coming soon</p>
                <p className="text-white/20 text-xs mt-1">API integration in progress</p>
              </div>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
            <h3 className="text-white font-semibold mb-4">Scan Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Target</span>
                <span className="text-white font-medium">
                  {selectedProjectForScan?.name || searchInput || 'Not selected'}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Configuration</span>
                <span className="text-white font-medium">
                  {Object.values(scanOptions).filter(v => v === true).length} options
                </span>
              </div>

              <div className="border-t border-white/10 my-4" />

              <div className="text-center">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  {investigationModules.length}
                </div>
                <div className="text-white/40 text-xs">Modules Available</div>
              </div>

              <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium flex items-center justify-center gap-2 group">
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Custom Scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Scans */}
      {activeScanTab === 'scheduled' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Scheduled Scans</h3>
              <p className="text-white/40 mb-6 max-w-md mx-auto">
                Set up automated recurring scans to continuously monitor your targets
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Schedule
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold text-white">{scanHistory.length}</div>
                <div className="text-white/40 text-sm">Completed Scans</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{runningScans.length}</div>
                <div className="text-white/40 text-sm">Active Scans</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {scanHistory.reduce((acc, scan) => acc + (scan.findings || 0), 0)}
                </div>
                <div className="text-white/40 text-sm">Findings Detected</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Running Scans */}
      {runningScans.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full animate-pulse" />
            <h3 className="text-white font-semibold">Active Scans ({runningScans.length})</h3>
          </div>
          
          <div className="grid gap-4">
            {runningScans.map(scan => (
              <div key={scan.id} className="group bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-purple-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                      {getIcon(scan.toolIcon)}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{scan.tool}</h4>
                      <p className="text-white/40 text-sm">Target: {scan.target}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {scan.status === 'running' ? (
                      <>
                        <button 
                          onClick={() => handleStopScan(scan.id)}
                          className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          Running
                        </span>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleResumeScan(scan.id)}
                          className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <span className="text-yellow-400 text-sm">Paused</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Progress</span>
                    <span className="text-white font-medium">{Math.round(scan.progress)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 relative"
                      style={{ width: `${scan.progress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Started: {scan.startTime}</span>
                    <span>Est. remaining: {Math.round((100 - scan.progress) / 10)}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
            <h3 className="text-white font-semibold">Recent Scans</h3>
          </div>

          <div className="grid gap-3">
            {scanHistory.slice(0, 3).map(scan => (
              <div key={scan.id} className="group bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-blue-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                      {getIcon(scan.toolIcon)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{scan.tool}</h4>
                      <p className="text-white/40 text-xs">{scan.target}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {scan.findings && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                        {scan.findings} findings
                      </span>
                    )}
                    <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded-full">
                      Completed
                    </span>
                    <button className="text-purple-400 hover:text-purple-300 p-1 hover:bg-white/5 rounded-lg transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ScanDashboard;
