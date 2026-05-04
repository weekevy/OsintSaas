import React from 'react';

// Icon mapping function - Cyan theme
const getSectionIcon = (iconName, colorClass) => {
  const icons = {
    briefcase: (
      <svg className={`w-4 h-4 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    'building-office': (
      <svg className={`w-4 h-4 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    user: (
      <svg className={`w-4 h-4 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    'chat-bubble': (
      <svg className={`w-4 h-4 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    document: (
      <svg className={`w-4 h-4 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    history: (
      <svg className={`w-4 h-4 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    academic: (
      <svg className={`w-4 h-4 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    contact: (
      <svg className={`w-4 h-4 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    network: (
      <svg className={`w-4 h-4 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    activity: (
      <svg className={`w-4 h-4 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    shield: (
      <svg className={`w-4 h-4 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L5 6c0 5.25 2 10 7 11 5-1 7-5.75 7-11l-7-3z" />
      </svg>
    )
  };
  return icons[iconName] || null;
};

// Input Field - Clean Poppins
export const InputField = ({ id, label, value, onChange, placeholder, type = 'text', required, help, error }) => (
  <div className="space-y-1.5">
    <label className="block font-['Poppins'] text-[11px] font-semibold text-white/60 uppercase tracking-[0.08em]">
      {label}
      {required && <span className="text-[#00E5FF] ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(id, e.target.value)}
      className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-white font-['Poppins'] text-sm placeholder-white/20 focus:outline-none transition-colors duration-150 ${
        error ? 'border-[#f87171]' : 'border-white/10 focus:border-[#00E5FF]/50'
      }`}
      placeholder={placeholder}
    />
    {help && <p className="font-['Poppins'] text-[10px] text-white/30 mt-1">{help}</p>}
    {error && <p className="font-['Poppins'] text-[10px] text-[#f87171] mt-1">{error}</p>}
  </div>
);

// Textarea Field - Clean Poppins
export const TextareaField = ({ id, label, value, onChange, placeholder, rows = 3, required, help, error }) => (
  <div className="space-y-1.5">
    <label className="block font-['Poppins'] text-[11px] font-semibold text-white/60 uppercase tracking-[0.08em]">
      {label}
      {required && <span className="text-[#00E5FF] ml-1">*</span>}
    </label>
    <textarea
      value={value || ''}
      onChange={(e) => onChange(id, e.target.value)}
      className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-white font-['Poppins'] text-sm placeholder-white/20 focus:outline-none transition-colors duration-150 resize-vertical ${
        error ? 'border-[#f87171]' : 'border-white/10 focus:border-[#00E5FF]/50'
      }`}
      placeholder={placeholder}
      rows={rows}
    />
    {help && <p className="font-['Poppins'] text-[10px] text-white/30 mt-1">{help}</p>}
    {error && <p className="font-['Poppins'] text-[10px] text-[#f87171] mt-1">{error}</p>}
  </div>
);

// Select Field - Clean Poppins
export const SelectField = ({ id, label, value, onChange, options, required, help, error }) => (
  <div className="space-y-1.5">
    <label className="block font-['Poppins'] text-[11px] font-semibold text-white/60 uppercase tracking-[0.08em]">
      {label}
      {required && <span className="text-[#00E5FF] ml-1">*</span>}
    </label>
    <select
      value={value || ''}
      onChange={(e) => onChange(id, e.target.value)}
      className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-white font-['Poppins'] text-sm focus:outline-none transition-colors duration-150 appearance-none cursor-pointer ${
        error ? 'border-[#f87171]' : 'border-white/10 focus:border-[#00E5FF]/50'
      }`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        backgroundSize: '14px'
      }}
    >
      <option value="" className="bg-[#0a0a0a]">Select {label}</option>
      {options?.map(opt => <option key={opt} value={opt} className="bg-[#0a0a0a]">{opt}</option>)}
    </select>
    {help && <p className="font-['Poppins'] text-[10px] text-white/30 mt-1">{help}</p>}
    {error && <p className="font-['Poppins'] text-[10px] text-[#f87171] mt-1">{error}</p>}
  </div>
);

// File Upload Field - Clean Poppins
export const FileUploadField = ({ id, label, files, onFileChange, onFileRemove, isDragging, onDragEvents, help, error }) => (
  <div className="space-y-1.5">
    <label className="block font-['Poppins'] text-[11px] font-semibold text-white/60 uppercase tracking-[0.08em]">{label}</label>
    <div 
      onClick={() => onDragEvents.fileInputRef.current?.click()}
      onDragEnter={onDragEvents.handleDragEnter}
      onDragLeave={onDragEvents.handleDragLeave}
      onDragOver={onDragEvents.handleDragOver}
      onDrop={onDragEvents.handleDrop}
      className={`w-full px-4 py-6 bg-white/5 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 text-center ${
        isDragging ? 'border-[#00E5FF] bg-[#00E5FF]/5' : 'border-white/20 hover:border-[#00E5FF]/50 hover:bg-white/5'
      }`}
    >
      <svg className="w-8 h-8 mx-auto text-white/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p className="font-['Poppins'] text-white/50 text-[10px] font-semibold uppercase tracking-[0.1em] mb-1">
        {isDragging ? 'DROP FILES HERE' : 'CLICK OR DRAG FILES TO UPLOAD'}
      </p>
      <p className="font-['Poppins'] text-white/25 text-[8px] uppercase tracking-[0.08em]">
        SUPPORTED: JPEG, PNG, GIF, PDF, DOC, TXT, EML, MSG (MAX 10MB)
      </p>
      <input
        ref={onDragEvents.fileInputRef}
        type="file"
        multiple
        onChange={onFileChange}
        className="hidden"
      />
    </div>
    {help && <p className="font-['Poppins'] text-[10px] text-white/30 mt-1">{help}</p>}
    {error && <p className="font-['Poppins'] text-[10px] text-[#f87171] mt-1">{error}</p>}
    
    {files.length > 0 && (
      <div className="mt-3 space-y-1 max-h-32 overflow-y-auto custom-scroll">
        {files.map((file, idx) => (
          <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <span className="font-['Poppins'] text-white/60 text-[11px] truncate flex-1">{file.name}</span>
            <button onClick={() => onFileRemove(idx)} className="text-[#f87171] hover:text-[#f87171]/80 transition-colors duration-150 text-[12px] ml-2">✕</button>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Section Component - Clean headers
export const Section = ({ title, description, iconName, iconColor, children }) => (
  <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a] mb-5">
    <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
      <div className="flex items-center gap-2">
        {iconName && getSectionIcon(iconName, iconColor || 'text-[#00E5FF]')}
        <h3 className="font-['Poppins'] text-[13px] font-bold text-white uppercase tracking-[0.08em]">{title}</h3>
      </div>
      {description && (
        <p className="font-['Poppins'] text-[10px] text-white/40 mt-1">{description}</p>
      )}
    </div>
    <div className="p-4 space-y-4">
      {children}
    </div>
  </div>
);

// Custom scrollbar styles
export const scrollbarStyles = `
  .custom-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.3);
    border-radius: 4px;
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 229, 255, 0.5);
  }
`;