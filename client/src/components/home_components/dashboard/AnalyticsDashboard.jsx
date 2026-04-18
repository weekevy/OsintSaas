import { useState } from 'react';
import {
  AnalyticsOverview,
  ThreatTrends,
  UserActivity,
  PerformanceMetrics,
  CustomReports
} from '../analytics';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-5 bg-[#080b0d]">
      
      {/* Header - Tactical */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-white uppercase tracking-[-0.02em] flex items-center gap-3">
            <svg className="w-6 h-6 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            ANALYTICS
          </h1>
          <p className="text-[9px] font-mono text-white/40 uppercase tracking-[0.12em] mt-1">
            INSIGHTS AND METRICS ABOUT YOUR OSINT OPERATIONS
          </p>
        </div>
        
        {/* Time Range Selector - Tactical */}
        <div className="flex gap-1 border border-white/10 p-0.5">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-[8px] font-mono uppercase tracking-[0.08em] transition-all
                ${timeRange === range 
                  ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30' 
                  : 'text-white/40 hover:text-white'
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <AnalyticsOverview timeRange={timeRange} />

      {/* Tabs - Tactical */}
      <div className="flex gap-1 border-b border-white/10 mt-4">
        {['overview', 'threats', 'activity', 'performance', 'custom'].map((tab) => (
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ThreatTrends timeRange={timeRange} />
            <UserActivity timeRange={timeRange} />
          </div>
        )}

        {activeTab === 'threats' && (
          <ThreatTrends timeRange={timeRange} detailed />
        )}

        {activeTab === 'activity' && (
          <UserActivity timeRange={timeRange} detailed />
        )}

        {activeTab === 'performance' && (
          <PerformanceMetrics timeRange={timeRange} />
        )}

        {activeTab === 'custom' && (
          <CustomReports />
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;