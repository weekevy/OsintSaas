import { useState } from 'react';

const APIEndpoint = ({ endpoint, detailed = false }) => {
  const [showDocs, setShowDocs] = useState(false);

  const getMethodColor = (method) => {
    switch(method) {
      case 'GET': return 'text-[#2DD4BF] bg-[#2DD4BF]/10 border-[#2DD4BF]/20';
      case 'POST': return 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/20';
      case 'PUT': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'DELETE': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden group hover:border-white/10 transition-all duration-300">
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className={`px-3 py-1 rounded-xl text-[10px] font-black border uppercase tracking-widest ${getMethodColor(endpoint.method)}`}>
            {endpoint.method}
          </span>
          <div className="min-w-0">
            <h4 className="text-white font-mono text-xs font-bold tracking-tight truncate group-hover:text-[#00E5FF] transition-colors">
              {endpoint.path}
            </h4>
            <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mt-1 truncate">
              {endpoint.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {detailed && (
            <div className="hidden md:flex items-center gap-8">
              <div className="text-right">
                <div className="text-white/10 text-[8px] font-black uppercase tracking-widest mb-0.5">Throughput</div>
                <div className="text-white text-xs font-bold">{endpoint.calls}</div>
              </div>
              <div className="text-right">
                <div className="text-white/10 text-[8px] font-black uppercase tracking-widest mb-0.5">Latency</div>
                <div className="text-[#2DD4BF] text-xs font-bold">{endpoint.avgResponse}</div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowDocs(!showDocs)}
            className={`p-2 rounded-xl transition-all duration-300 ${showDocs ? 'bg-[#00E5FF] text-black' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${showDocs ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {showDocs && (
        <div className="p-6 border-t border-white/5 bg-black/40 animate-slide-up">
          <div className="space-y-6">
            <div>
              <h5 className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest mb-3">Authentication Protocol</h5>
              <div className="p-4 rounded-2xl bg-black border border-white/5 font-mono text-[10px] text-white/60">
                Headers: {"{"} "X-API-Key": "YOUR_INTERFACE_NODE_TOKEN" {"}"}
              </div>
            </div>
            
            <div>
              <h5 className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest mb-3">Request Payload</h5>
              <div className="p-4 rounded-2xl bg-black border border-white/5 font-mono text-[10px] text-[#2DD4BF]">
                {endpoint.method === 'POST' ? '{\n  "target": "example.com",\n  "mode": "automated",\n  "priority": 1\n}' : 'N/A'}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] pt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] shadow-[0_0_8px_#2DD4BF]" />
              End-to-End Encryption Active
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIEndpoint;