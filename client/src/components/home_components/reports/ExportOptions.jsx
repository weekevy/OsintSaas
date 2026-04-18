import { useState } from 'react';

const ExportOptions = ({ expanded = false }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);
  const [pageSize, setPageSize] = useState('a4');

  const formats = [
    { 
      id: 'pdf', 
      name: 'PDF DOCUMENT', 
      description: 'BEST FOR PRINTING',
      icon: (isSelected) => (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20V20H4V4Z" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8H16V10H8V8Z" fill={isSelected ? "#00ff88" : "#4B5563"} stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5"/>
          <path d="M8 12H16V14H8V12Z" fill={isSelected ? "#00ff88" : "#4B5563"} stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5"/>
          <path d="M8 16H13V18H8V16Z" fill={isSelected ? "#00ff88" : "#4B5563"} stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5"/>
        </svg>
      )
    },
    { 
      id: 'docx', 
      name: 'WORD DOCUMENT', 
      description: 'EDITABLE FORMAT',
      icon: (isSelected) => (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H16L20 8V20H4V4Z" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 12H8M16 8H8M16 12H14M16 16H8" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 4V8H20" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      id: 'html', 
      name: 'HTML', 
      description: 'WEB FORMAT',
      icon: (isSelected) => (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 8L3 12L7 16" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M17 8L21 12L17 16" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M14 4L10 20" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="2" y="4" width="20" height="16" rx="2" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5"/>
        </svg>
      )
    },
    { 
      id: 'csv', 
      name: 'CSV', 
      description: 'RAW DATA',
      icon: (isSelected) => (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 4H16L20 8V20H4V4H8Z" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 12H8M16 12H14M12 16H8M16 16H14" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 4V8H4" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="16.5" cy="8.5" r="1.5" fill={isSelected ? "#00ff88" : "#4B5563"}/>
        </svg>
      )
    },
    { 
      id: 'json', 
      name: 'JSON', 
      description: 'API FORMAT',
      icon: (isSelected) => (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 6C7 6 3 8 3 12C3 16 7 18 7 18" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M17 6C17 6 21 8 21 12C21 16 17 18 17 18" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="9" y="8" width="6" height="8" rx="1" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5"/>
          <path d="M10 11H14" stroke={isSelected ? "#00ff88" : "#4B5563"} strokeWidth="1.5"/>
        </svg>
      )
    },
  ];

  if (!expanded) {
    return (
      <button className="px-4 py-2 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10 transition-all flex items-center gap-2 group text-[10px] font-mono uppercase tracking-[0.08em]">
        <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>EXPORT</span>
      </button>
    );
  }

  return (
    <div className="space-y-5 bg-[#090c0e] border border-white/10 p-5 relative">
      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#00ff88]/30" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#00ff88]/30" />
      
      <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-[#00ff88]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        EXPORT OPTIONS
      </h3>
      
      {/* Format Selection */}
      <div>
        <label className="block text-white/40 text-[8px] font-mono uppercase tracking-[0.12em] mb-2 flex items-center gap-2">
          <svg className="w-3 h-3 text-[#00ff88]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M8 10H16M8 14H12" />
          </svg>
          FORMAT
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-3 border transition-all text-left group
                ${selectedFormat === format.id
                  ? 'border-[#00ff88] bg-[#00ff88]/5'
                  : 'border-white/10 hover:border-[#00ff88]/50'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`transition-all ${selectedFormat === format.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {format.icon(selectedFormat === format.id)}
                </div>
                <div>
                  <div className={`text-[10px] font-mono uppercase tracking-[0.08em] ${selectedFormat === format.id ? 'text-[#00ff88]' : 'text-white/60 group-hover:text-white'}`}>
                    {format.name}
                  </div>
                  <div className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em]">{format.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-white/40 text-[8px] font-mono uppercase tracking-[0.12em] mb-2 flex items-center gap-2">
            <svg className="w-3 h-3 text-[#00ff88]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M8 10H16M8 14H12" />
            </svg>
            CONTENT OPTIONS
          </label>
          <div className="space-y-1.5">
            <label className="flex items-center gap-3 p-2 cursor-pointer group border border-transparent hover:border-[#00ff88]/20 transition-all">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="w-3.5 h-3.5 border border-white/20 bg-transparent text-[#00ff88] focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-white/50 group-hover:text-white text-[9px] font-mono uppercase tracking-[0.08em] flex items-center gap-2">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4V20H20" />
                  <path d="M8 16V12M12 16V8M16 16V10" />
                </svg>
                INCLUDE CHARTS
              </span>
            </label>
            <label className="flex items-center gap-3 p-2 cursor-pointer group border border-transparent hover:border-[#00ff88]/20 transition-all">
              <input
                type="checkbox"
                checked={includeTables}
                onChange={(e) => setIncludeTables(e.target.checked)}
                className="w-3.5 h-3.5 border border-white/20 bg-transparent text-[#00ff88] focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-white/50 group-hover:text-white text-[9px] font-mono uppercase tracking-[0.08em] flex items-center gap-2">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4H20V20H4V4Z" />
                  <path d="M4 10H20M10 4V20" />
                </svg>
                INCLUDE TABLES
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-white/40 text-[8px] font-mono uppercase tracking-[0.12em] mb-2 flex items-center gap-2">
            <svg className="w-3 h-3 text-[#00ff88]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7H21M5 7V19H19V7" />
              <rect x="6" y="10" width="4" height="4" rx="1" />
              <rect x="14" y="10" width="4" height="4" rx="1" />
            </svg>
            PAGE SETUP
          </label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            className="w-full px-3 py-2 bg-[#0d1114] border border-white/10 text-white text-[10px] font-mono uppercase tracking-[0.08em] focus:outline-none focus:border-[#00ff88]/50 transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300ff88'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '0.875rem'
            }}
          >
            <option value="a4" className="bg-[#0d1114] text-white">A4</option>
            <option value="letter" className="bg-[#0d1114] text-white">LETTER</option>
            <option value="legal" className="bg-[#0d1114] text-white">LEGAL</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-3 border-t border-white/10">
        <button className="flex-1 px-4 py-2 border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-[9px] font-mono uppercase tracking-[0.08em] flex items-center justify-center gap-2 group relative overflow-hidden">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          EXPORT NOW
        </button>
        <button className="px-4 py-2 border border-white/10 text-white/50 hover:border-[#00ff88]/30 hover:text-[#00ff88] transition-all text-[9px] font-mono uppercase tracking-[0.08em] flex items-center gap-2 group">
          <svg className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7V12L15 15" />
          </svg>
          SCHEDULE
        </button>
      </div>
    </div>
  );
};

export default ExportOptions;