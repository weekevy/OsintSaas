import { useState } from 'react';

const ActivityLog = () => {
  const [filter, setFilter] = useState('all');

  const activities = [
    {
      id: 1,
      user: 'John Doe',
      action: 'Created investigation',
      target: 'Phishing Campaign Q1',
      timestamp: '2 minutes ago',
      type: 'create'
    },
    {
      id: 2,
      user: 'Jane Smith',
      action: 'Generated report',
      target: 'Threat Intelligence Summary',
      timestamp: '15 minutes ago',
      type: 'report'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'Added comment',
      target: 'Ransomware Analysis',
      timestamp: '1 hour ago',
      type: 'comment'
    },
    {
      id: 4,
      user: 'Sarah Williams',
      action: 'Exported data',
      target: 'IOC List',
      timestamp: '3 hours ago',
      type: 'export'
    },
    {
      id: 5,
      user: 'John Doe',
      action: 'Updated project',
      target: 'Dark Web Monitoring',
      timestamp: '5 hours ago',
      type: 'update'
    },
    {
      id: 6,
      user: 'Jane Smith',
      action: 'Shared report',
      target: 'Executive Summary',
      timestamp: '1 day ago',
      type: 'share'
    }
  ];

  const getActivityIcon = (type) => {
    switch(type) {
      case 'create': return '➕';
      case 'report': return '📊';
      case 'comment': return '💬';
      case 'export': return '📤';
      case 'update': return '✏️';
      case 'share': return '🔗';
      default: return '📋';
    }
  };

  return (
    <div className="glass-card border border-white/10 p-6 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Activity Log</h3>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm focus:outline-none focus:border-[#00E5FF]/50"
          >
            <option value="all">All Activities</option>
            <option value="create">Creations</option>
            <option value="report">Reports</option>
            <option value="comment">Comments</option>
            <option value="export">Exports</option>
          </select>
          
          <button className="px-3 py-2 bg-white/5 text-white/60 hover:text-[#00E5FF] hover:bg-white/10 rounded-lg transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {activities
          .filter(activity => filter === 'all' || activity.type === filter)
          .map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-medium">{activity.user}</span>
                  <span className="text-white/60">{activity.action}</span>
                  <span className="text-[#00E5FF]">{activity.target}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-white/40 text-xs">{activity.timestamp}</span>
                  <span className="text-white/40 text-xs capitalize">{activity.type}</span>
                </div>
              </div>
            </div>
          ))}
      </div>

      <button className="w-full mt-4 pt-4 text-[#00E5FF] hover:text-[#00E5FF]/80 text-sm flex items-center justify-center gap-1 border-t border-white/10">
        View Full Activity Log
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

export default ActivityLog;