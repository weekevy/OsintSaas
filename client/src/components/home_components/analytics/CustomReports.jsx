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

  const getMetricIcon = (iconName, isSelected = false) => {
    const color = isSelected ? '#00E5FF' : '#4B5563';
    const className = "w-5 h-5";
    
    const icons = {
      '🛡️': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3L5 6c0 5.25 2 10 7 11 5-1 7-5.75 7-11l-7-3z" /></svg>,
      '🔍': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
      '📊': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      '🔬': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3L7.5 8.25M9.75 3l-2.25 5.25m2.25-5.25h3.75M7.5 8.25h9.75M7.5 8.25L3 20.25h18L16.5 8.25M14.25 3L16.5 8.25M14.25 3h-3.75" /></svg>,
      '🌐': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM2.5 12H21M5 5l14 14" /></svg>,
      '⚡': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h3l3-6 3 6h3l-4 8 4-8h-3l-3 6-3-6H3z" /></svg>,
      '⚠️': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
      '📈': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
      '✅': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      '⏳': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      '👥': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      '🔎': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 8l2 2-2 2" /></svg>,
      '📄': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
      '⏱️': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      '📋': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      '🗄️': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m8-10a4 4 0 110-8 4 4 0 010 8z" /></svg>,
      '🔐': <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    };
    return icons[iconName] || icons['📊'];
  };

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

  const dateRangeOptions = [
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '12m', label: '12 Months' },
    { id: 'custom', label: 'Custom' }
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

  const getRandomValue = () => Math.floor(Math.random() * 1000);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-['Poppins']">
      {/* Report Builder */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5">
          <h3 className="text-white font-['Poppins'] text-base font-bold mb-5">Custom Report Builder</h3>
          
          {/* Report Name */}
          <div className="mb-5">
            <label className="block text-white/40 text-xs font-['Poppins'] font-semibold mb-2">
              Report Name
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg text-white px-4 py-2.5 text-sm font-['Poppins'] focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
              placeholder="e.g., Executive Security Summary"
            />
          </div>

          {/* Date Range */}
          <div className="mb-5">
            <label className="block text-white/40 text-xs font-['Poppins'] font-semibold mb-2">
              Date Range
            </label>
            <div className="flex flex-wrap gap-2">
              {dateRangeOptions.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setDateRange(range.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-['Poppins'] font-semibold transition-colors duration-150
                    ${dateRange === range.id
                      ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30'
                      : 'border border-white/10 text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Selection */}
          <div className="mb-5">
            <label className="block text-white/40 text-xs font-['Poppins'] font-semibold mb-3">
              Select Metrics
            </label>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scroll">
              {availableMetrics.map((category) => (
                <div key={category.category} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <h4 className="text-white font-['Poppins'] text-[11px] font-bold mb-2">{category.category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {category.items.map((metric) => (
                      <label
                        key={metric.id}
                        className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-white/5 transition-colors duration-150"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMetrics.includes(metric.id)}
                          onChange={() => toggleMetric(metric.id)}
                          className="w-4 h-4 border border-white/20 bg-transparent text-[#00E5FF] rounded focus:ring-0"
                        />
                        <span className="shrink-0">{getMetricIcon(metric.icon, selectedMetrics.includes(metric.id))}</span>
                        <span className="text-white/70 text-[10px] font-['Poppins'] font-medium">{metric.name}</span>
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
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-lg hover:opacity-90 transition-opacity duration-150 text-xs font-['Poppins'] disabled:opacity-50"
            >
              Save Report Template
            </button>
            <button
              disabled={selectedMetrics.length === 0}
              className="px-5 py-2.5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors duration-150 text-xs font-['Poppins'] font-semibold disabled:opacity-50"
            >
              Preview
            </button>
          </div>
        </div>

        {/* Report Preview */}
        {selectedMetrics.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-['Poppins'] text-base font-bold">Report Preview</h3>
              <span className="text-white/30 text-[9px] font-['Poppins']">Sample data for {dateRange.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedMetrics.slice(0, 6).map((metricId) => {
                const metric = availableMetrics
                  .flatMap(c => c.items)
                  .find(m => m.id === metricId);
                
                return (
                  <div key={metricId} className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <span className="shrink-0">{getMetricIcon(metric?.icon || '📊', true)}</span>
                    </div>
                    <div className="text-white/50 text-[8px] font-['Poppins'] font-semibold mt-1 mb-1">{metric?.name || metricId}</div>
                    <div className="text-xl font-bold text-white">
                      {getRandomValue()}
                    </div>
                    <div className="text-[#2DD4BF] text-[8px] font-['Poppins'] font-semibold mt-1">+12% vs previous</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Saved Reports */}
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 sticky top-6">
          <h3 className="text-white font-['Poppins'] text-base font-bold mb-5">Saved Reports</h3>
          
          <div className="space-y-3">
            {savedReports.map((report) => (
              <div
                key={report.id}
                className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-150 p-4 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-['Poppins'] text-xs font-bold">{report.name}</h4>
                  <span className="text-white/30 text-[8px] font-['Poppins'] font-semibold">{report.schedule}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {report.metrics.slice(0, 3).map((metric) => (
                    <span key={metric} className="px-1.5 py-0.5 rounded border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF] text-[8px] font-['Poppins'] font-semibold">
                      {metric}
                    </span>
                  ))}
                  {report.metrics.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded border border-white/10 text-white/40 text-[8px] font-['Poppins'] font-semibold">
                      +{report.metrics.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[9px] font-['Poppins']">
                  <span className="text-white/30">Last run: <span className="text-white/50">{report.lastRun}</span></span>
                  <button className="text-[#00E5FF] hover:text-[#2DD4BF] transition-colors duration-150 text-xs font-semibold">
                    Run Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-5 pt-4 text-[#00E5FF] hover:text-[#2DD4BF] text-xs font-['Poppins'] font-semibold flex items-center justify-center gap-2 border-t border-white/10 transition-colors duration-150">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Schedule New Report
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 229, 255, 0.3);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default CustomReports;