const PerformanceMetrics = ({ timeRange }) => {
  const metrics = {
    api: {
      avgResponse: '187ms',
      p95: '245ms',
      p99: '389ms',
      errorRate: '0.23%',
      uptime: '99.97%',
      requests: '1.2M'
    },
    search: {
      avgTime: '0.8s',
      p95: '1.2s',
      p99: '1.8s',
      successRate: '99.8%',
      cacheHit: '67%',
      queries: '890K'
    },
    analysis: {
      avgTime: '2.3s',
      p95: '3.1s',
      p99: '4.5s',
      successRate: '98.5%',
      queueTime: '0.3s',
      jobs: '234K'
    },
    report: {
      avgTime: '1.5s',
      p95: '2.2s',
      p99: '3.2s',
      successRate: '99.2%',
      formats: '5',
      generated: '45K'
    }
  };

  const systemHealth = [
    { label: 'API Uptime', value: metrics.api.uptime, color: '#2DD4BF', trend: '+0.02%', up: true },
    { label: 'Avg Response', value: metrics.api.avgResponse, color: 'white', trend: '-8ms', up: true },
    { label: 'Error Rate', value: metrics.api.errorRate, color: 'white', trend: '-0.05%', up: true },
    { label: 'Total Requests', value: metrics.api.requests, color: 'white', trend: '+12%', up: true }
  ];

  const serviceCategories = [
    {
      title: 'API Gateway',
      icon: (
        <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      metrics: [
        { label: 'Average Response Time', value: metrics.api.avgResponse },
        { label: '95th Percentile', value: metrics.api.p95 },
        { label: '99th Percentile', value: metrics.api.p99 },
        { label: 'Error Rate', value: metrics.api.errorRate, positive: true }
      ]
    },
    {
      title: 'Search Engine',
      icon: (
        <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      metrics: [
        { label: 'Average Query Time', value: metrics.search.avgTime },
        { label: 'Cache Hit Ratio', value: metrics.search.cacheHit, positive: true },
        { label: 'Success Rate', value: metrics.search.successRate, positive: true },
        { label: 'Queries per Day', value: metrics.search.queries }
      ]
    },
    {
      title: 'Analysis Engine',
      icon: (
        <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      metrics: [
        { label: 'Average Analysis Time', value: metrics.analysis.avgTime },
        { label: 'Queue Time', value: metrics.analysis.queueTime },
        { label: 'Success Rate', value: metrics.analysis.successRate, positive: true },
        { label: 'Jobs per Day', value: metrics.analysis.jobs }
      ]
    },
    {
      title: 'Report Generator',
      icon: (
        <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      metrics: [
        { label: 'Average Generation Time', value: metrics.report.avgTime },
        { label: 'Success Rate', value: metrics.report.successRate, positive: true },
        { label: 'Supported Formats', value: metrics.report.formats },
        { label: 'Reports Generated', value: metrics.report.generated }
      ]
    }
  ];

  const resources = [
    { label: 'CPU Usage', value: '45%', details: '8 cores @ 2.4GHz', color: '#00E5FF' },
    { label: 'Memory Usage', value: '62%', details: '24.8GB / 40GB', color: '#2DD4BF' },
    { label: 'Storage', value: '45%', details: '2.3TB / 5TB', color: '#00E5FF' }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* System Health */}
      <div className="rounded-2xl border border-white/10 bg-black p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-white font-sans text-base font-bold">System Performance</h3>
            <p className="text-white/40 text-xs mt-1">Real-time performance metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#2DD4BF] rounded-full" />
            <span className="text-white/70 text-xs font-sans">All systems operational</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {systemHealth.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-white/40 text-[10px] font-sans font-semibold mb-1">{item.label}</div>
              <div className={`text-xl font-bold font-sans`} style={{ color: item.color }}>
                {item.value}
              </div>
              <div className="text-[#2DD4BF] text-[9px] font-sans font-semibold mt-1">
                {item.trend} vs yesterday
              </div>
            </div>
          ))}
        </div>

        {/* Performance Chart - Simplified */}
        <div className="relative h-40 rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-[9px] font-sans">Response Time Trend</span>
            <div className="flex gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                <span className="text-white/40 text-[8px]">Avg Response</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
                <span className="text-white/40 text-[8px]">P95</span>
              </div>
            </div>
          </div>
          <div className="relative h-24">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 100">
              <path
                d="M 40,80 L 80,70 L 120,60 L 160,50 L 200,40 L 240,35 L 280,30 L 320,25 L 360,22 L 400,20 L 440,22 L 480,25 L 520,30 L 560,35 L 600,40 L 640,45 L 680,50 L 720,55 L 760,60"
                stroke="#00E5FF"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 40,70 L 80,65 L 120,55 L 160,47 L 200,42 L 240,37 L 280,35 L 320,32 L 360,30 L 400,29 L 440,31 L 480,34 L 520,37 L 560,41 L 600,45 L 640,49 L 680,52 L 720,57 L 760,62"
                stroke="#2DD4BF"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                fill="none"
              />
            </svg>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-white/30 text-[8px]">00:00</span>
            <span className="text-white/30 text-[8px]">06:00</span>
            <span className="text-white/30 text-[8px]">12:00</span>
            <span className="text-white/30 text-[8px]">18:00</span>
            <span className="text-white/30 text-[8px]">24:00</span>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {serviceCategories.map((service, idx) => (
          <div key={idx} className="rounded-2xl border border-white/10 bg-black p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl border border-[#00E5FF]/30 bg-[#00E5FF]/10 flex items-center justify-center">
                {service.icon}
              </div>
              <h4 className="text-white font-sans text-sm font-bold">{service.title}</h4>
            </div>

            <div className="space-y-2">
              {service.metrics.map((metric, mIdx) => (
                <div key={mIdx} className="flex justify-between items-center p-2.5 rounded-lg bg-white/5">
                  <span className="text-white/50 text-[10px] font-sans">{metric.label}</span>
                  <span className={`text-xs font-sans font-semibold ${metric.positive ? 'text-[#2DD4BF]' : 'text-white'}`}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* System Resources */}
      <div className="rounded-2xl border border-white/10 bg-black p-5">
        <h3 className="text-white font-sans text-base font-bold mb-4">System Resources</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {resources.map((resource, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-[11px] font-sans mb-1">
                <span className="text-white/50">{resource.label}</span>
                <span className="text-white font-semibold">{resource.value}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF]" 
                  style={{ width: resource.value }}
                />
              </div>
              <span className="text-white/30 text-[9px] font-sans mt-1 block">{resource.details}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;