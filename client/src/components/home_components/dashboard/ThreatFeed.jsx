const ThreatFeed = ({ feeds = [] }) => {
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

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 p-4 lg:p-6">
      <h4 className="text-base lg:text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Threat Intelligence Feed
      </h4>
      
      <div className="space-y-3 lg:space-y-4 min-h-[200px]">
        {feeds && feeds.length > 0 ? (
          feeds.map((feed, i) => (
            <div key={i} className="flex items-start gap-2 lg:gap-3 p-2 lg:p-3 rounded-xl hover:bg-white/5 transition-all group">
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
                <p className="text-white/60 text-xs lg:text-sm truncate group-hover:text-white/80 transition-colors">
                  {feed.threat}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            {/* Empty state illustration */}
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

      {feeds && feeds.length > 0 && (
        <button className="w-full mt-4 p-2.5 lg:p-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/10 text-sm lg:text-base">
          View Full Feed
        </button>
      )}
    </div>
  );
};

export default ThreatFeed;
