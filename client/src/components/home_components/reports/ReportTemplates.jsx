import { useState } from 'react';

const ReportTemplates = () => {
  const templates = [
    {
      id: 1,
      name: 'Executive Summary',
      description: 'High-level overview for stakeholders and non-technical management.',
      icon: (
        <svg className="w-6 h-6 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-[#00E5FF]/10',
      borderColor: 'border-[#00E5FF]/20'
    },
    {
      id: 2,
      name: 'Technical Analysis',
      description: 'Detailed breakdown of vulnerabilities, assets, and technical findings.',
      icon: (
        <svg className="w-6 h-6 text-[#2DD4BF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      color: 'bg-[#2DD4BF]/10',
      borderColor: 'border-[#2DD4BF]/20'
    },
    {
      id: 3,
      name: 'Threat Intelligence',
      description: 'Strategic analysis of adversaries, TTPs, and infrastructure.',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      id: 4,
      name: 'Compliance Audit',
      description: 'Standardized reporting for regulatory requirements and standards.',
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-[10px] lg:text-[11px] font-bold text-[#00E5FF] tracking-wider uppercase font-sans">available templates</h3>
          <p className="text-white/40 text-[9px] uppercase tracking-widest mt-1">Pre-configured dossier structures</p>
        </div>
        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 text-[10px] font-bold tracking-widest hover:bg-white/10 transition-all uppercase">
          Import Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`p-6 rounded-[24px] glass-card border border-white/5 hover:border-[#00E5FF]/30 transition-all group cursor-pointer`}
          >
            <div className="flex items-start gap-5">
              <div className={`w-14 h-14 rounded-2xl ${template.color} border ${template.borderColor} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                {template.icon}
              </div>
              <div>
                <h4 className="text-white font-bold text-base mb-1 group-hover:text-[#00E5FF] transition-colors">{template.name}</h4>
                <p className="text-white/40 text-xs leading-relaxed">{template.description}</p>
                
                <div className="flex items-center gap-4 mt-4">
                   <button className="text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.2em] hover:underline">Preview</button>
                   <button className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] hover:text-white transition-colors">Customize</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportTemplates;