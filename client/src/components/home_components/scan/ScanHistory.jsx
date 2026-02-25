import React from 'react';
import { getIcon } from './utils/icons';

const ScanHistory = ({ scanHistory }) => {
  if (scanHistory.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
        <h3 className="text-white font-semibold">Recent Scans</h3>
      </div>

      <div className="grid gap-3">
        {scanHistory.slice(0, 3).map(scan => (
          <div key={scan.id} className="group bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between">
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

export default ScanHistory;
