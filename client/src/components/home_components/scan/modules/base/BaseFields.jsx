import React from 'react';

// Icon mapping function - Tactical icons with acid green
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

// Input Field - Tactical
export const InputField = ({ id, label, value, onChange, placeholder, type = 'text', required, help, error }) => (
  <div>
    <label className="block text-white/50 text-[9px] font-mono uppercase tracking-[0.12em] mb-1">
      {label}
      {required && <span className="text-[#f87171] ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(id, e.target.value)}
      className={`w-full px-3 py-2 bg-[#0d1114] border text-white text-[12px] font-mono focus:outline-none transition-colors ${
        error ? 'border-[#f87171]' : 'border-white/10 focus:border-[#00ff88]/50'
      }`}
      placeholder={placeholder}
    />
    {help && <p className="text-white/30 text-[8px] font-mono mt-1 uppercase tracking-[0.08em]">{help}</p>}
    {error && <p className="text-[#f87171] text-[8px] font-mono mt-1">{error}</p>}
  </div>
);

// Textarea Field - Tactical
export const TextareaField = ({ id, label, value, onChange, placeholder, rows = 3, required, help, error }) => (
  <div>
    <label className="block text-white/50 text-[9px] font-mono uppercase tracking-[0.12em] mb-1">
      {label}
      {required && <span className="text-[#f87171] ml-1">*</span>}
    </label>
    <textarea
      value={value || ''}
      onChange={(e) => onChange(id, e.target.value)}
      className={`w-full px-3 py-2 bg-[#0d1114] border text-white text-[12px] font-mono focus:outline-none transition-colors resize-y ${
        error ? 'border-[#f87171]' : 'border-white/10 focus:border-[#00ff88]/50'
      }`}
      placeholder={placeholder}
      rows={rows}
    />
    {help && <p className="text-white/30 text-[8px] font-mono mt-1 uppercase tracking-[0.08em]">{help}</p>}
    {error && <p className="text-[#f87171] text-[8px] font-mono mt-1">{error}</p>}
  </div>
);

// Select Field - Tactical
export const SelectField = ({ id, label, value, onChange, options, required, help, error }) => (
  <div>
    <label className="block text-white/50 text-[9px] font-mono uppercase tracking-[0.12em] mb-1">
      {label}
      {required && <span className="text-[#f87171] ml-1">*</span>}
    </label>
    <select
      value={value || ''}
      onChange={(e) => onChange(id, e.target.value)}
      className={`w-full px-3 py-2 bg-[#0d1114] border text-white text-[12px] font-mono focus:outline-none transition-colors appearance-none cursor-pointer ${
        error ? 'border-[#f87171]' : 'border-white/10 focus:border-[#00ff88]/50'
      }`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        backgroundSize: '14px'
      }}
    >
      <option value="" className="bg-[#0d1114]">SELECT {label?.toUpperCase()}</option>
      {options?.map(opt => <option key={opt} value={opt} className="bg-[#0d1114]">{opt}</option>)}
    </select>
    {help && <p className="text-white/30 text-[8px] font-mono mt-1 uppercase tracking-[0.08em]">{help}</p>}
    {error && <p className="text-[#f87171] text-[8px] font-mono mt-1">{error}</p>}
  </div>
);

// File Upload Field - Tactical
export const FileUploadField = ({ id, label, files, onFileChange, onFileRemove, isDragging, onDragEvents, help, error }) => (
  <div>
    <label className="block text-white/50 text-[9px] font-mono uppercase tracking-[0.12em] mb-1">{label}</label>
    <div 
      onClick={() => onDragEvents.fileInputRef.current?.click()}
      onDragEnter={onDragEvents.handleDragEnter}
      onDragLeave={onDragEvents.handleDragLeave}
      onDragOver={onDragEvents.handleDragOver}
      onDrop={onDragEvents.handleDrop}
      className={`w-full px-4 py-6 bg-[#0d1114] border-2 border-dashed cursor-pointer transition-all text-center ${
        isDragging ? 'border-[#00ff88] bg-[#00ff88]/5' : 'border-white/20 hover:border-[#00ff88]/50 hover:bg-white/5'
      }`}
    >
      <svg className="w-8 h-8 mx-auto text-white/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p className="text-white/50 text-[9px] font-mono uppercase tracking-[0.08em] mb-1">{isDragging ? 'DROP FILES HERE' : 'CLICK OR DRAG FILES TO UPLOAD'}</p>
      <p className="text-white/25 text-[7px] font-mono uppercase tracking-[0.08em]">SUPPORTED: JPEG, PNG, GIF, PDF, DOC, TXT, EML, MSG (MAX 10MB)</p>
      <input
        ref={onDragEvents.fileInputRef}
        type="file"
        multiple
        onChange={onFileChange}
        className="hidden"
      />
    </div>
    {help && <p className="text-white/30 text-[8px] font-mono mt-1 uppercase tracking-[0.08em]">{help}</p>}
    {error && <p className="text-[#f87171] text-[8px] font-mono mt-1">{error}</p>}
    
    {files.length > 0 && (
      <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
        {files.map((file, idx) => (
          <div key={idx} className="flex items-center justify-between bg-[#0d1114] border border-white/10 px-3 py-1.5">
            <span className="text-white/60 text-[9px] font-mono truncate flex-1 uppercase tracking-[0.08em]">{file.name}</span>
            <button onClick={() => onFileRemove(idx)} className="text-[#f87171] hover:text-[#f87171]/80 text-[9px] font-mono ml-2">✕</button>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Section Component - Tactical
export const Section = ({ title, description, iconName, iconColor, children }) => (
  <div className="bg-[#090c0e] border border-white/10 overflow-hidden mb-5 relative">
    {/* Corner brackets */}
    <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-[#00ff88]/30" />
    <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-[#00ff88]/30" />
    
    <div className="px-4 py-2 border-b border-white/10 bg-gradient-to-r from-[#00ff88]/5 to-transparent">
      <div className="flex items-center gap-2">
        {iconName && getSectionIcon(iconName, iconColor || 'text-[#00ff88]')}
        <h3 className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em]">{title}</h3>
        {description && <p className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em] ml-2">{description}</p>}
      </div>
    </div>
    <div className="p-4 space-y-4">
      {children}
    </div>
  </div>
);