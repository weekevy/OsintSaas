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
    <div className="min-h-screen font-sans text-white bg-black">
      <div className="relative z-[1] max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 pb-12 md:pb-10 animate-slide-up">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 lg:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 lg:h-8 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
              <h1 className="text-2xl md:text-[32px] font-bold text-white tracking-tight">Analytics</h1>
            </div>
            <p className="text-white/40 text-[10px] lg:text-sm font-medium tracking-wide">Insights and metrics about your OSINT operations.</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-1 p-1 rounded-2xl bg-black border border-white/5">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap border ${
                  timeRange === range.id 
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30' 
                    : 'text-white/30 border-transparent hover:text-white/60'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </header>

        {/* Overview Cards */}
        <div className="mb-8">
          <AnalyticsOverview timeRange={timeRange} />
        </div>

        {/* Tabs */}
        <div className="rounded-xl border border-white/10 bg-black p-1 mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none px-8 py-3 text-sm md:text-base font-sans font-bold rounded-lg transition-colors duration-150 whitespace-nowrap
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
            <div className="rounded-2xl border border-white/10 bg-black p-6">
              <ThreatTrends timeRange={timeRange} />
            </div>
          )}

          {activeTab === 'threats' && (
            <div className="rounded-2xl border border-white/10 bg-black p-6">
              <ThreatTrends timeRange={timeRange} detailed />
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="rounded-2xl border border-white/10 bg-black p-6">
              <PerformanceMetrics timeRange={timeRange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;