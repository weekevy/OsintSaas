import { useState } from 'react';

const CustomReports = () => {
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [dateRange, setDateRange] = useState('30d');
  const [reportName, setReportName] = useState('');
  const [savedReports, setSavedReports] = useState([
    {
      id: 1,
      name: 'Weekly Threat Summary',
      metrics: ['threats', 'iocs', 'severity'],
      lastRun: '2024-03-18',
      schedule: 'Every Monday'
    },
    {
      id: 2,
      name: 'API Performance Report',
      metrics: ['response_time', 'error_rate', 'requests'],
      lastRun: '2024-03-19',
      schedule: 'Daily'
    }
  ]);

  const availableMetrics = [
    {
      category: 'Threat Intelligence',
      items: [
        { id: 'threats', name: 'Total Threats', icon: '🛡️' },
        { id: 'iocs', name: 'Indicators of Compromise', icon: '🔍' },
        { id: 'severity', name: 'Threat Severity Distribution', icon: '📊' },
        { id: 'types', name: 'Threat Types', icon: '🔬' },
        { id: 'sources', name: 'Threat Sources', icon: '🌐' }
      ]
    },
    {
      category: 'Performance',
      items: [
        { id: 'response_time', name: 'API Response Time', icon: '⚡' },
        { id: 'error_rate', name: 'Error Rate', icon: '⚠️' },
        { id: 'requests', name: 'Request Volume', icon: '📈' },
        { id: 'uptime', name: 'System Uptime', icon: '✅' },
        { id: 'queue', name: 'Queue Length', icon: '⏳' }
      ]
    },
    {
      category: 'User Activity',
      items: [
        { id: 'active_users', name: 'Active Users', icon: '👥' },
        { id: 'searches', name: 'Searches Performed', icon: '🔎' },
        { id: 'reports', name: 'Reports Generated', icon: '📄' },
        { id: 'sessions', name: 'Session Duration', icon: '⏱️' }
      ]
    },
    {
      category: 'Compliance',
      items: [
        { id: 'audit_log', name: 'Audit Log Summary', icon: '📋' },
        { id: 'data_retention', name: 'Data Retention', icon: '🗄️' },
        { id: 'access_logs', name: 'Access Logs', icon: '🔐' }
      ]
    }
  ];

  const toggleMetric = (metricId) => {
    if (selectedMetrics.includes(metricId)) {
      setSelectedMetrics(selectedMetrics.filter(id => id !== metricId));
    } else {
      setSelectedMetrics([...selectedMetrics, metricId]);
    }
  };

  const saveReport = () => {
    if (!reportName || selectedMetrics.length === 0) return;
    
    setSavedReports([
      ...savedReports,
      {
        id: savedReports.length + 1,
        name: reportName,
        metrics: selectedMetrics,
        lastRun: 'Not yet',
        schedule: 'Manual'
      }
    ]);
    
    setReportName('');
    setSelectedMetrics([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Report Builder */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-card border border-white/10 p-6 relative">
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00E5FF]/30" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">CUSTOM REPORT BUILDER</h3>
          
          {/* Report Name */}
          <div className="mb-6">
            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">
              REPORT NAME
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm font-sans focus:outline-none focus:border-[#00E5FF]/50 uppercase tracking-wider"
              placeholder="E.G., EXECUTIVE SECURITY SUMMARY"
            />
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">
              DATE RANGE
            </label>
            <div className="flex flex-wrap gap-2">
              {['24H', '7D', '30D', '90D', '12M'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range.toLowerCase())}
                  className={`px-4 py-2 border transition-all text-[10px] font-bold uppercase tracking-widest
                    ${dateRange === range.toLowerCase()
                      ? 'border-[#00E5FF] bg-[#00E5FF]/5 text-[#00E5FF]'
                      : 'border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-white/30'
                    }`}
                >
                  {range}
                </button>
              ))}
              <button className="px-4 py-2 border border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-white/30 text-[10px] font-bold uppercase tracking-widest">
                CUSTOM
              </button>
            </div>
          </div>

          {/* Metrics Selection */}
          <div className="mb-6">
            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">
              SELECT METRICS
            </label>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
              {availableMetrics.map((category) => (
                <div key={category.category} className="glass-card border border-white/10 p-4">
                  <h4 className="text-white font-bold text-[10px] uppercase tracking-wider mb-3">{category.category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {category.items.map((metric) => (
                      <label
                        key={metric.id}
                        className="flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMetrics.includes(metric.id)}
                          onChange={() => toggleMetric(metric.id)}
                          className="w-4 h-4 rounded-none border-white/20 bg-transparent text-[#00E5FF] focus:ring-0"
                        />
                        <span className="text-xl">{metric.icon}</span>
                        <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{metric.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={saveReport}
              disabled={!reportName || selectedMetrics.length === 0}
              className="flex-1 px-6 py-4 bg-[#00E5FF] text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all disabled:opacity-50"
            >
              SAVE REPORT TEMPLATE
            </button>
            <button
              disabled={selectedMetrics.length === 0}
              className="px-6 py-4 border border-white/10 text-white/40 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50"
            >
              PREVIEW
            </button>
          </div>
        </div>

        {/* Report Preview */}
        {selectedMetrics.length > 0 && (
          <div className="glass-card border border-white/10 p-6 relative">
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00E5FF]/30" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">REPORT PREVIEW</h3>
              <span className="text-white/20 text-[8px] font-bold uppercase tracking-widest">SAMPLE DATA FOR {dateRange.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedMetrics.slice(0, 6).map((metricId) => {
                const metric = availableMetrics
                  .flatMap(c => c.items)
                  .find(m => m.id === metricId);
                
                return (
                  <div key={metricId} className="p-4 border border-white/5 bg-white/[0.02] glass-card">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{metric?.icon || '📊'}</span>
                      <span className="text-white/40 text-[8px] font-bold uppercase tracking-widest">{metric?.name || metricId}</span>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {Math.floor(Math.random() * 1000)}
                    </div>
                    <div className="text-[#00E5FF] text-[8px] font-bold uppercase tracking-wider mt-1">+12% VS PREVIOUS</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Saved Reports */}
      <div className="lg:col-span-1">
        <div className="glass-card border border-white/10 p-6 sticky top-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">SAVED REPORTS</h3>
          
          <div className="space-y-3">
            {savedReports.map((report) => (
              <div
                key={report.id}
                className="p-4 border border-white/10 glass-card hover:border-[#00E5FF]/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-bold text-[10px] uppercase tracking-wider">{report.name}</h4>
                  <span className="text-white/20 text-[8px] font-bold uppercase tracking-widest">{report.schedule.toUpperCase()}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {report.metrics.slice(0, 3).map((metric) => (
                    <span key={metric} className="px-1.5 py-0.5 border border-[#00E5FF]/20 bg-[#00E5FF]/5 text-[#00E5FF] text-[7px] font-bold uppercase tracking-widest">
                      {metric}
                    </span>
                  ))}
                  {report.metrics.length > 3 && (
                    <span className="px-1.5 py-0.5 border border-white/10 text-white/40 text-[7px] font-bold uppercase tracking-widest">
                      +{report.metrics.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest">
                  <span className="text-white/20">LAST RUN: <span className="text-white/40">{report.lastRun.toUpperCase()}</span></span>
                  <button className="text-[#00E5FF] hover:text-white transition-colors">
                    RUN NOW
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 pt-6 text-[#00E5FF] hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 border-t border-white/10 transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            SCHEDULE NEW REPORT
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomReports;
