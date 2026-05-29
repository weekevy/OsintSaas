import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useSocket } from '../../../context/SocketContext';

const ReportCard = ({ report: initialReport, onDelete, onProgressClick }) => {
  const [report, setReport] = useState(initialReport);
  const [isDeleting, setIsDeleting] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    setReport(initialReport);
  }, [initialReport]);

  useEffect(() => {
    if (!socket || report.status !== 'generating') return;

    const handleProgress = (data) => {
      if (data.reportId === report.id) {
        setReport(prev => ({ ...prev, progress: data.progress }));
      }
    };

    const handleReady = (data) => {
      if (data.reportId === report.id) {
        setReport(prev => ({ ...prev, status: 'ready', progress: 100, file_path: data.filePath }));
      }
    };

    socket.on('report_progress', handleProgress);
    socket.on('report_ready', handleReady);

    return () => {
      socket.off('report_progress', handleProgress);
      socket.off('report_ready', handleReady);
    };
  }, [socket, report.id, report.status]);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete the report "${report.title}"?`)) {
      try {
        setIsDeleting(true);
        const response = await api.delete(`/api/reports/${report.id}`);
        if (response.data.success) {
          if (onDelete) onDelete();
        } else {
          setIsDeleting(false);
          alert('Failed to delete report');
        }
      } catch (err) {
        setIsDeleting(false);
        alert(err.response?.data?.error || 'Failed to delete report');
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ready': return 'border-[#2DD4BF]/30 text-[#2DD4BF] bg-[#2DD4BF]/5';
      case 'generating': return 'border-[#fbbf24]/30 text-[#fbbf24] bg-[#fbbf24]/5';
      case 'failed': return 'border-red-500/30 text-red-500 bg-red-500/5';
      default: return 'border-white/20 text-white/40';
    }
  };

  const getFormatIcon = (format) => {
    switch(format?.toUpperCase()) {
      case 'PDF': return (
        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
      case 'HTML': return (
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
      case 'XML': return (
        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
      case 'JPG': return (
        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
      default: return (
        <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  return (
    <div 
      onClick={() => { if (report.status === 'generating' && onProgressClick) onProgressClick(report); }}
      className={`group relative p-6 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-[#00E5FF]/20 transition-all duration-500 animate-slide-up font-sans ${report.status === 'generating' ? 'cursor-pointer' : ''}`}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-[#00E5FF]/5 blur-2xl rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#00E5FF]/30 transition-colors">
              {getFormatIcon(report.format)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-[#00E5FF] transition-colors capitalize">{report.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{report.classification || 'confidential'}</span>
                <span className="text-white/10 text-[8px]">•</span>
                <span className="text-[9px] font-medium text-white/40 lowercase">{report.project_name || 'individual scan'}</span>
              </div>
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full border text-[8px] font-bold tracking-widest uppercase ${getStatusColor(report.status)}`}>
            {report.status}
          </span>
        </div>

        {report.status === 'generating' && (
          <div className="mb-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[8px] font-black text-[#fbbf24] uppercase tracking-widest">Synthesizing Dossier...</span>
              <span className="text-[8px] font-black text-[#fbbf24]">{report.progress || 0}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#fbbf24] transition-all duration-1000 ease-out shadow-[0_0_8px_#fbbf24]"
                style={{ width: `${report.progress || 0}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-white/10 uppercase tracking-widest">Generated on</span>
            <span className="text-[10px] font-medium text-white/30">{new Date(report.created_at).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href={report.file_path || '#'} 
              download={`${report.title}.pdf`}
              onClick={(e) => { if (!report.file_path) e.preventDefault(); }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                report.status === 'ready' 
                  ? 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30 hover:brightness-110' 
                  : 'text-white/10 bg-white/5 border-white/5 cursor-not-allowed opacity-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 transition-all active:scale-90 disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
