const APIEndpoint = ({ endpoint, detailed = false }) => {
  const getMethodColor = (method) => {
    switch(method) {
      case 'GET': return 'border-[#2DD4BF]/30 text-[#2DD4BF]';
      case 'POST': return 'border-[#00E5FF]/30 text-[#00E5FF]';
      case 'PUT': return 'border-[#fbbf24]/30 text-[#fbbf24]';
      case 'DELETE': return 'border-red-500/30 text-red-500';
      default: return 'border-white/20 text-white/40';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'stable': return 'text-[#2DD4BF]';
      case 'degraded': return 'text-[#fbbf24]';
      case 'down': return 'text-red-500';
      default: return 'text-white/40';
    }
  };

  if (!detailed) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-150 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-2 py-1 rounded text-[10px] font-['Poppins'] font-bold border ${getMethodColor(endpoint.method)}`}>
              {endpoint.method}
            </span>
            <code className="text-white text-xs font-mono">{endpoint.path}</code>
            <p className="text-white/40 text-[11px]">{endpoint.description}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-white text-xs font-['Poppins'] font-semibold">{endpoint.calls}</div>
              <div className="text-white/30 text-[8px]">Calls</div>
            </div>
            <div className="text-right">
              <div className="text-white text-xs font-['Poppins'] font-semibold">{endpoint.avgResponse}</div>
              <div className="text-white/30 text-[8px]">Response</div>
            </div>
            <span className={`text-[9px] font-['Poppins'] font-semibold ${getStatusColor(endpoint.status)}`}>
              ● {endpoint.status}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <span className={`px-2 py-1 rounded text-[10px] font-['Poppins'] font-bold border ${getMethodColor(endpoint.method)}`}>
            {endpoint.method}
          </span>
          <div>
            <code className="text-white text-xs font-mono">{endpoint.path}</code>
            <p className="text-white/40 text-[11px] mt-0.5">{endpoint.description}</p>
          </div>
        </div>
        <span className={`text-[10px] font-['Poppins'] font-semibold ${getStatusColor(endpoint.status)}`}>
          ● {endpoint.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
          <div className="text-white/40 text-[9px] mb-0.5">TOTAL CALLS</div>
          <div className="text-xl font-bold text-white">{endpoint.calls}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
          <div className="text-white/40 text-[9px] mb-0.5">AVG RESPONSE</div>
          <div className="text-xl font-bold text-white">{endpoint.avgResponse}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
          <div className="text-white/40 text-[9px] mb-0.5">ERROR RATE</div>
          <div className="text-xl font-bold text-[#00E5FF]">0.01%</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-white font-['Poppins'] text-[11px] font-bold mb-2">Request Parameters</h4>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="text-white/40 font-semibold">Parameter</div>
              <div className="text-white/40 font-semibold">Type</div>
              <div className="text-white/40 font-semibold">Description</div>
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
          <h4 className="text-white font-['Poppins'] text-[11px] font-bold mb-2">Example Response</h4>
          <pre className="rounded-lg border border-white/10 bg-black/30 p-3 text-white/50 text-[10px] font-mono overflow-x-auto">
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