import { useState, useEffect } from 'react';

// Generate random threat feeds - Tactical sources
const generateRandomFeeds = (projectId = null) => {
  const possibleThreats = [
    { source: "DARK WEB MONITOR", threat: "New credential dump detected affecting 50K+ users", severity: "critical", time: "JUST NOW" },
    { source: "VIRUSTOTAL", threat: "New malware variant identified in the wild", severity: "high", time: "2 MIN AGO" },
    { source: "SHODAN", threat: "Exposed database found with sensitive information", severity: "high", time: "5 MIN AGO" },
    { source: "ALIENVAULT OTX", threat: "New phishing campaign targeting financial institutions", severity: "medium", time: "12 MIN AGO" },
    { source: "GREYNOISE", threat: "Massive scanning activity detected from new IP range", severity: "medium", time: "18 MIN AGO" },
    { source: "HAVEIBEENPWNED", threat: "New data breach added - 10M records compromised", severity: "critical", time: "25 MIN AGO" },
    { source: "CENSYS", threat: "New SSL certificate anomaly detected", severity: "low", time: "30 MIN AGO" },
    { source: "URLSCAN", threat: "New phishing domain registered impersonating brand", severity: "high", time: "45 MIN AGO" },
    { source: "CISA", threat: "New vulnerability advisory released for critical systems", severity: "critical", time: "1 HOUR AGO" },
    { source: "MITRE ATT&CK", threat: "New attack technique observed in the wild", severity: "medium", time: "2 HOURS AGO" },
    { source: "RISKIQ", threat: "Suspicious domain infrastructure identified", severity: "high", time: "3 HOURS AGO" },
    { source: "RECORDED FUTURE", threat: "Ransomware group targeting new industries", severity: "critical", time: "4 HOURS AGO" },
    { source: "CROWDSTRIKE", threat: "New adversary activity observed in sector", severity: "high", time: "5 HOURS AGO" },
    { source: "MANDIANT", threat: "APT group shifting tactics and techniques", severity: "medium", time: "6 HOURS AGO" },
    { source: "UNIT42", threat: "New backdoor malware discovered in software", severity: "high", time: "8 HOURS AGO" }
  ];
  
  const numFeeds = Math.floor(Math.random() * 3) + 3;
  const shuffled = [...possibleThreats].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numFeeds).map((feed, index) => ({
    id: `${Date.now()}_${projectId || 'default'}_${index}`,
    ...feed
  }));
};

const ThreatFeed = ({ feeds = [], selectedProjectId }) => {
  const [threatFeeds, setThreatFeeds] = useState([]);

  useEffect(() => {
    console.log('Project changed, generating new threat feeds for project:', selectedProjectId);
    const newFeeds = generateRandomFeeds(selectedProjectId);
    setThreatFeeds(newFeeds);
  }, [selectedProjectId]);

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
      case "critical": return "bg-[#f87171]";
      case "high": return "bg-[#fbbf24]";
      case "medium": return "bg-[#00ff88]";
      case "low": return "bg-[#22d3ee]";
      default: return "bg-[#00ff88]";
    }
  };

  const getSeverityTextColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case "critical": return "text-[#f87171]";
      case "high": return "text-[#fbbf24]";
      case "medium": return "text-[#00ff88]";
      case "low": return "text-[#22d3ee]";
      default: return "text-[#00ff88]";
    }
  };

  const handleRefresh = () => {
    const newFeeds = generateRandomFeeds(selectedProjectId);
    setThreatFeeds(newFeeds);
  };

  return (
    <div className="bg-[#090c0e] border border-white/10 p-5 flex flex-col h-full relative">
      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#00ff88]/30" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#00ff88]/30" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#00ff88]/30" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#00ff88]/30" />
      
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-mono text-[11px] font-bold text-white uppercase tracking-[0.08em] flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          THREAT INTELLIGENCE
        </h4>
        <button onClick={handleRefresh} className="text-white/40 hover:text-[#00ff88] transition-colors" title="Refresh feed">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-2 min-h-[200px]">
        {threatFeeds.length > 0 ? (
          threatFeeds.map((feed) => (
            <div key={feed.id} className="flex items-start gap-2 p-2 border border-white/5 hover:border-[#00ff88]/20 transition-all group">
              <div className={`w-1.5 h-1.5 mt-1.5 flex-shrink-0 animate-pulse ${getSeverityColor(feed.severity)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-white text-[9px] font-mono font-bold uppercase tracking-[0.08em] group-hover:text-[#00ff88] transition-colors">
                    {feed.source}
                  </span>
                  <span className={`text-[7px] font-mono uppercase tracking-[0.08em] ${getSeverityTextColor(feed.severity)}`}>
                    {feed.severity}
                  </span>
                  <span className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">• {feed.time}</span>
                </div>
                <p className="text-white/50 text-[8px] font-mono leading-relaxed group-hover:text-white/70 transition-colors">
                  {feed.threat}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <div className="w-12 h-12 mb-3 border border-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white/40 text-[9px] font-mono uppercase tracking-[0.08em]">NO THREAT DATA</p>
            <p className="text-white/20 text-[7px] font-mono uppercase tracking-[0.08em] mt-1">FEED WILL APPEAR HERE</p>
          </div>
        )}
      </div>

      {threatFeeds.length > 0 && (
        <button className="w-full mt-4 p-2 border border-white/10 text-white/40 hover:text-[#00ff88] hover:border-[#00ff88]/30 text-[9px] font-mono uppercase tracking-[0.08em] transition-all">
          VIEW FULL FEED
        </button>
      )}
    </div>
  );
};

export default ThreatFeed;