import { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
  AnalyticsOverview,
  ThreatTrends
} from '../analytics';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const timeRanges = [
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'threats', label: 'Threats' },
    { id: 'investigators', label: 'Investigators' }
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/dashboard/analytics?timeRange=${timeRange}`);
      if (response.data.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

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

        {loading ? (
          <div className="py-32 text-center opacity-40">
            <div className="w-12 h-12 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin mx-auto mb-6" />
            <p className="text-xs font-black uppercase tracking-[0.4em]">Aggregating Intelligence...</p>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="mb-8">
              <AnalyticsOverview stats={data?.stats} />
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
                  <ThreatTrends 
                    trends={data?.trends} 
                    threatTypes={data?.threatTypes}
                  />
                </div>
              )}

              {activeTab === 'threats' && (
                <div className="rounded-2xl border border-white/10 bg-black p-6">
                  <ThreatTrends 
                    trends={data?.trends} 
                    threatTypes={data?.threatTypes}
                    topIOCs={data?.topIOCs}
                    detailed 
                  />
                </div>
              )}

              {activeTab === 'investigators' && (
                <div className="rounded-2xl border border-white/10 bg-black p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-sans text-sm font-bold">Top Investigators</h3>
                      <p className="text-white/30 text-[10px] mt-0.5">Most active operators in your network</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data?.topInvestigators?.map((user, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 flex items-center justify-center">
                              <span className="text-[#00E5FF] font-bold text-xs">{user.name.slice(0, 2).toUpperCase()}</span>
                            </div>
                            <div>
                              <div className="text-white text-xs font-bold uppercase tracking-tight">{user.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-white/30 text-[9px] uppercase font-semibold">{user.scans} Scans</span>
                                <span className="text-[#f87171] text-[9px] uppercase font-semibold">{user.threats} Threats</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-[#00E5FF] font-black text-sm">#{i + 1}</div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <h3 className="text-white font-sans text-sm font-bold mb-4">Activity Heatmap (Last 24h)</h3>
                      <div className="flex items-end gap-1 h-24">
                        {Array.from({ length: 24 }).map((_, hour) => {
                          const hourData = data?.heatmap?.find(h => h.hour === hour);
                          const count = hourData ? hourData.count : 0;
                          const height = Math.min(100, (count / (Math.max(...(data?.heatmap?.map(h => h.count) || [1]))) * 100));
                          return (
                            <div key={hour} className="flex-1 group relative">
                              <div 
                                className="w-full bg-[#00E5FF]/20 group-hover:bg-[#00E5FF]/40 transition-all duration-300 rounded-t-sm"
                                style={{ height: `${Math.max(4, height)}%` }}
                              />
                              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-white/20 font-bold hidden group-hover:block whitespace-nowrap">
                                {hour}:00 ({count})
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-2 text-[8px] text-white/20 font-black uppercase tracking-[0.2em]">
                        <span>00:00</span>
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>23:59</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;