import { useState, useEffect } from 'react';

// Mock alert data for different scenarios - COMMENTED OUT
/*
const getRandomAlerts = (projectId = null) => {
  // Generate different alerts based on project ID for variety
  const projectSpecificPrefix = projectId ? `[Project ${projectId}] ` : '';
  
  const possibleAlerts = [
    { severity: "critical", source: "Dark Web Monitor", message: `${projectSpecificPrefix}Credentials found in data breach`, time: "Just now" },
    { severity: "high", source: "Threat Intelligence", message: `${projectSpecificPrefix}Suspicious login attempt detected`, time: "2 min ago" },
    { severity: "high", source: "Email Security", message: `${projectSpecificPrefix}Phishing email detected`, time: "5 min ago" },
    { severity: "warning", source: "Network Monitor", message: `${projectSpecificPrefix}Unusual outbound traffic detected`, time: "12 min ago" },
    { severity: "warning", source: "Vulnerability Scanner", message: `${projectSpecificPrefix}New CVE detected`, time: "18 min ago" },
    { severity: "critical", source: "Data Leak Detection", message: `${projectSpecificPrefix}Sensitive data exposure`, time: "25 min ago" },
    { severity: "high", source: "Malware Analysis", message: `${projectSpecificPrefix}Suspicious file detected`, time: "30 min ago" },
    { severity: "warning", source: "Access Control", message: `${projectSpecificPrefix}Multiple failed auth attempts`, time: "45 min ago" },
    { severity: "critical", source: "Ransomware Protection", message: `${projectSpecificPrefix}Ransomware activity detected`, time: "1 hour ago" },
    { severity: "high", source: "API Security", message: `${projectSpecificPrefix}Abnormal API call frequency`, time: "2 hours ago" },
    { severity: "warning", source: "DNS Monitor", message: `${projectSpecificPrefix}Suspicious domain resolution`, time: "3 hours ago" },
    { severity: "critical", source: "Identity Theft", message: `${projectSpecificPrefix}Synthetic identity pattern detected`, time: "4 hours ago" },
    { severity: "high", source: "Social Media OSINT", message: `${projectSpecificPrefix}Fake recruiter profile detected`, time: "5 hours ago" },
    { severity: "warning", source: "Job Portal", message: `${projectSpecificPrefix}Suspicious job posting detected`, time: "6 hours ago" },
    { severity: "critical", source: "Email Analysis", message: `${projectSpecificPrefix}CEO fraud email detected`, time: "8 hours ago" }
  ];
  
  // Return 2-4 random alerts
  const numAlerts = Math.floor(Math.random() * 3) + 2;
  const shuffled = [...possibleAlerts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numAlerts).map((alert, index) => ({
    id: `${Date.now()}_${projectId || 'default'}_${index}`,
    ...alert
  }));
};
*/

const AlertsSection = ({ alerts: externalAlerts, selectedProjectId, onRefresh, isLoading }) => {
  const [alerts, setAlerts] = useState([]);

  // COMMENTED OUT - Using externalAlerts from props instead of generating mock data
  /*
  useEffect(() => {
    console.log('Project changed, generating new alerts for project:', selectedProjectId);
    const newAlerts = getRandomAlerts(selectedProjectId);
    setAlerts(newAlerts);
  }, [selectedProjectId]);

  useEffect(() => {
    const newAlerts = getRandomAlerts(selectedProjectId);
    setAlerts(newAlerts);
  }, []);
  */

  // Use externalAlerts from props
  useEffect(() => {
    if (externalAlerts && externalAlerts.length > 0) {
      setAlerts(externalAlerts);
    } else {
      setAlerts([]);
    }
  }, [externalAlerts, selectedProjectId]);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case "critical": return "border-red-500 bg-red-500/10 text-red-400";
      case "high": return "border-orange-500 bg-orange-500/10 text-orange-400";
      case "warning": return "border-yellow-500 bg-yellow-500/10 text-yellow-400";
      default: return "border-blue-500 bg-blue-500/10 text-blue-400";
    }
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case "critical": return (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
      case "high": 
      case "warning": return (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      default: return null;
    }
  };

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
  };

  const AlertSkeleton = () => (
    <div className="p-4 lg:p-5 rounded-2xl border border-white/10 bg-black flex flex-col sm:flex-row items-start gap-3 lg:gap-4 animate-pulse">
      <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 shrink-0" />
      <div className="flex-1 w-full space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-4 w-20 bg-white/5 rounded" />
        </div>
        <div className="h-4 w-full bg-white/5 rounded" />
        <div className="h-4 w-2/3 bg-white/5 rounded" />
        <div className="flex gap-3 pt-2">
          <div className="h-7 w-20 bg-white/5 rounded-lg" />
          <div className="h-7 w-20 bg-white/5 rounded-lg" />
        </div>
      </div>
      <div className="h-4 w-16 bg-white/5 rounded ml-auto" />
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <header>
          <p className="text-[10px] font-semibold text-[#00E5FF]/80 tracking-[0.18em] uppercase">Alerts</p>
          <div className="h-6 w-48 bg-white/10 rounded mt-1 animate-pulse" />
        </header>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <AlertSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // Check if no project is selected
  if (!selectedProjectId) {
    return (
      <div className="space-y-4">
        <header>
          <p className="text-[10px] font-semibold text-[#00E5FF]/80 tracking-[0.18em] uppercase">Alerts</p>
          <h3 className="text-lg lg:text-xl font-semibold text-white mt-1 tracking-tight flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 border border-red-500/25">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            Threats & alerts
          </h3>
        </header>

        <div className="bg-black rounded-2xl p-8 text-center border border-white/[0.07] animate-fadeIn">
          <svg className="w-14 h-14 mx-auto text-white/25 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-white/70 text-base font-medium mb-1">No project selected</p>
          <p className="text-white/40 text-sm max-w-md mx-auto">Select a project to surface live alerts and severity-ranked signals.</p>
        </div>
      </div>
    );
  }

  // Check if no alerts exist for selected project
  if (alerts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <header>
            <p className="text-[10px] font-semibold text-[#00E5FF]/80 tracking-[0.18em] uppercase">Alerts</p>
            <h3 className="text-lg lg:text-xl font-semibold text-white mt-1 tracking-tight flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 border border-red-500/25">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              Threats & alerts
            </h3>
          </header>
          <button
            type="button"
            onClick={handleRefresh}
            className="shrink-0 text-white/50 hover:text-white text-xs flex items-center gap-1.5 transition-colors px-3 py-2 rounded-lg border border-white/[0.08] hover:border-white/15 bg-white/[0.02]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="bg-black rounded-2xl p-8 text-center border border-white/[0.07] animate-fadeIn">
          <svg className="w-12 h-12 mx-auto text-emerald-400/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-white/70 font-medium">All clear</p>
          <p className="text-white/40 text-sm mt-1">No active threats for this project right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <header>
          <p className="text-[10px] font-semibold text-[#00E5FF]/80 tracking-[0.18em] uppercase">Alerts</p>
          <h3 className="text-lg lg:text-xl font-semibold text-white mt-1 tracking-tight flex flex-wrap items-center gap-2 font-sans">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 border border-red-500/25">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            Threats & alerts
            <span className="px-2.5 py-1 text-xs font-medium bg-red-500/15 text-red-300 rounded-lg border border-red-500/25">
              {alerts.length} new
            </span>
          </h3>
        </header>
        <button
          type="button"
          onClick={handleRefresh}
          className="shrink-0 self-start text-white/50 hover:text-white text-xs flex items-center gap-1.5 transition-colors px-3 py-2 rounded-lg border border-white/[0.08] hover:border-white/15 bg-white/[0.02] font-sans"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="relative">
        <div className="max-h-[420px] overflow-y-auto pr-1 scrollbar-custom custom-touch-scroll">
          <div className="grid grid-cols-1 gap-3 lg:gap-4 pb-2">
            {alerts.map((alert, index) => (
              <div
                key={alert.id}
                className={`p-4 lg:p-5 rounded-2xl border ${getSeverityColor(alert.severity)} bg-black flex flex-col sm:flex-row items-start gap-3 lg:gap-4 transition-all hover:border-white/20 cursor-pointer relative overflow-hidden animate-slideUp`}
                style={{ 
                  animationDelay: `${index * 70}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className="flex-shrink-0">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`font-semibold text-sm lg:text-base capitalize font-sans ${alert.severity === 'critical' ? 'text-red-400' : alert.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'}`}>
                      {alert.severity} Risk
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 font-sans">
                      {alert.source}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm lg:text-base font-sans leading-relaxed">{alert.message}</p>
                  <div className="flex flex-wrap items-center gap-3 lg:gap-4 mt-3 text-xs lg:text-sm font-sans">
                    <button className="flex items-center gap-1.5 hover:text-white transition-colors text-white/60 bg-white/5 px-2.5 py-1 rounded-lg">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-5m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Review</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-white transition-colors text-white/60 bg-white/5 px-2.5 py-1 rounded-lg">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Watch</span>
                    </button>
                  </div>
                </div>
                <span className="text-white/40 text-[10px] sm:text-xs sm:ml-auto font-sans bg-white/5 px-2 py-1 rounded-md">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade effect to indicate more content */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#090b0e] to-transparent pointer-events-none rounded-b-2xl z-10" />
      </div>

      <style jsx>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: rgba(0, 229, 255, 0.2);
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 229, 255, 0.4);
        }
        .custom-touch-scroll {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 229, 255, 0.2) transparent;
        }
      `}</style>
    </div>
  );
};

export default AlertsSection;
