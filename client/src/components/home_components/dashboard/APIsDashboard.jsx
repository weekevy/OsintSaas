import { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
  APIEndpoint,
  APIUsageStats,
  APIDocumentation,
  APITokens
} from '../apis';

const APIsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalCalls: '0',
    activeKeys: 0,
    errorRate: '0.00%',
    avgLatency: '0ms',
    uptime: '100%'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/user/api-stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch API stats:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const healthStats = [
    { label: 'Uptime (30D)', value: stats.uptime, color: '#2DD4BF' },
    { label: 'Avg Response', value: stats.avgLatency, color: 'white' },
    { label: 'Total Calls', value: stats.totalCalls, color: 'white' },
    { label: 'Active Keys', value: stats.activeKeys, color: '#fbbf24' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'endpoints', label: 'Endpoints' },
    { id: 'tokens', label: 'Tokens' },
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
              <h1 className="text-2xl md:text-[32px] font-bold text-white tracking-tight uppercase">API Management</h1>
            </div>
            <p className="text-white/40 text-[10px] lg:text-sm font-medium tracking-wide">Monitor and manage your programmatic reconnaissance interfaces.</p>
          </div>
          
          <button 
            onClick={() => setActiveTab('tokens')}
            className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-xl bg-white/[0.03] text-white/60 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/30 transition-all duration-300 text-[10px] sm:text-[11px] uppercase tracking-widest font-black active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Generate Interface Node
          </button>
        </header>

        {/* API Stats */}
        <div className="mb-6">
          <APIUsageStats stats={stats} />
        </div>

        {/* Tabs */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-1 mb-6 backdrop-blur-md">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.2)]' 
                    : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="mt-6">
          {loading ? (
            <div className="py-32 text-center opacity-40">
              <div className="w-12 h-12 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin mx-auto mb-6" />
              <p className="text-xs font-black uppercase tracking-[0.4em]">Establishing Uplink...</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* API Health Stats */}
                  <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-1.5 h-6 bg-[#00E5FF] rounded-full shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
                      <h3 className="text-white font-bold text-base uppercase tracking-tight">Node Health Matrix</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {healthStats.map((stat, idx) => (
                        <div key={idx} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 group hover:border-white/10 transition-all duration-300">
                          <div className={`text-2xl md:text-3xl font-black mb-2 transition-transform group-hover:scale-110`} style={{ color: stat.color }}>
                            {stat.value}
                          </div>
                          <div className="text-white/20 text-[9px] font-black uppercase tracking-widest">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Endpoints */}
                  <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#2DD4BF] rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                        <h3 className="text-white font-bold text-base uppercase tracking-tight">Active Endpoints</h3>
                      </div>
                      <button 
                        onClick={() => setActiveTab('endpoints')}
                        className="text-[10px] font-bold text-[#00E5FF] hover:underline uppercase tracking-widest"
                      >
                        View Protocol Map →
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {endpoints.slice(0, 2).map((endpoint) => (
                        <APIEndpoint key={endpoint.id} endpoint={endpoint} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Endpoints Tab */}
              {activeTab === 'endpoints' && (
                <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-6 bg-[#00E5FF] rounded-full shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
                    <h3 className="text-white font-bold text-base uppercase tracking-tight">Protocol Endpoint Directory</h3>
                  </div>
                  <div className="space-y-4">
                    {endpoints.map((endpoint) => (
                      <APIEndpoint key={endpoint.id} endpoint={endpoint} detailed />
                    ))}
                  </div>
                </div>
              )}

              {/* Tokens Tab */}
              {activeTab === 'tokens' && (
                <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-8">
                  <APITokens />
                </div>
              )}

              {/* Docs Tab */}
              {activeTab === 'docs' && (
                <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-8">
                  <APIDocumentation />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default APIsDashboard;