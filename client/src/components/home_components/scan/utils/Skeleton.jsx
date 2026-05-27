import React from 'react';

export const ScanCardSkeleton = ({ index }) => {
  const staggerDelay = `${index * 40}ms`;

  return (
    <div
      className="relative border border-white/10 rounded-xl sm:rounded-2xl bg-black/40 overflow-hidden transform-gpu animate-skeleton-entry will-change-transform"
      style={{ animationDelay: staggerDelay }}
    >
      {/* Rapid, Smooth Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer-fast bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none will-change-transform" />

      {/* Atmospheric Inner Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] via-transparent to-transparent pointer-events-none" />
      
      <div className="relative p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0">
            {/* Icon skeleton - rapid pulse */}
            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white/[0.06] border border-white/10 rounded-lg sm:rounded-xl flex-shrink-0 animate-pulse-fast will-change-opacity" />
            
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                {/* Title skeleton */}
                <div className="h-3.5 sm:h-4 bg-white/10 rounded-md w-32 sm:w-48 animate-pulse-fast will-change-opacity" />
                {/* Status badge skeleton */}
                <div className="h-4.5 sm:h-5.5 bg-white/5 border border-white/10 rounded-lg w-16 sm:w-24 animate-pulse-fast will-change-opacity" />
              </div>
              {/* Target skeleton */}
              <div className="h-2 sm:h-2.5 bg-white/[0.04] rounded-md w-3/4 max-w-[280px] animate-pulse-fast will-change-opacity" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-7 sm:h-8.5 w-14 sm:w-20 bg-white/5 border border-white/10 rounded-lg animate-pulse-fast will-change-opacity" />
            ))}
          </div>
        </div>

        {/* Progress bar skeleton */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-white/5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-[#00E5FF]/10 rounded-full animate-pulse" />
              <div className="h-1.5 bg-white/5 rounded w-32 animate-pulse-fast" />
            </div>
            <div className="h-2 bg-white/10 rounded w-10 animate-pulse-fast" />
          </div>
          <div className="h-1 sm:h-1.5 bg-white/5 rounded-full w-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-white/5 via-white/10 to-white/5 w-1/3 animate-shimmer-fast will-change-transform" />
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes skeleton-entry {
          0% { opacity: 0; transform: translate3d(0, 12px, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes shimmer-fast {
          0% { transform: translate3d(-100%, 0, 0); }
          100% { transform: translate3d(100%, 0, 0); }
        }
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.15; }
        }
        .animate-skeleton-entry {
          animation: skeleton-entry 0.35s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }
        .animate-shimmer-fast {
          animation: shimmer-fast 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-pulse-fast {
          animation: pulse-fast 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export const ScanHistorySkeleton = ({ index }) => {
  const staggerDelay = `${index * 30}ms`;

  return (
    <div
      className="relative border border-white/10 rounded-xl sm:rounded-2xl bg-black/40 overflow-hidden transform-gpu animate-skeleton-entry will-change-transform"
      style={{ animationDelay: staggerDelay }}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer-fast bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none will-change-transform" />
      <div className="absolute left-0 top-4 bottom-4 w-1 bg-white/10 rounded-full" />

      <div className="relative pl-7 pr-5 py-4.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-11 h-11 bg-white/[0.06] border border-white/10 rounded-xl flex-shrink-0 animate-pulse-fast will-change-opacity" />
            <div className="min-w-0 flex-1">
              <div className="h-3.5 bg-white/10 rounded w-40 mb-2 animate-pulse-fast" />
              <div className="h-2.5 bg-white/5 rounded w-64 animate-pulse-fast" />
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div key={i} className="h-7.5 w-20 bg-white/5 border border-white/10 rounded-xl animate-pulse-fast" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ScanDashboardSkeleton = () => {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        {[0, 1, 2].map(i => (
          <ScanCardSkeleton key={i} index={i} />
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6 px-2">
           <div className="h-3 bg-white/5 rounded w-40 animate-pulse-fast" />
           <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-48 bg-white/[0.02] border border-white/10 rounded-2xl animate-pulse-fast" />
          ))}
        </div>
      </div>
    </div>
  );
};

