import React, { useState, memo, useEffect } from 'react';
import { investigationModules as defaultModules, openSourcePlatforms as defaultPlatforms } from '../utils/constants';
import { getIcon } from '../utils/icons';

// ==================== FancyCheckbox ====================
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
    <span className="text-white/70 text-[10px] font-sans uppercase tracking-[0.08em]">{label}</span>
  </label>
));
FancyCheckbox.displayName = 'FancyCheckbox';

// ==================== Animated Skeleton Components ====================

const ModuleCardSkeleton = ({ index }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 60);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div 
      className={`relative border border-white/10 rounded-2xl p-5 bg-black overflow-hidden transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ minHeight: 220 }}
    >
      {/* Top glow line skeleton */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/5" />
      
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            {/* Icon skeleton */}
            <div className="w-14 h-14 bg-white/5 rounded-xl flex-shrink-0 animate-pulse border border-white/10"/>
            <div className="pt-1">
              {/* Title skeleton */}
              <div className="h-4 bg-white/10 rounded w-32 mb-2 animate-pulse"/>
              {/* Subtitle skeleton */}
              <div className="h-2.5 bg-white/5 rounded w-20 animate-pulse"/>
            </div>
          </div>
          {/* Risk badge skeleton */}
          <div className="w-16 h-5 bg-white/5 rounded-full animate-pulse border border-white/10"/>
        </div>

        {/* Description lines */}
        <div className="space-y-2 mb-5">
          <div className="h-3 bg-white/5 rounded w-full animate-pulse"/>
          <div className="h-3 bg-white/5 rounded w-4/5 animate-pulse"/>
        </div>

        {/* Tags skeletons */}
        <div className="flex gap-2 mb-5">
          {[1,2,3].map(i => (
            <div key={i} className="h-5 bg-white/5 rounded-full w-14 animate-pulse border border-white/[0.05]" />
          ))}
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex gap-4">
            <div className="space-y-1.5">
              <div className="h-2 bg-white/5 rounded w-10 animate-pulse"/>
              <div className="h-3 bg-white/10 rounded w-8 animate-pulse"/>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 bg-white/5 rounded w-10 animate-pulse"/>
              <div className="h-3 bg-white/10 rounded w-8 animate-pulse"/>
            </div>
          </div>
          {/* Action button skeleton */}
          <div className="w-7 h-7 rounded-full bg-white/5 animate-pulse border border-white/10"/>
        </div>
      </div>
    </div>
  );
};

const PlatformCardSkeleton = ({ index }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 30);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div 
      className={`border border-white/10 rounded-xl p-4 bg-black overflow-hidden transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ minHeight: 100 }}
    >
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex-shrink-0 animate-pulse"/>
          <div className="flex-1">
            <div className="h-3.5 bg-white/10 rounded w-3/4 mb-1.5 animate-pulse"/>
            <div className="h-2.5 bg-white/10 rounded w-1/2 animate-pulse"/>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded w-full animate-pulse"/>
      </div>
    </div>
  );
};

// Add shimmer animation to global styles (add this to your global CSS or tailwind config)
const shimmerStyle = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}
.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
}
.animate-fade-out-down {
  animation: fadeOutDown 0.3s ease-out forwards;
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined') {
  if (!document.querySelector('#skeleton-styles')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'skeleton-styles';
    styleTag.textContent = shimmerStyle;
    document.head.appendChild(styleTag);
  }
}

// ==================== Realistic Module Icons ====================
const ModuleIcon = ({ type, size = 36 }) => {
  const s = size;
  const icons = {
    'job-recruitment': (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <rect x="6" y="16" width="36" height="26" rx="4" fill="url(#job-body)" opacity="0.9"/>
        <rect x="6" y="16" width="36" height="26" rx="4" stroke="#00E5FF" strokeWidth="1.2" fill="none"/>
        <path d="M17 16V13C17 10.8 18.8 9 21 9H27C29.2 9 31 10.8 31 13V16" stroke="#2DD4BF" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="6" y1="26" x2="42" y2="26" stroke="#00E5FF" strokeWidth="1" opacity="0.4"/>
        <rect x="20" y="23" width="8" height="6" rx="2" fill="#00E5FF" opacity="0.8"/>
        <rect x="22" y="25" width="4" height="2" rx="1" fill="#0a0f14"/>
        <rect x="8" y="18" width="14" height="3" rx="1" fill="white" opacity="0.06"/>
        <defs>
          <linearGradient id="job-body" x1="6" y1="16" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a3040"/>
            <stop offset="100%" stopColor="#0a1520"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    'linkedin': (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <rect x="5" y="5" width="38" height="38" rx="8" fill="url(#li-bg)"/>
        <rect x="5" y="5" width="38" height="38" rx="8" stroke="#60a5fa" strokeWidth="1.2" fill="none"/>
        <rect x="13" y="19" width="5" height="16" rx="1.5" fill="#60a5fa"/>
        <circle cx="15.5" cy="14.5" r="3" fill="#60a5fa"/>
        <rect x="22" y="19" width="5" height="16" rx="1.5" fill="#60a5fa" opacity="0.9"/>
        <path d="M27 24C27 21.2 29 19 32 19C35 19 37 21.2 37 24V35H32V24.5C32 23.7 31.4 23 30.5 23C29.7 23 29 23.7 29 24.5V35H27V24Z" fill="#60a5fa" opacity="0.9"/>
        <rect x="7" y="7" width="16" height="5" rx="2" fill="white" opacity="0.05"/>
        <defs>
          <linearGradient id="li-bg" x1="5" y1="5" x2="43" y2="43" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e3a5f"/>
            <stop offset="100%" stopColor="#0c1d30"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    'social-media': (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="10" r="6" fill="url(#sm-top)" stroke="#c084fc" strokeWidth="1.2"/>
        <circle cx="10" cy="34" r="6" fill="url(#sm-bl)" stroke="#a855f7" strokeWidth="1.2"/>
        <circle cx="38" cy="34" r="6" fill="url(#sm-br)" stroke="#c084fc" strokeWidth="1.2"/>
        <line x1="19" y1="14" x2="14" y2="30" stroke="#c084fc" strokeWidth="1.5" opacity="0.6" strokeLinecap="round"/>
        <line x1="29" y1="14" x2="34" y2="30" stroke="#c084fc" strokeWidth="1.5" opacity="0.6" strokeLinecap="round"/>
        <line x1="16" y1="34" x2="32" y2="34" stroke="#a855f7" strokeWidth="1.5" opacity="0.6" strokeLinecap="round"/>
        <circle cx="24" cy="10" r="2.5" fill="white" opacity="0.7"/>
        <circle cx="10" cy="34" r="2.5" fill="white" opacity="0.7"/>
        <circle cx="38" cy="34" r="2.5" fill="white" opacity="0.7"/>
        <defs>
          <radialGradient id="sm-top" cx="50%" cy="30%"><stop offset="0%" stopColor="#7e22ce"/><stop offset="100%" stopColor="#4a044e"/></radialGradient>
          <radialGradient id="sm-bl" cx="50%" cy="30%"><stop offset="0%" stopColor="#6b21a8"/><stop offset="100%" stopColor="#3b0764"/></radialGradient>
          <radialGradient id="sm-br" cx="50%" cy="30%"><stop offset="0%" stopColor="#7e22ce"/><stop offset="100%" stopColor="#4a044e"/></radialGradient>
        </defs>
      </svg>
    ),
    'scam-website': (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="17" fill="url(#sw-bg)" stroke="#f87171" strokeWidth="1.2"/>
        <ellipse cx="24" cy="24" rx="9" ry="17" stroke="#f87171" strokeWidth="0.8" opacity="0.3" fill="none"/>
        <line x1="7" y1="24" x2="41" y2="24" stroke="#f87171" strokeWidth="0.8" opacity="0.3"/>
        <line x1="9" y1="16" x2="39" y2="16" stroke="#f87171" strokeWidth="0.8" opacity="0.2"/>
        <line x1="9" y1="32" x2="39" y2="32" stroke="#f87171" strokeWidth="0.8" opacity="0.2"/>
        <circle cx="34" cy="14" r="9" fill="#0f0a0a"/>
        <path d="M34 8L40.5 19H27.5L34 8Z" fill="url(#sw-warn)" stroke="#fbbf24" strokeWidth="1"/>
        <line x1="34" y1="12" x2="34" y2="16" stroke="#0f0a0a" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="34" cy="18" r="0.8" fill="#0f0a0a"/>
        <defs>
          <radialGradient id="sw-bg" cx="40%" cy="35%"><stop offset="0%" stopColor="#3b1219"/><stop offset="100%" stopColor="#1a0608"/></radialGradient>
          <linearGradient id="sw-warn" x1="34" y1="8" x2="34" y2="19" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#f87171"/></linearGradient>
        </defs>
      </svg>
    ),
    'scam-email': (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <rect x="5" y="12" width="38" height="26" rx="4" fill="url(#se-bg)" stroke="#f87171" strokeWidth="1.2"/>
        <path d="M5 15L24 27L43 15" stroke="#fbbf24" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <line x1="5" y1="38" x2="19" y2="27" stroke="#f87171" strokeWidth="0.8" opacity="0.4"/>
        <line x1="43" y1="38" x2="29" y2="27" stroke="#f87171" strokeWidth="0.8" opacity="0.4"/>
        <circle cx="34" cy="36" r="7" fill="#1a0608"/>
        <path d="M34 31C31.2 31 29 33 29 35.5C29 37.2 30 38.7 31.5 39.5V41H36.5V39.5C38 38.7 39 37.2 39 35.5C39 33 36.8 31 34 31Z" fill="#f87171" opacity="0.9"/>
        <rect x="31.5" y="41" width="2" height="1.5" rx="0.5" fill="#f87171"/>
        <rect x="34.5" y="41" width="2" height="1.5" rx="0.5" fill="#f87171"/>
        <circle cx="32" cy="35" r="1.2" fill="#1a0608"/>
        <circle cx="36" cy="35" r="1.2" fill="#1a0608"/>
        <defs>
          <linearGradient id="se-bg" x1="5" y1="12" x2="43" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2d0d0d"/>
            <stop offset="100%" stopColor="#140606"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    'phone-number': (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <rect x="13" y="4" width="22" height="40" rx="5" fill="url(#ph-bg)" stroke="#a3e635" strokeWidth="1.2"/>
        <rect x="16" y="10" width="16" height="24" rx="2" fill="url(#ph-screen)" opacity="0.8"/>
        <circle cx="24" cy="39" r="2" stroke="#a3e635" strokeWidth="1" fill="none"/>
        <path d="M20 17C20 17 22 15 24 15C26 15 28 17 28 17" stroke="#a3e635" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.9"/>
        <path d="M17 14C17 14 20.5 10 24 10C27.5 10 31 14 31 14" stroke="#a3e635" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5"/>
        <circle cx="33" cy="8" r="4" fill="#f87171"/>
        <text x="33" y="11" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">!</text>
        <rect x="15" y="6" width="8" height="3" rx="1" fill="white" opacity="0.07"/>
        <defs>
          <linearGradient id="ph-bg" x1="13" y1="4" x2="35" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a2e10"/>
            <stop offset="100%" stopColor="#0a1508"/>
          </linearGradient>
          <linearGradient id="ph-screen" x1="16" y1="10" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2d4a1a"/>
            <stop offset="100%" stopColor="#111f0a"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    'crypto-wallet': (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="14" width="40" height="28" rx="5" fill="url(#cw-bg)" stroke="#fbbf24" strokeWidth="1.2"/>
        <path d="M4 20H44V14C44 11.8 42.2 10 40 10H8C5.8 10 4 11.8 4 14V20Z" fill="url(#cw-flap)" stroke="#fbbf24" strokeWidth="1.2"/>
        <rect x="28" y="24" width="14" height="12" rx="3" fill="#0a0806" stroke="#fbbf24" strokeWidth="1"/>
        <circle cx="35" cy="30" r="4" fill="url(#cw-coin)" stroke="#fbbf24" strokeWidth="0.8"/>
        <text x="35" y="33" textAnchor="middle" fill="#0a0806" fontSize="5" fontWeight="bold">₿</text>
        <rect x="8" y="26" width="14" height="2" rx="1" fill="#fbbf24" opacity="0.4"/>
        <rect x="8" y="30" width="10" height="2" rx="1" fill="#fbbf24" opacity="0.25"/>
        <rect x="6" y="11" width="16" height="3" rx="1" fill="white" opacity="0.06"/>
        <defs>
          <linearGradient id="cw-bg" x1="4" y1="14" x2="44" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2d2006"/>
            <stop offset="100%" stopColor="#140e02"/>
          </linearGradient>
          <linearGradient id="cw-flap" x1="4" y1="10" x2="44" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3d2c08"/>
            <stop offset="100%" stopColor="#1f1604"/>
          </linearGradient>
          <radialGradient id="cw-coin" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#fde68a"/>
            <stop offset="100%" stopColor="#d97706"/>
          </radialGradient>
        </defs>
      </svg>
    ),
  };
  return icons[type] || (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" fill="url(#def-bg)" stroke="#00E5FF" strokeWidth="1.2"/>
      <circle cx="24" cy="24" r="6" fill="#00E5FF" opacity="0.6"/>
      <defs>
        <radialGradient id="def-bg"><stop offset="0%" stopColor="#0d2535"/><stop offset="100%" stopColor="#050f18"/></radialGradient>
      </defs>
    </svg>
  );
};

// ==================== Module config (extra meta per card) ====================
const MODULE_META = {
  'job-recruitment': {
    accent: '#00E5FF', accentBg: 'rgba(0,229,255,0.07)', border: 'rgba(0,229,255,0.18)',
    hoverBorder: 'rgba(0,229,255,0.45)', glow: 'rgba(0,229,255,0.12)',
    tags: ['Job Offers', 'Recruiter Verify', 'Company Check'],
    stats: [{ label: 'Avg Scan', value: '45s' }, { label: 'Accuracy', value: '94%' }],
    risk: 'HIGH',
  },
  'linkedin': {
    accent: '#60a5fa', accentBg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.18)',
    hoverBorder: 'rgba(96,165,250,0.45)', glow: 'rgba(96,165,250,0.12)',
    tags: ['Profile OSINT', 'Identity Check', 'Network Map'],
    stats: [{ label: 'Avg Scan', value: '30s' }, { label: 'Accuracy', value: '91%' }],
    risk: 'MEDIUM',
  },
  'social-media': {
    accent: '#c084fc', accentBg: 'rgba(192,132,252,0.07)', border: 'rgba(192,132,252,0.18)',
    hoverBorder: 'rgba(192,132,252,0.45)', glow: 'rgba(192,132,252,0.12)',
    tags: ['Cross-Platform', 'Identity OSINT', 'Threat Intel'],
    stats: [{ label: 'Platforms', value: '12+' }, { label: 'Accuracy', value: '89%' }],
    risk: 'MEDIUM',
  },
  'scam-website': {
    accent: '#f87171', accentBg: 'rgba(248,113,113,0.07)', border: 'rgba(248,113,113,0.18)',
    hoverBorder: 'rgba(248,113,113,0.5)', glow: 'rgba(248,113,113,0.14)',
    tags: ['Phishing', 'Domain Intel', 'SSL Check'],
    stats: [{ label: 'Avg Scan', value: '20s' }, { label: 'Detection', value: '97%' }],
    risk: 'CRITICAL',
  },
  'scam-email': {
    accent: '#fb7185', accentBg: 'rgba(251,113,133,0.07)', border: 'rgba(251,113,133,0.18)',
    hoverBorder: 'rgba(251,113,133,0.5)', glow: 'rgba(251,113,133,0.14)',
    tags: ['Header Analysis', 'Phishing Score', 'Sender Intel'],
    stats: [{ label: 'Avg Scan', value: '15s' }, { label: 'Detection', value: '96%' }],
    risk: 'CRITICAL',
  },
  'phone-number': {
    accent: '#a3e635', accentBg: 'rgba(163,230,53,0.07)', border: 'rgba(163,230,53,0.18)',
    hoverBorder: 'rgba(163,230,53,0.45)', glow: 'rgba(163,230,53,0.12)',
    tags: ['Carrier Lookup', 'Spam Score', 'Geo Data'],
    stats: [{ label: 'Avg Scan', value: '10s' }, { label: 'Accuracy', value: '92%' }],
    risk: 'MEDIUM',
  },
  'crypto-wallet': {
    accent: '#fbbf24', accentBg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.18)',
    hoverBorder: 'rgba(251,191,36,0.45)', glow: 'rgba(251,191,36,0.12)',
    tags: ['Blockchain', 'Tx History', 'Scam Flags'],
    stats: [{ label: 'Chains', value: '8' }, { label: 'Accuracy', value: '98%' }],
    risk: 'HIGH',
  },
};

const RISK_CONFIG = {
  CRITICAL: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: 'CRITICAL' },
  HIGH:     { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   label: 'HIGH' },
  MEDIUM:   { color: '#a3e635', bg: 'rgba(163,230,53,0.1)',   label: 'MEDIUM' },
};

// ==================== Under Construction Overlay ====================
const UnderConstructionOverlay = ({ rounded = '1rem' }) => (
  <div
    className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2"
    style={{
      background: 'rgba(10,10,10,0.85)',
      backdropFilter: 'blur(3px)',
      borderRadius: rounded,
    }}
  >
    {/* Diagonal warning stripes */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #fbbf24 0px, #fbbf24 2px, transparent 2px, transparent 12px)',
        borderRadius: rounded,
      }}
    />
    {/* Wrench icon */}
    <svg
      width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ position: 'relative' }}
    >
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
    </svg>
    <span
      className="relative text-[10px] font-black uppercase tracking-[0.2em]"
      style={{ color: '#fbbf24' }}
    >
      Under Construction
    </span>
    <span
      className="relative text-[8px] uppercase tracking-[0.12em]"
      style={{ color: 'rgba(251,191,36,0.45)' }}
    >
      Coming Soon
    </span>
  </div>
);

// ==================== Platform Icons ====================
const PlatformIcon = ({ id, className = 'w-5 h-5' }) => {
  const icons = {
    shodan: (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>
        <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
        <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    censys: (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 3C7 3 3 7 3 12C3 17 7 21 12 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M21 12C21 9 19.5 6.5 17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <path d="M15 17L16.5 18.5L19 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    virustotal: (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 3L21 7.5V12C21 16.5 17 20.5 12 22C7 20.5 3 16.5 3 12V7.5L12 3Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    greynoise: (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M3 18C3 18 7 6 12 6C17 6 21 18 21 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M6 15C6 15 9 9 12 9C15 9 18 15 18 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.6"/>
        <circle cx="12" cy="17" r="2" fill="currentColor"/>
      </svg>
    ),
    hibp: (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5L12 2Z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
        <path d="M12 7V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
    ),
    dehashed: (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <path d="M7 8V6C7 4.3 8.3 3 10 3H14C15.7 3 17 4.3 17 6V8" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <line x1="12" y1="16" x2="12" y2="18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  };
  return icons[id] || <svg className={className} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></svg>;
};

// ==================== Platform accent colors ====================
const PLATFORM_META = {
  shodan:        { color: '#f97316', border: 'rgba(249,115,22,0.25)',  bg: 'rgba(249,115,22,0.08)',  label: 'Devices' },
  censys:        { color: '#818cf8', border: 'rgba(129,140,248,0.25)', bg: 'rgba(129,140,248,0.08)', label: 'Assets' },
  virustotal:    { color: '#34d399', border: 'rgba(52,211,153,0.25)',  bg: 'rgba(52,211,153,0.08)',  label: 'Malware' },
  greynoise:     { color: '#94a3b8', border: 'rgba(148,163,184,0.25)', bg: 'rgba(148,163,184,0.08)', label: 'Noise' },
  haveibeenpwned:{ color: '#f87171', border: 'rgba(248,113,113,0.25)', bg: 'rgba(248,113,113,0.08)', label: 'Breaches' },
  dehashed:      { color: '#c084fc', border: 'rgba(192,132,252,0.25)', bg: 'rgba(192,132,252,0.08)', label: 'Creds' },
};

// ==================== Under Construction IDs ====================
const UNDER_CONSTRUCTION_MODULES = ['scam-email', 'phone-number', 'crypto-wallet', 'email-leak'];
const UNDER_CONSTRUCTION_PLATFORMS = [''];

// ==================== InvestigationModules ====================
export const InvestigationModules = ({ onStartScan, selectedTarget }) => {
  const [modules] = useState(defaultModules);
  const [platforms] = useState(defaultPlatforms);
  const [stats] = useState({ total: 45, active: 3 });
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Small delay before showing content for a smoother visual handover
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 font-sans">
      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'TOTAL SCANS (30D)', value: stats.total, color: 'text-white', sub: '+12% this week' },
          { label: 'ACTIVE NOW',        value: stats.active, color: 'text-[#2DD4BF]', sub: 'Modules running' },
        ].map(({ label, value, color, sub }, idx) => (
          <div 
            key={label} 
            className="relative border border-white/10 rounded-2xl p-5 bg-black overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/3 to-transparent pointer-events-none"/>
            <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#00E5FF]/30"/>
            <div className="text-white/35 text-[9px] uppercase tracking-[0.14em] mb-1">{label}</div>
            <div className={`text-4xl font-bold leading-none ${color} mb-1`}>{value}</div>
            <div className="text-white/20 text-[9px] uppercase tracking-[0.1em]">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Investigation Modules ── */}
      <div>
        <div className={`flex items-center gap-3 mb-5 transition-all duration-700 ease-out ${
          showContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}>
          <div className="w-0.5 h-7 bg-gradient-to-b from-[#00E5FF] to-[#2DD4BF]"/>
          <h3 className="text-white text-[13px] font-bold uppercase tracking-[0.14em]">Investigation Modules</h3>
          <span className="text-[8px] px-2 py-0.5 border border-white/15 text-white/35 uppercase tracking-[0.1em] rounded-sm">
            {modules.length} AVAILABLE
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoading
            ? [0,1,2,3].map(i => <ModuleCardSkeleton key={i} index={i}/>)
            : modules.map((module, idx) => {
                const meta = MODULE_META[module.id] || MODULE_META['job-recruitment'];
                const risk = RISK_CONFIG[meta.risk];
                const isHovered = hoveredId === module.id;
                const isUnderConstruction = UNDER_CONSTRUCTION_MODULES.includes(module.id);

                return (
                  <button
                    key={module.id}
                    onClick={() => !isUnderConstruction && onStartScan(module, selectedTarget)}
                    onMouseEnter={() => setHoveredId(module.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`group relative text-left rounded-2xl overflow-hidden transition-all duration-700 ease-out ${
                      showContent ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.97]'
                    } ${isUnderConstruction ? 'cursor-default' : ''}`}
                    style={{ 
                      transitionDelay: `${300 + idx * 80}ms`,
                      background: isHovered
                        ? `linear-gradient(135deg, ${meta.accentBg} 0%, #0a0a0a 60%)`
                        : 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, #0a0a0a 60%)',
                      border: `1px solid ${isHovered ? meta.hoverBorder : meta.border}`,
                      boxShadow: isHovered
                        ? `0 0 0 1px ${meta.hoverBorder}, 0 8px 32px ${meta.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`
                        : `0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)`,
                      minHeight: 220,
                    }}
                  >
                    {/* Under Construction Overlay */}
                    {isUnderConstruction && <UnderConstructionOverlay rounded="1rem" />}

                    {/* Top glow line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${meta.accent}, transparent)`,
                        opacity: isHovered ? 0.7 : 0.2,
                      }}
                    />

                    {/* Dot grid bg */}
                    <div
                      className="absolute inset-0 opacity-[0.018] pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(circle, ${meta.accent} 1px, transparent 1px)`,
                        backgroundSize: '20px 20px',
                      }}
                    />

                    {/* Corner brackets */}
                    <span className="absolute top-3 left-3 w-3 h-3 border-t border-l transition-colors duration-300"
                      style={{ borderColor: isHovered ? meta.accent : `${meta.accent}44` }}/>
                    <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r transition-colors duration-300"
                      style={{ borderColor: isHovered ? meta.accent : `${meta.accent}44` }}/>

                    <div className="relative p-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3">
                          {/* Icon container with glow */}
                          <div
                            className="relative flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-300"
                            style={{
                              width: 56, height: 56,
                              background: isHovered
                                ? `radial-gradient(circle at 40% 35%, ${meta.accentBg.replace('0.07','0.18')}, rgba(0,0,0,0.6))`
                                : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${isHovered ? meta.hoverBorder : meta.border}`,
                              boxShadow: isHovered ? `0 0 20px ${meta.glow}` : 'none',
                            }}
                          >
                            <ModuleIcon type={module.id} size={34}/>
                          </div>

                          <div className="pt-0.5">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white text-[14px] font-bold uppercase tracking-[0.05em] leading-tight">
                                {module.name}
                              </h4>
                            </div>
                            <div className="text-[9px] uppercase tracking-[0.14em] font-semibold"
                              style={{ color: `${meta.accent}99` }}>
                              AI-POWERED · REAL-TIME
                            </div>
                          </div>
                        </div>

                        {/* Risk badge */}
                        <div
                          className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-full text-[8px] font-black tracking-widest uppercase"
                          style={{ color: risk.color, background: risk.bg, border: `1px solid ${risk.color}33` }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: risk.color }}/>
                          {risk.label}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-white/50 text-[12px] leading-relaxed mb-4">{module.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {meta.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-[8px] px-2 py-1 rounded-full uppercase tracking-[0.08em] font-semibold transition-colors duration-200"
                            style={{
                              color: isHovered ? meta.accent : `${meta.accent}80`,
                              background: isHovered ? meta.accentBg : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${isHovered ? meta.hoverBorder : 'rgba(255,255,255,0.08)'}`,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Footer: stats + arrow */}
                      <div
                        className="flex items-center justify-between pt-3"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex gap-4">
                          {meta.stats.map(({ label, value }) => (
                            <div key={label}>
                              <div className="text-[8px] text-white/30 uppercase tracking-[0.1em] mb-0.5">{label}</div>
                              <div className="text-[12px] font-bold" style={{ color: meta.accent }}>{value}</div>
                            </div>
                          ))}
                        </div>

                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                          style={{
                            border: `1px solid ${isHovered ? meta.accent : `${meta.accent}44`}`,
                            background: isHovered ? meta.accentBg : 'transparent',
                            boxShadow: isHovered ? `0 0 10px ${meta.glow}` : 'none',
                          }}
                        >
                          <svg className="w-3 h-3 transition-transform duration-200" style={{ color: meta.accent, transform: isHovered ? 'translateX(1px)' : 'none' }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
          }
        </div>
      </div>

      {/* ── Open Source Platforms ── */}
      <div>
        <div className={`flex items-center gap-3 mb-5 transition-all duration-500 ease-out delay-200 ${
          !isLoading && showContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}>
          <div className="w-0.5 h-7 bg-gradient-to-b from-[#2DD4BF] to-[#00E5FF]"/>
          <h3 className="text-white text-[13px] font-bold uppercase tracking-[0.14em]">Open Source Platforms</h3>
          <span className="text-[8px] px-2 py-0.5 border border-white/15 text-white/35 uppercase tracking-[0.1em] rounded-sm">
            {platforms.length} INTEGRATED
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {isLoading ? (
            <div className="contents animate-in fade-in duration-500">
              {[0,1,2,3,4,5].map(i => <PlatformCardSkeleton key={i} index={i}/>)}
            </div>
          ) : (
            platforms.map((platform, idx) => {
              const pm = PLATFORM_META[platform.id] || { color: '#00E5FF', border: 'rgba(0,229,255,0.2)', bg: 'rgba(0,229,255,0.07)', label: 'Intel' };
                const isH = hoveredId === platform.id;
                const isUnderConstruction = UNDER_CONSTRUCTION_PLATFORMS.includes(platform.id);

                return (
                  <button
                    key={platform.id}
                    onClick={() => !isUnderConstruction && onStartScan(platform, selectedTarget)}
                    onMouseEnter={() => setHoveredId(platform.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`group relative text-left rounded-xl overflow-hidden transition-all duration-700 ease-out ${
                      showContent ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98]'
                    } ${isUnderConstruction ? 'cursor-default' : ''}`}
                    style={{ 
                      transitionDelay: `${800 + idx * 60}ms`,
                      background: isH
                        ? `linear-gradient(135deg, ${pm.bg} 0%, #0a0a0a 70%)`
                        : 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, #0a0a0a 70%)',
                      border: `1px solid ${isH ? pm.border.replace('0.25','0.5') : pm.border}`,
                      boxShadow: isH
                        ? `0 0 0 1px ${pm.border.replace('0.25','0.3')}, 0 6px 20px ${pm.bg}, inset 0 1px 0 rgba(255,255,255,0.04)`
                        : `0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)`,
                      minHeight: 110,
                    }}
                  >
                    {/* Under Construction Overlay */}
                    {isUnderConstruction && <UnderConstructionOverlay rounded="0.75rem" />}

                    {/* top glow line */}
                    <div className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300"
                      style={{ background: `linear-gradient(90deg, transparent, ${pm.color}, transparent)`, opacity: isH ? 0.6 : 0.15 }}/>

                    <div className="relative p-4 flex flex-col gap-3">
                      {/* Icon + name row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0"
                            style={{
                              background: isH ? pm.bg : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${isH ? pm.border.replace('0.25','0.5') : pm.border}`,
                              boxShadow: isH ? `0 0 12px ${pm.bg}` : 'none',
                              color: pm.color,
                            }}
                          >
                            <PlatformIcon id={platform.id} className="w-5 h-5"/>
                          </div>
                          <div>
                            <h4 className="text-white text-[12px] font-bold uppercase tracking-[0.06em] leading-tight">{platform.name}</h4>
                            <span className="text-[8px] uppercase tracking-[0.1em] font-semibold" style={{ color: `${pm.color}80` }}>{pm.label}</span>
                          </div>
                        </div>
                        <svg className="w-3 h-3 transition-all duration-200 flex-shrink-0"
                          style={{ color: pm.color, opacity: isH ? 1 : 0.3, transform: isH ? 'translateX(1px)' : 'none' }}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                      </div>

                      {/* Description */}
                      <p className="text-white/35 text-[10px] uppercase tracking-[0.06em] leading-relaxed">
                        {platform.description}
                      </p>

                      {/* Bottom indicator bar */}
                      <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: isH ? '100%' : '30%',
                            background: `linear-gradient(90deg, ${pm.color}80, ${pm.color})`,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                );
              }))
          }
        </div>
      </div>
    </div>
  );
};

// ==================== CustomScanConfig (unchanged) ====================
export const CustomScanConfig = ({
  scanOptions, toggleOption, selectedProjectForScan,
  searchInput, onStartCustomScan, isLoading
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

  const activeOptionsCount = Object.values(scanOptions).filter(v => v === true).length;

  return (
    <div className="grid lg:grid-cols-3 gap-6 font-sans">
      <div className="lg:col-span-2 space-y-6">
        {savedConfigs.length > 0 && (
          <div className="border border-white/10 rounded-2xl p-5 bg-black">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-[13px] font-bold uppercase tracking-[0.12em] flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
                Saved Configurations
              </h3>
              <span className="text-[8px] text-white/30 uppercase tracking-[0.08em]">{savedConfigs.length} SAVED</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedConfigs.map(config => (
                <div key={config.id} className={`px-2 py-1 text-[9px] uppercase tracking-[0.08em] cursor-pointer transition-colors rounded-sm ${
                  selectedConfig?.id === config.id
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}>{config.name}</div>
              ))}
            </div>
          </div>
        )}

        <div className="relative border border-white/10 rounded-2xl p-5 bg-black overflow-hidden">
          <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#00E5FF]/20"/>
          <span className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#00E5FF]/20"/>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white text-[13px] font-bold uppercase tracking-[0.12em] flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
              </svg>
              Scan Configuration
            </h3>
            <button onClick={() => setShowSaveDialog(true)} disabled={activeOptionsCount === 0}
              className="text-[8px] px-2.5 py-1.5 border border-white/10 hover:border-[#00E5FF]/30 text-white/50 hover:text-[#00E5FF] transition-colors flex items-center gap-1.5 uppercase tracking-[0.08em] disabled:opacity-40 rounded-sm">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
              </svg>
              SAVE CONFIG
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(scanOptions).map(([key, value]) => (
              <FancyCheckbox key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} checked={value} onChange={() => toggleOption(key)}/>
            ))}
          </div>
        </div>

        <div className="relative border border-white/10 rounded-2xl p-5 bg-black overflow-hidden">
          <h3 className="text-white text-[13px] font-bold uppercase tracking-[0.12em] mb-5 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"/>
            </svg>
            Performance Metrics
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { value: stats.totalScans, label: 'TOTAL SCANS', color: 'text-white' },
              { value: stats.avgTime,    label: 'AVG TIME',    color: 'text-white' },
              { value: `${stats.successRate}%`, label: 'SUCCESS', color: 'text-[#00E5FF]' },
            ].map(({ value, label, color }) => (
              <div key={label} className="relative bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 text-center">
                <div className={`text-2xl font-bold leading-none mb-1 ${color}`}>{value}</div>
                <div className="text-white/30 text-[8px] uppercase tracking-[0.1em]">{label}</div>
              </div>
            ))}
          </div>
          <div className="relative text-center py-8 bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden min-h-[160px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px)', backgroundSize: '24px 24px' }}/>
            <svg className="w-10 h-10 mx-auto text-white/15 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233l3.277-3.277a2.543 2.543 0 10-3.594-3.594l-3.277 3.277m0 0L9.75 8.352"/>
            </svg>
            <p className="relative text-white/30 text-[10px] uppercase tracking-[0.12em]">Advanced Performance Tuning</p>
            <p className="relative text-white/15 text-[8px] uppercase tracking-[0.1em] mt-1">Coming in next release</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="relative border border-white/10 rounded-2xl p-5 bg-black overflow-hidden">
          <span className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#00E5FF]/25"/>
          <span className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#00E5FF]/25"/>
          <span className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#00E5FF]/25"/>
          <span className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#00E5FF]/25"/>
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #00E5FF 1px, transparent 1px)', backgroundSize: '16px 16px' }}/>
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
              onClick={onStartCustomScan}
              disabled={isLoading || (!selectedProjectForScan && !searchInput)}
              className="relative w-full mt-1 py-2.5 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors rounded-xl text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 disabled:opacity-40 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/0 via-[#00E5FF]/5 to-[#00E5FF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
              {isLoading ? <span className="relative">Starting...</span> : (
                <>
                  <svg className="relative w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  </svg>
                  <span className="relative">Start Custom Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="border border-white/10 rounded-2xl p-5 bg-black">
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

      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative border border-white/10 rounded-2xl p-6 max-w-md w-full bg-black">
            <span className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#00E5FF]/30"/>
            <span className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#00E5FF]/30"/>
            <span className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#00E5FF]/30"/>
            <span className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#00E5FF]/30"/>
            <h3 className="text-white text-[13px] font-bold uppercase tracking-[0.12em] mb-4">Save Configuration</h3>
            <input type="text" value={configName} onChange={(e) => setConfigName(e.target.value)}
              placeholder="Enter configuration name" autoFocus
              className="w-full px-3 py-2.5 bg-white/5 border border-white/[0.08] text-white text-[12px] focus:outline-none focus:border-[#00E5FF]/50 transition-colors mb-4 rounded-lg"/>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 border border-white/10 text-white/55 hover:text-white text-[10px] uppercase tracking-[0.08em] transition-colors rounded-lg">
                Cancel
              </button>
              <button onClick={handleSaveConfig} disabled={!configName.trim() || loading}
                className="px-4 py-2 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10 text-[10px] uppercase tracking-[0.08em] transition-colors disabled:opacity-40 flex items-center gap-2 rounded-lg">
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};