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

// ==================== Skeleton Loaders ====================
const ModuleCardSkeleton = () => (
  <div className="border border-white/10 rounded-2xl p-5 bg-[#0a0a0a] animate-pulse min-h-[200px]">
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 bg-white/10 rounded-xl" />
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
  <div className="border border-white/10 rounded-xl p-4 bg-[#0a0a0a] animate-pulse min-h-[90px]">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white/10 rounded-lg" />
      <div className="flex-1">
        <div className="h-4 bg-white/10 rounded w-3/4 mb-1" />
        <div className="h-2 bg-white/10 rounded w-1/2" />
      </div>
    </div>
  </div>
);

// ==================== Module tag badge ====================
const TagBadge = ({ label, color = 'cyan' }) => {
  const colors = {
    cyan: 'border-[#00E5FF]/20 text-[#00E5FF]/60 bg-[#00E5FF]/5',
    teal: 'border-[#2DD4BF]/20 text-[#2DD4BF]/60 bg-[#2DD4BF]/5',
    red: 'border-[#f87171]/20 text-[#f87171]/60 bg-[#f87171]/5',
  };
  return (
    <span className={`text-[8px] px-2 py-0.5 border font-sans uppercase tracking-[0.1em] rounded-sm ${colors[color]}`}>
      {label}
    </span>
  );
};

// ==================== InvestigationModules Component ====================
export const InvestigationModules = ({ onStartScan, selectedTarget }) => {
  const [modules] = useState(defaultModules);
  const [platforms] = useState(defaultPlatforms);
  const [stats] = useState({ total: 45, active: 3 });
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleModuleClick = (module, target) => {
    onStartScan(module, target);
  };

  // Determine accent colors per module type
  const getModuleAccent = (id) => {
    const accentMap = {
      'scam-website': { border: 'hover:border-[#f87171]/40', glow: 'bg-[#f87171]/5', iconBorder: 'border-[#f87171]/30 group-hover:border-[#f87171]', tag1Color: 'red', tag2Color: 'red' },
      'scam-email':   { border: 'hover:border-[#f87171]/40', glow: 'bg-[#f87171]/5', iconBorder: 'border-[#f87171]/30 group-hover:border-[#f87171]', tag1Color: 'red', tag2Color: 'red' },
    };
    return accentMap[id] || { border: 'hover:border-[#00E5FF]/40', glow: 'bg-[#00E5FF]/5', iconBorder: 'border-[#00E5FF]/30 group-hover:border-[#00E5FF]', tag1Color: 'cyan', tag2Color: 'teal' };
  };

  return (
    <div className="space-y-8 font-sans">

      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'TOTAL SCANS (30D)', value: stats.total, color: 'text-white' },
          { label: 'ACTIVE NOW',        value: stats.active, color: 'text-[#2DD4BF]' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="relative border border-white/10 rounded-2xl p-5 bg-[#0a0a0a] overflow-hidden min-h-[100px]"
          >
            {/* subtle corner dot decoration */}
            <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#00E5FF]/20" />
            <div className="text-white/35 text-[9px] uppercase tracking-[0.14em] mb-1">{label}</div>
            <div className={`text-4xl font-bold leading-none ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Investigation Modules ── */}
      <div>
        {/* Section header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-0.5 h-7 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF]" />
          <h3 className="text-white text-[13px] font-bold uppercase tracking-[0.14em]">Investigation Modules</h3>
          <span className="text-[8px] px-2 py-0.5 border border-white/15 text-white/35 uppercase tracking-[0.1em] rounded-sm">
            {modules.length} AVAILABLE
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoading ? (
            [0,1,2,3].map(i => <ModuleCardSkeleton key={i} />)
          ) : (
            modules.map((module) => {
              const accent = getModuleAccent(module.id);
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module, selectedTarget)}
                  className={`group relative border border-white/10 ${accent.border} transition-colors duration-200 text-left overflow-hidden rounded-2xl bg-[#0a0a0a]`}
                  style={{ minHeight: 200 }}
                >
                  {/* Top edge accent line */}
                  <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Faint dot-grid background */}
                  <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #00E5FF 1px, transparent 1px)',
                      backgroundSize: '18px 18px',
                    }}
                  />

                  {/* Corner bracket decorations */}
                  <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#00E5FF]/20 group-hover:border-[#00E5FF]/50 transition-colors duration-200" />
                  <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#00E5FF]/20 group-hover:border-[#00E5FF]/50 transition-colors duration-200" />

                  <div className="relative p-5">
                    {/* Icon + title row */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 border flex items-center justify-center transition-colors duration-200 ${accent.iconBorder} ${accent.glow} rounded-xl flex-shrink-0`}>
                        <ModuleIcon type={module.id} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h4 className="text-white text-[15px] font-bold uppercase tracking-[0.06em] leading-tight mb-1">
                          {module.name}
                        </h4>
                        {/* subtle sub-label */}
                        <div className="text-[#00E5FF]/40 text-[9px] uppercase tracking-[0.14em]">MODULE · AI-POWERED</div>
                      </div>
                    </div>

                    {/* Description — larger text */}
                    <p className="text-white/50 text-[12px] leading-relaxed mb-4">{module.description}</p>

                    {/* Footer row: tags + arrow */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <TagBadge label="DEEP ANALYSIS" color={accent.tag1Color} />
                        <TagBadge label="REAL-TIME"     color={accent.tag2Color} />
                      </div>
                      <div className="w-6 h-6 rounded-full border border-[#00E5FF]/20 flex items-center justify-center group-hover:border-[#00E5FF]/60 group-hover:bg-[#00E5FF]/10 transition-all duration-200">
                        <svg className="w-3 h-3 text-[#00E5FF]/40 group-hover:text-[#00E5FF] transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Open Source Platforms ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-0.5 h-7 bg-gradient-to-b from-[#2DD4BF] to-[#00E5FF]" />
          <h3 className="text-white text-[13px] font-bold uppercase tracking-[0.14em]">Open Source Platforms</h3>
          <span className="text-[8px] px-2 py-0.5 border border-white/15 text-white/35 uppercase tracking-[0.1em] rounded-sm">
            {platforms.length} INTEGRATED
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading ? (
            [0,1,2,3].map(i => <PlatformCardSkeleton key={i} />)
          ) : (
            platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleModuleClick(platform, selectedTarget)}
                className="group relative border border-white/10 hover:border-[#00E5FF]/40 transition-colors duration-200 text-left overflow-hidden rounded-xl bg-[#0a0a0a]"
                style={{ minHeight: 90 }}
              >
                {/* Top accent line on hover */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                <div className="relative flex flex-col gap-2.5 p-3.5">
                  <div className="w-10 h-10 border border-[#00E5FF]/25 group-hover:border-[#00E5FF]/60 flex items-center justify-center bg-[#00E5FF]/5 rounded-lg transition-colors duration-200">
                    {getIcon(platform.icon, "w-5 h-5 text-[#00E5FF]")}
                  </div>
                  <div>
                    <h4 className="text-white text-[11px] font-bold uppercase tracking-[0.08em] leading-tight">{platform.name}</h4>
                    <p className="text-white/35 text-[9px] uppercase tracking-[0.06em] mt-0.5">{platform.description}</p>
                  </div>
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
  const [stats] = useState({ totalScans: 1284, avgTime: '2.3M', successRate: 94 });

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
              <h3 className="text-white text-[13px] font-bold uppercase tracking-[0.12em] flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Saved Configurations
              </h3>
              <span className="text-[8px] text-white/30 uppercase tracking-[0.08em]">{savedConfigs.length} SAVED</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedConfigs.map(config => (
                <div
                  key={config.id}
                  className={`px-2 py-1 text-[9px] uppercase tracking-[0.08em] cursor-pointer transition-colors rounded-sm ${
                    selectedConfig?.id === config.id
                      ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {config.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scan Configuration */}
        <div className="relative border border-white/10 rounded-2xl p-5 bg-[#0a0a0a] overflow-hidden">
          {/* corner brackets */}
          <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#00E5FF]/20" />
          <span className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#00E5FF]/20" />

          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white text-[13px] font-bold uppercase tracking-[0.12em] flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Scan Configuration
            </h3>
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={activeOptionsCount === 0}
              className="text-[8px] px-2.5 py-1.5 border border-white/10 hover:border-[#00E5FF]/30 text-white/50 hover:text-[#00E5FF] transition-colors flex items-center gap-1.5 uppercase tracking-[0.08em] disabled:opacity-40 rounded-sm"
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
        <div className="relative border border-white/10 rounded-2xl p-5 bg-[#0a0a0a] overflow-hidden">
          <h3 className="text-white text-[13px] font-bold uppercase tracking-[0.12em] mb-5 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Performance Metrics
          </h3>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { value: stats.totalScans, label: 'TOTAL SCANS', color: 'text-white' },
              { value: stats.avgTime,    label: 'AVG TIME',    color: 'text-white' },
              { value: `${stats.successRate}%`, label: 'SUCCESS',   color: 'text-[#00E5FF]' },
            ].map(({ value, label, color }) => (
              <div key={label} className="relative bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 text-center overflow-hidden">
                <div className={`text-2xl font-bold leading-none mb-1 ${color}`}>{value}</div>
                <div className="text-white/30 text-[8px] uppercase tracking-[0.1em]">{label}</div>
              </div>
            ))}
          </div>

          <div className="relative text-center py-8 bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden min-h-[160px] flex flex-col items-center justify-center">
            {/* faint grid */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <svg className="w-10 h-10 mx-auto text-white/15 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233l3.277-3.277a2.543 2.543 0 10-3.594-3.594l-3.277 3.277m0 0L9.75 8.352" />
            </svg>
            <p className="relative text-white/30 text-[10px] uppercase tracking-[0.12em]">Advanced Performance Tuning</p>
            <p className="relative text-white/15 text-[8px] uppercase tracking-[0.1em] mt-1">Coming in next release</p>
          </div>
        </div>
      </div>

      {/* ── Scan Summary Sidebar ── */}
      <div className="space-y-5">
        <div className="relative border border-white/10 rounded-2xl p-5 bg-[#0a0a0a] overflow-hidden">
          {/* corner brackets */}
          <span className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#00E5FF]/25" />
          <span className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#00E5FF]/25" />
          <span className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#00E5FF]/25" />
          <span className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#00E5FF]/25" />

          {/* faint dot grid */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'radial-gradient(circle, #00E5FF 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          <h3 className="relative text-white text-[13px] font-bold uppercase tracking-[0.14em] mb-5">Scan Summary</h3>

          <div className="relative space-y-4">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/40 uppercase tracking-[0.1em]">Target</span>
              <span className="text-white truncate max-w-[150px] uppercase tracking-[0.06em] text-[11px]">
                {selectedProjectForScan?.name || searchInput || '—'}
              </span>
            </div>

            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/40 uppercase tracking-[0.1em]">Config Options</span>
              <span className="text-[#00E5FF] font-bold text-[13px]">{activeOptionsCount}</span>
            </div>

            {selectedConfig && (
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-white/40 uppercase tracking-[0.1em]">Loaded Config</span>
                <span className="text-[#00E5FF]">{selectedConfig.name}</span>
              </div>
            )}

            <div className="border-t border-white/[0.07] pt-4 text-center">
              <div className="text-5xl font-bold text-[#00E5FF] leading-none mb-1">{defaultModules?.length ?? 8}</div>
              <div className="text-white/30 text-[8px] uppercase tracking-[0.12em]">Modules Available</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { value: `${stats.successRate}%`, label: 'SUCCESS RATE', color: 'text-[#00E5FF]' },
                { value: stats.avgTime, label: 'AVG TIME', color: 'text-[#2DD4BF]' },
              ].map(({ value, label, color }) => (
                <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-2.5 text-center">
                  <div className={`font-bold text-[13px] leading-none mb-1 ${color}`}>{value}</div>
                  <div className="text-white/25 text-[7px] uppercase tracking-[0.1em]">{label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartScan}
              disabled={isLoading || (!selectedProjectForScan && !searchInput)}
              className="relative w-full mt-1 py-2.5 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors rounded-xl text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 disabled:opacity-40 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/0 via-[#00E5FF]/5 to-[#00E5FF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {isLoading ? (
                <span className="relative">Starting...</span>
              ) : (
                <>
                  <svg className="relative w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  <span className="relative">Start Custom Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Custom Scans */}
        <div className="border border-white/10 rounded-2xl p-5 bg-[#0a0a0a]">
          <h3 className="text-white text-[12px] font-bold uppercase tracking-[0.14em] mb-4">Recent Custom Scans</h3>
          <div className="space-y-2">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between text-[9px] p-2.5 bg-white/[0.03] border border-white/[0.07] rounded-lg">
                <span className="text-white/45 uppercase tracking-[0.08em]">Scan #{i + 1}</span>
                <span className="text-[#2DD4BF] uppercase tracking-[0.08em] text-[8px] border border-[#2DD4BF]/20 px-1.5 py-0.5 rounded-sm bg-[#2DD4BF]/5">Completed</span>
              </div>
            ))}
            <button className="w-full mt-1 text-[8px] text-white/30 hover:text-[#00E5FF] transition-colors uppercase tracking-[0.1em] py-2">
              View All →
            </button>
          </div>
        </div>
      </div>

      {/* ── Save Configuration Dialog ── */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative border border-white/10 rounded-2xl p-6 max-w-md w-full bg-[#0a0a0a]">
            <span className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#00E5FF]/30" />
            <span className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#00E5FF]/30" />
            <span className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#00E5FF]/30" />
            <span className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#00E5FF]/30" />

            <h3 className="text-white text-[13px] font-bold uppercase tracking-[0.12em] mb-4">Save Configuration</h3>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Enter configuration name"
              className="w-full px-3 py-2.5 bg-white/5 border border-white/[0.08] text-white text-[12px] focus:outline-none focus:border-[#00E5FF]/50 transition-colors mb-4 rounded-lg"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 border border-white/10 text-white/55 hover:text-white text-[10px] uppercase tracking-[0.08em] transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={!configName.trim() || loading}
                className="px-4 py-2 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10 text-[10px] uppercase tracking-[0.08em] transition-colors disabled:opacity-40 flex items-center gap-2 rounded-lg"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};