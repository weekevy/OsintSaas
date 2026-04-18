const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#080b0d] z-50">
      
      {/* Simple spinning circle */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-[#00ff88]/30 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-[#00ff88] rounded-full" />
        </div>
      </div>
      
      {/* Brand name */}
      <h2 className="mt-6 text-lg font-display font-bold tracking-wider">
        <span className="text-[#00ff88]">Weekey</span>
        <span className="text-white">Osint</span>
      </h2>
      
      {/* Loading text */}
      <p className="mt-3 text-white/40 text-[10px] font-mono tracking-[0.2em] uppercase">
        LOADING
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
