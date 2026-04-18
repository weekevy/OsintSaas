const BackgroundEffects = ({ mousePosition }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated gradient orbs - Tactical acid green */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-[#00ff88] rounded-full mix-blend-screen filter blur-3xl opacity-[0.03] animate-blob" />
      <div className="absolute top-0 -right-40 w-96 h-96 bg-[#22d3ee] rounded-full mix-blend-screen filter blur-3xl opacity-[0.02] animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 left-20 w-96 h-96 bg-[#00ff88] rounded-full mix-blend-screen filter blur-3xl opacity-[0.02] animate-blob animation-delay-4000" />
      
      {/* Mouse follower gradient - Acid green */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl transition-all duration-1000 ease-out pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0, 255, 136, 0.15) 0%, transparent 70%)',
          left: mousePosition.x - 250,
          top: mousePosition.y - 250,
        }}
      />
      
      {/* Tactical grid - Acid green tint */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Scanline overlay for tactical feel */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent_3px,rgba(0,255,136,0.008)_3px,rgba(0,255,136,0.008)_4px)]" />
    </div>
  );
};

export default BackgroundEffects;