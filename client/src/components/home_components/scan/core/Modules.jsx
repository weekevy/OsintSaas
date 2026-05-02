import React, { useState, memo } from 'react';
import { investigationModules as defaultModules, openSourcePlatforms as defaultPlatforms } from '../utils/constants';
import { getIcon } from '../utils/icons';

// ==================== FancyCheckbox Component ====================
export const FancyCheckbox = memo(({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/[0.08] cursor-pointer hover:border-[#00E5FF]/30 transition-colors duration-150">
    <div className="relative">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <div className={`w-4 h-4 border transition-colors duration-150 flex items-center justify-center ${
        checked ? 'bg-[#00E5FF] border-[#00E5FF]' : 'bg-transparent border-white/20'
      }`}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </div>
    </div>
    <span className="text-white/70 text-[10px] font-sans uppercase tracking-[0.08em] group-hover:text-white transition-colors">{label}</span>
  </label>
));

FancyCheckbox.displayName = 'FancyCheckbox';

// ==================== Custom Module Icon Component ====================
const ModuleIcon = ({ type }) => {
  const icons = {
    'job-recruitment': (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="7" width="18" height="14" rx="2" stroke="#00E5FF" strokeWidth="1.8" fill="none"/>
        <path d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7" stroke="#2DD4BF" strokeWidth="1.8" fill="none"/>
        <circle cx="12" cy="12" r="1.5" fill="#00E5FF" stroke="none"/>
        <circle cx="16" cy="12" r="1.5" fill="#2DD4BF" stroke="none"/>
        <circle cx="8" cy="12" r="1.5" fill="#00E5FF" stroke="none"/>
        <path d="M12 15V17" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    'linkedin': (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#00E5FF" strokeWidth="1.8" fill="none"/>
        <path d="M8 10V16" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="8" cy="7.5" r="1.5" fill="#00E5FF" stroke="none"/>
        <path d="M12 10V16M12 12.5C12 11 13 10 16 10C17.5 10 18 11 18 12.5V16" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    'social-media': (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <circle cx="7.5" cy="7.5" r="3.5" stroke="#00E5FF" strokeWidth="1.8" fill="none"/>
        <circle cx="16.5" cy="16.5" r="3.5" stroke="#2DD4BF" strokeWidth="1.8" fill="none"/>
        <line x1="10" y1="10" x2="14" y2="14" stroke="#00E5FF" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="14" y1="10" x2="10" y2="14" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    'scam-website': (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#f87171" strokeWidth="1.8" fill="none"/>
        <path d="M12 8V12L14 14" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1" fill="#f87171" stroke="none"/>
        <path d="M5 12H8M16 12H19" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'email-leak': (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#00E5FF" strokeWidth="1.8" fill="none"/>
        <path d="M21 8L12 14L3 8" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="16" cy="15" r="2" fill="#00E5FF" stroke="none" opacity="0.8"/>
        <circle cx="8" cy="15" r="2" fill="#2DD4BF" stroke="none" opacity="0.8"/>
      </svg>
    ),
    'scam-email': (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#f87171" strokeWidth="1.8" fill="none"/>
        <path d="M21 8L12 14L3 8" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 14V18" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="19" r="1.5" fill="#f87171" stroke="none"/>
        <path d="M9 11L11 13M15 11L13 13" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    'phone-number': (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <path d="M19.5 15.5L16.5 18.5C16.5 18.5 15 20 12 17C9 14 8.5 12.5 8.5 12.5L11.5 9.5L10 6L6 7.5C6 7.5 3 11.5 8 16.5C13 21.5 17 18.5 17 18.5L19.5 15.5Z" stroke="#00E5FF" strokeWidth="1.8" fill="none"/>
        <path d="M15 8H18" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M15 11H19" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M15 14H17" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    'crypto-wallet': (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="8" width="16" height="12" rx="2" stroke="#00E5FF" strokeWidth="1.8" fill="none"/>
        <path d="M8 8V6C8 4.9 8.9 4 10 4H14C15.1 4 16 4.9 16 6V8" stroke="#2DD4BF" strokeWidth="1.8" fill="none"/>
        <circle cx="17" cy="14" r="2" stroke="#00E5FF" strokeWidth="1.8" fill="none"/>
        <circle cx="17" cy="14" r="1" fill="#00E5FF" stroke="none"/>
        <path d="M12 11H12.01M12 17H12.01" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    default: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#00E5FF" strokeWidth="1.8" fill="none"/>
        <path d="M12 8V12L15 15" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1" fill="#00E5FF" stroke="none"/>
      </svg>
    )
  };
  return icons[type] || icons.default;
};

// ==================== Skeleton Loaders (prevents layout shift) ====================
const ModuleCardSkeleton = () => (
  <div className="border border-white/10 rounded-2xl p-5 bg-[#0a0a0a] animate-pulse min-h-[180px]">
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 bg-white/10 rounded-md" />
      <div className="flex-1">
        <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
        <div className="h-3 bg-white/10 rounded w-full mb-1" />
        <div className="h-3 bg-white/10 rounded w-2/3 mb-2" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-white/10 rounded w-16" />
          <div className="h-5 bg-white/10 rounded w-16" />
        </div>
      </div>
    </div>
  </div>
);

const PlatformCardSkeleton = () => (
  <div className="border border-white/10 rounded-xl p-3 bg-[#0a0a0a] animate-pulse min-h-[80px]">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white/10 rounded-md" />
      <div className="flex-1">
        <div className="h-4 bg-white/10 rounded w-3/4 mb-1" />
        <div className="h-2 bg-white/10 rounded w-1/2" />
      </div>
    </div>
  </div>
);

// ==================== InvestigationModules Component ====================
export const InvestigationModules = ({ onStartScan, selectedTarget }) => {
  const [modules] = useState(defaultModules);
  const [platforms] = useState(defaultPlatforms);
  const [stats] = useState({ total: 45, active: 3 });
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for smooth transition (remove if data loads instantly)
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleModuleClick = (module, target) => {
    onStartScan(module, target);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Stats Overview - Fixed height cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-white/10 rounded-2xl p-4 bg-[#0a0a0a] min-h-[100px]">
          <div className="text-white/40 text-[8px] font-sans uppercase tracking-[0.12em]">TOTAL SCANS (30D)</div>
          <div className="text-2xl font-bold text-white font-sans">{stats.total}</div>
        </div>
        <div className="border border-white/10 rounded-2xl p-4 bg-[#0a0a0a] min-h-[100px]">
          <div className="text-white/40 text-[8px] font-sans uppercase tracking-[0.12em]">ACTIVE NOW</div>
          <div className="text-2xl font-bold text-[#2DD4BF] font-sans">{stats.active}</div>
        </div>
      </div>

      {/* Investigation Modules - Fixed height grid */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF]" />
          <h3 className="text-white font-sans text-[11px] font-bold uppercase tracking-[0.12em]">INVESTIGATION MODULES</h3>
          <span className="text-[8px] px-2 py-0.5 border border-white/20 text-white/40 font-sans uppercase tracking-[0.08em]">
            {modules.length} AVAILABLE
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoading ? (
            // Show skeletons during loading
            <>
              <ModuleCardSkeleton />
              <ModuleCardSkeleton />
              <ModuleCardSkeleton />
              <ModuleCardSkeleton />
            </>
          ) : (
            modules.map((module) => (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module, selectedTarget)}
                className="group relative border border-white/10 hover:border-[#00E5FF]/30 transition-colors duration-150 text-left overflow-hidden p-5 rounded-2xl bg-[#0a0a0a] min-h-[180px]"
              >
                <div className="relative flex items-start gap-4">
                  <div className="w-14 h-14 border border-[#00E5FF]/30 flex items-center justify-center transition-colors duration-150 group-hover:border-[#00E5FF] bg-[#00E5FF]/5 rounded-md">
                    <ModuleIcon type={module.id} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-sans text-[12px] font-bold uppercase tracking-[0.08em] mb-1">{module.name}</h4>
                    <p className="text-white/40 text-[10px] font-sans leading-relaxed">{module.description}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-[8px] px-2 py-0.5 border border-white/20 text-white/40 font-sans uppercase tracking-[0.08em]">DEEP ANALYSIS</span>
                      <span className="text-[8px] px-2 py-0.5 border border-white/20 text-white/40 font-sans uppercase tracking-[0.08em]">REAL-TIME</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Open Source Platforms - Fixed height grid */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-[#2DD4BF] to-[#00E5FF]" />
          <h3 className="text-white font-sans text-[11px] font-bold uppercase tracking-[0.12em]">OPEN SOURCE PLATFORMS</h3>
          <span className="text-[8px] px-2 py-0.5 border border-white/20 text-white/40 font-sans uppercase tracking-[0.08em]">
            {platforms.length} INTEGRATED
          </span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading ? (
            // Show skeletons during loading
            <>
              <PlatformCardSkeleton />
              <PlatformCardSkeleton />
              <PlatformCardSkeleton />
              <PlatformCardSkeleton />
            </>
          ) : (
            platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleModuleClick(platform, selectedTarget)}
                className="group relative border border-white/10 hover:border-[#00E5FF]/30 transition-colors duration-150 text-left flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0a] min-h-[80px]"
              >
                <div className="w-10 h-10 border border-[#00E5FF]/30 flex items-center justify-center transition-colors duration-150 group-hover:border-[#00E5FF] bg-[#00E5FF]/5 rounded-md">
                  {getIcon(platform.icon, "w-5 h-5 text-[#00E5FF]")}
                </div>
                <div>
                  <h4 className="text-white font-sans text-[10px] font-bold uppercase tracking-[0.08em]">{platform.name}</h4>
                  <p className="text-white/40 text-[8px] font-sans uppercase tracking-[0.08em]">{platform.description}</p>
                </div>
              </button>
            ))
          )}
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
    avgTime: '2.3M',
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
    <div className="grid lg:grid-cols-3 gap-6 font-sans">
      <div className="lg:col-span-2 space-y-6">
        {/* Saved Configurations */}
        {savedConfigs.length > 0 && (
          <div className="border border-white/10 rounded-2xl p-5 bg-[#0a0a0a]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-sans text-[10px] font-bold uppercase tracking-[0.12em] flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                SAVED CONFIGURATIONS
              </h3>
              <span className="text-[8px] text-white/30 font-sans uppercase tracking-[0.08em]">{savedConfigs.length} SAVED</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedConfigs.map(config => (
                <div
                  key={config.id}
                  className={`px-2 py-1 text-[9px] font-sans uppercase tracking-[0.08em] cursor-pointer transition-colors ${
                    selectedConfig?.id === config.id
                      ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30'
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
        <div className="border border-white/10 rounded-2xl p-5 bg-[#0a0a0a]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-sans text-[10px] font-bold uppercase tracking-[0.12em] flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              SCAN CONFIGURATION
            </h3>
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={activeOptionsCount === 0}
              className="text-[8px] px-2 py-1 border border-white/10 hover:border-[#00E5FF]/30 text-white/60 hover:text-[#00E5FF] transition-colors flex items-center gap-1 font-sans uppercase tracking-[0.08em] disabled:opacity-50"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              SAVE CONFIG
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
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
        <div className="border border-white/10 rounded-2xl p-5 bg-[#0a0a0a]">
          <h3 className="text-white font-sans text-[10px] font-bold uppercase tracking-[0.12em] mb-4 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            PERFORMANCE METRICS
          </h3>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/5 border border-white/[0.08] p-2 text-center min-h-[70px]">
              <div className="text-lg font-bold text-white font-sans">{stats.totalScans}</div>
              <div className="text-white/30 text-[7px] font-sans uppercase tracking-[0.08em]">TOTAL SCANS</div>
            </div>
            <div className="bg-white/5 border border-white/[0.08] p-2 text-center min-h-[70px]">
              <div className="text-lg font-bold text-white font-sans">{stats.avgTime}</div>
              <div className="text-white/30 text-[7px] font-sans uppercase tracking-[0.08em]">AVG TIME</div>
            </div>
            <div className="bg-white/5 border border-white/[0.08] p-2 text-center min-h-[70px]">
              <div className="text-lg font-bold text-[#00E5FF] font-sans">{stats.successRate}%</div>
              <div className="text-white/30 text-[7px] font-sans uppercase tracking-[0.08em]">SUCCESS</div>
            </div>
          </div>

          <div className="text-center py-4 bg-white/5 border border-white/[0.08] min-h-[180px] flex flex-col items-center justify-center">
            <svg className="w-10 h-10 mx-auto text-white/20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233l3.277-3.277a2.543 2.543 0 10-3.594-3.594l-3.277 3.277m0 0L9.75 8.352" />
            </svg>
            <p className="text-white/30 text-[8px] font-sans uppercase tracking-[0.08em]">ADVANCED PERFORMANCE TUNING</p>
            <p className="text-white/15 text-[7px] font-sans uppercase tracking-[0.08em] mt-1">COMING IN NEXT RELEASE</p>
          </div>
        </div>
      </div>

      {/* Scan Summary Sidebar */}
      <div className="space-y-6">
        <div className="border border-white/10 rounded-2xl p-5 bg-[#0a0a0a] relative overflow-hidden min-h-[400px]">
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00E5FF]/30" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00E5FF]/30" />
          
          <h3 className="text-white font-sans text-[10px] font-bold uppercase tracking-[0.12em] mb-4">SCAN SUMMARY</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-[9px] font-sans">
              <span className="text-white/40 uppercase tracking-[0.08em]">TARGET</span>
              <span className="text-white truncate max-w-[150px] uppercase tracking-[0.08em]">
                {selectedProjectForScan?.name || searchInput || 'NOT SELECTED'}
              </span>
            </div>
            
            <div className="flex justify-between text-[9px] font-sans">
              <span className="text-white/40 uppercase tracking-[0.08em]">CONFIGURATION</span>
              <span className="text-white font-sans">
                {activeOptionsCount} OPTIONS
              </span>
            </div>

            {selectedConfig && (
              <div className="flex justify-between text-[9px] font-sans">
                <span className="text-white/40 uppercase tracking-[0.08em]">LOADED CONFIG</span>
                <span className="text-[#00E5FF] font-sans">{selectedConfig.name}</span>
              </div>
            )}

            <div className="border-t border-white/[0.08] my-3" />

            <div className="text-center">
              <div className="text-2xl font-bold text-[#00E5FF] font-sans">
                {defaultModules.length}
              </div>
              <div className="text-white/30 text-[7px] font-sans uppercase tracking-[0.08em]">MODULES AVAILABLE</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/5 border border-white/[0.08] p-2 min-h-[65px]">
                <div className="text-[#00E5FF] font-bold text-[10px] font-sans">{stats.successRate}%</div>
                <div className="text-white/30 text-[6px] font-sans uppercase tracking-[0.08em]">SUCCESS RATE</div>
              </div>
              <div className="bg-white/5 border border-white/[0.08] p-2 min-h-[65px]">
                <div className="text-[#2DD4BF] font-bold text-[10px] font-sans">{stats.avgTime}</div>
                <div className="text-white/30 text-[6px] font-sans uppercase tracking-[0.08em]">AVG TIME</div>
              </div>
            </div>

            <button 
              onClick={handleStartScan}
              disabled={isLoading || (!selectedProjectForScan && !searchInput)}
              className="w-full mt-3 py-2 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors font-sans text-[9px] uppercase tracking-[0.08em] flex items-center justify-center gap-2 disabled:opacity-50 min-h-[40px]"
            >
              {isLoading ? (
                <>STARTING...</>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  START CUSTOM SCAN
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Custom Scans */}
        <div className="border border-white/10 rounded-2xl p-5 bg-[#0a0a0a] min-h-[200px]">
          <h3 className="text-white font-sans text-[9px] font-bold uppercase tracking-[0.12em] mb-3">RECENT CUSTOM SCANS</h3>
          <div className="space-y-2">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between text-[8px] font-sans p-2 bg-white/5 border border-white/[0.08] min-h-[40px]">
                <span className="text-white/50 uppercase tracking-[0.08em]">SCAN #{i + 1}</span>
                <span className="text-[#2DD4BF] uppercase tracking-[0.08em]">COMPLETED</span>
              </div>
            ))}
            <button className="w-full mt-2 text-[7px] text-white/40 hover:text-[#00E5FF] transition-colors font-sans uppercase tracking-[0.08em] py-2">
              VIEW ALL →
            </button>
          </div>
        </div>
      </div>

      {/* Save Configuration Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative border border-white/10 rounded-2xl p-6 max-w-md w-full bg-[#0a0a0a] min-h-[280px]">
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#00E5FF]/30" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#00E5FF]/30" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#00E5FF]/30" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#00E5FF]/30" />
            
            <h3 className="text-white font-sans text-[11px] font-bold uppercase tracking-[0.12em] mb-4">SAVE CONFIGURATION</h3>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="ENTER CONFIGURATION NAME"
              className="w-full px-3 py-2 bg-white/5 border border-white/[0.08] text-white text-xs font-sans focus:outline-none focus:border-[#00E5FF]/50 transition-colors mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-3 py-1.5 border border-white/10 text-white/60 hover:text-white text-[9px] font-sans uppercase tracking-[0.08em] transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={!configName.trim() || loading}
                className="px-3 py-1.5 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10 text-[9px] font-sans uppercase tracking-[0.08em] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? 'SAVING...' : 'SAVE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};