import React from 'react';
import { getIcon } from './utils/icons';

const RunningScans = ({ 
  runningScans, 
  onStartScanExecution, 
  onPauseScan, 
  onStopScan, 
  onResumeScan, 
  onEditScan 
}) => {
  if (runningScans.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full animate-pulse" />
        <h3 className="text-white font-semibold">Active Scans ({runningScans.length})</h3>
      </div>
      
      <div className="grid gap-4">
        {runningScans.map(scan => (
          <div key={scan.id} className="group bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
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
                {scan.status === 'pending' && (
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
                  'text-white/40'
                }`}>
                  {scan.status === 'running' && (
                    <>
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Running
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

export default RunningScans;
