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
    if (selectedProjectId) {
      console.log('Project changed, generating new threat feeds for project:', selectedProjectId);
      const newFeeds = generateRandomFeeds(selectedProjectId);
      setThreatFeeds(newFeeds);
    }
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
      case "medium": return "bg-[#00E5FF]";
      case "low": return "bg-[#22d3ee]";
      default: return "bg-[#00E5FF]";
    }
  };

  const getSeverityTextColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case "critical": return "text-[#f87171]";
      case "high": return "text-[#fbbf24]";
      case "medium": return "text-[#00E5FF]";
      case "low": return "text-[#22d3ee]";
      default: return "text-[#00E5FF]";
    }
  };

  const handleRefresh = () => {
    const newFeeds = generateRandomFeeds(selectedProjectId);
    setThreatFeeds(newFeeds);
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col h-full relative border border-white/[0.07]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold text-[#00E5FF]/80 tracking-[0.18em] uppercase">Signals</p>
          <h4 className="font-sans text-sm font-semibold text-white mt-1 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Threat intelligence
          </h4>
        </div>
        <button type="button" onClick={handleRefresh} className="text-white/40 hover:text-[#00E5FF] transition-colors p-1 rounded-lg hover:bg-white/[0.05]" title="Refresh feed">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-2 min-h-[200px]">
        {threatFeeds.length > 0 ? (
          threatFeeds.map((feed) => (
            <div key={feed.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#00E5FF]/20 transition-colors group">
              <div className={`w-2 h-2 mt-1 rounded-full flex-shrink-0 ${getSeverityColor(feed.severity)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-white text-xs font-semibold group-hover:text-[#00E5FF] transition-colors">
                    {feed.source}
                  </span>
                  <span className={`text-[10px] font-medium uppercase tracking-wide ${getSeverityTextColor(feed.severity)}`}>
                    {feed.severity}
                  </span>
                  <span className="text-white/35 text-[11px]">· {feed.time}</span>
                </div>
                <p className="text-white/55 text-sm leading-snug group-hover:text-white/75 transition-colors">
                  {feed.threat}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-center rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="w-12 h-12 mb-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white/50 text-sm font-medium">No threat data</p>
            <p className="text-white/35 text-xs mt-1">The feed will populate as signals arrive.</p>
          </div>
        )}
      </div>

      {threatFeeds.length > 0 && (
        <button type="button" className="w-full mt-4 p-2.5 rounded-xl border border-white/[0.12] text-white/70 hover:text-[#00E5FF] hover:border-[#00E5FF]/35 hover:bg-[#00E5FF]/5 text-xs font-medium transition-all">
          View full feed
        </button>
      )}
    </div>
  );
};

export default ThreatFeed;