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
      description: 'Best for printing and sharing',
      icon: (isSelected) => (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pdfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <path d="M4 4H20V20H4V4Z" stroke={isSelected ? "url(#pdfGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8H16V10H8V8Z" fill={isSelected ? "url(#pdfGradient)" : "#9CA3AF"} stroke={isSelected ? "url(#pdfGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 12H16V14H8V12Z" fill={isSelected ? "url(#pdfGradient)" : "#9CA3AF"} stroke={isSelected ? "url(#pdfGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 16H13V18H8V16Z" fill={isSelected ? "url(#pdfGradient)" : "#9CA3AF"} stroke={isSelected ? "url(#pdfGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'docx', 
      name: 'Word Document', 
      description: 'Editable document format',
      icon: (isSelected) => (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="docxGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <path d="M4 4H16L20 8V20H4V4Z" stroke={isSelected ? "url(#docxGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 12H8M16 8H8M16 12H14M16 16H8" stroke={isSelected ? "url(#docxGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 4V8H20" stroke={isSelected ? "url(#docxGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'html', 
      name: 'HTML', 
      description: 'Web page format',
      icon: (isSelected) => (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="htmlGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <path d="M7 8L3 12L7 16" stroke={isSelected ? "url(#htmlGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 8L21 12L17 16" stroke={isSelected ? "url(#htmlGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 4L10 20" stroke={isSelected ? "url(#htmlGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="2" y="4" width="20" height="16" rx="2" stroke={isSelected ? "url(#htmlGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'csv', 
      name: 'CSV', 
      description: 'Raw data export',
      icon: (isSelected) => (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="csvGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <path d="M8 4H16L20 8V20H4V4H8Z" stroke={isSelected ? "url(#csvGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 12H8M16 12H14M12 16H8M16 16H14" stroke={isSelected ? "url(#csvGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 4V8H4" stroke={isSelected ? "url(#csvGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="16.5" cy="8.5" r="1.5" fill={isSelected ? "url(#csvGradient)" : "#9CA3AF"}/>
        </svg>
      )
    },
    { 
      id: 'json', 
      name: 'JSON', 
      description: 'API format',
      icon: (isSelected) => (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="jsonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <path d="M7 6C7 6 3 8 3 12C3 16 7 18 7 18" stroke={isSelected ? "url(#jsonGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 6C17 6 21 8 21 12C21 16 17 18 17 18" stroke={isSelected ? "url(#jsonGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="9" y="8" width="6" height="8" rx="1" stroke={isSelected ? "url(#jsonGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 11H14" stroke={isSelected ? "url(#jsonGradient)" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
  ];

  if (!expanded) {
    return (
      <button className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-white hover:from-purple-500 hover:to-blue-500 hover:text-white rounded-lg transition-all flex items-center gap-2 group border border-purple-500/20 hover:border-transparent">
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform text-purple-400 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <defs>
            <linearGradient id="exportGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent group-hover:text-white">Export</span>
      </button>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-2xl p-6 border border-purple-500/20">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="url(#headerGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Export Options</span>
      </h3>
      
      <div>
        <label className="block text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="formatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="url(#formatGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 10H16M8 14H12" stroke="url(#formatGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Format</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left group hover:scale-105 backdrop-blur-xl
                ${selectedFormat === format.id
                  ? 'border-purple-500 bg-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-lg shadow-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`transition-all ${selectedFormat === format.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {format.icon(selectedFormat === format.id)}
                </div>
                <div>
                  <div className={`font-medium ${selectedFormat === format.id ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                    {format.name}
                  </div>
                  <div className="text-white/40 text-xs group-hover:text-white/60">{format.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="contentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="url(#contentGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 10H16M8 14H12" stroke="url(#contentGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Content Options</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 cursor-pointer group border border-transparent hover:border-purple-500/20 transition-all">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="w-4 h-4 rounded border-purple-500/30 bg-white/5 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-white/80 group-hover:text-white transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                  <path d="M4 4V20H20" stroke="url(#chartGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 16V12M12 16V8M16 16V10" stroke="url(#chartGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Include charts and graphs
              </span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 cursor-pointer group border border-transparent hover:border-purple-500/20 transition-all">
              <input
                type="checkbox"
                checked={includeTables}
                onChange={(e) => setIncludeTables(e.target.checked)}
                className="w-4 h-4 rounded border-purple-500/30 bg-white/5 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-white/80 group-hover:text-white transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="tableGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                  <path d="M4 4H20V20H4V4Z" stroke="url(#tableGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 10H20M10 4V20" stroke="url(#tableGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Include data tables
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="pageGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <path d="M3 7H21M5 7V19H19V7" stroke="url(#pageGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="6" y="10" width="4" height="4" rx="1" stroke="url(#pageGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="14" y="10" width="4" height="4" rx="1" stroke="url(#pageGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Page Setup</span>
          </label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none cursor-pointer backdrop-blur-xl"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238B5CF6'%3E%3Cdefs%3E%3ClinearGradient id='arrowGradient' x1='0%25' y1='0%25' x2='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%238B5CF6'%3E%3C/stop%3E%3Cstop offset='100%25' stop-color='%233B82F6'%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath stroke='url(%23arrowGradient)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1.5rem'
            }}
          >
            <option value="a4" className="bg-gray-900 text-purple-400">A4</option>
            <option value="letter" className="bg-gray-900 text-purple-400">Letter</option>
            <option value="legal" className="bg-gray-900 text-purple-400">Legal</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-purple-500/20">
        <button className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 group relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export Now
        </button>
        <button className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all flex items-center gap-2 group border border-purple-500/30 hover:border-transparent">
          <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 7V12L15 15" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Schedule
        </button>
      </div>
    </div>
  );
};

export default ExportOptions;
