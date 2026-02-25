import React from 'react';

const Header = ({ totalScans }) => (
  <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20 blur-3xl" />
    <div className="relative flex items-center justify-between">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
          <span className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3 rounded-2xl">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
            </svg>
          </span>
          Scan
        </h1>
        <p className="text-white/40 text-sm mt-2 flex items-center gap-2">
          <span className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" />
          OSINT investigation and threat analysis
        </p>
      </div>
      
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 px-4 py-2">
        <div className="text-xs text-white/40">Total Scans</div>
        <div className="text-xl font-bold text-white">{totalScans}</div>
      </div>
    </div>
  </div>
);

export default Header;
