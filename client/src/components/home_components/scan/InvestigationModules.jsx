import React from 'react';
import { investigationModules, openSourcePlatforms } from './utils/constants';
import { getIcon } from './utils/icons';

const InvestigationModules = ({ onStartScan, selectedTarget }) => {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
          <h3 className="text-white font-semibold">Investigation Modules</h3>
          <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/40">{investigationModules.length} available</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {investigationModules.map((module) => (
            <button
              key={module.id}
              onClick={() => onStartScan(module, selectedTarget)}
              className="group relative bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-500 text-left overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              <div className="relative flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} bg-opacity-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                  {getIcon(module.icon)}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg mb-1">{module.name}</h4>
                  <p className="text-white/40 text-sm">{module.description}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/40">Deep analysis</span>
                    <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/40">Real-time</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-2 h-2">
                  <span className="absolute inset-0 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 animate-pulse" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Open Source Platforms */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
          <h3 className="text-white font-semibold">Open Source Platforms</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {openSourcePlatforms.map((platform) => (
            <button
              key={platform.id}
              className="group relative bg-gradient-to-br from-gray-900 to-black rounded-2xl p-4 border border-white/10 hover:border-blue-500/50 transition-all duration-500 text-left flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform.color} bg-opacity-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                {getIcon(platform.icon, "w-5 h-5")}
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">{platform.name}</h4>
                <p className="text-white/40 text-xs">{platform.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvestigationModules;
