import { useState } from 'react';
import { 
  ReportCard, 
  ReportGenerator, 
  ReportTemplates, 
  ScheduledReports, 
  ExportOptions 
} from '../reports';

const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const reports = [
    // {
    //   id: 1,
    //   name: 'Q1 2024 Threat Intelligence Report',
    //   type: 'Threat Intel',
    //   created: '2024-03-15',
    //   format: 'PDF',
    //   size: '2.4 MB',
    //   status: 'completed'
    // },
  ];

  const templates = [
    {
      id: 1,
      name: 'Threat Intelligence Report',
      description: 'Comprehensive threat analysis with IOCs and TTPs',
      icon: (color) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="2" fill={color}/>
        </svg>
      ),
      uses: 234
    },
    {
      id: 2,
      name: 'Incident Investigation',
      description: 'Detailed incident timeline and forensic findings',
      icon: (color) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 7V10L12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      uses: 189
    },
    {
      id: 3,
      name: 'Executive Summary',
      description: 'High-level overview for management',
      icon: (color) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20V20H4V4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8H16V10H8V8Z" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 12H16V14H8V12Z" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 16H13V18H8V16Z" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      uses: 156
    }
  ];

  // Add more template icons
  const enhancedTemplates = templates.map((template, index) => {
    if (index === 0) {
      return {
        ...template,
        icon: (color) => (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 7L12 12L4 7L12 2L20 7Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 12L12 17L4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 17L12 22L4 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="2" fill={color}/>
          </svg>
        )
      };
    }
    return template;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Reports
          </h1>
          <p className="text-white/60 text-sm lg:text-base mt-1">
            Generate, schedule, and export OSINT investigation reports
          </p>
        </div>
        
        <button
          onClick={() => setIsGeneratorOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Generate Report
        </button>
      </div>

      {/* Tabs with icons */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'reports', label: 'Reports', icon: (color) => (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <path d="M4 4H20V20H4V4Z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 8H16V10H8V8Z" fill={color} strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 12H16V14H8V12Z" fill={color} strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 16H13V18H8V16Z" fill={color} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )},
          { id: 'templates', label: 'Templates', icon: (color) => (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <path d="M4 4H10V10H4V4Z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 4H20V10H14V4Z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 14H10V20H4V14Z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 14H20V20H14V14Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )},
          { id: 'scheduled', label: 'Scheduled', icon: (color) => (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7V12L15 15" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )},
          { id: 'export', label: 'Export', icon: (color) => (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <path d="M12 3V16M12 16L9 13M12 16L15 13" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 16V20H20V16" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            {tab.icon(activeTab === tab.id ? '#FFFFFF' : '#9CA3AF')}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4H20V20H4V4Z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 8H16V10H8V8Z" fill="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12H16V14H8V12Z" fill="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 16H13V18H8V16Z" fill="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Recent Reports
            </h3>
            <ExportOptions />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
            {reports.length === 0 && (
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-white/20 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4H20V20H4V4Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 8H16V10H8V8Z" fill="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12H16V14H8V12Z" fill="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 16H13V18H8V16Z" fill="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className="text-white/80 text-lg font-medium mb-2">No reports yet</h3>
                <p className="text-white/40 text-sm mb-6">Generate your first report to get started</p>
                <button
                  onClick={() => setIsGeneratorOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Generate Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enhancedTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all">
                  <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                    {template.icon('#8B5CF6')}
                  </div>
                </div>
                <span className="text-white/40 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 6V12L15 15" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {template.uses} uses
                </span>
              </div>
              <h4 className="text-white font-semibold text-lg mb-2">{template.name}</h4>
              <p className="text-white/40 text-sm mb-4">{template.description}</p>
              <button className="text-purple-400 hover:text-blue-400 transition-colors text-sm font-medium flex items-center gap-1 group/btn">
                Use Template
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'scheduled' && (
        <ScheduledReports />
      )}

      {activeTab === 'export' && (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <ExportOptions expanded />
        </div>
      )}

      {/* Report Generator Modal */}
      <ReportGenerator 
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
      />
    </div>
  );
};

export default ReportsDashboard;
