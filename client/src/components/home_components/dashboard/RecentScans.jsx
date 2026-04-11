import { useState, useEffect } from 'react';

// Generate random recent scans
const generateRandomScans = (projectId = null) => {
  const possibleTargets = [
    "example.com", "suspicious-site.net", "darkweb-market.onion", 
    "phishing-login.com", "fake-bank.xyz", "scam-job-post.com",
    "linkedin.com/in/fake-profile", "crypto-wallet-tracker", 
    "breach-email@domain.com", "malware-file.exe", "ransomware-sample"
  ];
  
  const possibleTypes = ["url", "email", "file"];
  
  // Generate 2-4 random scans
  const numScans = Math.floor(Math.random() * 3) + 2;
  const scans = [];
  
  for (let i = 0; i < numScans; i++) {
    const randomRisk = Math.floor(Math.random() * 80) + 15;
    const randomTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
    const randomType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
    const randomTime = Math.floor(Math.random() * 60);
    const timeText = randomTime < 1 ? "Just now" : `${randomTime} min ago`;
    
    scans.push({
      id: `${Date.now()}_${projectId || 'default'}_${i}`,
      target: randomTarget,
      type: randomType,
      date: timeText,
      risk: randomRisk
    });
  }
  
  return scans;
};

const RecentScans = ({ scans = [], selectedProjectId }) => {
  const [recentScans, setRecentScans] = useState([]);

  // Generate new random scans when project changes
  useEffect(() => {
    console.log('Project changed, generating new recent scans for project:', selectedProjectId);
    const newScans = generateRandomScans(selectedProjectId);
    setRecentScans(newScans);
  }, [selectedProjectId]);

  // Initial load
  useEffect(() => {
    if (scans && scans.length > 0) {
      setRecentScans(scans);
    } else {
      const newScans = generateRandomScans();
      setRecentScans(newScans);
    }
  }, []);

  const getRiskColor = (score) => {
    if (score >= 75) return "text-red-500";
    if (score >= 50) return "text-orange-500";
    if (score >= 25) return "text-yellow-500";
    return "text-green-500";
  };

  const getRiskBgColor = (score) => {
    if (score >= 75) return "bg-red-500";
    if (score >= 50) return "bg-orange-500";
    if (score >= 25) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "url": return (
        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
      case "email": return (
        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
      case "file": return (
        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
      default: return (
        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    }
  };

  // Manual refresh button
  const handleRefresh = () => {
    const newScans = generateRandomScans(selectedProjectId);
    setRecentScans(newScans);
  };

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Investigations
        </h4>
        <button 
          onClick={handleRefresh}
          className="text-white/60 hover:text-white text-xs flex items-center gap-1 transition-colors"
          title="Refresh scans"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      
      <div className="space-y-2 lg:space-y-3 min-h-[200px]">
        {recentScans.length > 0 ? (
          recentScans.map((scan) => (
            <div key={scan.id} className="flex items-center justify-between p-2 lg:p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
              <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-${getRiskBgColor(scan.risk)}/20 flex items-center justify-center flex-shrink-0`}>
                  {getTypeIcon(scan.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm lg:text-base truncate">{scan.target}</p>
                  <p className="text-white/40 text-xs">{scan.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
                <div className={`px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm font-medium ${getRiskColor(scan.risk)}`}>
                  {scan.risk}%
                </div>
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <div className="w-16 h-16 mb-3 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm">No investigations yet</p>
            <p className="text-white/20 text-xs mt-1">Your recent scans will appear here</p>
          </div>
        )}
      </div>
      
      <button className="w-full mt-4 p-2.5 lg:p-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/10 text-sm lg:text-base">
        View All Investigations
      </button>
    </div>
  );
};

export default RecentScans;