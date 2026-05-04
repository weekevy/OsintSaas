import { useState } from 'react';

const ExportOptions = ({ expanded = false }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);
  const [pageSize, setPageSize] = useState('a4');

  const formats = [
    { 
      id: 'pdf', 
      name: 'PDF Document', 
      description: 'Best for printing',
      icon: (isSelected) => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20V20H4V4Z" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8H16V10H8V8Z" fill={isSelected ? "#00E5FF" : "#4B5563"} stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5"/>
          <path d="M8 12H16V14H8V12Z" fill={isSelected ? "#00E5FF" : "#4B5563"} stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5"/>
          <path d="M8 16H13V18H8V16Z" fill={isSelected ? "#00E5FF" : "#4B5563"} stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5"/>
        </svg>
      )
    },
    { 
      id: 'docx', 
      name: 'Word Document', 
      description: 'Editable format',
      icon: (isSelected) => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H16L20 8V20H4V4Z" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 12H8M16 8H8M16 12H14M16 16H8" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 4V8H20" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      id: 'html', 
      name: 'HTML', 
      description: 'Web format',
      icon: (isSelected) => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 8L3 12L7 16" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M17 8L21 12L17 16" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M14 4L10 20" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="2" y="4" width="20" height="16" rx="2" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5"/>
        </svg>
      )
    },
    { 
      id: 'csv', 
      name: 'CSV', 
      description: 'Raw data',
      icon: (isSelected) => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 4H16L20 8V20H4V4H8Z" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 12H8M16 12H14M12 16H8M16 16H14" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 4V8H4" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="16.5" cy="8.5" r="1.5" fill={isSelected ? "#00E5FF" : "#4B5563"}/>
        </svg>
      )
    },
    { 
      id: 'json', 
      name: 'JSON', 
      description: 'API format',
      icon: (isSelected) => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 6C7 6 3 8 3 12C3 16 7 18 7 18" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M17 6C17 6 21 8 21 12C21 16 17 18 17 18" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="9" y="8" width="6" height="8" rx="1" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5"/>
          <path d="M10 11H14" stroke={isSelected ? "#00E5FF" : "#4B5563"} strokeWidth="1.5"/>
        </svg>
      )
    },
  ];

  if (!expanded) {
    return (
      <button className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-lg bg-white/5 hover:bg-[#00E5FF]/10 text-white/60 hover:text-[#00E5FF] transition-colors duration-150 text-[10px] font-['Poppins']">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Export</span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 font-['Poppins']">
      <h3 className="text-white font-['Poppins'] text-[11px] font-bold mb-4 flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-[#00E5FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export Options
      </h3>
      
      {/* Format Selection */}
      <div className="mb-4">
        <label className="block text-white/50 text-[9px] font-['Poppins'] font-semibold mb-2">
          Format
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-2 rounded-lg border transition-colors duration-150 text-left
                ${selectedFormat === format.id
                  ? 'border-[#00E5FF] bg-[#00E5FF]/10'
                  : 'border-white/10 hover:border-[#00E5FF]/30 bg-white/5'
                }`}
            >
              <div className="flex items-center gap-2">
                <div>
                  {format.icon(selectedFormat === format.id)}
                </div>
                <div>
                  <div className={`text-[10px] font-['Poppins'] font-bold ${selectedFormat === format.id ? 'text-[#00E5FF]' : 'text-white/70'}`}>
                    {format.name}
                  </div>
                  <div className="text-white/30 text-[7px] font-['Poppins']">{format.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-white/50 text-[9px] font-['Poppins'] font-semibold mb-2">
            Content Options
          </label>
          <div className="space-y-1">
            <label className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors duration-150">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="w-3.5 h-3.5 border border-white/20 bg-transparent text-[#00E5FF] rounded"
              />
              <span className="text-white/70 text-[9px] font-['Poppins'] font-medium flex items-center gap-1">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4V20H20" />
                  <path d="M8 16V12M12 16V8M16 16V10" />
                </svg>
                Include Charts
              </span>
            </label>
            <label className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors duration-150">
              <input
                type="checkbox"
                checked={includeTables}
                onChange={(e) => setIncludeTables(e.target.checked)}
                className="w-3.5 h-3.5 border border-white/20 bg-transparent text-[#00E5FF] rounded"
              />
              <span className="text-white/70 text-[9px] font-['Poppins'] font-medium flex items-center gap-1">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4H20V20H4V4Z" />
                  <path d="M4 10H20M10 4V20" />
                </svg>
                Include Tables
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-white/50 text-[9px] font-['Poppins'] font-semibold mb-2">
            Page Setup
          </label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-[10px] font-['Poppins'] focus:outline-none focus:border-[#00E5FF]/50 transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300E5FF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '0.75rem'
            }}
          >
            <option value="a4" className="bg-[#0a0a0a]">A4</option>
            <option value="letter" className="bg-[#0a0a0a]">Letter</option>
            <option value="legal" className="bg-[#0a0a0a]">Legal</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-white/10">
        <button className="flex-1 px-3 py-2 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-lg hover:opacity-90 transition-opacity duration-150 text-[10px] font-['Poppins'] flex items-center justify-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Now
        </button>
        <button className="px-3 py-2 border border-white/10 rounded-lg text-white/60 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition-colors duration-150 text-[10px] font-['Poppins'] flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7V12L15 15" />
          </svg>
          Schedule
        </button>
      </div>
    </div>
  );
};

export default ExportOptions;