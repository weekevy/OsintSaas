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

  const reports = [];

  const templates = [
    {
      id: 1,
      name: 'THREAT INTELLIGENCE REPORT',
      description: 'Comprehensive threat analysis with IOCs and TTPs',
      icon: (color) => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      name: 'INCIDENT INVESTIGATION',
      description: 'Detailed incident timeline and forensic findings',
      icon: (color) => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 7V10L12 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      uses: 189
    },
    {
      id: 3,
      name: 'EXECUTIVE SUMMARY',
      description: 'High-level overview for management',
      icon: (color) => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20V20H4V4Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8H16V10H8V8Z" fill={color} stroke={color} strokeWidth="1.5"/>
          <path d="M8 12H16V14H8V12Z" fill={color} stroke={color} strokeWidth="1.5"/>
          <path d="M8 16H13V18H8V16Z" fill={color} stroke={color} strokeWidth="1.5"/>
        </svg>
      ),
      uses: 156
    }
  ];

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-5 bg-[#080b0d]">
      
      {/* Header - Tactical */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-white uppercase tracking-[-0.02em] flex items-center gap-3">
            <svg className="w-6 h-6 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            REPORTS
          </h1>
          <p className="text-[9px] font-mono text-white/40 uppercase tracking-[0.12em] mt-1">
            GENERATE, SCHEDULE, AND EXPORT OSINT INVESTIGATION REPORTS
          </p>
        </div>
        
        <button
          onClick={() => setIsGeneratorOpen(true)}
          className="px-4 py-2 border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-[9px] font-mono uppercase tracking-[0.08em] flex items-center gap-2 group"
        >
          <svg className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          GENERATE REPORT
        </button>
      </div>

      {/* Tabs - Tactical */}
      <div className="flex gap-1 border-b border-white/10">
        {[
          { id: 'reports', label: 'REPORTS' },
          { id: 'templates', label: 'TEMPLATES' },
          { id: 'scheduled', label: 'SCHEDULED' },
          { id: 'export', label: 'EXPORT' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-[9px] font-mono uppercase tracking-[0.08em] transition-all whitespace-nowrap
              ${activeTab === tab.id 
                ? 'text-[#00ff88] border-b-2 border-[#00ff88]' 
                : 'text-white/40 hover:text-white'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'reports' && (
        <div className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#00ff88]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4H20V20H4V4Z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 8H16V10H8V8Z" fill="currentColor"/>
                <path d="M8 12H16V14H8V12Z" fill="currentColor"/>
                <path d="M8 16H13V18H8V16Z" fill="currentColor"/>
              </svg>
              RECENT REPORTS
            </h3>
            <ExportOptions />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {reports.length === 0 && (
              <div className="bg-[#090c0e] border border-white/10 p-8 text-center relative">
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30" />
                <svg className="w-12 h-12 mx-auto text-white/20 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4H20V20H4V4Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 8H16V10H8V8Z" fill="currentColor"/>
                  <path d="M8 12H16V14H8V12Z" fill="currentColor"/>
                  <path d="M8 16H13V18H8V16Z" fill="currentColor"/>
                </svg>
                <h3 className="text-white/60 text-[10px] font-mono uppercase tracking-[0.08em] mb-1">NO REPORTS YET</h3>
                <p className="text-white/30 text-[8px] font-mono uppercase tracking-[0.08em] mb-4">GENERATE YOUR FIRST REPORT TO GET STARTED</p>
                <button
                  onClick={() => setIsGeneratorOpen(true)}
                  className="px-4 py-2 border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-[8px] font-mono uppercase tracking-[0.08em] inline-flex items-center gap-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  GENERATE REPORT
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-[#090c0e] border border-white/10 p-4 hover:border-[#00ff88]/30 transition-all duration-300 group relative"
            >
              <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00ff88]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#00ff88]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 border border-[#00ff88]/30 flex items-center justify-center group-hover:border-[#00ff88] transition-all">
                  {template.icon('#00ff88')}
                </div>
                <span className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em] flex items-center gap-1">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 6V12L15 15" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {template.uses} USES
                </span>
              </div>
              <h4 className="text-white font-mono text-[9px] font-bold uppercase tracking-[0.08em] mb-1">{template.name}</h4>
              <p className="text-white/40 text-[7px] font-mono leading-relaxed mb-3">{template.description}</p>
              <button className="text-[#00ff88] hover:text-[#22d3ee] transition-colors text-[7px] font-mono uppercase tracking-[0.08em] flex items-center gap-1 group/btn">
                USE TEMPLATE
                <svg className="w-2.5 h-2.5 group-hover/btn:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'scheduled' && (
        <div className="mt-4">
          <ScheduledReports />
        </div>
      )}

      {activeTab === 'export' && (
        <div className="mt-4">
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