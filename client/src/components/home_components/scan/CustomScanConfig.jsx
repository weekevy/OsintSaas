import React from 'react';
import FancyCheckbox from './FancyCheckbox';
import { formatOptionLabel } from './utils/helpers';
import { investigationModules } from './utils/constants';

const CustomScanConfig = ({ 
  scanOptions, 
  toggleOption, 
  selectedProjectForScan, 
  searchInput,
  onStartCustomScan 
}) => {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Scan Configuration
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(scanOptions).map(([key, value]) => (
              <FancyCheckbox
                key={key}
                label={formatOptionLabel(key)}
                checked={value}
                onChange={() => toggleOption(key)}
              />
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Performance Settings
          </h3>
          
          <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
            <svg className="w-12 h-12 mx-auto text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233l3.277-3.277a2.543 2.543 0 10-3.594-3.594l-3.277 3.277m0 0L9.75 8.352" />
            </svg>
            <p className="text-white/40 text-sm">Performance settings coming soon</p>
            <p className="text-white/20 text-xs mt-1">API integration in progress</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
        <h3 className="text-white font-semibold mb-4">Scan Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Target</span>
            <span className="text-white font-medium">
              {selectedProjectForScan?.name || searchInput || 'Not selected'}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Configuration</span>
            <span className="text-white font-medium">
              {Object.values(scanOptions).filter(v => v === true).length} options
            </span>
          </div>

          <div className="border-t border-white/10 my-4" />

          <div className="text-center">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              {investigationModules.length}
            </div>
            <div className="text-white/40 text-xs">Modules Available</div>
          </div>

          <button 
            onClick={onStartCustomScan}
            className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium flex items-center justify-center gap-2 group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Custom Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomScanConfig;
