import React from 'react';

const ScheduledScans = ({ scanHistory, runningScans }) => {
  const totalFindings = scanHistory.reduce((acc, scan) => acc + (scan.findings || 0), 0);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Scheduled Scans</h3>
          <p className="text-white/40 mb-6 max-w-md mx-auto">
            Set up automated recurring scans to continuously monitor your targets
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Schedule
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
        <div className="space-y-4">
          <div>
            <div className="text-2xl font-bold text-white">{scanHistory.length}</div>
            <div className="text-white/40 text-sm">Completed Scans</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{runningScans.length}</div>
            <div className="text-white/40 text-sm">Active Scans</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalFindings}</div>
            <div className="text-white/40 text-sm">Findings Detected</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduledScans;
