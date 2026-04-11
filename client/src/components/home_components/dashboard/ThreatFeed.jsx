import { useState, useEffect } from 'react';

// Generate random threat feeds
const generateRandomFeeds = (projectId = null) => {
  const possibleThreats = [
    { source: "Dark Web Monitor", threat: "New credential dump detected affecting 50K+ users", severity: "critical", time: "Just now" },
    { source: "VirusTotal", threat: "New malware variant identified in the wild", severity: "high", time: "2 min ago" },
    { source: "Shodan", threat: "Exposed database found with sensitive information", severity: "high", time: "5 min ago" },
    { source: "AlienVault OTX", threat: "New phishing campaign targeting financial institutions", severity: "medium", time: "12 min ago" },
    { source: "GreyNoise", threat: "Massive scanning activity detected from new IP range", severity: "medium", time: "18 min ago" },
    { source: "HaveIBeenPwned", threat: "New data breach added - 10M records compromised", severity: "critical", time: "25 min ago" },
    { source: "Censys", threat: "New SSL certificate anomaly detected", severity: "low", time: "30 min ago" },
    { source: "URLScan", threat: "New phishing domain registered impersonating brand", severity: "high", time: "45 min ago" },
    { source: "CISA", threat: "New vulnerability advisory released for critical systems", severity: "critical", time: "1 hour ago" },
    { source: "MITRE ATT&CK", threat: "New attack technique observed in the wild", severity: "medium", time: "2 hours ago" },
    { source: "RiskIQ", threat: "Suspicious domain infrastructure identified", severity: "high", time: "3 hours ago" },
    { source: "Recorded Future", threat: "Ransomware group targeting new industries", severity: "critical", time: "4 hours ago" },
    { source: "CrowdStrike", threat: "New adversary activity observed in sector", severity: "high", time: "5 hours ago" },
    { source: "Mandiant", threat: "APT group shifting tactics and techniques", severity: "medium", time: "6 hours ago" },
    { source: "Unit42", threat: "New backdoor malware discovered in software", severity: "high", time: "8 hours ago" }
  ];
  
  // Generate 3-5 random threats
  const numFeeds = Math.floor(Math.random() * 3) + 3;
  const shuffled = [...possibleThreats].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numFeeds).map((feed, index) => ({
    id: `${Date.now()}_${projectId || 'default'}_${index}`,
    ...feed
  }));
};

const ThreatFeed = ({ feeds = [], selectedProjectId }) => {
  const [threatFeeds, setThreatFeeds] = useState([]);

  // Generate new random threats when project changes
  useEffect(() => {
    console.log('Project changed, generating new threat feeds for project:', selectedProjectId);
    const newFeeds = generateRandomFeeds(selectedProjectId);
    setThreatFeeds(newFeeds);
  }, [selectedProjectId]);

  // Initial load
  useEffect(() => {
    if (feeds && feeds.length > 0) {
      setThreatFeeds(feeds);
    } else {
      const newFeeds = generateRandomFeeds();
      setThreatFeeds(newFeeds);
    }
  }, []);

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-purple-500";
    }
  };

  const getSeverityText = (severity) => {
    switch(severity?.toLowerCase()) {
      case "critical": return "text-red-400";
      case "high": return "text-orange-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-blue-400";
      default: return "text-purple-400";
    }
  };

  // Manual refresh button
  const handleRefresh = () => {
    const newFeeds = generateRandomFeeds(selectedProjectId);
    setThreatFeeds(newFeeds);
  };

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Threat Intelligence Feed
        </h4>
        <button 
          onClick={handleRefresh}
          className="text-white/60 hover:text-white text-xs flex items-center gap-1 transition-colors"
          title="Refresh feed"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      
      <div className="space-y-3 lg:space-y-4 min-h-[200px]">
        {threatFeeds.length > 0 ? (
          threatFeeds.map((feed) => (
            <div key={feed.id} className="flex items-start gap-2 lg:gap-3 p-2 lg:p-3 rounded-xl hover:bg-white/5 transition-all group">
              <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 mt-2 rounded-full flex-shrink-0 animate-pulse ${getSeverityColor(feed.severity)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-white font-medium text-sm lg:text-base group-hover:text-purple-400 transition-colors">
                    {feed.source}
                  </span>
                  <span className={`text-xs whitespace-nowrap ${getSeverityText(feed.severity)}`}>
                    {feed.severity}
                  </span>
                  <span className="text-white/40 text-xs whitespace-nowrap">• {feed.time}</span>
                </div>
                <p className="text-white/60 text-xs lg:text-sm group-hover:text-white/80 transition-colors">
                  {feed.threat}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <div className="w-16 h-16 mb-3 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm">No threat intelligence yet</p>
            <p className="text-white/20 text-xs mt-1">Feed will appear here</p>
          </div>
        )}
      </div>

      {threatFeeds.length > 0 && (
        <button className="w-full mt-4 p-2.5 lg:p-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/10 text-sm lg:text-base">
          View Full Feed
        </button>
      )}
    </div>
  );
};

export default ThreatFeed;