import React from 'react';
import { getIcon } from '../utils/icons';

// ==================== RunningScans Component with Remove ====================
export const RunningScans = ({ 
  runningScans, 
  onRefresh,
  onStartScanExecution, 
  onPauseScan, 
  onStopScan, 
  onResumeScan, 
  onEditScan,
  onRemoveScan
}) => {
  if (!runningScans || runningScans.length === 0) return null;

  const handleRemove = (scanId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this scan?')) {
      onRemoveScan(scanId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full animate-pulse" />
          <h3 className="text-white font-semibold">Active Scans ({runningScans.length})</h3>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        )}
      </div>
      
      <div className="grid gap-4">
        {runningScans.map(scan => (
          <div key={scan.id} className="group bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-purple-500/50 transition-all relative">
            {/* Remove button - Always visible */}
            <button
              onClick={(e) => handleRemove(scan.id, e)}
              className="absolute top-3 right-3 p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-all z-10"
              title="Remove scan"
            >
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <div className="flex items-center justify-between mb-3 pr-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  {getIcon(scan.toolIcon)}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{scan.tool}</h4>
                  <p className="text-white/40 text-sm">Target: {scan.target}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Show buttons for queued scans */}
                {(scan.status === 'queued' || scan.status === 'pending') && (
                  <>
                    <button
                      onClick={() => onStartScanExecution(scan.id)}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                      title="Start Scan"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEditScan(scan)}
                      className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                      title="Edit Assets"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                  </>
                )}
                
                {scan.status === 'running' && (
                  <>
                    <button
                      onClick={() => onPauseScan(scan.id)}
                      className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
                      title="Pause Scan"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onStopScan(scan.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Stop Scan"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
                
                {scan.status === 'paused' && (
                  <>
                    <button
                      onClick={() => onResumeScan(scan.id)}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                      title="Resume Scan"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onStopScan(scan.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Stop Scan"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
                
                {scan.status === 'stopped' && (
                  <span className="text-red-400 text-sm bg-red-500/20 px-2 py-1 rounded-full">
                    Stopped
                  </span>
                )}
                
                <span className={`flex items-center gap-1 text-sm ${
                  scan.status === 'running' ? 'text-green-400' :
                  scan.status === 'paused' ? 'text-yellow-400' :
                  scan.status === 'stopped' ? 'text-red-400' :
                  scan.status === 'queued' ? 'text-blue-400' :
                  'text-white/40'
                }`}>
                  {scan.status === 'running' && (
                    <>
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Running
                    </>
                  )}
                  {scan.status === 'queued' && (
                    <>
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      Queued
                    </>
                  )}
                  {scan.status === 'paused' && (
                    <>
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                      Paused
                    </>
                  )}
                  {scan.status === 'pending' && 'Pending'}
                </span>
              </div>
            </div>

            {scan.status === 'running' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Progress</span>
                  <span className="text-white font-medium">{Math.round(scan.progress)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 relative"
                    style={{ width: `${scan.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            )}
            
            {scan.assets && Object.keys(scan.assets).length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span>Assets: {Object.keys(scan.assets).length} items</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== ScanHistory Component with Remove ====================
export const ScanHistory = ({ scanHistory, onRemoveScan }) => {
  if (!scanHistory || scanHistory.length === 0) return null;

  const handleRemove = (scanId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this scan from history?')) {
      onRemoveScan(scanId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
        <h3 className="text-white font-semibold">Recent Scans</h3>
      </div>

      <div className="grid gap-3">
        {scanHistory.slice(0, 3).map(scan => (
          <div key={scan.id} className="group bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-blue-500/50 transition-all relative">
            {/* Remove button */}
            <button
              onClick={(e) => handleRemove(scan.id, e)}
              className="absolute top-3 right-3 p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
              title="Delete scan"
            >
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  {getIcon(scan.toolIcon)}
                </div>
                <div>
                  <h4 className="text-white font-medium">{scan.tool}</h4>
                  <p className="text-white/40 text-xs">{scan.target}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {scan.findings && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                    {scan.findings} findings
                  </span>
                )}
                <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded-full">
                  Completed
                </span>
                <button className="text-purple-400 hover:text-purple-300 p-1 hover:bg-white/5 rounded-lg transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== ScheduledScans Component ====================
export const ScheduledScans = ({ scanHistory, runningScans }) => {
  const totalFindings = scanHistory?.reduce((acc, scan) => acc + (scan.findings || 0), 0) || 0;

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
            <div className="text-2xl font-bold text-white">{scanHistory?.length || 0}</div>
            <div className="text-white/40 text-sm">Completed Scans</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{runningScans?.length || 0}</div>
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
