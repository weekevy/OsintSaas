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
    { id: 'threat-intel', name: 'Threat Intelligence' },
    { id: 'incident', name: 'Incident Investigation' },
    { id: 'executive', name: 'Executive Summary' },
    { id: 'technical', name: 'Technical Analysis' },
  ];

  const sections = [
    { id: 'summary', name: 'Executive Summary' },
    { id: 'findings', name: 'Key Findings' },
    { id: 'iocs', name: 'Indicators of Compromise' },
    { id: 'recommendations', name: 'Recommendations' },
    { id: 'methodology', name: 'Methodology' },
    { id: 'timeline', name: 'Attack Timeline' },
    { id: 'appendix', name: 'Appendix' },
  ];

  const formats = ['PDF', 'DOCX', 'HTML', 'CSV', 'JSON'];

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
      <div className="space-y-5">
        {/* Simple Steps Indicator */}
        <div className="flex items-center justify-between">
          {['Template', 'Content', 'Format'].map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium backdrop-blur-sm
                  ${step >= i + 1 
                    ? 'bg-[#00E5FF] text-black' 
                    : 'bg-white/10 text-white/40'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-[9px] mt-1 text-white/40">{label}</span>
              </div>
              {i < 2 && (
                <div className={`h-px flex-1 mx-3 ${step > i + 1 ? 'bg-[#00E5FF]' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Template Selection */}
        {step === 1 && (
          <div className="space-y-3">
            <label className="block text-white/50 text-xs">Template</label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setFormData({ ...formData, template: template.id })}
                  className={`p-3 rounded-lg text-left text-sm backdrop-blur-sm
                    ${formData.template === template.id
                      ? 'bg-[#00E5FF]/20 text-[#00E5FF]'
                      : 'bg-white/5 text-white/70'
                    }`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Content Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs mb-2">Sections to Include</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {sections.map((section) => (
                  <label key={section.id} className="flex items-center gap-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={formData.sections.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                      className="w-3.5 h-3.5 border border-white/20 bg-transparent text-[#00E5FF] rounded"
                    />
                    <span className="text-white/70 text-xs">{section.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-white/50 text-xs mb-2">Date Range</label>
              <select
                value={formData.dateRange}
                onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg text-white text-xs appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300E5FF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '0.75rem'
                }}
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Format Selection */}
        {step === 3 && (
          <div className="space-y-3">
            <label className="block text-white/50 text-xs">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              {formats.map((format) => (
                <button
                  key={format}
                  onClick={() => setFormData({ ...formData, format: format.toLowerCase() })}
                  className={`p-2 rounded-lg text-center text-xs py-3 backdrop-blur-sm
                    ${formData.format === format.toLowerCase()
                      ? 'bg-[#00E5FF]/20 text-[#00E5FF]'
                      : 'bg-white/5 text-white/60'
                    }`}
                >
                  {format}
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
              className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-lg text-white/60 text-xs"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-lg text-white/60 text-xs"
          >
            Cancel
          </button>
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-[#00E5FF] text-black font-medium rounded-lg text-xs"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="px-5 py-2 bg-[#00E5FF] text-black font-medium rounded-lg text-xs"
            >
              Generate
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReportGenerator;