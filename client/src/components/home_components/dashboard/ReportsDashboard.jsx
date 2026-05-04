import { useState } from 'react';
import { 
  ReportCard, 
  ReportGenerator, 
  ReportTemplates, 
  ExportOptions 
} from '../reports';

const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const reports = [];

  const templates = [
    {
      id: 1,
      name: 'Threat Intelligence Report',
      description: 'Comprehensive threat analysis with IOCs and TTPs',
      icon: (color) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="1.5" fill={color}/>
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
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 7V10L12 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
          <path d="M4 4H20V20H4V4Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8H16V10H8V8Z" fill={color} stroke={color} strokeWidth="1.5"/>
          <path d="M8 12H16V14H8V12Z" fill={color} stroke={color} strokeWidth="1.5"/>
          <path d="M8 16H13V18H8V16Z" fill={color} stroke={color} strokeWidth="1.5"/>
        </svg>
      ),
      uses: 156
    }
  ];

  const tabs = [
    { id: 'reports', label: 'Reports' },
    { id: 'templates', label: 'Templates' },
    { id: 'export', label: 'Export' }
  ];

  return (
    <div className="min-h-screen font-['Poppins'] text-white bg-black">
      <div className="relative z-[1] max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 pb-12 md:pb-10">
        
        {/* Header - Larger text */}
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-5 md:p-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="font-['Poppins'] text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Reports
                </h1>
              </div>
              <p className="text-sm font-['Poppins'] text-white/40 ml-12">
                Generate and export investigation reports
              </p>
            </div>
            
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 text-white/60 hover:text-[#00E5FF] transition-colors duration-150 text-sm font-['Poppins'] font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Generate Report
            </button>
          </div>
        </div>

        {/* Tabs - Larger text */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-1 mb-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-['Poppins'] font-semibold rounded-lg transition-colors duration-150 ${
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

        {/* Content Sections - Larger text */}
        <div className="mt-6">
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full" />
                  <h3 className="text-white font-['Poppins'] text-base font-bold">
                    Recent Reports
                  </h3>
                </div>
                <ExportOptions />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {reports.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    
                    <h3 className="font-['Poppins'] text-base font-bold text-white/60 mb-2">
                      No Reports Yet
                    </h3>
                    <p className="text-white/30 text-sm font-['Poppins'] mb-5">
                      Generate your first report to get started
                    </p>
                    
                    <button
                      onClick={() => setIsGeneratorOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 text-white/60 hover:text-[#00E5FF] transition-colors duration-150 text-sm font-['Poppins'] font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Generate Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Templates Tab - Larger cards */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {templates.map((template, idx) => (
                <div
                  key={template.id}
                  className="rounded-2xl border border-white/10 bg-[#0a0a0a] hover:border-[#00E5FF]/30 transition-colors duration-150 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl border border-[#00E5FF]/30 flex items-center justify-center bg-[#00E5FF]/5">
                      {template.icon('#00E5FF')}
                    </div>
                    <span className="text-white/30 text-xs font-['Poppins'] flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 6V12L15 15" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {template.uses} uses
                    </span>
                  </div>
                  
                  <h4 className="font-['Poppins'] text-base font-bold text-white mb-2">
                    {template.name}
                  </h4>
                  <p className="text-white/40 text-sm font-['Poppins'] leading-relaxed mb-5">
                    {template.description}
                  </p>
                  
                  <button className="text-[#00E5FF] hover:text-[#2DD4BF] transition-colors duration-150 text-sm font-['Poppins'] font-semibold flex items-center gap-1">
                    Use Template
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <ExportOptions expanded />
            </div>
          )}
        </div>

        {/* Report Generator Modal */}
        <ReportGenerator 
          isOpen={isGeneratorOpen}
          onClose={() => setIsGeneratorOpen(false)}
        />
      </div>
    </div>
  );
};

export default ReportsDashboard;