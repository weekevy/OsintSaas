import { useState } from 'react';
import Modal from '../common/Modal';

const ReportGenerator = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    template: 'threat-intel',
    format: 'pdf',
    dateRange: '30d',
    sections: ['summary', 'findings', 'iocs', 'recommendations'],
    recipients: [],
    schedule: 'now'
  });

  const templates = [
    { 
      id: 'threat-intel', 
      name: 'Threat Intelligence Report', 
      icon: (isSelected) => (
        <svg className={`w-7 h-7 mb-2 ${isSelected ? 'text-[#00E5FF]' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L5 6c0 5.25 2 10 7 11 5-1 7-5.75 7-11l-7-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01" />
        </svg>
      )
    },
    { 
      id: 'incident', 
      name: 'Incident Investigation', 
      icon: (isSelected) => (
        <svg className={`w-7 h-7 mb-2 ${isSelected ? 'text-[#00E5FF]' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
        </svg>
      )
    },
    { 
      id: 'executive', 
      name: 'Executive Summary', 
      icon: (isSelected) => (
        <svg className={`w-7 h-7 mb-2 ${isSelected ? 'text-[#00E5FF]' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8M8 12h8M8 16h4" />
        </svg>
      )
    },
    { 
      id: 'technical', 
      name: 'Technical Analysis', 
      icon: (isSelected) => (
        <svg className={`w-7 h-7 mb-2 ${isSelected ? 'text-[#00E5FF]' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
      )
    },
  ];

  const sections = [
    { id: 'summary', name: 'Executive Summary' },
    { id: 'methodology', name: 'Methodology' },
    { id: 'findings', name: 'Key Findings' },
    { id: 'iocs', name: 'Indicators of Compromise' },
    { id: 'timeline', name: 'Attack Timeline' },
    { id: 'recommendations', name: 'Recommendations' },
    { id: 'appendix', name: 'Appendix' },
  ];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleGenerate = () => handleClose();

  const toggleSection = (sectionId) => {
    if (formData.sections.includes(sectionId)) {
      setFormData({ ...formData, sections: formData.sections.filter(id => id !== sectionId) });
    } else {
      setFormData({ ...formData, sections: [...formData.sections, sectionId] });
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      name: '',
      template: 'threat-intel',
      format: 'pdf',
      dateRange: '30d',
      sections: ['summary', 'findings', 'iocs', 'recommendations'],
      recipients: [],
      schedule: 'now'
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Generate Report" size="lg">
      <div className="space-y-5 font-['Poppins']">
        {/* Progress Steps - Simplified */}
        <div className="rounded-xl bg-[#0a0a0a] border border-white/10 p-3">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className={`flex flex-col items-center ${i < 3 ? 'flex-1' : ''}`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-['Poppins'] font-bold
                    ${step >= i 
                      ? 'border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF]' 
                      : 'border-white/20 text-white/40'
                    }`}
                  >
                    {step > i ? '✓' : i}
                  </div>
                  <span className="text-[7px] font-['Poppins'] font-bold mt-1 text-white/40">
                    {i === 1 && 'Template'}
                    {i === 2 && 'Content'}
                    {i === 3 && 'Format'}
                  </span>
                </div>
                {i < 3 && (
                  <div className={`h-[1px] flex-1 mx-2 ${step > i ? 'bg-[#00E5FF]/40' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Template Selection */}
        {step === 1 && (
          <div className="space-y-3">
            <label className="block text-white/50 text-[9px] font-['Poppins'] font-semibold">
              Select Report Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setFormData({ ...formData, template: template.id })}
                  className={`p-3 rounded-xl border transition-colors duration-150 text-left
                    ${formData.template === template.id
                      ? 'border-[#00E5FF] bg-[#00E5FF]/10'
                      : 'border-white/10 hover:border-[#00E5FF]/30 bg-white/5'
                    }`}
                >
                  {template.icon(formData.template === template.id)}
                  <span className={`text-[10px] font-['Poppins'] font-bold ${formData.template === template.id ? 'text-[#00E5FF]' : 'text-white/70'}`}>
                    {template.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Content Selection */}
        {step === 2 && (
          <div className="space-y-3">
            <label className="block text-white/50 text-[9px] font-['Poppins'] font-semibold">
              Report Sections
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {sections.map((section) => (
                <label key={section.id} className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors duration-150">
                  <input
                    type="checkbox"
                    checked={formData.sections.includes(section.id)}
                    onChange={() => toggleSection(section.id)}
                    className="w-3.5 h-3.5 border border-white/20 bg-transparent text-[#00E5FF] rounded"
                  />
                  <span className="text-white/70 text-[9px] font-['Poppins'] font-medium">{section.name}</span>
                </label>
              ))}
            </div>
            
            <div className="mt-3">
              <label className="block text-white/50 text-[9px] font-['Poppins'] font-semibold mb-1">
                Date Range
              </label>
              <select
                value={formData.dateRange}
                onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-[10px] font-['Poppins'] focus:outline-none focus:border-[#00E5FF]/50 transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300E5FF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '0.75rem'
                }}
              >
                <option value="24h" className="bg-[#0a0a0a]">Last 24 Hours</option>
                <option value="7d" className="bg-[#0a0a0a]">Last 7 Days</option>
                <option value="30d" className="bg-[#0a0a0a]">Last 30 Days</option>
                <option value="90d" className="bg-[#0a0a0a]">Last 90 Days</option>
                <option value="custom" className="bg-[#0a0a0a]">Custom Range</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Format Selection */}
        {step === 3 && (
          <div className="space-y-3">
            <label className="block text-white/50 text-[9px] font-['Poppins'] font-semibold">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pdf', name: 'PDF' },
                { id: 'docx', name: 'DOCX' },
                { id: 'html', name: 'HTML' },
                { id: 'csv', name: 'CSV' },
                { id: 'json', name: 'JSON' },
                { id: 'txt', name: 'TXT' },
              ].map((format) => (
                <button
                  key={format.id}
                  onClick={() => setFormData({ ...formData, format: format.id })}
                  className={`p-2 rounded-lg border transition-colors duration-150 text-center
                    ${formData.format === format.id
                      ? 'border-[#00E5FF] bg-[#00E5FF]/10'
                      : 'border-white/10 hover:border-[#00E5FF]/30 bg-white/5'
                    }`}
                >
                  <svg className={`w-6 h-6 mx-auto mb-1 ${formData.format === format.id ? 'text-[#00E5FF]' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    {format.id === 'pdf' && (
                      <>
                        <path d="M4 4H20V20H4V4Z" strokeLinecap="round"/>
                        <path d="M8 8H16V10H8V8Z" fill="currentColor"/>
                        <path d="M8 12H16V14H8V12Z" fill="currentColor"/>
                        <path d="M8 16H13V18H8V16Z" fill="currentColor"/>
                      </>
                    )}
                    {format.id === 'docx' && (
                      <>
                        <path d="M4 4H16L20 8V20H4V4Z" strokeLinecap="round"/>
                        <path d="M12 12H8M16 8H8M16 12H14M16 16H8" strokeLinecap="round"/>
                        <path d="M16 4V8H20" strokeLinecap="round"/>
                      </>
                    )}
                    {format.id === 'html' && (
                      <>
                        <path d="M7 8L3 12L7 16" strokeLinecap="round"/>
                        <path d="M17 8L21 12L17 16" strokeLinecap="round"/>
                        <path d="M14 4L10 20" strokeLinecap="round"/>
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                      </>
                    )}
                    {format.id === 'csv' && (
                      <>
                        <path d="M8 4H16L20 8V20H4V4H8Z" strokeLinecap="round"/>
                        <path d="M12 12H8M16 12H14M12 16H8M16 16H14" strokeLinecap="round"/>
                        <path d="M8 4V8H4" strokeLinecap="round"/>
                        <circle cx="16.5" cy="8.5" r="1.5" fill="currentColor"/>
                      </>
                    )}
                    {format.id === 'json' && (
                      <>
                        <path d="M7 6C7 6 3 8 3 12C3 16 7 18 7 18" strokeLinecap="round"/>
                        <path d="M17 6C17 6 21 8 21 12C21 16 17 18 17 18" strokeLinecap="round"/>
                        <rect x="9" y="8" width="6" height="8" rx="1" />
                        <path d="M10 11H14" strokeLinecap="round"/>
                      </>
                    )}
                    {format.id === 'txt' && (
                      <>
                        <path d="M4 4H20V20H4V4Z" strokeLinecap="round"/>
                        <path d="M8 8H16V10H8V8Z" fill="currentColor"/>
                        <path d="M8 12H16V14H8V12Z" fill="currentColor"/>
                        <path d="M8 16H12V18H8V16Z" fill="currentColor"/>
                      </>
                    )}
                  </svg>
                  <span className={`text-[9px] font-['Poppins'] font-bold ${formData.format === format.id ? 'text-[#00E5FF]' : 'text-white/60'}`}>
                    {format.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-2 pt-4 border-t border-white/10">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-white/10 rounded-lg text-white/60 hover:text-white hover:border-white/20 transition-colors duration-150 text-[10px] font-['Poppins']"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-white/10 rounded-lg text-white/60 hover:text-white hover:border-white/20 transition-colors duration-150 text-[10px] font-['Poppins']"
          >
            Cancel
          </button>
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-lg hover:opacity-90 transition-opacity duration-150 text-[10px] font-['Poppins']"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="px-5 py-2 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-lg hover:opacity-90 transition-opacity duration-150 text-[10px] font-['Poppins']"
            >
              Generate Report
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReportGenerator;