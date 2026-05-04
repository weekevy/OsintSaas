import { useState } from 'react';
import {
  AnalyticsOverview,
  ThreatTrends,
  PerformanceMetrics
} from '../analytics';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  const timeRanges = [
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'threats', label: 'Threats' },
    { id: 'performance', label: 'Performance' }
  ];

  return (
    <div className="min-h-screen font-['Poppins'] text-white bg-black">
      <div className="relative z-[1] max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 pb-12 md:pb-10">
        
        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 md:p-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h1 className="font-['Poppins'] text-3xl md:text-4xl font-bold text-white">
                  Analytics
                </h1>
              </div>
              <p className="text-base font-['Poppins'] text-white/40 ml-[4.5rem]">
                Insights and metrics about your OSINT operations
              </p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={`px-5 py-2 rounded-lg text-sm font-['Poppins'] font-semibold transition-colors duration-150
                    ${timeRange === range.id 
                      ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30' 
                      : 'text-white/40 hover:text-white'
                    }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mb-8">
          <AnalyticsOverview timeRange={timeRange} />
        </div>

        {/* Tabs */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-1 mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none px-8 py-3 text-sm md:text-base font-['Poppins'] font-bold rounded-lg transition-colors duration-150 whitespace-nowrap
                  ${activeTab === tab.id 
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
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <ThreatTrends timeRange={timeRange} />
            </div>
          )}

          {activeTab === 'threats' && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <ThreatTrends timeRange={timeRange} detailed />
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <PerformanceMetrics timeRange={timeRange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;