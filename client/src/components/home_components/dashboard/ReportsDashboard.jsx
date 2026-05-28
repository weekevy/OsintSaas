import { useState, useEffect } from 'react';
import {
  ReportCard,
  ReportGenerator,
} from '../reports';
import api from '../../../services/api';

const ReportsDashboard = () => {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/reports');
      if (response.data.success) {
        setReports(response.data.reports);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: 'total dossiers', 
      value: reports.length.toString(), 
      icon: (
        <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      label: 'intelligence shares', 
      value: '0', 
      icon: (
        <svg className="w-5 h-5 text-[#2DD4BF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )
    },
    { 
      label: 'archived scans', 
      value: '0', 
      icon: (
        <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      )
    },
  ];

  return (
    <div className="max-w-[1680px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10 font-sans text-white animate-slide-up">
      {/* Intelligence Header - Responsive Spacing */}
      <header id="tour-reports-header" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 lg:mb-12 px-2 sm:px-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 lg:h-8 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF] rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
            <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">Intelligence Archives</h1>
          </div>
          <p className="text-white/40 text-[10px] lg:text-sm font-medium tracking-wide font-sans capitalize">Manage and access high-fidelity investigation dossiers.</p>
        </div>
        
        <button
          id="tour-assemble-dossier"
          onClick={() => setIsGeneratorOpen(true)}
          className="group relative w-full md:w-auto px-8 py-3.5 lg:py-4 bg-[#00E5FF] text-black font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(0,229,255,0.2)]"
        >
          <div className="flex items-center justify-center gap-3 tracking-wide text-[10px] lg:text-xs font-sans uppercase">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Assemble dossier
          </div>
        </button>
      </header>

      {/* Operational Stats - Responsive Grid */}
      <div id="tour-report-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-8 lg:mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 lg:p-6 rounded-3xl lg:rounded-[32px] bg-black border border-white/5 group hover:border-[#00E5FF]/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <span className="text-[9px] lg:text-[10px] font-bold text-white/20 tracking-wider font-sans uppercase">{stat.label}</span>
              <div className="opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                {stat.icon}
              </div>
            </div>
            <span className="text-2xl lg:text-3xl font-bold text-white font-sans">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Main Content Area - Full Width */}
      <main id="tour-recent-reports" className="w-full min-h-[400px]">
        <div className="space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-[10px] lg:text-[11px] font-bold text-[#00E5FF] tracking-wider uppercase font-sans">Recent Reports</h3>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
               <span className="text-[8px] lg:text-[9px] font-bold text-white/20 uppercase tracking-widest font-sans">Archive live</span>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin" /></div>
          ) : reports.length === 0 ? (
            <div className="py-20 lg:py-32 flex flex-col items-center justify-center rounded-3xl lg:rounded-[40px] bg-white/[0.01] border border-dashed border-white/10 text-center animate-fade-in px-4">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white/[0.02] flex items-center justify-center mb-6">
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-white/40 text-sm lg:text-base font-bold mb-2 font-sans capitalize">No dossiers synthesized</h4>
              <p className="text-white/20 text-[9px] lg:text-[10px] max-w-[240px] leading-relaxed font-medium tracking-widest font-sans capitalize">Select a completed project to generate your first intelligence briefing.</p>
              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 text-[10px] font-bold tracking-widest hover:bg-[#00E5FF] hover:text-black hover:border-[#00E5FF] transition-all font-sans"
              >
                Initiate assembly
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 animate-fade-in">
              {reports.map((report, idx) => (
                <div key={report.id} style={{ animationDelay: `${idx * 0.05}s` }} className="contents">
                  <ReportCard report={report} onDelete={fetchReports} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Dossier Builder Modal */}
      <ReportGenerator
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onReportGenerated={fetchReports}
      />
    </div>
  );
};

export default ReportsDashboard;
