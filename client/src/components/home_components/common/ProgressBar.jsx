import { useState, useEffect } from 'react';

const ProgressBar = ({ isLoading }) => {
  // TEMPORARILY DISABLED - Remove the line below to re-enable the progress bar
  return null;
  
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      // Reset progress when loading starts
      setProgress(0);
      
      // Animate progress from 0 to 95% (never reaches 100% until complete)
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95;
          // Slow down as it gets higher
          const increment = Math.max(1, (100 - prev) / 20);
          return Math.min(95, prev + increment);
        });
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      // Complete the progress bar when loading finishes
      setProgress(100);
      // Reset after animation completes
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  if (progress === 0) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-1 z-[99999] overflow-hidden">
        <div 
          className="h-full transition-all duration-200 ease-out"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #A855F7, #3B82F6, #06B6D4, #EC4899, #A855F7)',
            backgroundSize: '200% 100%',
            animation: 'progressShimmer 1s linear infinite'
          }}
        />
      </div>
      <style>{`
        @keyframes progressShimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
    </>
  );
};

export default ProgressBar;
