import { useState } from 'react';

const ActivityLog = () => {
  const [filter, setFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activities = [
    { id: 1, user: 'John Doe', action: 'Created investigation', target: 'Phishing Campaign Q1', timestamp: '2 minutes ago', type: 'create' },
    { id: 2, user: 'Jane Smith', action: 'Generated report', target: 'Threat Intelligence Summary', timestamp: '15 minutes ago', type: 'report' },
    { id: 3, user: 'Mike Johnson', action: 'Added comment', target: 'Ransomware Analysis', timestamp: '1 hour ago', type: 'comment' },
    { id: 4, user: 'Sarah Williams', action: 'Exported data', target: 'IOC List', timestamp: '3 hours ago', type: 'export' },
    { id: 5, user: 'John Doe', action: 'Updated project', target: 'Dark Web Monitoring', timestamp: '5 hours ago', type: 'update' },
    { id: 6, user: 'Jane Smith', action: 'Shared report', target: 'Executive Summary', timestamp: '1 day ago', type: 'share' }
  ];

  const getActivityIcon = (type) => {
    const icons = { create: '➕', report: '📊', comment: '💬', export: '📤', update: '✏️', share: '🔗' };
    return icons[type] || '📋';
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-4 sm:p-6">
      {/* Header - Mobile Friendly */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h3 className="text-base sm:text-lg font-semibold text-white">Activity Log</h3>
        
        {/* Mobile Filter Dropdown */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm flex items-center justify-between"
          >
            <span>{filter === 'all' ? 'All Activities' : filter.charAt(0) + filter.slice(1) + 's'}</span>
            <svg className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isFilterOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-white/10 rounded-lg overflow-hidden z-10">
              {['all', 'create', 'report', 'comment', 'export'].map((option) => (
                <button
                  key={option}
                  onClick={() => { setFilter(option); setIsFilterOpen(false); }}
                  className={`w-full px-4 py-2 text-left text-sm ${filter === option ? 'text-[#00E5FF] bg-white/10' : 'text-white/80'}`}
                >
                  {option === 'all' ? 'All Activities' : option.charAt(0) + option.slice(1) + 's'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Filter */}
        <div className="hidden sm:flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm focus:outline-none focus:border-[#00E5FF]/50"
          >
            <option value="all">All Activities</option>
            <option value="create">Creations</option>
            <option value="report">Reports</option>
            <option value="comment">Comments</option>
            <option value="export">Exports</option>
          </select>
          
          <button className="p-1.5 bg-white/5 text-white/60 hover:text-[#00E5FF] hover:bg-white/10 rounded-lg transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Activity List - Optimized for touch */}
      <div className="space-y-2 sm:space-y-3">
        {activities
          .filter(activity => filter === 'all' || activity.type === filter)
          .map((activity) => (
            <div key={activity.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl active:bg-white/5 transition-all cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#00E5FF]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-base sm:text-lg">{getActivityIcon(activity.type)}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                  <span className="text-white font-medium text-sm sm:text-base truncate">{activity.user}</span>
                  <span className="text-white/60 text-xs sm:text-sm truncate">{activity.action}</span>
                  <span className="text-[#00E5FF] text-xs sm:text-sm truncate">{activity.target}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white/40 text-[10px] sm:text-xs">{activity.timestamp}</span>
                  <span className="text-white/40 text-[10px] sm:text-xs capitalize">{activity.type}</span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Mobile Optimized Button */}
      <button className="w-full mt-4 pt-3 sm:pt-4 text-[#00E5FF] hover:text-[#00E5FF]/80 text-xs sm:text-sm flex items-center justify-center gap-1 border-t border-white/10">
        View Full Activity Log
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

export default ActivityLog;