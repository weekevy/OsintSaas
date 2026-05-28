import React, { useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

const ProductTour = ({ isOpen, onComplete, onSkip, steps = [] }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightStyles, setSpotlightStyles] = useState({});
  const [popupStyles, setPopupStyles] = useState({});
  const [clipPath, setClipPath] = useState('');

  // Reset step when tour is re-opened with different steps
  useLayoutEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen, steps]);

  const currentData = steps[currentStep];

  useLayoutEffect(() => {
    if (!isOpen || !steps.length || !currentData) return;

    const updatePositioning = () => {
      const step = steps[currentStep];
      const element = document.querySelector(step.target);

      if (element) {
        // 1. Ensure element is visible
        element.scrollIntoView({ behavior: 'auto', block: 'center' });
        
        // 2. Accurate rect after scroll
        const rect = element.getBoundingClientRect();
        const padding = 8; // Added some padding for better spotlight
        const t = rect.top - padding;
        const l = rect.left - padding;
        const b = rect.bottom + padding;
        const r = rect.right + padding;
        const vW = window.innerWidth;
        const vH = window.innerHeight;
        
        // Spotlight Calculation
        setSpotlightStyles({
          width: `${rect.width + padding * 2}px`,
          height: `${rect.height + padding * 2}px`,
          top: `${t}px`,
          left: `${l}px`,
          opacity: 1
        });

        setClipPath(`polygon(0% 0%, 0% 100%, ${l}px 100%, ${l}px ${t}px, ${r}px ${t}px, ${r}px ${b}px, ${l}px ${b}px, ${l}px 100%, 100% 100%, 100% 0%)`);

        // Popup Calculation
        const gap = 20;
        const popupWidth = Math.min(380, vW - 40);
        const popupHeight = 220; // Increased to accommodate content better

        if (vW < 768) {
          setPopupStyles({
            bottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
            left: '20px',
            right: '20px',
            width: 'calc(100% - 40px)',
            transform: 'none'
          });
          return;
        }

        let pTop = 0;
        let pLeft = rect.left + rect.width / 2;
        let pTransform = 'translateX(-50%)';

        if (step.position === 'top') {
          pTop = rect.top - popupHeight - gap;
          if (pTop < 20) pTop = rect.bottom + gap;
        } else if (step.position === 'bottom') {
          pTop = rect.bottom + gap;
          if (pTop + popupHeight > vH - 20) pTop = rect.top - popupHeight - gap;
        } else {
          pTop = rect.top + rect.height / 2 - popupHeight / 2;
        }

        if (step.position === 'left') {
          pLeft = rect.left - popupWidth - gap;
          pTransform = 'none';
          if (pLeft < 20) pLeft = rect.right + gap;
        } else if (step.position === 'right') {
          pLeft = rect.right + gap;
          pTransform = 'none';
          if (pLeft + popupWidth > vW - 20) pLeft = rect.left - popupWidth - gap;
        }

        // Final viewport safety shift
        if (step.position === 'top' || step.position === 'bottom') {
          if (pLeft - popupWidth/2 < 20) {
            pLeft = 20; pTransform = 'none';
          } else if (pLeft + popupWidth/2 > vW - 20) {
            pLeft = vW - popupWidth - 20; pTransform = 'none';
          }
        }
        
        pTop = Math.max(20, Math.min(pTop, vH - popupHeight - 20));

        setPopupStyles({
          top: `${pTop}px`,
          left: `${pLeft}px`,
          width: `${popupWidth}px`,
          transform: pTransform
        });
      }
    };

    const timer = setTimeout(updatePositioning, 100);
    window.addEventListener('resize', updatePositioning);
    window.addEventListener('scroll', updatePositioning);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositioning);
      window.removeEventListener('scroll', updatePositioning);
    };
  }, [isOpen, currentStep, steps, currentData]);

  if (!isOpen || !steps.length || !currentData) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] font-['Poppins'] pointer-events-none">
      {/* Dimmed Background with Blur and a HOLE */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px] transition-all duration-300 pointer-events-auto" 
        style={{ clipPath }}
      />

      {/* Spotlight Border (High Highlight) */}
      <div 
        className="absolute rounded-lg border-2 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-all duration-300 ease-in-out pointer-events-none"
        style={spotlightStyles}
      >
        <div className="absolute inset-0 rounded-lg bg-[#00E5FF]/5 animate-pulse" />
      </div>

      {/* Content Popup */}
      <div 
        className="absolute z-10 bg-[#0c0e12] border border-white/10 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
        style={popupStyles}
      >
        <div className="p-6 bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-[#00E5FF] tracking-[0.2em] uppercase">Step {currentStep + 1} of {steps.length}</span>
            <button 
              onClick={onSkip}
              className="text-[10px] font-bold text-white/30 hover:text-white transition-colors uppercase tracking-widest"
            >
              Skip Tour
            </button>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight mb-2">{currentData.title}</h3>
          <p className="text-[11px] text-white/50 leading-relaxed mb-6 font-medium">{currentData.content}</p>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentStep ? 'w-4 bg-[#00E5FF]' : 'bg-white/10'}`} />
              ))}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button 
                  onClick={handleBack}
                  className="px-4 py-2 bg-white/5 text-white/60 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                >
                  Back
                </button>
              )}
              <button 
                onClick={handleNext}
                className="px-6 py-2 bg-[#00E5FF] text-black text-[10px] font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-[#00E5FF]/20"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductTour;
