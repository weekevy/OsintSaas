const ReportTemplates = ({ templates }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="group relative bg-[#090c0e] border border-white/10 p-5 hover:border-[#00ff88]/30 transition-all duration-300"
          >
            {/* Corner brackets on hover */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Icon */}
            <div className="text-3xl mb-3">{template.icon}</div>
            
            <h3 className="font-mono text-[11px] font-bold text-white uppercase tracking-[0.08em] mb-1 group-hover:text-[#00ff88] transition-colors">
              {template.name}
            </h3>
            <p className="text-white/40 text-[9px] font-mono leading-relaxed mb-3">
              {template.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">{template.uses} USES</span>
              <button className="px-3 py-1.5 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10 transition-all text-[8px] font-mono uppercase tracking-[0.08em]">
                USE TEMPLATE
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Template Card - Tactical */}
      <div className="bg-[#090c0e] border border-white/10 p-5 relative group hover:border-[#00ff88]/30 transition-all duration-300">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00ff88]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00ff88]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-mono text-[10px] font-bold text-white uppercase tracking-[0.12em] mb-1">CUSTOM TEMPLATE</h4>
            <p className="text-white/40 text-[8px] font-mono uppercase tracking-[0.08em]">CREATE YOUR OWN REPORT TEMPLATE FROM SCRATCH</p>
          </div>
          <button className="px-4 py-2 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10 transition-all text-[9px] font-mono uppercase tracking-[0.08em] flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            CREATE TEMPLATE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportTemplates;