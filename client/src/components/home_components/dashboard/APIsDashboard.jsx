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
    <div className="min-h-screen font-['Poppins'] text-white bg-black">
      <div className="relative z-[1] max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 pb-12 md:pb-10">
        
        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 md:p-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="font-['Poppins'] text-2xl md:text-3xl font-bold text-white">
                  API Management
                </h1>
              </div>
              <p className="text-sm font-['Poppins'] text-white/40 ml-16">
                Monitor and manage your API usage, keys, and documentation
              </p>
            </div>
            
            <button className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 text-white/60 hover:text-[#00E5FF] transition-colors duration-150 text-sm font-['Poppins']">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Generate New Key
            </button>
          </div>
        </div>

        {/* API Stats */}
        <div className="mb-6">
          <APIUsageStats stats={usageStats} />
        </div>

        {/* Tabs */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-1 mb-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-['Poppins'] font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap ${
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
              <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-5 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
                  <h3 className="text-white font-['Poppins'] text-base font-bold">API Health</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {healthStats.map((stat, idx) => (
                    <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                      <div className={`text-2xl md:text-3xl font-bold font-['Poppins'] mb-1`} style={{ color: stat.color }}>
                        {stat.value}
                      </div>
                      <div className="text-white/40 text-[10px] md:text-[11px] font-['Poppins'] font-semibold">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Endpoints */}
              <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
                    <h3 className="text-white font-['Poppins'] text-base font-bold">Recent Endpoints</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('endpoints')}
                    className="text-[#00E5FF] hover:text-[#2DD4BF] transition-colors duration-150 text-xs font-['Poppins']"
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
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
                <h3 className="text-white font-['Poppins'] text-base font-bold">All Endpoints</h3>
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
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <APITokens />
            </div>
          )}

          {/* Limits Tab */}
          {activeTab === 'limits' && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <RateLimits />
            </div>
          )}

          {/* Docs Tab */}
          {activeTab === 'docs' && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <APIDocumentation />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default APIsDashboard;