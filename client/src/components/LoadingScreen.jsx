const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      
      {/* Simple background - removed heavy blurs */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #00E5FF 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Main Loader Container */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Simple Single Ring Loader */}
        <div className="relative w-16 h-16 mb-6">
          {/* Single spinning circle */}
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div 
            className="absolute inset-0 rounded-full border-2 border-t-[#00E5FF] border-r-transparent border-b-transparent border-l-transparent animate-spin"
            style={{ animationDuration: '0.8s' }}
          />
        </div>

        {/* Brand name - simplified */}
        <h2 className="text-2xl font-bold tracking-tight">
          <span className="text-white">Weekey</span>
          <span className="bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] bg-clip-text text-transparent">Osint</span>
        </h2>

        {/* Simple loading text */}
        <p className="mt-4 text-[10px] font-medium text-white/30 uppercase tracking-wider">
          Loading...
        </p>
      </div>

      {/* Minimal animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;