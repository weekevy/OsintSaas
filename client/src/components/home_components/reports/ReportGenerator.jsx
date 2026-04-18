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
    { id: 'threat-intel', name: 'THREAT INTELLIGENCE REPORT', icon: '🛡️' },
    { id: 'incident', name: 'INCIDENT INVESTIGATION', icon: '🔍' },
    { id: 'executive', name: 'EXECUTIVE SUMMARY', icon: '📊' },
    { id: 'technical', name: 'TECHNICAL ANALYSIS', icon: '⚙️' },
  ];

  const sections = [
    { id: 'summary', name: 'EXECUTIVE SUMMARY' },
    { id: 'methodology', name: 'METHODOLOGY' },
    { id: 'findings', name: 'KEY FINDINGS' },
    { id: 'iocs', name: 'INDICATORS OF COMPROMISE' },
    { id: 'timeline', name: 'ATTACK TIMELINE' },
    { id: 'recommendations', name: 'RECOMMENDATIONS' },
    { id: 'appendix', name: 'APPENDIX' },
  ];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleGenerate = () => {
    handleClose();
  };

  const toggleSection = (sectionId) => {
    if (formData.sections.includes(sectionId)) {
      setFormData({
        ...formData,
        sections: formData.sections.filter(id => id !== sectionId)
      });
    } else {
      setFormData({
        ...formData,
        sections: [...formData.sections, sectionId]
      });
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
    <Modal isOpen={isOpen} onClose={handleClose} title="GENERATE REPORT" size="lg">
      <div className="space-y-5">
        {/* Progress Steps - Tactical */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`flex flex-col items-center ${i < 4 ? 'flex-1' : ''}`}>
                <div className={`w-7 h-7 border flex items-center justify-center text-[10px] font-mono font-bold
                  ${step >= i 
                    ? 'border-[#00ff88] text-[#00ff88]' 
                    : 'border-white/20 text-white/40'
                  }`}
                >
                  {step > i ? '✓' : i}
                </div>
                <span className="text-[7px] font-mono uppercase tracking-[0.12em] mt-1 text-white/40">
                  {i === 1 && 'TEMPLATE'}
                  {i === 2 && 'CONTENT'}
                  {i === 3 && 'FORMAT'}
                  {i === 4 && 'SCHEDULE'}
                </span>
              </div>
              {i < 4 && (
                <div className={`h-[1px] flex-1 mx-2 ${
                  step > i ? 'bg-[#00ff88]/50' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Template Selection - Tactical */}
        {step === 1 && (
          <div className="space-y-3">
            <label className="block text-white/40 text-[8px] font-mono uppercase tracking-[0.12em] mb-1">
              SELECT REPORT TEMPLATE
            </label>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setFormData({ ...formData, template: template.id })}
                  className={`p-3 border transition-all text-left
                    ${formData.template === template.id
                      ? 'border-[#00ff88] bg-[#00ff88]/5'
                      : 'border-white/10 hover:border-white/20'
                    }`}
                >
                  <span className="text-xl mb-1 block">{template.icon}</span>
                  <span className="text-[9px] font-mono font-bold text-white uppercase tracking-[0.08em]">{template.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Content Selection - Tactical */}
        {step === 2 && (
          <div className="space-y-3">
            <label className="block text-white/40 text-[8px] font-mono uppercase tracking-[0.12em] mb-1">
              REPORT SECTIONS
            </label>
            <div className="space-y-1">
              {sections.map((section) => (
                <label key={section.id} className="flex items-center gap-3 p-2 cursor-pointer border border-transparent hover:border-[#00ff88]/20 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.sections.includes(section.id)}
                    onChange={() => toggleSection(section.id)}
                    className="w-3.5 h-3.5 border border-white/20 bg-transparent text-[#00ff88] focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-white/60 hover:text-white text-[9px] font-mono uppercase tracking-[0.08em]">{section.name}</span>
                </label>
              ))}
            </div>
            
            <div className="mt-3">
              <label className="block text-white/40 text-[8px] font-mono uppercase tracking-[0.12em] mb-1">
                DATE RANGE
              </label>
              <select
                value={formData.dateRange}
                onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1114] border border-white/10 text-white text-[9px] font-mono uppercase tracking-[0.08em] focus:outline-none focus:border-[#00ff88]/50 transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300ff88'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '0.75rem'
                }}
              >
                <option value="24h" className="bg-[#0d1114]">LAST 24 HOURS</option>
                <option value="7d" className="bg-[#0d1114]">LAST 7 DAYS</option>
                <option value="30d" className="bg-[#0d1114]">LAST 30 DAYS</option>
                <option value="90d" className="bg-[#0d1114]">LAST 90 DAYS</option>
                <option value="custom" className="bg-[#0d1114]">CUSTOM RANGE</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Format Selection - Tactical */}
        {step === 3 && (
          <div className="space-y-3">
            <label className="block text-white/40 text-[8px] font-mono uppercase tracking-[0.12em] mb-1">
              EXPORT FORMAT
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pdf', name: 'PDF', icon: '📄', description: 'DOCUMENT' },
                { id: 'docx', name: 'DOCX', icon: '📝', description: 'WORD' },
                { id: 'html', name: 'HTML', icon: '🌐', description: 'WEB' },
                { id: 'csv', name: 'CSV', icon: '📊', description: 'DATA' },
                { id: 'json', name: 'JSON', icon: '🔧', description: 'API' },
                { id: 'txt', name: 'TXT', icon: '📃', description: 'PLAIN' },
              ].map((format) => (
                <button
                  key={format.id}
                  onClick={() => setFormData({ ...formData, format: format.id })}
                  className={`p-2 border transition-all text-center
                    ${formData.format === format.id
                      ? 'border-[#00ff88] bg-[#00ff88]/5'
                      : 'border-white/10 hover:border-white/20'
                    }`}
                >
                  <span className="text-lg mb-0.5 block">{format.icon}</span>
                  <span className="text-white text-[8px] font-mono font-bold uppercase tracking-[0.08em] block">{format.name}</span>
                  <span className="text-white/30 text-[6px] font-mono uppercase tracking-[0.08em] mt-0.5 block">{format.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Schedule & Recipients - Tactical */}
        {step === 4 && (
          <div className="space-y-3">
            <div>
              <label className="block text-white/40 text-[8px] font-mono uppercase tracking-[0.12em] mb-1">
                SCHEDULE
              </label>
              <div className="space-y-1">
                {[
                  { id: 'now', label: 'GENERATE NOW' },
                  { id: 'later', label: 'SCHEDULE FOR LATER' },
                  { id: 'recurring', label: 'RECURRING REPORT' },
                ].map((option) => (
                  <label key={option.id} className="flex items-center gap-3 p-2 cursor-pointer border border-transparent hover:border-[#00ff88]/20 transition-all">
                    <input
                      type="radio"
                      name="schedule"
                      value={option.id}
                      checked={formData.schedule === option.id}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      className="w-3.5 h-3.5 border border-white/20 bg-transparent text-[#00ff88] focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-white/60 hover:text-white text-[9px] font-mono uppercase tracking-[0.08em]">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.schedule !== 'now' && (
              <div>
                <label className="block text-white/40 text-[8px] font-mono uppercase tracking-[0.12em] mb-1">
                  EMAIL RECIPIENTS
                </label>
                <input
                  type="text"
                  placeholder="ENTER EMAIL ADDRESSES (COMMA SEPARATED)"
                  className="w-full px-3 py-2 bg-[#0d1114] border border-white/10 text-white text-[9px] font-mono placeholder:text-white/20 focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                />
                <p className="text-white/30 text-[7px] font-mono uppercase tracking-[0.08em] mt-1">
                  SEPARATE MULTIPLE EMAILS WITH COMMAS
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons - Tactical */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-[9px] font-mono uppercase tracking-[0.08em]"
            >
              BACK
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-[9px] font-mono uppercase tracking-[0.08em]"
          >
            CANCEL
          </button>
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2 border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-[9px] font-mono uppercase tracking-[0.08em]"
            >
              NEXT
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="px-5 py-2 border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-[9px] font-mono uppercase tracking-[0.08em]"
            >
              GENERATE REPORT
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReportGenerator;