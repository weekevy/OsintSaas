import React, { useState } from 'react';
import { investigationModules as defaultModules, openSourcePlatforms as defaultPlatforms } from '../utils/constants';
import { getIcon } from '../utils/icons';

// ==================== FancyCheckbox Component ====================
export const FancyCheckbox = ({ label, checked, onChange }) => (
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

// ==================== InvestigationModules Component ====================
export const InvestigationModules = ({ onStartScan, selectedTarget }) => {
  const [modules] = useState(defaultModules);
  const [platforms] = useState(defaultPlatforms);
  const [stats] = useState({ total: 45, active: 3 });

  const handleModuleClick = (module, target) => {
    onStartScan(module, target);
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/30">
          <div className="text-white/40 text-xs">Total Scans (30d)</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/30">
          <div className="text-white/40 text-xs">Active Now</div>
          <div className="text-2xl font-bold text-green-400">{stats.active}</div>
        </div>
      </div>

      {/* Investigation Modules */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
          <h3 className="text-white font-semibold">Investigation Modules</h3>
          <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/40">
            {modules.length} available
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => handleModuleClick(module, selectedTarget)}
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
          <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/40">
            {platforms.length} integrated
          </span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handleModuleClick(platform, selectedTarget)}
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

// ==================== CustomScanConfig Component ====================
export const CustomScanConfig = ({ 
  scanOptions, 
  toggleOption, 
  selectedProjectForScan, 
  searchInput,
  onStartCustomScan,
  isLoading 
}) => {
  const [savedConfigs] = useState([]);
  const [selectedConfig] = useState(null);
  const [configName, setConfigName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [loading] = useState(false);
  const [stats] = useState({
    totalScans: 1284,
    avgTime: '2.3m',
    successRate: 94
  });

  const handleSaveConfig = () => {
    if (!configName.trim()) return;
    setShowSaveDialog(false);
    setConfigName('');
  };

  const handleStartScan = () => {
    if (isLoading) return;
    onStartCustomScan();
  };

  const activeOptionsCount = Object.values(scanOptions).filter(v => v === true).length;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Saved Configurations */}
        {savedConfigs.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Saved Configurations
              </h3>
              <span className="text-xs text-white/40">{savedConfigs.length} saved</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedConfigs.map(config => (
                <div
                  key={config.id}
                  className={`group relative px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-all ${
                    selectedConfig?.id === config.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{config.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scan Configuration */}
        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Scan Configuration
            </h3>
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={activeOptionsCount === 0}
              className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Config
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(scanOptions).map(([key, value]) => (
              <FancyCheckbox
                key={key}
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                checked={value}
                onChange={() => toggleOption(key)}
              />
            ))}
          </div>
        </div>

        {/* Performance Settings */}
        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Performance Metrics
          </h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{stats.totalScans}</div>
              <div className="text-white/40 text-xs">Total Scans</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{stats.avgTime}</div>
              <div className="text-white/40 text-xs">Avg Time</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-400">{stats.successRate}%</div>
              <div className="text-white/40 text-xs">Success</div>
            </div>
          </div>

          <div className="text-center py-4 bg-white/5 rounded-xl border border-white/10">
            <svg className="w-12 h-12 mx-auto text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233l3.277-3.277a2.543 2.543 0 10-3.594-3.594l-3.277 3.277m0 0L9.75 8.352" />
            </svg>
            <p className="text-white/40 text-sm">Advanced performance tuning</p>
            <p className="text-white/20 text-xs mt-1">Coming in next release</p>
          </div>
        </div>
      </div>

      {/* Scan Summary Sidebar */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
          <h3 className="text-white font-semibold mb-4">Scan Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Target</span>
              <span className="text-white font-medium truncate max-w-[150px]">
                {selectedProjectForScan?.name || searchInput || 'Not selected'}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Configuration</span>
              <span className="text-white font-medium">
                {activeOptionsCount} options
              </span>
            </div>

            {selectedConfig && (
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Loaded Config</span>
                <span className="text-purple-400 font-medium">{selectedConfig.name}</span>
              </div>
            )}

            <div className="border-t border-white/10 my-4" />

            <div className="text-center">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                {defaultModules.length}
              </div>
              <div className="text-white/40 text-xs">Modules Available</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-green-400 font-bold">{stats.successRate}%</div>
                <div className="text-white/40">Success Rate</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-blue-400 font-bold">{stats.avgTime}</div>
                <div className="text-white/40">Avg Time</div>
              </div>
            </div>

            <button 
              onClick={handleStartScan}
              disabled={isLoading || (!selectedProjectForScan && !searchInput)}
              className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Starting Scan...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Custom Scan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Custom Scans */}
        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-3 text-sm">Recent Custom Scans</h3>
          <div className="space-y-2">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg">
                <span className="text-white/60">Scan #{i + 1}</span>
                <span className="text-green-400">Completed</span>
              </div>
            ))}
            <button className="w-full mt-2 text-xs text-white/40 hover:text-white/60 transition-colors">
              View All →
            </button>
          </div>
        </div>
      </div>

      {/* Save Configuration Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-white/10 p-6 max-w-md w-full">
            <h3 className="text-white font-bold text-lg mb-4">Save Configuration</h3>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Enter configuration name"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white mb-4 focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-white/5 text-white/60 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={!configName.trim() || loading}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
