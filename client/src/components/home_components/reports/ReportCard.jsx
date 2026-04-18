const ReportCard = ({ report }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'border-[#22d3ee]/30 text-[#22d3ee]';
      case 'scheduled': return 'border-[#00ff88]/30 text-[#00ff88]';
      case 'generating': return 'border-[#fbbf24]/30 text-[#fbbf24]';
      default: return 'border-white/20 text-white/40';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'COMPLETED';
      case 'scheduled': return 'SCHEDULED';
      case 'generating': return 'GENERATING';
      default: return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  const getFormatIcon = (format) => {
    switch(format) {
      case 'PDF': return '📄';
      case 'DOCX': return '📝';
      case 'HTML': return '🌐';
      default: return '📄';
    }
  };

  return (
    <div className="bg-[#090c0e] border border-white/10 hover:border-[#00ff88]/30 transition-all p-3 relative group">
      {/* Corner brackets on hover */}
      <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-[#00ff88]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-[#00ff88]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[#00ff88]/30 flex items-center justify-center">
            <span className="text-base">{getFormatIcon(report.format)}</span>
          </div>
          <div>
            <h4 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.08em]">{report.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">{report.type}</span>
              <span className="text-white/20 text-[6px]">•</span>
              <span className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">{report.created}</span>
              <span className="text-white/20 text-[6px]">•</span>
              <span className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">{report.size}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-1.5 py-0.5 border text-[7px] font-mono uppercase tracking-[0.1em] ${getStatusColor(report.status)}`}>
            {getStatusText(report.status)}
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-white/30 hover:text-[#00ff88] hover:border-[#00ff88]/30 transition-all border border-transparent hover:border-white/10">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button className="p-1.5 text-white/30 hover:text-[#f87171] hover:border-[#f87171]/30 transition-all border border-transparent hover:border-white/10">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;