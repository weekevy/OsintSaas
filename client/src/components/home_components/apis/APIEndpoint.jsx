const APIEndpoint = ({ endpoint, detailed = false }) => {
  const getMethodColor = (method) => {
    switch(method) {
      case 'GET': return 'border-[#00E5FF]/30 text-[#00E5FF]';
      case 'POST': return 'border-[#00E5FF]/30 text-[#00E5FF]';
      case 'PUT': return 'border-[#00E5FF]/30 text-[#00E5FF]';
      case 'DELETE': return 'border-red-500/30 text-red-500';
      default: return 'border-white/20 text-white/40';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'stable': return 'border-[#00E5FF]/30 text-[#00E5FF]';
      case 'degraded': return 'border-yellow-500/30 text-yellow-500';
      case 'down': return 'border-red-500/30 text-red-500';
      default: return 'border-white/20 text-white/40';
    }
  };

  if (!detailed) {
    return (
      <div className="glass-card border border-white/10 p-3 hover:border-[#00E5FF]/30 transition-all group relative font-sans">
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00E5FF]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 text-[7px] font-mono border ${getMethodColor(endpoint.method)}`}>
              {endpoint.method}
            </span>
            <div>
              <code className="text-white font-mono text-[9px]">{endpoint.path}</code>
              <p className="text-white/40 text-[7px] font-sans uppercase tracking-[0.05em] mt-0.5">{endpoint.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-white text-[8px] font-mono">{endpoint.calls}</div>
              <div className="text-white/30 text-[6px] font-sans uppercase tracking-[0.08em]">CALLS</div>
            </div>
            <div className="text-right">
              <div className="text-white text-[8px] font-mono">{endpoint.avgResponse}</div>
              <div className="text-white/30 text-[6px] font-sans uppercase tracking-[0.08em]">AVG RESPONSE</div>
            </div>
            <span className={`px-1.5 py-0.5 text-[6px] font-sans uppercase tracking-[0.08em] border ${getStatusColor(endpoint.status)}`}>
              {endpoint.status}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card border border-white/10 p-5 relative font-sans">
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00E5FF]/30" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00E5FF]/30" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 text-[8px] font-mono border ${getMethodColor(endpoint.method)}`}>
            {endpoint.method}
          </span>
          <div>
            <code className="text-white font-mono text-[11px]">{endpoint.path}</code>
            <p className="text-white/40 text-[8px] font-sans uppercase tracking-[0.05em] mt-0.5">{endpoint.description}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 text-[7px] font-sans uppercase tracking-[0.08em] border ${getStatusColor(endpoint.status)}`}>
          {endpoint.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass-card border border-white/10 p-2 text-center">
          <div className="text-white/30 text-[6px] font-sans uppercase tracking-[0.08em] mb-0.5">TOTAL CALLS</div>
          <div className="text-base font-bold text-white font-mono">{endpoint.calls}</div>
        </div>
        <div className="glass-card border border-white/10 p-2 text-center">
          <div className="text-white/30 text-[6px] font-sans uppercase tracking-[0.08em] mb-0.5">AVG RESPONSE</div>
          <div className="text-base font-bold text-white font-mono">{endpoint.avgResponse}</div>
        </div>
        <div className="glass-card border border-white/10 p-2 text-center">
          <div className="text-white/30 text-[6px] font-sans uppercase tracking-[0.08em] mb-0.5">ERROR RATE</div>
          <div className="text-base font-bold text-[#00E5FF] font-mono">0.01%</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-white font-sans text-[8px] font-bold uppercase tracking-[0.12em] mb-2">REQUEST PARAMETERS</h4>
          <div className="glass-card border border-white/10 p-3">
            <div className="grid grid-cols-3 gap-2 text-[7px] font-sans uppercase tracking-[0.08em]">
              <div className="text-white/30">PARAMETER</div>
              <div className="text-white/30">TYPE</div>
              <div className="text-white/30">DESCRIPTION</div>
              {endpoint.method === 'POST' && (
                <>
                  <div className="text-[#00E5FF] font-mono">url</div>
                  <div className="text-white/60">string</div>
                  <div className="text-white/50">The URL to analyze</div>
                  <div className="text-[#00E5FF] font-mono">options</div>
                  <div className="text-white/60">object</div>
                  <div className="text-white/50">Additional analysis options</div>
                </>
              )}
              {endpoint.method === 'GET' && (
                <>
                  <div className="text-[#00E5FF] font-mono">id</div>
                  <div className="text-white/60">string</div>
                  <div className="text-white/50">Report ID to retrieve</div>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-sans text-[8px] font-bold uppercase tracking-[0.12em] mb-2">EXAMPLE RESPONSE</h4>
          <pre className="glass-card border border-white/10 p-3 text-white/50 text-[7px] font-mono overflow-x-auto">
            {`{
  "success": true,
  "data": {
    "risk_score": 78,
    "threat_level": "high",
    "indicators": [...],
    "reputation": "malicious"
  },
  "timestamp": "2024-03-19T10:30:00Z"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default APIEndpoint;