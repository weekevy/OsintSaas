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

  const healthStats = [
    { label: 'Uptime (30D)', value: '99.97%', color: '#2DD4BF' },
    { label: 'Avg Response', value: '187ms', color: 'white' },
    { label: 'Total Calls', value: '4.2M', color: 'white' },
    { label: 'Active Keys', value: '156', color: '#fbbf24' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'endpoints', label: 'Endpoints' },
    { id: 'tokens', label: 'Tokens' },
    { id: 'limits', label: 'Limits' },
    { id: 'docs', label: 'Docs' }
  ];

  return (
    <div className="min-h-screen font-sans text-white bg-black">
      <div className="relative z-[1] max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 pb-12 md:pb-10 animate-slide-up">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 lg:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 lg:h-8 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
              <h1 className="text-2xl md:text-[32px] font-bold text-white tracking-tight">API Management</h1>
            </div>
            <p className="text-white/40 text-[10px] lg:text-sm font-medium tracking-wide">Monitor and manage your API usage, keys, and documentation.</p>
          </div>
          
          <button className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-xl bg-[#00E5FF] text-black hover:brightness-110 transition-all duration-150 text-[10px] sm:text-[11px] uppercase tracking-widest font-bold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Generate New Key
          </button>
        </header>

        {/* API Stats */}
        <div className="mb-6">
          <APIUsageStats stats={usageStats} />
        </div>

        {/* Tabs */}
        <div className="rounded-xl border border-white/10 bg-black p-1 mb-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-sans font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* API Health Stats */}
              <div className="rounded-2xl border border-white/10 bg-black p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-5 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
                  <h3 className="text-white font-sans text-base font-bold">API Health</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {healthStats.map((stat, idx) => (
                    <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                      <div className={`text-2xl md:text-3xl font-bold font-sans mb-1`} style={{ color: stat.color }}>
                        {stat.value}
                      </div>
                      <div className="text-white/40 text-[10px] md:text-[11px] font-sans font-semibold">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Endpoints */}
              <div className="rounded-2xl border border-white/10 bg-black p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
                    <h3 className="text-white font-sans text-base font-bold">Recent Endpoints</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('endpoints')}
                    className="text-[#00E5FF] hover:text-[#2DD4BF] transition-colors duration-150 text-xs font-sans"
                  >
                    View All →
                  </button>
                </div>
                
                <div className="space-y-3">
                  {endpoints.slice(0, 2).map((endpoint) => (
                    <APIEndpoint key={endpoint.id} endpoint={endpoint} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Endpoints Tab */}
          {activeTab === 'endpoints' && (
            <div className="rounded-2xl border border-white/10 bg-black p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
                <h3 className="text-white font-sans text-base font-bold">All Endpoints</h3>
              </div>
              <div className="space-y-3">
                {endpoints.map((endpoint) => (
                  <APIEndpoint key={endpoint.id} endpoint={endpoint} detailed />
                ))}
              </div>
            </div>
          )}

          {/* Tokens Tab */}
          {activeTab === 'tokens' && (
            <div className="rounded-2xl border border-white/10 bg-black p-6">
              <APITokens />
            </div>
          )}

          {/* Limits Tab */}
          {activeTab === 'limits' && (
            <div className="rounded-2xl border border-white/10 bg-black p-6">
              <RateLimits />
            </div>
          )}

          {/* Docs Tab */}
          {activeTab === 'docs' && (
            <div className="rounded-2xl border border-white/10 bg-black p-6">
              <APIDocumentation />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default APIsDashboard;