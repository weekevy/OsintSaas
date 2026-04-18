import { useState } from 'react';
import {
  APIEndpoint,
  APIUsageStats,
  APIDocumentation,
  RateLimits,
  APITokens
} from '../apis';

const APIsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const endpoints = [
    {
      id: 1,
      path: '/api/v1/analyze/url',
      method: 'POST',
      description: 'Analyze URL for threats',
      calls: '1.2M',
      avgResponse: '245ms',
      status: 'stable'
    },
    {
      id: 2,
      path: '/api/v1/analyze/email',
      method: 'POST',
      description: 'Analyze email address',
      calls: '890K',
      avgResponse: '189ms',
      status: 'stable'
    },
    {
      id: 3,
      path: '/api/v1/analyze/file',
      method: 'POST',
      description: 'Upload and scan file',
      calls: '456K',
      avgResponse: '1.2s',
      status: 'degraded'
    },
    {
      id: 4,
      path: '/api/v1/reports/{id}',
      method: 'GET',
      description: 'Retrieve analysis report',
      calls: '2.1M',
      avgResponse: '67ms',
      status: 'stable'
    }
  ];

  const usageStats = {
    totalCalls: '4.2M',
    activeKeys: 156,
    errorRate: '0.23%',
    avgLatency: '187ms'
  };

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-5 bg-[#080b0d]">
      
      {/* Header - Tactical */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-white uppercase tracking-[-0.02em] flex items-center gap-3">
            <svg className="w-6 h-6 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            API MANAGEMENT
          </h1>
          <p className="text-[9px] font-mono text-white/40 uppercase tracking-[0.12em] mt-1">
            MONITOR AND MANAGE YOUR API USAGE, KEYS, AND DOCUMENTATION
          </p>
        </div>
        
        <button className="px-4 py-2 border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-[9px] font-mono uppercase tracking-[0.08em] flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          GENERATE NEW KEY
        </button>
      </div>

      {/* API Stats */}
      <APIUsageStats stats={usageStats} />

      {/* Tabs - Tactical */}
      <div className="flex gap-1 border-b border-white/10">
        {['overview', 'endpoints', 'tokens', 'limits', 'docs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[9px] font-mono uppercase tracking-[0.08em] capitalize transition-all whitespace-nowrap
              ${activeTab === tab 
                ? 'text-[#00ff88] border-b-2 border-[#00ff88]' 
                : 'text-white/40 hover:text-white'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-[#090c0e] border border-white/10 p-5 relative">
              <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
              
              <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] mb-4">API HEALTH</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#0d1114] border border-white/10 p-3">
                  <div className="text-xl font-bold text-[#34d399] font-mono">99.97%</div>
                  <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em] mt-1">UPTIME (30D)</div>
                </div>
                <div className="bg-[#0d1114] border border-white/10 p-3">
                  <div className="text-xl font-bold text-white font-mono">187ms</div>
                  <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em] mt-1">AVG RESPONSE</div>
                </div>
                <div className="bg-[#0d1114] border border-white/10 p-3">
                  <div className="text-xl font-bold text-white font-mono">4.2M</div>
                  <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em] mt-1">TOTAL CALLS</div>
                </div>
                <div className="bg-[#0d1114] border border-white/10 p-3">
                  <div className="text-xl font-bold text-[#fbbf24] font-mono">156</div>
                  <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em] mt-1">ACTIVE KEYS</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {endpoints.slice(0, 2).map((endpoint) => (
                <APIEndpoint key={endpoint.id} endpoint={endpoint} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'endpoints' && (
          <div className="space-y-3">
            {endpoints.map((endpoint) => (
              <APIEndpoint key={endpoint.id} endpoint={endpoint} detailed />
            ))}
          </div>
        )}

        {activeTab === 'tokens' && (
          <APITokens />
        )}

        {activeTab === 'limits' && (
          <RateLimits />
        )}

        {activeTab === 'docs' && (
          <APIDocumentation />
        )}
      </div>
    </div>
  );
};

export default APIsDashboard;