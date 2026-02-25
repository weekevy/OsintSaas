import React from 'react';

const FancyCheckbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all group">
    <div className="relative">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
        checked ? 'bg-gradient-to-r from-purple-500 to-blue-500 border-transparent' : 'bg-white/5 border-white/20 group-hover:border-white/40'
      }`}>
        {checked && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </div>
    </div>
    <span className="text-white/80 text-sm capitalize group-hover:text-white transition-colors">{label}</span>
  </label>
);

export default FancyCheckbox;
